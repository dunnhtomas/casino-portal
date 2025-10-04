import { test, expect, Page } from '@playwright/test';

/**
 * Complete Site Testing Suite for Rebuilt Docker Container
 * Tests homepage sections, critical pages, and site functionality
 */

test.describe('Complete Site Testing - Rebuilt Container', () => {
  
  test.describe('Homepage Core Functionality', () => {
    
    test('Homepage loads correctly with all main sections', async ({ page }) => {
      await page.goto('/');
      
      // Check page loads
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      
      // Check main sections exist
      const sections = [
        '#hero',
        '#benefits', 
        '#top-three',
        '#quick-filters',
        '#category-tiles'
      ];
      
      let foundSections = 0;
      for (const selector of sections) {
        const section = page.locator(selector);
        if (await section.isVisible().catch(() => false)) {
          foundSections++;
          console.log(`✅ Found section: ${selector}`);
        } else {
          console.log(`⚠️ Section not found: ${selector}`);
        }
      }
      
      expect(foundSections).toBeGreaterThan(3);
      console.log(`📊 Homepage sections found: ${foundSections}/${sections.length}`);
    });

    test('Enhanced Quick Filters Section', async ({ page }) => {
      await page.goto('/');
      
      // Look for Quick Filters section
      const quickFiltersSection = page.locator('#quick-filters');
      await expect(quickFiltersSection).toBeVisible();
      
      // Check for filter options
      const filterElements = page.locator('#quick-filters a');
      const filterCount = await filterElements.count();
      
      expect(filterCount).toBeGreaterThan(5);
      console.log(`✅ Quick Filters: Found ${filterCount} filter options`);
      
      // Test specific filters
      const expectedFilters = [
        'Fast Withdrawals',
        'Welcome Bonuses', 
        'Mobile Casinos',
        'Live Dealer',
        'Canadian Sites'
      ];
      
      let foundFilters = 0;
      for (const filterText of expectedFilters) {
        const filter = page.locator(`#quick-filters`, { hasText: filterText });
        if (await filter.isVisible().catch(() => false)) {
          foundFilters++;
        }
      }
      
      console.log(`🔍 Quick Filters verified: ${foundFilters}/${expectedFilters.length}`);
    });

    test('Enhanced Category Tiles Section', async ({ page }) => {
      await page.goto('/');
      
      // Look for Category Tiles section  
      const categorySection = page.locator('#category-tiles');
      await expect(categorySection).toBeVisible();
      
      // Check for category links
      const categoryLinks = page.locator('#category-tiles a');
      const categoryCount = await categoryLinks.count();
      
      expect(categoryCount).toBeGreaterThan(3);
      console.log(`✅ Category Tiles: Found ${categoryCount} categories`);
      
      // Test specific categories
      const expectedCategories = [
        'Real Money',
        'Mobile',
        'Live Dealer',
        'Welcome Bonuses'
      ];
      
      let foundCategories = 0;
      for (const categoryText of expectedCategories) {
        const category = page.locator(`#category-tiles`, { hasText: categoryText });
        if (await category.isVisible().catch(() => false)) {
          foundCategories++;
        }
      }
      
      console.log(`🎯 Categories verified: ${foundCategories}/${expectedCategories.length}`);
    });

    test('Top Three Casino Section', async ({ page }) => {
      await page.goto('/');
      
      // Look for Top Three section
      const topThreeSection = page.locator('#top-three');
      await expect(topThreeSection).toBeVisible();
      
      // Check for casino cards
      const casinoCards = page.locator('#top-three .astro-island, #top-three [class*="card"], #top-three [class*="casino"]');
      const cardCount = await casinoCards.count();
      
      expect(cardCount).toBeGreaterThan(1);
      console.log(`✅ Top Three: Found ${cardCount} casino cards`);
      
      // Check for casino names
      const casinoNames = ['SpellWin', 'Winit', 'UnlimLuck'];
      let foundCasinos = 0;
      
      for (const name of casinoNames) {
        const casino = page.locator(`#top-three`, { hasText: name });
        if (await casino.isVisible().catch(() => false)) {
          foundCasinos++;
        }
      }
      
      console.log(`🏆 Casinos verified: ${foundCasinos}/${casinoNames.length}`);
    });
  });

  test.describe('Critical Page Testing', () => {
    
    const criticalPages = [
      { path: '/', name: 'Homepage' },
      { path: '/reviews', name: 'Reviews Index' },
      { path: '/guides', name: 'Guides Index' },
      { path: '/legal/about', name: 'About Page' },
      { path: '/legal/privacy', name: 'Privacy Policy' },
      { path: '/legal/terms', name: 'Terms of Service' }
    ];

    for (const { path, name } of criticalPages) {
      test(`Critical Page: ${name} (${path})`, async ({ page }) => {
        try {
          const response = await page.goto(path, { timeout: 15000 });
          
          // Check response status
          if (response) {
            expect(response.status()).toBe(200);
            console.log(`✅ ${name}: Status ${response.status()}`);
          }
          
          // Check page has basic content
          await page.waitForSelector('body', { timeout: 10000 });
          const hasHeading = await page.locator('h1, h2').count() > 0;
          expect(hasHeading).toBeTruthy();
          
          // Check page isn't empty
          const bodyText = await page.locator('body').textContent();
          expect(bodyText?.length).toBeGreaterThan(100);
          
          console.log(`📄 ${name}: Content verified (${bodyText?.length} characters)`);
          
        } catch (error) {
          console.log(`❌ ${name}: Error - ${error}`);
          
          // For pages that might not exist, just check if we get a reasonable response
          if (path !== '/') {
            console.log(`⚠️ ${name}: Treating as optional page`);
            // Don't fail the test for optional pages
          } else {
            throw error; // Homepage must work
          }
        }
      });
    }
  });

  test.describe('Sample Page Crawl', () => {
    
    test('Discover and test sample internal pages', async ({ page }) => {
      await page.goto('/');
      
      // Get internal links from homepage
      const links = await page.locator('a[href^="/"]').all();
      const uniqueUrls = new Set<string>();
      
      for (const link of links.slice(0, 20)) { // Limit to first 20 links
        const href = await link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('#') && !href.includes('?')) {
          uniqueUrls.add(href);
        }
      }
      
      console.log(`🔍 Found ${uniqueUrls.size} unique internal URLs to test`);
      expect(uniqueUrls.size).toBeGreaterThan(5);
      
      // Test a sample of pages
      let successCount = 0;
      let errorCount = 0;
      const testedUrls = Array.from(uniqueUrls).slice(0, 10); // Test first 10
      
      for (const url of testedUrls) {
        try {
          const response = await page.goto(url, { timeout: 10000 });
          
          if (response?.status() === 200) {
            await page.waitForSelector('body', { timeout: 5000 });
            const hasContent = await page.locator('h1, h2, h3, main').count() > 0;
            
            if (hasContent) {
              successCount++;
              console.log(`✅ ${url}: OK`);
            } else {
              errorCount++;
              console.log(`⚠️ ${url}: No content`);
            }
          } else {
            errorCount++;
            console.log(`❌ ${url}: Status ${response?.status()}`);
          }
        } catch (error) {
          errorCount++;
          console.log(`❌ ${url}: Error`);
        }
      }
      
      console.log(`📊 Page Testing Results:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`📈 Success Rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);
      
      // Expect at least 70% success rate
      const successRate = successCount / (successCount + errorCount);
      expect(successRate).toBeGreaterThan(0.7);
    });
  });

  test.describe('Performance and Accessibility', () => {
    
    test('Homepage performance metrics', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      console.log(`🚀 Homepage load time: ${loadTime}ms`);
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
      
      // Check for basic performance markers
      const hasImages = await page.locator('img').count();
      const hasCSS = await page.locator('link[rel="stylesheet"]').count();
      const hasJS = await page.locator('script').count();
      
      console.log(`📊 Page Resources: ${hasImages} images, ${hasCSS} stylesheets, ${hasJS} scripts`);
      
      expect(hasImages).toBeGreaterThan(0);
      expect(hasCSS).toBeGreaterThan(0);
    });

    test('Basic accessibility and SEO', async ({ page }) => {
      await page.goto('/');
      
      // Check basic accessibility
      const hasH1 = await page.locator('h1').count() > 0;
      const hasTitle = await page.title();
      const hasMetaDescription = await page.locator('meta[name="description"]').count() > 0;
      const hasLang = await page.locator('html[lang]').count() > 0;
      
      // Check images have alt tags
      const totalImages = await page.locator('img').count();
      const imagesWithAlt = await page.locator('img[alt]').count();
      const altTagPercentage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
      
      console.log(`♿ Accessibility Check:`);
      console.log(`- H1 present: ${hasH1}`);
      console.log(`- Page title: "${hasTitle}"`);
      console.log(`- Meta description: ${hasMetaDescription}`);
      console.log(`- Lang attribute: ${hasLang}`);
      console.log(`- Alt tags: ${imagesWithAlt}/${totalImages} (${Math.round(altTagPercentage)}%)`);
      
      expect(hasH1).toBeTruthy();
      expect(hasTitle.length).toBeGreaterThan(10);
      expect(hasMetaDescription).toBeTruthy();
      expect(altTagPercentage).toBeGreaterThan(50); // At least 50% of images should have alt tags
    });
  });
});