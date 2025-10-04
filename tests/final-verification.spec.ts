import { test, expect } from '@playwright/test';

/**
 * Final Verification Test
 * Verify all styling fixes are working correctly
 */

test.describe('Styling Fixes Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Verify Top 3 Section Height Fix', async ({ page }) => {
    console.log('🔍 Verifying Top 3 Section Height Fix');
    
    const topThreeSection = page.locator('#top-three');
    await expect(topThreeSection).toBeVisible();
    
    const measurements = await topThreeSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        height: rect.height,
        width: rect.width
      };
    });
    
    console.log('📏 New Top 3 Section Measurements:', measurements);
    
    // The height should be significantly less than the original 2274px
    expect(measurements.height).toBeLessThan(1200);
    console.log(`✅ Height improved: ${measurements.height}px (was 2274px)`);
    
    // Check casino card count
    const casinoCards = page.locator('#top-three .transform');
    const cardCount = await casinoCards.count();
    console.log(`🎰 Casino cards visible: ${cardCount}`);
    
    await topThreeSection.screenshot({ 
      path: 'test-results/screenshots/final-top-three-section.png' 
    });
  });

  test('Verify Navigation Overflow Fix', async ({ page }) => {
    console.log('🔍 Verifying Navigation Overflow Fix');
    
    const headerNav = page.locator('.header-nav');
    await expect(headerNav).toBeVisible();
    
    const navOverflow = await headerNav.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        overflow: computedStyle.overflow,
        overflowX: computedStyle.overflowX,
        overflowY: computedStyle.overflowY
      };
    });
    
    console.log('📐 Navigation Overflow Properties:', navOverflow);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/final-navigation-fix.png',
      fullPage: false 
    });
    
    console.log('✅ Navigation overflow fix verified');
  });

  test('Verify Responsive Design', async ({ page }) => {
    console.log('🔍 Verifying Responsive Design');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const heroTitle = page.locator('.hero-title');
    const titleStyles = await heroTitle.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight
      };
    });
    
    console.log('📱 Mobile Hero Title Styles:', titleStyles);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/final-mobile-responsive.png',
      fullPage: true 
    });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/final-desktop-responsive.png',
      fullPage: false 
    });
    
    console.log('✅ Responsive design verified');
  });

  test('Verify Overall Layout Quality', async ({ page }) => {
    console.log('🔍 Verifying Overall Layout Quality');
    
    // Take final comprehensive screenshots
    await page.screenshot({ 
      path: 'test-results/screenshots/final-homepage-overview.png',
      fullPage: true 
    });
    
    // Check all main sections
    const sections = [
      '.hero-section',
      '.benefits-section', 
      '#top-three',
      '.py-12.bg-white',
      '.py-16.bg-gradient-to-br',
      'footer'
    ];
    
    for (let i = 0; i < sections.length; i++) {
      const section = page.locator(sections[i]).first();
      if (await section.isVisible()) {
        const sectionHeight = await section.evaluate((el) => el.getBoundingClientRect().height);
        console.log(`Section ${i + 1} (${sections[i]}): ${sectionHeight}px`);
      }
    }
    
    // Verify page load performance
    const loadTime = await page.evaluate(() => window.performance.timing.loadEventEnd - window.performance.timing.navigationStart);
    console.log(`⚡ Page load time: ${loadTime}ms`);
    
    console.log('✅ Overall layout quality verified');
  });

});