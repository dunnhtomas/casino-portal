import { test, expect } from '@playwright/test';

/**
 * Comprehensive Styling Fixes
 * Based on Playwright analysis, apply targeted fixes
 */

test.describe('Homepage Styling Fixes', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Apply Navigation Overflow Fix', async ({ page }) => {
    console.log('🔧 Fixing Navigation Overflow Issues');
    
    // Inject CSS fix for navigation overflow
    await page.addStyleTag({
      content: `
        /* Navigation Overflow Fixes */
        .header-nav {
          overflow: visible !important;
        }
        
        .header-nav-container {
          overflow: visible !important;
        }
        
        .header-nav-inner {
          overflow: visible !important;
        }
        
        .header-nav-desktop {
          overflow: visible !important;
        }
        
        .header-nav-menu {
          overflow: visible !important;
        }
        
        .header-nav-item {
          overflow: visible !important;
        }
        
        /* Dropdown positioning fixes */
        .header-nav-item .group-hover\\:block {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 50;
          min-width: 200px;
        }
      `
    });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/fix-navigation-overflow.png',
      fullPage: false 
    });
    
    console.log('✅ Navigation overflow fix applied');
  });

  test('Apply Top 3 Section Layout Fix', async ({ page }) => {
    console.log('🔧 Fixing Top 3 Section Layout');
    
    // Inject CSS to constrain the Top 3 section
    await page.addStyleTag({
      content: `
        /* Top 3 Section Layout Fixes */
        #top-three {
          min-height: auto !important;
          max-height: 1000px;
          overflow: hidden;
        }
        
        #top-three .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        @media (min-width: 1024px) {
          #top-three .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }
        
        /* Constrain casino cards */
        #top-three .transform {
          max-height: 600px;
          overflow: hidden;
        }
        
        /* Ensure only 3 cards show */
        #top-three .grid > .transform:nth-child(n+4) {
          display: none;
        }
      `
    });
    
    const topThreeSection = page.locator('#top-three');
    await topThreeSection.scrollIntoViewIfNeeded();
    
    await topThreeSection.screenshot({ 
      path: 'test-results/screenshots/fix-top-three-layout.png' 
    });
    
    // Check new height
    const newHeight = await topThreeSection.evaluate((el) => el.getBoundingClientRect().height);
    console.log('🔍 New Top 3 section height:', newHeight);
    
    console.log('✅ Top 3 section layout fix applied');
  });

  test('Apply Responsive Design Fixes', async ({ page }) => {
    console.log('🔧 Applying Responsive Design Fixes');
    
    // Inject responsive improvements
    await page.addStyleTag({
      content: `
        /* Responsive Design Fixes */
        
        /* Ensure proper mobile scaling */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem !important;
            line-height: 1.2 !important;
          }
          
          .hero-subtitle {
            font-size: 1.125rem !important;
            line-height: 1.4 !important;
          }
          
          .hero-cta-container {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .hero-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
        }
        
        /* Improve section spacing */
        section {
          margin-bottom: 0 !important;
        }
        
        /* Fix container max-widths */
        .max-w-7xl {
          max-width: 1280px !important;
        }
        
        /* Ensure consistent padding */
        .py-16 {
          padding-top: 4rem !important;
          padding-bottom: 4rem !important;
        }
        
        /* Fix card hover effects */
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.01) !important;
        }
      `
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'test-results/screenshots/fix-mobile-responsive.png',
      fullPage: true 
    });
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ 
      path: 'test-results/screenshots/fix-desktop-responsive.png',
      fullPage: false 
    });
    
    console.log('✅ Responsive design fixes applied');
  });

  test('Apply Typography and Color Fixes', async ({ page }) => {
    console.log('🔧 Applying Typography and Color Fixes');
    
    await page.addStyleTag({
      content: `
        /* Typography and Color Improvements */
        
        /* Improve readability */
        body {
          line-height: 1.6 !important;
        }
        
        /* Enhance gold accents */
        .text-gold-500 {
          color: #fbbf24 !important;
        }
        
        .bg-gold-500 {
          background-color: #fbbf24 !important;
        }
        
        .from-gold-400 {
          --tw-gradient-from: #fbbf24 !important;
        }
        
        .to-gold-500 {
          --tw-gradient-to: #f59e0b !important;
        }
        
        /* Improve contrast for accessibility */
        .text-gray-600 {
          color: #4b5563 !important;
        }
        
        .text-gray-700 {
          color: #374151 !important;
        }
        
        /* Better shadow effects */
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        /* Smooth transitions */
        * {
          transition-duration: 200ms !important;
        }
        
        /* Focus states for accessibility */
        a:focus-visible, button:focus-visible {
          outline: 2px solid #fbbf24 !important;
          outline-offset: 2px !important;
        }
      `
    });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/fix-typography-colors.png',
      fullPage: false 
    });
    
    console.log('✅ Typography and color fixes applied');
  });

});