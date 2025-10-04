/**
 * Comprehensive Section Audit Test Suite
 * Tests all 21 homepage sections for:
 * - Dark theme compliance
 * - Color contrast & readability
 * - Content completeness
 * - Layout integrity
 * 
 * Features:
 * - Smart error tracking (stops at 5 errors)
 * - Parallel execution with 16 workers
 * - Detailed TODO reports for fixes
 */

import { test, expect, Page } from '@playwright/test';
import { 
  resetErrorTracker, 
  shouldStopTesting, 
  recordError, 
  getErrorSummary 
} from './helpers/error-tracker';
import { validateSectionColors, ColorIssue } from './helpers/color-validator';

// Configure parallel execution
test.describe.configure({ mode: 'parallel' });

// Initialize error tracker before all tests
test.beforeAll(async () => {
  resetErrorTracker();
});

// Check error limit before each test
test.beforeEach(async () => {
  if (shouldStopTesting()) {
    test.skip();
  }
});

// Report summary after all tests
test.afterAll(async () => {
  console.log(getErrorSummary());
});

/**
 * Helper function to test a section
 */
async function testSection(
  page: Page,
  sectionName: string,
  sectionSelector: string,
  contentChecks: Array<{
    selector: string;
    description: string;
    required?: boolean;
  }>
) {
  // Navigate to homepage
  await page.goto('/');
  
  // Wait for section to be visible
  const section = page.locator(sectionSelector).first();
  await expect(section).toBeVisible({ timeout: 10000 });
  
  const todos: string[] = [];
  
  // Validate colors
  const colorIssues = await validateSectionColors(section, sectionName);
  if (colorIssues.length > 0) {
    colorIssues.forEach(issue => {
      todos.push(`Fix ${issue.element}: ${issue.issue} - ${issue.recommendation}`);
    });
  }
  
  // Check content elements
  for (const check of contentChecks) {
    const element = section.locator(check.selector).first();
    const isVisible = await element.isVisible().catch(() => false);
    
    if (!isVisible && check.required !== false) {
      todos.push(`Add missing ${check.description} (selector: ${check.selector})`);
    }
  }
  
  // Record error if issues found
  if (todos.length > 0) {
    recordError({
      section: sectionName,
      type: 'Design/Content Issue',
      message: `Found ${todos.length} issue(s) in ${sectionName}`,
      todos
    });
    
    throw new Error(`${sectionName} has ${todos.length} validation issue(s)`);
  }
}

// ============================================================================
// SECTION TESTS - All 21 Sections
// ============================================================================

test('01. Hero Section - Colors & Content', async ({ page }) => {
  await testSection(page, 'Hero Section', 'section:has-text("Find Your Perfect")', [
    { selector: 'h1', description: 'Main heading', required: true },
    { selector: 'button, a[href*="casino"]', description: 'CTA button', required: true },
    { selector: 'p', description: 'Description text', required: false }
  ]);
});

test('02. Benefits Section - Colors & Content', async ({ page }) => {
  await testSection(page, 'Benefits Section', 'section:has-text("Why Choose")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"]', description: 'Benefits grid', required: true },
    { selector: 'svg, img', description: 'Icons/images', required: false }
  ]);
});

test('03. Top Three Casinos - Colors & Content', async ({ page }) => {
  await testSection(page, 'Top Three Section', 'section:has-text("Top 3")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Casino cards (should have 3)', required: true },
    { selector: 'button, a', description: 'Casino CTAs', required: true }
  ]);
});

test('04. Quick Filters - Colors & Content', async ({ page }) => {
  await testSection(page, 'Quick Filters Section', 'section:has-text("Quick Filters"), section:has-text("Filter")', [
    { selector: 'button, [role="button"]', description: 'Filter buttons', required: true },
    { selector: 'h2, h3', description: 'Section heading', required: true }
  ]);
});

test('05. Comparison Table - Colors & Content', async ({ page }) => {
  await testSection(page, 'Comparison Table', 'section:has-text("Compare"), table, [class*="comparison"]', [
    { selector: 'table, [role="table"], [class*="grid"]', description: 'Table structure', required: true },
    { selector: 'th, [role="columnheader"], h3', description: 'Table headers', required: true },
    { selector: 'td, [role="cell"], [class*="row"]', description: 'Table cells', required: true }
  ]);
});

test('06. Category Tiles - Colors & Content', async ({ page }) => {
  await testSection(page, 'Category Tiles', 'section:has-text("Categories"), section:has-text("Browse")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'a[href*="/category"], a[href*="/casinos"]', description: 'Category links', required: true },
    { selector: '[class*="grid"]', description: 'Tiles grid', required: true }
  ]);
});

test('07. Why We Recommend - Colors & Content', async ({ page }) => {
  await testSection(page, 'Why We Recommend', 'section:has-text("Why We Recommend"), section:has-text("Our Methodology")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: 'p, li', description: 'Recommendation points', required: true }
  ]);
});

test('08. Fast Payout Spotlight - Colors & Content', async ({ page }) => {
  await testSection(page, 'Fast Payout Spotlight', 'section:has-text("Fast Payout"), section:has-text("Quick Withdrawal")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'a, button', description: 'Casino links/buttons', required: true }
  ]);
});

test('09. Regional Hubs - Colors & Content', async ({ page }) => {
  await testSection(page, 'Regional Hubs', 'section:has-text("Regional"), section:has-text("Country"), section:has-text("Location")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'a[href*="/country"], a[href*="/region"]', description: 'Region links', required: true }
  ]);
});

test('10. Popular Slots - Colors & Content', async ({ page }) => {
  await testSection(page, 'Popular Slots', 'section:has-text("Popular Slots"), section:has-text("Slot Games")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div, [class*="slot"]', description: 'Slot cards', required: true },
    { selector: 'button, a', description: 'Play buttons', required: true }
  ]);
});

test('11. Free Games Teaser - Colors & Content', async ({ page }) => {
  await testSection(page, 'Free Games Teaser', 'section:has-text("Free"), section:has-text("Demo"), section:has-text("Practice")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'a[href*="/games"]', description: 'Games links', required: true },
    { selector: 'p', description: 'Description text', required: true }
  ]);
});

test('12. Banking Methods - Colors & Content', async ({ page }) => {
  await testSection(page, 'Banking Methods', 'section:has-text("Banking"), section:has-text("Payment")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Payment method cards', required: true },
    { selector: 'span, div', description: 'Method details', required: true }
  ]);
});

test('13. Bonus Types Explainer - Colors & Content', async ({ page }) => {
  await testSection(page, 'Bonus Types Explainer', 'section:has-text("Bonus"), section:has-text("Match Bonus")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Bonus type cards (4 types)', required: true },
    { selector: 'strong, [class*="alert"]', description: 'Terms warning', required: true }
  ]);
});

test('14. Safety Signals - Colors & Content', async ({ page }) => {
  await testSection(page, 'Safety Signals', 'section:has-text("Safety"), section:has-text("License"), section:has-text("Security")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"]', description: 'Safety criteria grid', required: true },
    { selector: 'li, p', description: 'Safety points', required: true }
  ]);
});

test('15. Expert Team - Colors & Content', async ({ page }) => {
  await testSection(page, 'Expert Team', 'section:has-text("Expert"), section:has-text("Team")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Team member cards', required: true },
    { selector: 'img, [class*="avatar"]', description: 'Team photos', required: false }
  ]);
});

test('16. Support Channels - Colors & Content', async ({ page }) => {
  await testSection(page, 'Support Channels', 'section:has-text("Support"), section:has-text("Contact"), section:has-text("Help")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Support channel cards', required: true },
    { selector: 'svg, [class*="icon"]', description: 'Channel icons', required: true }
  ]);
});

test('17. FAQ Section - Colors & Content', async ({ page }) => {
  await testSection(page, 'FAQ Section', 'section:has-text("FAQ"), section:has-text("Frequently Asked"), section:has-text("Questions")', [
    { selector: 'h2', description: 'Section heading', required: true },
    { selector: 'details, [class*="accordion"], button', description: 'FAQ items', required: true },
    { selector: 'summary, h3, h4', description: 'Questions', required: true }
  ]);
});

test('18. Responsible Gambling CTA - Colors & Content', async ({ page }) => {
  await testSection(page, 'Responsible Gambling', 'section:has-text("Responsible"), section:has-text("Gambling"), section:has-text("18+")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: '[class*="grid"] > div', description: 'Action cards', required: true },
    { selector: 'a, [href*="help"], [href*="support"]', description: 'Help resource links', required: true },
    { selector: '[class*="alert"], [class*="warning"]', description: 'Warning message', required: false }
  ]);
});

test('19. Affiliate Disclosure - Colors & Content', async ({ page }) => {
  await testSection(page, 'Affiliate Disclosure', 'section:has-text("Affiliate"), section:has-text("Disclosure"), section:has-text("commission")', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'p, li', description: 'Disclosure text', required: true },
    { selector: 'a[href*="/legal"], a[href*="/terms"]', description: 'Legal links', required: false }
  ]);
});

test('20. Brand Strip - Colors & Content', async ({ page }) => {
  await testSection(page, 'Brand Strip', 'section:has-text("Casino"), [class*="brand"]', [
    { selector: '[class*="grid"] > div, [class*="flex"] > div', description: 'Brand logos (8 brands)', required: true },
    { selector: 'span, div', description: 'Brand names/placeholders', required: true },
    { selector: 'svg, [class*="badge"]', description: 'Trust indicators', required: false }
  ]);
});

test('21. Newsletter Signup - Colors & Content', async ({ page }) => {
  await testSection(page, 'Newsletter Signup', 'section:has-text("Newsletter"), section:has-text("Stay Updated"), form[action*="formspree"]', [
    { selector: 'h2, h3', description: 'Section heading', required: true },
    { selector: 'form', description: 'Signup form', required: true },
    { selector: 'input[type="email"]', description: 'Email input', required: true },
    { selector: 'button[type="submit"], input[type="submit"]', description: 'Submit button', required: true },
    { selector: 'input[type="checkbox"]', description: 'Interest checkboxes', required: false }
  ]);
});
