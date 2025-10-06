import { test, expect } from '@playwright/test';

const BASE_URL = 'https://bestcasinoportal.com';

// Sample URLs to test across different sections
const testUrls = {
  // Core pages
  homepage: '/',
  reviews: '/reviews',
  bonuses: '/bonus',
  providers: '/providers',
  games: '/games',
  guides: '/guide',
  
  // Regional pages
  regions: {
    alberta: '/regions/alberta',
    ontario: '/regions/ontario',
    britishColumbia: '/regions/british-columbia'
  },
  
  // Casino review samples
  casinoReviews: [
    '/reviews/lucki',
    '/reviews/jackpot-raider',
    '/reviews/malina',
    '/reviews/royal',
    '/reviews/vegas',
    '/reviews/spincastle',
    '/reviews/wildrobin',
    '/reviews/vipzino'
  ],
  
  // Bonus pages samples
  bonusPages: [
    '/bonuses/lucki-casino-welcome-bonus',
    '/bonuses/jackpot-raider-free-spins-bonus',
    '/bonuses/malina-casino-no-deposit-bonus',
    '/bonuses/royal-panda-high-roller-bonus'
  ],
  
  // Provider pages samples
  providerPages: [
    '/providers/lucki-casino-netent-games',
    '/providers/jackpot-raider-pragmatic-play-games',
    '/providers/malina-casino-microgaming-games',
    '/providers/royal-panda-evolution-gaming-games'
  ],
  
  // Payment method pages
  paymentPages: [
    '/payments/visa-casinos-ontario',
    '/payments/mastercard-casinos-alberta',
    '/payments/interac-casinos-british-columbia',
    '/payments/bitcoin-casinos-ontario'
  ],
  
  // Comparison pages
  comparisonPages: [
    '/compare/lucki-vs-jackpot-raider',
    '/compare/malina-vs-royal-panda',
    '/compare/vegas-nova-vs-spincastle'
  ],
  
  // Game feature pages
  featurePages: [
    '/features/live-dealer-casinos',
    '/features/mobile-casinos',
    '/features/fast-withdrawal-casinos'
  ]
};

test.describe('Live Server Content Audit', () => {
  test.setTimeout(120000); // 2 minutes timeout for comprehensive test

  test('should have all core pages accessible', async ({ page }) => {
    const corePages = [
      testUrls.homepage,
      testUrls.reviews,
      testUrls.bonuses,
      testUrls.providers,
      testUrls.games,
      testUrls.guides
    ];

    const results = [];
    
    for (const url of corePages) {
      try {
        const response = await page.goto(`${BASE_URL}${url}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const status = response.status();
        const title = await page.title();
        const hasContent = await page.locator('main, .content, article').count() > 0;
        
        results.push({
          url,
          status,
          title,
          hasContent,
          success: status === 200 && hasContent
        });
        
        console.log(`✓ ${url}: ${status} - ${title} - Content: ${hasContent}`);
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          title: '',
          hasContent: false,
          success: false,
          error: error.message
        });
        console.log(`✗ ${url}: ERROR - ${error.message}`);
      }
    }

    // Verify all core pages are working
    const failedPages = results.filter(r => !r.success);
    if (failedPages.length > 0) {
      console.log('\nFailed core pages:', failedPages);
    }
    
    expect(failedPages.length).toBe(0);
  });

  test('should have regional pages working', async ({ page }) => {
    const results = [];
    
    for (const [region, url] of Object.entries(testUrls.regions)) {
      try {
        const response = await page.goto(`${BASE_URL}${url}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const status = response.status();
        const title = await page.title();
        const hasRegionalContent = await page.locator('.casino-card, .casino-list, .region-content').count() > 0;
        
        results.push({
          region,
          url,
          status,
          title,
          hasRegionalContent,
          success: status === 200 && hasRegionalContent
        });
        
        console.log(`✓ ${region}: ${status} - ${title} - Regional Content: ${hasRegionalContent}`);
      } catch (error) {
        results.push({
          region,
          url,
          status: 'ERROR',
          title: '',
          hasRegionalContent: false,
          success: false,
          error: error.message
        });
        console.log(`✗ ${region}: ERROR - ${error.message}`);
      }
    }

    const failedRegions = results.filter(r => !r.success);
    if (failedRegions.length > 0) {
      console.log('\nFailed regional pages:', failedRegions);
    }
    
    expect(failedRegions.length).toBe(0);
  });

  test('should have casino review pages with content', async ({ page }) => {
    const results = [];
    
    for (const url of testUrls.casinoReviews.slice(0, 5)) { // Test first 5 for speed
      try {
        const response = await page.goto(`${BASE_URL}${url}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const status = response.status();
        const title = await page.title();
        const hasReviewContent = await page.locator('.review-content, .casino-review, .rating, .pros-cons').count() > 0;
        const hasButtons = await page.locator('a[href*="register"], .cta-button, .play-button').count() > 0;
        
        results.push({
          url,
          status,
          title,
          hasReviewContent,
          hasButtons,
          success: status === 200 && hasReviewContent
        });
        
        console.log(`✓ ${url}: ${status} - Review Content: ${hasReviewContent} - CTA Buttons: ${hasButtons}`);
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          hasReviewContent: false,
          hasButtons: false,
          success: false,
          error: error.message
        });
        console.log(`✗ ${url}: ERROR - ${error.message}`);
      }
    }

    const failedReviews = results.filter(r => !r.success);
    if (failedReviews.length > 0) {
      console.log('\nFailed casino review pages:', failedReviews);
    }
    
    expect(failedReviews.length).toBe(0);
  });

  test('should have bonus pages accessible', async ({ page }) => {
    const results = [];
    
    for (const url of testUrls.bonusPages.slice(0, 3)) { // Test first 3 for speed
      try {
        const response = await page.goto(`${BASE_URL}${url}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const status = response.status();
        const title = await page.title();
        const hasBonusContent = await page.locator('.bonus-details, .bonus-info, .terms-conditions').count() > 0;
        
        results.push({
          url,
          status,
          title,
          hasBonusContent,
          success: status === 200 && hasBonusContent
        });
        
        console.log(`✓ ${url}: ${status} - Bonus Content: ${hasBonusContent}`);
      } catch (error) {
        results.push({
          url,
          status: 'ERROR',
          hasBonusContent: false,
          success: false,
          error: error.message
        });
        console.log(`✗ ${url}: ERROR - ${error.message}`);
      }
    }

    const failedBonuses = results.filter(r => !r.success);
    if (failedBonuses.length > 0) {
      console.log('\nFailed bonus pages:', failedBonuses);
    }
    
    expect(failedBonuses.length).toBe(0);
  });

  test('should verify essential website elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Check navigation
    const navExists = await page.locator('nav, .navigation, .header-nav').count() > 0;
    console.log(`Navigation exists: ${navExists}`);
    
    // Check footer
    const footerExists = await page.locator('footer, .footer').count() > 0;
    console.log(`Footer exists: ${footerExists}`);
    
    // Check casino cards/listings
    const casinoCards = await page.locator('.casino-card, .casino-item, [data-casino]').count();
    console.log(`Casino cards found: ${casinoCards}`);
    
    // Check images are loading (not 404)
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    console.log(`Broken images: ${brokenImages}`);
    
    // Check for critical errors in console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    expect(navExists).toBe(true);
    expect(footerExists).toBe(true);
    expect(casinoCards).toBeGreaterThan(0);
    expect(brokenImages).toBeLessThan(5); // Allow a few broken images
  });

  test('should check critical static assets', async ({ page }) => {
    const staticAssets = [
      '/favicon.ico',
      '/favicon.svg',
      '/robots.txt',
      '/sitemap.xml'
    ];
    
    const results = [];
    
    for (const asset of staticAssets) {
      try {
        const response = await page.request.get(`${BASE_URL}${asset}`);
        const status = response.status();
        
        results.push({
          asset,
          status,
          success: status === 200
        });
        
        console.log(`${asset}: ${status}`);
      } catch (error) {
        results.push({
          asset,
          status: 'ERROR',
          success: false,
          error: error.message
        });
        console.log(`${asset}: ERROR - ${error.message}`);
      }
    }

    const failedAssets = results.filter(r => !r.success);
    if (failedAssets.length > 0) {
      console.log('\nFailed static assets:', failedAssets);
    }
    
    expect(failedAssets.length).toBe(0);
  });

  test('should perform content completeness check', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Count different types of content
    const contentStats = await page.evaluate(() => {
      return {
        totalLinks: document.querySelectorAll('a[href]').length,
        internalLinks: document.querySelectorAll('a[href^="/"], a[href*="bestcasinoportal.com"]').length,
        externalLinks: document.querySelectorAll('a[href^="http"]:not([href*="bestcasinoportal.com"])').length,
        images: document.querySelectorAll('img').length,
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        paragraphs: document.querySelectorAll('p').length,
        forms: document.querySelectorAll('form').length,
        buttons: document.querySelectorAll('button, .button, .btn').length
      };
    });
    
    console.log('Content Statistics:');
    console.log(`- Total Links: ${contentStats.totalLinks}`);
    console.log(`- Internal Links: ${contentStats.internalLinks}`);
    console.log(`- External Links: ${contentStats.externalLinks}`);
    console.log(`- Images: ${contentStats.images}`);
    console.log(`- Headings: ${contentStats.headings}`);
    console.log(`- Paragraphs: ${contentStats.paragraphs}`);
    console.log(`- Forms: ${contentStats.forms}`);
    console.log(`- Buttons: ${contentStats.buttons}`);
    
    // Basic content validation
    expect(contentStats.totalLinks).toBeGreaterThan(50);
    expect(contentStats.internalLinks).toBeGreaterThan(20);
    expect(contentStats.images).toBeGreaterThan(10);
    expect(contentStats.headings).toBeGreaterThan(5);
  });
});