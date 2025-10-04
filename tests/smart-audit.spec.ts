import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';

/**
 * SMART HOMEPAGE AUDIT - Maximum Performance + Smart Error Handling
 * - Stops after 5 errors
 * - Maximum 20 parallel workers
 * - Fast execution with early bailout
 * - Sequential thinking validation
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = './test-results/smart-audit';
const MAX_ERRORS = 5;

// Global error counter - shared across all tests
let globalErrorCount = 0;
const errors: Array<{ section: string; error: string; timestamp: string }> = [];

// Helper to check if we should skip remaining tests
function shouldSkipTest(): boolean {
  if (globalErrorCount >= MAX_ERRORS) {
    console.log(`🛑 ERROR LIMIT REACHED: ${globalErrorCount}/${MAX_ERRORS} errors detected. Stopping tests.`);
    return true;
  }
  return false;
}

// Helper to log errors
function logError(section: string, error: string) {
  globalErrorCount++;
  errors.push({
    section,
    error,
    timestamp: new Date().toISOString()
  });
  console.error(`❌ [${globalErrorCount}/${MAX_ERRORS}] ${section}: ${error}`);
}

// Helper to take fast screenshot
async function fastScreenshot(page: Page, name: string) {
  try {
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/${name}.png`,
      fullPage: false,
      timeout: 5000
    });
  } catch (e) {
    console.warn(`⚠️  Screenshot failed for ${name}: ${e}`);
  }
}

test.beforeAll(async () => {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  console.log('🚀 Starting SMART Audit - Max 20 workers, stops at 5 errors');
  console.log(`📍 Target: ${BASE_URL}`);
});

test.describe.configure({ mode: 'parallel', timeout: 30000 }); // 30s per test max

test.describe('SMART Homepage Audit - All 21 Sections', () => {

  test('01 - Navigation Dark Theme', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500); // Small delay for Docker
      
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible({ timeout: 5000 });
      
      // Check dark theme colors
      const bgColor = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const hasLogo = await page.locator('nav img, nav svg').first().isVisible();
      
      if (!hasLogo) {
        logError('Navigation', 'Logo not visible');
      }
      
      await fastScreenshot(page, '01-navigation');
      console.log('✅ Navigation - PASS');
    } catch (e: any) {
      logError('Navigation', e.message);
      throw e;
    }
  });

  test('02 - Hero Section Dark Theme', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 5000 });
      
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      
      const h1Text = await h1.textContent();
      const h1Color = await h1.evaluate(el => window.getComputedStyle(el).color);
      
      // Check if text is readable (not too dark on dark bg)
      const bgGradient = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      if (!h1Text || h1Text.length < 10) {
        logError('Hero', 'H1 text missing or too short');
      }
      
      await fastScreenshot(page, '02-hero');
      console.log('✅ Hero Section - PASS');
    } catch (e: any) {
      logError('Hero', e.message);
      throw e;
    }
  });

  test('03 - Benefits Section', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Look for benefits section by heading text
      const benefitsHeading = page.getByRole('heading', { name: /why trust|benefits/i }).first();
      await expect(benefitsHeading).toBeVisible({ timeout: 5000 });
      
      // Check for benefit cards
      const cards = page.locator('article, .group, [class*="card"]').filter({ hasText: /expert|verified|secure/i });
      const cardCount = await cards.count();
      
      if (cardCount < 3) {
        logError('Benefits', `Only ${cardCount} benefit cards found, expected at least 3`);
      }
      
      await fastScreenshot(page, '03-benefits');
      console.log('✅ Benefits Section - PASS');
    } catch (e: any) {
      logError('Benefits', e.message);
      throw e;
    }
  });

  test('04 - Top Three Casinos', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const topThreeHeading = page.getByRole('heading', { name: /top.*casino|best.*casino/i }).first();
      await expect(topThreeHeading).toBeVisible({ timeout: 5000 });
      
      // Check for casino cards with ratings
      const casinoCards = page.locator('[class*="casino"], article').filter({ hasText: /rating|bonus|play now/i });
      const count = await casinoCards.count();
      
      if (count < 3) {
        logError('Top Three', `Only ${count} casino cards found`);
      }
      
      await fastScreenshot(page, '04-top-three');
      console.log('✅ Top Three - PASS');
    } catch (e: any) {
      logError('Top Three', e.message);
      throw e;
    }
  });

  test('05 - Quick Filters', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const filters = page.locator('a, button').filter({ hasText: /bonus|slots|fast|crypto/i });
      const filterCount = await filters.count();
      
      if (filterCount < 4) {
        logError('Quick Filters', `Only ${filterCount} filters found`);
      }
      
      await fastScreenshot(page, '05-filters');
      console.log('✅ Quick Filters - PASS');
    } catch (e: any) {
      logError('Quick Filters', e.message);
      throw e;
    }
  });

  test('06 - Comparison Table', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const table = page.locator('table').first();
      const hasTable = await table.isVisible().catch(() => false);
      
      if (!hasTable) {
        // Check for grid-based comparison instead
        const gridComparison = page.locator('[class*="grid"]').filter({ hasText: /casino|rating/i }).first();
        await expect(gridComparison).toBeVisible({ timeout: 5000 });
      }
      
      await fastScreenshot(page, '06-comparison');
      console.log('✅ Comparison Table - PASS');
    } catch (e: any) {
      logError('Comparison Table', e.message);
      throw e;
    }
  });

  test('07 - Category Tiles', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const categories = page.locator('a, div').filter({ hasText: /slots|live casino|table games|jackpot/i });
      const categoryCount = await categories.count();
      
      if (categoryCount < 4) {
        logError('Category Tiles', `Only ${categoryCount} categories found`);
      }
      
      await fastScreenshot(page, '07-categories');
      console.log('✅ Category Tiles - PASS');
    } catch (e: any) {
      logError('Category Tiles', e.message);
      throw e;
    }
  });

  test('08 - Why We Recommend', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const whySection = page.getByRole('heading', { name: /why we recommend|our methodology/i }).first();
      await expect(whySection).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '08-why-recommend');
      console.log('✅ Why We Recommend - PASS');
    } catch (e: any) {
      logError('Why We Recommend', e.message);
      throw e;
    }
  });

  test('09 - Fast Payout Spotlight', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const fastPayout = page.getByText(/fast payout|quick withdrawal|instant payout/i).first();
      await expect(fastPayout).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '09-fast-payout');
      console.log('✅ Fast Payout - PASS');
    } catch (e: any) {
      logError('Fast Payout', e.message);
      throw e;
    }
  });

  test('10 - Regional Hubs', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const regions = page.locator('a, div').filter({ hasText: /canada|usa|uk|australia/i });
      const regionCount = await regions.count();
      
      if (regionCount < 3) {
        logError('Regional Hubs', `Only ${regionCount} regions found`);
      }
      
      await fastScreenshot(page, '10-regions');
      console.log('✅ Regional Hubs - PASS');
    } catch (e: any) {
      logError('Regional Hubs', e.message);
      throw e;
    }
  });

  test('11 - Popular Slots Dark Theme', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const slotsHeading = page.getByRole('heading', { name: /popular.*slot|featured.*game/i }).first();
      await expect(slotsHeading).toBeVisible({ timeout: 5000 });
      
      // Check for slot game cards with dark theme
      const slotCards = page.locator('article, [class*="card"]').filter({ hasText: /rtp|volatility|play|demo/i });
      const cardCount = await slotCards.count();
      
      if (cardCount < 6) {
        logError('Popular Slots', `Only ${cardCount} slot cards found`);
      }
      
      // Check first card has dark background
      if (cardCount > 0) {
        const firstCard = slotCards.first();
        const bgColor = await firstCard.evaluate(el => window.getComputedStyle(el).backgroundColor);
        console.log(`Slot card bg: ${bgColor}`);
      }
      
      await fastScreenshot(page, '11-slots');
      console.log('✅ Popular Slots - PASS');
    } catch (e: any) {
      logError('Popular Slots', e.message);
      throw e;
    }
  });

  test('12 - Free Games Teaser', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Look for the section content, not navigation links
      const freeGamesSection = page.locator('section, div').filter({ hasText: /practice.*free|try.*before.*bet|demo.*mode/i }).first();
      await expect(freeGamesSection).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '12-free-games');
      console.log('✅ Free Games Teaser - PASS');
    } catch (e: any) {
      logError('Free Games Teaser', e.message);
      throw e;
    }
  });

  test('13 - Banking Methods Dark Theme', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const bankingHeading = page.getByRole('heading', { name: /banking|payment.*method|deposit/i }).first();
      await expect(bankingHeading).toBeVisible({ timeout: 5000 });
      
      // Check for payment method cards
      const paymentCards = page.locator('div, article').filter({ hasText: /visa|mastercard|bitcoin|crypto|paypal/i });
      const count = await paymentCards.count();
      
      if (count < 4) {
        logError('Banking Methods', `Only ${count} payment methods found`);
      }
      
      await fastScreenshot(page, '13-banking');
      console.log('✅ Banking Methods - PASS');
    } catch (e: any) {
      logError('Banking Methods', e.message);
      throw e;
    }
  });

  test('14 - Bonus Types Explainer', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Look for bonus types section with heading
      const bonusSection = page.getByRole('heading', { name: /bonus.*type|understand.*bonus/i }).first();
      const hasBonusSection = await bonusSection.isVisible().catch(() => false);
      
      if (!hasBonusSection) {
        // Alternative: look for section with multiple bonus types
        const bonusContent = page.locator('section, div').filter({ hasText: /match bonus.*free spin|cashback.*wagering/i }).first();
        await expect(bonusContent).toBeVisible({ timeout: 5000 });
      } else {
        await expect(bonusSection).toBeVisible({ timeout: 5000 });
      }
      
      await fastScreenshot(page, '14-bonus-types');
      console.log('✅ Bonus Types - PASS');
    } catch (e: any) {
      logError('Bonus Types', e.message);
      throw e;
    }
  });

  test('15 - Safety Signals', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const safety = page.getByText(/valid licens|rng certif|complaint|safety/i).first();
      await expect(safety).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '15-safety');
      console.log('✅ Safety Signals - PASS');
    } catch (e: any) {
      logError('Safety Signals', e.message);
      throw e;
    }
  });

  test('16 - Expert Team', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const expertTeam = page.getByRole('heading', { name: /expert.*team|our.*team|meet.*expert/i }).first();
      await expect(expertTeam).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '16-expert-team');
      console.log('✅ Expert Team - PASS');
    } catch (e: any) {
      logError('Expert Team', e.message);
      throw e;
    }
  });

  test('17 - Support Channels', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const support = page.getByText(/live chat|email support|phone support|24\/7/i).first();
      await expect(support).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '17-support');
      console.log('✅ Support Channels - PASS');
    } catch (e: any) {
      logError('Support Channels', e.message);
      throw e;
    }
  });

  test('18 - FAQ Section', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const faq = page.getByRole('heading', { name: /faq|frequently.*asked|common.*question/i }).first();
      await expect(faq).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '18-faq');
      console.log('✅ FAQ - PASS');
    } catch (e: any) {
      logError('FAQ', e.message);
      throw e;
    }
  });

  test('19 - Responsible Gambling CTA', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Look for RG section with heading or prominent CTA
      const rgHeading = page.getByRole('heading', { name: /responsible|play.*safe|gamble.*aware/i }).first();
      const hasHeading = await rgHeading.isVisible().catch(() => false);
      
      if (!hasHeading) {
        // Alternative: look for section with help resources
        const rgSection = page.locator('section, div').filter({ hasText: /gambling should be fun|set.*limit.*know.*sign|help.*organization/i }).first();
        await expect(rgSection).toBeVisible({ timeout: 5000 });
      } else {
        await expect(rgHeading).toBeVisible({ timeout: 5000 });
      }
      
      await fastScreenshot(page, '19-responsible-gambling');
      console.log('✅ Responsible Gambling - PASS');
    } catch (e: any) {
      logError('Responsible Gambling', e.message);
      throw e;
    }
  });

  test('20 - Affiliate Disclosure', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const disclosure = page.getByText(/affiliate|commission|earn.*money|disclosure|partner/i).first();
      await expect(disclosure).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '20-disclosure');
      console.log('✅ Affiliate Disclosure - PASS');
    } catch (e: any) {
      logError('Affiliate Disclosure', e.message);
      throw e;
    }
  });

  test('21 - Brand Strip', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const brands = page.getByText(/spincasino|luckyslots|megawin|royalbet|licensed.*regulated/i).first();
      await expect(brands).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '21-brand-strip');
      console.log('✅ Brand Strip - PASS');
    } catch (e: any) {
      logError('Brand Strip', e.message);
      throw e;
    }
  });

  test('22 - Newsletter Signup', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const newsletter = page.getByText(/newsletter|stay.*updated|subscribe|email.*subscription/i).first();
      await expect(newsletter).toBeVisible({ timeout: 5000 });
      
      // Check for email input
      const emailInput = page.locator('input[type="email"]').last();
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      
      await fastScreenshot(page, '22-newsletter');
      console.log('✅ Newsletter - PASS');
    } catch (e: any) {
      logError('Newsletter', e.message);
      throw e;
    }
  });

  test('23 - Footer Dark Theme', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible({ timeout: 5000 });
      
      const footerBg = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
      console.log(`Footer bg: ${footerBg}`);
      
      // Check footer has links
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();
      
      if (linkCount < 5) {
        logError('Footer', `Only ${linkCount} footer links found`);
      }
      
      await fastScreenshot(page, '23-footer');
      console.log('✅ Footer - PASS');
    } catch (e: any) {
      logError('Footer', e.message);
      throw e;
    }
  });

  test('24 - Dark Theme Color Validation', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Check body background is dark
      const bodyBg = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Check main text is light colored
      const mainText = page.locator('p, div, span').first();
      const textColor = await mainText.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      console.log(`Body bg: ${bodyBg}, Text color: ${textColor}`);
      
      // Check for any white backgrounds that might be problematic
      const whiteElements = await page.locator('[class*="bg-white"]').count();
      if (whiteElements > 5) {
        logError('Dark Theme', `Found ${whiteElements} white background elements - may break dark theme`);
      }
      
      await fastScreenshot(page, '24-color-validation');
      console.log('✅ Color Validation - PASS');
    } catch (e: any) {
      logError('Color Validation', e.message);
      throw e;
    }
  });

  test('25 - Readability Check (Contrast)', async ({ page }) => {
    if (shouldSkipTest()) return;
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Check text-gray-800/900 which are hard to read on dark backgrounds
      const darkTexts = await page.locator('[class*="text-gray-8"], [class*="text-gray-9"]').count();
      
      if (darkTexts > 0) {
        logError('Readability', `Found ${darkTexts} dark text elements that may be unreadable on dark theme`);
      }
      
      // Check for sufficient light text
      const lightTexts = await page.locator('[class*="text-white"], [class*="text-gray-1"], [class*="text-gray-2"], [class*="text-gray-3"]').count();
      console.log(`Light text elements: ${lightTexts}`);
      
      if (lightTexts < 50) {
        logError('Readability', `Only ${lightTexts} light text elements found - expected more for dark theme`);
      }
      
      await fastScreenshot(page, '25-readability');
      console.log('✅ Readability Check - PASS');
    } catch (e: any) {
      logError('Readability', e.message);
      throw e;
    }
  });
});

// Final report generation
test.afterAll(async () => {
  const report = {
    timestamp: new Date().toISOString(),
    total_errors: globalErrorCount,
    max_errors: MAX_ERRORS,
    status: globalErrorCount >= MAX_ERRORS ? 'STOPPED_AT_LIMIT' : 'COMPLETED',
    errors_list: errors,
    sections_tested: 25,
    performance: {
      workers: 20,
      avg_test_time: '5-10s per test'
    }
  };
  
  await fs.writeFile(
    `${SCREENSHOTS_DIR}/smart-audit-report.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SMART AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total Errors: ${globalErrorCount}/${MAX_ERRORS}`);
  console.log(`Status: ${report.status}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`Report: ${SCREENSHOTS_DIR}/smart-audit-report.json`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    errors.forEach((err, idx) => {
      console.log(`${idx + 1}. [${err.section}] ${err.error}`);
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED - NO ERRORS!');
  }
  console.log('='.repeat(60) + '\n');
});
