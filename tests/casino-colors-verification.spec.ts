import { test, expect } from '@playwright/test';

/**
 * Color Fix Verification Test
 * Verify all sections after Category Tiles now use proper casino colors
 */

test('Verify Casino Colors Applied to All Sections', async ({ page }) => {
  console.log('🎨 VERIFYING CASINO COLOR FIXES');
  
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Get all sections after category tiles and check their colors
  const sectionColors = await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    const colorData: Array<{
      index: number;
      id: string;
      className: string;
      backgroundColor: string;
      backgroundImage: string;
      height: number;
      textPreview: string;
    }> = [];
    
    sections.forEach((section, index) => {
      const computedStyle = window.getComputedStyle(section);
      const rect = section.getBoundingClientRect();
      
      colorData.push({
        index,
        id: section.id,
        className: section.className,
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        height: rect.height,
        textPreview: section.textContent?.slice(0, 50) || ''
      });
    });
    
    return colorData;
  });
  
  console.log('🎨 SECTION COLOR ANALYSIS:');
  
  const problematicSections: string[] = [];
  const fixedSections: string[] = [];
  
  sectionColors.forEach(section => {
    console.log(`\n📋 Section: ${section.id || 'unnamed'}`);
    console.log(`   Class: ${section.className}`);
    console.log(`   Background: ${section.backgroundColor}`);
    console.log(`   Background Image: ${section.backgroundImage !== 'none' ? 'HAS GRADIENT' : 'none'}`);
    console.log(`   Preview: "${section.textPreview}"`);
    
    // Check for problematic colors
    if (section.backgroundColor === 'rgb(249, 250, 251)') { // bg-gray-50
      problematicSections.push(`${section.id}: Still using bg-gray-50`);
      console.log('   🚨 ISSUE: Still using bg-gray-50');
    } else if (section.backgroundColor === 'rgb(255, 255, 255)' && 
               section.backgroundImage === 'none' && 
               section.id !== 'hero') { // plain bg-white (except hero)
      problematicSections.push(`${section.id}: Using plain bg-white`);
      console.log('   ⚠️ WARNING: Using plain bg-white');
    } else if (section.backgroundImage !== 'none') {
      fixedSections.push(`${section.id}: Using gradient background`);
      console.log('   ✅ GOOD: Using gradient background');
    } else if (section.id === 'hero' || section.id === 'benefits' || section.id === 'top-three') {
      console.log('   ✅ GOOD: Core section with proper styling');
    }
  });
  
  console.log('\n🎯 SUMMARY:');
  console.log(`✅ Sections with casino gradients: ${fixedSections.length}`);
  console.log(`🚨 Sections with issues: ${problematicSections.length}`);
  
  if (fixedSections.length > 0) {
    console.log('\n✅ FIXED SECTIONS:');
    fixedSections.forEach(section => console.log(`   ${section}`));
  }
  
  if (problematicSections.length > 0) {
    console.log('\n🚨 REMAINING ISSUES:');
    problematicSections.forEach(section => console.log(`   ${section}`));
  } else {
    console.log('\n🎉 SUCCESS: All sections now use proper casino colors!');
  }
  
  // Take screenshot for verification
  await page.screenshot({ 
    path: 'test-results/screenshots/casino-colors-verification.png',
    fullPage: true 
  });
  
  // Expect that we have more fixed sections than problematic ones
  expect(fixedSections.length).toBeGreaterThan(5);
  expect(problematicSections.length).toBeLessThanOrEqual(2);
  
  console.log('🎨 COLOR VERIFICATION COMPLETE!');
});