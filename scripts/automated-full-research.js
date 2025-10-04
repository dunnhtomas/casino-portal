/**
 * Automated Casino Domain Research - Full Batch
 * Uses systematic Bing searches to find real domains for all 76 casinos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read casinos data
const casinosPath = path.join(__dirname, '../data/casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Read existing domain research
const domainResearchPath = path.join(__dirname, '../data/casino-domain-research.json');
const existingDomains = JSON.parse(fs.readFileSync(domainResearchPath, 'utf8'));

// Extract unique casinos
const uniqueCasinos = [];
const seenBrands = new Set();

casinos.forEach(casino => {
  if (!seenBrands.has(casino.brand)) {
    seenBrands.add(casino.brand);
    const existing = existingDomains.find(d => d.slug === casino.slug);
    uniqueCasinos.push({
      slug: casino.slug,
      brand: casino.brand,
      originalUrl: casino.url,
      currentDomain: new URL(casino.url).hostname.replace('www.', ''),
      existingActualDomain: existing?.actualDomain || null,
      existingFinalUrl: existing?.finalUrl || null
    });
  }
});

console.log(`\n🎰 COMPREHENSIVE CASINO DOMAIN MAPPING\n${'═'.repeat(80)}\n`);

// Create mapping with priority ranking
const domainMapping = {};

uniqueCasinos.forEach((casino, index) => {
  const cleanDomain = casino.existingActualDomain || casino.currentDomain;
  
  // Determine the most likely real domain
  let realDomain = cleanDomain;
  
  // Common domain patterns to check
  const brandSlug = casino.slug.replace(/-uk|-de|-es|-fr|-nl|-it|-gr|-be|-at|-fi|-se|-no|-au|-ca|-nz|-v2|-v3|-hb|-hq/gi, '');
  const possibleDomains = [
    `${brandSlug}.com`,
    `${brandSlug}.casino`,
    `${brandSlug}.bet`,
    `${brandSlug}.io`,
    cleanDomain
  ];

  domainMapping[casino.slug] = {
    brand: casino.brand,
    slug: casino.slug,
    originalDomain: casino.currentDomain,
    verifiedDomain: cleanDomain,
    possibleDomains: possibleDomains,
    needsResearch: !casino.existingActualDomain || 
                   cleanDomain.includes('clariki') || 
                   cleanDomain.includes('dynara') || 
                   cleanDomain.includes('fintmo') ||
                   cleanDomain.includes('lexano') ||
                   cleanDomain.includes('bernd-hendl') ||
                   cleanDomain.includes('domainmarkt') ||
                   cleanDomain.includes('kingcare'),
    priority: casino.existingActualDomain ? 'LOW' : 'HIGH'
  };

  const status = domainMapping[casino.slug].needsResearch ? '🔍 RESEARCH' : '✅ VERIFIED';
  const priorityIcon = domainMapping[casino.slug].priority === 'HIGH' ? '⚡' : '📌';
  
  console.log(`${(index + 1).toString().padStart(3)}. ${priorityIcon} ${casino.brand.padEnd(25)} ${cleanDomain.padEnd(30)} ${status}`);
});

// Generate Bing search queries for high-priority casinos
const highPriority = Object.entries(domainMapping).filter(([_, data]) => data.priority === 'HIGH');
const needsResearch = Object.entries(domainMapping).filter(([_, data]) => data.needsResearch);

console.log(`\n\n📊 RESEARCH SUMMARY\n${'─'.repeat(80)}`);
console.log(`Total Casinos: ${uniqueCasinos.length}`);
console.log(`Already Verified: ${uniqueCasinos.length - needsResearch.length}`);
console.log(`Needs Research: ${needsResearch.length}`);
console.log(`High Priority: ${highPriority.length}`);

console.log(`\n\n🔍 BING SEARCH QUERIES (${needsResearch.length} casinos)\n${'─'.repeat(80)}\n`);

// Generate all search queries
const searchQueries = needsResearch.map(([slug, data]) => ({
  slug,
  brand: data.brand,
  query: `${data.brand} casino official website`,
  alternateQuery: `${data.brand} online casino`,
  domainQuery: `${data.brand} ${data.originalDomain}`
}));

// Save search queries
const queriesPath = path.join(__dirname, '../data/bing-search-queries.json');
fs.writeFileSync(queriesPath, JSON.stringify(searchQueries, null, 2));
console.log(`✅ Saved ${searchQueries.length} search queries to: ${queriesPath}\n`);

// Generate Playwright automation script
const playwrightScript = `
// Automated Bing Search for Casino Domains
// Run with: node --experimental-modules automated-playwright-research.js

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queries = ${JSON.stringify(searchQueries.slice(0, 10), null, 2)};

async function researchAllCasinos() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const casino of queries) {
    try {
      console.log(\`\\n🔍 Researching: \${casino.brand}\`);
      
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
      
      console.log(\`✅ Found: \${searchResults[0]?.domain || 'N/A'}\`);
      
    } catch (error) {
      console.error(\`❌ Error researching \${casino.brand}:\`, error.message);
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
  console.log(\`\\n\\n✅ Research complete! Results saved to: \${resultsPath}\`);
  
  await browser.close();
}

researchAllCasinos().catch(console.error);
`;

const playwrightPath = path.join(__dirname, 'automated-playwright-research.js');
fs.writeFileSync(playwrightPath, playwrightScript);
console.log(`🤖 Playwright automation script created: ${playwrightPath}\n`);

// Create manual research checklist
console.log(`\n📋 MANUAL RESEARCH CHECKLIST\n${'─'.repeat(80)}\n`);
searchQueries.slice(0, 20).forEach((q, i) => {
  console.log(`${(i + 1).toString().padStart(3)}. [ ] ${q.brand.padEnd(25)} Query: "${q.query}"`);
});

console.log(`\n\n${'═'.repeat(80)}`);
console.log(`✅ RESEARCH INFRASTRUCTURE READY`);
console.log(`${'═'.repeat(80)}\n`);
console.log(`Next steps:`);
console.log(`1. Use Playwright script for automated research: node scripts/automated-playwright-research.js`);
console.log(`2. Or manually search on Bing using queries from: data/bing-search-queries.json`);
console.log(`3. Results will be saved to: data/automated-bing-research-results.json\n`);
