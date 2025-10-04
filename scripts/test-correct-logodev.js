/**
 * CORRECTED Logo.dev Download Script
 * Uses proper token authentication based on MCP Sequential Thinking analysis
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/images/casinos');

// CORRECT Logo.dev configuration
const LOGODEV_CONFIG = {
  baseUrl: 'https://img.logo.dev',
  // You need to get this from https://logo.dev
  // Format: pk_xxxxxxxxxxxx
  publishableKey: process.env.LOGODEV_API_KEY || null,
  params: {
    size: 400,
    format: 'png',
    fallback: 'monogram',
    theme: 'auto'
  }
};

// Smart domain mapping
const DOMAIN_MAPPING = {
  'spellwin': 'spellwin.com',
  'winitbet': 'winit.bet',
  'unlimluck': 'unlimluck.com',
  'mr-pacho': 'mrpacho.com',
  'larabet': 'larabet.com',
  'n1bet': 'n1bet.com',
  'rizz': 'rizzcasino.com'
};

async function generateCorrectLogoDevUrl(domain) {
  if (!LOGODEV_CONFIG.publishableKey) {
    return null;
  }

  const params = new URLSearchParams({
    token: LOGODEV_CONFIG.publishableKey,
    size: LOGODEV_CONFIG.params.size.toString(),
    format: LOGODEV_CONFIG.params.format,
    fallback: LOGODEV_CONFIG.params.fallback,
    theme: LOGODEV_CONFIG.params.theme
  });

  return `${LOGODEV_CONFIG.baseUrl}/${domain}?${params.toString()}`;
}

async function testCorrectLogoDevAPI() {
  console.log('🔧 Testing CORRECT Logo.dev API implementation...\n');
  
  if (!LOGODEV_CONFIG.publishableKey) {
    console.log('❌ No Logo.dev API key found!');
    console.log('💡 To get authentic casino logos:');
    console.log('   1. Sign up at https://logo.dev');
    console.log('   2. Get your publishable key (format: pk_xxxxxxxxxxxx)');
    console.log('   3. Set environment variable: LOGODEV_API_KEY=pk_your_key_here');
    console.log('   4. Run this script again\n');
    
    console.log('🔄 For now, testing with major domains that might work without token...\n');
  }

  const testDomains = [
    { name: 'Google', domain: 'google.com' },
    { name: 'Apple', domain: 'apple.com' },
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'SpellWin Casino', domain: 'spellwin.com' },
    { name: 'Winit.Bet Casino', domain: 'winit.bet' }
  ];

  console.log('🧪 Testing domains with CORRECT Logo.dev format:\n');

  for (const test of testDomains) {
    console.log(`Testing ${test.name} (${test.domain}):`);
    
    // Test with correct token format
    const correctUrl = await generateCorrectLogoDevUrl(test.domain);
    if (correctUrl) {
      console.log(`  ✅ Correct URL: ${correctUrl}`);
      
      try {
        const response = await fetch(correctUrl, { method: 'HEAD' });
        console.log(`  📊 Response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`  🎯 SUCCESS - Logo.dev working with token!`);
        } else {
          console.log(`  ⚠️  Token required or domain not in Logo.dev database`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    } else {
      // Test without token (old way) to show the difference
      const oldUrl = `https://img.logo.dev/${test.domain}`;
      console.log(`  ❌ No API key - testing old format: ${oldUrl}`);
      
      try {
        const response = await fetch(oldUrl, { method: 'HEAD' });
        console.log(`  📊 Response: ${response.status} ${response.statusText}`);
        console.log(`  💡 This is why we were getting 404s!`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎯 ANALYSIS COMPLETE!');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Get Logo.dev API key from https://logo.dev');
  console.log('   2. Set LOGODEV_API_KEY environment variable'); 
  console.log('   3. Rerun download script for authentic casino logos');
  console.log('   4. Enjoy fast, authentic logo loading! 🚀');
}

testCorrectLogoDevAPI()
  .catch(error => {
    console.error('❌ Test failed:', error);
  });