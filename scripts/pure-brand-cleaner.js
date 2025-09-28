#!/usr/bin/env node

/**
 * Advanced Casino Brand Cleaner
 * Removes ALL extensions, country codes, and version suffixes to get pure brand names
 */

const fs = require('fs').promises;
const path = require('path');

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');

class AdvancedBrandCleaner {
  constructor() {
    this.casinos = [];
    this.cleanedBrands = [];
  }

  async loadCasinos() {
    try {
      const data = await fs.readFile(CASINOS_FILE, 'utf8');
      this.casinos = JSON.parse(data);
      console.log(`📊 Loaded ${this.casinos.length} casinos\n`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load casino data:', error.message);
      return false;
    }
  }

  cleanBrandNameAggressively(brand) {
    return brand
      // Remove ALL country codes (comprehensive list)
      .replace(/\s+(uk|us|ca|au|nz|de|fr|it|es|nl|se|no|dk|fi|be|at|ch|gr|pl|cz|hu|sk|ro|bg|hr|si|ee|lv|lt|mt|cy|ie|pt|lu|is|li|ad|mc|sm|va|gi)$/gi, '')
      
      // Remove ALL version suffixes and technical identifiers
      .replace(/\s+(v2|v3|v4|version\s*\d+|hb|hb-v2|beta|alpha|pro|plus|premium|lite|mobile|app)$/gi, '')
      
      // Remove domain extensions
      .replace(/\.(com|net|org|co\.uk|co\.ca|co\.au|de|fr|it|es|nl|se|no|dk|fi|be|at|ch|gr|pl|casino|bet|gaming|slots)$/gi, '')
      
      // Remove dash/underscore suffixes with country codes or versions
      .replace(/(-uk|-us|-ca|-au|-de|-fr|-it|-es|-nl|-se|-no|-dk|-fi|-be|-at|-ch|-gr|-pl|-v2|-v3|-v4|-hb|-beta|-alpha|-pro|-mobile)$/gi, '')
      
      // Remove common casino suffixes that aren't part of brand
      .replace(/\s+(casino|bet|betting|gaming|slots|poker|sports)$/gi, '')
      
      // Remove extra whitespace and normalize
      .replace(/\s+/g, ' ')
      .trim();
  }

  async generatePureBrands() {
    console.log('🧹 Generating PURE brand names (no extensions, country codes, or suffixes)...\n');

    const pureCasinos = this.casinos.map((casino, index) => {
      const originalBrand = casino.brand;
      const pureBrand = this.cleanBrandNameAggressively(originalBrand);
      const wasChanged = pureBrand !== originalBrand;

      if (wasChanged) {
        console.log(`✅ ${index + 1}. "${originalBrand}" → "${pureBrand}"`);
      } else {
        console.log(`   ${index + 1}. "${originalBrand}" (no change needed)`);
      }

      return {
        ...casino,
        brand: pureBrand,
        originalBrand: wasChanged ? originalBrand : undefined,
        searchableBrand: pureBrand.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      };
    });

    // Save pure brand data
    const pureFile = path.join(__dirname, '..', 'data', 'casinos-pure-brands.json');
    await fs.writeFile(pureFile, JSON.stringify(pureCasinos, null, 2));
    console.log(`\n💾 Pure brand data saved to: ${path.basename(pureFile)}`);

    // Generate searchable brand list for AskGamblers matching
    const searchableBrands = pureCasinos.map(casino => ({
      slug: casino.slug,
      originalBrand: casino.originalBrand || casino.brand,
      pureBrand: casino.brand,
      searchableBrand: casino.searchableBrand,
      url: casino.url,
      // Alternative search terms
      searchTerms: [
        casino.brand.toLowerCase(),
        casino.brand.toLowerCase().replace(/[^a-z0-9]/g, ''),
        casino.slug,
        casino.url.replace('https://www.', '').replace('https://', '').split('.')[0]
      ].filter(term => term && term.length > 2)
    }));

    const searchableFile = path.join(__dirname, '..', 'data', 'casino-search-terms.json');
    await fs.writeFile(searchableFile, JSON.stringify(searchableBrands, null, 2));
    console.log(`💾 Searchable brands saved to: ${path.basename(searchableFile)}`);

    return { pureCasinos, searchableBrands };
  }

  generateReport(pureCasinos) {
    const totalCasinos = this.casinos.length;
    const changedBrands = pureCasinos.filter(casino => casino.originalBrand).length;
    const unchangedBrands = totalCasinos - changedBrands;

    console.log('\n🏆 PURE BRAND CLEANING REPORT');
    console.log('==============================');
    console.log(`📊 Total casinos: ${totalCasinos}`);
    console.log(`🧹 Brands cleaned: ${changedBrands}`);
    console.log(`✅ Already clean: ${unchangedBrands}`);
    console.log(`📈 Cleaned percentage: ${((changedBrands / totalCasinos) * 100).toFixed(1)}%`);

    console.log('\n🎯 PURE BRAND EXAMPLES:');
    console.log('=======================');
    pureCasinos.slice(0, 10).forEach(casino => {
      if (casino.originalBrand) {
        console.log(`• ${casino.originalBrand} → ${casino.brand}`);
      } else {
        console.log(`• ${casino.brand} (already clean)`);
      }
    });

    console.log('\n🚀 READY FOR TARGETED SCRAPING:');
    console.log('================================');
    console.log('✅ Pure brand names generated');
    console.log('✅ Search terms created for matching');
    console.log('✅ Ready to search AskGamblers specifically for YOUR 79 casinos');
    
    console.log('\n📝 Files created:');
    console.log('• casinos-pure-brands.json - Clean casino data');
    console.log('• casino-search-terms.json - Search terms for scraping');
  }
}

async function main() {
  console.log('🎰 Advanced Casino Brand Cleaner - Pure Brand Names');
  console.log('====================================================\n');

  const cleaner = new AdvancedBrandCleaner();
  
  const loaded = await cleaner.loadCasinos();
  if (!loaded) {
    process.exit(1);
  }

  const { pureCasinos } = await cleaner.generatePureBrands();
  cleaner.generateReport(pureCasinos);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdvancedBrandCleaner };