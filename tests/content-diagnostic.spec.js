import { test, expect } from '@playwright/test';

test.describe('Content Comparison Diagnostic', () => {
  test('should compare local vs live content structure', async ({ page }) => {
    // Check a specific casino review page
    console.log('\n=== CHECKING LUCKI CASINO REVIEW PAGE ===');
    
    await page.goto('https://bestcasinoportal.com/reviews/lucki', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Get page title and meta info
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);
    
    // Check for various content selectors
    const selectors = {
      'main content': 'main, .content, article, .page-content',
      'casino cards': '.casino-card, .casino-item, [data-casino]',
      'review content': '.review-content, .casino-review, .review-details',
      'rating elements': '.rating, .stars, .score, .rating-value',
      'pros/cons': '.pros-cons, .pros, .cons, .advantages, .disadvantages',
      'cta buttons': 'a[href*="register"], .cta-button, .play-button, .btn-play',
      'bonus info': '.bonus, .bonus-info, .welcome-bonus, .offer',
      'images': 'img',
      'headings': 'h1, h2, h3, h4, h5, h6',
      'paragraphs': 'p',
      'lists': 'ul, ol'
    };
    
    console.log('\n--- CONTENT SELECTORS FOUND ---');
    for (const [name, selector] of Object.entries(selectors)) {
      const count = await page.locator(selector).count();
      console.log(`${name}: ${count} elements`);
    }
    
    // Get actual HTML structure preview
    const bodyClasses = await page.evaluate(() => {
      return document.body ? document.body.className : 'No body element';
    });
    
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) {
        return {
          tag: main.tagName,
          classes: main.className,
          childCount: main.children.length,
          textLength: main.textContent ? main.textContent.length : 0
        };
      }
      return 'No main element found';
    });
    
    console.log(`\nBody classes: ${bodyClasses}`);
    console.log(`Main content:`, mainContent);
    
    // Check if this is a 404 or redirect
    const statusCode = await page.evaluate(() => {
      return window.performance?.navigation?.type || 'unknown';
    });
    
    console.log(`Navigation type: ${statusCode}`);
    
    // Get some actual text content to verify
    const pageText = await page.evaluate(() => {
      return document.body ? document.body.textContent?.substring(0, 200) : 'No content';
    });
    
    console.log(`\nPage text preview: ${pageText}...`);
    
    // Check for error messages or redirects
    const errorMessages = await page.evaluate(() => {
      const errorSelectors = ['.error', '.not-found', '[class*="404"]', '.redirect', '.loading'];
      for (const selector of errorSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            return `Error found: ${selector} - ${element.textContent}`;
          }
        } catch (e) {
          // Skip invalid selectors
        }
      }
      return null;
    });
    
    if (errorMessages) {
      console.log(`\n🚨 ${errorMessages}`);
    }
  });

  test('should check regional page content', async ({ page }) => {
    console.log('\n=== CHECKING ALBERTA REGIONAL PAGE ===');
    
    await page.goto('https://bestcasinoportal.com/regions/alberta', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`Title: ${title}`);
    
    // Check for regional-specific content
    const regionalContent = await page.evaluate(() => {
      const alberta = document.body.textContent?.toLowerCase() || '';
      return {
        hasAlberta: alberta.includes('alberta'),
        hasCasino: alberta.includes('casino'),
        hasGambling: alberta.includes('gambling') || alberta.includes('gaming'),
        hasPlayer: alberta.includes('player'),
        hasCanadian: alberta.includes('canadian') || alberta.includes('canada'),
        contentLength: document.body?.textContent?.length || 0
      };
    });
    
    console.log('Regional content check:', regionalContent);
    
    const casinoCards = await page.locator('.casino-card, .casino-item, [data-casino], .casino').count();
    const lists = await page.locator('ul, ol').count();
    const tables = await page.locator('table').count();
    
    console.log(`Casino cards/items: ${casinoCards}`);
    console.log(`Lists: ${lists}`);
    console.log(`Tables: ${tables}`);
  });

  test('should check if pages are using correct templates', async ({ page }) => {
    console.log('\n=== TEMPLATE ANALYSIS ===');
    
    const pages = [
      { url: 'https://bestcasinoportal.com/', name: 'Homepage' },
      { url: 'https://bestcasinoportal.com/reviews', name: 'Reviews List' },
      { url: 'https://bestcasinoportal.com/reviews/lucki', name: 'Casino Review' },
      { url: 'https://bestcasinoportal.com/bonuses/lucki-casino-welcome-bonus', name: 'Bonus Page' },
      { url: 'https://bestcasinoportal.com/regions/alberta', name: 'Regional Page' }
    ];
    
    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
        
        const template = await page.evaluate(() => {
          // Look for template indicators
          const astroMeta = document.querySelector('meta[name="generator"]')?.content || '';
          const bodyId = document.body?.id || '';
          const dataAttrs = Array.from(document.body?.attributes || [])
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(', ');
          
          return {
            generator: astroMeta,
            bodyId,
            dataAttributes: dataAttrs,
            hasLayoutWrapper: !!document.querySelector('.layout, .wrapper, .container'),
            componentCount: document.querySelectorAll('[class*="component"], [class*="Component"]').length
          };
        });
        
        console.log(`\n${pageInfo.name}:`);
        console.log(`  Generator: ${template.generator}`);
        console.log(`  Body ID: ${template.bodyId}`);
        console.log(`  Data Attributes: ${template.dataAttributes}`);
        console.log(`  Has Layout: ${template.hasLayoutWrapper}`);
        console.log(`  Components: ${template.componentCount}`);
        
      } catch (error) {
        console.log(`\n${pageInfo.name}: ERROR - ${error.message}`);
      }
    }
  });
});