const fs = require('fs');

// Read casino data
const casinos = JSON.parse(fs.readFileSync('./casino-urls-list.json', 'utf8'));

console.log(`🎯 Generating logo URLs for ${casinos.length} casinos...\n`);

// Generate logo URLs using multiple services
const logoUrls = casinos.map(casino => {
  // Extract domain from URL
  const domain = casino.url
    .replace('https://www.', '')
    .replace('https://', '')
    .replace('http://www.', '')
    .replace('http://', '')
    .split('/')[0];
  
  return {
    slug: casino.slug,
    brand: casino.brand,
    domain: domain,
    // Try Clearbit first (best quality)
    clearbitUrl: `https://logo.clearbit.com/${domain}`,
    // Google Favicon as backup (always works)
    faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    // Logo.dev as alternative
    logoDevUrl: `https://img.logo.dev/${domain}?token=pk_X-HuHJfzQZ2dB6pN-qNMdQ&size=400`,
  };
});

// Save the URLs
fs.writeFileSync('./logo-urls-complete.json', JSON.stringify(logoUrls, null, 2));

// Generate just the Clearbit URLs for batch download
const clearbitUrls = logoUrls.map(l => l.clearbitUrl);
fs.writeFileSync('./logo-urls-clearbit.json', JSON.stringify(clearbitUrls, null, 2));

// Generate Google Favicon URLs for batch download
const faviconUrls = logoUrls.map(l => l.faviconUrl);
fs.writeFileSync('./logo-urls-favicon.json', JSON.stringify(faviconUrls, null, 2));

console.log('✅ Generated logo URLs:');
console.log(`   - Complete data: logo-urls-complete.json`);
console.log(`   - Clearbit URLs: logo-urls-clearbit.json`);
console.log(`   - Favicon URLs: logo-urls-favicon.json`);
console.log(`\n📊 Total casinos: ${casinos.length}`);
