const fs = require('fs');

console.log('🔄 Integrating final logo mapping into casino data...');

// Load the data
const casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
const finalLogoMapping = JSON.parse(fs.readFileSync('data/complete-logo-mapping-final.json', 'utf8'));

// Create a map for quick lookup
const logoMap = new Map();
finalLogoMapping.forEach(logo => {
    logoMap.set(logo.casino, logo);
});

console.log(`📋 Processing ${casinos.length} casinos with final logo mapping...`);

// Update each casino with the final logo information
const updatedCasinos = casinos.map(casino => {
    const logoData = logoMap.get(casino.slug);
    
    if (logoData) {
        return {
            ...casino,
            logo: {
                url: logoData.logoUrl,
                source: logoData.source,
                quality: logoData.quality,
                dimensions: logoData.dimensions || 'unknown',
                geoAware: logoData.geoAware || false,
                country: logoData.country || 'unknown',
                brandRelevance: logoData.brandRelevance || 0
            }
        };
    }
    
    return casino;
});

// Save the final updated casino data
fs.writeFileSync('data/casinos-final-with-logos.json', JSON.stringify(updatedCasinos, null, 2));

// Replace the main casino data
fs.copyFileSync('data/casinos-final-with-logos.json', 'data/casinos.json');

console.log('✅ Final logo integration complete!');
console.log(`📊 Stats:`);
console.log(`  - Total casinos: ${updatedCasinos.length}`);
console.log(`  - With logos: ${updatedCasinos.filter(c => c.logo).length}`);
console.log(`  - High quality: ${updatedCasinos.filter(c => c.logo?.quality === 'high').length}`);
console.log(`  - Geo-aware: ${updatedCasinos.filter(c => c.logo?.geoAware).length}`);
console.log(`  - Perfect brand match: ${updatedCasinos.filter(c => c.logo?.brandRelevance >= 15).length}`);

console.log('🚀 Ready for final Docker build with all improvements!');