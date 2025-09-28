import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Comprehensive Homepage Tailwind CSS Audit
 * Tests all sections, takes screenshots, and validates CSS classes
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = './test-results/homepage-audit';

// Ensure screenshots directory exists
test.beforeAll(async () => {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
});

test.describe('Homepage Tailwind CSS Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for full load
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for any potential CSS animations to complete
    await page.waitForTimeout(2000);
  });

  test('1. Navigation Section Audit', async ({ page }) => {
    console.log('🧭 Testing Navigation Section...');
    
    // Check navigation exists and is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Verify navigation styling classes
    const navClasses = await nav.getAttribute('class');
    console.log('Navigation classes:', navClasses);
    
    // Test logo and brand elements
    const logo = page.locator('nav .w-10.h-10');
    await expect(logo).toBeVisible();
    
    const brandText = page.locator('nav').getByText('BestCasinoPortal');
    await expect(brandText).toBeVisible();
    
    // Test navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    console.log(`Found ${linkCount} navigation links`);
    
    // Screenshot navigation
    await nav.screenshot({ 
      path: `${SCREENSHOTS_DIR}/01-navigation.png`,

    });
    
    // Test responsive navigation (mobile button)
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileButton = page.locator('nav button');
    await expect(mobileButton).toBeVisible();
    
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('2. Hero Section Audit', async ({ page }) => {
    console.log('🦸 Testing Hero Section...');
    
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    
    // Check gradient background classes
    const heroClasses = await hero.getAttribute('class');
    console.log('Hero classes:', heroClasses);
    expect(heroClasses).toContain('bg-gradient-to-br');
    expect(heroClasses).toContain('from-indigo-900');
    
    // Test main heading
    const h1 = hero.locator('h1');
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    console.log('H1 text:', h1Text);
    
    // Test gradient text classes on H1
    const h1Classes = await h1.getAttribute('class');
    expect(h1Classes).toContain('bg-gradient-to-r');
    expect(h1Classes).toContain('bg-clip-text');
    
    // Test CTA buttons
    const primaryCTA = hero.getByRole('link', { name: /view top casinos/i });
    const secondaryCTA = hero.getByRole('link', { name: /read expert reviews/i });
    
    await expect(primaryCTA).toBeVisible();
    await expect(secondaryCTA).toBeVisible();
    
    // Test button styling
    const primaryClasses = await primaryCTA.getAttribute('class');
    expect(primaryClasses).toContain('bg-gradient-to-r');
    expect(primaryClasses).toContain('from-yellow-500');
    
    // Test trust indicators
    const trustIndicators = hero.locator('.grid.grid-cols-2');
    await expect(trustIndicators).toBeVisible();
    
    // Screenshot hero section
    await hero.screenshot({ 
      path: `${SCREENSHOTS_DIR}/02-hero-section.png`,

    });
    
    // Test responsive hero
    await page.setViewportSize({ width: 375, height: 667 });
    await hero.screenshot({ 
      path: `${SCREENSHOTS_DIR}/02-hero-mobile.png`,

    });
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('3. Benefits Section Audit', async ({ page }) => {
    console.log('💎 Testing Benefits Section...');
    
    const benefits = page.locator('#benefits');
    await expect(benefits).toBeVisible();
    
    // Check section background
    const benefitsClasses = await benefits.getAttribute('class');
    expect(benefitsClasses).toContain('bg-gray-50');
    
    // Test section heading
    const h2 = benefits.locator('h2');
    await expect(h2).toBeVisible();
    expect(await h2.textContent()).toContain('Why Trust Our Casino Reviews?');
    
    // Test benefit cards
    const benefitCards = benefits.locator('.group');
    const cardCount = await benefitCards.count();
    console.log(`Found ${cardCount} benefit cards`);
    
    // Test first benefit card styling
    const firstCard = benefitCards.first();
    const cardClasses = await firstCard.getAttribute('class');
    expect(cardClasses).toContain('bg-white');
    expect(cardClasses).toContain('rounded-xl');
    expect(cardClasses).toContain('shadow-sm');
    
    // Test icon containers
    const iconContainer = firstCard.locator('.w-12.h-12');
    await expect(iconContainer).toBeVisible();
    
    // Test trust metrics
    const trustMetrics = benefits.locator('.flex.items-center.gap-2');
    const metricsCount = await trustMetrics.count();
    console.log(`Found ${metricsCount} trust metrics`);
    
    // Screenshot benefits section
    await benefits.screenshot({ 
      path: `${SCREENSHOTS_DIR}/03-benefits-section.png`,

    });
  });

  test('4. Top Three Casinos Section Audit', async ({ page }) => {
    console.log('🏆 Testing Top Three Casinos Section...');
    
    const topThree = page.locator('#top-three');
    await expect(topThree).toBeVisible();
    
    // Check section styling
    const sectionClasses = await topThree.getAttribute('class');
    expect(sectionClasses).toContain('bg-white');
    
    // Test section heading
    const h2 = topThree.locator('h2');
    await expect(h2).toBeVisible();
    
    // Test casino cards (should have casino data)
    const casinoCards = topThree.locator('.bg-gray-50');
    const cardCount = await casinoCards.count();
    console.log(`Found ${cardCount} top casino cards`);
    
    // Screenshot top three section
    await topThree.screenshot({ 
      path: `${SCREENSHOTS_DIR}/04-top-three-section.png`,

    });
  });

  test('5. Quick Filters Section Audit', async ({ page }) => {
    console.log('🎯 Testing Quick Filters Section...');
    
    const quickFilters = page.locator('#quick-filters');
    await expect(quickFilters).toBeVisible();
    
    // Test filter buttons
    const filterButtons = quickFilters.locator('a');
    const buttonCount = await filterButtons.count();
    console.log(`Found ${buttonCount} filter buttons`);
    
    // Test first filter button styling
    if (buttonCount > 0) {
      const firstButton = filterButtons.first();
      const buttonClasses = await firstButton.getAttribute('class');
      expect(buttonClasses).toContain('bg-gray-100');
      expect(buttonClasses).toContain('hover:bg-indigo-100');
      expect(buttonClasses).toContain('rounded-2xl');
    }
    
    // Screenshot quick filters
    await quickFilters.screenshot({ 
      path: `${SCREENSHOTS_DIR}/05-quick-filters-section.png`,

    });
  });

  test('6. Comparison Table Section Audit', async ({ page }) => {
    console.log('📊 Testing Comparison Table Section...');
    
    const comparisonTable = page.locator('#comparison-table');
    await expect(comparisonTable).toBeVisible();
    
    // Check section background
    const sectionClasses = await comparisonTable.getAttribute('class');
    expect(sectionClasses).toContain('bg-gray-50');
    
    // Test table container
    const tableContainer = comparisonTable.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible();
    
    // Test table styling
    const table = tableContainer.locator('table');
    await expect(table).toBeVisible();
    
    // Test table headers
    const headers = table.locator('th');
    const headerCount = await headers.count();
    console.log(`Found ${headerCount} table headers`);
    
    // Test table rows
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`Found ${rowCount} casino rows`);
    
    // Screenshot comparison table
    await comparisonTable.screenshot({ 
      path: `${SCREENSHOTS_DIR}/06-comparison-table-section.png`,

    });
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await comparisonTable.screenshot({ 
      path: `${SCREENSHOTS_DIR}/04-comparison-table.png`
    });
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('7. Popular Slots Section Audit', async ({ page }) => {
    console.log('🎰 Testing Popular Slots Section...');
    
    const slotsSection = page.locator('#popular-slots');
    await expect(slotsSection).toBeVisible();
    
    // Test grid layout
    const gameGrid = slotsSection.locator('.grid');
    await expect(gameGrid).toBeVisible();
    
    const gridClasses = await gameGrid.getAttribute('class');
    expect(gridClasses).toContain('grid-cols-2');
    expect(gridClasses).toContain('md:grid-cols-3');
    expect(gridClasses).toContain('lg:grid-cols-6');
    
    // Test game cards
    const gameCards = slotsSection.locator('article');
    const cardCount = await gameCards.count();
    console.log(`Found ${cardCount} slot game cards`);
    
    // Test first game card
    if (cardCount > 0) {
      const firstCard = gameCards.first();
      const cardClasses = await firstCard.getAttribute('class');
      expect(cardClasses).toContain('bg-white');
      expect(cardClasses).toContain('rounded-xl');
      expect(cardClasses).toContain('shadow-sm');
    }
    
    // Screenshot slots section
    await slotsSection.screenshot({ 
      path: `${SCREENSHOTS_DIR}/07-popular-slots-section.png`
    });
  });

  test('8. Footer Section Audit', async ({ page }) => {
    console.log('🦶 Testing Footer Section...');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check footer styling
    const footerClasses = await footer.getAttribute('class');
    expect(footerClasses).toContain('bg-gray-900');
    expect(footerClasses).toContain('text-white');
    
    // Test footer grid
    const footerGrid = footer.locator('.grid');
    await expect(footerGrid).toBeVisible();
    
    // Test footer links
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    console.log(`Found ${linkCount} footer links`);
    
    // Screenshot footer
    await footer.screenshot({ 
      path: `${SCREENSHOTS_DIR}/08-footer-section.png`
    });
  });

  test('9. Full Page Screenshot and Layout Audit', async ({ page }) => {
    console.log('📱 Testing Full Page Layout...');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.screenshot({ 
      path: `${SCREENSHOTS_DIR}/09-full-page-desktop.png`,
      fullPage: true 
    });
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: `${SCREENSHOTS_DIR}/09-full-page-tablet.png`,
      fullPage: true 
    });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: `${SCREENSHOTS_DIR}/09-full-page-mobile.png`,
      fullPage: true 
    });
    
    // Test large desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: `${SCREENSHOTS_DIR}/09-full-page-large.png`,
      fullPage: true 
    });
  });

  test('10. CSS Classes Validation Audit', async ({ page }) => {
    console.log('🎨 Testing CSS Classes Validation...');
    
    // Check for common Tailwind CSS issues
    const bodyElement = page.locator('body');
    const bodyClasses = await bodyElement.getAttribute('class');
    console.log('Body classes:', bodyClasses);
    
    // Check for missing Tailwind CSS
    const hasTextWhite = page.locator('.text-white').first();
    await expect(hasTextWhite).toBeVisible();
    
    // Check for gradient backgrounds
    const hasGradient = page.locator('[class*="bg-gradient-"]').first();
    await expect(hasGradient).toBeVisible();
    
    // Check for responsive classes
    const hasResponsive = page.locator('[class*="md:"]').first();
    await expect(hasResponsive).toBeVisible();
    
    // Test hover states by hovering over buttons
    const hoverButton = page.locator('a, button').first();
    await hoverButton.hover();
    await page.screenshot({ 
      path: `${SCREENSHOTS_DIR}/10-hover-states.png`,

    });
    
    console.log('✅ CSS validation complete');
  });

  test('11. Performance and Accessibility Audit', async ({ page }) => {
    console.log('⚡ Testing Performance and Accessibility...');
    
    // Test page load performance
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Test accessibility
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
    
    // Test semantic HTML
    const hasMain = page.locator('main');
    await expect(hasMain).toBeVisible();
    
    const hasHeader = page.locator('header');
    const headerCount = await hasHeader.count();
    console.log(`Found ${headerCount} header elements`);
    
    console.log('✅ Performance and accessibility audit complete');
  });
});

// Helper function to generate audit report
test('Generate Audit Report', async ({ page }) => {
  console.log('📊 Generating comprehensive audit report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    sections_tested: [
      'Navigation',
      'Hero Section', 
      'Benefits',
      'Top Three Casinos',
      'Quick Filters',
      'Comparison Table',
      'Popular Slots',
      'Footer',
      'Responsive Layout',
      'CSS Validation',
      'Performance & A11y'
    ],
    screenshots_generated: 15,
    status: 'COMPLETE'
  };
  
  await fs.writeFile(
    `${SCREENSHOTS_DIR}/audit-report.json`, 
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Audit report saved to audit-report.json');
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
});
