/**
 * Automated Bing Casino Domain Scraper
 * Searches for top 3 Bing results for all casino brands and extracts domain information
 * Uses Playwright to automate browser interactions
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCRAPING_CONFIG = {
  headless: false, // Set to true for production runs
  slowMo: 1000,    // Delay between actions in ms
  timeout: 30000,  // Page timeout
  resultsPerCasino: 3,
  batchSize: 5,    // Process casinos in batches to avoid rate limiting
  delayBetweenSearches: 2000 // Delay between searches
};

// Load casino data
const casinosPath = path.join(__dirname, '../data/casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Extract unique casinos
const uniqueCasinos = [];
const seenBrands = new Set();

casinos.forEach(casino => {
  if (!seenBrands.has(casino.brand)) {
    seenBrands.add(casino.brand);
    uniqueCasinos.push({
      slug: casino.slug,
      brand: casino.brand,
      originalUrl: casino.url,
      currentDomain: new URL(casino.url).hostname.replace('www.', '')
    });
  }
});

console.log(`🎰 AUTOMATED BING DOMAIN SCRAPER`);
console.log(`═══════════════════════════════════════════════════════\n`);
console.log(`Total casinos to research: ${uniqueCasinos.length}`);
console.log(`Batch size: ${SCRAPING_CONFIG.batchSize} casinos`);
console.log(`Results per casino: ${SCRAPING_CONFIG.resultsPerCasino}\n`);

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

/**
 * Sleep function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search for a casino on Bing and extract top results
 */
async function searchCasinoOnBing(page, casino) {
  const query = `${casino.brand} casino official website`;
  
  try {
    console.log(`🔍 Searching: ${casino.brand}`);
    
    // Navigate to Bing
    await page.goto('https://www.bing.com', { waitUntil: 'networkidle' });
    await sleep(1000);
    
    // Clear search box and type query
    const searchBox = page.locator('input[name="q"], input[aria-label*="search"], textarea[aria-label*="search"]').first();
    await searchBox.clear();
    await searchBox.fill(query);
    await searchBox.press('Enter');
    
    // Wait for results to load
    await page.waitForSelector('#b_results', { timeout: SCRAPING_CONFIG.timeout });
    await sleep(2000);
    
    // Extract top 3 results
    const results = [];
    const resultElements = await page.locator('#b_results .b_algo').all();
    
    for (let i = 0; i < Math.min(resultElements.length, SCRAPING_CONFIG.resultsPerCasino); i++) {
      try {
        const element = resultElements[i];
        
        // Extract title
        const titleElement = element.locator('h2 a').first();
        const title = await titleElement.textContent() || '';
        
        // Extract URL
        const href = await titleElement.getAttribute('href') || '';
        
        // Extract description
        const descElement = element.locator('p, .b_caption p').first();
        const description = await descElement.textContent() || '';
        
        // Extract domain from URL
        let domain = '';
        let cleanUrl = '';
        
        if (href.startsWith('https://www.bing.com/ck/a')) {
          // Bing redirect URL - need to extract actual URL
          const urlMatch = href.match(/u=([^&]+)/);
          if (urlMatch) {
            try {
              cleanUrl = decodeURIComponent(urlMatch[1]);
              if (cleanUrl.startsWith('a1')) {
                cleanUrl = atob(cleanUrl.substring(2));
              }
              domain = extractDomain(cleanUrl);
            } catch (e) {
              console.warn(`Could not decode URL for ${casino.brand}: ${href}`);
            }
          }
        } else {
          cleanUrl = href;
          domain = extractDomain(href);
        }
        
        if (domain && title) {
          results.push({
            position: i + 1,
            title: title.trim(),
            url: cleanUrl,
            domain: domain,
            description: description.trim(),
            isOfficialLooking: title.toLowerCase().includes('official') || 
                             title.toLowerCase().includes('casino') ||
                             domain.includes(casino.brand.toLowerCase().replace(/\s+/g, ''))
          });
        }
      } catch (error) {
        console.warn(`Error extracting result ${i + 1} for ${casino.brand}:`, error.message);
      }
    }
    
    console.log(`✓ Found ${results.length} results for ${casino.brand}`);
    return results;
    
  } catch (error) {
    console.error(`❌ Error searching for ${casino.brand}:`, error.message);
    return [];
  }
}

/**
 * Main scraping function
 */
async function runBingDomainScraper() {
  const browser = await chromium.launch({
    headless: SCRAPING_CONFIG.headless,
    slowMo: SCRAPING_CONFIG.slowMo
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(SCRAPING_CONFIG.timeout);
  
  const allResults = {
    scrapedAt: new Date().toISOString(),
    totalCasinos: uniqueCasinos.length,
    config: SCRAPING_CONFIG,
    results: []
  };
  
  try {
    // Process casinos in batches
    for (let batchStart = 0; batchStart < uniqueCasinos.length; batchStart += SCRAPING_CONFIG.batchSize) {
      const batch = uniqueCasinos.slice(batchStart, batchStart + SCRAPING_CONFIG.batchSize);
      const batchNumber = Math.floor(batchStart / SCRAPING_CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(uniqueCasinos.length / SCRAPING_CONFIG.batchSize);
      
      console.log(`\\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} casinos):`);
      console.log(`${'─'.repeat(60)}`);
      
      for (const casino of batch) {
        const searchResults = await searchCasinoOnBing(page, casino);
        
        allResults.results.push({
          slug: casino.slug,
          brand: casino.brand,
          originalUrl: casino.originalUrl,
          currentDomain: casino.currentDomain,
          query: `${casino.brand} casino official website`,
          bingResults: searchResults,
          searchedAt: new Date().toISOString()
        });
        
        // Delay between searches to be respectful to Bing
        if (casino !== batch[batch.length - 1]) {
          await sleep(SCRAPING_CONFIG.delayBetweenSearches);
        }
      }
      
      // Save progress after each batch
      const progressFile = path.join(__dirname, '../data/bing-scraping-progress.json');
      fs.writeFileSync(progressFile, JSON.stringify(allResults, null, 2));
      console.log(`💾 Progress saved (${allResults.results.length}/${uniqueCasinos.length} completed)`);
      
      // Longer delay between batches
      if (batchStart + SCRAPING_CONFIG.batchSize < uniqueCasinos.length) {
        console.log(`⏳ Waiting 5 seconds before next batch...`);
        await sleep(5000);
      }
    }
    
    // Save final results
    const outputFile = path.join(__dirname, '../data/bing-casino-domains-scraped.json');
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
    
    console.log(`\\n✅ SCRAPING COMPLETE!`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`Total casinos processed: ${allResults.results.length}`);
    console.log(`Results saved to: ${outputFile}`);
    console.log(`Average results per casino: ${(allResults.results.reduce((sum, r) => sum + r.bingResults.length, 0) / allResults.results.length).toFixed(1)}`);
    
    // Generate summary statistics
    const summary = {
      totalCasinos: allResults.results.length,
      totalResults: allResults.results.reduce((sum, r) => sum + r.bingResults.length, 0),
      casinosWithResults: allResults.results.filter(r => r.bingResults.length > 0).length,
      casinosWithOfficialLooking: allResults.results.filter(r => 
        r.bingResults.some(result => result.isOfficialLooking)
      ).length
    };
    
    console.log(`\\nSUMMARY STATISTICS:`);
    console.log(`Casinos with results: ${summary.casinosWithResults}/${summary.totalCasinos}`);
    console.log(`Casinos with official-looking results: ${summary.casinosWithOfficialLooking}/${summary.totalCasinos}`);
    console.log(`Total search results collected: ${summary.totalResults}`);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  runBingDomainScraper()
    .then(() => {
      console.log('\\n🎯 Ready for domain verification script!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runBingDomainScraper };