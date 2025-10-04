import { test, expect } from '@playwright/test';

/**
 * Section Discovery Test
 * Find what sections actually exist on the page
 */

test('Discover All Homepage Sections', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Get all sections and their info
  const sectionsInfo = await page.evaluate(() => {
    const sections = document.querySelectorAll('section, [class*="section"], main > div, main > *');
    const sectionData: Array<{
      index: number;
      tagName: string;
      className: string;
      id: string;
      textContent: string;
      height: number;
      width: number;
      top: number;
      visible: boolean;
    }> = [];
    
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      sectionData.push({
        index,
        tagName: section.tagName,
        className: section.className,
        id: section.id,
        textContent: (section.textContent?.slice(0, 100) || '') + '...',
        height: rect.height,
        width: rect.width,
        top: rect.top,
        visible: rect.height > 0 && rect.width > 0
      });
    });
    
    return sectionData;
  });
  
  console.log('📋 All Sections Found:');
  sectionsInfo.forEach(section => {
    console.log(`${section.index}: ${section.tagName}.${section.className} (${section.height}px tall, visible: ${section.visible})`);
    if (section.textContent) {
      console.log(`   Content: ${section.textContent}`);
    }
  });
  
  // Take a full page screenshot with annotations
  await page.screenshot({ 
    path: 'test-results/screenshots/section-discovery-full-page.png',
    fullPage: true 
  });
  
  console.log(`✅ Found ${sectionsInfo.length} sections total`);
});