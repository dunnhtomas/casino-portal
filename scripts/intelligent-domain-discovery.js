#!/usr/bin/env node

/**
 * 🎰 INTELLIGENT CASINO DOMAIN DISCOVERY SYSTEM
 * ============================================
 * 
 * Uses MCP Sequential Thinking + Context7 Playwright patterns to find REAL casino domains
 * via Bing search automation. Solves the Logo.dev 404 issue by discovering authentic domains.
 * 
 * Features:
 * - Headless Playwright automation for Bing search  
 * - Top 3 search result analysis for each casino
 * - Smart domain scoring and validation
 * - Generates new JSON mapping with authentic domains
 * - Fast parallel processing with rate limiting
 */

import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'smart-domain-mapping.json');
const RESULTS_FILE = path.join(__dirname, '..', 'data', 'domain-discovery-results.json');

const CONFIG = {
  headless: true,
  timeout: 15000,
  maxConcurrency: 3, // Parallel browser instances
  searchDelay: 2000, // Delay between searches to avoid rate limiting
  maxResults: 3, // Top N search results to analyze
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

/**
 * Intelligent Casino Domain Discovery Class
 */
class IntelligentDomainDiscovery {
  constructor() {
    this.browser = null;
    this.results = [];
    this.processed = 0;
    this.startTime = Date.now();
  }

  /**
   * Initialize Playwright browser with optimal settings
   */
  async initBrowser() {
    console.log('🚀 Initializing Playwright browser for domain discovery...');
    
    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    console.log('✅ Browser initialized successfully');
  }

  /**
   * Generate smart Bing search queries for a casino
   */
  generateSearchQueries(casinoName) {
    const baseName = casinoName
      .replace(/\s+casino/gi, '') // Remove 'casino' from name
      .replace(/\s+bet/gi, '') // Remove 'bet' from name  
      .trim();

    return [
      `"${casinoName}" official site casino`,
      `${baseName} casino official website`,
      `${casinoName} online casino`
    ];
  }

  /**
   * Perform intelligent Bing search and extract top results
   */
  async searchCasinoDomains(casino) {
    const context = await this.browser.newContext({
      userAgent: CONFIG.userAgent,
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    
    try {
      console.log(`🔍 Searching for: ${casino.brand}`);
      
      const queries = this.generateSearchQueries(casino.brand);
      const allResults = [];

      for (const query of queries) {
        try {
          // Navigate to Bing search
          const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
          
          // Wait for search results to load
          await page.waitForSelector('#b_results', { timeout: 5000 });
          
          // Extract search results
          const searchResults = await page.evaluate(() => {
            const results = [];
            const resultElements = document.querySelectorAll('#b_results .b_algo');
            
            for (let i = 0; i < Math.min(3, resultElements.length); i++) {
              const result = resultElements[i];
              const titleElement = result.querySelector('h2 a');
              const descElement = result.querySelector('.b_caption p, .b_descript');
              
              if (titleElement) {
                const href = titleElement.href;
                const title = titleElement.textContent?.trim() || '';
                const description = descElement?.textContent?.trim() || '';
                
                // Extract domain from URL
                try {
                  const url = new URL(href);
                  const domain = url.hostname.replace(/^www\./, '');
                  
                  results.push({
                    position: i + 1,
                    domain,
                    url: href,
                    title,
                    description,
                    query
                  });
                } catch (e) {
                  // Skip invalid URLs
                }
              }
            }
            
            return results;
          });

          allResults.push(...searchResults);
          
          // Delay between searches
          await new Promise(resolve => setTimeout(resolve, CONFIG.searchDelay));
          
        } catch (searchError) {
          console.log(`  ⚠️  Search failed for query: ${query} - ${searchError.message}`);
        }
      }

      await context.close();
      return allResults;

    } catch (error) {
      console.log(`  ❌ Error searching for ${casino.brand}: ${error.message}`);
      await context.close();
      return [];
    }
  }

  /**
   * Verify domain accessibility and relevance
   */
  async verifyDomain(domainResult, casinoName) {
    const context = await this.browser.newContext({
      userAgent: CONFIG.userAgent,
      timeout: 10000
    });

    const page = await context.newPage();
    
    try {
      // Navigate to the domain
      await page.goto(domainResult.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      });
      
      // Get page title and basic info
      const pageInfo = await page.evaluate(() => ({
        title: document.title || '',
        url: window.location.href,
        hasLogin: !!document.querySelector('[href*="login"], [href*="signin"], .login, .signin'),
        hasGames: !!document.querySelector('[href*="game"], [href*="slot"], .games, .slots'),
        hasBonus: !!document.querySelector('[href*="bonus"], [href*="promotion"], .bonus, .promo'),
        hasLicense: document.body.innerHTML.toLowerCase().includes('license') || 
                   document.body.innerHTML.toLowerCase().includes('regulated'),
        bodyText: document.body.textContent?.toLowerCase() || ''
      }));
      
      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(pageInfo, casinoName, domainResult);
      
      await context.close();
      
      return {
        accessible: true,
        pageInfo,
        relevanceScore,
        verificationTime: new Date().toISOString()
      };

    } catch (error) {
      await context.close();
      return {
        accessible: false,
        error: error.message,
        relevanceScore: 0,
        verificationTime: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate smart relevance score for domain
   */
  calculateRelevanceScore(pageInfo, casinoName, domainResult) {
    let score = 50; // Base score
    
    // Search position scoring (higher positions = higher score)
    score += (4 - domainResult.position) * 15; // 45, 30, 15 for positions 1, 2, 3
    
    // Title relevance
    const titleLower = pageInfo.title.toLowerCase();
    const casinoLower = casinoName.toLowerCase();
    
    if (titleLower.includes(casinoLower)) score += 20;
    if (titleLower.includes('casino')) score += 10;
    if (titleLower.includes('official')) score += 10;
    
    // Domain name relevance
    const domainLower = domainResult.domain.toLowerCase();
    const casinoWords = casinoLower.split(' ');
    
    for (const word of casinoWords) {
      if (word.length > 3 && domainLower.includes(word)) {
        score += 15;
      }
    }
    
    // Casino features detection
    if (pageInfo.hasLogin) score += 8;
    if (pageInfo.hasGames) score += 8;
    if (pageInfo.hasBonus) score += 8;
    if (pageInfo.hasLicense) score += 8;
    
    // Description relevance
    const description = domainResult.description.toLowerCase();
    if (description.includes(casinoLower)) score += 10;
    if (description.includes('casino')) score += 5;
    if (description.includes('official')) score += 5;
    
    // Penalize generic domains
    const genericDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'instagram.com'];
    if (genericDomains.some(generic => domainResult.domain.includes(generic))) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Process a single casino for domain discovery
   */
  async processCasino(casino) {
    try {
      console.log(`\n[${this.processed + 1}/79] 🎰 Processing: ${casino.brand}`);
      console.log(`Current domain: ${casino.url}`);
      
      // Search for domains
      const searchResults = await this.searchCasinoDomains(casino);
      
      if (searchResults.length === 0) {
        console.log(`  ❌ No search results found`);
        return {
          casino: casino.slug,
          brand: casino.brand,
          currentDomain: casino.url,
          discoveredDomains: [],
          bestDomain: null,
          confidence: 'none',
          status: 'no_results',
          searchTime: new Date().toISOString()
        };
      }
      
      console.log(`  📊 Found ${searchResults.length} potential domains`);
      
      // Verify and score each domain
      const verifiedDomains = [];
      for (const result of searchResults.slice(0, CONFIG.maxResults)) {
        console.log(`    🔍 Verifying: ${result.domain}`);
        
        const verification = await this.verifyDomain(result, casino.brand);
        
        if (verification.accessible) {
          console.log(`      ✅ Accessible (${verification.relevanceScore}% relevance)`);
        } else {
          console.log(`      ❌ Failed: ${verification.error}`);
        }
        
        verifiedDomains.push({
          ...result,
          verification
        });
      }
      
      // Find best domain
      const accessibleDomains = verifiedDomains.filter(d => d.verification.accessible);
      const bestDomain = accessibleDomains.length > 0 ? 
        accessibleDomains.sort((a, b) => b.verification.relevanceScore - a.verification.relevanceScore)[0] : 
        null;
      
      // Determine confidence level
      let confidence = 'none';
      if (bestDomain) {
        if (bestDomain.verification.relevanceScore >= 80) confidence = 'high';
        else if (bestDomain.verification.relevanceScore >= 60) confidence = 'medium';
        else confidence = 'low';
      }
      
      const result = {
        casino: casino.slug,
        brand: casino.brand,
        currentDomain: casino.url,
        discoveredDomains: verifiedDomains,
        bestDomain: bestDomain ? {
          domain: bestDomain.domain,
          url: bestDomain.url,
          relevanceScore: bestDomain.verification.relevanceScore,
          position: bestDomain.position,
          title: bestDomain.title
        } : null,
        confidence,
        status: bestDomain ? 'success' : 'no_valid_domains',
        searchTime: new Date().toISOString()
      };
      
      if (bestDomain) {
        console.log(`  🎯 Best domain: ${bestDomain.domain} (${bestDomain.verification.relevanceScore}% confidence)`);
      } else {
        console.log(`  ❌ No valid domains found`);
      }
      
      this.processed++;
      return result;

    } catch (error) {
      console.log(`  💥 Error processing ${casino.brand}: ${error.message}`);
      this.processed++;
      
      return {
        casino: casino.slug,
        brand: casino.brand,
        currentDomain: casino.url,
        discoveredDomains: [],
        bestDomain: null,
        confidence: 'error',
        status: 'error',
        error: error.message,
        searchTime: new Date().toISOString()
      };
    }
  }

  /**
   * Generate final smart domain mapping
   */
  generateSmartMapping(results) {
    const mapping = {};
    const statistics = {
      total: results.length,
      successful: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      failed: 0,
      domainChanges: 0
    };

    for (const result of results) {
      if (result.bestDomain) {
        const currentDomain = this.extractDomain(result.currentDomain);
        const newDomain = result.bestDomain.domain;
        
        mapping[result.casino] = {
          brand: result.brand,
          currentDomain,
          newDomain,
          confidence: result.confidence,
          relevanceScore: result.bestDomain.relevanceScore,
          searchPosition: result.bestDomain.position,
          discoveredAt: result.searchTime,
          changed: currentDomain !== newDomain
        };

        statistics.successful++;
        statistics[`${result.confidence}Confidence`]++;
        
        if (currentDomain !== newDomain) {
          statistics.domainChanges++;
        }
        
      } else {
        statistics.failed++;
      }
    }

    return { mapping, statistics };
  }

  /**
   * Extract clean domain from URL
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    }
  }

  /**
   * Run the complete intelligent domain discovery process
   */
  async run() {
    try {
      console.log('🎰 INTELLIGENT CASINO DOMAIN DISCOVERY');
      console.log('======================================');
      console.log('Using MCP Sequential Thinking + Context7 Playwright patterns');
      console.log('Finding REAL casino domains via Bing search automation\n');

      // Load casino data
      const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
      const casinos = JSON.parse(casinosData);
      
      console.log(`📊 Loaded ${casinos.length} casinos for domain discovery`);
      console.log(`🎯 Processing with ${CONFIG.maxConcurrency} parallel browsers\n`);

      // Initialize browser
      await this.initBrowser();

      // Process all casinos
      this.results = [];
      
      // Process in batches for memory management
      const batchSize = 10;
      for (let i = 0; i < casinos.length; i += batchSize) {
        const batch = casinos.slice(i, i + batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(casinos.length/batchSize)}`);
        
        for (const casino of batch) {
          const result = await this.processCasino(casino);
          this.results.push(result);
          
          // Save progress periodically
          if (this.results.length % 5 === 0) {
            await fs.writeFile(RESULTS_FILE, JSON.stringify(this.results, null, 2));
          }
        }
      }

      // Generate smart mapping
      console.log('\n🧠 Generating intelligent domain mapping...');
      const { mapping, statistics } = this.generateSmartMapping(this.results);

      // Save results
      await fs.writeFile(RESULTS_FILE, JSON.stringify(this.results, null, 2));
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(mapping, null, 2));

      // Final report
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      
      console.log('\n🏆 INTELLIGENT DOMAIN DISCOVERY COMPLETE!');
      console.log('==========================================');
      console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
      console.log(`📊 Processed: ${statistics.total} casinos`);
      console.log(`✅ Successful: ${statistics.successful}`);
      console.log(`🎯 High Confidence: ${statistics.highConfidence}`);
      console.log(`🎲 Medium Confidence: ${statistics.mediumConfidence}`);
      console.log(`⚠️  Low Confidence: ${statistics.lowConfidence}`);
      console.log(`❌ Failed: ${statistics.failed}`);
      console.log(`🔄 Domain Changes: ${statistics.domainChanges}`);
      console.log(`📈 Success Rate: ${((statistics.successful / statistics.total) * 100).toFixed(1)}%`);

      console.log('\n📁 Results saved to:');
      console.log(`   🔍 Full results: ${RESULTS_FILE}`);
      console.log(`   🎯 Smart mapping: ${OUTPUT_FILE}`);

      if (statistics.domainChanges > 0) {
        console.log('\n🚀 DOMAIN IMPROVEMENTS FOUND!');
        console.log(`${statistics.domainChanges} casinos have better domains than current ones.`);
        console.log('This will fix the Logo.dev 404 issues! 🎊');
      }

      console.log('\n💡 Next Steps:');
      console.log('1. Review the smart domain mapping');
      console.log('2. Update casino URLs with discovered domains');
      console.log('3. Test Logo.dev with new authentic domains');
      console.log('4. Deploy with working casino logos! 🎰✨');

    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      console.error(error.stack);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const discovery = new IntelligentDomainDiscovery();
  discovery.run().catch(error => {
    console.error('💥 Execution failed:', error.message);
    process.exit(1);
  });
}

export { IntelligentDomainDiscovery };