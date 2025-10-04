/**
 * Casino Logo Validation Script
 * Tests all casino logos with Brandfetch API to ensure 100% loading success
 * Validates domain mappings and generates performance reports
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VALIDATION_CONFIG = {
  timeout: 10000,
  concurrency: 5, // Process 5 logos at a time
  retries: 2,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Brandfetch configuration (matches the actual config)
const BRANDFETCH_CONFIG = {
  CLIENT_ID: '1idIddY-Tpnlw76kxJR',
  BASE_URL: 'https://cdn.brandfetch.io'
};

// Domain mapping (matches the actual mapping)
const CASINO_DOMAIN_MAPPING = {
  'hello-fortune': 'hellofortune32.com',
  'ivybetio': 'fintmo8.com',
  'kings-chip': 'kingschip2.com',
  'pirate-spins': 'piratespins11.com',
  'robocat-de': 'domainmarkt.de',
  'roman-casino': 'clariki1.com',
  'royal-game': 'kingcare.zendesk.com',
  'sagaspins-uk-v2': 'sagaspins22.com',
  'slotit-de': 'bernd-hendl.com',
  'slots-islands': 'slotsislands1.com',
  'spellwin': 'spellwin.net',
  'spingranny': 'lexano8.com',
  'spinmama': 'dynara3.com',
  'vegas-nova': 'vegasnova-il.com',
  'winitbet': 'winit2.bet',
};

console.log(`🎰 CASINO LOGO VALIDATION SYSTEM`);
console.log(`═══════════════════════════════════════════════════════\n`);

/**
 * Load casino data
 */
function loadCasinoData() {
  const casinosPath = path.join(__dirname, '../data/casinos.json');
  const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));
  
  // Get unique casinos by brand
  const uniqueCasinos = [];
  const seenBrands = new Set();
  
  casinos.forEach(casino => {
    if (!seenBrands.has(casino.brand)) {
      seenBrands.add(casino.brand);
      uniqueCasinos.push(casino);
    }
  });
  
  console.log(`📊 Loaded ${uniqueCasinos.length} unique casino brands from ${casinos.length} total entries`);
  return uniqueCasinos;
}

/**
 * Generate Brandfetch logo URL (matches getBrandLogo function)
 */
function generateBrandfetchUrl(casino) {
  try {
    // Extract domain from casino URL
    const url = new URL(casino.url);
    const fallbackDomain = url.hostname.replace('www.', '');
    
    // Get verified domain (uses mapping if available)
    const verifiedDomain = CASINO_DOMAIN_MAPPING[casino.slug] || fallbackDomain;
    
    // Generate Brandfetch logo URL
    return `${BRANDFETCH_CONFIG.BASE_URL}/${verifiedDomain}?c=${BRANDFETCH_CONFIG.CLIENT_ID}`;
  } catch (error) {
    console.warn(`Failed to generate URL for ${casino.slug}:`, error.message);
    return null;
  }
}

/**
 * Test logo URL accessibility and get image info
 */
function testLogoUrl(url, timeout = VALIDATION_CONFIG.timeout) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'HEAD',
      timeout,
      headers: {
        'User-Agent': VALIDATION_CONFIG.userAgent,
        'Referer': 'https://localhost:3000/'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      const contentLength = parseInt(res.headers['content-length'] || '0');
      const contentType = res.headers['content-type'] || '';
      
      resolve({
        success: true,
        statusCode: res.statusCode,
        responseTime,
        contentLength,
        contentType,
        isImage: contentType.startsWith('image/'),
        redirected: res.url !== url,
        finalUrl: res.url || url
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: null
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        responseTime: timeout,
        statusCode: null
      });
    });
    
    req.end();
  });
}

/**
 * Test single casino logo with retries
 */
async function testCasinoLogo(casino, retries = VALIDATION_CONFIG.retries) {
  const brandfetchUrl = generateBrandfetchUrl(casino);
  
  if (!brandfetchUrl) {
    return {
      casino: casino.brand,
      slug: casino.slug,
      originalUrl: casino.url,
      brandfetchUrl: null,
      success: false,
      error: 'Failed to generate Brandfetch URL'
    };
  }
  
  // Extract domain info
  const originalDomain = new URL(casino.url).hostname.replace('www.', '');
  const mappedDomain = CASINO_DOMAIN_MAPPING[casino.slug];
  const actualDomain = mappedDomain || originalDomain;
  
  console.log(`🔍 Testing ${casino.brand}: ${actualDomain}`);
  
  let lastResult = null;
  
  // Try with retries
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const result = await testLogoUrl(brandfetchUrl);
    lastResult = result;
    
    if (result.success && result.statusCode === 200 && result.isImage) {
      console.log(`  ✅ Success: ${result.responseTime}ms, ${result.contentLength} bytes`);
      return {
        casino: casino.brand,
        slug: casino.slug,
        originalUrl: casino.url,
        originalDomain,
        mappedDomain,
        actualDomain,
        brandfetchUrl,
        success: true,
        ...result
      };
    }
    
    if (attempt <= retries) {
      console.log(`  ⚠️  Attempt ${attempt} failed (${result.error || result.statusCode}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between retries
    }
  }
  
  console.log(`  ❌ Failed: ${lastResult.error || lastResult.statusCode}`);
  return {
    casino: casino.brand,
    slug: casino.slug,
    originalUrl: casino.url,
    originalDomain,
    mappedDomain,
    actualDomain,
    brandfetchUrl,
    success: false,
    ...lastResult
  };
}

/**
 * Process casinos in batches
 */
async function processCasinosInBatches(casinos, batchSize = VALIDATION_CONFIG.concurrency) {
  const results = [];
  
  for (let i = 0; i < casinos.length; i += batchSize) {
    const batch = casinos.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(casinos.length / batchSize);
    
    console.log(`\\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} casinos):`);
    console.log(`${'─'.repeat(60)}`);
    
    // Process batch concurrently
    const batchPromises = batch.map(casino => testCasinoLogo(casino));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < casinos.length) {
      console.log(`⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const withMapping = results.filter(r => r.mappedDomain);
  
  const report = {
    timestamp: new Date().toISOString(),
    totalCasinos: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: ((successful.length / results.length) * 100).toFixed(1),
    
    performance: {
      averageResponseTime: successful.length > 0 
        ? Math.round(successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length)
        : 0,
      averageFileSize: successful.length > 0
        ? Math.round(successful.reduce((sum, r) => sum + (r.contentLength || 0), 0) / successful.length)
        : 0,
      totalDataTransferred: successful.reduce((sum, r) => sum + (r.contentLength || 0), 0)
    },
    
    domainMapping: {
      withMapping: withMapping.length,
      withoutMapping: results.length - withMapping.length,
      mappingSuccessRate: withMapping.length > 0 
        ? ((withMapping.filter(r => r.success).length / withMapping.length) * 100).toFixed(1)
        : 0
    },
    
    failures: failed.map(r => ({
      casino: r.casino,
      slug: r.slug,
      domain: r.actualDomain,
      error: r.error || r.statusCode,
      url: r.brandfetchUrl
    })),
    
    results
  };
  
  return report;
}

/**
 * Display report summary
 */
function displaySummary(report) {
  console.log(`\\n🎯 VALIDATION COMPLETE!`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`Total casinos tested: ${report.totalCasinos}`);
  console.log(`Successful: ${report.successful}/${report.totalCasinos} (${report.successRate}%)`);
  console.log(`Failed: ${report.failed}`);
  
  if (report.performance.averageResponseTime > 0) {
    console.log(`\\nPERFORMANCE METRICS:`);
    console.log(`Average response time: ${report.performance.averageResponseTime}ms`);
    console.log(`Average file size: ${(report.performance.averageFileSize / 1024).toFixed(1)}KB`);
    console.log(`Total data transferred: ${(report.performance.totalDataTransferred / 1024 / 1024).toFixed(1)}MB`);
  }
  
  console.log(`\\nDOMAIN MAPPING:`);
  console.log(`Casinos with domain mapping: ${report.domainMapping.withMapping}/${report.totalCasinos}`);
  console.log(`Mapping success rate: ${report.domainMapping.mappingSuccessRate}%`);
  
  if (report.failures.length > 0) {
    console.log(`\\n❌ FAILED LOGOS:`);
    report.failures.forEach(failure => {
      console.log(`  • ${failure.casino} (${failure.domain}): ${failure.error}`);
    });
  }
  
  if (report.successRate === '100.0') {
    console.log(`\\n🎉 PERFECT! All casino logos are loading successfully!`);
  } else if (parseFloat(report.successRate) >= 95) {
    console.log(`\\n✅ Excellent! ${report.successRate}% success rate.`);
  } else if (parseFloat(report.successRate) >= 80) {
    console.log(`\\n⚠️  Good but needs improvement: ${report.successRate}% success rate.`);
  } else {
    console.log(`\\n🚨 Needs attention: ${report.successRate}% success rate.`);
  }
}

/**
 * Main validation function
 */
async function validateCasinoLogos() {
  try {
    console.log(`🚀 Starting casino logo validation...\\n`);
    
    // Load casino data
    const casinos = loadCasinoData();
    
    console.log(`\\n🔧 CONFIGURATION:`);
    console.log(`Timeout: ${VALIDATION_CONFIG.timeout}ms`);
    console.log(`Concurrency: ${VALIDATION_CONFIG.concurrency} logos at a time`);
    console.log(`Retries: ${VALIDATION_CONFIG.retries}`);
    console.log(`Domain mappings: ${Object.keys(CASINO_DOMAIN_MAPPING).length}`);
    
    // Process all casinos
    const results = await processCasinosInBatches(casinos);
    
    // Generate and save report
    const report = generateReport(results);
    const reportPath = path.join(__dirname, '../data/logo-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    displaySummary(report);
    
    console.log(`\\n💾 Detailed report saved to: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  validateCasinoLogos()
    .then((report) => {
      console.log(`\\n🏁 Logo validation complete!`);
      
      if (report.successful === report.totalCasinos) {
        console.log(`🎯 All ${report.totalCasinos} casino logos are working perfectly!`);
      } else {
        console.log(`📋 ${report.failed} logos need attention.`);
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { validateCasinoLogos };