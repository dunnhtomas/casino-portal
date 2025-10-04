
// Automated Bing Search for Casino Domains
// Run with: node --experimental-modules automated-playwright-research.js

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queries = [
  {
    "slug": "unlimluck",
    "brand": "UnlimLuck",
    "query": "UnlimLuck casino official website",
    "alternateQuery": "UnlimLuck online casino",
    "domainQuery": "UnlimLuck unlimluck.com"
  },
  {
    "slug": "slotlair",
    "brand": "Slotlair",
    "query": "Slotlair casino official website",
    "alternateQuery": "Slotlair online casino",
    "domainQuery": "Slotlair slotlair.co.uk"
  },
  {
    "slug": "sagaspins",
    "brand": "SagaSpins",
    "query": "SagaSpins casino official website",
    "alternateQuery": "SagaSpins online casino",
    "domainQuery": "SagaSpins sagaspins.com"
  },
  {
    "slug": "samba",
    "brand": "Samba Slots",
    "query": "Samba Slots casino official website",
    "alternateQuery": "Samba Slots online casino",
    "domainQuery": "Samba Slots sambaslots.com"
  },
  {
    "slug": "skyhills",
    "brand": "SkyHills",
    "query": "SkyHills casino official website",
    "alternateQuery": "SkyHills online casino",
    "domainQuery": "SkyHills skyhills.com"
  },
  {
    "slug": "wonthere",
    "brand": "WonThere",
    "query": "WonThere casino official website",
    "alternateQuery": "WonThere online casino",
    "domainQuery": "WonThere wonthere.co.uk"
  },
  {
    "slug": "hunter",
    "brand": "Lucky Hunter",
    "query": "Lucky Hunter casino official website",
    "alternateQuery": "Lucky Hunter online casino",
    "domainQuery": "Lucky Hunter luckyhunter.io"
  },
  {
    "slug": "rizz",
    "brand": "Rizz Casino",
    "query": "Rizz Casino casino official website",
    "alternateQuery": "Rizz Casino online casino",
    "domainQuery": "Rizz Casino rizzcasino.com"
  },
  {
    "slug": "n1bet",
    "brand": "N1 Bet Casino",
    "query": "N1 Bet Casino casino official website",
    "alternateQuery": "N1 Bet Casino online casino",
    "domainQuery": "N1 Bet Casino n1bet.com"
  },
  {
    "slug": "kings",
    "brand": "Kings Chip",
    "query": "Kings Chip casino official website",
    "alternateQuery": "Kings Chip online casino",
    "domainQuery": "Kings Chip kingschip.com"
  }
];

async function researchAllCasinos() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const casino of queries) {
    try {
      console.log(`\n🔍 Researching: ${casino.brand}`);
      
      // Navigate to Bing
      await page.goto('https://www.bing.com');
      await page.waitForLoadState('networkidle');
      
      // Search
      await page.fill('input[name="q"]', casino.query);
      await page.press('input[name="q"]', 'Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Extract top 3 results
      const searchResults = await page.locator('#b_results .b_algo').evaluateAll(nodes => 
        nodes.slice(0, 3).map(node => {
          const link = node.querySelector('h2 a');
          return {
            url: link?.href || '',
            title: link?.textContent?.trim() || '',
            domain: link?.href ? new URL(link.href).hostname.replace('www.', '') : ''
          };
        })
      );
      
      results.push({
        slug: casino.slug,
        brand: casino.brand,
        query: casino.query,
        topResults: searchResults,
        realDomain: searchResults[0]?.domain || null,
        researchedAt: new Date().toISOString()
      });
      
      console.log(`✅ Found: ${searchResults[0]?.domain || 'N/A'}`);
      
    } catch (error) {
      console.error(`❌ Error researching ${casino.brand}:`, error.message);
      results.push({
        slug: casino.slug,
        brand: casino.brand,
        error: error.message
      });
    }
  }
  
  // Save results
  const resultsPath = path.join(__dirname, '../data/automated-bing-research-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n\n✅ Research complete! Results saved to: ${resultsPath}`);
  
  await browser.close();
}

researchAllCasinos().catch(console.error);
