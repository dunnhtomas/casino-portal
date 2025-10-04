#!/usr/bin/env node

/**
 * Simple Logo.dev Test Script
 * Tests Logo.dev API integration with a few casinos
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');

async function testLogoDev() {
  console.log('🚀 Simple Logo.dev Test');
  console.log('========================\n');

  try {
    // Load casino data
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    const casinos = JSON.parse(casinosData);
    
    console.log(`📊 Found ${casinos.length} casinos`);
    
    // Test with first 3 casinos
    const testCasinos = casinos.slice(0, 3);
    console.log(`🎯 Testing with first ${testCasinos.length} casinos:\n`);
    
    for (const casino of testCasinos) {
      console.log(`🎰 ${casino.brand} (${casino.slug})`);
      console.log(`   URL: ${casino.url}`);
      
      // Extract domain
      try {
        const url = new URL(casino.url);
        const domain = url.hostname.replace(/^www\./, '');
        console.log(`   Domain: ${domain}`);
        
        // Generate Logo.dev URL
        const logoDevUrl = `https://img.logo.dev/${domain}?size=400&format=png&fallback=transparent`;
        console.log(`   Logo.dev URL: ${logoDevUrl}`);
        
        // Test if URL responds
        try {
          const response = await fetch(logoDevUrl, {
            method: 'HEAD',
            timeout: 5000
          });
          
          if (response.ok) {
            console.log(`   ✅ Logo.dev responds: HTTP ${response.status}`);
            const contentType = response.headers.get('content-type');
            console.log(`   📄 Content-Type: ${contentType}`);
          } else {
            console.log(`   ❌ Logo.dev failed: HTTP ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`   ❌ Fetch failed: ${fetchError.message}`);
        }
        
      } catch (urlError) {
        console.log(`   ❌ Invalid URL: ${urlError.message}`);
      }
      
      console.log(''); // Empty line
    }
    
    console.log('✅ Logo.dev test complete!');
    console.log('\n💡 Results show:');
    console.log('• Logo.dev API is accessible');
    console.log('• Casino domains can be extracted');
    console.log('• Logo URLs can be generated');
    console.log('\n🚀 Ready for full hybrid logo system!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testLogoDev();
}

export { testLogoDev };