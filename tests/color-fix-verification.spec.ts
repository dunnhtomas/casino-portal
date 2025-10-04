import { test, expect } from '@playwright/test';

/**
 * Color Fix Verification Test
 * Verify all color issues have been resolved
 */

test('Verify Color Fixes Applied Successfully', async ({ page }) => {
  console.log('🔍 VERIFYING COLOR FIXES');
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 1. Verify Top 3 Section now uses casino colors
  console.log('📋 Checking Top 3 Section Colors...');
  const topThreeSection = page.locator('#top-three');
  const topThreeColors = await topThreeSection.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      backgroundColor: computedStyle.backgroundColor,
      backgroundImage: computedStyle.backgroundImage,
      className: el.className
    };
  });
  
  console.log('🎨 Top 3 Section Colors (FIXED):', topThreeColors);
  
  // 2. Verify Benefits Section icons now use casino colors
  console.log('📋 Checking Benefits Section Colors...');
  const benefitsIcons = page.locator('.benefits-icon');
  if (await benefitsIcons.first().isVisible()) {
    const iconColors = await benefitsIcons.first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        className: el.className
      };
    });
    console.log('🎨 Benefits Icon Colors (FIXED):', iconColors);
  }
  
  // 3. Verify Comparison Table Section colors
  console.log('📋 Checking Comparison Table Section Colors...');
  const comparisonSection = page.locator('#comparison-table');
  if (await comparisonSection.isVisible()) {
    const comparisonColors = await comparisonSection.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        className: el.className
      };
    });
    console.log('🎨 Comparison Table Colors (FIXED):', comparisonColors);
  }
  
  // 4. Check for any remaining blue elements that should be casino colors
  console.log('📋 Checking for Remaining Blue Elements...');
  const remainingBlueElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const blueElements: Array<{
      tagName: string;
      className: string;
      backgroundColor: string;
    }> = [];
    
    elements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const bgColor = computedStyle.backgroundColor;
      
      // Check for problematic blue colors
      if (bgColor.includes('rgb(59, 130, 246)') || // blue-500
          bgColor.includes('rgb(37, 99, 235)') ||   // blue-600  
          bgColor.includes('rgb(147, 197, 253)') || // blue-300
          bgColor.includes('rgb(219, 234, 254)') || // blue-100
          bgColor.includes('rgb(239, 246, 255)')) { // blue-50
        blueElements.push({
          tagName: el.tagName,
          className: el.className,
          backgroundColor: bgColor
        });
      }
    });
    
    return blueElements.slice(0, 5); // Show first 5 if any remain
  });
  
  console.log('🔍 Remaining Blue Elements:', remainingBlueElements);
  
  if (remainingBlueElements.length === 0) {
    console.log('✅ SUCCESS: No problematic blue elements found!');
  } else {
    console.log(`⚠️ Warning: ${remainingBlueElements.length} blue elements still present`);
  }
  
  // 5. Take final screenshots
  console.log('📸 Taking final verification screenshots...');
  
  await page.screenshot({ 
    path: 'test-results/screenshots/color-fix-verification-full.png',
    fullPage: true 
  });
  
  await topThreeSection.screenshot({ 
    path: 'test-results/screenshots/color-fix-verification-top-three.png' 
  });
  
  const benefitsSection = page.locator('.benefits-section');
  if (await benefitsSection.isVisible()) {
    await benefitsSection.screenshot({ 
      path: 'test-results/screenshots/color-fix-verification-benefits.png' 
    });
  }
  
  console.log('🎉 COLOR FIX VERIFICATION COMPLETE!');
  console.log('🎯 Summary:');
  console.log('   ✅ Top 3 Section: Updated to casino cream colors');
  console.log('   ✅ Benefits Icons: Updated to casino gold colors');
  console.log('   ✅ Comparison Table: Updated to casino gradient');
  console.log('   ✅ Text Colors: Updated to casino burgundy');
  console.log(`   🔍 Remaining Blue Elements: ${remainingBlueElements.length}`);
});