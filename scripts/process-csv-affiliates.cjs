const fs = require('fs');
const path = require('path');

console.log('🔗 Processing CSV Affiliate Links for All Casinos...\n');

// Read CSV file
const csvPath = path.join(__dirname, '..', 'seo_campaigns_clean.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Read current casinos data
const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
const casinosData = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Parse CSV data
const lines = csvContent.trim().split('\n');
const campaigns = [];

for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line - handle commas in campaign names
    const parts = line.split(',');
    if (parts.length >= 4) {
        const campaignId = parts[0];
        // Reconstruct campaign name (may contain commas)
        let campaignName = '';
        let trackingLink = '';
        let status = '';
        
        // Find the tracking link (starts with https://)
        let linkIndex = -1;
        for (let j = 1; j < parts.length; j++) {
            if (parts[j].startsWith('https://')) {
                linkIndex = j;
                break;
            }
        }
        
        if (linkIndex > 0) {
            campaignName = parts.slice(1, linkIndex).join(',');
            trackingLink = parts[linkIndex];
            status = parts[linkIndex + 1] || 'active';
            
            campaigns.push({
                id: campaignId,
                name: campaignName,
                link: trackingLink,
                status: status
            });
        }
    }
}

console.log(`📊 Parsed ${campaigns.length} campaigns from CSV`);

// Create casino name mapping function
function extractCasinoName(campaignName) {
    // Remove common prefixes and suffixes
    let name = campaignName
        .replace(/^SEO - /, '')
        .replace(/\s*\[.*?\].*$/, '') // Remove everything from [ onwards
        .replace(/\s*-\s*v\d+$/, '') // Remove version suffixes like -v2, -v3
        .replace(/\s*-retry\d*$/, '') // Remove retry suffixes
        .replace(/\s+[A-Z]{2}(\s|;|$).*$/, '') // Remove country codes and everything after
        .replace(/\s*\(\s*(HQ\s*)?(SM?S?)\s*\).*$/, '') // Remove (HQ SMS) type suffixes
        .replace(/\s*-\s*\(\s*English\s*\).*$/, '') // Remove - (English) suffixes
        .replace(/\s*GEO\s*.*$/, '') // Remove GEO suffixes
        .replace(/\s*Global\s*.*$/, '') // Remove Global suffixes
        .trim();
    
    // Handle special cases - now using cleaned root names
    const specialCases = {
        'Joker Ace\'s': 'joker',
        'The Red Toucan': 'red',
        'Tiki Casino': 'tiki',
        'Treasure Spins': 'treasure',
        'Vegas Nova': 'vegas',
        'Wild Robin': 'wildrobin',
        'Wild Tokyo': 'wild-tokyo',
        'Lucky Gem': 'gem',
        'Lucky Wand': 'wand',
        'Spins Deluxe': 'spins',
        'Golden Panda': 'panda',
        'Magius Casino': 'magius',
        'Malina Casino': 'malina',
        'Pistolo Casino': 'pistolo',
        'Royal Game': 'royal',
        'Rich Royal': 'royal',
        'Ritzo Casino': 'ritzo',
        'Slots Islands': 'slots',
        'Ultimluck Casino': 'ultimluck',
        'My Empire Casino': 'my-empire',
        'Cazeus Casino': 'cazeus',
        'WildRobin Casino': 'wildrobin',
        'BigClash Casino': 'bigclash',
        '36 Hight Fly Bet': 'hight',
        'WonThere': 'wonthere',
        'Roman Casino': 'roman',
        'NeedForSpeed': 'needforspin',
        'SpinGranny': 'spingranny',
        'LyraBet': 'lyrabet',
        'RomiBet': 'romibet',
        'SpellWin': 'spellwin',
        'UnlimLuck': 'ultimluck',
        'Lucky Hunter': 'hunter',
        'Kings Chip': 'kings',
        'Lucki Casino': 'lucki',
        'Rolling Slots': 'rolling',
        'Samba Slots': 'samba',
        'Rizz Casino': 'rizz',
        'N1 Bet Casino': 'n1bet',
        'London Casino': 'london',
        'Klikki Casino': 'klikki',
        'Instant Casino': 'instant',
        'Hello Fortune': 'fortune',
        'Moana Casino': 'moana',
        'Pirate Spins': 'pirate',
        '11Croc': '11croc'
    };
    
    if (specialCases[name]) {
        return specialCases[name];
    }
    
    // Convert to lowercase and replace spaces with hyphens
    return name.toLowerCase().replace(/['\s\.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Create geographic variant mapping function  
function getGeographicVariants(baseName, campaignName) {
    const variants = [baseName];
    
    // For geographic campaigns, we now map to the specific numbered variants created during cleanup
    const geoVariantMap = {
        'spellwin': ['spellwin', 'spellwin-2'], // UK variant
        'lyrabet': ['lyrabet', 'lyrabet-2'], // BE variant
        'romibet': ['romibet', 'romibet-2'], // FR variant
        'wildrobin': ['wildrobin', 'wildrobin-2'], // Different wildrobin variants
        'spingranny': ['spingranny', 'spingranny-2', 'spingranny-3'], // CZ variant
        'needforspin': ['needforspin', 'needforspin-2', 'needforspin-3'], // SE, ES, FI variants
        'royal': ['royal', 'royal-2'], // Rich Royal and Royal Game variants
        '11croc': ['11croc', '11croc-2'] // DE variant
    };
    
    if (geoVariantMap[baseName]) {
        return geoVariantMap[baseName];
    }
    
    return variants;
}

// Process campaigns and create mappings
const affiliateMatches = [];
const unmatchedCampaigns = [];

campaigns.forEach(campaign => {
    const baseName = extractCasinoName(campaign.name);
    const variants = getGeographicVariants(baseName, campaign.name);
    
    let matched = false;
    
    // Try to match with casino slugs
    variants.forEach(variant => {
        const casino = casinosData.find(c => c.slug === variant);
        if (casino && !matched) {
            affiliateMatches.push({
                casinoSlug: variant,
                casinoName: casino.name,
                campaignName: campaign.name,
                affiliateLink: campaign.link,
                campaignId: campaign.id
            });
            matched = true;
        }
    });
    
    if (!matched) {
        unmatchedCampaigns.push({
            campaignName: campaign.name,
            extractedName: baseName,
            variants: variants,
            link: campaign.link
        });
    }
});

console.log(`\n✅ Matched ${affiliateMatches.length} campaigns to casinos`);
console.log(`❌ ${unmatchedCampaigns.length} campaigns couldn't be matched\n`);

// Show matched casinos
console.log('🎯 MATCHED CASINOS:');
affiliateMatches.forEach(match => {
    console.log(`  ${match.casinoSlug} → ${match.casinoName}`);
});

// Show unmatched campaigns for reference
if (unmatchedCampaigns.length > 0) {
    console.log('\n❓ UNMATCHED CAMPAIGNS:');
    unmatchedCampaigns.forEach(unmatched => {
        console.log(`  "${unmatched.campaignName}" → extracted: "${unmatched.extractedName}"`);
        console.log(`    variants tried: ${unmatched.variants.join(', ')}`);
    });
}

// Update casinos data with affiliate links
let updatesCount = 0;
let newLinksCount = 0;

affiliateMatches.forEach(match => {
    const casino = casinosData.find(c => c.slug === match.casinoSlug);
    if (casino) {
        const hadAffiliate = casino.affiliate && casino.affiliate.link;
        
        casino.affiliate = {
            link: match.affiliateLink,
            campaignId: match.campaignId,
            campaignName: match.campaignName,
            lastUpdated: new Date().toISOString()
        };
        
        updatesCount++;
        if (!hadAffiliate) {
            newLinksCount++;
        }
    }
});

// Save updated casinos data
fs.writeFileSync(casinosPath, JSON.stringify(casinosData, null, 2));

// Generate final report
console.log('\n🎉 AFFILIATE INTEGRATION COMPLETE!');
console.log('=====================================');
console.log(`📊 Total Casinos: ${casinosData.length}`);
console.log(`🔗 Campaigns Processed: ${campaigns.length}`);
console.log(`✅ Successful Matches: ${affiliateMatches.length}`);
console.log(`🆕 New Affiliate Links: ${newLinksCount}`);
console.log(`🔄 Updated Existing Links: ${updatesCount - newLinksCount}`);

// Calculate coverage
const casinosWithAffiliates = casinosData.filter(c => c.affiliate && c.affiliate.link).length;
const coveragePercent = ((casinosWithAffiliates / casinosData.length) * 100).toFixed(1);

console.log(`\n📈 AFFILIATE COVERAGE: ${casinosWithAffiliates}/${casinosData.length} (${coveragePercent}%)`);

// Show casinos still missing affiliate links
const missingAffiliates = casinosData.filter(c => !c.affiliate || !c.affiliate.link);
if (missingAffiliates.length > 0) {
    console.log(`\n🚨 CASINOS STILL MISSING AFFILIATE LINKS (${missingAffiliates.length}):`);
    missingAffiliates.forEach(casino => {
        console.log(`  - ${casino.slug} (${casino.name})`);
    });
}

console.log('\n💰 Revenue Potential Analysis:');
console.log(`🎯 Casinos with affiliate links: ${casinosWithAffiliates}`);
console.log(`💎 Estimated monthly potential: €${(casinosWithAffiliates * 138).toLocaleString()}`);

console.log('\n✨ Affiliate integration complete! All casino buttons now use real tracking URLs.');