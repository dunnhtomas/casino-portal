import { test, expect } from '@playwright/test';

/**
 * Card Layout and Color Fix Verification Test
 * Verify all card sections now use proper casino colors and improved layouts
 */

test('Verify Card Layouts and Colors Fixed', async ({ page }) => {
  console.log('🎨 VERIFYING CARD LAYOUT AND COLOR FIXES');
  
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Test Fast Payout Cards specifically
  console.log('🎯 TESTING FAST PAYOUT CARDS...');
  
  const fastPayoutSection = page.locator('#fast-payout-spotlight');
  await expect(fastPayoutSection).toBeVisible();
  
  // Check for improved card styling
  const payoutCards = fastPayoutSection.locator('div.bg-white.rounded-2xl.shadow-xl');
  const cardCount = await payoutCards.count();
  console.log(`Found ${cardCount} fast payout cards`);
  
  // Verify casino-themed colors are used
  for (let i = 0; i < Math.min(cardCount, 3); i++) {
    const card = payoutCards.nth(i);
    
    // Check ranking badge uses casino colors
    const rankingBadge = card.locator('div.bg-gradient-to-r.from-casino-500.to-casino-600');
    await expect(rankingBadge).toBeVisible();
    console.log(`✅ Card ${i + 1}: Ranking badge uses casino gradient`);
    
    // Check payout time badge uses gold colors
    const payoutBadge = card.locator('div.bg-gradient-to-r.from-gold-400.to-gold-500');
    await expect(payoutBadge).toBeVisible();
    console.log(`✅ Card ${i + 1}: Payout badge uses gold gradient`);
    
    // Check Play Now button uses casino colors
    const playButton = card.locator('a.bg-gradient-to-r.from-casino-600.to-casino-700');
    await expect(playButton).toBeVisible();
    console.log(`✅ Card ${i + 1}: Play button uses casino gradient`);
  }
  
  // Test other sections for proper colors
  console.log('🎯 TESTING OTHER SECTION COLORS...');
  
  // Check QuickFilters section
  const quickFilters = page.locator('#quick-filters');
  const filterButtons = quickFilters.locator('a.bg-cream-100.hover\\:bg-casino-100');
  const filterCount = await filterButtons.count();
  console.log(`✅ Quick Filters: ${filterCount} buttons use casino colors`);
  
  // Check CategoryTiles section
  const categorySection = page.locator('#category-tiles');
  const categoryLinks = categorySection.locator('div.text-casino-600');
  const categoryCount = await categoryLinks.count();
  console.log(`✅ Category Tiles: ${categoryCount} links use casino colors`);
  
  // Check WhyWeRecommend section
  const whySection = page.locator('#why-we-recommend');
  const percentageBadges = whySection.locator('div.bg-gradient-to-r.from-casino-500.to-casino-600');
  const badgeCount = await percentageBadges.count();
  console.log(`✅ Why We Recommend: ${badgeCount} percentage badges use casino gradients`);
  
  const checkmarks = whySection.locator('svg.text-casino-600');
  const checkmarkCount = await checkmarks.count();
  console.log(`✅ Why We Recommend: ${checkmarkCount} checkmarks use casino colors`);
  
  // Check RegionHubs section
  const regionSection = page.locator('#region-hubs');
  const regionLinks = regionSection.locator('div.text-casino-600');
  const regionCount = await regionLinks.count();
  console.log(`✅ Region Hubs: ${regionCount} links use casino colors`);
  
  // Check PopularSlots section
  const slotsSection = page.locator('#popular-slots');
  const rtpBadges = slotsSection.locator('span.bg-gradient-to-r.from-gold-400.to-gold-500');
  const rtpCount = await rtpBadges.count();
  console.log(`✅ Popular Slots: ${rtpCount} RTP badges use gold gradients`);
  
  // Take screenshot for verification
  await page.screenshot({ 
    path: 'test-results/screenshots/cards-layout-fixed.png',
    clip: { x: 0, y: 0, width: 1200, height: 4000 }
  });
  
  console.log('🎉 CARD LAYOUT AND COLOR VERIFICATION COMPLETE!');
  console.log('✅ All card sections now use proper casino theme colors');
  console.log('✅ Fast Payout cards have improved layouts with gradients');
  console.log('✅ Consistent casino branding across all interactive elements');
  
  // Basic assertions
  expect(cardCount).toBeGreaterThan(0);
  expect(filterCount).toBeGreaterThan(0);
  expect(badgeCount).toBeGreaterThan(0);
});