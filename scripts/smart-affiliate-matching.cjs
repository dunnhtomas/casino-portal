const fs = require('fs');
const path = require('path');

console.log('🔍 SMART AFFILIATE MATCHING - Round 2\n');
console.log('Finding missing links using root casino names...\n');

// Read CSV file
const csvPath = path.join(__dirname, '..', 'seo_campaigns_clean.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Read current casinos data
const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
const casinosData = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Parse CSV data
const lines = csvContent.trim().split('\n');
const campaigns = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4) {
        let linkIndex = -1;
        for (let j = 1; j < parts.length; j++) {
            if (parts[j].startsWith('https://')) {
                linkIndex = j;
                break;
            }
        }
        
        if (linkIndex > 0) {
            const campaignName = parts.slice(1, linkIndex).join(',');
            const trackingLink = parts[linkIndex];
            
            campaigns.push({
                id: parts[0],
                name: campaignName,
                link: trackingLink
            });
        }
    }
}

// Find casinos still missing affiliate links
const missingCasinos = casinosData.filter(c => !c.affiliate || !c.affiliate.link);

console.log(`📊 Found ${missingCasinos.length} casinos missing affiliate links:`);
missingCasinos.forEach(casino => {
    console.log(`  - ${casino.slug}`);
});

// Smart root name extraction from casino slugs
function getRootCasinoName(slug) {
    // Remove numbered suffixes (-2, -3)
    const rootSlug = slug.replace(/-\d+$/, '');
    
    // Map specific slugs to likely campaign keywords
    const rootNameMap = {
        'winitbet': ['winit', 'winit.bet', 'winitbet'],
        'unlimluck': ['unlimluck', 'unlim', 'unluck'],
        'my-empire': ['empire', 'my empire', 'myempire'],
        'rollxo': ['rollxo', 'roll xo', 'rollx'],
        'jackpot-raider': ['jackpot', 'raider', 'jackpot raider'],
        'spellwin': ['spellwin', 'spell win'],
        'pistolo': ['pistolo'],
        'ivybetio': ['ivybet', 'ivy bet', 'ivybet.io'],
        'spingranny': ['spingranny', 'spin granny'],
        'lyrabet': ['lyrabet', 'lyra bet'],
        'instant': ['instant'],
        'magius': ['magius'],
        'romibet': ['romibet', 'romi bet'],
        'gem': ['gem', 'lucky gem'],
        'needforspin': ['needforspin', 'needforspeed', 'need for spin', 'need for speed'],
        '11croc': ['11croc', 'croc']
    };
    
    return rootNameMap[rootSlug] || [rootSlug];
}

// Smart campaign matching
console.log('\n🎯 SMART CAMPAIGN MATCHING:');
console.log('============================');

const newMatches = [];

missingCasinos.forEach(casino => {
    const rootNames = getRootCasinoName(casino.slug);
    console.log(`\n🔍 Searching for: ${casino.slug} (trying: ${rootNames.join(', ')})`);
    
    // Search campaigns for matches
    const matchingCampaigns = [];
    
    campaigns.forEach(campaign => {
        const campaignLower = campaign.name.toLowerCase();
        
        rootNames.forEach(rootName => {
            const searchTerm = rootName.toLowerCase();
            
            // Different matching strategies
            if (campaignLower.includes(searchTerm)) {
                matchingCampaigns.push({
                    campaign,
                    matchType: 'contains',
                    searchTerm,
                    confidence: campaignLower.includes(`seo - ${searchTerm}`) ? 'high' : 'medium'
                });
            }
        });
    });
    
    // Remove duplicates and sort by confidence
    const uniqueMatches = matchingCampaigns.filter((match, index, arr) => 
        arr.findIndex(m => m.campaign.id === match.campaign.id) === index
    ).sort((a, b) => {
        if (a.confidence === 'high' && b.confidence !== 'high') return -1;
        if (b.confidence === 'high' && a.confidence !== 'high') return 1;
        return 0;
    });
    
    if (uniqueMatches.length > 0) {
        console.log(`  ✅ Found ${uniqueMatches.length} potential matches:`);
        uniqueMatches.forEach((match, idx) => {
            console.log(`    ${idx + 1}. "${match.campaign.name}" (${match.confidence} confidence)`);
            console.log(`       ID: ${match.campaign.id} | Term: "${match.searchTerm}"`);
        });
        
        // Use the highest confidence match
        const bestMatch = uniqueMatches[0];
        newMatches.push({
            casino,
            campaign: bestMatch.campaign,
            confidence: bestMatch.confidence
        });
    } else {
        console.log(`  ❌ No matches found`);
    }
});

console.log('\n🎉 NEW MATCHES FOUND:');
console.log('=====================');

if (newMatches.length > 0) {
    newMatches.forEach((match, idx) => {
        console.log(`${idx + 1}. ${match.casino.slug} → Campaign ${match.campaign.id}`);
        console.log(`   "${match.campaign.name}"`);
        console.log(`   Confidence: ${match.confidence}`);
        console.log(`   Link: ${match.campaign.link}\n`);
    });
    
    // Apply the new matches
    console.log('🔗 APPLYING NEW AFFILIATE LINKS:');
    console.log('=================================');
    
    let appliedCount = 0;
    newMatches.forEach(match => {
        // Find the casino in the data and update it
        const casino = casinosData.find(c => c.slug === match.casino.slug);
        if (casino) {
            casino.affiliate = {
                link: match.campaign.link,
                campaignId: match.campaign.id,
                campaignName: match.campaign.name,
                lastUpdated: new Date().toISOString(),
                confidence: match.confidence
            };
            appliedCount++;
            console.log(`  ✅ Updated ${casino.slug}`);
        }
    });
    
    // Save updated casinos data
    fs.writeFileSync(casinosPath, JSON.stringify(casinosData, null, 2));
    
    console.log(`\n🎊 SUCCESS! Applied ${appliedCount} new affiliate links`);
    
    // Final stats
    const totalWithAffiliates = casinosData.filter(c => c.affiliate && c.affiliate.link).length;
    const newCoverage = ((totalWithAffiliates / casinosData.length) * 100).toFixed(1);
    
    console.log(`\n📈 UPDATED COVERAGE STATS:`);
    console.log(`==========================`);
    console.log(`✅ Casinos with affiliate links: ${totalWithAffiliates}/${casinosData.length}`);
    console.log(`📊 Coverage: ${newCoverage}%`);
    console.log(`💰 Monthly potential: €${(totalWithAffiliates * 138).toLocaleString()}`);
    
    const stillMissing = casinosData.filter(c => !c.affiliate || !c.affiliate.link);
    if (stillMissing.length > 0) {
        console.log(`\n❌ Still missing (${stillMissing.length}):`);
        stillMissing.forEach(casino => {
            console.log(`  - ${casino.slug}`);
        });
    }
    
} else {
    console.log('❌ No new matches found in this round');
}

console.log('\n✨ Smart matching complete!');