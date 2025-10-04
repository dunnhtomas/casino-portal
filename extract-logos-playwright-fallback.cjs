/**
 * Playwright-based Logo Extraction with Google Search
 * 
 * This script:
 * 1. Searches Google for "{casino name} casino" to find the REAL website
 * 2. Takes the first search result URL
 * 3. Navigates to that URL with Playwright
 * 4. Extracts the actual logo from the real casino website
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Load failed casinos from previous results
const resultsFile = 'real-logo-extraction-results.json';
const previousResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
const failedCasinos = previousResults.results
  .filter(r => r.status === 'failed')
  .map(r => ({
    slug: r.slug,
    brand: r.casino,
    searchQuery: `${r.casino} casino`,
    url: null // Will be found via Google search
  }));

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'casinos');

console.log(`🎯 Retrying ${failedCasinos.length} failed casinos with Google Search + Playwright\n`);

/**
 * Search Google for casino and get first result URL
 */
async function findRealCasinoURL(page, searchQuery) {
  try {
    console.log(`   🔍 Searching Google: "${searchQuery}"`);
    
    // Navigate to Google search
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for search results to load
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging
    // await page.screenshot({ path: `debug-${searchQuery.replace(/[^a-z0-9]/gi, '-')}.png` });
    
    // Extract first organic result URL
    const firstResultURL = await page.evaluate(() => {
      // Log what we see
      const searchDiv = document.querySelector('#search');
      console.log('Search div found:', !!searchDiv);
      
      // Try multiple selectors for search results (updated for 2025 Google)
      const selectors = [
        '#search a[jsname="UWckNb"]',  // Main result link
        '#search div.yuRUbf > a',       // Result title link
        '#rso div.g a[href^="http"]',   // Classic selector
        'div.g a[href]:not([href*="google."])',
        'a[jsname][href^="http"]:not([href*="google"])',
        '#search a[ping][href^="http"]'
      ];
      
      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" found ${links.length} links`);
        
        for (const link of links) {
          if (link && link.href) {
            const url = link.href;
            // Filter out unwanted domains
            if (!url.includes('youtube.com') && 
                !url.includes('facebook.com') && 
                !url.includes('twitter.com') &&
                !url.includes('instagram.com') &&
                !url.includes('linkedin.com') &&
                !url.includes('google.com') &&
                !url.includes('webcache') &&
                !url.includes('translate.google')) {
              console.log('Found URL:', url);
              return url;
            }
          }
        }
      }
      
      return null;
    });
    
    if (!firstResultURL) {
      // Try to get page content to debug
      const pageContent = await page.content();
      if (pageContent.includes('detected unusual traffic') || pageContent.includes('CAPTCHA')) {
        return { success: false, error: 'Google CAPTCHA detected' };
      }
      return { success: false, error: 'No search results found' };
    }
    
    console.log(`   ✅ Found URL: ${firstResultURL}`);
    return { success: true, url: firstResultURL };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract logo using Playwright with full browser
 */
async function extractLogoWithPlaywright(browser, casino) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`   🌐 Navigating to ${casino.url}...`);
    
    // Navigate with longer timeout
    await page.goto(casino.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Extract logo URL using multiple strategies
    const logoData = await page.evaluate(() => {
      const selectors = [
        'img[alt*="logo" i]',
        'img[class*="logo" i]',
        'img[id*="logo" i]',
        '.logo img',
        '#logo img',
        'header img:first-of-type',
        '.header img:first-of-type',
        'nav img:first-of-type',
        '.navbar img:first-of-type',
        'img[src*="logo" i]',
        'a[href="/"] img',
        'a[href="#"] img'
      ];
      
      for (const selector of selectors) {
        const logos = document.querySelectorAll(selector);
        for (const logo of logos) {
          // Check if it looks like a logo (size constraints)
          if (logo.width > 50 && logo.width < 600 && 
              logo.height > 20 && logo.height < 200) {
            return {
              found: true,
              src: logo.src,
              currentSrc: logo.currentSrc,
              alt: logo.alt,
              width: logo.width,
              height: logo.height,
              selector: selector
            };
          }
        }
      }
      
      // Fallback: get first reasonable-sized image in header/nav
      const headerImgs = document.querySelectorAll('header img, nav img, .header img, .navbar img');
      for (const img of headerImgs) {
        if (img.width > 50 && img.width < 600 && 
            img.height > 20 && img.height < 200) {
          return {
            found: true,
            src: img.src,
            currentSrc: img.currentSrc,
            alt: img.alt || 'header-logo',
            width: img.width,
            height: img.height,
            selector: 'header-fallback'
          };
        }
      }
      
      return { found: false };
    });
    
    await context.close();
    
    if (!logoData.found) {
      return { success: false, error: 'No logo found' };
    }
    
    return {
      success: true,
      logoUrl: logoData.currentSrc || logoData.src,
      width: logoData.width,
      height: logoData.height,
      selector: logoData.selector
    };
    
  } catch (error) {
    await context.close();
    return { success: false, error: error.message };
  }
}

/**
 * Download image from URL
 */
async function downloadImage(url, filepath) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        if (stats.size < 500) {
          fs.unlinkSync(filepath);
          reject(new Error('File too small'));
        } else {
          resolve({ size: stats.size });
        }
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Playwright Logo Extraction - Fallback Mode\n');
  console.log('━'.repeat(80) + '\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  for (let i = 0; i < failedCasinos.length; i++) {
    const casino = failedCasinos[i];
    const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
    
    console.log(`[${i + 1}/${failedCasinos.length}] 🎰 ${casino.brand}`);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
      // Step 1: Search Google for real casino URL
      const searchResult = await findRealCasinoURL(page, casino.searchQuery);
      
      if (!searchResult.success) {
        console.log(`   ❌ ${searchResult.error}\n`);
        await context.close();
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'failed',
          error: searchResult.error
        });
        continue;
      }
      
      casino.url = searchResult.url;
      
      // Step 2: Extract logo from the real URL
      const extraction = await extractLogoWithPlaywright(browser, casino);
      
      if (!extraction.success) {
        console.log(`   ❌ ${extraction.error}\n`);
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'failed',
          error: extraction.error
        });
        continue;
      }
      
      console.log(`   ✅ Found: ${extraction.logoUrl.substring(0, 80)}...`);
      console.log(`   📏 Size: ${extraction.width}x${extraction.height}`);
      
      // Download
      console.log('   📥 Downloading...');
      const download = await downloadImage(extraction.logoUrl, outputPath);
      console.log(`   ✅ Downloaded (${(download.size / 1024).toFixed(2)}KB)\n`);
      
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'success',
        realUrl: casino.url,
        logoUrl: extraction.logoUrl,
        fileSize: download.size,
        dimensions: `${extraction.width}x${extraction.height}`
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'failed',
        error: error.message
      });
    } finally {
      await context.close();
    }
    
    // Rate limiting between casinos
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  await browser.close();
  
  // Merge with previous results
  const mergedResults = previousResults.results.map(prev => {
    if (prev.status !== 'failed') return prev;
    
    const retry = results.find(r => r.slug === prev.slug);
    return retry || prev;
  });
  
  // Statistics
  const stats = {
    total: mergedResults.length,
    succeeded: mergedResults.filter(r => r.status === 'success').length,
    skipped: mergedResults.filter(r => r.status === 'skipped').length,
    failed: mergedResults.filter(r => r.status === 'failed').length
  };
  
  const successRate = ((stats.succeeded / (stats.total - stats.skipped)) * 100).toFixed(2);
  
  // Save updated results
  const output = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    successRate: `${successRate}%`,
    results: mergedResults,
    playwrightRetry: {
      attempted: failedCasinos.length,
      succeeded: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length
    }
  };
  
  fs.writeFileSync('real-logo-extraction-results-final.json', JSON.stringify(output, null, 2));
  
  // Summary
  console.log('━'.repeat(80));
  console.log('\n🎉 PLAYWRIGHT RETRY COMPLETE!\n');
  console.log('📊 RETRY STATISTICS:');
  console.log(`   Attempted: ${failedCasinos.length}`);
  console.log(`   ✅ Success: ${results.filter(r => r.status === 'success').length}`);
  console.log(`   ❌ Failed:  ${results.filter(r => r.status === 'failed').length}`);
  
  console.log('\n📊 OVERALL STATISTICS:');
  console.log(`   Total:      ${stats.total}`);
  console.log(`   ✅ Success:  ${stats.succeeded}`);
  console.log(`   ⏭️  Skipped:  ${stats.skipped}`);
  console.log(`   ❌ Failed:   ${stats.failed}`);
  console.log(`   🎯 Rate:     ${successRate}%`);
  
  console.log(`\n💾 Final results: real-logo-extraction-results-final.json`);
  console.log('\n' + '━'.repeat(80));
}

main().catch(console.error);
