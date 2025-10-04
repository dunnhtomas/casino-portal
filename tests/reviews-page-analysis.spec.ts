import { test, expect } from '@playwright/test';

/**
 * Reviews Page Analysis Test
 * Systematic analysis of the reviews page to identify all readability and color issues
 */

test('Analyze Reviews Page Issues', async ({ page }) => {
  console.log('🔍 SYSTEMATIC REVIEWS PAGE ANALYSIS');
  
  await page.goto('http://localhost:8080/reviews/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📊 ANALYZING PAGE STRUCTURE...');
  
  // Check if page loads properly
  const pageTitle = await page.title();
  console.log(`✅ Page title: "${pageTitle}"`);
  
  // Analyze hero section colors
  const heroSection = page.locator('section.bg-gradient-to-r');
  if (await heroSection.count() > 0) {
    const heroClasses = await heroSection.getAttribute('class');
    console.log(`🎨 Hero section classes: ${heroClasses}`);
    
    const heroStyles = await heroSection.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        color: styles.color
      };
    });
    console.log(`🎨 Hero computed styles: ${JSON.stringify(heroStyles)}`);
  }
  
  // Check for casino cards
  const casinoCards = page.locator('.casino-card');
  const cardCount = await casinoCards.count();
  console.log(`🎰 Casino cards found: ${cardCount}`);
  
  if (cardCount > 0) {
    // Check if cards have content
    const firstCard = casinoCards.first();
    const cardContent = await firstCard.textContent();
    const cardHTML = await firstCard.innerHTML();
    console.log(`📝 First card content: "${cardContent?.trim()}"`);
    console.log(`📝 First card HTML: "${cardHTML}"`);
  }
  
  // Check for casino theme colors usage
  const elementsWithCasinoColors = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    let casinoColorCount = 0;
    let genericColorCount = 0;
    
    elements.forEach(el => {
      const classes = el.className;
      if (typeof classes === 'string') {
        if (classes.includes('casino-') || classes.includes('gold-') || classes.includes('cream-')) {
          casinoColorCount++;
        }
        if (classes.includes('emerald-') || classes.includes('teal-') || classes.includes('slate-') || 
            classes.includes('green-') && !classes.includes('green-600')) { // green-600 might be ok
          genericColorCount++;
        }
      }
    });
    
    return { casinoColorCount, genericColorCount };
  });
  
  console.log(`🎨 Color analysis: Casino colors: ${elementsWithCasinoColors.casinoColorCount}, Generic colors: ${elementsWithCasinoColors.genericColorCount}`);
  
  // Check text readability
  const textElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('h1, h2, h3, p, div');
    const readabilityIssues: Array<{ text: string; color: string; background: string; tagName: string; }> = [];
    
    elements.forEach((el, index) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const background = styles.backgroundColor;
      const text = el.textContent?.trim();
      
      if (text && text.length > 10) { // Only check elements with substantial text
        // Check for very light colors that might be hard to read
        if (color.includes('rgb(') && text.length < 200) { // Sample some text elements
          readabilityIssues.push({
            text: text.substring(0, 50),
            color,
            background,
            tagName: el.tagName
          });
        }
      }
    });
    
    return readabilityIssues.slice(0, 10); // First 10 for analysis
  });
  
  console.log('📖 Text readability analysis:');
  textElements.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.tagName}: "${issue.text}" - color: ${issue.color}, bg: ${issue.background}`);
  });
  
  // Check for missing components
  const hasCasinoComponents = await page.evaluate(() => {
    return {
      hasEnhancedCasinoCard: !!document.querySelector('[data-component="EnhancedCasinoCard"]'),
      hasRatingElements: !!document.querySelector('[data-rating]'),
      hasBonusInfo: !!document.querySelector('.bonus-info, .welcome-bonus'),
      hasPlayButtons: !!document.querySelector('.play-button, [href*="play"]')
    };
  });
  
  console.log(`🔧 Component analysis: ${JSON.stringify(hasCasinoComponents)}`);
  
  // Take screenshot for visual analysis
  await page.screenshot({ 
    path: 'test-results/screenshots/reviews-page-analysis.png',
    fullPage: true
  });
  
  console.log('🔍 ANALYSIS COMPLETE - Issues identified for Sequential Thinking resolution');
});