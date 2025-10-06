import { test, expect } from '@playwright/test';

test.describe('Casino Portal Console Testing', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear console logs before each test
    consoleLogs = [];
    consoleErrors = [];
    consoleWarnings = [];

    // Listen to all console events
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      switch (type) {
        case 'error':
          consoleErrors.push(text);
          break;
        case 'warning':
          consoleWarnings.push(text);
          break;
        case 'log':
        case 'info':
          consoleLogs.push(text);
          break;
      }
    });

    // Listen to page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    // Listen to request failures
    page.on('requestfailed', request => {
      consoleErrors.push(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate to the casino portal
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads without console errors', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for any console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Log any warnings found
    if (consoleWarnings.length > 0) {
      console.log('Console warnings found:', consoleWarnings);
    }
    
    // Verify page title
    await expect(page).toHaveTitle(/Casino Portal/i);
  });

  test('Casino cards load images without CORS errors', async ({ page }) => {
    // Wait for casino cards to load
    await page.waitForSelector('[data-testid="casino-card"], .casino-card, .card', { timeout: 10000 });
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check for CORS errors specifically
    const corsErrors = consoleErrors.filter(error => 
      error.includes('CORS') || 
      error.includes('Access-Control-Allow-Origin') ||
      error.includes('Cross-Origin')
    );
    
    expect(corsErrors).toHaveLength(0);
    
    // Verify casino images are loaded
    const images = await page.locator('img[src*="/images/casinos/"]').all();
    expect(images.length).toBeGreaterThan(0);
    
    // Check that images are actually loaded (not broken)
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('Navigation works without JavaScript errors', async ({ page }) => {
    // Test various navigation links
    const navLinks = [
      'a[href="/bonuses"]',
      'a[href="/reviews"]', 
      'a[href="/games"]',
      'a[href="/guide"]'
    ];
    
    for (const selector of navLinks) {
      const link = page.locator(selector).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Check for errors after navigation
        const navigationErrors = consoleErrors.filter(error => 
          !error.includes('favicon') // Ignore favicon errors
        );
        expect(navigationErrors).toHaveLength(0);
        
        // Go back to homepage
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('Casino detail pages load without errors', async ({ page }) => {
    // Find and click on first casino link
    const casinoLink = page.locator('a[href*="/go/"], a[href*="/casino/"], .casino-card a').first();
    
    if (await casinoLink.isVisible()) {
      await casinoLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check for console errors on casino detail page
      expect(consoleErrors).toHaveLength(0);
      
      // Verify casino logo loads without CORS issues
      const casinoImages = await page.locator('img[src*="/images/casinos/"]').all();
      for (const img of casinoImages) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('Search functionality works without errors', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], #search');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('casino');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Check for search-related errors
      expect(consoleErrors).toHaveLength(0);
    }
  });

  test('All external resources load successfully', async ({ page }) => {
    // Check for failed resource loads
    const failedRequests = consoleErrors.filter(error => 
      error.includes('Request failed') || 
      error.includes('net::ERR_') ||
      error.includes('404')
    );
    
    expect(failedRequests).toHaveLength(0);
    
    // Verify no missing resources
    const missingResources = consoleErrors.filter(error =>
      error.includes('Failed to load resource') ||
      error.includes('GET') && error.includes('404')
    );
    
    expect(missingResources).toHaveLength(0);
  });

  test('JavaScript execution completes without errors', async ({ page }) => {
    // Wait for any dynamic content to load
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Check for JavaScript runtime errors
    const jsErrors = consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('SyntaxError') ||
      error.includes('Uncaught')
    );
    
    expect(jsErrors).toHaveLength(0);
    
    // Verify page is interactive
    await expect(page.locator('body')).toBeVisible();
  });

  test('Performance and loading metrics', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Verify reasonable load time (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Check for performance warnings
    const performanceWarnings = consoleWarnings.filter(warning =>
      warning.includes('performance') ||
      warning.includes('slow') ||
      warning.includes('timeout')
    );
    
    console.log('Performance warnings:', performanceWarnings);
  });

  test.afterEach(async ({ page }) => {
    // Log summary of console activity
    console.log(`Console Summary:
      - Errors: ${consoleErrors.length}
      - Warnings: ${consoleWarnings.length}  
      - Logs: ${consoleLogs.length}
    `);
    
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
    
    if (consoleWarnings.length > 0) {
      console.log('Console Warnings:', consoleWarnings);
    }
  });
});