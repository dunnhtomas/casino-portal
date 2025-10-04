import { test, expect } from '@playwright/test';

/**
 * Section-by-Section Color Analysis Test
 * Systematically verify colors in each homepage section
 */

test.describe('Homepage Section Color Analysis', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Analyze Hero Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING HERO SECTION COLORS');
    
    const heroSection = page.locator('.hero-section, section[id="hero"], #hero');
    await expect(heroSection).toBeVisible();
    
    const heroColors = await heroSection.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        color: computedStyle.color,
        className: el.className
      };
    });
    
    console.log('🎨 Hero Section Colors:', heroColors);
    
    // Check hero title colors
    const heroTitle = page.locator('.hero-title, .hero-section h1, h1');
    if (await heroTitle.isVisible()) {
      const titleColors = await heroTitle.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          color: computedStyle.color,
          background: computedStyle.background,
          backgroundImage: computedStyle.backgroundImage,
          backgroundClip: computedStyle.backgroundClip
        };
      });
      console.log('🎨 Hero Title Colors:', titleColors);
    }
    
    await heroSection.screenshot({ 
      path: 'test-results/screenshots/color-analysis-hero.png' 
    });
    
    console.log('✅ Hero section color analysis complete');
  });

  test('Analyze Benefits Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING BENEFITS SECTION COLORS');
    
    const benefitsSection = page.locator('.benefits-section');
    if (await benefitsSection.isVisible()) {
      const benefitsColors = await benefitsSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          className: el.className
        };
      });
      
      console.log('🎨 Benefits Section Colors:', benefitsColors);
      
      await benefitsSection.screenshot({ 
        path: 'test-results/screenshots/color-analysis-benefits.png' 
      });
    } else {
      console.log('❌ Benefits section not found');
    }
    
    console.log('✅ Benefits section color analysis complete');
  });

  test('Analyze Top 3 Casinos Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING TOP 3 CASINOS SECTION COLORS');
    
    const topThreeSection = page.locator('#top-three, section:has-text("Top 3 Casino")');
    if (await topThreeSection.isVisible()) {
      await topThreeSection.scrollIntoViewIfNeeded();
      
      const sectionColors = await topThreeSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          className: el.className
        };
      });
      
      console.log('🎨 Top 3 Section Colors:', sectionColors);
      
      // Check casino card colors
      const casinoCards = page.locator('#top-three .bg-white, #top-three [class*="casino"], #top-three [class*="card"]');
      const cardCount = await casinoCards.count();
      console.log(`🎰 Found ${cardCount} casino cards`);
      
      if (cardCount > 0) {
        const firstCardColors = await casinoCards.first().evaluate((el) => {
          const computedStyle = window.getComputedStyle(el);
          return {
            backgroundColor: computedStyle.backgroundColor,
            borderColor: computedStyle.borderColor,
            color: computedStyle.color,
            className: el.className
          };
        });
        console.log('🎰 First Casino Card Colors:', firstCardColors);
      }
      
      await topThreeSection.screenshot({ 
        path: 'test-results/screenshots/color-analysis-top-three.png' 
      });
    } else {
      console.log('❌ Top 3 section not found');
    }
    
    console.log('✅ Top 3 section color analysis complete');
  });

  test('Analyze Quick Filters Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING QUICK FILTERS SECTION COLORS');
    
    // Look for quick filters section (usually has category tiles)
    const quickFiltersSection = page.locator('section:has-text("Find Casinos by Category"), .py-12.bg-white, section:has-text("Category")');
    if (await quickFiltersSection.isVisible()) {
      await quickFiltersSection.scrollIntoViewIfNeeded();
      
      const sectionColors = await quickFiltersSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          className: el.className
        };
      });
      
      console.log('🎨 Quick Filters Section Colors:', sectionColors);
      
      await quickFiltersSection.screenshot({ 
        path: 'test-results/screenshots/color-analysis-quick-filters.png' 
      });
    } else {
      console.log('❌ Quick Filters section not found');
    }
    
    console.log('✅ Quick Filters section color analysis complete');
  });

  test('Analyze Comparison Table Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING COMPARISON TABLE SECTION COLORS');
    
    const comparisonSection = page.locator('section:has-text("Compare Top Online Casinos"), .py-16.bg-gradient-to-br');
    if (await comparisonSection.isVisible()) {
      await comparisonSection.scrollIntoViewIfNeeded();
      
      const sectionColors = await comparisonSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          className: el.className
        };
      });
      
      console.log('🎨 Comparison Table Section Colors:', sectionColors);
      
      await comparisonSection.screenshot({ 
        path: 'test-results/screenshots/color-analysis-comparison-table.png' 
      });
    } else {
      console.log('❌ Comparison Table section not found');
    }
    
    console.log('✅ Comparison Table section color analysis complete');
  });

  test('Analyze Footer Section Colors', async ({ page }) => {
    console.log('🔍 ANALYZING FOOTER SECTION COLORS');
    
    const footerSection = page.locator('footer, .footer-section');
    if (await footerSection.isVisible()) {
      await footerSection.scrollIntoViewIfNeeded();
      
      const footerColors = await footerSection.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          className: el.className
        };
      });
      
      console.log('🎨 Footer Section Colors:', footerColors);
      
      await footerSection.screenshot({ 
        path: 'test-results/screenshots/color-analysis-footer.png' 
      });
    } else {
      console.log('❌ Footer section not found');
    }
    
    console.log('✅ Footer section color analysis complete');
  });

  test('Analyze Color Theme Consistency', async ({ page }) => {
    console.log('🔍 ANALYZING OVERALL COLOR THEME CONSISTENCY');
    
    // Check for proper casino color variables usage
    const colorVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      const casinoColors: { [key: string]: string } = {};
      // Check for CSS custom properties
      const properties = [
        '--casino-50', '--casino-100', '--casino-200', '--casino-300',
        '--casino-400', '--casino-500', '--casino-600', '--casino-700',
        '--casino-800', '--casino-900', '--casino-950',
        '--gold-300', '--gold-400', '--gold-500',
        '--cream-50', '--cream-100', '--cream-200', '--cream-300'
      ];
      
      properties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value) {
          casinoColors[prop] = value.trim();
        }
      });
      
      return casinoColors;
    });
    
    console.log('🎨 Casino Color Variables:', colorVariables);
    
    // Check for elements using wrong colors (like blue instead of casino burgundy)
    const wrongColorElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const wrongColors: Array<{
        tagName: string;
        className: string;
        backgroundColor: string;
        issue: string;
      }> = [];
      
      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        
        // Check for blue backgrounds that should be casino colors
        if (bgColor.includes('rgb(59, 130, 246)') || // blue-500
            bgColor.includes('rgb(37, 99, 235)') ||   // blue-600  
            bgColor.includes('rgb(147, 197, 253)') || // blue-300
            bgColor.includes('rgb(219, 234, 254)') || // blue-100
            bgColor.includes('rgb(239, 246, 255)')) { // blue-50
          wrongColors.push({
            tagName: el.tagName,
            className: el.className,
            backgroundColor: bgColor,
            issue: 'Using blue instead of casino burgundy'
          });
        }
      });
      
      return wrongColors.slice(0, 10); // Limit to first 10
    });
    
    console.log('🚨 Elements with wrong colors:', wrongColorElements);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/color-analysis-full-page.png',
      fullPage: true 
    });
    
    console.log('✅ Color theme consistency analysis complete');
  });

});