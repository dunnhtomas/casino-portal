/**
 * 🎰 CASINO LOGO COLLECTION & CLEANUP SYSTEM (CommonJS)
 * Finds real casino logos and removes wrong ones using MCP tools
 * Date: October 2, 2025
 */

const fs = require('fs');
const path = require('path');

class CasinoLogoCleanupSystem {
  constructor() {
    this.projectRoot = path.resolve(__dirname);
    this.logosDir = path.join(this.projectRoot, 'public', 'images', 'casinos');
    this.casinoDataFile = path.join(this.projectRoot, 'data', 'casino-search-list.json');
    
    // Load casino database
    this.casinos = JSON.parse(fs.readFileSync(this.casinoDataFile, 'utf8'));
    
    // Results tracking
    this.results = {
      totalCasinos: this.casinos.length,
      wrongLogosRemoved: 0,
      realLogosFound: 0,
      realLogosDownloaded: 0,
      errors: [],
      processingLog: [],
      startTime: new Date().toISOString()
    };
    
    console.log('🎰 CASINO LOGO COLLECTION & CLEANUP SYSTEM');
    console.log('==========================================');
    console.log(`📊 Loaded ${this.casinos.length} casinos from database`);
    console.log(`📁 Logo directory: ${this.logosDir}`);
  }

  /**
   * Identify wrong/non-casino logos that should be removed
   */
  identifyWrongLogos() {
    console.log('\n🔍 STEP 1: Identifying wrong logos...');
    
    if (!fs.existsSync(this.logosDir)) {
      console.log('❌ Logo directory does not exist');
      return [];
    }

    const allFiles = fs.readdirSync(this.logosDir);
    const casinoSlugs = new Set(this.casinos.map(c => c.slug));
    
    // Categories of wrong logos to remove
    const wrongLogos = [];
    
    allFiles.forEach(file => {
      const fileName = file.toLowerCase();
      const baseSlug = fileName.replace(/\.(png|jpg|jpeg|svg|avif|webp|ico)$/, '')
                               .replace(/-\d+w$/, '') // Remove responsive suffixes
                               .replace(/-\d+x\d+$/, '') // Remove size suffixes
                               .replace(/-logo$/, '')
                               .replace(/-geo$/, '');
      
      // 1. Test/temp files
      if (fileName.includes('test-') || 
          fileName.includes('temp-') ||
          fileName === 'test-logo.png' ||
          fileName === 'test-github-logo.png') {
        wrongLogos.push({ file, reason: 'Test/temporary file', category: 'test' });
        return;
      }
      
      // 2. Social media logos (not casino logos)
      if (fileName.includes('facebook') || 
          fileName.includes('instagram') || 
          fileName.includes('youtube') || 
          fileName.includes('tik-tok') || 
          fileName.includes('askgamblers-x')) {
        wrongLogos.push({ file, reason: 'Social media logo', category: 'social' });
        return;
      }
      
      // 3. Article/content images (not logos)
      if (fileName.includes('benefits-of-') || 
          fileName.includes('how-to-') ||
          fileName.includes('dmca') ||
          fileName.includes('egr-logo') ||
          fileName.includes('sbc-awards') ||
          fileName.includes('sigma-awards') ||
          fileName.includes('useravatar')) {
        wrongLogos.push({ file, reason: 'Content/article image', category: 'content' });
        return;
      }
      
      // 4. Generic/branding files
      if (fileName.includes('best-casino-') || 
          fileName.includes('affiliate-logo') ||
          fileName.includes('website-logo') ||
          fileName === 'default-casino.svg') {
        wrongLogos.push({ file, reason: 'Generic branding file', category: 'branding' });
        return;
      }
      
      // 5. Non-casino logos that don't match any casino
      if (!casinoSlugs.has(baseSlug) && 
          !fileName.includes('-1200w') && 
          !fileName.includes('-800w') && 
          !fileName.includes('-400w')) {
        // Check if it's a base casino file by testing variations
        const possibleSlugs = [
          baseSlug,
          baseSlug.replace(/-v2$/, ''),
          baseSlug.replace(/-uk$/, ''),
          baseSlug.replace(/-es$/, ''),
          baseSlug.replace(/-de$/, ''),
          baseSlug.replace(/-casino$/, ''),
          baseSlug.replace(/casino-/, ''),
          baseSlug.replace(/-\d+$/, '')
        ];
        
        const matchesAnyCasino = possibleSlugs.some(slug => casinoSlugs.has(slug));
        
        if (!matchesAnyCasino) {
          wrongLogos.push({ file, reason: 'No matching casino found', category: 'orphan' });
        }
      }
    });
    
    // Summary by category
    const categories = wrongLogos.reduce((acc, logo) => {
      acc[logo.category] = (acc[logo.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Found ${wrongLogos.length} wrong logos:`);
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} files`);
    });
    
    this.results.wrongLogosIdentified = wrongLogos;
    return wrongLogos;
  }

  /**
   * Remove wrong logos (backup first)
   */
  removeWrongLogos(wrongLogos) {
    console.log('\n🗑️ STEP 2: Removing wrong logos...');
    
    if (wrongLogos.length === 0) {
      console.log('✅ No wrong logos to remove');
      return;
    }
    
    // Create backup directory
    const backupDir = path.join(this.projectRoot, 'backup-logos-' + Date.now());
    fs.mkdirSync(backupDir, { recursive: true });
    
    let removed = 0;
    wrongLogos.forEach(({ file, reason, category }) => {
      try {
        const sourcePath = path.join(this.logosDir, file);
        const backupPath = path.join(backupDir, file);
        
        if (fs.existsSync(sourcePath)) {
          // Backup first
          fs.copyFileSync(sourcePath, backupPath);
          // Then remove
          fs.unlinkSync(sourcePath);
          removed++;
          console.log(`   ❌ Removed: ${file} (${reason})`);
          
          this.results.processingLog.push({
            action: 'removed',
            file: file,
            reason: reason,
            category: category,
            backedUp: true
          });
        }
      } catch (error) {
        console.log(`   ⚠️ Failed to remove: ${file} - ${error.message}`);
        this.results.errors.push(`Failed to remove ${file}: ${error.message}`);
      }
    });
    
    console.log(`\n✅ Removed ${removed} wrong logos`);
    console.log(`💾 Backup created: ${backupDir}`);
    this.results.wrongLogosRemoved = removed;
  }

  /**
   * Generate casino extraction plan
   */
  generateExtractionPlan() {
    console.log('\n🎯 STEP 3: Creating logo extraction plan...');
    
    const extractionPlan = this.casinos.slice(0, 15).map((casino, index) => ({
      casino: casino,
      priority: 100 - index,
      extractionUrl: casino.url,
      expectedFile: `${casino.slug}.png`
    }));
    
    console.log(`📋 Created plan for ${extractionPlan.length} priority casinos`);
    return extractionPlan;
  }

  /**
   * Save results and extraction plan
   */
  saveResults(extractionPlan) {
    this.results.endTime = new Date().toISOString();
    this.results.extractionPlan = extractionPlan;
    
    const resultsFile = path.join(this.projectRoot, 'logo-cleanup-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    
    // Also save extraction plan separately for MCP tools
    const planFile = path.join(this.projectRoot, 'logo-extraction-plan.json');
    const planData = {
      generatedAt: new Date().toISOString(),
      totalCasinos: extractionPlan.length,
      casinos: extractionPlan
    };
    fs.writeFileSync(planFile, JSON.stringify(planData, null, 2));
    
    console.log('\n📊 CLEANUP SUMMARY');
    console.log('==================');
    console.log(`🎰 Total casinos: ${this.results.totalCasinos}`);
    console.log(`❌ Wrong logos removed: ${this.results.wrongLogosRemoved}`);
    console.log(`🎯 Casinos ready for extraction: ${extractionPlan.length}`);
    console.log(`💾 Results: ${resultsFile}`);
    console.log(`💾 Extraction plan: ${planFile}`);
    
    return planData;
  }

  /**
   * Execute the complete process
   */
  async execute() {
    try {
      console.log('🚀 Starting casino logo cleanup...\n');
      
      // Step 1: Identify wrong logos
      const wrongLogos = this.identifyWrongLogos();
      
      // Step 2: Remove wrong logos
      this.removeWrongLogos(wrongLogos);
      
      // Step 3: Create extraction plan
      const extractionPlan = this.generateExtractionPlan();
      
      // Step 4: Save results
      const planData = this.saveResults(extractionPlan);
      
      console.log('\n🎉 CLEANUP COMPLETE!');
      console.log('✅ Ready for real logo extraction using MCP tools');
      
      return { success: true, plan: planData };
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Execute
const system = new CasinoLogoCleanupSystem();
system.execute().then(result => {
  if (result.success) {
    console.log('\n🎰 Casino logo cleanup completed successfully!');
  } else {
    console.error('❌ Cleanup failed:', result.error);
  }
}).catch(console.error);