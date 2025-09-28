#!/usr/bin/env node

/**
 * AskGamblers Real Logo Scraper 2025
 * Based on actual page structure analysis
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');
const PROGRESS_FILE = path.join(__dirname, '..', 'logs', 'askgamblers-real-progress.json');

class RealAskGamblersLogoScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.processedCasinos = new Set();
    this.logoMapping = [];
    this.stats = {
      pagesProcessed: 0,
      casinosFound: 0,
      logosDownloaded: 0,
      logosFailed: 0,
      startTime: Date.now()
    };
  }

  async initialize() {
    console.log('🎰 Real AskGamblers Logo Scraper 2025');
    console.log('====================================\n');

    await fs.mkdir(LOGOS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(PROGRESS_FILE), { recursive: true });

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500, // Slower for reliability
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();
    console.log('✅ Browser initialized successfully\n');
  }

  async navigateToPage(pageNum) {
    const baseUrl = 'https://www.askgamblers.com/online-casinos/reviews';
    const url = pageNum === 1 ? baseUrl : `${baseUrl}/${pageNum}`;
    
    console.log(`🔍 Navigating to page ${pageNum}: ${url}`);

    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Wait for images to load
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Additional wait for lazy loading
      await this.page.waitForTimeout(3000);

      return true;
    } catch (error) {
      console.error(`❌ Failed to load page ${pageNum}: ${error.message}`);
      return false;
    }
  }

  async extractCasinosFromPage() {
    console.log('  📋 Extracting casino data from page...');

    try {
      const casinos = await this.page.evaluate(() => {
        const casinoData = [];
        
        // Find all images that look like casino logos
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
          const altText = img.alt || '';
          const src = img.src || '';
          
          // Filter for casino-related images
          if (altText.toLowerCase().includes('casino') || 
              altText.toLowerCase().includes('slots') ||
              altText.toLowerCase().includes('bet') ||
              src.includes('casino') ||
              (altText.length > 0 && altText.length < 50 && !altText.toLowerCase().includes('image'))) {
            
            // Skip obvious non-casino images
            if (altText.toLowerCase().includes('news') ||
                altText.toLowerCase().includes('article') ||
                src.includes('news_image') ||
                src.includes('placeholder')) {
              return;
            }

            // Clean up casino name
            let casinoName = altText.trim();
            if (casinoName) {
              // Remove common suffixes
              casinoName = casinoName
                .replace(/\s+casino$/i, '')
                .replace(/\s+slots$/i, '')
                .replace(/\s+bet$/i, '')
                .trim();

              // Generate slug
              const slug = casinoName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '');

              if (slug && src && !src.includes('placeholder') && !src.includes('lazy-l')) {
                casinoData.push({
                  name: casinoName,
                  slug: slug,
                  logoUrl: src.startsWith('/') ? `https://www.askgamblers.com${src}` : src,
                  altText: altText,
                  pageIndex: index
                });
              }
            }
          }
        });

        // Also look for casino links that might contain names
        const links = document.querySelectorAll('a[href*="casino"], a[href*="review"]');
        links.forEach(link => {
          const linkText = link.textContent.trim();
          const href = link.href;
          
          if (linkText && linkText.length < 50 && linkText.length > 3) {
            // Look for associated images
            const img = link.querySelector('img') || 
                       link.parentElement.querySelector('img') ||
                       link.nextElementSibling?.querySelector('img');
            
            if (img && img.src && !img.src.includes('placeholder')) {
              const casinoName = linkText
                .replace(/\s+casino$/i, '')
                .replace(/\s+review$/i, '')
                .replace(/\s+bonus$/i, '')
                .trim();

              const slug = casinoName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '');

              if (slug) {
                casinoData.push({
                  name: casinoName,
                  slug: slug,
                  logoUrl: img.src.startsWith('/') ? `https://www.askgamblers.com${img.src}` : img.src,
                  altText: img.alt || casinoName,
                  source: 'link',
                  pageIndex: casinoData.length
                });
              }
            }
          }
        });

        // Remove duplicates based on slug
        const uniqueCasinos = [];
        const seenSlugs = new Set();
        
        casinoData.forEach(casino => {
          if (!seenSlugs.has(casino.slug) && casino.slug) {
            seenSlugs.add(casino.slug);
            uniqueCasinos.push(casino);
          }
        });

        return uniqueCasinos;
      });

      console.log(`  ✅ Found ${casinos.length} unique casinos on this page`);
      
      // Log first few casinos for verification
      casinos.slice(0, 3).forEach(casino => {
        console.log(`    • ${casino.name} (${casino.slug}) - ${casino.logoUrl.substring(0, 50)}...`);
      });
      
      return casinos;

    } catch (error) {
      console.error(`  ❌ Failed to extract casinos: ${error.message}`);
      return [];
    }
  }

  async downloadLogo(casino) {
    if (this.processedCasinos.has(casino.slug)) {
      console.log(`    ⏭️  ${casino.name} already processed`);
      return true;
    }

    console.log(`    🔍 Downloading: ${casino.name}`);

    try {
      // Fetch the logo
      const response = await fetch(casino.logoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.askgamblers.com/'
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('image/')) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Basic size check
      if (buffer.length < 500) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      // Validate with Sharp
      let metadata;
      try {
        metadata = await sharp(buffer).metadata();
      } catch (e) {
        throw new Error(`Invalid image format: ${e.message}`);
      }
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }

      if (metadata.width < 30 || metadata.height < 20) {
        throw new Error(`Too small: ${metadata.width}x${metadata.height}`);
      }

      // Process and save the logo
      const success = await this.processLogo(buffer, casino.slug, metadata);
      
      if (success) {
        this.processedCasinos.add(casino.slug);
        this.logoMapping.push({
          name: casino.name,
          slug: casino.slug,
          originalUrl: casino.logoUrl,
          altText: casino.altText,
          size: `${metadata.width}x${metadata.height}`,
          fileSize: buffer.length,
          processedAt: new Date().toISOString()
        });

        this.stats.logosDownloaded++;
        console.log(`    ✅ ${casino.name}: ${metadata.width}x${metadata.height} (${Math.round(buffer.length/1024)}KB)`);
        return true;
      } else {
        throw new Error('Failed to process with Sharp');
      }

    } catch (error) {
      console.log(`    ❌ ${casino.name}: ${error.message}`);
      this.stats.logosFailed++;
      return false;
    }
  }

  async processLogo(buffer, slug, metadata) {
    try {
      const sharpImage = sharp(buffer);
      
      // Main PNG with white background for compatibility
      await sharpImage
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png({ quality: 95 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      
      for (const size of sizes) {
        const maxHeight = Math.round(size * 0.5);
        
        // PNG
        await sharpImage
          .clone()
          .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 90 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP
        await sharpImage
          .clone()
          .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF (if supported)
        try {
          await sharpImage
            .clone()
            .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: 80 })
            .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.avif`));
        } catch (e) {
          // AVIF not supported
        }
      }

      return true;
    } catch (error) {
      console.error(`    💥 Processing failed for ${slug}: ${error.message}`);
      return false;
    }
  }

  async processPage(pageNum) {
    console.log(`\n[Page ${pageNum}/93] - Processing...`);
    
    const success = await this.navigateToPage(pageNum);
    if (!success) {
      return false;
    }

    const casinos = await this.extractCasinosFromPage();
    this.stats.casinosFound += casinos.length;

    if (casinos.length === 0) {
      console.log('  ⚠️  No casinos found on this page');
      return true; // Continue to next page
    }

    // Download logos
    console.log(`  🔄 Processing ${casinos.length} logos...`);
    
    for (const casino of casinos) {
      await this.downloadLogo(casino);
      await new Promise(resolve => setTimeout(resolve, 800)); // Be respectful
    }

    this.stats.pagesProcessed = pageNum;
    console.log(`  ✅ Page ${pageNum} completed`);
    
    // Save progress
    await this.saveProgress();
    
    // Longer delay between pages
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }

  async saveProgress() {
    const progress = {
      processedCasinos: Array.from(this.processedCasinos),
      logoMapping: this.logoMapping,
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
    
    try {
      await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch (e) {
      console.error('⚠️  Failed to save progress:', e.message);
    }
  }

  async scrapePages(startPage = 1, endPage = 20) { // Start with first 20 pages
    console.log(`🚀 Scraping pages ${startPage} to ${endPage}...\n`);

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      try {
        const success = await this.processPage(pageNum);
        
        if (!success) {
          console.log(`⚠️  Skipping page ${pageNum} due to errors`);
        }
        
        // Progress update every 5 pages
        if (pageNum % 5 === 0) {
          this.printProgress();
        }
        
      } catch (error) {
        console.error(`💥 Error on page ${pageNum}: ${error.message}`);
        await this.saveProgress();
      }
    }

    await this.generateReport();
  }

  printProgress() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    console.log(`\n📊 Progress: ${this.stats.pagesProcessed} pages, ${this.stats.logosDownloaded} logos downloaded, ${duration}s elapsed\n`);
  }

  async generateReport() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    
    console.log('\n🏆 SCRAPING COMPLETE!');
    console.log('====================');
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📄 Pages: ${this.stats.pagesProcessed}`);
    console.log(`🎰 Casinos found: ${this.stats.casinosFound}`);
    console.log(`✅ Logos downloaded: ${this.stats.logosDownloaded}`);
    console.log(`❌ Failed: ${this.stats.logosFailed}`);

    if (this.stats.logosDownloaded > 0) {
      // Save mapping file
      await fs.writeFile(
        path.join(__dirname, '..', 'data', 'askgamblers-logos.json'),
        JSON.stringify(this.logoMapping, null, 2)
      );
      
      console.log('\n📁 Logos saved to: public/images/casinos/');
      console.log('📄 Mapping saved to: data/askgamblers-logos.json');
      console.log('\n🚀 Ready to build and deploy!');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

async function main() {
  const scraper = new RealAskGamblersLogoScraper();
  
  try {
    await scraper.initialize();
    await scraper.scrapePages(1, 20); // Start with first 20 pages
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  } finally {
    await scraper.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { RealAskGamblersLogoScraper };