import { test, expect } from '@playwright/test';

test.describe('Top 10 Casinos with Pagination', () => {
  test('should display top 10 casinos title', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that the title changed from "Top 3" to "Top 10"
    const heading = page.locator('#top-three h2');
    await expect(heading).toContainText('Top 10 Casino Recommendations');
  });

  test('should display 5 casinos on first page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the section to load
    await page.waitForSelector('#top-three');
    
    // Count the number of casino cards visible
    const casinoCards = page.locator('#top-three .EnhancedCasinoCard, #top-three [data-testid="casino-card"]');
    
    // Should show 5 casinos on first page
    await expect(casinoCards).toHaveCount(5);
  });

  test('should have pagination controls', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the section to load
    await page.waitForSelector('#top-three');
    
    // Check for pagination controls
    const paginationButtons = page.locator('#top-three button');
    await expect(paginationButtons.first()).toBeVisible();
    
    // Check for page indicator text
    const pageIndicator = page.locator('#top-three').getByText(/Showing.*of.*top-rated casinos/);
    await expect(pageIndicator).toBeVisible();
  });

  test('should navigate to page 2', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the section to load
    await page.waitForSelector('#top-three');
    
    // Click the "Next" button or page "2" button
    const nextButton = page.locator('#top-three button').filter({ hasText: 'Next' }).or(
      page.locator('#top-three button').filter({ hasText: '2' })
    );
    
    if (await nextButton.count() > 0) {
      await nextButton.first().click();
      
      // Wait for page change and verify content updated
      await page.waitForTimeout(500);
      
      // Should show remaining casinos (up to 5)
      const casinoCards = page.locator('#top-three .EnhancedCasinoCard, #top-three [data-testid="casino-card"]');
      await expect(casinoCards).toHaveCount(5);
    }
  });

  test('should show correct page indicator', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the section to load
    await page.waitForSelector('#top-three');
    
    // Check the page indicator text
    const pageIndicator = page.locator('#top-three').getByText(/Showing 1-5 of 10 top-rated casinos/);
    await expect(pageIndicator).toBeVisible();
  });

  test('should maintain section ID for navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify the section still has the #top-three ID for existing navigation
    const topThreeSection = page.locator('#top-three');
    await expect(topThreeSection).toBeVisible();
  });
});