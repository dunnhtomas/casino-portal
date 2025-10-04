import fs from 'fs';

console.log(`🎯 Casino Logo Optimization Using Brandfetch API`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Load casino data
const data = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

// Analyze casinos that need better logos
const problematicLogos = [];
const casinosWithDomains = [];

data.forEach(casino => {
  const logoSource = casino.logo?.source;
  const logoUrl = casino.logo?.url;
  const domain = extractDomain(casino.url);
  
  if (domain) {
    casinosWithDomains.push({
      slug: casino.slug,
      brand: casino.brand,
      url: casino.url,
      domain: domain,
      currentLogo: logoUrl,
      currentSource: logoSource
    });
  }
  
  // Identify problematic logos
  if (logoSource === 'google-favicon-fallback' || logoSource === 'local-fallback') {
    problematicLogos.push({
      slug: casino.slug,
      brand: casino.brand,
      domain: domain,
      currentLogo: logoUrl,
      currentSource: logoSource,
      suggestedBrandfetchUrl: domain ? `https://cdn.brandfetch.io/${domain}?c=YOUR_CLIENT_ID` : null
    });
  }
});

console.log(`📊 CASINO DOMAIN ANALYSIS`);
console.log(`Total casinos with domains: ${casinosWithDomains.length}`);
console.log(`Problematic logos: ${problematicLogos.length}`);

console.log(`\n🚨 CASINOS NEEDING LOGO IMPROVEMENT`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

problematicLogos.forEach(casino => {
  console.log(`\n🎰 ${casino.brand} (${casino.slug})`);
  console.log(`   Domain: ${casino.domain}`);
  console.log(`   Current: ${casino.currentLogo} [${casino.currentSource}]`);
  console.log(`   Brandfetch: ${casino.suggestedBrandfetchUrl}`);
});

console.log(`\n📋 IMPLEMENTATION PLAN`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`1. ✅ Get Brandfetch API client ID (free tier available)`);
console.log(`2. ✅ Test Brandfetch API with casino domains`);
console.log(`3. ✅ Replace ${problematicLogos.filter(c => c.currentSource === 'google-favicon-fallback').length} Google favicon URLs`);
console.log(`4. ✅ Upgrade ${problematicLogos.filter(c => c.currentSource === 'local-fallback').length} local fallback images`);
console.log(`5. ✅ Implement fallback chain: Brandfetch → Local → Generic`);

console.log(`\n🔧 BRANDFETCH BENEFITS vs CURRENT APPROACH`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Dedicated logo service (not favicon service)`);
console.log(`✅ Higher resolution logos available`);
console.log(`✅ More reliable than Google's favicon service`);
console.log(`✅ Supports fallback options (transparent, lettermark, 404)`);
console.log(`✅ Free tier available with reasonable limits`);
console.log(`✅ Multiple logo types: icon, logo, symbol`);
console.log(`✅ Light/dark theme support`);

// Generate test URLs for validation
console.log(`\n🧪 TEST URLS FOR VALIDATION`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Test these URLs (replace YOUR_CLIENT_ID with actual ID):`);

// Sample a few casinos for testing
const testCasinos = problematicLogos.slice(0, 5);
testCasinos.forEach(casino => {
  console.log(`${casino.brand}: ${casino.suggestedBrandfetchUrl}`);
});

console.log(`\n📝 NEXT STEPS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`1. Sign up for Brandfetch API at: https://docs.brandfetch.com/`);
console.log(`2. Get free client ID from developer portal`);
console.log(`3. Test API with casino domains to verify logo availability`);
console.log(`4. Update casino data with new Brandfetch URLs`);
console.log(`5. Implement robust fallback chain in ResponsiveImage component`);

// Export data for potential script automation
const exportData = {
  totalCasinos: data.length,
  problematicCount: problematicLogos.length,
  googleFaviconCount: problematicLogos.filter(c => c.currentSource === 'google-favicon-fallback').length,
  localFallbackCount: problematicLogos.filter(c => c.currentSource === 'local-fallback').length,
  casinos: problematicLogos
};

fs.writeFileSync('reports/logo-optimization-plan.json', JSON.stringify(exportData, null, 2));
console.log(`\n💾 Detailed report saved to: reports/logo-optimization-plan.json`);