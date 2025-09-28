#!/usr/bin/env node

/**
 * Quick AskGamblers Logo Test
 * Test the page structure and extraction logic
 */

const { chromium } = require('playwright');

async function testAskGamblers() {
  console.log('🔍 Testing AskGamblers page structure...\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visibility
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📄 Navigating to AskGamblers...');
    
    // Navigate with extended timeout
    await page.goto('https://www.askgamblers.com/online-casinos/reviews', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    console.log('✅ Page loaded successfully');

    // Wait for page to fully render
    await page.waitForTimeout(5000);

    // Take a screenshot to see what we're working with
    await page.screenshot({ 
      path: 'askgamblers-test.png', 
      fullPage: false 
    });
    console.log('📸 Screenshot saved as askgamblers-test.png');

    // Try to find casino elements using various selectors
    console.log('\n🔍 Testing different selectors...');

    const selectors = [
      '[data-testid*="casino"]',
      '.casino-item', 
      '.casino-card',
      '.casino-listing',
      '.casino-review-item',
      'article[class*="casino"]',
      '.review-item',
      'a[href*="/casino/"]',
      'a[href*="/review/"]',
      '.ag-casino-card', // AskGamblers specific
      '.casino-container',
      '[class*="Casino"]' // React component naming
    ];

    for (const selector of selectors) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      console.log(`  ${selector}: ${count} elements`);
      
      if (count > 0) {
        // Get details of first element
        try {
          const first = elements.first();
          const text = await first.textContent();
          const html = await first.innerHTML();
          console.log(`    First element text: "${text?.substring(0, 100)}..."`);
          console.log(`    First element HTML: "${html?.substring(0, 200)}..."`);
        } catch (e) {
          console.log(`    Could not get details: ${e.message}`);
        }
      }
    }

    // Check for any images on the page
    console.log('\n🖼️  Checking for images...');
    const images = await page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} total images`);

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        try {
          const img = images.nth(i);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt') || 'No alt text';
          console.log(`  Image ${i + 1}: ${src?.substring(0, 60)}... (${alt})`);
        } catch (e) {
          console.log(`  Image ${i + 1}: Error getting details`);
        }
      }
    }

    // Try to detect the page structure
    console.log('\n📋 Page structure analysis...');
    
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main')?.className || 'No main element',
        hasReactApp: !!document.querySelector('#root, [data-reactroot], .react-app'),
        scripts: Array.from(document.scripts)
          .filter(s => s.src)
          .slice(0, 5)
          .map(s => s.src.substring(s.src.lastIndexOf('/') + 1)),
        h1Text: document.querySelector('h1')?.textContent || 'No H1',
        totalLinks: document.querySelectorAll('a').length,
        totalImages: document.querySelectorAll('img').length
      };
    });

    console.log('Page Info:', JSON.stringify(pageInfo, null, 2));

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Try to get current URL and take screenshot even on error
    try {
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      await page.screenshot({ 
        path: 'askgamblers-error.png', 
        fullPage: false 
      });
      console.log('📸 Error screenshot saved as askgamblers-error.png');
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

if (require.main === module) {
  testAskGamblers().catch(console.error);
}