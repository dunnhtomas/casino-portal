import { test, expect } from '@playwright/test';

test('Verify /best page has dark theme', async ({ page }) => {
  console.log('🎨 TESTING /BEST PAGE DARK THEME');
  
  await page.goto('http://localhost:3000/best/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/best-page-full.png', fullPage: true });

  // Check main element background (the one with bg-gradient)
  const mainElement = page.locator('main.bg-gradient-to-br').first();
  const mainStyles = await mainElement.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      className: el.className
    };
  });
  
  console.log('🎨 Main Element Styles:', mainStyles);

  // Check breadcrumbs
  const breadcrumbs = page.locator('.breadcrumbs-nav');
  if (await breadcrumbs.isVisible()) {
    const breadcrumbStyles = await breadcrumbs.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        className: el.className
      };
    });
    
    console.log('🎨 Breadcrumbs Styles:', breadcrumbStyles);
  }

  // Check bonus categories section
  const bonusSection = page.locator('#bonus-categories');
  if (await bonusSection.isVisible()) {
    await bonusSection.scrollIntoViewIfNeeded();
    
    const bonusSectionStyles = await bonusSection.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage
      };
    });
    
    console.log('🎨 Bonus Categories Section Styles:', bonusSectionStyles);

    // Check individual cards
    const cards = bonusSection.locator('div[class*="bg-"]');
    const cardCount = await cards.count();
    console.log(`📦 Found ${cardCount} cards`);
    
    if (cardCount > 0) {
      const firstCardStyles = await cards.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          className: el.className
        };
      });
      
      console.log('🎨 First Card Styles:', firstCardStyles);
    }
  }

  // Check if dark theme is applied
  const isDarkTheme = mainStyles.backgroundImage.includes('17, 24, 39') && 
                      mainStyles.backgroundImage.includes('31, 41, 55');
  expect(isDarkTheme).toBe(true);
  console.log('✅ Dark theme verified on /best page');
  
  // Verify breadcrumbs are dark
  const breadcrumbsAreDark = await page.locator('.breadcrumbs-nav').evaluate((el) => {
    const bgColor = window.getComputedStyle(el).backgroundColor;
    return bgColor.includes('17, 24, 39');
  });
  expect(breadcrumbsAreDark).toBe(true);
  console.log('✅ Breadcrumbs are dark themed');
});
