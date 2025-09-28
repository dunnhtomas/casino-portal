#!/usr/bin/env node

/**
 * Google Cloud Custom Search API Logo Fetcher
 * Fetches real casino logos using Google's Custom Search API
 * For partner casinos that are paying to be featured
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Configuration - You'll need to set these environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Casino data
const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Google Custom Search API client
 */
class GoogleLogoSearcher {
  constructor(apiKey, searchEngineId) {
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
  }

  /**
   * Search for casino logos using Google Custom Search
   */
  async searchLogo(casinoName, casinoSlug) {
    const query = `${casinoName} casino logo site:${casinoName.toLowerCase().replace(/\s+/g, '')}.com OR site:${casinoSlug}.com`;
    
    const params = new URLSearchParams({
      key: this.apiKey,
      cx: this.searchEngineId,
      q: query,
      searchType: 'image',
      imgSize: 'medium',
      imgType: 'png',
      safe: 'active',
      num: '5' // Get top 5 results to choose best one
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(`Google API Error: ${data.error.message}`);
      }

      return data.items || [];
    } catch (error) {
      console.error(`❌ Search failed for ${casinoName}:`, error.message);
      return [];
    }
  }

  /**
   * Download and validate logo image
   */
  async downloadLogo(imageUrl, casinoName) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Validate image and get metadata
      const metadata = await sharp(buffer).metadata();
      
      // Check minimum size requirements (avoid tiny favicons)
      if (metadata.width < 100 || metadata.height < 50) {
        throw new Error(`Image too small: ${metadata.width}x${metadata.height}`);
      }

      console.log(`✅ Downloaded ${casinoName} logo: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      return buffer;

    } catch (error) {
      console.error(`❌ Download failed for ${casinoName}:`, error.message);
      return null;
    }
  }

  /**
   * Process and optimize logo for web use
   */
  async processLogo(buffer, slug) {
    const logoPath = path.join(LOGOS_DIR, `${slug}.png`);
    
    try {
      // Create optimized versions
      const sharpImage = sharp(buffer);
      
      // Main PNG version (fallback)
      await sharpImage
        .resize(400, 200, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(logoPath);

      // Responsive versions
      const sizes = [
        { width: 400, suffix: '-400w' },
        { width: 800, suffix: '-800w' },
        { width: 1200, suffix: '-1200w' }
      ];

      for (const size of sizes) {
        // PNG versions
        await sharp(buffer)
          .resize(size.width, size.width * 0.5, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.png`));

        // WebP versions
        await sharp(buffer)
          .resize(size.width, size.width * 0.5, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.webp`));

        // AVIF versions
        await sharp(buffer)
          .resize(size.width, size.width * 0.5, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .avif({ quality: 80, effort: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.avif`));
      }

      return true;
    } catch (error) {
      console.error(`❌ Processing failed for ${slug}:`, error.message);
      return false;
    }
  }
}

/**
 * Main logo fetching process
 */
async function fetchRealLogos() {
  console.log('🚀 Starting Google Cloud Custom Search logo fetching...\n');

  // Validate API credentials
  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    console.error('❌ Missing Google API credentials!');
    console.log('Please set environment variables:');
    console.log('  - GOOGLE_API_KEY: Your Google Cloud API key');
    console.log('  - GOOGLE_SEARCH_ENGINE_ID: Your Custom Search Engine ID');
    console.log('\nGet these from: https://console.cloud.google.com/');
    process.exit(1);
  }

  // Create logos directory
  try {
    await fs.mkdir(LOGOS_DIR, { recursive: true });
  } catch (error) {
    console.error('❌ Failed to create logos directory:', error.message);
    process.exit(1);
  }

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Loaded ${casinos.length} casinos from data file\n`);
  } catch (error) {
    console.error('❌ Failed to load casinos data:', error.message);
    process.exit(1);
  }

  const searcher = new GoogleLogoSearcher(GOOGLE_API_KEY, SEARCH_ENGINE_ID);
  
  let successCount = 0;
  let failCount = 0;

  // Process each casino
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    const progress = `[${i + 1}/${casinos.length}]`;
    
    console.log(`${progress} Processing: ${casino.name} (${casino.slug})`);

    try {
      // Search for logo images
      const images = await searcher.searchLogo(casino.name, casino.slug);
      
      if (images.length === 0) {
        console.log(`  ⚠️  No images found for ${casino.name}`);
        failCount++;
        continue;
      }

      // Try each image until we get one that works
      let success = false;
      for (const image of images.slice(0, 3)) { // Try top 3 results
        console.log(`  🔍 Trying: ${image.link}`);
        
        const buffer = await searcher.downloadLogo(image.link, casino.name);
        if (!buffer) continue;

        const processed = await searcher.processLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed logo for ${casino.name}`);
          successCount++;
          success = true;
          break;
        }
      }

      if (!success) {
        console.log(`  ❌ Failed to process any logo for ${casino.name}`);
        failCount++;
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${casino.name}:`, error.message);
      failCount++;
    }

    // Rate limiting - respect Google API limits
    if (i < casinos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 10 requests per second max
    }

    console.log(''); // Empty line for readability
  }

  // Final report
  console.log('\n🎯 Logo Fetching Complete!');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${casinos.length}`);
  console.log(`📈 Success Rate: ${((successCount / casinos.length) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n📁 Logo files saved to: public/images/casinos/');
    console.log('🔧 Each casino has multiple optimized formats:');
    console.log('  - PNG: Original quality fallback');
    console.log('  - WebP: Modern compressed format');
    console.log('  - AVIF: Next-gen ultra-compressed format');
    console.log('  - 3 sizes: 400w, 800w, 1200w for responsive design');
  }
}

// Run if called directly
if (require.main === module) {
  fetchRealLogos().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { GoogleLogoSearcher, fetchRealLogos };