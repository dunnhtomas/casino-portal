const fs = require('fs');

console.log('🔄 Updating logo mapping with geo-aware results...');

// Load existing data
const existingLogos = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));
const geoResults = JSON.parse(fs.readFileSync('data/simple-geo-logo-results.json', 'utf8'));

// Create a map for quick lookup
const existingMap = new Map(existingLogos.map(logo => [logo.casino, logo]));

let updatedCount = 0;
let newCount = 0;

// Update with geo-aware results
const updatedMapping = [...existingLogos];

geoResults.forEach(geoResult => {
    const existingIndex = updatedMapping.findIndex(logo => logo.casino === geoResult.casino);
    
    if (existingIndex !== -1) {
        // Check if this is an improvement
        const existing = updatedMapping[existingIndex];
        const qualityRank = { 'high': 3, 'medium': 2, 'basic': 1, 'low': 1 };
        
        const existingQuality = qualityRank[existing.quality] || 1;
        const newQuality = qualityRank[geoResult.quality] || 1;
        
        // Update if better quality or same quality but higher brand relevance
        if (newQuality > existingQuality || 
            (newQuality === existingQuality && geoResult.brandRelevance >= 15)) {
            
            updatedMapping[existingIndex] = {
                casino: geoResult.casino,
                source: geoResult.source,
                logoUrl: geoResult.logoUrl,
                quality: geoResult.quality,
                dimensions: geoResult.dimensions,
                geoAware: true,
                country: geoResult.country,
                brandRelevance: geoResult.brandRelevance
            };
            
            updatedCount++;
            console.log(`🔄 Updated ${geoResult.brand}: ${existing.quality} → ${geoResult.quality}`);
        }
    } else {
        // New logo
        updatedMapping.push({
            casino: geoResult.casino,
            source: geoResult.source,
            logoUrl: geoResult.logoUrl,
            quality: geoResult.quality,
            dimensions: geoResult.dimensions,
            geoAware: true,
            country: geoResult.country,
            brandRelevance: geoResult.brandRelevance
        });
        
        newCount++;
        console.log(`➕ New ${geoResult.brand}: ${geoResult.quality} quality`);
    }
});

// Save updated mapping
fs.writeFileSync('data/complete-logo-mapping-final.json', JSON.stringify(updatedMapping, null, 2));

console.log('\n📊 GEO-AWARE UPDATE SUMMARY');
console.log('============================');
console.log(`Total logos processed: ${geoResults.length}`);
console.log(`Updated existing logos: ${updatedCount}`);
console.log(`New logos added: ${newCount}`);
console.log(`Total improvements: ${updatedCount + newCount}`);

// Quality distribution in final mapping
const qualityStats = {};
updatedMapping.forEach(logo => {
    qualityStats[logo.quality] = (qualityStats[logo.quality] || 0) + 1;
});

console.log('\n🏆 Final Quality Distribution:');
Object.entries(qualityStats).forEach(([quality, count]) => {
    console.log(`  ${quality}: ${count} logos`);
});

// Count geo-aware logos
const geoAwareCount = updatedMapping.filter(logo => logo.geoAware).length;
console.log(`\n🌍 Geo-aware logos: ${geoAwareCount}`);

console.log('\n✅ Final logo mapping saved to: data/complete-logo-mapping-final.json');
console.log('🚀 Ready for final build with all improvements!');