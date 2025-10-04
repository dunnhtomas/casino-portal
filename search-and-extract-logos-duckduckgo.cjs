/**
 * Logo Extraction with DuckDuckGo Search (No CAPTCHA)
 * 
 * Uses DuckDuckGo instead of Google to avoid bot detection
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Load failed casinos
const resultsFile = 'real-logo-extraction-results.json';
const previousResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
const failedCasinos = previousResults.results
  .filter(r => r.status === 'failed')
  .map(r => ({
    slug: r.slug,
    brand: r.casino,
    searchQuery: `${r.casino} online casino`,
    url: null
  }));

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'casinos');

console.log(`🎯 Processing ${failedCasinos.length} failed casinos with DuckDuckGo\n`);

/**
 * Search DuckDuckGo for casino URL
 */
async function searchDuckDuckGo(page, searchQuery) {
  try {
    console.log(`   🔍 Searching: "${searchQuery}"`);
    
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // Extract first result
    const firstURL = await page.evaluate(() => {
      const selectors = [
        'article[data-testid="result"] a[href^="http"]',
        'div.result a[href^="http"]',
        'a.result__a[href^="http"]',
        'h2.result__title a[href^="http"]'
      ];
      
      for (const selector of selectors) {
        const link = document.querySelector(selector);
        if (link && link.href) {
          const url = link.href;
          if (!url.includes('duckduckgo.com') &&
              !url.includes('youtube.com') &&
              !url.includes('facebook.com') &&
              !url.includes('twitter.com')) {
            return url;
          }
        }
      }
      
      return null;
    });
    
    if (!firstURL) {
      return { success: false, error: 'No results' };
    }
    
    console.log(`   ✅ Found: ${firstURL}`);
    return { success: true, url: firstURL };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract logo from page
 */
async function extractLogo(page, url) {
  try {
    console.log(`   🌐 Loading ${url}...`);
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    const logoData = await page.evaluate(() => {
      const selectors = [
        'img[alt*="logo" i]',
        'img[class*="logo" i]',
        '.logo img',
        '#logo img',
        'header img:first-of-type',
        'nav img:first-of-type',
        'a[href="/"] img',
        'img[src*="logo" i]'
      ];
      
      for (const selector of selectors) {
        const logos = document.querySelectorAll(selector);
        for (const logo of logos) {
          if (logo.width > 50 && logo.width < 600 && 
              logo.height > 20 && logo.height < 200) {
            return {
              found: true,
              src: logo.currentSrc || logo.src,
              width: logo.width,
              height: logo.height
            };
          }
        }
      }
      
      return { found: false };
    });
    
    if (!logoData.found) {
      return { success: false, error: 'No logo found' };
    }
    
    console.log(`   ✅ Logo: ${logoData.src.substring(0, 80)}...`);
    return {
      success: true,
      logoUrl: logoData.src,
      width: logoData.width,
      height: logoData.height
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Download image
 */
async function downloadImage(url, filepath) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
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
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Main
 */
async function main() {
  console.log('🚀 DuckDuckGo Search + Logo Extraction\n');
  console.log('━'.repeat(80) + '\n');
  
  const browser = await chromium.launch({
    headless: true
  });
  
  const results = [];
  
  for (let i = 0; i < failedCasinos.length; i++) {
    const casino = failedCasinos[i];
    const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
    
    console.log(`\n[${i + 1}/${failedCasinos.length}] 🎰 ${casino.brand}`);
    
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    try {
      // Search
      const searchResult = await searchDuckDuckGo(page, casino.searchQuery);
      
      if (!searchResult.success) {
        console.log(`   ❌ ${searchResult.error}`);
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'failed',
          error: searchResult.error
        });
        await page.close();
        continue;
      }
      
      // Extract logo
      const logoResult = await extractLogo(page, searchResult.url);
      
      if (!logoResult.success) {
        console.log(`   ❌ ${logoResult.error}`);
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'failed',
          realUrl: searchResult.url,
          error: logoResult.error
        });
        await page.close();
        continue;
      }
      
      // Download
      console.log('   📥 Downloading...');
      const download = await downloadImage(logoResult.logoUrl, outputPath);
      console.log(`   ✅ Success (${(download.size / 1024).toFixed(2)}KB)`);
      
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'success',
        realUrl: searchResult.url,
        logoUrl: logoResult.logoUrl,
        fileSize: download.size
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'failed',
        error: error.message
      });
    } finally {
      await page.close();
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await browser.close();
  
  // Merge results
  const mergedResults = previousResults.results.map(prev => {
    if (prev.status !== 'failed') return prev;
    const retry = results.find(r => r.slug === prev.slug);
    return retry || prev;
  });
  
  const stats = {
    total: mergedResults.length,
    succeeded: mergedResults.filter(r => r.status === 'success').length,
    skipped: mergedResults.filter(r => r.status === 'skipped').length,
    failed: mergedResults.filter(r => r.status === 'failed').length
  };
  
  const successRate = ((stats.succeeded / (stats.total - stats.skipped)) * 100).toFixed(2);
  
  fs.writeFileSync('real-logo-extraction-results-final.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    statistics: stats,
    successRate: `${successRate}%`,
    results: mergedResults
  }, null, 2));
  
  console.log('\n' + '━'.repeat(80));
  console.log('\n🎉 COMPLETE!\n');
  console.log('📊 RETRY:');
  console.log(`   ✅ Success: ${results.filter(r => r.status === 'success').length}`);
  console.log(`   ❌ Failed:  ${results.filter(r => r.status === 'failed').length}`);
  console.log('\n📊 OVERALL:');
  console.log(`   Total:    ${stats.total}`);
  console.log(`   ✅ Success: ${stats.succeeded}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  console.log(`   ❌ Failed:  ${stats.failed}`);
  console.log(`   🎯 Rate:    ${successRate}%`);
  console.log('\n' + '━'.repeat(80));
}

main().catch(console.error);
