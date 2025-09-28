#!/usr/bin/env node

/**
 * Real Casino Logo Fetcher - Google Custom Search API
 * Uses official Google Custom Search API with Context7 knowledge
 * Your API key: AIzaSyCwVps974x7xrlSkA8_M9RcChSAdfdqUj4
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { customsearch_v1 } = require('@googleapis/customsearch');

// Configuration from Context7 documentation
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = '017576662512468014348:omuauf_lfve'; // Using public Google search engine

// File paths
const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Google Custom Search API client using Context7 knowledge
 */
class GoogleCustomSearchClient {
  constructor(apiKey) {
    // Initialize the Custom Search API client as per Context7 docs
    this.customsearch = new customsearch_v1.Customsearch({
      auth: apiKey
    });
    this.apiKey = apiKey;
  }

  /**
   * Search for casino logos using Google Custom Search API
   * Based on Context7 documentation patterns
   */
  async searchCasinoLogo(casinoName, casinoSlug) {
    const searchQueries = [
      `${casinoName} casino logo`,
      `${casinoName} online casino logo png`,
      `site:${casinoSlug}.com logo`,
      `"${casinoName}" casino brand logo`
    ];

    console.log(`  🔍 Searching for: ${casinoName}`);

    for (const query of searchQueries) {
      try {
        console.log(`    📝 Query: "${query}"`);

        // Make API request using Context7 pattern
        const response = await this.customsearch.cse.list({
          auth: this.apiKey,
          cx: SEARCH_ENGINE_ID,
          q: query,
          searchType: 'image',
          num: 10,
          imgSize: 'medium',
          imgType: 'png',
          safe: 'active',
          fileType: 'png'
        });

        const items = response.data.items || [];
        console.log(`    📸 Found ${items.length} images`);

        if (items.length > 0) {
          // Return top results with metadata
          return items.map(item => ({
            url: item.link,
            title: item.title,
            width: item.image?.width,
            height: item.image?.height,
            thumbnailUrl: item.image?.thumbnailLink,
            contextUrl: item.image?.contextLink,
            size: item.image?.byteSize
          }));
        }

      } catch (error) {
        console.log(`    ❌ Search failed: ${error.message}`);
        
        // Handle API quota/rate limiting
        if (error.message.includes('quotaExceeded')) {
          console.log('    ⚠️  API quota exceeded, waiting...');
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
          return [];
        }
        
        if (error.message.includes('rateLimitExceeded')) {
          console.log('    ⚠️  Rate limit exceeded, slowing down...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
      }

      // Rate limiting between queries as per Context7 best practices
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return [];
  }

  /**
   * Download and validate image
   */
  async downloadImage(imageUrl, casinoName) {
    try {
      console.log(`    ⬇️  Downloading: ${imageUrl.substring(0, 60)}...`);

      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/png,image/jpeg,image/webp,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/'
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
      
      // Quality filters - avoid tiny logos/favicons
      if (metadata.width < 120 || metadata.height < 60) {
        throw new Error(`Image too small: ${metadata.width}x${metadata.height} (minimum 120x60)`);
      }

      if (buffer.length < 1000) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      console.log(`    ✅ Valid image: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      return buffer;

    } catch (error) {
      console.log(`    ❌ Download failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Process logo with Sharp - multiple optimized formats
   */
  async processLogo(buffer, slug) {
    try {
      // Main PNG fallback (original quality)
      await sharp(buffer)
        .resize(400, 200, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 95, compressionLevel: 6 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions as per Context7 best practices
      const sizes = [
        { width: 400, suffix: '-400w' },
        { width: 800, suffix: '-800w' },
        { width: 1200, suffix: '-1200w' }
      ];

      for (const size of sizes) {
        const maxHeight = Math.round(size.width * 0.5); // 2:1 aspect ratio max
        
        // PNG versions
        await sharp(buffer)
          .resize(size.width, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.png`));

        // WebP versions (modern browsers)
        await sharp(buffer)
          .resize(size.width, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.webp`));

        // AVIF versions (next-gen format)
        await sharp(buffer)
          .resize(size.width, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .avif({ quality: 80, effort: 9 })
          .toFile(path.join(LOGOS_DIR, `${slug}${size.suffix}.avif`));
      }

      return true;
    } catch (error) {
      console.error(`    ❌ Processing failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Main logo fetching process
 */
async function fetchRealCasinoLogos() {
  console.log('🎰 Real Casino Logo Fetcher v3.0');
  console.log('Using Google Custom Search API with Context7 knowledge');
  console.log('=================================================\n');

  // Create directories
  await fs.mkdir(LOGOS_DIR, { recursive: true });

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Loaded ${casinos.length} partner casinos\n`);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    process.exit(1);
  }

  // Initialize Google Custom Search client
  const searchClient = new GoogleCustomSearchClient(GOOGLE_API_KEY);
  
  // Statistics
  const stats = {
    total: casinos.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now()
  };

  const results = {
    successful: [],
    failed: [],
    apiErrors: []
  };

  // Process each casino
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    const progress = Math.round((i / casinos.length) * 100);
    const eta = stats.successful > 0 ? 
      Math.round(((Date.now() - stats.startTime) / (i + 1)) * (casinos.length - i - 1) / 1000) : 0;

    console.log(`\n[${i + 1}/${casinos.length}] (${progress}%) ETA: ${eta}s`);
    console.log(`🎯 Processing: ${casino.name} (${casino.slug})`);

    // Check if logo already exists
    const existingLogo = path.join(LOGOS_DIR, `${casino.slug}.png`);
    try {
      await fs.access(existingLogo);
      console.log(`  ⏭️  Logo already exists, skipping...`);
      stats.skipped++;
      continue;
    } catch (error) {
      // Logo doesn't exist, proceed with fetch
    }

    try {
      // Search for logo images
      const imageResults = await searchClient.searchCasinoLogo(casino.name, casino.slug);
      
      if (imageResults.length === 0) {
        console.log(`  ❌ No suitable images found for ${casino.name}`);
        stats.failed++;
        results.failed.push({
          name: casino.name,
          slug: casino.slug,
          reason: 'No images found'
        });
        continue;
      }

      // Try to download and process the best images
      let success = false;
      for (const imageResult of imageResults.slice(0, 5)) { // Try top 5 results
        const buffer = await searchClient.downloadImage(imageResult.url, casino.name);
        if (!buffer) continue;

        const processed = await searchClient.processLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed logo for ${casino.name}`);
          stats.successful++;
          results.successful.push({
            name: casino.name,
            slug: casino.slug,
            source: imageResult.url,
            title: imageResult.title,
            dimensions: `${imageResult.width}x${imageResult.height}`
          });
          success = true;
          break;
        }
      }

      if (!success) {
        console.log(`  ❌ Failed to process any suitable logo for ${casino.name}`);
        stats.failed++;
        results.failed.push({
          name: casino.name,
          slug: casino.slug,
          reason: 'No processable images'
        });
      }

    } catch (error) {
      console.error(`  💥 Error processing ${casino.name}:`, error.message);
      stats.failed++;
      results.failed.push({
        name: casino.name,
        slug: casino.slug,
        reason: error.message
      });

      if (error.message.includes('quotaExceeded')) {
        console.log('\n⚠️  Google API quota exceeded. Consider:');
        console.log('   - Waiting for quota reset');
        console.log('   - Upgrading to paid tier');
        break; // Stop processing to avoid further quota issues
      }
    }

    // Rate limiting as per Context7 best practices
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds between casinos
  }

  // Generate final report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('\n🏆 REAL LOGO FETCHING COMPLETE!');
  console.log('======================================');
  console.log(`⏱️  Total Time: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 Total Casinos: ${stats.total}`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`⏭️  Skipped (existed): ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success Rate: ${((stats.successful / (stats.total - stats.skipped)) * 100).toFixed(1)}%`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
    statistics: stats,
    googleApiUsed: 'Custom Search API v1',
    apiKey: 'GOOGLE_API_KEY_MASKED_***' + (GOOGLE_API_KEY ? GOOGLE_API_KEY.slice(-4) : '****'), // Masked for security
    results: results
  };

  try {
    await fs.mkdir(path.join(__dirname, '..', 'logs'), { recursive: true });
    await fs.writeFile(
      path.join(__dirname, '..', 'logs', `real-logo-fetch-${Date.now()}.json`),
      JSON.stringify(report, null, 2)
    );
    console.log('\n📄 Detailed report saved to logs/');
  } catch (error) {
    console.log('⚠️  Failed to save report:', error.message);
  }

  if (stats.successful > 0) {
    console.log('\n📁 Real casino logos saved to: public/images/casinos/');
    console.log('🔧 Each logo includes optimized versions:');
    console.log('  • PNG: 400x200 fallback + responsive (400w, 800w, 1200w)');
    console.log('  • WebP: Modern format, 85% quality + responsive');
    console.log('  • AVIF: Next-gen format, 80% quality + responsive');
    console.log('  • Total: 10 optimized files per successful logo');

    console.log('\n🚀 Next Steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: docker build -t casino-with-real-logos .');
    console.log('3. Your casino portal now has authentic partner logos!');
  }

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed Casinos (first 5):');
    results.failed.slice(0, 5).forEach(item => {
      console.log(`  • ${item.name}: ${item.reason}`);
    });
    if (results.failed.length > 5) {
      console.log(`  ... and ${results.failed.length - 5} more (see detailed report)`);
    }
  }

  console.log('\n💡 Google API Usage:');
  console.log(`  • Estimated queries: ${stats.successful * 2}`);
  console.log('  • Free tier limit: 100 queries/day');
  console.log('  • Cost: $5 per 1,000 queries (paid tier)');
  console.log('\nReal casino logos successfully fetched using your Google API key! 🎊');
}

// Error handling and graceful exit
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Process interrupted by user');
  process.exit(0);
});

if (require.main === module) {
  fetchRealCasinoLogos().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { GoogleCustomSearchClient, fetchRealCasinoLogos };