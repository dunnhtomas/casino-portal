const fs = require('fs');

// Load the data
const casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
const logoMapping = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));

// Create a map for quick lookup
const logoMap = new Map();
logoMapping.forEach(logo => {
    logoMap.set(logo.casino, logo);
});

console.log('🔄 Integrating logos into casino data...');

// Update each casino with logo information
const updatedCasinos = casinos.map(casino => {
    const logoData = logoMap.get(casino.slug);
    
    if (logoData) {
        return {
            ...casino,
            logo: {
                url: logoData.logoUrl,
                source: logoData.source,
                quality: logoData.quality,
                dimensions: logoData.dimensions || 'unknown'
            }
        };
    }
    
    return casino;
});

// Save the updated casino data
fs.writeFileSync('data/casinos-final.json', JSON.stringify(updatedCasinos, null, 2));

console.log('✅ Logo integration complete!');
console.log(`📊 Stats:`);
console.log(`  - Total casinos: ${updatedCasinos.length}`);
console.log(`  - With logos: ${updatedCasinos.filter(c => c.logo).length}`);
console.log(`  - High quality: ${updatedCasinos.filter(c => c.logo?.quality === 'high').length}`);
console.log(`  - Medium quality: ${updatedCasinos.filter(c => c.logo?.quality === 'medium').length}`);
console.log(`  - Basic quality: ${updatedCasinos.filter(c => c.logo?.quality === 'basic').length}`);

// Create a backup of original
fs.copyFileSync('data/casinos.json', 'data/casinos-original-backup.json');

// Replace the main casino data with logo-integrated version
fs.copyFileSync('data/casinos-final.json', 'data/casinos.json');

console.log('🔄 Main casino data updated with logo URLs');
console.log('💾 Original backup saved as: data/casinos-original-backup.json');