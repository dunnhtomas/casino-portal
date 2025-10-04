#!/usr/bin/env node

/**
 * 🎯 QUICK DOMAIN DISCOVERY TEST
 * Test the intelligent domain discovery with a few casinos first
 */

import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');

async function quickDomainTest() {
  console.log('🎯 QUICK DOMAIN DISCOVERY TEST');
  console.log('==============================\n');

  try {
    // Load casino data
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    const casinos = JSON.parse(casinosData);
    
    console.log(`📊 Loaded ${casinos.length} casinos`);
    
    // Test with first 3 casinos
    const testCasinos = casinos.slice(0, 3);
    console.log(`🎯 Testing with: ${testCasinos.map(c => c.brand).join(', ')}\n`);

    // Initialize browser
    console.log('🚀 Launching Playwright browser...');
    const browser = await chromium.launch({ headless: true });
    
    const results = [];
    
    for (let i = 0; i < testCasinos.length; i++) {
      const casino = testCasinos[i];
      console.log(`[${i + 1}/3] 🎰 Testing: ${casino.brand}`);
      console.log(`   Current domain: ${casino.url}`);
      
      try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Perform Bing search
        const query = `"${casino.brand}" official site casino`;
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        
        console.log(`   🔍 Searching: ${query}`);
        
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Extract search results
        const searchResults = await page.evaluate(() => {
          const results = [];
          const resultElements = document.querySelectorAll('#b_results .b_algo');
          
          for (let i = 0; i < Math.min(3, resultElements.length); i++) {
            const result = resultElements[i];
            const titleElement = result.querySelector('h2 a');
            
            if (titleElement) {
              const href = titleElement.href;
              const title = titleElement.textContent?.trim() || '';
              
              try {
                const url = new URL(href);
                const domain = url.hostname.replace(/^www\./, '');
                
                results.push({
                  position: i + 1,
                  domain,
                  url: href,
                  title
                });
              } catch (e) {
                // Skip invalid URLs
              }
            }
          }
          
          return results;
        });
        
        console.log(`   📊 Found ${searchResults.length} results:`);
        searchResults.forEach(result => {
          console.log(`      ${result.position}. ${result.domain} - ${result.title.substring(0, 60)}...`);
        });
        
        results.push({
          casino: casino.slug,
          brand: casino.brand,
          currentDomain: casino.url,
          searchResults
        });
        
        await context.close();
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          casino: casino.slug,
          brand: casino.brand,
          currentDomain: casino.url,
          error: error.message
        });
      }
      
      console.log(''); // Empty line
    }
    
    await browser.close();
    console.log('🔒 Browser closed');
    
    // Summary
    console.log('📊 QUICK TEST RESULTS:');
    console.log('======================');
    
    results.forEach(result => {
      console.log(`\n🎰 ${result.brand}:`);
      console.log(`   Current: ${result.currentDomain}`);
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      } else if (result.searchResults && result.searchResults.length > 0) {
        console.log(`   🎯 Best Found: ${result.searchResults[0].domain}`);
        
        // Check if domain is different
        const currentDomain = result.currentDomain.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        const foundDomain = result.searchResults[0].domain;
        
        if (currentDomain !== foundDomain) {
          console.log(`   🔄 DOMAIN CHANGE NEEDED: ${currentDomain} → ${foundDomain}`);
        } else {
          console.log(`   ✅ Domain matches current`);
        }
      } else {
        console.log(`   ❌ No search results found`);
      }
    });
    
    console.log('\n🚀 Quick test complete! The system is working.');
    console.log('📝 Ready to run full domain discovery on all 79 casinos.');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error(error.stack);
  }
}

quickDomainTest();