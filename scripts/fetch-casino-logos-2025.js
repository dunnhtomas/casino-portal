#!/usr/bin/env node

/**
 * Casino Logo Fetcher 2025 - Multi-Method Approach
 * Fetches real casino logos using multiple reliable methods
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Multi-method casino logo fetcher
 */
class CasinoLogoFetcher2025 {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.successfulDownloads = [];
    this.failedDownloads = [];
  }

  /**
   * Method 1: CDN and asset URLs (most reliable)
   */
  generateCDNUrls(casinoSlug, casinoBrand) {
    const cdnUrls = [];
    
    // Popular casino CDN patterns
    const cdnPatterns = [
      `https://cdn.${casinoSlug}.com/logo.png`,
      `https://assets.${casinoSlug}.com/images/logo.png`,
      `https://static.${casinoSlug}.com/logo.png`,
      `https://media.${casinoSlug}.com/brand/logo.png`,
      `https://images.${casinoSlug}.com/logo.png`,
      `https://${casinoSlug}.com/assets/logo.png`,
      `https://${casinoSlug}.com/images/brand/logo.png`,
      `https://${casinoSlug}.com/static/images/logo.png`
    ];

    // Add variations for different domains
    const domains = ['.com', '.co', '.net', '.io', '.casino'];
    
    for (const domain of domains) {
      const baseDomain = casinoSlug + domain;
      cdnUrls.push(
        `https://${baseDomain}/logo.png`,
        `https://${baseDomain}/assets/logo.png`,
        `https://${baseDomain}/images/logo.png`,
        `https://cdn.${baseDomain}/logo.png`,
        `https://static.${baseDomain}/logo.png`
      );
    }

    return [...cdnPatterns, ...cdnUrls];
  }

  /**
   * Method 2: Gaming industry logo databases
   */
  generateIndustryUrls(casinoSlug, casinoBrand) {
    return [
      `https://casino-logos.s3.amazonaws.com/${casinoSlug}.png`,
      `https://gaming-assets.cloudfront.net/logos/${casinoSlug}.png`,
      `https://casinobeats.com/wp-content/uploads/casino-logos/${casinoSlug}.png`,
      `https://www.askgamblers.com/casino-logos/${casinoSlug}.png`,
      `https://www.latestcasinobonuses.com/images/casinos/${casinoSlug}.png`,
      `https://www.casinomeister.com/wp-content/uploads/casino-logos/${casinoSlug}.png`
    ];
  }

  /**
   * Method 3: Social media and brand URLs
   */
  generateSocialUrls(casinoSlug, casinoBrand) {
    return [
      `https://pbs.twimg.com/profile_images/${casinoSlug}_logo.png`,
      `https://logo.clearbit.com/${casinoSlug}.com`,
      `https://img.logo.dev/${casinoSlug}.com?token=pk_X8VgEGqPSdqUzOOvfYqHYg`,
      `https://logo.uplead.com/${casinoSlug}.com`,
      `https://api.logo.dev/${casinoSlug}.com?size=400&format=png`
    ];
  }

  /**
   * Method 4: Favicon to logo conversion
   */
  generateFaviconUrls(casinoSlug) {
    return [
      `https://${casinoSlug}.com/favicon-196x196.png`,
      `https://${casinoSlug}.com/apple-touch-icon-180x180.png`,
      `https://${casinoSlug}.com/android-chrome-192x192.png`,
      `https://${casinoSlug}.com/mstile-144x144.png`,
      `https://www.google.com/s2/favicons?domain=${casinoSlug}.com&sz=128`
    ];
  }

  /**
   * Download and validate logo
   */
  async downloadLogo(logoUrl, casinoBrand) {
    try {
      console.log(`    ⬇️  Trying: ${logoUrl.substring(0, 60)}...`);

      const response = await fetch(logoUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': `https://${casinoBrand.toLowerCase().replace(/\s+/g, '')}.com`
        },
        timeout: 15000
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
      if (metadata.width < 80 || metadata.height < 40) {
        throw new Error(`Too small: ${metadata.width}x${metadata.height}`);
      }

      if (buffer.length < 1000) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      // Check for actual logo content (not placeholder/default images)
      if (buffer.length < 5000 && (metadata.width < 150 || metadata.height < 75)) {
        throw new Error(`Likely placeholder: ${Math.round(buffer.length/1024)}KB`);
      }

      console.log(`    ✅ Found REAL logo: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      return buffer;

    } catch (error) {
      console.log(`    ❌ ${error.message}`);
      return null;
    }
  }

  /**
   * Process the logo with Sharp - optimized for casino branding
   */
  async processLogo(buffer, slug) {
    try {
      const sharpImage = sharp(buffer);
      const metadata = await sharpImage.metadata();
      
      // Create transparent background version (better for overlays)
      const optimizedBuffer = await sharpImage
        .clone()
        .png({ quality: 95, compressionLevel: 6, alpha: true })
        .toBuffer();

      // Main PNG fallback with white background for compatibility
      await sharp(optimizedBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png({ quality: 95, compressionLevel: 6 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      
      for (const size of sizes) {
        const maxHeight = Math.round(size * 0.4); // Better aspect ratio for logos
        
        // PNG versions (with transparency)
        await sharp(optimizedBuffer)
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP versions (better compression)
        await sharp(optimizedBuffer)
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF versions (next-gen format)
        await sharp(optimizedBuffer)
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

  /**
   * Fetch logo for a single casino using all methods
   */
  async fetchCasinoLogo(casino) {
    console.log(`🎯 Fetching logo for: ${casino.brand} (${casino.slug})`);

    const allUrls = [
      ...this.generateCDNUrls(casino.slug, casino.brand),
      ...this.generateIndustryUrls(casino.slug, casino.brand),
      ...this.generateSocialUrls(casino.slug, casino.brand),
      ...this.generateFaviconUrls(casino.slug)
    ];

    console.log(`  📋 Generated ${allUrls.length} potential URLs`);

    // Try URLs in priority order
    for (let i = 0; i < allUrls.length; i++) {
      const logoUrl = allUrls[i];
      const buffer = await this.downloadLogo(logoUrl, casino.brand);
      
      if (buffer) {
        const processed = await this.processLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed REAL logo for ${casino.brand}`);
          this.successfulDownloads.push({
            brand: casino.brand,
            slug: casino.slug,
            source: logoUrl,
            method: this.getMethodType(logoUrl)
          });
          return true;
        }
      }

      // Add small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`  ❌ No working logo found for ${casino.brand}`);
    this.failedDownloads.push({
      brand: casino.brand,
      slug: casino.slug,
      reason: 'No accessible logo URLs'
    });
    return false;
  }

  getMethodType(url) {
    if (url.includes('cdn.') || url.includes('assets.') || url.includes('static.')) return 'CDN';
    if (url.includes('clearbit.') || url.includes('logo.dev')) return 'Logo Service';
    if (url.includes('favicon') || url.includes('apple-touch-icon')) return 'Favicon';
    if (url.includes('casino') || url.includes('gaming')) return 'Industry DB';
    return 'Direct';
  }
}

/**
 * Main process
 */
async function fetchCasinoLogos2025() {
  console.log('🎰 Casino Logo Fetcher 2025 - Multi-Method Approach');
  console.log('====================================================\n');

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

  const fetcher = new CasinoLogoFetcher2025();
  
  const stats = {
    total: casinos.length,
    successful: 0,
    failed: 0,
    startTime: Date.now()
  };

  // Process first 15 casinos as a test
  const casinosToProcess = casinos.slice(0, 15);
  console.log(`🎯 Testing with first ${casinosToProcess.length} casinos...\n`);

  for (let i = 0; i < casinosToProcess.length; i++) {
    const casino = casinosToProcess[i];
    const progress = Math.round((i / casinosToProcess.length) * 100);
    
    console.log(`[${i + 1}/${casinosToProcess.length}] (${progress}%)`);

    try {
      const success = await fetcher.fetchCasinoLogo(casino);
      if (success) {
        stats.successful++;
      } else {
        stats.failed++;
      }

    } catch (error) {
      console.error(`  💥 Error: ${error.message}`);
      stats.failed++;
      fetcher.failedDownloads.push({
        brand: casino.brand,
        slug: casino.slug,
        reason: error.message
      });
    }

    // Delay between casinos to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('');
  }

  // Final report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('🏆 CASINO LOGO FETCHING COMPLETE!');
  console.log('=================================');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 Processed: ${casinosToProcess.length}/${casinos.length} casinos`);
  console.log(`✅ Success: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success Rate: ${stats.successful > 0 ? ((stats.successful / casinosToProcess.length) * 100).toFixed(1) : 0}%`);

  if (stats.successful > 0) {
    console.log('\n📁 REAL casino logos saved to: public/images/casinos/');
    console.log('🔧 Each logo includes 10 optimized versions (PNG, WebP, AVIF)');
    
    console.log('\n✅ Successful logos by method:');
    const methodStats = {};
    fetcher.successfulDownloads.forEach(item => {
      methodStats[item.method] = (methodStats[item.method] || 0) + 1;
    });
    Object.entries(methodStats).forEach(([method, count]) => {
      console.log(`  • ${method}: ${count} logos`);
    });
    
    console.log('\n🚀 Next steps:');
    console.log('1. npm run build');
    console.log('2. docker build -t casino-real-logos .');
    console.log('3. Check your casino portal with AUTHENTIC logos!');
  }

  if (fetcher.failedDownloads.length > 0) {
    console.log('\n⚠️  Failed casinos:');
    fetcher.failedDownloads.forEach(item => {
      console.log(`  • ${item.brand}: ${item.reason}`);
    });
  }

  console.log('\n💡 This method uses multiple reliable sources for authentic casino logos!');
}

if (require.main === module) {
  fetchCasinoLogos2025().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { fetchCasinoLogos2025 };