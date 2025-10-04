#!/usr/bin/env node

/**
 * 🎯 SMART DOMAIN VERIFICATION & MAPPING SYSTEM
 * =============================================
 * 
 * Robust approach that focuses on domain verification and smart pattern recognition
 * to create accurate domain mappings for casino logos. Bypasses complex search automation
 * in favor of reliable domain testing and intelligent pattern matching.
 */

import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'smart-domain-mapping.json');

/**
 * Smart Domain Verification System
 */
class SmartDomainVerifier {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  /**
   * Generate potential domain variations for a casino
   */
  generateDomainVariations(casino) {
    const brandName = casino.brand.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    const variations = new Set();
    
    // Current domain (extract clean domain)
    try {
      const currentUrl = new URL(casino.url);
      variations.add(currentUrl.hostname.replace(/^www\./, ''));
    } catch (e) {
      // Invalid URL, skip
    }
    
    // Common patterns for online casinos
    const commonTlds = ['com', 'net', 'co.uk', 'io', 'bet', 'casino'];
    const patterns = [
      brandName,
      brandName + 'casino',
      brandName + 'bet',
      'casino' + brandName,
      brandName.replace('casino', ''),
      brandName.replace('bet', '')
    ];
    
    patterns.forEach(pattern => {
      if (pattern && pattern.length > 2) {
        commonTlds.forEach(tld => {
          variations.add(`${pattern}.${tld}`);
        });
      }
    });
    
    // Add some manual mappings for common casino brands
    const manualMappings = {
      'spellwin': ['spellwin.com'],
      'winitbet': ['winit.bet'],
      'unlimluck': ['unlimluck.com'],
      'mrpacho': ['mrpacho.com'],
      'larabet': ['larabet.com'],
      'slotlair': ['slotlair.co.uk'],
      'sagaspins': ['sagaspins.com'],
      'sambaslots': ['sambaslots.com']
    };
    
    const key = brandName.replace(/[^a-z]/g, '');
    if (manualMappings[key]) {
      manualMappings[key].forEach(domain => variations.add(domain));
    }
    
    return Array.from(variations).slice(0, 10); // Limit to top 10 variations
  }

  /**
   * Verify if a domain is accessible and appears to be a real casino
   */
  async verifyDomain(domain, casino) {
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timeout: 8000
    });

    const page = await context.newPage();
    
    try {
      const testUrl = `https://${domain}`;
      
      await page.goto(testUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 8000 
      });
      
      // Get page information
      const pageInfo = await page.evaluate((casinoBrand) => {
        const title = document.title?.toLowerCase() || '';
        const bodyText = document.body?.textContent?.toLowerCase() || '';
        
        return {
          title: document.title || '',
          url: window.location.href,
          hasLogin: !!document.querySelector('[href*="login"], [href*="signin"], .login, .signin, [class*="login"], [class*="signin"]'),
          hasRegister: !!document.querySelector('[href*="register"], [href*="signup"], .register, .signup, [class*="register"], [class*="signup"]'),
          hasGames: !!document.querySelector('[href*="game"], [href*="slot"], .games, .slots, [class*="game"], [class*="slot"]'),
          hasBonus: !!document.querySelector('[href*="bonus"], [href*="promotion"], .bonus, .promo, [class*="bonus"], [class*="promo"]'),
          hasCasino: title.includes('casino') || bodyText.includes('casino'),
          hasGambling: bodyText.includes('gambling') || bodyText.includes('betting'),
          brandMatch: title.includes(casinoBrand.toLowerCase()) || bodyText.includes(casinoBrand.toLowerCase()),
          responseCode: 200,
          finalUrl: window.location.href
        };
      }, casino.brand);
      
      // Calculate relevance score
      const score = this.calculateDomainScore(pageInfo, domain, casino);
      
      await context.close();
      
      return {
        domain,
        accessible: true,
        score,
        pageInfo,
        testUrl,
        verifiedAt: new Date().toISOString()
      };

    } catch (error) {
      await context.close();
      
      return {
        domain,
        accessible: false,
        score: 0,
        error: error.message,
        testUrl: `https://${domain}`,
        verifiedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate domain relevance score
   */
  calculateDomainScore(pageInfo, domain, casino) {
    let score = 20; // Base score for accessibility
    
    // Brand name matching
    if (pageInfo.brandMatch) score += 30;
    
    // Casino-specific features
    if (pageInfo.hasCasino) score += 15;
    if (pageInfo.hasLogin) score += 10;
    if (pageInfo.hasRegister) score += 10;
    if (pageInfo.hasGames) score += 10;
    if (pageInfo.hasBonus) score += 8;
    if (pageInfo.hasGambling) score += 7;
    
    // Domain name relevance
    const domainLower = domain.toLowerCase();
    const brandWords = casino.brand.toLowerCase().split(/\s+/);
    
    brandWords.forEach(word => {
      if (word.length > 3 && domainLower.includes(word)) {
        score += 15;
      }
    });
    
    // Penalty for redirects to different domains
    try {
      const finalDomain = new URL(pageInfo.finalUrl).hostname.replace(/^www\./, '');
      if (finalDomain !== domain) {
        score -= 20;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Process a single casino
   */
  async processCasino(casino, index) {
    console.log(`\n[${index + 1}/79] 🎰 ${casino.brand}`);
    console.log(`   Current: ${casino.url}`);
    
    // Generate domain variations
    const domains = this.generateDomainVariations(casino);
    console.log(`   🎯 Testing ${domains.length} domain variations...`);
    
    const verificationResults = [];
    
    // Test each domain variation
    for (const domain of domains) {
      const result = await this.verifyDomain(domain, casino);
      verificationResults.push(result);
      
      if (result.accessible) {
        console.log(`      ✅ ${domain} (${result.score}% score)`);
      } else {
        console.log(`      ❌ ${domain}`);
      }
    }
    
    // Find the best domain
    const accessibleDomains = verificationResults.filter(r => r.accessible);
    const bestDomain = accessibleDomains.length > 0 ? 
      accessibleDomains.sort((a, b) => b.score - a.score)[0] : 
      null;
    
    // Extract current domain for comparison
    let currentDomain;
    try {
      currentDomain = new URL(casino.url).hostname.replace(/^www\./, '');
    } catch (e) {
      currentDomain = casino.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    }
    
    const result = {
      casino: casino.slug,
      brand: casino.brand,
      currentDomain,
      testedDomains: verificationResults,
      bestDomain: bestDomain ? {
        domain: bestDomain.domain,
        score: bestDomain.score,
        features: bestDomain.pageInfo
      } : null,
      recommendation: this.generateRecommendation(bestDomain, currentDomain),
      processedAt: new Date().toISOString()
    };
    
    if (bestDomain) {
      console.log(`   🏆 Best: ${bestDomain.domain} (${bestDomain.score}% score)`);
      
      if (bestDomain.domain !== currentDomain) {
        console.log(`   🔄 CHANGE RECOMMENDED: ${currentDomain} → ${bestDomain.domain}`);
      } else {
        console.log(`   ✅ Current domain is optimal`);
      }
    } else {
      console.log(`   ❌ No accessible domains found`);
    }
    
    return result;
  }

  /**
   * Generate domain recommendation
   */
  generateRecommendation(bestDomain, currentDomain) {
    if (!bestDomain) {
      return {
        action: 'keep_current',
        reason: 'No accessible alternatives found',
        confidence: 'low'
      };
    }
    
    if (bestDomain.domain === currentDomain) {
      return {
        action: 'keep_current',
        reason: 'Current domain is the best option',
        confidence: 'high'
      };
    }
    
    if (bestDomain.score >= 80) {
      return {
        action: 'change_domain',
        reason: `High-quality alternative found (${bestDomain.score}% score)`,
        confidence: 'high',
        newDomain: bestDomain.domain
      };
    } else if (bestDomain.score >= 60) {
      return {
        action: 'consider_change',
        reason: `Decent alternative found (${bestDomain.score}% score)`,
        confidence: 'medium',
        newDomain: bestDomain.domain
      };
    } else {
      return {
        action: 'keep_current',
        reason: `Alternative found but low quality (${bestDomain.score}% score)`,
        confidence: 'low'
      };
    }
  }

  /**
   * Generate smart domain mapping
   */
  generateSmartMapping(results) {
    const mapping = {};
    const stats = {
      total: results.length,
      changesRecommended: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      noAlternatives: 0
    };

    results.forEach(result => {
      const entry = {
        brand: result.brand,
        currentDomain: result.currentDomain,
        recommendation: result.recommendation,
        processedAt: result.processedAt
      };

      if (result.bestDomain) {
        entry.bestDomain = result.bestDomain.domain;
        entry.bestScore = result.bestDomain.score;
      }

      mapping[result.casino] = entry;

      // Update statistics
      if (result.recommendation.action === 'change_domain') {
        stats.changesRecommended++;
      }

      if (result.recommendation.confidence === 'high') stats.highConfidence++;
      else if (result.recommendation.confidence === 'medium') stats.mediumConfidence++;
      else if (result.recommendation.confidence === 'low') stats.lowConfidence++;

      if (!result.bestDomain) stats.noAlternatives++;
    });

    return { mapping, stats };
  }

  /**
   * Run the smart domain verification process
   */
  async run() {
    console.log('🎯 SMART DOMAIN VERIFICATION & MAPPING');
    console.log('======================================');
    console.log('Robust domain discovery using verification and pattern recognition\n');

    try {
      // Load casino data
      const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
      const casinos = JSON.parse(casinosData);
      
      console.log(`📊 Processing ${casinos.length} casinos`);

      // Initialize browser
      console.log('🚀 Launching verification browser...');
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });

      // Process all casinos
      this.results = [];
      
      for (let i = 0; i < casinos.length; i++) {
        const result = await this.processCasino(casinos[i], i);
        this.results.push(result);
        
        // Brief pause between casinos
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate smart mapping
      console.log('\n🧠 Generating smart domain mapping...');
      const { mapping, stats } = this.generateSmartMapping(this.results);

      // Save results
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(mapping, null, 2));

      // Final report
      console.log('\n🏆 SMART DOMAIN VERIFICATION COMPLETE!');
      console.log('=====================================');
      console.log(`📊 Processed: ${stats.total} casinos`);
      console.log(`🔄 Changes Recommended: ${stats.changesRecommended}`);
      console.log(`🎯 High Confidence: ${stats.highConfidence}`);
      console.log(`🎲 Medium Confidence: ${stats.mediumConfidence}`);
      console.log(`⚠️  Low Confidence: ${stats.lowConfidence}`);
      console.log(`❌ No Alternatives: ${stats.noAlternatives}`);

      console.log(`\n📁 Smart mapping saved to: ${OUTPUT_FILE}`);

      if (stats.changesRecommended > 0) {
        console.log('\n🎊 DOMAIN IMPROVEMENTS FOUND!');
        console.log(`${stats.changesRecommended} casinos have better domains available.`);
        console.log('This will help fix Logo.dev 404 issues! 🚀');
      }

      console.log('\n💡 Next Steps:');
      console.log('1. Review the smart domain mapping');
      console.log('2. Apply recommended domain changes');
      console.log('3. Test Logo.dev with improved domains');
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
  const verifier = new SmartDomainVerifier();
  verifier.run().catch(error => {
    console.error('💥 Execution failed:', error.message);
    process.exit(1);
  });
}

export { SmartDomainVerifier };