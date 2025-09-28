#!/usr/bin/env node

/**
 * Alternative Logo Fetcher using Google Images directly
 * Since Custom Search Engine setup is complex, this uses direct Google Images search
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

/**
 * Alternative Google Images Searcher using SerpAPI or direct methods
 */
class DirectLogoFetcher {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Search using Google Images with direct approach
   */
  async searchGoogleImages(casinoName, casinoSlug) {
    const queries = [
      `${casinoName} casino logo png`,
      `${casinoName} online casino logo`,
      `${casinoSlug} casino brand logo`,
      `${casinoName} casino official logo`
    ];

    const imageUrls = [];

    for (const query of queries) {
      try {
        console.log(`  🔍 Searching: "${query}"`);
        
        // Method 1: Use Bing Image Search (often more accessible)
        const bingResults = await this.searchBingImages(query);
        if (bingResults.length > 0) {
          imageUrls.push(...bingResults);
          break;
        }

        // Method 2: Try common casino logo patterns
        const commonUrls = this.generateCommonLogoUrls(casinoName, casinoSlug);
        imageUrls.push(...commonUrls);

      } catch (error) {
        console.log(`    ❌ Search failed: ${error.message}`);
      }
    }

    return imageUrls;
  }

  /**
   * Search Bing Images (alternative to Google)
   */
  async searchBingImages(query) {
    try {
      const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&tsc=ImageBasicHover`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Extract image URLs from Bing results
      const imageUrlRegex = /mediaurl":"([^"]+)"/g;
      const matches = [];
      let match;
      
      while ((match = imageUrlRegex.exec(html)) !== null && matches.length < 5) {
        const imageUrl = decodeURIComponent(match[1]);
        if (this.isValidImageUrl(imageUrl)) {
          matches.push(imageUrl);
        }
      }

      console.log(`    📸 Found ${matches.length} Bing results`);
      return matches;

    } catch (error) {
      console.log(`    ❌ Bing search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate common casino logo URL patterns
   */
  generateCommonLogoUrls(casinoName, casinoSlug) {
    const domains = [
      `${casinoSlug}.com`,
      `${casinoSlug}.co`,
      `${casinoSlug}.net`,
      `www.${casinoSlug}.com`
    ];

    const paths = [
      '/logo.png',
      '/images/logo.png',
      '/assets/logo.png',
      '/static/logo.png',
      '/img/logo.png',
      '/media/logo.png',
      `/images/${casinoSlug}-logo.png`,
      `/assets/${casinoSlug}.png`
    ];

    const urls = [];
    for (const domain of domains) {
      for (const logoPath of paths) {
        urls.push(`https://${domain}${logoPath}`);
      }
    }

    return urls.slice(0, 10); // Limit to first 10 attempts
  }

  /**
   * Check if URL looks like a valid image
   */
  isValidImageUrl(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    return imageExtensions.test(url) && 
           url.startsWith('http') && 
           !url.includes('favicon') &&
           !url.includes('icon');
  }

  /**
   * Download and validate logo image
   */
  async downloadLogo(imageUrl, casinoName) {
    try {
      console.log(`    ⬇️  Trying: ${imageUrl.substring(0, 60)}...`);
      
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.google.com/'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Validate with Sharp
      const metadata = await sharp(buffer).metadata();
      
      if (metadata.width < 80 || metadata.height < 40) {
        throw new Error(`Image too small: ${metadata.width}x${metadata.height}`);
      }

      console.log(`    ✅ Downloaded: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      return buffer;

    } catch (error) {
      console.log(`    ❌ Download failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Process logo with Sharp
   */
  async processLogo(buffer, slug) {
    try {
      const baseImage = sharp(buffer);
      
      // Main PNG fallback
      await baseImage
        .clone()
        .resize(400, 200, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      
      for (const size of sizes) {
        const maxHeight = Math.round(size * 0.5);
        
        // PNG
        await baseImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP
        await baseImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: 85 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF
        await baseImage
          .clone()
          .resize(size, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .avif({ quality: 80 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.avif`));
      }

      return true;
    } catch (error) {
      console.error(`❌ Processing failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Main fetching process
 */
async function fetchRealLogosNow() {
  console.log('🎰 Real Casino Logo Fetcher - Direct Method');
  console.log('===========================================\n');

  // Create directory
  await fs.mkdir(LOGOS_DIR, { recursive: true });

  // Load casinos
  const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
  const casinos = JSON.parse(casinosData);
  console.log(`📊 Processing ${casinos.length} partner casinos\n`);

  const fetcher = new DirectLogoFetcher();
  let successful = 0;
  let failed = 0;

  // Process each casino
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    const progress = Math.round((i / casinos.length) * 100);
    
    console.log(`[${i + 1}/${casinos.length}] (${progress}%) ${casino.name}`);

    try {
      // Search for logo URLs
      const imageUrls = await fetcher.searchGoogleImages(casino.name, casino.slug);
      
      if (imageUrls.length === 0) {
        console.log(`  ❌ No images found for ${casino.name}`);
        failed++;
        continue;
      }

      // Try to download and process
      let success = false;
      for (const imageUrl of imageUrls.slice(0, 5)) {
        const buffer = await fetcher.downloadLogo(imageUrl, casino.name);
        if (!buffer) continue;

        const processed = await fetcher.processLogo(buffer, casino.slug);
        if (processed) {
          console.log(`  ✅ Successfully processed ${casino.name} logo`);
          successful++;
          success = true;
          break;
        }
      }

      if (!success) {
        console.log(`  ❌ Failed to process any logo for ${casino.name}`);
        failed++;
      }

    } catch (error) {
      console.error(`  💥 Error: ${error.message}`);
      failed++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');
  }

  // Report
  console.log('🏆 Logo Fetching Complete!');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / casinos.length) * 100).toFixed(1)}%`);
  
  if (successful > 0) {
    console.log('\n🚀 Next steps:');
    console.log('1. npm run build');
    console.log('2. docker build -t casino-with-real-logos .');
    console.log('3. Check your site with real casino logos!');
  }
}

if (require.main === module) {
  fetchRealLogosNow().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}