const { chromium } = require('playwright');

async function checkCasinoLogos() {
  console.log('🎰 Checking Casino Portal Logos with Playwright\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to casino portal...');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully');
    
    // Check if casino cards exist
    const casinoCards = await page.locator('.EnhancedCasinoCard, astro-island').count();
    console.log(`🃏 Found ${casinoCards} casino card components`);
    
    // Check for logos in the top 3 casinos
    const logoImages = await page.locator('img[alt*="logo"], img[src*="/images/casinos/"]').all();
    console.log(`🖼️  Found ${logoImages.length} casino logo images`);
    
    // Check specific logo URLs
    for (let i = 0; i < Math.min(logoImages.length, 5); i++) {
      const img = logoImages[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`  ${i + 1}. ${alt || 'Logo'}: ${src}`);
      
      // Check if image loads successfully
      const response = await page.request.get(`http://localhost:3007${src}`);
      const status = response.status();
      console.log(`     Status: ${status} ${status === 200 ? '✅' : '❌'}`);
    }
    
    // Take screenshot of the top section
    await page.screenshot({ 
      path: 'casino-portal-with-logos.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    console.log('\n📸 Screenshot saved as: casino-portal-with-logos.png');
    
    // Check the top 3 section specifically
    const topThreeSection = await page.locator('#top-three').count();
    if (topThreeSection > 0) {
      console.log('\n🏆 Top 3 section found!');
      
      // Check for enhanced casino cards
      const enhancedCards = await page.locator('#top-three astro-island').all();
      console.log(`🎯 Found ${enhancedCards.length} enhanced casino cards in top 3`);
      
      // Check logos in enhanced cards
      for (let i = 0; i < enhancedCards.length; i++) {
        const card = enhancedCards[i];
        const logos = await card.locator('img, picture').all();
        console.log(`  Card ${i + 1}: ${logos.length} logo elements`);
      }
    }
    
    // Wait a bit to see the page
    console.log('\n⏳ Keeping browser open for 10 seconds to inspect...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkCasinoLogos();