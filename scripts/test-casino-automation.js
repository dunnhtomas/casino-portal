/**
 * Test Script for Casino Domain Automation Pipeline
 * Tests both the scraper and verification scripts with a small sample
 */

import { runBingDomainScraper } from './bing-casino-domain-scraper.js';
import { verifyAndUpdateDomains } from './verify-and-update-casino-domains.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🧪 CASINO AUTOMATION PIPELINE TEST`);
console.log(`═══════════════════════════════════════════════════════\n`);

/**
 * Create test environment with limited casino data
 */
function setupTestEnvironment() {
  console.log(`📁 Setting up test environment...`);
  
  // Load original casino data
  const originalCasinos = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casinos.json'), 'utf8'));
  
  // Select first 5 unique casinos for testing
  const testCasinos = [];
  const seenBrands = new Set();
  
  for (const casino of originalCasinos) {
    if (!seenBrands.has(casino.brand) && testCasinos.length < 5) {
      seenBrands.add(casino.brand);
      testCasinos.push(casino);
    }
  }
  
  // Create test data file
  const testDataDir = path.join(__dirname, '../data/test');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  const testCasinosFile = path.join(testDataDir, 'casinos.json');
  fs.writeFileSync(testCasinosFile, JSON.stringify(testCasinos, null, 2));
  
  console.log(`✓ Created test data with ${testCasinos.length} casinos:`);
  testCasinos.forEach((casino, i) => {
    console.log(`  ${i + 1}. ${casino.brand} (${casino.url})`);
  });
  
  return {
    testDataDir,
    testCasinosFile,
    testCasinos
  };
}

/**
 * Modify scraper config for testing
 */
function createTestScraper() {
  console.log(`\n🔧 Configuring scraper for testing...`);
  
  // Read the scraper file and modify paths for testing
  const scraperContent = fs.readFileSync(path.join(__dirname, 'bing-casino-domain-scraper.js'), 'utf8');
  
  // Create test version that uses test data
  const testScraperContent = scraperContent
    .replace("'../data/casinos.json'", "'../data/test/casinos.json'")
    .replace("'../data/bing-scraping-progress.json'", "'../data/test/bing-scraping-progress.json'")
    .replace("'../data/bing-casino-domains-scraped.json'", "'../data/test/bing-casino-domains-scraped.json'")
    .replace('batchSize: 5', 'batchSize: 2')
    .replace('delayBetweenSearches: 2000', 'delayBetweenSearches: 1000');
  
  const testScraperFile = path.join(__dirname, 'test-bing-scraper.js');
  fs.writeFileSync(testScraperFile, testScraperContent);
  
  console.log(`✓ Test scraper created: ${testScraperFile}`);
  return testScraperFile;
}

/**
 * Modify verifier config for testing
 */
function createTestVerifier() {
  console.log(`🔧 Configuring verifier for testing...`);
  
  const verifierContent = fs.readFileSync(path.join(__dirname, 'verify-and-update-casino-domains.js'), 'utf8');
  
  // Create test version that uses test data
  const testVerifierContent = verifierContent
    .replace("'../data/bing-casino-domains-scraped.json'", "'../data/test/bing-casino-domains-scraped.json'")
    .replace("'../data/casinos.json'", "'../data/test/casinos.json'")
    .replace("'../data/domain-verification-results.json'", "'../data/test/domain-verification-results.json'")
    .replace("'../data/domain-update-log.json'", "'../data/test/domain-update-log.json'")
    .replace("'../data/backups'", "'../data/test/backups'")
    .replace('confidenceThreshold: 0.7', 'confidenceThreshold: 0.5'); // Lower threshold for testing
  
  const testVerifierFile = path.join(__dirname, 'test-domain-verifier.js');
  fs.writeFileSync(testVerifierFile, testVerifierContent);
  
  console.log(`✓ Test verifier created: ${testVerifierFile}`);
  return testVerifierFile;
}

/**
 * Run test scraper
 */
async function testScraper() {
  console.log(`\n🕷️  Testing Bing domain scraper...`);
  
  try {
    // Import and run the test scraper
    const { runBingDomainScraper } = await import('./test-bing-scraper.js');
    await runBingDomainScraper();
    
    // Verify output file exists
    const outputFile = path.join(__dirname, '../data/test/bing-casino-domains-scraped.json');
    if (fs.existsSync(outputFile)) {
      const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      console.log(`✅ Scraper test successful!`);
      console.log(`   Results: ${results.results.length} casinos, ${results.results.reduce((sum, r) => sum + r.bingResults.length, 0)} total search results`);
      return true;
    } else {
      console.error(`❌ Scraper test failed: Output file not created`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Scraper test failed:`, error.message);
    return false;
  }
}

/**
 * Run test verifier
 */
async function testVerifier() {
  console.log(`\n🔍 Testing domain verifier...`);
  
  try {
    // Import and run the test verifier
    const { verifyAndUpdateDomains } = await import('./test-domain-verifier.js');
    const results = await verifyAndUpdateDomains();
    
    console.log(`✅ Verifier test successful!`);
    console.log(`   Analyzed: ${results.verificationResults.length} casinos`);
    console.log(`   Updates: ${results.updateLog.length} domains`);
    console.log(`   Average confidence: ${results.summary.averageConfidence}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Verifier test failed:`, error.message);
    return false;
  }
}

/**
 * Cleanup test files
 */
function cleanupTestFiles() {
  console.log(`\n🧹 Cleaning up test files...`);
  
  const filesToClean = [
    path.join(__dirname, 'test-bing-scraper.js'),
    path.join(__dirname, 'test-domain-verifier.js')
  ];
  
  filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✓ Removed: ${path.basename(file)}`);
    }
  });
}

/**
 * Display test results
 */
function displayTestResults() {
  console.log(`\n📊 TEST RESULTS SUMMARY:`);
  console.log(`═══════════════════════════════════════════════════════`);
  
  const testDataDir = path.join(__dirname, '../data/test');
  
  // Check scraped results
  const scrapedFile = path.join(testDataDir, 'bing-casino-domains-scraped.json');
  if (fs.existsSync(scrapedFile)) {
    const scraped = JSON.parse(fs.readFileSync(scrapedFile, 'utf8'));
    console.log(`📥 Scraped Results:`);
    console.log(`   Casinos processed: ${scraped.results.length}`);
    console.log(`   Total search results: ${scraped.results.reduce((sum, r) => sum + r.bingResults.length, 0)}`);
    
    scraped.results.forEach(casino => {
      console.log(`   ${casino.brand}: ${casino.bingResults.length} results`);
    });
  }
  
  // Check verification results
  const verificationFile = path.join(testDataDir, 'domain-verification-results.json');
  if (fs.existsSync(verificationFile)) {
    const verification = JSON.parse(fs.readFileSync(verificationFile, 'utf8'));
    console.log(`\n🔍 Verification Results:`);
    console.log(`   Casinos analyzed: ${verification.results.length}`);
    console.log(`   High confidence: ${verification.results.filter(r => r.confidence >= 0.5).length}`);
    
    verification.results.forEach(result => {
      console.log(`   ${result.brand}: ${result.recommendedDomain} (${(result.confidence * 100).toFixed(1)}%)`);
    });
  }
  
  // Check update log
  const updateLogFile = path.join(testDataDir, 'domain-update-log.json');
  if (fs.existsSync(updateLogFile)) {
    const updateLog = JSON.parse(fs.readFileSync(updateLogFile, 'utf8'));
    console.log(`\n📝 Domain Updates:`);
    console.log(`   Total updates: ${updateLog.updates.length}`);
    
    updateLog.updates.forEach(update => {
      console.log(`   ${update.brand}: ${update.oldDomain} → ${update.newDomain}`);
    });
  }
}

/**
 * Main test function
 */
async function runFullTest() {
  console.log(`🚀 Starting full automation pipeline test...\n`);
  
  try {
    // Setup test environment
    const testEnv = setupTestEnvironment();
    
    // Create test versions of scripts
    createTestScraper();
    createTestVerifier();
    
    // Run tests
    const scraperSuccess = await testScraper();
    
    if (scraperSuccess) {
      const verifierSuccess = await testVerifier();
      
      if (verifierSuccess) {
        console.log(`\n✅ ALL TESTS PASSED!`);
        displayTestResults();
        
        console.log(`\n🎯 READY FOR PRODUCTION RUN!`);
        console.log(`Run the following commands to process all casinos:`);
        console.log(`1. node scripts/bing-casino-domain-scraper.js`);
        console.log(`2. node scripts/verify-and-update-casino-domains.js`);
      } else {
        console.log(`\n❌ Verifier test failed`);
      }
    } else {
      console.log(`\n❌ Scraper test failed`);
    }
    
    // Cleanup
    cleanupTestFiles();
    
  } catch (error) {
    console.error(`💥 Test failed with error:`, error);
    cleanupTestFiles();
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullTest()
    .then(() => {
      console.log(`\n🏁 Test complete!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

export { runFullTest };