import fs from 'fs';

// Load casino data
const data = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));

console.log(`🎰 Casino Logo Analysis Report`);
console.log(`📊 Total casinos: ${data.length}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const logoAnalysis = {
  'google-favicon-fallback': [],
  'direct': [],
  'local-fallback': [],
  'geo-aware-smart': [],
  'clearbit-api': [],
  'unknown': []
};

data.forEach(casino => {
  const source = casino.logo?.source || 'unknown';
  logoAnalysis[source].push({
    slug: casino.slug,
    brand: casino.brand,
    url: casino.logo?.url
  });
});

// Analyze each category
Object.keys(logoAnalysis).forEach(source => {
  const items = logoAnalysis[source];
  if (items.length > 0) {
    console.log(`\n🏷️  ${source.toUpperCase()} (${items.length} casinos)`);
    console.log(`────────────────────────────────────────────────`);
    items.forEach(item => {
      console.log(`   ${item.brand}: ${item.url}`);
    });
  }
});

// Identify problematic patterns
console.log(`\n🔍 ANALYSIS SUMMARY`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const googleFaviconCount = logoAnalysis['google-favicon-fallback'].length;
const localFallbackCount = logoAnalysis['local-fallback'].length;
const directCount = logoAnalysis['direct'].length;

console.log(`📈 Google Favicon (potentially unreliable): ${googleFaviconCount}`);
console.log(`🏠 Local Fallback (safe but generic): ${localFallbackCount}`);
console.log(`🎯 Direct URLs (good quality): ${directCount}`);

// Find potential 404s - Google favicon URLs that might fail
console.log(`\n⚠️  POTENTIAL ISSUES`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const googleFaviconUrls = logoAnalysis['google-favicon-fallback'];
if (googleFaviconUrls.length > 0) {
  console.log(`🚨 ${googleFaviconUrls.length} casinos using Google favicon service (may return 404s):`);
  googleFaviconUrls.forEach(item => {
    console.log(`   • ${item.brand} (${item.slug})`);
  });
}

console.log(`\n📋 RECOMMENDATIONS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`1. Test all ${googleFaviconCount} Google favicon URLs for 404 errors`);
console.log(`2. Find direct logo URLs for casinos with local fallbacks`);
console.log(`3. Consider using a logo API service for missing/broken logos`);
console.log(`4. Implement robust fallback system for external URL failures`);