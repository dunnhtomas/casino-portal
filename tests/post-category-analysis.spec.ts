import { test, expect } from '@playwright/test';

/**
 * Post-Category Sections Analysis
 * Systematically analyze all sections after "Find Casinos by Category"
 */

test.describe('Post-Category Sections Analysis', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Analyze All Sections After Category Tiles', async ({ page }) => {
    console.log('🔍 ANALYZING ALL SECTIONS AFTER CATEGORY TILES');
    
    // Get all sections and identify them
    const allSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('section, main > div, [class*="section"]');
      const sectionData: Array<{
        index: number;
        tagName: string;
        className: string;
        id: string;
        height: number;
        width: number;
        visible: boolean;
        backgroundColor: string;
        backgroundImage: string;
        color: string;
        hasContent: boolean;
        textContent: string;
      }> = [];
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(section);
        
        // Get section content preview
        const textContent = section.textContent?.slice(0, 100) || '';
        
        sectionData.push({
          index,
          tagName: section.tagName,
          className: section.className,
          id: section.id,
          height: rect.height,
          width: rect.width,
          visible: rect.height > 0 && rect.width > 0,
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          color: computedStyle.color,
          textContent: textContent,
          hasContent: textContent.trim().length > 0
        });
      });
      
      return sectionData;
    });
    
    console.log('📋 ALL SECTIONS FOUND:');
    allSections.forEach(section => {
      console.log(`Section ${section.index}: ${section.tagName}.${section.className}`);
      console.log(`  ID: ${section.id || 'none'}`);
      console.log(`  Size: ${section.height}px tall, visible: ${section.visible}`);
      console.log(`  Background: ${section.backgroundColor}`);
      console.log(`  Content: ${section.hasContent ? 'HAS CONTENT' : 'EMPTY'}`);
      console.log(`  Preview: ${section.textContent.substring(0, 50)}...`);
      console.log('---');
    });
    
    // Look specifically for sections after CategoryTiles
    const categoryTileIndex = allSections.findIndex(s => 
      s.textContent.includes('Find Casinos by Category') || 
      s.className.includes('category') ||
      s.textContent.includes('Fast Withdrawals') && s.textContent.includes('Big Bonuses')
    );
    
    console.log(`📍 CategoryTiles found at index: ${categoryTileIndex}`);
    
    if (categoryTileIndex >= 0) {
      const postCategorySections = allSections.slice(categoryTileIndex + 1);
      console.log(`🎯 ANALYZING ${postCategorySections.length} SECTIONS AFTER CATEGORY TILES:`);
      
      postCategorySections.forEach((section, relativeIndex) => {
        const actualIndex = categoryTileIndex + 1 + relativeIndex;
        console.log(`\n🔍 Section ${actualIndex} Analysis:`);
        console.log(`  Class: ${section.className}`);
        console.log(`  Background: ${section.backgroundColor}`);
        console.log(`  Height: ${section.height}px`);
        console.log(`  Has Content: ${section.hasContent}`);
        console.log(`  Content Preview: "${section.textContent.substring(0, 80)}"`);
        
        // Check for styling issues
        const issues = [];
        
        if (section.backgroundColor.includes('rgb(239, 246, 255)') || 
            section.backgroundColor.includes('rgb(219, 234, 254)')) {
          issues.push('🚨 Using BLUE background instead of casino colors');
        }
        
        if (section.height < 50) {
          issues.push('⚠️ Section is very short, might be empty');
        }
        
        if (!section.hasContent) {
          issues.push('❌ Section appears to be EMPTY');
        }
        
        if (issues.length > 0) {
          console.log(`  🚨 ISSUES FOUND:`);
          issues.forEach(issue => console.log(`    ${issue}`));
        } else {
          console.log(`  ✅ No obvious issues detected`);
        }
      });
    }
    
    // Take screenshots of problematic sections
    await page.screenshot({ 
      path: 'test-results/screenshots/post-category-sections-analysis.png',
      fullPage: true 
    });
    
    console.log('✅ Section analysis complete');
  });

  test('Check Specific Problematic Sections', async ({ page }) => {
    console.log('🔍 CHECKING SPECIFIC SECTIONS FOR ISSUES');
    
    const sectionsToCheck = [
      'WhyWeRecommend',
      'FastPayoutSpotlight', 
      'RegionHubs',
      'PopularSlots',
      'BankingMethods',
      'ExpertTeam',
      'SupportChannels',
      'FAQ'
    ];
    
    for (const sectionName of sectionsToCheck) {
      console.log(`\n📋 Checking ${sectionName} section...`);
      
      // Try to find section by text content or class name
      const sectionLocator = page.locator(`section:has-text("${sectionName}"), [class*="${sectionName.toLowerCase()}"], section:has-text("Why We Recommend"), section:has-text("Fast Payout"), section:has-text("Region"), section:has-text("Popular Slot"), section:has-text("Banking Method"), section:has-text("Expert Team"), section:has-text("Support"), section:has-text("FAQ")`);
      
      const sectionCount = await sectionLocator.count();
      console.log(`  Found ${sectionCount} matching sections`);
      
      if (sectionCount > 0) {
        const sectionInfo = await sectionLocator.first().evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          return {
            className: el.className,
            height: rect.height,
            backgroundColor: computedStyle.backgroundColor,
            backgroundImage: computedStyle.backgroundImage,
            textContent: el.textContent?.slice(0, 100) || '',
            hasVisibleContent: rect.height > 50 && el.textContent?.trim().length > 10
          };
        });
        
        console.log(`  Class: ${sectionInfo.className}`);
        console.log(`  Height: ${sectionInfo.height}px`);
        console.log(`  Background: ${sectionInfo.backgroundColor}`);
        console.log(`  Has Content: ${sectionInfo.hasVisibleContent}`);
        console.log(`  Preview: "${sectionInfo.textContent.substring(0, 60)}"`);
        
        if (sectionInfo.height > 100) {
          await sectionLocator.first().screenshot({ 
            path: `test-results/screenshots/section-${sectionName.toLowerCase()}.png` 
          });
        }
      } else {
        console.log(`  ❌ Section not found!`);
      }
    }
    
    console.log('✅ Specific section check complete');
  });

});