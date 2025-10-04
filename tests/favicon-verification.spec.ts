import { test, expect } from '@playwright/test';

/**
 * Favicon Fix Verification Test
 * Verify that favicon requests are properly handled
 */

test.describe('Favicon Fix Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Update the base URL for this test
    await page.goto('http://localhost:3016/');
    await page.waitForLoadState('networkidle');
  });

  test('Verify Favicon Requests Are Handled', async ({ page }) => {
    console.log('🔍 VERIFYING FAVICON FIXES');
    
    // Check if favicon.ico is accessible
    const faviconResponse = await page.goto('http://localhost:3016/favicon.ico');
    expect(faviconResponse?.status()).toBe(200);
    console.log('✅ favicon.ico loads successfully');
    
    // Check if favicon.svg is accessible
    const faviconSvgResponse = await page.goto('http://localhost:3016/favicon.svg');
    expect(faviconSvgResponse?.status()).toBe(200);
    console.log('✅ favicon.svg loads successfully');
    
    // Go back to main page and check for favicon in head
    await page.goto('http://localhost:3016/');
    
    // Check if favicon link tags are present
    const faviconLinks = await page.locator('link[rel="icon"]').count();
    expect(faviconLinks).toBeGreaterThan(0);
    console.log(`✅ Found ${faviconLinks} favicon link tags`);
    
    // Check for SVG favicon specifically
    const svgFavicon = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(svgFavicon).toBeVisible();
    console.log('✅ SVG favicon link found');
    
    // Check for ICO favicon fallback
    const icoFavicon = page.locator('link[rel="icon"][type="image/x-icon"]');
    await expect(icoFavicon).toBeVisible();
    console.log('✅ ICO favicon fallback found');
    
    // Listen for any 404 errors
    const errors: string[] = [];
    page.on('response', response => {
      if (response.status() === 404 && response.url().includes('favicon')) {
        errors.push(response.url());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (errors.length === 0) {
      console.log('✅ No favicon 404 errors detected');
    } else {
      console.log('❌ Favicon 404 errors found:', errors);
    }
    
    expect(errors.length).toBe(0);
    
    console.log('🎉 FAVICON FIX VERIFICATION COMPLETE!');
    console.log('🎯 Summary:');
    console.log('   ✅ favicon.ico: Working (200 status)');
    console.log('   ✅ favicon.svg: Working (200 status)');
    console.log(`   ✅ Favicon links: ${faviconLinks} found`);
    console.log('   ✅ No 404 errors detected');
  });

});