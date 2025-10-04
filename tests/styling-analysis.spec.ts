import { test, expect } from '@playwright/test';

/**
 * Enhanced Homepage Section Analysis
 * This test analyzes each section with styling inspection
 */

test.describe('Homepage Section Styling Analysis', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Analyze Hero Section Styling', async ({ page }) => {
    console.log('🔍 Analyzing Hero Section...');
    
    // Check if hero section exists and is visible
    const heroSection = page.locator('.hero-section, section[id="hero"], #hero');
    await expect(heroSection).toBeVisible();
    
    // Get hero section styling
    const heroStyles = await heroSection.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        display: computedStyle.display,
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        padding: computedStyle.padding,
        height: computedStyle.height,
        textAlign: computedStyle.textAlign
      };
    });
    
    console.log('Hero Section Styles:', heroStyles);
    
    // Screenshot the hero section
    await heroSection.screenshot({ 
      path: 'test-results/screenshots/analysis-01-hero-section.png',
      timeout: 10000
    });
    
    // Check hero title styling
    const heroTitle = page.locator('.hero-title, .hero-section h1, h1');
    if (await heroTitle.isVisible()) {
      const titleStyles = await heroTitle.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color,
          background: computedStyle.background,
          textAlign: computedStyle.textAlign,
          marginBottom: computedStyle.marginBottom
        };
      });
      console.log('Hero Title Styles:', titleStyles);
    }
    
    console.log('✅ Hero section analysis complete');
  });

  test('Analyze Top Casinos Section', async ({ page }) => {
    console.log('🔍 Analyzing Top Casinos Section...');
    
    // Look for top casinos section
    const topCasinosSection = page.locator('.top-three-section, section:has(.casino-card), [data-section="top-casinos"]');
    
    if (await topCasinosSection.isVisible()) {
      await topCasinosSection.scrollIntoViewIfNeeded();
      
      const sectionStyles = await topCasinosSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          display: computedStyle.display,
          backgroundColor: computedStyle.backgroundColor,
          padding: computedStyle.padding,
          marginTop: computedStyle.marginTop,
          marginBottom: computedStyle.marginBottom
        };
      });
      
      console.log('Top Casinos Section Styles:', sectionStyles);
      
      await topCasinosSection.screenshot({ 
        path: 'test-results/screenshots/analysis-02-top-casinos.png' 
      });
    } else {
      console.log('⚠️ Top Casinos section not found');
      // Take a screenshot of the area where it should be
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.screenshot({ 
        path: 'test-results/screenshots/analysis-02-top-casinos-missing.png' 
      });
    }
    
    console.log('✅ Top Casinos section analysis complete');
  });

  test('Check CSS Classes Usage', async ({ page }) => {
    console.log('🔍 Checking CSS Classes Usage...');
    
    // Get all elements with casino-specific classes
    const cssClassesUsage = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const classesFound = new Set();
      
      elements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ');
          classes.forEach(cls => {
            if (cls.includes('hero-') || cls.includes('casino-') || cls.includes('benefits-') || cls.includes('top-three-')) {
              classesFound.add(cls);
            }
          });
        }
      });
      
      return Array.from(classesFound).sort();
    });
    
    console.log('Custom CSS Classes Found:', cssClassesUsage);
    
    // Check if Tailwind classes are being applied
    const tailwindCheck = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.className = 'bg-red-500 text-white p-4';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const result = {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding
      };
      
      document.body.removeChild(testElement);
      return result;
    });
    
    console.log('Tailwind CSS Test:', tailwindCheck);
    
    console.log('✅ CSS Classes analysis complete');
  });

  test('Identify Layout Issues', async ({ page }) => {
    console.log('🔍 Identifying Layout Issues...');
    
    // Check viewport and responsive issues
    const viewportSize = page.viewportSize();
    console.log('Current Viewport:', viewportSize);
    
    // Take screenshots at different scroll positions to identify layout breaks
    const scrollPositions = [0, 300, 600, 900, 1200, 1500];
    
    for (let i = 0; i < scrollPositions.length; i++) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), scrollPositions[i]);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/screenshots/layout-scroll-${i + 1}-${scrollPositions[i]}px.png` 
      });
    }
    
    // Check for overflow issues
    const overflowElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const overflowing: Array<{
        tagName: string;
        className: string;
        id: string;
        scrollWidth: number;
        clientWidth: number;
        scrollHeight: number;
        clientHeight: number;
      }> = [];
      
      elements.forEach(el => {
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
          overflowing.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight
          });
        }
      });
      
      return overflowing.slice(0, 10); // Limit to first 10
    });
    
    console.log('Elements with overflow:', overflowElements);
    
    console.log('✅ Layout issues analysis complete');
  });

});