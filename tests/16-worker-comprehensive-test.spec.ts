import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * COMPREHENSIVE 16-WORKER SMART TEST SUITE
 * Max 5 Failures | Astro + Tailwind v3 Verification | All 2000+ Pages
 * 
 * Features:
 * ✅ 16 parallel workers for maximum speed
 * ✅ Fail-fast after 5 failures to save time
 * ✅ Smart Astro SSG verification
 * ✅ Comprehensive Tailwind v3 checks
 * ✅ Content and error validation
 * ✅ Performance monitoring
 * ✅ Responsive design testing
 */

// Load all URLs from sitemap
const urlsFilePath = path.join(process.cwd(), 'urls-to-test.json');
let allUrls: string[] = [];

try {
  const urlsContent = fs.readFileSync(urlsFilePath, 'utf8');
  const sitemapUrls = JSON.parse(urlsContent);
  
  // Convert sitemap URLs to relative paths for testing
  allUrls = sitemapUrls.map((url: string) => {
    // Convert https://bestcasinoportal.com/path to /path
    const relativePath = url.replace('https://bestcasinoportal.com', '') || '/';
    return relativePath;
  });
  
  console.log(`🚀 16-WORKER COMPREHENSIVE TEST SUITE`);
  console.log(`📊 Loaded ${allUrls.length} URLs for testing`);
  console.log(`⚡ Using 16 parallel workers`);
  console.log(`🛑 Max 5 failures before stopping`);
  console.log(`🎯 Testing: Astro SSG + Tailwind v3 + Content`);
  console.log(`===============================================`);
} catch (error) {
  console.error('❌ Error loading URLs:', error);
  allUrls = ['/']; // Fallback to homepage only
}

// Categorize URLs for smart testing strategy
const urlCategories = {
  homepage: allUrls.filter(url => url === '/'),
  bestPages: allUrls.filter(url => url.startsWith('/best/')),
  regions: allUrls.filter(url => url.startsWith('/regions/')),
  guides: allUrls.filter(url => url.startsWith('/guides/')),
  legal: allUrls.filter(url => url.startsWith('/legal/')),
  reviews: allUrls.filter(url => url.startsWith('/reviews/'))
};

console.log(`📈 Smart URL Distribution:
  🏠 Homepage: ${urlCategories.homepage.length}
  🏆 Best Pages: ${urlCategories.bestPages.length} 
  🌍 Regions: ${urlCategories.regions.length}
  📚 Guides: ${urlCategories.guides.length}
  ⚖️ Legal: ${urlCategories.legal.length}
  🎰 Casino Reviews: ${urlCategories.reviews.length}
  📱 Total URLs: ${allUrls.length}`);

/**
 * 🚀 MAIN COMPREHENSIVE TEST SUITE
 * 16 Workers | Max 5 Failures | All URLs
 */
test.describe('16-Worker Comprehensive Site Verification', () => {
  
  // Configure test to use all workers efficiently
  test.describe.configure({ mode: 'parallel' });
  
  for (const url of allUrls) {
    test(`🔍 VERIFY: ${url}`, async ({ page }) => {
      const testStartTime = Date.now();
      console.log(`🔍 [Worker ${test.info().workerIndex}] Testing: ${url}`);
      
      // ==========================================
      // 🌐 BASIC PAGE LOADING VERIFICATION
      // ==========================================
      
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      
      // Wait for complete page load
      await page.waitForLoadState('networkidle');
      
      // ==========================================
      // 🚀 ASTRO SSG VERIFICATION
      // ==========================================
      
      // 1. Verify page title is properly rendered
      const title = await page.title();
      expect(title).not.toBe('');
      expect(title).not.toContain('404');
      expect(title).not.toContain('Error');
      expect(title).not.toContain('Not Found');
      
      // 2. Check for Astro SSG indicators
      const hasAstroElements = await page.$$('[data-astro-cid]');
      expect(hasAstroElements.length).toBeGreaterThan(0);
      
      // 3. Verify no Astro hydration errors
      const astroErrors = await page.evaluate(() => {
        const logs = (window as any).testLogs || [];
        return logs.some((log: string) => 
          log.includes('astro') || 
          log.includes('hydration') ||
          log.includes('SSR') ||
          log.includes('server side')
        );
      });
      expect(astroErrors).toBeFalsy();
      
      // ==========================================
      // 🎨 TAILWIND V3 VERIFICATION
      // ==========================================
      
      // 1. Verify Tailwind CSS is loaded and functional
      const tailwindPresent = await page.evaluate(() => {
        // Check for Tailwind in stylesheets
        const stylesheets = Array.from(document.styleSheets);
        const hasTailwindInCSS = stylesheets.some(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            return rules.some(rule => 
              rule.cssText.includes('--tw-') || 
              rule.cssText.includes('tailwind') ||
              rule.cssText.includes('.tw-') ||
              rule.cssText.includes('@tailwind')
            );
          } catch {
            return false;
          }
        });
        
        // Check for Tailwind CSS custom properties (v3 feature)
        const rootStyles = getComputedStyle(document.documentElement);
        const hasTailwindVars = 
          rootStyles.getPropertyValue('--tw-ring-color') !== '' ||
          rootStyles.getPropertyValue('--tw-ring-offset-width') !== '' ||
          rootStyles.getPropertyValue('--tw-ring-offset-color') !== '';
        
        // Check for common Tailwind classes in body/html
        const bodyClasses = document.body.className || '';
        const htmlClasses = document.documentElement.className || '';
        const hasTailwindClasses = 
          bodyClasses.match(/\\b(bg-|text-|flex|grid|p-|m-|w-|h-)/) ||
          htmlClasses.match(/\\b(bg-|text-|flex|grid|p-|m-|w-|h-)/);
        
        return hasTailwindInCSS || hasTailwindVars || hasTailwindClasses;
      });
      expect(tailwindPresent).toBeTruthy();
      
      // 2. Verify CSS Grid/Flexbox (Tailwind utilities work)
      const layoutUtilities = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="flex"], [class*="grid"], [class*="container"]');
        return elements.length > 0;
      });
      expect(layoutUtilities).toBeTruthy();
      
      // ==========================================
      // 📝 CONTENT VERIFICATION
      // ==========================================
      
      // 1. Verify meaningful content exists
      const bodyText = await page.textContent('body');
      expect(bodyText?.trim().length).toBeGreaterThan(200);
      
      // 2. Check for error states
      expect(bodyText).not.toContain('404 Not Found');
      expect(bodyText).not.toContain('Page not found');
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('Something went wrong');
      expect(bodyText).not.toContain('Error 500');
      expect(bodyText).not.toContain('Access Denied');
      
      // ==========================================
      // 🎯 PAGE-SPECIFIC VERIFICATION
      // ==========================================
      
      if (url.startsWith('/reviews/')) {
        // 🎰 Casino Review Page Checks
        await expect(page.locator('.review-hero, .casino-hero, [class*="hero"]')).toBeVisible();
        await expect(page.locator('.review-brand-info, .casino-info, [class*="brand"]')).toBeVisible();
        
        // Verify casino rating/score is displayed
        const hasRating = await page.locator('[data-rating], .rating, [class*="rating"], [class*="score"]').count() > 0 ||
                          await page.getByText(/\\d+\\.\\d+\/10|\\d+\/10|\\d+\\.\\d+ stars|Score:/i).count() > 0;
        expect(hasRating).toBeTruthy();
        
        // Verify bonus information exists
        const hasBonus = await page.locator('[class*="bonus"], [class*="offer"]').count() > 0 ||
                        await page.getByText(/bonus|welcome|deposit|free spins/i).count() > 0;
        expect(hasBonus).toBeTruthy();
        
      } else if (url === '/') {
        // 🏠 Homepage Specific Checks
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('nav, .nav, .navigation')).toBeVisible();
        
        // Check for main navigation elements
        const hasMainNav = await page.locator('nav a, .nav a, .navigation a').count() > 3;
        expect(hasMainNav).toBeTruthy();
        
      } else if (url.startsWith('/best/')) {
        // 🏆 Best Pages Checks
        await expect(page.locator('h1')).toContainText(/Best|Top|Leading/i);
        
        // Verify casino listings exist
        const hasCasinoList = await page.locator('[class*="casino"], [class*="card"], .review-card').count() > 2;
        expect(hasCasinoList).toBeTruthy();
        
      } else if (url.startsWith('/guides/')) {
        // 📚 Guide Pages Checks
        await expect(page.locator('h1')).toBeVisible();
        const hasContent = await page.locator('article, .content, main, [class*="guide"]').count() > 0;
        expect(hasContent).toBeTruthy();
        
      } else if (url.startsWith('/regions/')) {
        // 🌍 Regional Pages Checks
        await expect(page.locator('h1')).toBeVisible();
        const hasRegionalContent = await page.getByText(/Ontario|Alberta|British Columbia|Canada|Provincial/i).count() > 0;
        expect(hasRegionalContent).toBeTruthy();
      }
      
      // ==========================================
      // 🚨 ERROR & CONSOLE VERIFICATION
      // ==========================================
      
      // Set up console error tracking
      await page.evaluate(() => {
        (window as any).testErrors = [];
        const originalError = console.error;
        console.error = (...args) => {
          (window as any).testErrors.push(args.join(' '));
          originalError.apply(console, args);
        };
      });
      
      // Wait for potential async errors
      await page.waitForTimeout(1500);
      
      // Check for critical JavaScript errors
      const criticalErrors = await page.evaluate(() => {
        return ((window as any).testErrors || []).filter((error: string) => 
          error.includes('TypeError') || 
          error.includes('ReferenceError') ||
          error.includes('SyntaxError') ||
          error.includes('Cannot read properties') ||
          error.includes('is not defined')
        );
      });
      expect(criticalErrors.length).toBe(0);
      
      // ==========================================
      // 🏗️ LAYOUT & STRUCTURE VERIFICATION
      // ==========================================
      
      // Verify essential layout elements
      const hasNavigation = await page.locator('nav, .nav, .navigation, header').count() > 0;
      const hasMainContent = await page.locator('main, .main, .content, article').count() > 0;
      const hasFooter = await page.locator('footer, .footer').count() > 0;
      
      expect(hasNavigation || hasMainContent).toBeTruthy();
      
      // Verify no major layout breaks
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.viewportSize();
      if (viewportWidth) {
        expect(bodyWidth).toBeLessThan(viewportWidth.width + 100); // Allow small overflow
      }
      
      // ==========================================
      // ⚡ PERFORMANCE MONITORING
      // ==========================================
      
      const testDuration = Date.now() - testStartTime;
      expect(testDuration).toBeLessThan(15000); // Should complete within 15 seconds
      
      console.log(`✅ [Worker ${test.info().workerIndex}] ${url} verified in ${testDuration}ms`);
    });
  }
});

/**
 * 🔥 PERFORMANCE BENCHMARK TESTS
 * Sample critical pages for speed verification
 */
test.describe('Performance Verification', () => {
  const criticalUrls = [
    '/',
    allUrls.find(url => url.startsWith('/reviews/')) || '/reviews/spellwin',
    allUrls.find(url => url.startsWith('/best/')) || '/best/real-money',
    allUrls.find(url => url.startsWith('/guides/')) || '/guides'
  ].filter(Boolean);

  for (const url of criticalUrls) {
    test(`⚡ Performance: ${url}`, async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(url as string);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Verify reasonable load times for live site
      expect(loadTime).toBeLessThan(8000);
      
      console.log(`⚡ ${url}: ${loadTime}ms`);
    });
  }
});

/**
 * 📱 RESPONSIVE DESIGN VERIFICATION
 * Mobile compatibility testing
 */
test.describe('Mobile Responsive Tests', () => {
  const testUrls = ['/', '/reviews/spellwin', '/best/real-money'];
  
  for (const url of testUrls) {
    test(`📱 Mobile: ${url}`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(400);
      
      // Verify content is visible
      const hasVisibleContent = await page.locator('h1, h2, main').count() > 0;
      expect(hasVisibleContent).toBeTruthy();
      
      console.log(`📱 Mobile verified: ${url}`);
    });
  }
});