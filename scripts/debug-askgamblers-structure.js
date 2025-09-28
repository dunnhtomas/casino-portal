#!/usr/bin/env node

/**
 * AskGamblers Structure Debugger
 * Analyzes the actual page structure to understand why matches might not be working
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugAskGamblersStructure() {
  console.log('🔬 AskGamblers Structure Debugger');
  console.log('==================================\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test first page
    await page.goto('https://www.askgamblers.com/online-casinos/reviews', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ Page loaded, analyzing structure...\n');
    await page.waitForTimeout(5000);

    const pageAnalysis = await page.evaluate(() => {
      const results = {
        title: document.title,
        casinoElements: [],
        allImages: [],
        allLinks: [],
        textContent: []
      };

      // Find all possible casino-related elements
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (img.src && !img.src.includes('data:')) {
          results.allImages.push({
            index,
            src: img.src,
            alt: img.alt || '',
            className: img.className || '',
            width: img.width,
            height: img.height
          });
        }
      });

      // Find all links
      const links = document.querySelectorAll('a[href]');
      links.forEach((link, index) => {
        const href = link.href;
        const text = link.textContent?.trim() || '';
        
        if (text.length > 2 && text.length < 50) {
          results.allLinks.push({
            index,
            href,
            text,
            className: link.className || ''
          });
        }
      });

      // Look for specific casino-related content
      const possibleCasinoSelectors = [
        '.casino', '[class*="casino"]',
        '.review', '[class*="review"]',
        '.brand', '[class*="brand"]',
        '.operator', '[class*="operator"]',
        '.listing', '[class*="listing"]',
        '.card', '[class*="card"]',
        '.item', '[class*="item"]'
      ];

      possibleCasinoSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el, index) => {
            const text = el.textContent?.trim()?.substring(0, 100) || '';
            if (text.length > 3) {
              results.casinoElements.push({
                selector,
                index,
                text,
                className: el.className || '',
                tagName: el.tagName
              });
            }
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Get visible text content
      const textElements = document.querySelectorAll('span, div, p, h1, h2, h3, h4, h5, h6');
      textElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        if (text.length > 5 && text.length < 100) {
          // Look for casino-like names
          if (/casino|bet|slots|gaming|poker|win|lucky|royal|vegas|spin/i.test(text)) {
            results.textContent.push({
              text,
              tagName: el.tagName,
              className: el.className || ''
            });
          }
        }
      });

      return results;
    });

    console.log('📊 ANALYSIS RESULTS');
    console.log('===================');
    console.log(`Page Title: ${pageAnalysis.title}`);
    console.log(`Total Images: ${pageAnalysis.allImages.length}`);
    console.log(`Total Links: ${pageAnalysis.allLinks.length}`);
    console.log(`Casino Elements: ${pageAnalysis.casinoElements.length}`);
    console.log(`Casino Text Content: ${pageAnalysis.textContent.length}\n`);

    // Show sample images
    console.log('🖼️  SAMPLE IMAGES (first 10):');
    pageAnalysis.allImages.slice(0, 10).forEach((img, i) => {
      console.log(`${i + 1}. ${img.alt || 'No alt'} - ${img.src.substring(0, 80)}...`);
    });

    // Show sample casino text
    console.log('\n🎰 CASINO-RELATED TEXT (first 10):');
    pageAnalysis.textContent.slice(0, 10).forEach((item, i) => {
      console.log(`${i + 1}. "${item.text}" (${item.tagName})`);
    });

    // Show sample links
    console.log('\n🔗 SAMPLE LINKS (first 10):');
    pageAnalysis.allLinks.slice(0, 10).forEach((link, i) => {
      console.log(`${i + 1}. "${link.text}" -> ${link.href.substring(0, 60)}...`);
    });

    // Save full analysis to file
    await fs.writeFile('askgamblers-debug.json', JSON.stringify(pageAnalysis, null, 2));
    console.log('\n💾 Full analysis saved to askgamblers-debug.json');

    // Test if we can find some known casinos manually
    console.log('\n🔍 MANUAL SEARCH TEST');
    console.log('=====================');
    
    const testCasinos = ['betway', '888', 'william', 'leo', 'vegas', 'spin'];
    
    for (const testName of testCasinos) {
      const found = await page.evaluate((searchTerm) => {
        const allText = document.body.innerText.toLowerCase();
        return allText.includes(searchTerm);
      }, testName);
      
      console.log(`${testName}: ${found ? '✅ Found' : '❌ Not found'}`);
    }

    console.log('\n🎯 Try different page?');
    console.log('Let me check page 2...\n');

    await page.goto('https://www.askgamblers.com/online-casinos/reviews/2');
    await page.waitForTimeout(3000);

    const page2Analysis = await page.evaluate(() => {
      const casinoNames = [];
      const allText = document.body.innerText.toLowerCase();
      
      // Look for common casino keywords in text
      const casinoKeywords = ['betway', '888', 'william', 'leovegas', 'casumo', 'rizk', 'wildz', 'spinit'];
      casinoKeywords.forEach(keyword => {
        if (allText.includes(keyword)) {
          casinoNames.push(keyword);
        }
      });

      return {
        title: document.title,
        foundCasinos: casinoNames,
        hasImages: document.querySelectorAll('img').length,
        hasLinks: document.querySelectorAll('a').length
      };
    });

    console.log(`Page 2 Title: ${page2Analysis.title}`);
    console.log(`Page 2 Images: ${page2Analysis.hasImages}`);
    console.log(`Page 2 Links: ${page2Analysis.hasLinks}`);
    console.log(`Found Casino Names on Page 2: ${page2Analysis.foundCasinos.join(', ') || 'None'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  debugAskGamblersStructure();
}