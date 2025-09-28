#!/usr/bin/env node

/**
 * Real Casino Logo Fetcher - Google Images Search
 * Uses the exact search pattern you showed: "casino name + casino" in Google Images
 * API Key: AIzaSyCwVps974x7xrlSkA8_M9RcChSAdfdqUj4
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { customsearch_v1 } = require('@googleapis/customsearch');

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = 'c47726dab9258446c'; // Programmable Search Engine for casino logos

const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Google Images Search Client - mimicking your URL pattern
 */
class GoogleImagesSearcher {
  constructor(apiKey, searchEngineId) {
    this.customsearch = new customsearch_v1.Customsearch({ auth: apiKey });
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
  }

  /**
   * Search exactly like your Google URL: "casino name + casino"
   */
  async searchCasinoLogo(casinoBrand, casinoSlug) {
    // Use the exact query format from your URL
    const searchQuery = `${casinoBrand} casino`;
    
    console.log(`  🔍 Searching Google Images: "${searchQuery}"`);

    try {
      const response = await this.customsearch.cse.list({
        auth: this.apiKey,
        cx: this.searchEngineId,
        q: searchQuery,
        searchType: 'image',
        num: 10,
        imgSize: 'medium',
        safe: 'active',
        gl: 'us',
        hl: 'en'
      });

      const items = response.data.items || [];
      console.log(`    📸 Found ${items.length} images`);

      if (items.length > 0) {
        // Filter for likely logo images
        const logoImages = items.filter(item => {
          const title = (item.title || '').toLowerCase();
          const url = (item.link || '').toLowerCase();
          
          // Look for logo indicators
          return (
            title.includes('logo') ||
            title.includes(casinoBrand.toLowerCase()) ||
            url.includes('logo') ||
            url.includes(casinoSlug) ||
            item.image?.width >= 100 // Minimum size
          );
        });

        console.log(`    🎯 Filtered to ${logoImages.length} potential logos`);
        return logoImages.slice(0, 5); // Top 5 candidates
      }

    } catch (error) {
      if (error.message.includes('quotaExceeded')) {
        console.log(`    ⚠️  API quota exceeded`);
        throw new Error('QUOTA_EXCEEDED');
      } else if (error.message.includes('rateLimitExceeded')) {
        console.log(`    ⚠️  Rate limit exceeded, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return [];
      } else {
        console.log(`    ❌ Search failed: ${error.message}`);
      }
    }

    return [];
  }

  /**
   * Download and validate logo
   */
  async downloadLogo(imageUrl, casinoBrand) {
    try {
      console.log(`    ⬇️  Downloading: ${imageUrl.substring(0, 80)}...`);

      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site'
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Validate with Sharp
      const metadata = await sharp(buffer).metadata();
      
      // Quality checks for real logos
      if (metadata.width < 150 || metadata.height < 75) {
        throw new Error(`Logo too small: ${metadata.width}x${metadata.height} (need min 150x75)`);
      }

      if (buffer.length < 2000) {
        throw new Error(`File too small: ${buffer.length} bytes (likely not a real logo)`);
      }

      // Check aspect ratio (logos are usually wider than tall)
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < 0.5 || aspectRatio > 4) {
        throw new Error(`Unusual aspect ratio: ${aspectRatio.toFixed(2)} (might not be a logo)`);
      }

      console.log(`    ✅ Valid logo: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB, ratio: ${aspectRatio.toFixed(2)}`);
      return buffer;

    } catch (error) {
      console.log(`    ❌ Download failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Process and optimize the real logo
   */
  async processRealLogo(buffer, slug) {
    try {
      const sharpImage = sharp(buffer);
      
      // Main PNG fallback (high quality)
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
 * Main process - fetch REAL casino logos
 */
async function fetchRealCasinoLogosFromGoogle() {
  console.log('🎰 Real Casino Logo Fetcher - Google Images Search');
  console.log('Using your exact search pattern: "casino name + casino"');
  console.log('================================================\n');

  // Create logos directory
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

  // Initialize Google Images searcher
  const searcher = new GoogleImagesSearcher(GOOGLE_API_KEY, SEARCH_ENGINE_ID);
  
  const stats = {
    total: casinos.length,
    successful: 0,
    failed: 0,
    quotaExceeded: false,
    startTime: Date.now()
  };

  const results = {
    successful: [],
    failed: []
  };

  // Process each casino (limit to first 20 to respect API quota)
  const casinosToProcess = casinos.slice(0, 20); // Start with first 20 casinos
  console.log(`🎯 Processing first ${casinosToProcess.length} casinos to test the system...\n`);

  for (let i = 0; i < casinosToProcess.length; i++) {
    const casino = casinosToProcess[i];
    const progress = Math.round((i / casinosToProcess.length) * 100);
    
    console.log(`[${i + 1}/${casinosToProcess.length}] (${progress}%)`);
    console.log(`🎯 Processing: ${casino.brand} (${casino.slug})`);

    try {
      // Search for real logo using Google Images
      const logoResults = await searcher.searchCasinoLogo(casino.brand, casino.slug);
      
      if (logoResults.length === 0) {
        console.log(`  ❌ No logo found for ${casino.brand}`);
        stats.failed++;
        results.failed.push({
          brand: casino.brand,
          slug: casino.slug,
          reason: 'No suitable images found'
        });
        continue;
      }

      // Try to download and process the best logo
      let success = false;
      for (const logoResult of logoResults) {
        const buffer = await searcher.downloadLogo(logoResult.link, casino.brand);
        if (!buffer) continue;

        const processed = await searcher.processRealLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed REAL logo for ${casino.brand}`);
          stats.successful++;
          results.successful.push({
            brand: casino.brand,
            slug: casino.slug,
            source: logoResult.link,
            title: logoResult.title,
            dimensions: `${logoResult.image?.width}x${logoResult.image?.height}`
          });
          success = true;
          break;
        }
      }

      if (!success) {
        console.log(`  ❌ Failed to process suitable logo for ${casino.brand}`);
        stats.failed++;
        results.failed.push({
          brand: casino.brand,
          slug: casino.slug,
          reason: 'No processable logos found'
        });
      }

    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log('\n⚠️  Google API quota exceeded!');
        stats.quotaExceeded = true;
        break;
      }
      
      console.error(`  💥 Error: ${error.message}`);
      stats.failed++;
      results.failed.push({
        brand: casino.brand,
        slug: casino.slug,
        reason: error.message
      });
    }

    // Rate limiting - respect Google's limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('');
  }

  // Final report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('🏆 REAL LOGO FETCHING COMPLETE!');
  console.log('===============================');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 Processed: ${casinosToProcess.length}/${casinos.length} casinos`);
  console.log(`✅ Success: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success Rate: ${stats.successful > 0 ? ((stats.successful / casinosToProcess.length) * 100).toFixed(1) : 0}%`);

  if (stats.quotaExceeded) {
    console.log('\n⚠️  Google API quota exceeded during processing');
    console.log('💡 Upgrade to paid tier for unlimited searches');
  }

  if (stats.successful > 0) {
    console.log('\n📁 REAL casino logos saved to: public/images/casinos/');
    console.log('🔧 Each logo includes:');
    console.log('  • PNG fallback (400x200 max)');
    console.log('  • WebP versions (400w, 800w, 1200w)');
    console.log('  • AVIF versions (400w, 800w, 1200w)');
    console.log('  • Total: 10 optimized files per successful logo');
    
    console.log('\n🚀 Next steps:');
    console.log('1. npm run build');
    console.log('2. docker build -t casino-with-actual-logos .');
    console.log('3. Check your casino portal with REAL logos!');
  }

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed casinos:');
    results.failed.slice(0, 5).forEach(item => {
      console.log(`  • ${item.brand}: ${item.reason}`);
    });
  }

  console.log('\n💡 API Usage Summary:');
  console.log(`  • Estimated queries used: ${stats.successful + stats.failed}`);
  console.log('  • Free tier: 100 queries/day');
  console.log('  • This search used Google Images exactly like your example!');
}

if (require.main === module) {
  fetchRealCasinoLogosFromGoogle().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { fetchRealCasinoLogosFromGoogle };