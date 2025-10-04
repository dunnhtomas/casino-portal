const { chromium } = require('playwright');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Batch 5: Casinos #24-28
const casinos = [
  { id: 24, name: 'Bizzo', domains: ['bizzo.casino', 'bizzo.com', 'bizzocasino.com', 'bizzo.bet'] },
  { id: 25, name: 'Cobra', domains: ['cobra.casino', 'cobracasino.com', 'cobra-casino.com', 'cobra.bet'] },
  { id: 26, name: 'Rabona', domains: ['rabona.com', 'rabona.casino', 'rabonacasino.com', 'rabona.bet'] },
  { id: 27, name: 'Nomini', domains: ['nomini.com', 'nomini.casino', 'nominicasino.com', 'nomini.io'] },
  { id: 28, name: 'Cazimbo', domains: ['cazimbo.com', 'cazimbo.casino', 'cazimbo.bet', 'cazimbocasino.com'] }
];

const OUTPUT_DIR = 'C:\\Users\\tamir\\Downloads\\cc23\\public\\images\\casinos';
const MAX_WIDTH = 400;
const MAX_HEIGHT = 200;

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

async function extractLogoUrl(page) {
  for (const selector of LOGO_SELECTORS) {
    try {
      const logo = await page.$(selector);
      if (logo) {
        const src = await logo.getAttribute('src');
        const alt = await logo.getAttribute('alt') || '';
        if (src && !src.includes('data:image')) {
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
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
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
      
      await page.waitForTimeout(2000);
      
      const logo = await extractLogoUrl(page);
      
      if (logo) {
        result.domain = page.url();
        result.logoUrl = logo.url;
        
        await context.close();
        
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
  console.log('\n🚀 BATCH 5 - Direct Playwright Extraction');
  console.log(`📦 Processing ${casinos.length} casinos (#24-28)`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  const startTime = Date.now();
  
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const results = [];
  
  for (const casino of casinos) {
    const result = await processCasino(browser, casino);
    results.push(result);
  }
  
  await browser.close();
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const succeeded = results.filter(r => r.downloaded).length;
  const failed = results.length - succeeded;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 BATCH 5 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Succeeded: ${succeeded}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log(`📈 Progress: ${22 + succeeded}/32 casinos (${((22 + succeeded) / 32 * 100).toFixed(1)}%)`);
  
  await fs.writeFile(
    'batch5-results.json',
    JSON.stringify({ batch: 5, results, succeeded, failed, elapsed }, null, 2)
  );
  
  console.log('\n✅ Results saved to batch5-results.json\n');
}

main().catch(console.error);
