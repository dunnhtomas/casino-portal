import { test, expect } from '@playwright/test';

test.describe('React Component Debug Test', () => {
  test('should debug React component loading with test component', async ({ page }) => {
    // Enable console logging
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React hydration
    await page.waitForTimeout(3000);

    console.log('🧪 Testing React Component Integration...');

    // Check if our React test component area is visible
    const testContainer = await page.locator('#react-test-container');
    await expect(testContainer).toBeVisible();
    console.log('✅ React test container found');

    // Look for Astro islands (should be the React components)
    const astroIslands = await page.locator('astro-island');
    const islandCount = await astroIslands.count();
    console.log('🏝️ Astro islands found:', islandCount);

    if (islandCount > 0) {
      // Get details about the islands
      for (let i = 0; i < Math.min(islandCount, 5); i++) {
        const island = astroIslands.nth(i);
        const componentName = await island.getAttribute('component-export');
        const clientDirective = await island.getAttribute('client');
        const props = await island.getAttribute('props');
        
        console.log(`Island ${i + 1}:`, {
          component: componentName,
          client: clientDirective,
          hasProps: props ? props.length : 0
        });
      }
    }

    // Check if the EnhancedCasinoCard component loaded
    const componentScript = await page.locator('script[src*="EnhancedCasinoCard"]');
    const scriptExists = await componentScript.count() > 0;
    console.log('📜 EnhancedCasinoCard script loaded:', scriptExists);

    // Check for React component rendering
    const reactContent = await page.evaluate(() => {
      // Look for elements that indicate React has rendered
      const reactElements = document.querySelectorAll('[data-testid], [class*="casino-card"], [class*="btn-casino"]');
      return Array.from(reactElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        testId: el.getAttribute('data-testid')
      }));
    });

    console.log('⚛️ React-rendered elements found:', reactContent.length);
    if (reactContent.length > 0) {
      console.log('React elements:', reactContent.slice(0, 5));
    }

    // Print browser console messages
    console.log('📝 Browser console messages:');
    consoleMessages.forEach((msg, i) => {
      if (i < 10) console.log(`  ${msg}`);
    });

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'test-results/react-debug.png', fullPage: true });
    console.log('📸 Screenshot saved: react-debug.png');

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('- Test container visible:', await testContainer.isVisible());
    console.log('- Astro islands found:', islandCount);
    console.log('- EnhancedCasinoCard script:', scriptExists);
    console.log('- React elements rendered:', reactContent.length);
    console.log('- Console messages:', consoleMessages.length);
  });
});