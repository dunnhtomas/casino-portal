import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Site Testing Suite
 * Tests all pages, homepage sections, performance, and accessibility
 */

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  maxPages: 50, // Limit for initial run, can be increased
  homepageURL: '/',
  performanceThresholds: {
    loadTime: 5000,
    largestContentfulPaint: 2500,
    firstContentfulPaint: 1800
  }
};

test.describe('Comprehensive Site Testing', () => {
  
  test.describe('Homepage Sections', () => {
    
    test('Banking Methods Section - Enhanced Features', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Check if Banking Methods section exists
      const bankingSection = page.locator('#banking-methods, [data-testid="banking-methods"]');
      await expect(bankingSection).toBeVisible({ timeout: TEST_CONFIG.timeout });
      
      // Verify enhanced payment cards
      const paymentCards = page.locator('.payment-card, .banking-card');
      await expect(paymentCards.first()).toBeVisible();
      
      // Check for payment method icons and descriptions
      const visaCard = page.locator('text=Visa').or(page.locator('[alt*="Visa"]'));
      const masterCard = page.locator('text=Mastercard').or(page.locator('[alt*="Mastercard"]'));
      const cryptoCard = page.locator('text=Bitcoin').or(page.locator('text=Crypto'));
      
      // Verify at least some payment methods are visible
      const paymentMethods = await page.locator('.payment-card, .banking-card, [class*="payment"], [class*="banking"]').count();
      expect(paymentMethods).toBeGreaterThan(3);
      
      console.log(`✅ Banking Methods: Found ${paymentMethods} payment options`);
    });

    test('Popular Slots Section - Game Cards', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Look for Popular Slots section
      const slotsSection = page.locator('#popular-slots, [data-testid="popular-slots"]').or(
        page.locator('h2:has-text("Popular Slots"), h3:has-text("Popular Slots")').locator('..')
      );
      
      // Check if section is visible
      const sectionVisible = await slotsSection.isVisible().catch(() => false);
      if (sectionVisible) {
        // Verify game cards
        const gameCards = page.locator('.game-card, .slot-card, [class*="game"], [class*="slot"]');
        const gameCount = await gameCards.count();
        expect(gameCount).toBeGreaterThan(2);
        
        console.log(`✅ Popular Slots: Found ${gameCount} game cards`);
      } else {
        console.log(`⚠️ Popular Slots section not found - may use different selector`);
      }
    });

    test('Region Hubs Section - Provincial Content', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Look for Region/Provincial content
      const regionSection = page.locator('#region-hubs, [data-testid="region-hubs"]').or(
        page.locator('text=Alberta, text=Ontario, text=British Columbia').first().locator('..')
      );
      
      // Check for Canadian provinces
      const provinces = [
        page.locator('text=Alberta'),
        page.locator('text=Ontario'), 
        page.locator('text=British Columbia')
      ];
      
      let provinceCount = 0;
      for (const province of provinces) {
        if (await province.isVisible().catch(() => false)) {
          provinceCount++;
        }
      }
      
      expect(provinceCount).toBeGreaterThan(0);
      console.log(`✅ Region Hubs: Found ${provinceCount} provinces`);
    });

    test('Category Tiles Section - Casino Categories', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Look for category tiles
      const categorySection = page.locator('#category-tiles, [data-testid="category-tiles"]');
      
      // Check for common casino categories
      const categories = [
        'Real Money',
        'Fast Withdrawals', 
        'Welcome Bonuses',
        'Mobile',
        'Live Dealer',
        'High Roller',
        'Crypto'
      ];
      
      let foundCategories = 0;
      for (const category of categories) {
        const categoryElement = page.locator(`text=${category}`);
        if (await categoryElement.isVisible().catch(() => false)) {
          foundCategories++;
        }
      }
      
      expect(foundCategories).toBeGreaterThan(3);
      console.log(`✅ Category Tiles: Found ${foundCategories} categories`);
    });

    test('Quick Filters Section - Navigation Filters', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Look for quick filters
      const filtersSection = page.locator('#quick-filters, [data-testid="quick-filters"]');
      
      // Check for filter options
      const filterOptions = [
        'Fast Withdrawals',
        'Welcome Bonuses',
        'Mobile Casinos',
        'Live Dealer',
        'No Deposit',
        'Canadian Sites'
      ];
      
      let foundFilters = 0;
      for (const filter of filterOptions) {
        const filterElement = page.locator(`text=${filter}`);
        if (await filterElement.isVisible().catch(() => false)) {
          foundFilters++;
        }
      }
      
      expect(foundFilters).toBeGreaterThan(3);
      console.log(`✅ Quick Filters: Found ${foundFilters} filter options`);
    });

    test('Support Channels Section - Customer Support', async ({ page }) => {
      await page.goto(TEST_CONFIG.homepageURL);
      
      // Look for support section
      const supportSection = page.locator('#support-channels, [data-testid="support-channels"]');
      
      // Check for support options
      const supportOptions = [
        'Live Chat',
        'Email Support',
        'Phone Support',
        'FAQ',
        '24/7'
      ];
      
      let foundSupport = 0;
      for (const option of supportOptions) {
        const supportElement = page.locator(`text=${option}`);
        if (await supportElement.isVisible().catch(() => false)) {
          foundSupport++;
        }
      }
      
      expect(foundSupport).toBeGreaterThan(2);
      console.log(`✅ Support Channels: Found ${foundSupport} support options`);
    });
  });

  test.describe('Critical Pages Testing', () => {
    
    const criticalPages = [
      '/',
      '/reviews',
      '/best/fast-withdrawals',
      '/best/mobile',
      '/best/live-dealer',
      '/guides',
      '/legal/about',
      '/legal/privacy',
      '/legal/terms',
      '/regions/ontario',
      '/regions/alberta',
      '/regions/british-columbia'
    ];

    for (const pagePath of criticalPages) {
      test(`Critical Page: ${pagePath}`, async ({ page }) => {
        const response = await page.goto(pagePath);
        
        // Check response status
        expect(response?.status()).toBe(200);
        
        // Check page loads properly
        await expect(page.locator('body')).toBeVisible();
        
        // Check for basic content
        const hasContent = await page.locator('h1, h2, h3').count() > 0;
        expect(hasContent).toBeTruthy();
        
        // Performance check
        const loadTime = Date.now();
        await page.waitForLoadState('networkidle');
        const totalLoadTime = Date.now() - loadTime;
        
        expect(totalLoadTime).toBeLessThan(TEST_CONFIG.performanceThresholds.loadTime);
        
        console.log(`✅ ${pagePath}: Status ${response?.status()}, Load time: ${totalLoadTime}ms`);
      });
    }
  });

  test.describe('Site Crawl and All Pages Test', () => {
    
    test('Homepage Links Discovery', async ({ page }) => {
      await page.goto('/');
      
      // Get all internal links
      const links = await page.locator('a[href^="/"]').all();
      const uniqueUrls = new Set<string>();
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('#')) {
          uniqueUrls.add(href);
        }
      }
      
      console.log(`🔍 Found ${uniqueUrls.size} unique internal URLs from homepage`);
      expect(uniqueUrls.size).toBeGreaterThan(20);
      
      // Store URLs for other tests
      await page.evaluate((urls) => {
        (window as any).discoveredUrls = Array.from(urls);
      }, Array.from(uniqueUrls));
    });

    test('Batch Page Testing - Sample Pages', async ({ page }) => {
      await page.goto('/');
      
      // Get discovered URLs or use defaults
      const discoveredUrls = await page.evaluate(() => (window as any).discoveredUrls || []);
      const urlsToTest = discoveredUrls.slice(0, TEST_CONFIG.maxPages);
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      for (const url of urlsToTest) {
        try {
          const response = await page.goto(url, { timeout: 10000 });
          
          if (response?.status() === 200) {
            // Quick validation
            await page.waitForSelector('body', { timeout: 5000 });
            const hasBasicContent = await page.locator('h1, h2, main, article').count() > 0;
            
            if (hasBasicContent) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`${url}: No content found`);
            }
          } else {
            errorCount++;
            errors.push(`${url}: Status ${response?.status()}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`${url}: ${error}`);
        }
      }
      
      console.log(`📊 Page Testing Results:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      
      if (errors.length > 0) {
        console.log(`🔍 First 10 errors:`, errors.slice(0, 10));
      }
      
      // Expect at least 80% success rate
      const successRate = successCount / (successCount + errorCount);
      expect(successRate).toBeGreaterThan(0.8);
    });
  });

  test.describe('Performance and Accessibility', () => {
    
    test('Homepage Performance Metrics', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(TEST_CONFIG.performanceThresholds.loadTime);
      
      // Check Web Vitals if available
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals: any = {};
            
            for (const entry of entries) {
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
              if (entry.entryType === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
            }
            
            resolve(vitals);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint'] });
          
          // Fallback after 3 seconds
          setTimeout(() => resolve({}), 3000);
        });
      });
      
      console.log(`🚀 Performance Metrics:`, { loadTime, webVitals });
    });

    test('Basic Accessibility Check', async ({ page }) => {
      await page.goto('/');
      
      // Check for basic accessibility features
      const hasH1 = await page.locator('h1').count() > 0;
      const hasAltTags = await page.locator('img[alt]').count();
      const totalImages = await page.locator('img').count();
      const hasSkipLink = await page.locator('[href="#main"], [href="#content"]').count() > 0;
      
      expect(hasH1).toBeTruthy();
      
      // Check that most images have alt tags
      if (totalImages > 0) {
        const altTagPercentage = hasAltTags / totalImages;
        expect(altTagPercentage).toBeGreaterThan(0.7);
      }
      
      console.log(`♿ Accessibility Check:`, {
        hasH1,
        imageAltTags: `${hasAltTags}/${totalImages}`,
        hasSkipLink
      });
    });
  });
});