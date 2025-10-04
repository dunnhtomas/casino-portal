#!/usr/bin/env node

/**
 * 🎰 CASINO LOGO COLLECTION & CLEANUP SYSTEM
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
   * Generate logo extraction URLs for each casino
   */
  generateCasinoLogoExtractionPlan() {
    console.log('\n🎯 STEP 3: Planning real logo extraction...');
    
    const extractionPlan = this.casinos.map(casino => {
      // Generate potential logo extraction URLs
      const urls = [
        casino.url, // Main homepage
        `${casino.url}/about`,
        `${casino.url}/about-us`,
        `${casino.url}/press`,
        `${casino.url}/media`
      ].filter(url => url && url.startsWith('http'));
      
      return {
        casino: casino,
        extractionUrls: urls,
        expectedLogoFile: `${casino.slug}.png`,
        priority: this.calculateCasinoPriority(casino)
      };
    });
    
    // Sort by priority (most important casinos first)
    extractionPlan.sort((a, b) => b.priority - a.priority);
    
    console.log(`📋 Created extraction plan for ${extractionPlan.length} casinos`);
    console.log('🏆 Top priority casinos:', extractionPlan.slice(0, 5).map(p => p.casino.brand).join(', '));
    
    return extractionPlan;
  }

  /**
   * Calculate casino priority for logo extraction
   */
  calculateCasinoPriority(casino) {
    let priority = 50; // Base priority
    
    // Higher priority for popular casinos
    const popularTerms = ['bet', 'casino', 'spin', 'lucky', 'royal', 'king'];
    if (popularTerms.some(term => casino.brand.toLowerCase().includes(term))) {
      priority += 20;
    }
    
    // Higher priority for .com domains
    if (casino.url && casino.url.includes('.com')) {
      priority += 15;
    }
    
    // Lower priority for regional variants
    if (casino.slug.includes('-v2') || casino.slug.includes('-uk') || casino.slug.includes('-es')) {
      priority -= 10;
    }
    
    return priority;
  }

  /**
   * Save extraction plan for MCP tools
   */
  saveExtractionPlan(extractionPlan) {
    const planFile = path.join(this.projectRoot, 'logo-extraction-plan.json');
    const planData = {
      totalCasinos: extractionPlan.length,
      generatedAt: new Date().toISOString(),
      extractionPlan: extractionPlan.slice(0, 20) // Top 20 priority casinos
    };
    
    fs.writeFileSync(planFile, JSON.stringify(planData, null, 2));
    console.log(`💾 Saved extraction plan: ${planFile}`);
    console.log(`🎯 Ready to extract logos for top ${planData.extractionPlan.length} casinos`);
    
    return planData;
  }

  /**
   * Generate MCP commands for logo extraction
   */
  generateMCPCommands(extractionPlan) {
    console.log('\n⚡ STEP 4: Generating MCP extraction commands...');
    
    const commands = [];
    
    // Firecrawl extraction command
    const urlsToExtract = extractionPlan.slice(0, 10).map(plan => plan.extractionUrls[0]);
    
    commands.push({
      tool: 'firecrawl_extract',
      description: 'Extract logo URLs from casino homepages',
      parameters: {
        urls: urlsToExtract,
        prompt: 'Extract the main casino logo image URL. Look for <img> tags with src attributes that contain logo images, usually in the header or navigation area.',
        schema: {
          type: 'object',
          properties: {
            logoUrl: { type: 'string', description: 'Direct URL to the main casino logo image' },
            logoAlt: { type: 'string', description: 'Alt text of the logo image' },
            logoSize: { type: 'string', description: 'Dimensions if available' },
            casinoName: { type: 'string', description: 'Casino name from the page' }
          },
          required: ['logoUrl']
        }
      }
    });
    
    console.log(`🔧 Generated ${commands.length} MCP commands`);
    console.log(`🎯 Ready to extract logos from ${urlsToExtract.length} casino websites`);
    
    return commands;
  }

  /**
   * Save comprehensive results
   */
  saveResults(extractionPlan) {
    this.results.endTime = new Date().toISOString();
    this.results.extractionPlan = extractionPlan.slice(0, 20);
    
    const resultsFile = path.join(this.projectRoot, 'logo-cleanup-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 CLEANUP SUMMARY');
    console.log('==================');
    console.log(`🎰 Total casinos: ${this.results.totalCasinos}`);
    console.log(`❌ Wrong logos removed: ${this.results.wrongLogosRemoved}`);
    console.log(`🎯 Casinos ready for logo extraction: ${extractionPlan.length}`);
    console.log(`💾 Results saved: ${resultsFile}`);
    
    if (this.results.errors.length > 0) {
      console.log(`\n⚠️ Errors encountered: ${this.results.errors.length}`);
      this.results.errors.forEach(error => console.log(`   ${error}`));
    }
  }

  /**
   * Execute the complete cleanup and preparation process
   */
  async execute() {
    try {
      console.log('🚀 Starting casino logo cleanup and extraction preparation...\n');
      
      // Step 1: Identify wrong logos
      const wrongLogos = this.identifyWrongLogos();
      
      // Step 2: Remove wrong logos (with backup)
      this.removeWrongLogos(wrongLogos);
      
      // Step 3: Plan real logo extraction
      const extractionPlan = this.generateCasinoLogoExtractionPlan();
      
      // Step 4: Save extraction plan
      const planData = this.saveExtractionPlan(extractionPlan);
      
      // Step 5: Generate MCP commands
      const mcpCommands = this.generateMCPCommands(extractionPlan);
      
      // Step 6: Save results
      this.saveResults(extractionPlan);
      
      console.log('\n🎉 CLEANUP COMPLETE!');
      console.log('Next steps:');
      console.log('1. ✅ Wrong logos removed and backed up');
      console.log('2. 🎯 Extraction plan created for real logos');
      console.log('3. ⚡ Ready to execute MCP logo extraction');
      console.log('\nUse the generated extraction plan with Firecrawl MCP to collect real casino logos!');
      
      return {
        success: true,
        wrongLogosRemoved: this.results.wrongLogosRemoved,
        extractionPlan: planData,
        mcpCommands: mcpCommands
      };
      
    } catch (error) {
      console.error('❌ Critical error:', error.message);
      this.results.errors.push(`Critical error: ${error.message}`);
      this.saveResults([]);
      return { success: false, error: error.message };
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const system = new CasinoLogoCleanupSystem();
  system.execute().then(result => {
    if (result.success) {
      console.log('\n🎰 Casino logo cleanup system completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Casino logo cleanup system failed:', result.error);
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = CasinoLogoCleanupSystem;