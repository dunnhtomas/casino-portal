const fs = require('fs');

console.log('🧹 Cleaning casino brand names from country suffixes...');

// Load the casino data
const casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));

// Create backup first
fs.writeFileSync('data/casinos-before-brand-cleanup.json', JSON.stringify(casinos, null, 2));
console.log('💾 Backup created: data/casinos-before-brand-cleanup.json');

let cleanedCount = 0;
const cleaningLog = [];

// Clean each casino
const cleanedCasinos = casinos.map(casino => {
    const originalBrand = casino.brand;
    
    // Remove country code suffixes and technical suffixes
    let cleanedBrand = originalBrand
        // Remove country codes with -v2
        .replace(/\s+(HB|UK|NL|DE|ES|FR|BE|GR|AT|CZ|FI|SE|IT|PT|NO|DK|PL|RO|HU|SK|SI|HR|BG|LV|LT|EE|MT|CY|LU|IE)-v2$/i, '')
        // Remove standalone country codes
        .replace(/\s+(HB|UK|NL|DE|ES|FR|BE|GR|AT|CZ|FI|SE|IT|PT|NO|DK|PL|RO|HU|SK|SI|HR|BG|LV|LT|EE|MT|CY|LU|IE)$/i, '')
        // Remove -v2, -v3, etc.
        .replace(/\s*-v\d+$/i, '')
        // Clean up extra spaces
        .trim();

    // Check if cleaning was needed
    if (cleanedBrand !== originalBrand) {
        cleanedCount++;
        cleaningLog.push({
            slug: casino.slug,
            original: originalBrand,
            cleaned: cleanedBrand
        });
        
        console.log(`✅ ${casino.slug}: "${originalBrand}" → "${cleanedBrand}"`);
    }
    
    return {
        ...casino,
        brand: cleanedBrand
    };
});

// Save cleaned data
fs.writeFileSync('data/casinos.json', JSON.stringify(cleanedCasinos, null, 2));

// Save cleaning log
fs.writeFileSync('data/brand-cleaning-log.json', JSON.stringify(cleaningLog, null, 2));

console.log('\n📊 BRAND CLEANING SUMMARY');
console.log('========================');
console.log(`Total casinos processed: ${casinos.length}`);
console.log(`Brands cleaned: ${cleanedCount}`);
console.log(`Cleaning rate: ${((cleanedCount / casinos.length) * 100).toFixed(1)}%`);
console.log(`Cleaning log saved: data/brand-cleaning-log.json`);

// Show some examples
console.log('\n🎯 CLEANED EXAMPLES:');
cleaningLog.slice(0, 10).forEach(log => {
    console.log(`  • ${log.original} → ${log.cleaned}`);
});

if (cleaningLog.length > 10) {
    console.log(`  ... and ${cleaningLog.length - 10} more`);
}

console.log('\n✅ Casino brand names have been cleaned!');
console.log('🔄 Ready for rebuilding with clean brand names.');