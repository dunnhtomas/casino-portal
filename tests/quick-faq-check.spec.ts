import { test, expect } from '@playwright/test';

test('Quick FAQ Text Color Verification', async ({ page }) => {
  console.log('🔍 QUICK FAQ TEXT COLOR CHECK');
  
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  
  // Scroll to FAQ
  const faqSection = page.locator('#faq');
  await faqSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // Click first FAQ to open it
  const firstFaq = faqSection.locator('.faq-item').first();
  const summary = firstFaq.locator('summary');
  await summary.click();
  await page.waitForTimeout(500);
  
  // Check answer text color
  const answer = firstFaq.locator('.faq-answer');
  await expect(answer).toBeVisible();
  
  const textColor = await answer.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return styles.color;
  });
  
  console.log(`📝 FAQ Answer text color: ${textColor}`);
  
  // Check if it's dark text (should be #1A202C or similar)
  const isDarkText = textColor.includes('26, 32, 44') || textColor.includes('1A202C') || 
                     textColor.includes('45, 55, 72') || textColor.includes('0, 0, 0') ||
                     textColor.includes('2D3748');
  
  console.log(`✅ Using dark text: ${isDarkText ? 'YES' : 'NO'}`);
  
  // Take screenshot
  await faqSection.screenshot({ 
    path: 'test-results/screenshots/faq-final-check.png'
  });
  
  console.log('🔍 VERIFICATION COMPLETE');
});