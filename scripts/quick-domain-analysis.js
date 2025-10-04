/**
 * Quick Casino Domain Research
 * Manual execution to research first 10 casino domains
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🎰 QUICK CASINO DOMAIN RESEARCH`);
console.log(`═══════════════════════════════════════════════════════\n`);

// Load casino data
const casinosPath = path.join(__dirname, '../data/casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Get unique casinos (first 10)
const uniqueCasinos = [];
const seenBrands = new Set();

for (const casino of casinos) {
  if (!seenBrands.has(casino.brand) && uniqueCasinos.length < 10) {
    seenBrands.add(casino.brand);
    uniqueCasinos.push({
      slug: casino.slug,
      brand: casino.brand,
      originalUrl: casino.url,
      currentDomain: new URL(casino.url).hostname.replace('www.', '')
    });
  }
}

// Simulate research results (what we would get from Bing)
const researchResults = uniqueCasinos.map(casino => {
  // Extract clean brand name for domain matching
  const brandClean = casino.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const currentClean = casino.currentDomain.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check if current domain seems correct
  const isCurrentCorrect = currentClean.includes(brandClean) || brandClean.includes(currentClean.split('.')[0]);
  
  return {
    brand: casino.brand,
    slug: casino.slug,
    currentDomain: casino.currentDomain,
    currentUrl: casino.originalUrl,
    
    // Analysis
    analysis: {
      domainLooksCorrect: isCurrentCorrect,
      confidence: isCurrentCorrect ? 0.95 : 0.3,
      needsResearch: !isCurrentCorrect
    },
    
    // Recommendations
    recommendation: isCurrentCorrect ? 'Keep current domain' : 'Needs Bing research',
    
    // Mock Bing results (what we'd expect to find)
    expectedOfficialDomains: [
      casino.currentDomain,
      `${brandClean}.com`,
      `${brandClean}.casino`,
      `${brandClean}casino.com`
    ].filter((domain, index, arr) => arr.indexOf(domain) === index)
  };
});

// Display results
console.log(`📊 DOMAIN ANALYSIS RESULTS:\n`);
console.log(`${'Brand'.padEnd(20)} ${'Current Domain'.padEnd(25)} ${'Status'.padEnd(15)} ${'Confidence'}`);
console.log(`${'─'.repeat(20)} ${'─'.repeat(25)} ${'─'.repeat(15)} ${'─'.repeat(10)}`);

researchResults.forEach(result => {
  const status = result.analysis.domainLooksCorrect ? '✅ Looks Good' : '❓ Needs Check';
  const confidence = `${(result.analysis.confidence * 100).toFixed(0)}%`;
  
  console.log(`${result.brand.padEnd(20)} ${result.currentDomain.padEnd(25)} ${status.padEnd(15)} ${confidence}`);
});

// Summary
const needsResearch = researchResults.filter(r => r.analysis.needsResearch);
const looksGood = researchResults.filter(r => r.analysis.domainLooksCorrect);

console.log(`\n📋 SUMMARY:`);
console.log(`Total casinos analyzed: ${researchResults.length}`);
console.log(`Domains that look correct: ${looksGood.length} (${((looksGood.length / researchResults.length) * 100).toFixed(0)}%)`);
console.log(`Domains needing research: ${needsResearch.length} (${((needsResearch.length / researchResults.length) * 100).toFixed(0)}%)`);

if (needsResearch.length > 0) {
  console.log(`\n🔍 CASINOS NEEDING RESEARCH:`);
  needsResearch.forEach(casino => {
    console.log(`  • ${casino.brand}: ${casino.currentDomain}`);
    console.log(`    Expected domains: ${casino.expectedOfficialDomains.join(', ')}`);
  });
}

// Save results
const outputPath = path.join(__dirname, '../data/quick-domain-analysis.json');
const output = {
  analyzedAt: new Date().toISOString(),
  totalCasinos: researchResults.length,
  summary: {
    looksCorrect: looksGood.length,
    needsResearch: needsResearch.length,
    averageConfidence: (researchResults.reduce((sum, r) => sum + r.analysis.confidence, 0) / researchResults.length).toFixed(3)
  },
  results: researchResults
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n💾 Results saved to: ${outputPath}`);

console.log(`\n🎯 NEXT STEPS:`);
console.log(`1. For casinos marked as "Needs Check", research their official domains`);
console.log(`2. Use the full Playwright automation scripts for comprehensive research`);
console.log(`3. Update the casino data files with verified domains`);

console.log(`\n✅ Quick analysis complete!`);