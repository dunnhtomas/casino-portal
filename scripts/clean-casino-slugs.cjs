const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning Casino Slugs - Removing Geographic Suffixes...\n');

// Read current casinos data
const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
const casinosData = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

console.log(`📊 Total casinos: ${casinosData.length}`);

// Define slug corrections - mapping current slug to correct root slug
const slugCorrections = {
    // Geographic variants that should use root names
    'spellwin-uk': 'spellwin',
    'lyrabet-be': 'lyrabet', 
    'romibet-fr': 'romibet',
    'needforspin-se': 'needforspin',
    'needforspin-es': 'needforspin', 
    'needforspin-fi': 'needforspin',
    'spingranny-cz': 'spingranny',
    '11croc-de': '11croc',
    
    // Other fixes needed
    'malina-casino': 'malina',
    'pistolo-casino': 'pistolo',
    'magius-casino': 'magius',
    'ultimluck-casino': 'ultimluck',
    'wildrobin-casino': 'wildrobin',
    'tiki-casino': 'tiki',
    'treasure-spins': 'treasure',
    'vegas-nova': 'vegas',
    'wild-tokyo': 'wild-tokyo', // Keep this as is - it's a distinct brand
    'wild-robin': 'wildrobin', // Consolidate to one wildrobin
    'the-red': 'red',
    'lucky-gem': 'gem',
    'lucky-wand': 'wand',
    'lucky-hunter': 'hunter',
    'spins-deluxe': 'spins',
    'slots-islands': 'slots',
    'rich-royal': 'royal', // Consolidate with royal-game
    'royal-game': 'royal',
    'instant-casino': 'instant',
    'golden-panda': 'panda',
    'hello-fortune': 'fortune',
    'moana-casino': 'moana',
    'roman-casino': 'roman',
    'london-casino': 'london',
    'klikki-casino': 'klikki',
    'lucki-casino': 'lucki',
    'kings-chip': 'kings',
    'ritzo-casino': 'ritzo',
    'rizz-casino': 'rizz',
    'n1-bet-casino': 'n1bet',
    'joker-ace\'s': 'joker',
    'pirate-spins': 'pirate',
    'rolling-slots': 'rolling',
    'samba-slots': 'samba',
    '36-hight': 'hight'
};

// Track changes
const changes = [];
const duplicateRoots = {};

// Apply slug corrections
casinosData.forEach((casino, index) => {
    const originalSlug = casino.slug;
    const correctedSlug = slugCorrections[originalSlug] || originalSlug;
    
    if (originalSlug !== correctedSlug) {
        // Track for duplicate detection
        if (!duplicateRoots[correctedSlug]) {
            duplicateRoots[correctedSlug] = [];
        }
        duplicateRoots[correctedSlug].push({
            originalSlug,
            index,
            name: casino.name
        });
        
        casino.slug = correctedSlug;
        changes.push({
            index,
            name: casino.name,
            oldSlug: originalSlug,
            newSlug: correctedSlug
        });
    } else {
        // Also track unchanged for duplicate detection
        if (!duplicateRoots[correctedSlug]) {
            duplicateRoots[correctedSlug] = [];
        }
        duplicateRoots[correctedSlug].push({
            originalSlug,
            index,
            name: casino.name
        });
    }
});

console.log('📝 SLUG CORRECTIONS APPLIED:');
console.log('==============================');
changes.forEach(change => {
    console.log(`  ${change.oldSlug} → ${change.newSlug} (${change.name})`);
});

// Check for duplicates after corrections
console.log('\n🔍 CHECKING FOR DUPLICATES:');
console.log('============================');
const duplicates = Object.entries(duplicateRoots).filter(([slug, entries]) => entries.length > 1);

if (duplicates.length > 0) {
    console.log('⚠️  FOUND DUPLICATE ROOT SLUGS:');
    duplicates.forEach(([slug, entries]) => {
        console.log(`\n  ${slug}:`);
        entries.forEach(entry => {
            console.log(`    - ${entry.originalSlug} (${entry.name})`);
        });
    });
    
    // For duplicates, we need to decide which one to keep
    // Let's keep the first one and modify others
    duplicates.forEach(([slug, entries]) => {
        // Keep the first entry, modify others
        for (let i = 1; i < entries.length; i++) {
            const entry = entries[i];
            const casino = casinosData[entry.index];
            const newSlug = `${slug}-${i + 1}`;
            
            console.log(`    → Renaming ${entry.originalSlug} to ${newSlug}`);
            casino.slug = newSlug;
            
            changes.push({
                index: entry.index,
                name: casino.name,
                oldSlug: entry.originalSlug,
                newSlug: newSlug,
                reason: 'Resolved duplicate'
            });
        }
    });
} else {
    console.log('✅ No duplicates found after corrections');
}

// Update image paths and internal references to match new slugs
casinosData.forEach(casino => {
    // Update image paths
    if (casino.image && casino.image.originalUrl) {
        const imageName = casino.slug + '.png';
        casino.image.originalUrl = `/images/casinos/${imageName}`;
        if (casino.image.responsiveImages && casino.image.responsiveImages.length > 0) {
            casino.image.responsiveImages[0].url = `/images/casinos/${imageName}`;
        }
    }
});

// Save the corrected data
fs.writeFileSync(casinosPath, JSON.stringify(casinosData, null, 2));

console.log('\n🎉 CASINO SLUG CLEANUP COMPLETE!');
console.log('=================================');
console.log(`📊 Total Changes: ${changes.length}`);
console.log(`📁 Updated File: data/casinos.json`);

// Final verification - check all slugs
console.log('\n📋 FINAL SLUG VERIFICATION:');
console.log('===========================');
const finalSlugs = casinosData.map(c => c.slug).sort();
const duplicateFinalSlugs = finalSlugs.filter((slug, index) => finalSlugs.indexOf(slug) !== index);

if (duplicateFinalSlugs.length > 0) {
    console.log('❌ STILL HAVE DUPLICATES:');
    duplicateFinalSlugs.forEach(slug => console.log(`  - ${slug}`));
} else {
    console.log('✅ All slugs are now unique!');
}

console.log(`\n📈 Total unique casinos: ${finalSlugs.length}`);
console.log('\n✨ All casino slugs now use root names without geographic suffixes!');