const fs = require('fs');

console.log('🔍 Creating new search list with cleaned brand names...');

// Load the cleaned casino data
const casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));

// Create search variations for each casino with cleaned names
const searchList = casinos.map(casino => {
    const cleanBrand = casino.brand;
    const slug = casino.slug;
    
    // Generate multiple search variations for better matching
    const searchVariations = [
        cleanBrand,
        cleanBrand.toLowerCase(),
        cleanBrand.replace(/\s+/g, ''),
        cleanBrand.replace(/\s+/g, '').toLowerCase(),
        `${cleanBrand} casino`,
        `${cleanBrand} online casino`,
        `${cleanBrand} gaming`,
        `${cleanBrand} logo`,
        slug.replace(/-/g, ' '),
        slug
    ];
    
    // Remove duplicates
    const uniqueVariations = [...new Set(searchVariations)];
    
    return {
        slug: slug,
        brand: cleanBrand,
        originalBrand: casino.brand,
        url: casino.url,
        searchVariations: uniqueVariations,
        priority: 'high' // All brands are now clean and high priority
    };
});

// Save the new search list
fs.writeFileSync('data/clean-casino-search-list.json', JSON.stringify(searchList, null, 2));

console.log('✅ Clean casino search list created!');
console.log(`📊 Generated search variations for ${searchList.length} casinos`);
console.log('💾 Saved to: data/clean-casino-search-list.json');

// Show examples
console.log('\n🎯 SAMPLE SEARCH VARIATIONS:');
searchList.slice(0, 5).forEach(casino => {
    console.log(`\n• ${casino.brand} (${casino.slug}):`);
    casino.searchVariations.slice(0, 6).forEach(variation => {
        console.log(`  - "${variation}"`);
    });
});

console.log('\n🚀 Ready to search for logos with clean brand names!');