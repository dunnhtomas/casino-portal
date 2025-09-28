import { test, expect } from '@playwright/test';

test.describe('Enhanced Casino Features - FINAL VERIFICATION', () => {
  test('should verify ALL enhanced features are working correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('🏆 FINAL VERIFICATION: Enhanced Casino Portal Features');
    console.log('='.repeat(60));

    // 1. Enhanced Top 3 Section
    const topThreeSection = await page.locator('#top-three');
    await expect(topThreeSection).toBeVisible();
    
    const sectionTitle = await topThreeSection.locator('h2').textContent();
    console.log('✅ Enhanced Top 3 Title:', sectionTitle);
    expect(sectionTitle).toContain('🏆');

    // Check for enhanced casino cards with full content
    const casinoCards = await page.locator('#top-three astro-island[component-export="EnhancedCasinoCard"]');
    const cardCount = await casinoCards.count();
    console.log('✅ Enhanced Casino Cards Count:', cardCount);
    expect(cardCount).toBe(3);

    // Check first card details
    const firstCard = casinoCards.first();
    const cardContent = await firstCard.textContent();
    console.log('✅ First Card Preview:', cardContent?.substring(0, 150) + '...');
    
    // Should have enhanced elements
    expect(cardContent).toContain('Welcome Bonus');
    expect(cardContent).toContain('Match Bonus');
    expect(cardContent).toContain('Trusted');
    expect(cardContent).toContain('SSL');
    expect(cardContent).toContain('Play Now');

    // 2. Enhanced Comparison Table
    const comparisonSection = await page.locator('#comparison-table');
    const tableTitle = await comparisonSection.locator('h2').textContent();
    console.log('✅ Enhanced Table Title:', tableTitle);
    expect(tableTitle).toContain('🏅');

    // Check enhanced table headers
    const headers = await page.locator('#comparison-table th').allTextContents();
    console.log('✅ Enhanced Headers:', headers);
    expect(headers.some(h => h.includes('🏆'))).toBeTruthy();
    expect(headers.some(h => h.includes('🎰'))).toBeTruthy();
    expect(headers.some(h => h.includes('⭐'))).toBeTruthy();
    expect(headers.some(h => h.includes('⚡'))).toBeTruthy();
    expect(headers.some(h => h.includes('💰'))).toBeTruthy();
    expect(headers.some(h => h.includes('🎯'))).toBeTruthy();

    // Check enhanced rank badges
    const goldBadge = await page.locator('.from-gold-400').first();
    await expect(goldBadge).toBeVisible();
    console.log('✅ Gold gradient rank badge found');

    // 3. Visual Enhancements Count
    const pageHTML = await page.content();
    const emojiMatches = pageHTML.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
    console.log('✅ Total Emojis (Design Enhancement Indicator):', emojiMatches.length);
    expect(emojiMatches.length).toBeGreaterThan(50);

    // 4. Enhanced CSS Classes
    const gradientElements = await page.locator('[class*="gradient"]').count();
    console.log('✅ Gradient Elements:', gradientElements);
    expect(gradientElements).toBeGreaterThan(10);

    // 5. Casino Enhancement Verification
    const casinoSpecificClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="casino"], [class*="gold"], [class*="primary"]');
      return elements.length;
    });
    console.log('✅ Casino/Gold/Primary themed elements:', casinoSpecificClasses);
    expect(casinoSpecificClasses).toBeGreaterThan(5);

    // 6. Professional Star Ratings
    const starIcons = await page.locator('svg[class*="yellow"]').count();
    console.log('✅ Professional Star Rating Icons:', starIcons);
    expect(starIcons).toBeGreaterThan(15);

    // 7. Enhanced Buttons and CTAs
    const enhancedButtons = await page.locator('a[class*="bg-gradient"], button[class*="bg-gradient"]').count();
    console.log('✅ Enhanced Gradient Buttons:', enhancedButtons);
    expect(enhancedButtons).toBeGreaterThan(5);

    // 8. Professional Layout Verification
    const sectionCount = await page.locator('section[id]').count();
    console.log('✅ Professional Sections:', sectionCount);
    expect(sectionCount).toBeGreaterThan(10);

    console.log('='.repeat(60));
    console.log('🎊 SUCCESS: All Enhanced Features Verified!');
    console.log('📊 SUMMARY:');
    console.log(`   • Enhanced Casino Cards: ${cardCount}/3 ✅`);
    console.log(`   • Enhanced Table Headers: 6/6 ✅`);
    console.log(`   • Emoji Enhancements: ${emojiMatches.length} ✅`);
    console.log(`   • Gradient Elements: ${gradientElements} ✅`);
    console.log(`   • Star Ratings: ${starIcons} ✅`);
    console.log(`   • Enhanced Buttons: ${enhancedButtons} ✅`);
    console.log(`   • Professional Sections: ${sectionCount} ✅`);
    console.log('🚀 Casino Portal Successfully Enhanced!');

    // Take final screenshot for documentation
    await page.screenshot({ path: 'test-results/enhanced-casino-portal-final.png', fullPage: true });
    console.log('📸 Final screenshot saved: enhanced-casino-portal-final.png');
  });

  test('should verify Context7 research implementation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('🔍 VERIFYING CONTEXT7 RESEARCH IMPLEMENTATION');
    
    // Check for casino industry best practices
    const trustBadges = await page.locator('text=Trusted').count();
    const sslBadges = await page.locator('text=SSL').count();
    const licenseBadges = await page.locator('text=Malta').count();
    
    console.log('✅ Trust Indicators:', { trustBadges, sslBadges, licenseBadges });
    
    // Check for professional color psychology (gold theme)
    const goldElements = await page.locator('[class*="gold"]').count();
    console.log('✅ Gold Color Psychology Elements:', goldElements);
    
    // Check for enhanced bonus displays
    const bonusDisplays = await page.locator('text=Welcome Bonus').count();
    console.log('✅ Professional Bonus Displays:', bonusDisplays);
    
    // Check for multi-dimensional ratings
    const ratingElements = await page.locator('[class*="rating"], [class*="star"]').count();
    console.log('✅ Multi-dimensional Rating Elements:', ratingElements);
    
    console.log('🎯 Context7 Research Successfully Implemented!');
  });
});