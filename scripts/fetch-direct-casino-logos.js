#!/usr/bin/env node

/**
 * Direct Casino Logo Scraper
 * Directly scrapes casino logos from their official websites
 * Using known casino domains and common logo paths
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Direct logo fetcher from casino websites
 */
class DirectCasinoLogoFetcher {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Generate potential logo URLs for a casino
   */
  generateLogoUrls(casinoSlug, casinoBrand) {
    const domains = [
      `${casinoSlug}.com`,
      `${casinoSlug}.co`,
      `${casinoSlug}.net`,
      `www.${casinoSlug}.com`,
      `${casinoSlug.replace('-', '')}.com`
    ];

    const logoPaths = [
      '/logo.png',
      '/images/logo.png',
      '/assets/logo.png',
      '/static/logo.png',
      '/img/logo.png',
      '/media/logo.png',
      '/wp-content/uploads/logo.png',
      `/images/${casinoSlug}-logo.png`,
      `/assets/${casinoSlug}.png`,
      '/favicon-196x196.png', // Sometimes casinos use large favicons as logos
      '/apple-touch-icon-180x180.png'
    ];

    const urls = [];
    for (const domain of domains) {
      for (const logoPath of logoPaths) {
        urls.push(`https://${domain}${logoPath}`);
      }
    }

    return urls;
  }

  /**
   * Try to fetch a logo from known casino review sites
   */
  generateReviewSiteUrls(casinoBrand, casinoSlug) {
    const reviewSites = [
      `https://www.askgamblers.com/online-casinos/reviews/${casinoSlug}`,
      `https://www.casinomeister.com/casinos/${casinoSlug}`,
      `https://www.latestcasinobonuses.com/casinos/${casinoSlug}`,
      `https://www.casinoguide.ca/casinos/${casinoSlug}`
    ];

    return reviewSites;
  }

  /**
   * Download and validate logo
   */
  async downloadLogo(logoUrl, casinoBrand) {
    try {
      console.log(`    ⬇️  Trying: ${logoUrl.substring(0, 50)}...`);

      const response = await fetch(logoUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Validate with Sharp
      const metadata = await sharp(buffer).metadata();
      
      // Quality checks for real logos
      if (metadata.width < 100 || metadata.height < 50) {
        throw new Error(`Too small: ${metadata.width}x${metadata.height}`);
      }

      if (buffer.length < 1500) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      console.log(`    ✅ Found logo: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      return buffer;

    } catch (error) {
      console.log(`    ❌ ${error.message}`);
      return null;
    }
  }

  /**
   * Process the logo with Sharp
   */
  async processLogo(buffer, slug) {
    try {
      const sharpImage = sharp(buffer);
      
      // Main PNG fallback
      await sharpImage
        .clone()
        .resize(400, 200, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 95, compressionLevel: 6 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      
      for (const size of sizes) {
        const maxHeight = Math.round(size * 0.5);
        
        // PNG versions
        await sharpImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP versions
        await sharpImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF versions
        await sharpImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .avif({ quality: 80, effort: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.avif`));
      }

      return true;
    } catch (error) {
      console.error(`    ❌ Processing failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Main process
 */
async function fetchDirectCasinoLogos() {
  console.log('🎰 Direct Casino Logo Fetcher');
  console.log('Fetching logos directly from casino websites');
  console.log('==========================================\n');

  // Create directory
  await fs.mkdir(LOGOS_DIR, { recursive: true });

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Processing ${casinos.length} partner casinos\n`);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    process.exit(1);
  }

  const fetcher = new DirectCasinoLogoFetcher();
  
  const stats = {
    total: casinos.length,
    successful: 0,
    failed: 0,
    startTime: Date.now()
  };

  const results = {
    successful: [],
    failed: []
  };

  // Process first 10 casinos as a test
  const casinosToProcess = casinos.slice(0, 10);
  console.log(`🎯 Testing with first ${casinosToProcess.length} casinos...\n`);

  for (let i = 0; i < casinosToProcess.length; i++) {
    const casino = casinosToProcess[i];
    const progress = Math.round((i / casinosToProcess.length) * 100);
    
    console.log(`[${i + 1}/${casinosToProcess.length}] (${progress}%)`);
    console.log(`🎯 Fetching logo for: ${casino.brand} (${casino.slug})`);

    try {
      // Generate potential logo URLs
      const logoUrls = fetcher.generateLogoUrls(casino.slug, casino.brand);
      console.log(`  📋 Generated ${logoUrls.length} potential URLs`);

      let success = false;
      
      // Try each URL until we find a working logo
      for (const logoUrl of logoUrls) {
        const buffer = await fetcher.downloadLogo(logoUrl, casino.brand);
        if (!buffer) continue;

        const processed = await fetcher.processLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed REAL logo for ${casino.brand}`);
          stats.successful++;
          results.successful.push({
            brand: casino.brand,
            slug: casino.slug,
            source: logoUrl
          });
          success = true;
          break;
        }
      }

      if (!success) {
        console.log(`  ❌ No working logo found for ${casino.brand}`);
        stats.failed++;
        results.failed.push({
          brand: casino.brand,
          slug: casino.slug,
          reason: 'No accessible logo URLs'
        });
      }

    } catch (error) {
      console.error(`  💥 Error: ${error.message}`);
      stats.failed++;
      results.failed.push({
        brand: casino.brand,
        slug: casino.slug,
        reason: error.message
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');
  }

  // Final report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('🏆 DIRECT LOGO FETCHING COMPLETE!');
  console.log('==================================');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 Processed: ${casinosToProcess.length}/${casinos.length} casinos`);
  console.log(`✅ Success: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success Rate: ${stats.successful > 0 ? ((stats.successful / casinosToProcess.length) * 100).toFixed(1) : 0}%`);

  if (stats.successful > 0) {
    console.log('\n📁 REAL casino logos saved to: public/images/casinos/');
    console.log('🔧 Each logo includes 10 optimized versions');
    
    console.log('\n✅ Successful logos:');
    results.successful.forEach(item => {
      console.log(`  • ${item.brand}: ${item.source}`);
    });
    
    console.log('\n🚀 Next steps:');
    console.log('1. npm run build');
    console.log('2. docker build -t casino-direct-logos .');
    console.log('3. Check your casino portal with REAL logos!');
  }

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed casinos:');
    results.failed.forEach(item => {
      console.log(`  • ${item.brand}: ${item.reason}`);
    });
  }

  console.log('\n💡 This method fetches logos directly from casino websites!');
}

if (require.main === module) {
  fetchDirectCasinoLogos().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { fetchDirectCasinoLogos };