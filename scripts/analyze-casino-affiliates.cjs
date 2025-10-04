/**
 * Casino Affiliate Links Analysis and Update Preparation
 * Analyzes current state and prepares for complete affiliate link update
 */

const fs = require('fs');

function analyzeCasinoAffiliateStatus() {
  console.log('🔍 Analyzing Casino Affiliate Status...\n');
  
  try {
    const casinosData = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
    
    console.log(`📊 Total Casinos: ${casinosData.length}`);
    
    // Categorize casinos
    const withAffiliates = casinosData.filter(c => c.affiliate && c.affiliate.trackingUrl);
    const withNullAffiliates = casinosData.filter(c => c.affiliate === null);
    const withoutAffiliateField = casinosData.filter(c => !c.hasOwnProperty('affiliate'));
    
    console.log(`✅ With Affiliate Links: ${withAffiliates.length}`);
    console.log(`❌ With Null Affiliates: ${withNullAffiliates.length}`);
    console.log(`⚠️  Without Affiliate Field: ${withoutAffiliateField.length}`);
    
    // List casinos needing affiliate links
    console.log('\n🎯 Casinos Needing Affiliate Links:');
    const needingLinks = [...withNullAffiliates, ...withoutAffiliateField];
    
    needingLinks.forEach((casino, index) => {
      console.log(`   ${index + 1}. ${casino.slug} (${casino.brand})`);
    });
    
    // List casinos with existing affiliate links
    console.log('\n✅ Casinos With Existing Affiliate Links:');
    withAffiliates.slice(0, 10).forEach((casino, index) => {
      console.log(`   ${index + 1}. ${casino.slug} (${casino.brand})`);
      console.log(`      URL: ${casino.affiliate.trackingUrl}`);
    });
    
    if (withAffiliates.length > 10) {
      console.log(`   ... and ${withAffiliates.length - 10} more`);
    }
    
    // Generate casino slug list for easy reference
    console.log('\n📋 All Casino Slugs (for affiliate mapping):');
    const allSlugs = casinosData.map(c => c.slug).sort();
    console.log(allSlugs.join(', '));
    
    // Save analysis to file
    const analysis = {
      totalCasinos: casinosData.length,
      withAffiliates: withAffiliates.length,
      withNullAffiliates: withNullAffiliates.length,
      withoutAffiliateField: withoutAffiliateField.length,
      needingLinks: needingLinks.map(c => ({ slug: c.slug, brand: c.brand })),
      existingAffiliates: withAffiliates.map(c => ({ 
        slug: c.slug, 
        brand: c.brand, 
        trackingUrl: c.affiliate.trackingUrl 
      })),
      allSlugs: allSlugs,
      lastAnalyzed: new Date().toISOString()
    };
    
    fs.writeFileSync('data/casino_affiliate_analysis.json', JSON.stringify(analysis, null, 2));
    console.log('\n💾 Analysis saved to: data/casino_affiliate_analysis.json');
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing casino affiliate status:', error);
    return null;
  }
}

// Run analysis
const result = analyzeCasinoAffiliateStatus();
if (result) {
  console.log('\n🚀 Ready to update affiliate links!');
  console.log('📝 Please provide your affiliate links in one of these formats:');
  console.log('   1. JSON file with casino-slug: affiliate-url mappings');
  console.log('   2. CSV file with columns: casino_slug, affiliate_url');
  console.log('   3. Text file with lines like: casino-slug https://affiliate-url');
}