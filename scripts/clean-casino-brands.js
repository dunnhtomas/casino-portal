#!/usr/bin/env node

/**
 * Casino Brand Name Cleaner
 * Analyzes and cleans casino brand names in our data
 */

const fs = require('fs').promises;
const path = require('path');

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');

class CasinoBrandCleaner {
  constructor() {
    this.casinos = [];
    this.problemBrands = [];
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

  analyzeBrandNames() {
    console.log('🔍 Analyzing brand names for issues...\n');

    this.casinos.forEach((casino, index) => {
      const brand = casino.brand;
      const slug = casino.slug;
      
      // Patterns that indicate problematic naming
      const hasExtension = /(-uk|-us|-ca|-de|-v2|-v3|-hb|\.com|\.net|\.co\.uk)$/i.test(brand);
      const hasVersion = /\s+(v2|v3|version\s*\d|hb)$/i.test(brand);
      const hasCountryCode = /\s+(uk|us|ca|de|fr|it|es)$/i.test(brand);
      const hasDomainExtension = /\.(com|net|org|co\.uk)$/i.test(brand);
      const hasSpecialSuffix = /\s+(casino|bet|gaming|slots)$/i.test(brand);

      if (hasExtension || hasVersion || hasCountryCode || hasDomainExtension) {
        // Suggest cleaned version
        const cleanedBrand = this.cleanBrandName(brand);
        
        this.problemBrands.push({
          index,
          slug,
          originalBrand: brand,
          suggestedBrand: cleanedBrand,
          issues: [
            hasExtension && 'Has extension suffix',
            hasVersion && 'Has version suffix', 
            hasCountryCode && 'Has country code',
            hasDomainExtension && 'Has domain extension'
          ].filter(Boolean)
        });
      }
    });

    console.log(`⚠️  Found ${this.problemBrands.length} brands with potential issues:\n`);
    
    this.problemBrands.forEach(problem => {
      console.log(`• ${problem.originalBrand} → ${problem.suggestedBrand}`);
      console.log(`  Slug: ${problem.slug}`);
      console.log(`  Issues: ${problem.issues.join(', ')}`);
      console.log('');
    });
  }

  cleanBrandName(brand) {
    return brand
      // Remove country codes
      .replace(/\s+(uk|us|ca|de|fr|it|es)$/i, '')
      // Remove version suffixes
      .replace(/\s+(v2|v3|version\s*\d+|hb|hb-v2)$/i, '')
      // Remove domain extensions
      .replace(/\.(com|net|org|co\.uk)$/i, '')
      // Remove dash suffixes
      .replace(/(-uk|-us|-ca|-de|-v2|-v3|-hb)$/i, '')
      // Clean up extra spaces and normalize
      .replace(/\s+/g, ' ')
      .trim();
  }

  async generateCleanedData() {
    console.log('🧹 Generating cleaned casino data...\n');

    const cleanedCasinos = this.casinos.map(casino => {
      const cleanedBrand = this.cleanBrandName(casino.brand);
      const needsCleaning = cleanedBrand !== casino.brand;

      if (needsCleaning) {
        console.log(`✅ Cleaned: "${casino.brand}" → "${cleanedBrand}"`);
      }

      return {
        ...casino,
        brand: cleanedBrand,
        originalBrand: needsCleaning ? casino.brand : undefined // Keep original for reference
      };
    });

    // Save cleaned data
    const backupFile = CASINOS_FILE.replace('.json', '-backup.json');
    const cleanedFile = CASINOS_FILE.replace('.json', '-cleaned.json');

    // Create backup of original
    await fs.copyFile(CASINOS_FILE, backupFile);
    console.log(`💾 Backup saved to: ${path.basename(backupFile)}`);

    // Save cleaned version
    await fs.writeFile(cleanedFile, JSON.stringify(cleanedCasinos, null, 2));
    console.log(`💾 Cleaned data saved to: ${path.basename(cleanedFile)}`);

    return cleanedCasinos;
  }

  async generateBrandList() {
    const cleanedCasinos = await this.generateCleanedData();
    
    // Extract just the brand names for easy reference
    const brandList = cleanedCasinos.map(casino => ({
      slug: casino.slug,
      brand: casino.brand,
      url: casino.url,
      originalBrand: casino.originalBrand
    }));

    // Save brand list
    const brandListFile = path.join(__dirname, '..', 'data', 'casino-brands-clean.json');
    await fs.writeFile(brandListFile, JSON.stringify(brandList, null, 2));
    console.log(`📝 Clean brand list saved to: ${path.basename(brandListFile)}`);

    return brandList;
  }

  generateReport() {
    const totalCasinos = this.casinos.length;
    const problematicCasinos = this.problemBrands.length;
    const cleanCasinos = totalCasinos - problematicCasinos;

    console.log('\n🏆 BRAND ANALYSIS REPORT');
    console.log('========================');
    console.log(`📊 Total casinos: ${totalCasinos}`);
    console.log(`✅ Clean brands: ${cleanCasinos}`);
    console.log(`⚠️  Problematic brands: ${problematicCasinos}`);
    console.log(`📈 Clean percentage: ${((cleanCasinos / totalCasinos) * 100).toFixed(1)}%`);

    if (problematicCasinos > 0) {
      console.log('\n🔧 Brands that were cleaned:');
      this.problemBrands.forEach(problem => {
        console.log(`  • ${problem.originalBrand} → ${problem.suggestedBrand}`);
      });
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Review the cleaned brands in casino-brands-clean.json');
    console.log('2. If satisfied, replace original casinos.json with cleaned version');
    console.log('3. Run the AskGamblers targeted scraper with clean brand names');
  }
}

async function main() {
  console.log('🎰 Casino Brand Name Cleaner');
  console.log('=============================\n');

  const cleaner = new CasinoBrandCleaner();
  
  const loaded = await cleaner.loadCasinos();
  if (!loaded) {
    process.exit(1);
  }

  cleaner.analyzeBrandNames();
  await cleaner.generateBrandList();
  cleaner.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CasinoBrandCleaner };