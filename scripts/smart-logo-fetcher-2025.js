#!/usr/bin/env node

/**
 * Smart Casino Logo Fetcher 2025
 * Uses proven logo services and real casino data
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Smart logo fetcher using proven sources
 */
class SmartLogoFetcher {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.successCount = 0;
    this.failCount = 0;
    this.results = [];
  }

  /**
   * Generate reliable logo URLs using proven services
   */
  generateSmartUrls(casinoSlug, casinoBrand) {
    const brandDomain = casinoBrand.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const slug = casinoSlug.toLowerCase();
    
    return [
      // Clearbit Logo API (very reliable for brands)
      `https://logo.clearbit.com/${slug}.com`,
      `https://logo.clearbit.com/${brandDomain}.com`,
      `https://logo.clearbit.com/www.${slug}.com`,
      
      // Google Favicon Service (reliable fallback)
      `https://www.google.com/s2/favicons?domain=${slug}.com&sz=256`,
      `https://www.google.com/s2/favicons?domain=${brandDomain}.com&sz=256`,
      
      // Logo.dev API
      `https://img.logo.dev/${slug}.com?size=400&format=png`,
      `https://img.logo.dev/${brandDomain}.com?size=400&format=png`,
      
      // Brandfetch API (free tier)
      `https://logo.brandfetch.io/${slug}.com`,
      `https://logo.brandfetch.io/${brandDomain}.com`,
      
      // Direct casino website attempts
      `https://${slug}.com/wp-content/uploads/logo.png`,
      `https://www.${slug}.com/assets/images/logo.png`,
      `https://${slug}.com/images/logo.png`,
      `https://${slug}.com/logo.png`,
      
      // High-quality favicons that can work as logos
      `https://${slug}.com/apple-touch-icon-180x180.png`,
      `https://${slug}.com/android-chrome-192x192.png`,
      `https://${slug}.com/favicon-196x196.png`
    ];
  }

  /**
   * Download and validate logo with timeout
   */
  async downloadLogo(logoUrl, timeout = 10000) {
    try {
      console.log(`    🔍 ${logoUrl.split('/')[2]}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(logoUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/*',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('image/')) {
        throw new Error(`Not image: ${contentType.split(';')[0]}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Quick validation
      if (buffer.length < 500) {
        throw new Error(`Too small: ${buffer.length}B`);
      }

      // Validate with Sharp
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image');
      }

      if (metadata.width < 50 || metadata.height < 25) {
        throw new Error(`Tiny: ${metadata.width}x${metadata.height}`);
      }

      const quality = this.assessLogoQuality(metadata, buffer.length);
      
      console.log(`    ✅ Found: ${metadata.width}x${metadata.height} (${Math.round(buffer.length/1024)}KB) - ${quality}`);
      
      return { buffer, metadata, quality, source: logoUrl };

    } catch (error) {
      console.log(`    ❌ ${error.message}`);
      return null;
    }
  }

  /**
   * Assess logo quality score
   */
  assessLogoQuality(metadata, fileSize) {
    let score = 0;
    
    // Size scoring
    if (metadata.width >= 200) score += 2;
    else if (metadata.width >= 100) score += 1;
    
    if (metadata.height >= 100) score += 2;
    else if (metadata.height >= 50) score += 1;
    
    // File size scoring
    if (fileSize >= 10000) score += 2; // 10KB+
    else if (fileSize >= 5000) score += 1; // 5KB+
    
    // Aspect ratio (logos are usually wider)
    const ratio = metadata.width / metadata.height;
    if (ratio >= 1.5 && ratio <= 4) score += 1;
    
    if (score >= 5) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Process logo with optimization
   */
  async processLogo(logoData, slug) {
    try {
      const { buffer, metadata } = logoData;
      const sharpImage = sharp(buffer);
      
      // Determine if we need background (for transparent PNGs)
      const hasAlpha = metadata.channels === 4 || metadata.hasAlpha;
      
      // Main PNG with white background (universal compatibility)
      const mainLogo = hasAlpha ? 
        await sharpImage.flatten({ background: { r: 255, g: 255, b: 255 } }).png({ quality: 95 }).toBuffer() :
        await sharpImage.png({ quality: 95 }).toBuffer();
      
      await fs.writeFile(path.join(LOGOS_DIR, `${slug}.png`), mainLogo);

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      
      for (const size of sizes) {
        const maxHeight = Math.round(size * 0.5);
        
        // PNG versions
        await sharpImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .png({ quality: 90 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP versions (better compression)
        await sharpImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .webp({ quality: 85 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF versions (next-gen)
        try {
          await sharpImage
            .clone()
            .resize(size, maxHeight, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .avif({ quality: 80 })
            .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.avif`));
        } catch (e) {
          // AVIF might not be available in all Sharp versions
        }
      }

      return true;
    } catch (error) {
      console.error(`    💥 Processing failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Fetch best logo for casino
   */
  async fetchBestLogo(casino) {
    console.log(`🎯 ${casino.brand} (${casino.slug})`);

    const urls = this.generateSmartUrls(casino.slug, casino.brand);
    let bestLogo = null;
    let bestScore = -1;

    // Try all URLs and pick the best one
    for (const url of urls) {
      const result = await this.downloadLogo(url);
      
      if (result) {
        const qualityScore = result.quality === 'HIGH' ? 3 : result.quality === 'MEDIUM' ? 2 : 1;
        const sizeScore = (result.metadata.width * result.metadata.height) / 10000;
        const totalScore = qualityScore + sizeScore;
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestLogo = result;
        }
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (bestLogo) {
      const processed = await this.processLogo(bestLogo, casino.slug);
      if (processed) {
        this.successCount++;
        this.results.push({
          brand: casino.brand,
          slug: casino.slug,
          source: bestLogo.source,
          quality: bestLogo.quality,
          size: `${bestLogo.metadata.width}x${bestLogo.metadata.height}`,
          success: true
        });
        console.log(`  ✅ SAVED (${bestLogo.quality} quality)\n`);
        return true;
      }
    }

    this.failCount++;
    this.results.push({
      brand: casino.brand,
      slug: casino.slug,
      success: false,
      reason: 'No suitable logo found'
    });
    console.log(`  ❌ No suitable logo found\n`);
    return false;
  }
}

/**
 * Main process
 */
async function smartFetchLogos() {
  console.log('🎰 Smart Casino Logo Fetcher 2025');
  console.log('================================\n');

  // Create directory
  await fs.mkdir(LOGOS_DIR, { recursive: true });

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    process.exit(1);
  }

  const fetcher = new SmartLogoFetcher();
  const startTime = Date.now();

  // Process first 20 casinos
  const casinosToProcess = casinos.slice(0, 20);
  console.log(`📊 Processing ${casinosToProcess.length} casinos...\n`);

  for (let i = 0; i < casinosToProcess.length; i++) {
    const casino = casinosToProcess[i];
    console.log(`[${i + 1}/${casinosToProcess.length}]`);
    
    await fetcher.fetchBestLogo(casino);
    
    // Respectful delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Final report
  const duration = Math.round((Date.now() - startTime) / 1000);
  const successRate = ((fetcher.successCount / casinosToProcess.length) * 100).toFixed(1);
  
  console.log('🏆 SMART LOGO FETCHING COMPLETE!');
  console.log('================================');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`✅ Success: ${fetcher.successCount}/${casinosToProcess.length} (${successRate}%)`);
  console.log(`❌ Failed: ${fetcher.failCount}`);

  if (fetcher.successCount > 0) {
    console.log('\n✅ Successfully downloaded logos:');
    fetcher.results
      .filter(r => r.success)
      .forEach(r => {
        const domain = new URL(r.source).hostname;
        console.log(`  • ${r.brand}: ${r.quality} quality from ${domain}`);
      });
    
    console.log('\n📁 Logos saved to: public/images/casinos/');
    console.log('🔧 Each logo includes responsive PNG, WebP, and AVIF versions');
    console.log('\n🚀 Next steps:');
    console.log('1. npm run build');
    console.log('2. docker build -t casino-smart-logos .');
    console.log('3. Your casino portal now has REAL professional logos!');
  }

  if (fetcher.failCount > 0) {
    console.log('\n⚠️  Note: Some logos could not be found');
    console.log('💡 This is normal - not all casinos have public logo APIs');
  }
}

if (require.main === module) {
  smartFetchLogos().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { smartFetchLogos };