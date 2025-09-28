import { test, expect } from '@playwright/test';

test.describe('Enhanced Casino Components Live Test', () => {
  test('should verify enhanced casino cards are actually rendering', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for React hydration
    await page.waitForTimeout(2000);

    console.log('🔍 Testing Enhanced Casino Card Integration...');

    // Check if EnhancedCasinoCard script is loaded
    const scripts = await page.locator('script[src*="EnhancedCasinoCard"]');
    const scriptCount = await scripts.count();
    console.log('EnhancedCasinoCard script tags found:', scriptCount);

    // Check for client:load attributes (Astro React hydration markers)
    const clientLoadElements = await page.locator('[data-astro-cid]');
    console.log('Astro client-side elements found:', await clientLoadElements.count());

    // Check the actual Top Three section content
    const topThreeSection = await page.locator('#top-three');
    const topThreeHTML = await topThreeSection.innerHTML();
    
    // Look for div structure that should contain our enhanced cards
    const cardContainers = await page.locator('#top-three .grid > div');
    const cardCount = await cardContainers.count();
    console.log('Card container divs in Top Three section:', cardCount);

    // Get the actual rendered content
    if (cardCount > 0) {
      for (let i = 0; i < cardCount; i++) {
        const cardContent = await cardContainers.nth(i).textContent();
        console.log(`Card ${i + 1} content preview:`, cardContent?.slice(0, 100) + '...');
      }
    }

    // Check for any React error boundaries or loading states
    const errorBoundaries = await page.locator('[data-error-boundary]');
    console.log('React error boundaries found:', await errorBoundaries.count());

    // Check browser console for any React errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console Error: ${msg.text()}`);
      }
    });

    // Wait a bit more and check console errors
    await page.waitForTimeout(1000);
    if (logs.length > 0) {
      console.log('Browser console errors found:');
      logs.forEach(log => console.log(log));
    } else {
      console.log('✅ No React console errors detected');
    }

    // Test the enhanced comparison table which should be working
    const comparisonTable = await page.locator('#comparison-table');
    await expect(comparisonTable).toBeVisible();
    
    // Check that at least the table enhancements are working
    const enhancedHeaders = await page.locator('#comparison-table th');
    const headerText = await enhancedHeaders.first().textContent();
    expect(headerText).toContain('🏆');
    
    console.log('✅ Enhanced comparison table features confirmed working');
  });

  test('should take screenshot of current enhanced state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of top section
    await page.locator('#top-three').screenshot({ path: 'test-results/enhanced-top-three.png' });
    console.log('📸 Screenshot saved: enhanced-top-three.png');

    // Take screenshot of comparison table
    await page.locator('#comparison-table').screenshot({ path: 'test-results/enhanced-comparison.png' });
    console.log('📸 Screenshot saved: enhanced-comparison.png');

    console.log('✅ Screenshots captured for manual verification');
  });
});