import { test, expect } from '@playwright/test';

/**
 * Overflow Detection Test
 * Identifies specific elements causing horizontal scroll
 */

test.describe('Overflow Detection Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Find Elements Causing Horizontal Overflow', async ({ page }) => {
    console.log('🔍 Detecting overflow elements...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check body scroll width vs client width
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth,
        hasOverflow: body.scrollWidth > body.clientWidth
      };
    });
    
    console.log('Body overflow info:', bodyOverflow);
    
    // Find all elements wider than viewport
    const overflowElements = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const elements = document.querySelectorAll('*');
      const overflowing: Array<{
      tagName: string; 
      id: string;
      className: string;
      scrollWidth: number;
      clientWidth: number;
      boundingWidth: number;
      position: string;
      overflow: string;
      overflowX: string;
      selector: string;
    }> = [];
      
      elements.forEach(el => {
        if (el.scrollWidth > viewportWidth) {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          overflowing.push({
            tagName: el.tagName,
            id: el.id || '',
            className: el.className || '',
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            boundingWidth: rect.width,
            position: styles.position,
            overflow: styles.overflow,
            overflowX: styles.overflowX,
            selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : '')
          });
        }
      });
      
      return overflowing.slice(0, 10); // Top 10 offenders
    });
    
    console.log('Elements causing overflow:', overflowElements);
    
    // Take screenshot highlighting the issue
    await page.screenshot({ 
      path: './test-results/overflow-detection-mobile.png',
      fullPage: true 
    });
    
    // Test specific sections
    const sections = ['#hero', '#benefits', '#comparison-table', '#popular-slots'];
    
    for (const section of sections) {
      const sectionOverflow = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        
        return {
          selector,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          boundingWidth: rect.width,
          overflowX: styles.overflowX,
          hasOverflow: el.scrollWidth > window.innerWidth
        };
      }, section);
      
      if (sectionOverflow) {
        console.log(`${section} overflow:`, sectionOverflow);
      }
    }
    
    // Check table specifically
    const tableOverflow = await page.evaluate(() => {
      const table = document.querySelector('#comparison-table table');
      if (!table) return null;
      
      return {
        tableScrollWidth: table.scrollWidth,
        tableClientWidth: table.clientWidth,
        containerOverflow: table.parentElement?.style.overflowX,
        minWidth: window.getComputedStyle(table).minWidth
      };
    });
    
    console.log('Table overflow details:', tableOverflow);
  });

  test('Check Container Widths and Max-Widths', async ({ page }) => {
    console.log('🔍 Checking container widths...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    const containerWidths = await page.evaluate(() => {
      const containers = document.querySelectorAll('.max-w-6xl, .max-w-7xl, .container');
      const results: Array<{
        selector: string;
        width: number;
        maxWidth: string;
        padding: string;
        paddingLeft: string;
        paddingRight: string;
        marginLeft: string;
        marginRight: string;
      }> = [];
      
      containers.forEach(container => {
        const rect = container.getBoundingClientRect();
        const styles = window.getComputedStyle(container);
        
        results.push({
          selector: container.className,
          width: rect.width,
          maxWidth: styles.maxWidth,
          padding: styles.padding,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight
        });
      });
      
      return results;
    });
    
    console.log('Container widths:', containerWidths);
  });

  test('Test CSS Grid and Flexbox Issues', async ({ page }) => {
    console.log('🔍 Testing grid and flex layouts...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    const gridIssues = await page.evaluate(() => {
      const grids = document.querySelectorAll('[class*="grid"]');
      const flexes = document.querySelectorAll('[class*="flex"]');
      const issues: Array<{
        type: string;
        className: string;
        width: number;
        children?: number;
        flexWrap?: string;
      }> = [];
      
      grids.forEach(grid => {
        const rect = grid.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          issues.push({
            type: 'grid',
            className: grid.className,
            width: rect.width,
            children: grid.children.length
          });
        }
      });
      
      flexes.forEach(flex => {
        const rect = flex.getBoundingClientRect();
        const styles = window.getComputedStyle(flex);
        if (rect.width > window.innerWidth && styles.flexWrap === 'nowrap') {
          issues.push({
            type: 'flex-nowrap',
            className: flex.className,
            width: rect.width,
            flexWrap: styles.flexWrap
          });
        }
      });
      
      return issues;
    });
    
    console.log('Grid/Flex issues:', gridIssues);
  });

});