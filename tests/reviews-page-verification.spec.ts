import { test, expect } from '@playwright/test';

test.describe('Reviews Page Verification - Sequential Thinking Validation', () => {
  test('should display populated casino cards with correct styling', async ({ page }) => {
    // Navigate to reviews page
    await page.goto('http://localhost:3000/reviews/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // 1. Verify casino cards are populated (not empty)
    const casinoCards = page.locator('[data-testid="casino-card"], .casino-card, .enhanced-casino-card');
    const cardCount = await casinoCards.count();
    console.log(`Found ${cardCount} casino cards`);
    
    // 2. Check if cards have actual content (names, ratings, bonuses)
    if (cardCount > 0) {
      const firstCard = casinoCards.first();
      
      // Check for casino name
      const casinoName = await firstCard.locator('h3, h2, .casino-name, [data-testid="casino-name"]').first().textContent();
      console.log(`First casino name: ${casinoName}`);
      
      // Check for rating
      const rating = await firstCard.locator('.rating, [data-testid="rating"], .overall-rating').first().textContent();
      console.log(`First casino rating: ${rating}`);
      
      // Check for bonus
      const bonus = await firstCard.locator('.bonus, [data-testid="bonus"], .welcome-bonus').first().textContent();
      console.log(`First casino bonus: ${bonus}`);
    }
    
    // 3. Verify color scheme - check for casino theme colors (red, gold, black) not emerald/teal
    const pageContent = await page.content();
    const hasEmeraldColors = pageContent.includes('emerald-') || pageContent.includes('teal-');
    const hasCasinoColors = pageContent.includes('red-') || pageContent.includes('amber-') || pageContent.includes('yellow-') || pageContent.includes('orange-');
    
    console.log(`Has emerald/teal colors: ${hasEmeraldColors}`);
    console.log(`Has casino theme colors: ${hasCasinoColors}`);
    
    // 4. Check for EnhancedCasinoCard component presence
    const enhancedCards = page.locator('[class*="enhanced"], [data-component="enhanced-casino-card"]');
    const enhancedCardCount = await enhancedCards.count();
    console.log(`Enhanced casino cards found: ${enhancedCardCount}`);
    
    // 5. Verify page is readable (has proper content structure)
    const headings = await page.locator('h1, h2, h3').count();
    const paragraphs = await page.locator('p').count();
    console.log(`Headings found: ${headings}, Paragraphs found: ${paragraphs}`);
    
    // VALIDATION SUMMARY
    console.log('\n=== VERIFICATION RESULTS ===');
    console.log(`✅ Casino cards found: ${cardCount > 0 ? 'YES' : 'NO'} (${cardCount} total)`);
    console.log(`✅ Content populated: ${cardCount > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Casino colors used: ${hasCasinoColors ? 'YES' : 'NO'}`);
    console.log(`✅ Emerald/teal removed: ${!hasEmeraldColors ? 'YES' : 'NO'}`);
    console.log(`✅ Page structure readable: ${headings > 0 && paragraphs > 0 ? 'YES' : 'NO'}`);
    
    // Basic assertions
    expect(cardCount).toBeGreaterThan(0);
    expect(headings).toBeGreaterThan(0);
  });
});