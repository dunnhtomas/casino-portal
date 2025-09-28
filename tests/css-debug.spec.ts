import { test, expect } from '@playwright/test';

/**
 * Tailwind CSS Debugging Test
 * Focuses on identifying and fixing CSS issues
 */

test.describe('Tailwind CSS Debug Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Debug Navigation CSS Issues', async ({ page }) => {
    console.log('🔍 Debugging Navigation CSS...');
    
    // Check if navigation is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Get computed styles
    const navStyle = await nav.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        position: style.position,
        zIndex: style.zIndex,
        display: style.display
      };
    });
    
    console.log('Nav computed styles:', navStyle);
    
    // Take screenshot of navigation
    await nav.screenshot({ path: './test-results/debug-nav.png' });
    
    // Check for backdrop-blur support
    const hasBackdrop = await nav.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.backdropFilter !== 'none';
    });
    
    console.log('Backdrop blur working:', hasBackdrop);
  });

  test('Debug Hero Section CSS Issues', async ({ page }) => {
    console.log('🔍 Debugging Hero Section CSS...');
    
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    
    // Check gradient background
    const heroStyle = await hero.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundImage: style.backgroundImage,
        color: style.color,
        padding: style.padding
      };
    });
    
    console.log('Hero computed styles:', heroStyle);
    
    // Check H1 gradient text
    const h1 = hero.locator('h1');
    const h1Style = await h1.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundImage: style.backgroundImage,
        backgroundClip: style.webkitBackgroundClip || style.backgroundClip,
        color: style.color
      };
    });
    
    console.log('H1 computed styles:', h1Style);
    
    await hero.screenshot({ path: './test-results/debug-hero.png' });
  });

  test('Debug Benefits Section CSS Issues', async ({ page }) => {
    console.log('🔍 Debugging Benefits Section CSS...');
    
    const benefits = page.locator('#benefits');
    await expect(benefits).toBeVisible();
    
    // Check benefit cards
    const cards = benefits.locator('.group');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} benefit cards`);
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      const cardStyle = await firstCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          transform: style.transform
        };
      });
      
      console.log('Benefit card styles:', cardStyle);
      
      // Test hover effect
      await firstCard.hover();
      await page.waitForTimeout(500);
      
      const hoverStyle = await firstCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          transform: style.transform,
          boxShadow: style.boxShadow
        };
      });
      
      console.log('Benefit card hover styles:', hoverStyle);
    }
    
    await benefits.screenshot({ path: './test-results/debug-benefits.png' });
  });

  test('Debug Comparison Table CSS Issues', async ({ page }) => {
    console.log('🔍 Debugging Comparison Table CSS...');
    
    const table = page.locator('#comparison-table');
    await expect(table).toBeVisible();
    
    // Check table container
    const tableContainer = table.locator('.overflow-x-auto');
    const containerStyle = await tableContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        overflowX: style.overflowX,
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius
      };
    });
    
    console.log('Table container styles:', containerStyle);
    
    // Check table rows
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`Found ${rowCount} table rows`);
    
    await table.screenshot({ path: './test-results/debug-table.png' });
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await table.screenshot({ path: './test-results/debug-table-mobile.png' });
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('Debug Responsive Design Issues', async ({ page }) => {
    console.log('🔍 Debugging Responsive Design...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Check if layout breaks
      const body = page.locator('body');
      const hasHorizontalScroll = await body.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      
      console.log(`${viewport.name} has horizontal scroll:`, hasHorizontalScroll);
      
      // Take screenshot
      await page.screenshot({ 
        path: `./test-results/debug-responsive-${viewport.name}.png`,
        fullPage: true 
      });
    }
  });

  test('Debug CSS Classes and Tailwind Loading', async ({ page }) => {
    console.log('🔍 Debugging CSS Classes and Tailwind Loading...');
    
    // Check if Tailwind CSS is loaded
    const tailwindLoaded = await page.evaluate(() => {
      // Check if Tailwind utilities are working
      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500 text-white p-4';
      document.body.appendChild(testElement);
      
      const style = window.getComputedStyle(testElement);
      const hasTailwind = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                         style.backgroundColor !== 'transparent';
      
      document.body.removeChild(testElement);
      return hasTailwind;
    });
    
    console.log('Tailwind CSS loaded:', tailwindLoaded);
    
    // Check for common CSS issues
    const cssIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for missing CSS
      const elements = document.querySelectorAll('[class*="bg-gradient-"]');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (!style.backgroundImage || style.backgroundImage === 'none') {
          issues.push(`Gradient not working on: ${el.className}`);
        }
      });
      
      // Check for responsive classes
      const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"]');
      if (responsiveElements.length === 0) {
        issues.push('No responsive classes found');
      }
      
      return issues;
    });
    
    console.log('CSS Issues found:', cssIssues);
    
    // Take full page screenshot for analysis
    await page.screenshot({ 
      path: './test-results/debug-full-page.png',
      fullPage: true 
    });
  });

});