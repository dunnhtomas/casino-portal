#!/usr/bin/env node

/**
 * Final Pure Brand Cleaner
 * Creates the cleanest possible brand names for AskGamblers matching
 */

const fs = require('fs').promises;
const path = require('path');

async function createFinalPureBrands() {
  console.log('🎰 Final Pure Brand Cleaner - Ultimate Clean Names');
  console.log('===================================================\n');

  // Load original casino data
  const casinosData = await fs.readFile(path.join(__dirname, '..', 'data', 'casinos.json'), 'utf8');
  const casinos = JSON.parse(casinosData);

  console.log(`📊 Processing ${casinos.length} casinos for ULTIMATE brand cleaning...\n`);

  const finalCleanCasinos = casinos.map((casino, index) => {
    const originalBrand = casino.brand;
    
    // Ultimate cleaning - remove EVERYTHING except core brand name
    let ultraPureBrand = originalBrand
      // Remove ALL country codes (comprehensive)
      .replace(/\s+(uk|us|ca|au|nz|de|fr|it|es|nl|se|no|dk|fi|be|at|ch|gr|pl|cz|hu|sk|ro|bg|hr|si|ee|lv|lt|mt|cy|ie|pt|lu|is|li|ad|mc|sm|va|gi|br|ar|mx|cl|pe|co|ve|ec|uy|py|bo|gw|sr|gy|fk|gf|pf|nc|vu|fm|pw|mh|ki|tv|nr|tk|cc|cx)$/gi, '')
      
      // Remove ALL versions, technical suffixes
      .replace(/\s+(v2|v3|v4|v5|version\s*\d+|hb|hb-v2|hb-v3|beta|alpha|pro|plus|premium|lite|mobile|app|new|old|classic|deluxe|super|mega|ultra|max|mini)$/gi, '')
      
      // Remove ALL domain extensions
      .replace(/\.(com|net|org|co\.uk|co\.ca|co\.au|de|fr|it|es|nl|se|no|dk|fi|be|at|ch|gr|pl|casino|bet|gaming|slots|poker|bingo)$/gi, '')
      
      // Remove ALL dash/underscore technical suffixes
      .replace(/(-uk|-us|-ca|-au|-nz|-de|-fr|-it|-es|-nl|-se|-no|-dk|-fi|-be|-at|-ch|-gr|-pl|-cz|-hu|-sk|-v2|-v3|-v4|-v5|-hb|-beta|-alpha|-pro|-mobile|-app|-new|-old)$/gi, '')
      
      // Remove common casino/betting suffixes that aren't part of core brand
      .replace(/\s+(casino|bet|betting|gaming|slots|poker|bingo|sports|spin|spins|win|wins|luck|lucky|play|games|game|club|lounge|palace|world|zone|room|house|hall|center|centre)$/gi, '')
      
      // Remove possessive forms and punctuation
      .replace(/['']s$/gi, '')
      .replace(/[^\w\s]/g, ' ')
      
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // If we cleaned too much (empty or too short), use a fallback
    if (!ultraPureBrand || ultraPureBrand.length < 2) {
      // Fallback: just remove technical suffixes but keep main name
      ultraPureBrand = originalBrand
        .replace(/\s+(v2|v3|hb|hb-v2)$/gi, '')
        .replace(/(-v2|-v3|-hb|-uk|-us|-de|-fr|-es)$/gi, '')
        .replace(/\s+(casino|bet)$/gi, '')
        .trim();
    }

    const wasChanged = ultraPureBrand !== originalBrand;
    
    if (wasChanged) {
      console.log(`✅ ${index + 1}. "${originalBrand}" → "${ultraPureBrand}"`);
    } else {
      console.log(`   ${index + 1}. "${originalBrand}" (no change)`);
    }

    // Generate multiple search variations for AskGamblers matching
    const searchVariations = [
      ultraPureBrand.toLowerCase(),
      ultraPureBrand.toLowerCase().replace(/\s+/g, ''),
      ultraPureBrand.toLowerCase().replace(/[^a-z0-9]/g, ''),
      casino.slug,
      casino.url.replace('https://www.', '').replace('https://', '').split('.')[0],
      originalBrand.toLowerCase() // Keep original as backup
    ]
    .filter((term, index, array) => term && term.length > 1 && array.indexOf(term) === index) // Remove duplicates and empty
    .slice(0, 5); // Keep top 5 variations

    return {
      ...casino,
      brand: ultraPureBrand,
      originalBrand: wasChanged ? originalBrand : undefined,
      searchVariations: searchVariations,
      // For debugging/verification
      cleaningSteps: {
        original: originalBrand,
        final: ultraPureBrand,
        changed: wasChanged
      }
    };
  });

  // Save the final clean data
  const finalFile = path.join(__dirname, '..', 'data', 'casinos-final-clean.json');
  await fs.writeFile(finalFile, JSON.stringify(finalCleanCasinos, null, 2));
  console.log(`\n💾 Final clean data saved to: ${path.basename(finalFile)}`);

  // Create a simple search list for the targeted scraper
  const searchList = finalCleanCasinos.map(casino => ({
    slug: casino.slug,
    brand: casino.brand,
    originalBrand: casino.originalBrand || casino.brand,
    searchVariations: casino.searchVariations,
    url: casino.url
  }));

  const searchListFile = path.join(__dirname, '..', 'data', 'casino-search-list.json');
  await fs.writeFile(searchListFile, JSON.stringify(searchList, null, 2));
  console.log(`💾 Search list saved to: ${path.basename(searchListFile)}`);

  // Generate final report
  const totalCasinos = casinos.length;
  const changedBrands = finalCleanCasinos.filter(casino => casino.originalBrand).length;
  
  console.log('\n🏆 FINAL CLEANING REPORT');
  console.log('========================');
  console.log(`📊 Total casinos: ${totalCasinos}`);
  console.log(`🧹 Brands cleaned: ${changedBrands}`);
  console.log(`✅ Already clean: ${totalCasinos - changedBrands}`);
  console.log(`📈 Cleaned percentage: ${((changedBrands / totalCasinos) * 100).toFixed(1)}%`);

  console.log('\n🎯 SAMPLE PURE BRANDS (first 15):');
  console.log('=================================');
  finalCleanCasinos.slice(0, 15).forEach((casino, i) => {
    if (casino.originalBrand) {
      console.log(`${i+1}. "${casino.originalBrand}" → "${casino.brand}"`);
    } else {
      console.log(`${i+1}. "${casino.brand}" (already pure)`);
    }
  });

  console.log('\n🔍 SEARCH VARIATIONS EXAMPLE:');
  console.log('=============================');
  const exampleCasino = finalCleanCasinos[0];
  console.log(`Brand: "${exampleCasino.brand}"`);
  console.log(`Search terms: ${exampleCasino.searchVariations.join(', ')}`);

  console.log('\n🚀 READY FOR TARGETED ASKGAMBLERS SCRAPING!');
  console.log('============================================');
  console.log('✅ Ultra-pure brand names created');
  console.log('✅ Multiple search variations per brand');
  console.log('✅ Ready to find your specific 79 casinos on AskGamblers');
  console.log('\n📝 Next step: Run the targeted AskGamblers scraper');
}

if (require.main === module) {
  createFinalPureBrands().catch(console.error);
}