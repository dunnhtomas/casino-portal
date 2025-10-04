/**
 * Quick Casino Logo Test
 * Tests first 5 casino logos to validate the system works
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BRANDFETCH_CONFIG = {
  CLIENT_ID: '1idIddY-Tpnlw76kxJR',
  BASE_URL: 'https://cdn.brandfetch.io'
};

const CASINO_DOMAIN_MAPPING = {
  'spellwin': 'spellwin.net',
  'winitbet': 'winit2.bet',
  'hello-fortune': 'hellofortune32.com',
  'ivybetio': 'fintmo8.com',
  'kings-chip': 'kingschip2.com'
};

console.log(`🎰 QUICK CASINO LOGO TEST`);
console.log(`═══════════════════════════════════════════════════════\n`);

/**
 * Generate Brandfetch logo URL
 */
function generateBrandfetchUrl(casino) {
  try {
    const url = new URL(casino.url);
    const fallbackDomain = url.hostname.replace('www.', '');
    const verifiedDomain = CASINO_DOMAIN_MAPPING[casino.slug] || fallbackDomain;
    return `${BRANDFETCH_CONFIG.BASE_URL}/${verifiedDomain}?c=${BRANDFETCH_CONFIG.CLIENT_ID}`;
  } catch (error) {
    console.warn(`Failed to generate URL for ${casino.slug}:`, error.message);
    return null;
  }
}

/**
 * Test logo URL
 */
function testLogoUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        isImage: contentType.startsWith('image/')
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        responseTime: 5000
      });
    });
    
    req.end();
  });
}

/**
 * Main test function
 */
async function quickLogoTest() {
  try {
    // Load casino data
    const casinosPath = path.join(__dirname, '../data/casinos.json');
    const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));
    
    // Get unique casinos (first 5)
    const uniqueCasinos = [];
    const seenBrands = new Set();
    
    for (const casino of casinos) {
      if (!seenBrands.has(casino.brand) && uniqueCasinos.length < 5) {
        seenBrands.add(casino.brand);
        uniqueCasinos.push(casino);
      }
    }
    
    console.log(`🧪 Testing first ${uniqueCasinos.length} casino logos:\n`);
    
    const results = [];
    
    for (const casino of uniqueCasinos) {
      console.log(`🔍 Testing ${casino.brand}...`);
      
      const brandfetchUrl = generateBrandfetchUrl(casino);
      if (!brandfetchUrl) {
        console.log(`  ❌ Failed to generate URL`);
        continue;
      }
      
      const result = await testLogoUrl(brandfetchUrl);
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        url: brandfetchUrl,
        ...result
      });
      
      if (result.success && result.statusCode === 200 && result.isImage) {
        console.log(`  ✅ SUCCESS: ${result.responseTime}ms, ${(result.contentLength/1024).toFixed(1)}KB`);
      } else {
        console.log(`  ❌ FAILED: ${result.error || result.statusCode}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    const successful = results.filter(r => r.success && r.statusCode === 200 && r.isImage);
    const successRate = (successful.length / results.length * 100).toFixed(1);
    
    console.log(`\n📊 QUICK TEST RESULTS:`);
    console.log(`Success: ${successful.length}/${results.length} (${successRate}%)`);
    
    if (successful.length > 0) {
      const avgTime = Math.round(successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length);
      const avgSize = Math.round(successful.reduce((sum, r) => sum + r.contentLength, 0) / successful.length / 1024);
      console.log(`Average response: ${avgTime}ms`);
      console.log(`Average size: ${avgSize}KB`);
    }
    
    if (successRate === '100.0') {
      console.log(`\n🎉 PERFECT! Logo system is working correctly!`);
      console.log(`Ready to run full validation on all 76 casinos.`);
    } else {
      console.log(`\n⚠️  Some issues detected. Check failed URLs.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test
quickLogoTest()
  .then(() => {
    console.log(`\n🏁 Quick test complete!`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });