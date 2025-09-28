import { test, expect } from '@playwright/test';

test.describe('Table Debug Tests', () => {
  test('Debug table width and cell widths', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for the table to load
    await page.waitForSelector('#comparison-table table', { timeout: 10000 });
    
    // Get table dimensions
    const tableInfo = await page.evaluate(() => {
      const table = document.querySelector('#comparison-table table') as HTMLElement;
      const container = document.querySelector('#comparison-table .overflow-x-auto') as HTMLElement;
      
      if (!table || !container) {
        return { error: 'Table or container not found' };
      }
      
      // Get computed style
      const computedStyle = window.getComputedStyle(table);
      
      // Check table classes
      const tableClasses = table.className;
      
      // Get cell widths
      const cells = Array.from(table.querySelectorAll('thead th')).map((th, index) => {
        const rect = th.getBoundingClientRect();
        const computedCellStyle = window.getComputedStyle(th as HTMLElement);
        return {
          index,
          textContent: (th as HTMLElement).textContent?.trim(),
          width: rect.width,
          minWidth: computedCellStyle.minWidth,
          padding: computedCellStyle.padding
        };
      });
      
      return {
        tableWidth: table.getBoundingClientRect().width,
        tableScrollWidth: table.scrollWidth,
        tableClientWidth: table.clientWidth,
        containerWidth: container.getBoundingClientRect().width,
        containerClientWidth: container.clientWidth,
        minWidth: computedStyle.minWidth,
        maxWidth: computedStyle.maxWidth,
        width: computedStyle.width,
        tableLayout: computedStyle.tableLayout,
        tableClasses: tableClasses,
        cells: cells,
        totalCellWidths: cells.reduce((sum, cell) => sum + cell.width, 0)
      };
    });
    
    console.log('Table Debug Info:', JSON.stringify(tableInfo, null, 2));
    
    // Check if the table is wider than expected
    if (tableInfo && typeof tableInfo === 'object' && 'tableWidth' in tableInfo && typeof tableInfo.tableWidth === 'number' && tableInfo.tableWidth > 400) {
      console.log(`⚠️ Table is ${tableInfo.tableWidth}px wide, expected ~400px for mobile`);
    }
  });
});