/**
 * Comprehensive Casino Domain Research Script
 * Uses Bing search to find real, official casino domains
 * Generates updated domain mappings for all casinos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the main casinos data
const casinosPath = path.join(__dirname, '../data/casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Read existing domain research if available
const domainResearchPath = path.join(__dirname, '../data/casino-domain-research.json');
let existingDomains = [];
try {
  existingDomains = JSON.parse(fs.readFileSync(domainResearchPath, 'utf8'));
} catch (e) {
  console.log('No existing domain research found, starting fresh');
}

// Extract unique casinos with their brands and URLs
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

console.log(`\n🎰 CASINO DOMAIN RESEARCH REPORT`);
console.log(`═══════════════════════════════════════════════════════\n`);
console.log(`Total unique casinos to research: ${uniqueCasinos.length}\n`);

// Group casinos for efficient batch processing
const CASINOS_TO_RESEARCH = uniqueCasinos.slice(0, 20); // First 20 for this batch

console.log(`\n📋 CASINOS FOR BING SEARCH (Batch 1 of ${Math.ceil(uniqueCasinos.length / 20)}):\n`);
console.log(`${'#'.padEnd(4)} ${'Brand'.padEnd(25)} ${'Current Domain'.padEnd(30)} ${'Status'}`);
console.log(`${'─'.repeat(4)} ${'─'.repeat(25)} ${'─'.repeat(30)} ${'─'.repeat(10)}`);

CASINOS_TO_RESEARCH.forEach((casino, index) => {
  const existing = existingDomains.find(d => d.slug === casino.slug);
  const status = existing ? '✓ Known' : '🔍 Research';
  console.log(
    `${(index + 1).toString().padEnd(4)} ${casino.brand.padEnd(25)} ${casino.currentDomain.padEnd(30)} ${status}`
  );
});

// Generate Bing search queries
console.log(`\n\n🔎 RECOMMENDED BING SEARCH QUERIES:\n`);
console.log(`Copy these into Bing search one by one:\n`);

CASINOS_TO_RESEARCH.forEach((casino, index) => {
  const queries = [
    `${casino.brand} casino official website`,
    `${casino.brand} online casino`,
    `${casino.brand} casino ${casino.currentDomain}`
  ];
  
  console.log(`${index + 1}. ${casino.brand}:`);
  queries.forEach((q, qi) => {
    console.log(`   Query ${qi + 1}: "${q}"`);
  });
  console.log('');
});

// Create template for manual research results
const researchTemplate = CASINOS_TO_RESEARCH.map(casino => ({
  slug: casino.slug,
  brand: casino.brand,
  originalUrl: casino.originalUrl,
  currentDomain: casino.currentDomain,
  
  // TO BE FILLED BY RESEARCH:
  realDomain: null,            // The actual official domain found via Bing
  officialUrl: null,           // Full official URL
  bingSearchQuery: `${casino.brand} casino official website`,
  bingTopResult: null,         // Top result from Bing
  verificationStatus: 'pending', // pending | verified | failed
  notes: '',
  researchedAt: new Date().toISOString()
}));

// Save template for research results
const templatePath = path.join(__dirname, '../data/casino-domain-research-template.json');
fs.writeFileSync(templatePath, JSON.stringify(researchTemplate, null, 2));

console.log(`\n\n📄 RESEARCH TEMPLATE CREATED:`);
console.log(`Location: ${templatePath}`);
console.log(`\nInstructions:`);
console.log(`1. Search each casino on Bing using the queries above`);
console.log(`2. Copy the official domain from the top result`);
console.log(`3. Update the template file with real domains`);
console.log(`4. Run the verification script to test all domains\n`);

// Generate automated research script for Playwright
const playwrightScript = `
// Automated Bing Search Script
// Run this after the sequential thinking MCP guides the search

const casinos = ${JSON.stringify(CASINOS_TO_RESEARCH.slice(0, 5), null, 2)};

async function researchCasino(page, casino) {
  const query = \`\${casino.brand} casino official website\`;
  
  // Type search query
  await page.fill('input[name="q"]', query);
  await page.press('input[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');
  
  // Extract top result
  const topResult = await page.locator('#b_results .b_algo').first();
  const link = await topResult.locator('h2 a').getAttribute('href');
  const title = await topResult.locator('h2 a').textContent();
  
  console.log(\`\${casino.brand}: \${link}\`);
  
  return {
    ...casino,
    realDomain: new URL(link).hostname.replace('www.', ''),
    officialUrl: link,
    bingTopResult: title
  };
}

// Use with Playwright MCP
for (const casino of casinos) {
  const result = await researchCasino(page, casino);
  console.log(result);
}
`;

const playwrightScriptPath = path.join(__dirname, 'automated-bing-research.js');
fs.writeFileSync(playwrightScriptPath, playwrightScript);

console.log(`\n🤖 AUTOMATED SCRIPT CREATED:`);
console.log(`Location: ${playwrightScriptPath}`);
console.log(`\nThis can be used with Playwright MCP for automated search\n`);

console.log(`\n═══════════════════════════════════════════════════════`);
console.log(`✅ READY FOR BING RESEARCH - Start with the first casino!`);
console.log(`═══════════════════════════════════════════════════════\n`);
