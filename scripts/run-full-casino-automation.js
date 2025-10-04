/**
 * Master Casino Domain Automation Script
 * Runs the complete pipeline to research and update all casino domains
 */

import { runBingDomainScraper } from './bing-casino-domain-scraper.js';
import { verifyAndUpdateDomains } from './verify-and-update-casino-domains.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🎰 FULL CASINO DOMAIN AUTOMATION PIPELINE`);
console.log(`═══════════════════════════════════════════════════════\n`);

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  console.log(`🔍 Checking prerequisites...`);
  
  const casinosFile = path.join(__dirname, '../data/casinos.json');
  if (!fs.existsSync(casinosFile)) {
    throw new Error(`Casino data file not found: ${casinosFile}`);
  }
  
  const casinos = JSON.parse(fs.readFileSync(casinosFile, 'utf8'));
  console.log(`✓ Found ${casinos.length} casino entries`);
  
  // Count unique brands
  const uniqueBrands = new Set();
  casinos.forEach(casino => uniqueBrands.add(casino.brand));
  console.log(`✓ Will research ${uniqueBrands.size} unique casino brands`);
  
  // Check if backup directory exists
  const backupDir = path.join(__dirname, '../data/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`✓ Created backup directory`);
  }
  
  return {
    totalCasinos: casinos.length,
    uniqueBrands: uniqueBrands.size
  };
}

/**
 * Create execution summary
 */
function createExecutionSummary(startTime, scrapingResults, verificationResults) {
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
  
  const summary = {
    executionDate: endTime.toISOString(),
    durationMinutes: duration,
    pipeline: {
      scraping: {
        casinosProcessed: scrapingResults?.results?.length || 0,
        totalSearchResults: scrapingResults?.results?.reduce((sum, r) => sum + r.bingResults.length, 0) || 0,
        averageResultsPerCasino: scrapingResults?.results?.length > 0 
          ? (scrapingResults.results.reduce((sum, r) => sum + r.bingResults.length, 0) / scrapingResults.results.length).toFixed(1)
          : 0
      },
      verification: {
        casinosAnalyzed: verificationResults?.verificationResults?.length || 0,
        highConfidenceResults: verificationResults?.verificationResults?.filter(r => r.confidence >= 0.7).length || 0,
        domainsUpdated: verificationResults?.updateLog?.length || 0,
        averageConfidence: verificationResults?.summary?.averageConfidence || 0
      }
    },
    files: {
      scrapedResults: 'data/bing-casino-domains-scraped.json',
      verificationResults: 'data/domain-verification-results.json',
      updateLog: 'data/domain-update-log.json',
      updatedCasinos: 'data/casinos.json'
    }
  };
  
  // Save execution summary
  const summaryFile = path.join(__dirname, '../data/automation-execution-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  return summary;
}

/**
 * Display final results
 */
function displayFinalResults(summary) {
  console.log(`\n🎯 AUTOMATION COMPLETE!`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`Execution time: ${summary.durationMinutes} minutes`);
  console.log(`\nSCRAPING RESULTS:`);
  console.log(`  Casinos processed: ${summary.pipeline.scraping.casinosProcessed}`);
  console.log(`  Total search results: ${summary.pipeline.scraping.totalSearchResults}`);
  console.log(`  Average results per casino: ${summary.pipeline.scraping.averageResultsPerCasino}`);
  
  console.log(`\nVERIFICATION RESULTS:`);
  console.log(`  Casinos analyzed: ${summary.pipeline.verification.casinosAnalyzed}`);
  console.log(`  High confidence results: ${summary.pipeline.verification.highConfidenceResults}`);
  console.log(`  Domains updated: ${summary.pipeline.verification.domainsUpdated}`);
  console.log(`  Average confidence: ${summary.pipeline.verification.averageConfidence}`);
  
  console.log(`\nOUTPUT FILES:`);
  Object.entries(summary.files).forEach(([key, file]) => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${key}: ${file} ${exists ? '✓' : '❌'}`);
  });
  
  if (summary.pipeline.verification.domainsUpdated > 0) {
    console.log(`\n📋 NEXT STEPS:`);
    console.log(`1. Review the domain update log for changes`);
    console.log(`2. Test the updated casino URLs`);
    console.log(`3. Update other data files if needed (domain research, affiliate mappings)`);
    console.log(`4. Restart your application to use new domains`);
  }
}

/**
 * Main automation function
 */
async function runFullAutomation() {
  const startTime = new Date();
  
  try {
    console.log(`🚀 Starting full casino domain automation...\n`);
    
    // Check prerequisites
    const prereqs = checkPrerequisites();
    
    console.log(`\n📋 EXECUTION PLAN:`);
    console.log(`1. Scrape Bing search results for ${prereqs.uniqueBrands} casino brands`);
    console.log(`2. Analyze and verify domain authenticity`);
    console.log(`3. Update casino data with verified domains`);
    console.log(`4. Generate comprehensive reports\n`);
    
    // Confirm execution
    console.log(`⚠️  This will process all ${prereqs.uniqueBrands} casino brands.`);
    console.log(`   Estimated time: 15-30 minutes`);
    console.log(`   Files will be automatically backed up.\n`);
    
    // Phase 1: Scraping
    console.log(`\n📡 PHASE 1: BING DOMAIN SCRAPING`);
    console.log(`${'─'.repeat(50)}`);
    
    const scrapingResults = await runBingDomainScraper();
    console.log(`✅ Scraping phase complete`);
    
    // Small delay between phases
    console.log(`\n⏳ Waiting 5 seconds before verification phase...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Phase 2: Verification and Updates
    console.log(`\n🔍 PHASE 2: DOMAIN VERIFICATION & UPDATES`);
    console.log(`${'─'.repeat(50)}`);
    
    const verificationResults = await verifyAndUpdateDomains();
    console.log(`✅ Verification phase complete`);
    
    // Phase 3: Summary and Reports
    console.log(`\n📊 PHASE 3: GENERATING REPORTS`);
    console.log(`${'─'.repeat(50)}`);
    
    const summary = createExecutionSummary(startTime, scrapingResults, verificationResults);
    displayFinalResults(summary);
    
    return {
      success: true,
      summary,
      scrapingResults,
      verificationResults
    };
    
  } catch (error) {
    console.error(`\n💥 AUTOMATION FAILED:`, error.message);
    console.error(`\nStack trace:`, error.stack);
    
    // Create error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      },
      phase: 'Unknown', // Could be enhanced to track current phase
      duration: Math.round((new Date() - startTime) / 1000 / 60)
    };
    
    const errorFile = path.join(__dirname, '../data/automation-error-report.json');
    fs.writeFileSync(errorFile, JSON.stringify(errorReport, null, 2));
    
    console.log(`\n📋 Error report saved to: ${errorFile}`);
    
    throw error;
  }
}

// Run the automation
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullAutomation()
    .then((results) => {
      console.log(`\n🏆 AUTOMATION SUCCESSFUL!`);
      console.log(`Summary saved to: data/automation-execution-summary.json`);
      
      if (results.summary.pipeline.verification.domainsUpdated > 0) {
        console.log(`\n🔄 ${results.summary.pipeline.verification.domainsUpdated} casino domains were updated!`);
      } else {
        console.log(`\n✨ All casino domains were already up to date.`);
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💀 Fatal automation error:', error.message);
      process.exit(1);
    });
}

export { runFullAutomation };