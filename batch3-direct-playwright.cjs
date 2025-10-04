const { chromium } = require('playwright');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Batch 3: Casinos #14-18 - try multiple domain patterns + review sites
const casinos = [
  { id: 14, name: 'Betvili', domains: ['betvili.com', 'betvili.casino', 'betvili.bet', 'bet-vili.com'] },
  { id: 15, name: 'Betroom24', domains: ['betroom24.com', 'betroom24.casino', 'betroom24.eu', 'bet-room24.com', 'betroom24casinos.com'] },
  { id: 16, name: 'Lulobet', domains: ['lulobet.com', 'lulobet.casino', 'lulobet-casino.com', 'lulo.bet', 'lulobets.com'] },
  { id: 17, name: 'Gslot', domains: ['gslot.com', 'g-slot.casino', 'gslotcasino.com', 'gslots.casino', 'gslot.net'] },
  { id: 18, name: 'Boomerang', domains: ['boomerang.bet', 'boomerang-bet.casino', 'boomerangbet.com', 'boomerang-casino.com', 'boomerangbets.com'] }
];

const OUTPUT_DIR = 'C:\\Users\\tamir\\Downloads\\cc23\\public\\images\\casinos';
const MAX_WIDTH = 400;
const MAX_HEIGHT = 200;

// Logo extraction selectors (in priority order)
const LOGO_SELECTORS = [
  'a[href="/"] img',
  'header a[href="/"] img',
  'banner a img',
  '.logo img',
  'header img',
  'banner img',
  'a[href="/"] img[alt*="ome"]',
  'link[href="/"] img',
  'nav img',
  '.header-logo img'
];

async function searchDuckDuckGo(browser, casinoName) {
  console.log(`🔍 Searching for ${casinoName}...`);
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Use Google search (more reliable than DuckDuckGo for automation)
    const searchQuery = encodeURIComponent(`${casinoName} casino`);
    await page.goto(`https://www.google.com/search?q=${searchQuery}`, { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    
    await page.waitForTimeout(2000);
    
    // Extract search result links
    const results = await page.evaluate(() => {
      const resultLinks = [];
      
      // Google uses various selectors for result links
      const links = document.querySelectorAll('a[href][jsname="UWckNb"], a[href] h3, div.g a[href]');
      
      links.forEach(linkOrH3 => {
        const a = linkOrH3.tagName === 'A' ? linkOrH3 : linkOrH3.closest('a');
        if (!a) return;
        
        const href = a.href;
        if (href && 
            !href.includes('google.com') && 
            !href.includes('wikipedia.org') &&
            !href.includes('youtube.com') &&
            (href.startsWith('http://') || href.startsWith('https://'))) {
          resultLinks.push(href);
        }
      });
      
      return [...new Set(resultLinks)].slice(0, 5);
    });
    
    await context.close();
    console.log(`✅ Found ${results.length} results for ${casinoName}`);
    if (results.length > 0) console.log(`   First: ${results[0]}`);
    return results;
  } catch (error) {
    await context.close();
    console.log(`⚠️ Search failed for ${casinoName}: ${error.message}`);
    return [];
  }
}

async function extractLogoUrl(page) {
  for (const selector of LOGO_SELECTORS) {
    try {
      const logo = await page.$(selector);
      if (logo) {
        const src = await logo.getAttribute('src');
        const alt = await logo.getAttribute('alt') || '';
        if (src && !src.includes('data:image')) {
          // Make absolute URL
          const url = new URL(src, page.url()).href;
          console.log(`   Found logo: ${url} (selector: ${selector})`);
          return { url, alt, selector };
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  return null;
}

async function downloadAndProcessImage(imageUrl, filename) {
  try {
    console.log(`📥 Downloading ${filename}...`);
    
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Process with Sharp
    const buffer = Buffer.from(response.data);
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);
    
    const stats = await fs.stat(outputPath);
    console.log(`✅ Saved ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    return { success: true, filename, size: stats.size };
  } catch (error) {
    console.log(`❌ Failed to download ${filename}: ${error.message}`);
    return { success: false, filename, error: error.message };
  }
}

async function processCasino(browser, casino) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎰 Processing #${casino.id}: ${casino.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const result = {
    id: casino.id,
    name: casino.name,
    domain: null,
    logoUrl: null,
    downloaded: false,
    error: null
  };
  
  // Try all domain variations
  const domainsToTry = casino.domains.map(d => `https://${d}`);
  
  for (const url of domainsToTry) {
    console.log(`🌐 Trying ${url}...`);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 20000 
      });
      
      if (response.status() === 403) {
        console.log(`   ⚠️ Geo-blocked (403), trying next...`);
        await context.close();
        continue;
      }
      
      if (response.status() >= 400) {
        console.log(`   ⚠️ Error ${response.status()}, trying next...`);
        await context.close();
        continue;
      }
      
      // Wait a bit for JS rendering
      await page.waitForTimeout(2000);
      
      // Extract logo
      const logo = await extractLogoUrl(page);
      
      if (logo) {
        result.domain = page.url();
        result.logoUrl = logo.url;
        
        await context.close();
        
        // Download and process
        const filename = `${casino.name.toLowerCase().replace(/\s+/g, '')}.png`;
        const downloadResult = await downloadAndProcessImage(logo.url, filename);
        
        if (downloadResult.success) {
          result.downloaded = true;
          console.log(`✅ ${casino.name} COMPLETE!`);
          return result;
        } else {
          result.error = downloadResult.error;
        }
        
        break;
      } else {
        console.log(`   ⚠️ No logo found, trying next domain...`);
        await context.close();
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      await context.close();
    }
  }
  
  if (!result.downloaded) {
    result.error = result.error || 'No logo found on any domain';
    console.log(`❌ ${casino.name} FAILED: ${result.error}`);
  }
  
  return result;
}

async function main() {
  console.log('\n🚀 BATCH 3 - Direct Playwright Extraction');
  console.log(`📦 Processing ${casinos.length} casinos (#14-18)`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  const startTime = Date.now();
  
  // Launch browser (headless for speed)
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const results = [];
  
  // Process casinos sequentially (parallel can be added later)
  for (const casino of casinos) {
    const result = await processCasino(browser, casino);
    results.push(result);
  }
  
  await browser.close();
  
  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const succeeded = results.filter(r => r.downloaded).length;
  const failed = results.length - succeeded;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 BATCH 3 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Succeeded: ${succeeded}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log(`📈 Progress: ${13 + succeeded}/32 casinos (${((13 + succeeded) / 32 * 100).toFixed(1)}%)`);
  
  // Save results
  await fs.writeFile(
    'batch3-results.json',
    JSON.stringify({ batch: 3, results, succeeded, failed, elapsed }, null, 2)
  );
  
  console.log('\n✅ Results saved to batch3-results.json\n');
}

main().catch(console.error);
