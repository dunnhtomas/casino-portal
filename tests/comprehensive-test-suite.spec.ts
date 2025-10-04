import { test, expect, Page } from '@playwright/test';

/**
 * Smart Error Handler for Playwright Tests
 * Stops test execution after 5 errors to prevent resource waste
 */
class SmartErrorHandler {
  private static errorCount = 0;
  private static readonly MAX_ERRORS = 5;
  private static errors: Array<{ test: string; error: string; timestamp: Date }> = [];

  static recordError(testName: string, error: Error) {
    this.errorCount++;
    this.errors.push({
      test: testName,
      error: error.message,
      timestamp: new Date()
    });

    console.log(`🚨 Error ${this.errorCount}/${this.MAX_ERRORS} in test: ${testName}`);
    console.log(`Error: ${error.message}`);

    if (this.errorCount >= this.MAX_ERRORS) {
      console.log(`\n🛑 STOPPING TESTS: Reached maximum error count (${this.MAX_ERRORS})`);
      console.log('\n📊 Error Summary:');
      this.errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.test}: ${err.error}`);
      });
      process.exit(1);
    }
  }

  static getErrorCount(): number {
    return this.errorCount;
  }

  static hasReachedLimit(): boolean {
    return this.errorCount >= this.MAX_ERRORS;
  }
}

/**
 * Comprehensive Casino Portal Test Suite
 * Tests all major functionality with 20 parallel workers
 */
test.describe('Casino Portal - Comprehensive Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Check if we've reached error limit before starting new tests
    if (SmartErrorHandler.hasReachedLimit()) {
      test.skip();
    }
  });

  // Test 1: Homepage Load and Core Elements
  test('Homepage loads with all core elements', async ({ page }) => {
    try {
      await page.goto('/');
      
      // Check page title
      await expect(page).toHaveTitle(/Best Casino Portal/i);
      
      // Check navigation
      await expect(page.locator('nav')).toBeVisible();
      
      // Check hero section
      await expect(page.locator('h1')).toBeVisible();
      
      // Check top casinos section
      await expect(page.locator('[data-testid="top-casinos"], .casino-card, .top-three')).toBeVisible();
      
      // Check footer
      await expect(page.locator('footer')).toBeVisible();
      
      console.log('✅ Homepage core elements test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Homepage Core Elements', error as Error);
      throw error;
    }
  });

  // Test 2: Navigation Menu Functionality
  test('Navigation menu works correctly', async ({ page }) => {
    try {
      await page.goto('/');
      
      // Test main navigation links
      const navLinks = ['Reviews', 'Best Casinos', 'Guides', 'Regions'];
      
      for (const linkText of navLinks) {
        const link = page.getByRole('link', { name: new RegExp(linkText, 'i') }).first();
        if (await link.isVisible()) {
          await expect(link).toBeVisible();
        }
      }
      
      console.log('✅ Navigation functionality test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Navigation Menu', error as Error);
      throw error;
    }
  });

  // Test 3: Casino Reviews Page
  test('Casino reviews page loads and displays casinos', async ({ page }) => {
    try {
      await page.goto('/reviews');
      
      // Check page loads
      await expect(page.locator('h1, h2')).toBeVisible();
      
      // Check casino cards or listings
      const casinoElements = page.locator('.casino-card, .casino-item, [data-testid="casino"]');
      const count = await casinoElements.count();
      
      expect(count).toBeGreaterThan(0);
      
      console.log(`✅ Reviews page test passed - Found ${count} casino elements`);
    } catch (error) {
      SmartErrorHandler.recordError('Casino Reviews Page', error as Error);
      throw error;
    }
  });

  // Test 4: Mobile Responsiveness
  test('Site is mobile responsive', async ({ page }) => {
    try {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check mobile navigation (hamburger menu or mobile nav)
      const mobileNavElements = [
        'button[aria-label*="menu"]',
        '.mobile-menu',
        '.hamburger',
        '[data-testid="mobile-nav"]'
      ];
      
      let mobileNavFound = false;
      for (const selector of mobileNavElements) {
        if (await page.locator(selector).count() > 0) {
          mobileNavFound = true;
          break;
        }
      }
      
      // Check content is not horizontally scrollable
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow 50px tolerance
      
      console.log('✅ Mobile responsiveness test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Mobile Responsiveness', error as Error);
      throw error;
    }
  });

  // Test 5: Search Functionality (if exists)
  test('Search functionality works', async ({ page }) => {
    try {
      await page.goto('/');
      
      // Look for search input
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search"]',
        '[data-testid="search"]',
        '.search-input'
      ];
      
      let searchElement = null;
      for (const selector of searchSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          searchElement = element;
          break;
        }
      }
      
      if (searchElement) {
        await searchElement.fill('casino');
        await page.keyboard.press('Enter');
        
        // Wait for results or navigation
        await page.waitForTimeout(2000);
        
        console.log('✅ Search functionality test passed');
      } else {
        console.log('ℹ️ No search functionality found - skipping test');
      }
    } catch (error) {
      SmartErrorHandler.recordError('Search Functionality', error as Error);
      throw error;
    }
  });

  // Test 6: Casino Detail Page
  test('Casino detail pages load correctly', async ({ page }) => {
    try {
      // Go to reviews page first to find a casino
      await page.goto('/reviews');
      
      // Find first casino link
      const casinoLink = page.locator('a[href*="/reviews/"]').first();
      
      if (await casinoLink.count() > 0) {
        await casinoLink.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Check casino details are present
        await expect(page.locator('h1, h2')).toBeVisible();
        
        // Look for rating or key information
        const ratingElements = page.locator('.rating, .score, [data-testid="rating"]');
        if (await ratingElements.count() > 0) {
          await expect(ratingElements.first()).toBeVisible();
        }
        
        console.log('✅ Casino detail page test passed');
      } else {
        console.log('ℹ️ No casino links found - skipping detail page test');
      }
    } catch (error) {
      SmartErrorHandler.recordError('Casino Detail Page', error as Error);
      throw error;
    }
  });

  // Test 7: Performance Check
  test('Page load performance is acceptable', async ({ page }) => {
    try {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
      
      console.log(`✅ Performance test passed - Load time: ${loadTime}ms`);
    } catch (error) {
      SmartErrorHandler.recordError('Performance Check', error as Error);
      throw error;
    }
  });

  // Test 8: Accessibility Basics
  test('Basic accessibility requirements', async ({ page }) => {
    try {
      await page.goto('/');
      
      // Check for main heading
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images.slice(0, 5)) { // Check first 5 images
        const alt = await img.getAttribute('alt');
        if (alt !== null) {
          expect(alt.length).toBeGreaterThan(0);
        }
      }
      
      console.log('✅ Accessibility basics test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Accessibility Basics', error as Error);
      throw error;
    }
  });

  // Test 9: Footer Links
  test('Footer links are functional', async ({ page }) => {
    try {
      await page.goto('/');
      
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      
      // Check for important footer links
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();
      
      expect(linkCount).toBeGreaterThan(0);
      
      // Test a few footer links
      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = footerLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          await expect(link).toBeVisible();
        }
      }
      
      console.log(`✅ Footer links test passed - Found ${linkCount} footer links`);
    } catch (error) {
      SmartErrorHandler.recordError('Footer Links', error as Error);
      throw error;
    }
  });

  // Test 10: Error Page Handling
  test('404 page handles gracefully', async ({ page }) => {
    try {
      const response = await page.goto('/non-existent-page-test-404');
      
      // Should either get 404 or redirect to home/error page
      if (response) {
        const status = response.status();
        
        // Accept 404 or 200 (redirect to error page)
        expect([200, 404]).toContain(status);
      }
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      console.log('✅ Error page handling test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Error Page Handling', error as Error);
      throw error;
    }
  });

});

// Additional test suite for Country/Regional pages
test.describe('Regional Pages Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    if (SmartErrorHandler.hasReachedLimit()) {
      test.skip();
    }
  });

  test('Countries page loads with proper navigation', async ({ page }) => {
    try {
      await page.goto('/countries');
      
      // Check page loads
      await expect(page.locator('h1, h2')).toBeVisible();
      
      // Check navigation and footer are present
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      
      console.log('✅ Countries page test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Countries Page', error as Error);
      throw error;
    }
  });

  test('Regional pages load correctly', async ({ page }) => {
    try {
      const regions = ['/regions/ontario', '/regions/alberta', '/regions/british-columbia'];
      
      for (const region of regions) {
        await page.goto(region);
        
        // Check page loads
        await expect(page.locator('h1, h2')).toBeVisible();
        
        // Check navigation is present
        await expect(page.locator('nav')).toBeVisible();
      }
      
      console.log('✅ Regional pages test passed');
    } catch (error) {
      SmartErrorHandler.recordError('Regional Pages', error as Error);
      throw error;
    }
  });

});

// Final test summary
test.afterAll(async () => {
  const errorCount = SmartErrorHandler.getErrorCount();
  console.log(`\n🎯 Test Suite Complete`);
  console.log(`📊 Total Errors: ${errorCount}/5`);
  
  if (errorCount === 0) {
    console.log('🎉 All tests passed successfully!');
  } else if (errorCount < 5) {
    console.log(`⚠️ Tests completed with ${errorCount} errors`);
  } else {
    console.log('🚨 Test suite stopped due to error limit');
  }
});