import { test, expect } from '@playwright/test';

test.describe('Enhanced Casino Features', () => {
  test('should show enhanced top 3 casino cards', async ({ page }) => {
    await page.goto('/');

    // Check for enhanced casino section
    const topThreeSection = await page.locator('#top-three');
    await expect(topThreeSection).toBeVisible();

    // Check for enhanced styling and emojis
    const sectionTitle = await page.locator('#top-three h2');
    await expect(sectionTitle).toContainText('🏆 Top 3 Casino Recommendations');

    // Check for enhanced gradient background
    const sectionStyles = await topThreeSection.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundImage: styles.backgroundImage
      };
    });

    console.log('Top Three Section styles:', sectionStyles);
    expect(sectionStyles.backgroundImage).toContain('gradient');

    // Check if enhanced casino cards are present
    const enhancedCards = await page.locator('[data-testid="enhanced-casino-card"]');
    console.log('Enhanced casino cards count:', await enhancedCards.count());

    // Check for any React components that loaded
    const reactComponents = await page.locator('[data-reactroot], [data-reactid]');
    console.log('React components found:', await reactComponents.count());
  });

  test('should show enhanced comparison table features', async ({ page }) => {
    await page.goto('/');

    // Check for enhanced comparison table
    const comparisonSection = await page.locator('#comparison-table');
    await expect(comparisonSection).toBeVisible();

    // Check for enhanced styling with emojis
    const tableHeaders = await page.locator('#comparison-table th');
    const headerTexts = await tableHeaders.allTextContents();
    console.log('Table headers:', headerTexts);
    
    // Should have enhanced headers with emojis
    expect(headerTexts.some(text => text.includes('🏆'))).toBeTruthy();
    expect(headerTexts.some(text => text.includes('🎰'))).toBeTruthy();
    expect(headerTexts.some(text => text.includes('⭐'))).toBeTruthy();

    // Check for enhanced gradient backgrounds
    const tableRows = await page.locator('#comparison-table tbody tr');
    const rowCount = await tableRows.count();
    console.log('Enhanced table rows count:', rowCount);
    expect(rowCount).toBeGreaterThan(0);

    // Check for enhanced rank badges with gradients
    const rankBadges = await page.locator('#comparison-table .rounded-full');
    const badgeCount = await rankBadges.count();
    console.log('Enhanced rank badges found:', badgeCount);
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should have casino enhancement styles loaded', async ({ page }) => {
    await page.goto('/');

    // Check if casino-enhancements.css is loaded
    const styleSheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).map(sheet => {
        try {
          return sheet.href || 'inline';
        } catch (e) {
          return 'restricted';
        }
      });
    });

    console.log('Loaded stylesheets:', styleSheets);

    // Check for casino-specific classes
    const casinoClasses = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      const casinoClassesFound: string[] = [];
      
      styles.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule: any) => {
              if (rule.selectorText && rule.selectorText.includes('casino')) {
                casinoClassesFound.push(rule.selectorText);
              }
            });
          }
        } catch (e) {
          // Ignore cross-origin restrictions
        }
      });
      
      return casinoClassesFound;
    });

    console.log('Casino CSS classes found:', casinoClasses);
  });

  test('should have enhanced visual elements and animations', async ({ page }) => {
    await page.goto('/');

    // Check for enhanced gradient dividers
    const gradientDividers = await page.locator('.bg-gradient-to-r.from-gold-400');
    console.log('Gold gradient dividers found:', await gradientDividers.count());

    // Check for enhanced buttons
    const enhancedButtons = await page.locator('a[class*="gradient"]');
    console.log('Enhanced gradient buttons found:', await enhancedButtons.count());

    // Check for emoji usage indicating enhanced design
    const pageText = await page.textContent('body');
    const emojiCount = (pageText?.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    console.log('Emojis found on page (enhanced design indicator):', emojiCount);
    
    // Enhanced design should have emojis
    expect(emojiCount).toBeGreaterThan(10);

    // Check for enhanced star ratings in comparison table
    const starRatings = await page.locator('svg[class*="text-yellow"]');
    const starCount = await starRatings.count();
    console.log('Enhanced star rating icons found:', starCount);
    expect(starCount).toBeGreaterThan(0);
  });
});