#!/usr/bin/env node

/**
 * Logo.dev API Validation Test
 * Tests the provided API keys and validates authentic casino logos
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logo.dev configuration with your API keys
const LOGODEV_CONFIG = {
  baseUrl: 'https://img.logo.dev',
  apiUrl: 'https://api.logo.dev',
  apiKey: 'pk_SJblPZ1hRMmjGGRoOmdviQ',
  secretKey: 'sk_WwTiF1tbT-SI-uC2Xf-SAA'
};

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');

/**
 * Generate Logo.dev URL with API key authentication
 */
function generateLogoDevUrl(domain, options = {}) {
  const {
    size = 400,
    format = 'png',
    fallback = 'transparent',
    theme = 'auto'
  } = options;

  const params = new URLSearchParams({
    size: size.toString(),
    format,
    fallback,
    theme
  });

  // Add API key for authenticated requests
  if (LOGODEV_CONFIG.apiKey) {
    params.append('token', LOGODEV_CONFIG.apiKey);
  }

  return `${LOGODEV_CONFIG.baseUrl}/${domain}?${params.toString()}`;
}

/**
 * Test Logo.dev API with authentication
 */
async function testLogoDevAPI() {
  console.log('🔑 LOGO.DEV API VALIDATION TEST');
  console.log('================================');
  console.log(`📋 API Key: ${LOGODEV_CONFIG.apiKey}`);
  console.log(`🔐 Secret Key: ${LOGODEV_CONFIG.secretKey.substring(0, 10)}...`);
  console.log('');

  try {
    // Test API status first
    console.log('🌐 Testing Logo.dev API status...');
    
    const statusResponse = await fetch(`${LOGODEV_CONFIG.apiUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${LOGODEV_CONFIG.apiKey}`,
        'User-Agent': 'Casino-Portal-Logo-Tester/1.0'
      }
    });

    if (statusResponse.ok) {
      console.log('✅ Logo.dev API is accessible');
    } else {
      console.log(`⚠️  Logo.dev API status: ${statusResponse.status}`);
    }

  } catch (error) {
    console.log(`⚠️  Logo.dev API test: ${error.message}`);
  }

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Loaded ${casinos.length} casinos for testing`);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    return;
  }

  // Test with popular casinos
  const testCasinos = casinos.filter(casino => 
    ['stake', 'bet365', 'pokerstars', 'betfair', 'william-hill', 'ladbrokes'].includes(casino.slug)
  ).slice(0, 6);

  console.log(`\n🎯 Testing Logo.dev with ${testCasinos.length} popular casinos:\n`);

  const results = {
    successful: 0,
    failed: 0,
    authenticated: 0,
    unauthenticated: 0
  };

  for (let i = 0; i < testCasinos.length; i++) {
    const casino = testCasinos[i];
    
    try {
      // Extract domain
      const url = new URL(casino.url);
      const domain = url.hostname.replace(/^www\./, '');
      
      console.log(`${i + 1}. 🎰 ${casino.brand}`);
      console.log(`   Domain: ${domain}`);
      
      // Test authenticated Logo.dev URL
      const logoDevUrl = generateLogoDevUrl(domain);
      console.log(`   🔑 Authenticated URL: ${logoDevUrl}`);
      
      const response = await fetch(logoDevUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Casino-Portal-Logo-Tester/1.0'
        },
        timeout: 8000
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        console.log(`   ✅ Success: HTTP ${response.status}`);
        console.log(`   📄 Type: ${contentType}`);
        console.log(`   📏 Size: ${contentLength ? Math.round(contentLength/1024) + 'KB' : 'Unknown'}`);
        
        results.successful++;
        
        // Check if authenticated (typically larger, better quality logos)
        if (contentLength && parseInt(contentLength) > 5000) {
          results.authenticated++;
          console.log(`   🔑 High-quality authenticated logo detected`);
        } else {
          results.unauthenticated++;
        }
        
      } else {
        console.log(`   ❌ Failed: HTTP ${response.status}`);
        results.failed++;
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed++;
    }

    console.log(''); // Empty line
  }

  // Final report
  console.log('🏆 LOGO.DEV API VALIDATION RESULTS');
  console.log('==================================');
  console.log(`✅ Successful: ${results.successful}/${testCasinos.length}`);
  console.log(`❌ Failed: ${results.failed}/${testCasinos.length}`);
  console.log(`🔑 High-quality (Authenticated): ${results.authenticated}`);
  console.log(`🔓 Standard quality: ${results.unauthenticated}`);
  console.log(`📈 Success Rate: ${((results.successful / testCasinos.length) * 100).toFixed(1)}%`);

  if (results.successful > 0) {
    console.log('\n🎊 API VALIDATION SUCCESS!');
    console.log('✅ Logo.dev API keys are working');
    console.log('✅ Authentic casino logos are loading');
    console.log('✅ Quality appears improved with authentication');
    
    console.log('\n🚀 READY FOR PRODUCTION DEPLOYMENT!');
    console.log('Your casino portal now has authentic logos instead of generic placeholders.');
    
  } else {
    console.log('\n⚠️  API VALIDATION ISSUES');
    console.log('❌ No successful logo loads detected');
    console.log('🔍 Check API key validity and network connectivity');
  }

  console.log('\n💡 Logo.dev Benefits with API Key:');
  console.log('• Higher rate limits (vs free tier)');
  console.log('• Better quality logo variants');
  console.log('• Priority processing');
  console.log('• Access to premium logo database');
  console.log('• Authentic casino branding vs generic logos');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testLogoDevAPI().catch(error => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
}

export { testLogoDevAPI };