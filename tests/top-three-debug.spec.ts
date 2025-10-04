import { test, expect } from '@playwright/test';

test('Fix Top 3 Casino Section Layout', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Find the exact Top 3 section
  const topThreeSection = page.locator('section[id="top-three"], section:has-text("Top 3 Casino Recommendations")');
  
  if (await topThreeSection.isVisible()) {
    console.log('📍 Top 3 section found and visible');
    
    // Get detailed measurements
    const measurements = await topThreeSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      return {
        height: rect.height,
        width: rect.width,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        backgroundColor: computedStyle.backgroundColor,
        position: computedStyle.position,
        overflow: computedStyle.overflow,
        display: computedStyle.display
      };
    });
    
    console.log('📏 Top 3 Section Measurements:', measurements);
    
    // Check for child elements causing issues
    const childrenInfo = await topThreeSection.evaluate((el) => {
      const children = Array.from(el.children);
      return children.map((child, index) => {
        const rect = child.getBoundingClientRect();
        return {
          index,
          tagName: child.tagName,
          className: child.className,
          height: rect.height,
          width: rect.width
        };
      });
    });
    
    console.log('👶 Child Elements:', childrenInfo);
    
    // Scroll to the section and take screenshot
    await topThreeSection.scrollIntoViewIfNeeded();
    await topThreeSection.screenshot({ 
      path: 'test-results/screenshots/top-three-section-detailed.png' 
    });
    
    // Check each casino card
    const casinoCards = page.locator('section[id="top-three"] .transform, section[id="top-three"] [class*="casino"], section[id="top-three"] .grid > div');
    const cardCount = await casinoCards.count();
    console.log(`🎰 Found ${cardCount} casino cards`);
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = casinoCards.nth(i);
      const cardInfo = await card.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          height: rect.height,
          width: rect.width,
          className: el.className
        };
      });
      console.log(`Card ${i + 1}:`, cardInfo);
    }
    
  } else {
    console.log('❌ Top 3 section not found');
  }
});