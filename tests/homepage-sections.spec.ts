import { test, expect } from '@playwright/test';

/**
 * Homepage Section-by-Section Screenshot Test
 * This test captures viewport screenshots of each section for Tailwind CSS analysis
 */

test.describe('Homepage Section Screenshots', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for any JavaScript to finish (navigation fix, etc.)
    await page.waitForTimeout(2000);
  });

  test('Header and Hero Section', async ({ page }) => {
    // Screenshot the header and hero section
    const headerSection = page.locator('header, .hero-section, [data-section="hero"], h1').first();
    
    await expect(headerSection).toBeVisible();
    await page.screenshot({ 
      path: 'test-results/screenshots/01-header-hero.png',
      fullPage: false 
    });
    
    console.log('✅ Header and Hero section screenshot captured');
  });

  test('Top 3 Casinos Section', async ({ page }) => {
    // Find and screenshot the top casinos section
    const topCasinosSection = page.locator('[data-section="top-casinos"], .top-casinos, .casino-cards').first();
    
    if (await topCasinosSection.isVisible()) {
      await topCasinosSection.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/02-top-casinos.png',
        fullPage: false 
      });
      console.log('✅ Top 3 Casinos section screenshot captured');
    } else {
      // Fallback: screenshot area with casino cards
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.screenshot({ 
        path: 'test-results/screenshots/02-top-casinos-fallback.png',
        fullPage: false 
      });
      console.log('⚠️ Top 3 Casinos section fallback screenshot captured');
    }
  });

  test('Benefits/Features Section', async ({ page }) => {
    // Look for benefits or features section
    const benefitsSection = page.locator('[data-section="benefits"], .benefits, .features, .advantages').first();
    
    if (await benefitsSection.isVisible()) {
      await benefitsSection.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/03-benefits-features.png',
        fullPage: false 
      });
      console.log('✅ Benefits/Features section screenshot captured');
    } else {
      // Scroll to middle area
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.screenshot({ 
        path: 'test-results/screenshots/03-benefits-features-fallback.png',
        fullPage: false 
      });
      console.log('⚠️ Benefits/Features section fallback screenshot captured');
    }
  });

  test('How We Rate Section', async ({ page }) => {
    // Look for rating methodology section
    const ratingSection = page.locator('[data-section="rating"], .rating-methodology, .how-we-rate').first();
    
    if (await ratingSection.isVisible()) {
      await ratingSection.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/04-how-we-rate.png',
        fullPage: false 
      });
      console.log('✅ How We Rate section screenshot captured');
    } else {
      // Scroll further down
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.screenshot({ 
        path: 'test-results/screenshots/04-how-we-rate-fallback.png',
        fullPage: false 
      });
      console.log('⚠️ How We Rate section fallback screenshot captured');
    }
  });

  test('FAQ Section', async ({ page }) => {
    // Look for FAQ section
    const faqSection = page.locator('[data-section="faq"], .faq, .frequently-asked').first();
    
    if (await faqSection.isVisible()) {
      await faqSection.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/05-faq.png',
        fullPage: false 
      });
      console.log('✅ FAQ section screenshot captured');
    } else {
      // Scroll to bottom area
      await page.evaluate(() => window.scrollTo(0, 1600));
      await page.screenshot({ 
        path: 'test-results/screenshots/05-faq-fallback.png',
        fullPage: false 
      });
      console.log('⚠️ FAQ section fallback screenshot captured');
    }
  });

  test('Footer Section', async ({ page }) => {
    // Screenshot the footer
    const footerSection = page.locator('footer').first();
    
    if (await footerSection.isVisible()) {
      await footerSection.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/06-footer.png',
        fullPage: false 
      });
      console.log('✅ Footer section screenshot captured');
    } else {
      // Scroll to very bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.screenshot({ 
        path: 'test-results/screenshots/06-footer-fallback.png',
        fullPage: false 
      });
      console.log('⚠️ Footer section fallback screenshot captured');
    }
  });

  test('Full Page Overview', async ({ page }) => {
    // Take a full page screenshot for overall layout analysis
    await page.screenshot({ 
      path: 'test-results/screenshots/00-full-page-overview.png',
      fullPage: true 
    });
    console.log('✅ Full page overview screenshot captured');
  });

  test('Mobile Viewport Analysis', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshots
    await page.screenshot({ 
      path: `test-results/screenshots/mobile-00-full-page-${browserName}.png`,
      fullPage: true 
    });
    
    // Mobile header
    await page.screenshot({ 
      path: `test-results/screenshots/mobile-01-header-${browserName}.png`,
      fullPage: false 
    });
    
    // Scroll and capture mobile sections
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.screenshot({ 
      path: `test-results/screenshots/mobile-02-middle-${browserName}.png`,
      fullPage: false 
    });
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ 
      path: `test-results/screenshots/mobile-03-footer-${browserName}.png`,
      fullPage: false 
    });
    
    console.log(`✅ Mobile viewport screenshots captured for ${browserName}`);
  });

});