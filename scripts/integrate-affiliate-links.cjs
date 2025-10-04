#!/usr/bin/env node
/**
 * Real Affiliate Links Integration System
 * Processes seo_campaigns_clean.json and updates casino database with real affiliate tracking URLs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SEO_CAMPAIGNS_FILE = 'seo_campaigns_clean.json';
const CASINOS_FILE = 'data/casinos.json';
const OUTPUT_FILE = 'data/casinos_with_affiliates.json';
const AFFILIATE_MAPPING_FILE = 'data/affiliate_mapping.json';

/**
 * Extract casino name from campaign alias or name
 */
function extractCasinoName(campaign) {
  // Extract from alias (most reliable)
  let casinoName = campaign.alias.split('-')[0];
  
  // Common casino name mappings and normalizations
  const nameNormalizations = {
    'winshark': 'winshark',
    'wonthere': 'wonthere', 
    'roman': 'roman-casino',
    'ivybetio': 'ivybetio',
    'vipzino': 'vipzino',
    'fatpirate': 'fatpirate',
    'felix': 'felix-spin',
    'foxygold': 'foxygold',
    'frenzino': 'frenzino',
    'frostybet': 'frostybet',
    'funbet': 'funbet',
    'gamblezen': 'gamblezen',
    'gigaspinz': 'gigaspinz',
    'gransino': 'gransino',
    'hello': 'hello-fortune',
    'instant': 'instant-casino',
    'instaspin': 'instaspin',
    'ivybet': 'ivybetio',
    'jet4bet': 'jet4bet',
    'joker': 'joker-ace',
    'kings': 'kings-chip',
    'klikki': 'klikki-casino',
    'larabet': 'larabet',
    'london': 'london-casino',
    'lucky': 'lucky-hunter', // Could be lucky-gem or lucky-wand too
    'lyrabet': 'lyrabet',
    'moana': 'moana-casino',
    'mr': 'mr-pacho',
    'needforspeed': 'needforspin',
    'orionsbet': 'orionsbet',
    'dragon': 'dragon-slots',
    'jackpot': 'jackpot-raider',
    'lucki': 'lucki-casino',
    'winrolla': 'winrolla',
    'pirate': 'pirate-spins',
    'posido': 'posido',
    'prontobet': 'prontobet',
    'rizz': 'rizz-casino',
    'robocat': 'robocat',
    'rolling': 'rolling-slots',
    'rollxo': 'rollxo',
    'romibet': 'romibet',
    'spellwin': 'spellwin',
    'winitbet': 'winitbet',
    'unlimluck': 'unlimluck',
    'trino': 'trino',
    'spincastle': 'spincastle',
    'wildrobin': 'wildrobin-casino',
    'willdsino': 'willdsino',
    'winshark': 'winshark',
    'sagaspins': 'sagaspins',
    'samba': 'samba-slots',
    'skyhills': 'skyhills',
    'slotlair': 'slotlair',
    'my': 'my-empire',
    'n1': 'n1-bet-casino'
  };

  // Apply normalizations
  for (const [key, value] of Object.entries(nameNormalizations)) {
    if (casinoName.toLowerCase().includes(key)) {
      casinoName = value;
      break;
    }
  }

  return casinoName.toLowerCase();
}

/**
 * Extract geographic targeting from campaign
 */
function extractGeoTargeting(campaign) {
  const geoIndicators = {
    'uk': ['UK'],
    'us': ['US'], 
    'ca': ['CA'],
    'au': ['AU'],
    'de': ['DE'],
    'fr': ['FR'],
    'es': ['ES'],
    'it': ['IT'],
    'nl': ['NL'],
    'se': ['SE'],
    'dk': ['DK'],
    'fi': ['FI'],
    'no': ['NO'],
    'at': ['AT'],
    'ch': ['CH'],
    'be': ['BE'],
    'ie': ['IE'],
    'gr': ['GR'],
    'pt': ['PT'],
    'pl': ['PL'],
    'cz': ['CZ'],
    'ro': ['RO']
  };

  const alias = campaign.alias.toLowerCase();
  const name = campaign.name.toLowerCase();
  const notes = (campaign.notes || '').toLowerCase();
  
  const targetGeos = [];
  
  for (const [geo, codes] of Object.entries(geoIndicators)) {
    if (alias.includes(`-${geo}-`) || alias.includes(`-${geo}`) || 
        name.includes(geo.toUpperCase()) || notes.includes(geo.toUpperCase())) {
      targetGeos.push(...codes);
    }
  }

  return targetGeos.length > 0 ? targetGeos : ['GLOBAL'];
}

/**
 * Extract revenue information from campaign
 */
function extractRevenue(campaign) {
  const notes = campaign.notes || '';
  const eurMatch = notes.match(/(\d+)\s*EUR/i);
  return eurMatch ? parseInt(eurMatch[1]) : null;
}

/**
 * Main processing function
 */
async function processAffiliateData() {
  console.log('🔄 Processing Real Affiliate Links Integration...');
  
  try {
    // Read source files
    console.log('📖 Reading source files...');
    const campaignsData = JSON.parse(fs.readFileSync(SEO_CAMPAIGNS_FILE, 'utf8'));
    const casinosData = JSON.parse(fs.readFileSync(CASINOS_FILE, 'utf8'));
    
    console.log(`✅ Found ${campaignsData.campaigns.length} campaigns`);
    console.log(`✅ Found ${casinosData.length} casinos in database`);

    // Process campaigns to extract affiliate data
    console.log('🔄 Processing campaigns...');
    const affiliateMapping = {};
    const processedCampaigns = [];

    for (const campaign of campaignsData.campaigns) {
      if (campaign.state === 'active' && campaign.tracking_link) {
        const casinoName = extractCasinoName(campaign);
        const geoTargeting = extractGeoTargeting(campaign);
        const revenue = extractRevenue(campaign);

        const affiliateData = {
          campaignId: campaign.id,
          casinoName,
          trackingUrl: campaign.tracking_link,
          alias: campaign.alias,
          geoTargeting,
          revenue,
          campaignName: campaign.name,
          notes: campaign.notes,
          updatedAt: campaign.updated_at
        };

        // Group by casino name
        if (!affiliateMapping[casinoName]) {
          affiliateMapping[casinoName] = [];
        }
        affiliateMapping[casinoName].push(affiliateData);
        processedCampaigns.push(affiliateData);
      }
    }

    console.log(`✅ Processed ${processedCampaigns.length} active campaigns`);
    console.log(`✅ Found ${Object.keys(affiliateMapping).length} unique casinos with affiliate links`);

    // Match affiliate data to existing casinos
    console.log('🔄 Matching affiliate data to casino database...');
    const updatedCasinos = [];
    let matchedCount = 0;
    let unmatchedCasinos = [];

    for (const casino of casinosData) {
      const casinoSlug = casino.slug.toLowerCase();
      const affiliateData = affiliateMapping[casinoSlug] || 
                           affiliateMapping[casino.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')] ||
                           affiliateMapping[casino.brand.toLowerCase().replace(/\s+/g, '-')];

      if (affiliateData && affiliateData.length > 0) {
        // Select best affiliate link (prefer global or primary market)
        const bestAffiliate = affiliateData.find(a => a.geoTargeting.includes('GLOBAL')) ||
                             affiliateData.find(a => a.geoTargeting.includes('UK')) ||
                             affiliateData.find(a => a.geoTargeting.includes('US')) ||
                             affiliateData[0]; // Fallback to first

        const updatedCasino = {
          ...casino,
          affiliate: {
            trackingUrl: bestAffiliate.trackingUrl,
            campaignId: bestAffiliate.campaignId,
            revenue: bestAffiliate.revenue,
            geoTargeting: bestAffiliate.geoTargeting,
            allCampaigns: affiliateData,
            lastUpdated: new Date().toISOString()
          }
        };

        updatedCasinos.push(updatedCasino);
        matchedCount++;
      } else {
        // Keep casino without affiliate data (will use fallback URL)
        updatedCasinos.push({
          ...casino,
          affiliate: null
        });
        unmatchedCasinos.push(casinoSlug);
      }
    }

    console.log(`✅ Matched ${matchedCount} casinos with affiliate links`);
    console.log(`⚠️  ${unmatchedCasinos.length} casinos without affiliate matches:`, unmatchedCasinos.slice(0, 10));

    // Write updated casino data
    console.log('💾 Writing updated casino database...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedCasinos, null, 2));
    fs.writeFileSync(AFFILIATE_MAPPING_FILE, JSON.stringify({
      totalCampaigns: processedCampaigns.length,
      uniqueCasinos: Object.keys(affiliateMapping).length,
      mappings: affiliateMapping,
      unmatchedCasinos,
      lastUpdated: new Date().toISOString()
    }, null, 2));

    // Replace original file
    fs.copyFileSync(OUTPUT_FILE, CASINOS_FILE);

    // Generate summary report
    const report = {
      totalCampaigns: campaignsData.campaigns.length,
      activeCampaigns: processedCampaigns.length,
      totalCasinos: casinosData.length,
      matchedCasinos: matchedCount,
      unmatchedCasinos: unmatchedCasinos.length,
      affiliateRevenue: processedCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
      topAffiliates: Object.entries(affiliateMapping)
        .map(([name, campaigns]) => ({
          casino: name,
          campaigns: campaigns.length,
          revenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    };

    console.log('\n🎉 AFFILIATE INTEGRATION COMPLETE!');
    console.log('📊 Summary Report:');
    console.log(`   Total Campaigns: ${report.totalCampaigns}`);
    console.log(`   Active Campaigns: ${report.activeCampaigns}`);
    console.log(`   Total Casinos: ${report.totalCasinos}`);
    console.log(`   Matched with Affiliates: ${report.matchedCasinos}`);
    console.log(`   Unmatched: ${report.unmatchedCasinos}`);
    console.log(`   Total Affiliate Revenue: €${report.affiliateRevenue}`);
    console.log('\n🏆 Top Affiliate Partners:');
    report.topAffiliates.forEach((partner, i) => {
      console.log(`   ${i + 1}. ${partner.casino} - ${partner.campaigns} campaigns, €${partner.revenue}`);
    });

    return {
      success: true,
      report,
      updatedFile: CASINOS_FILE
    };

  } catch (error) {
    console.error('❌ Error processing affiliate data:', error);
    return { success: false, error: error.message };
  }
}

// Run the processor
processAffiliateData()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Affiliate integration completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Affiliate integration failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });