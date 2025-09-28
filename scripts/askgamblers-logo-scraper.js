#!/usr/bin/env node

/**
 * AskGamblers Logo Scraper 2025 - Smart & Fast
 * Scrapes casino logos from all 93 pages of AskGamblers reviews
 * Using Playwright browser automation + Smart downloading
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');
const PROGRESS_FILE = path.join(__dirname, '..', 'logs', 'askgamblers-progress.json');

/**
 * Smart AskGamblers Logo Scraper
 */
class AskGamblersLogoScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.processedCasinos = new Map();
    this.failedDownloads = [];
    this.stats = {
      pagesProcessed: 0,
      casinosFound: 0,
      logosDownloaded: 0,
      logosFailed: 0,
      startTime: Date.now()
    };
  }

  /**
   * Initialize browser and page
   */
  async initialize() {
    console.log('🎰 AskGamblers Logo Scraper 2025 - Smart & Fast');
    console.log('==================================================\n');

    // Create directories
    await fs.mkdir(LOGOS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(PROGRESS_FILE), { recursive: true });

    // Launch browser with stealth settings
    this.browser = await chromium.launch({
      headless: false, // Set to true for production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();

    // Load previous progress if exists
    await this.loadProgress();

    console.log('✅ Browser initialized successfully\n');
  }

  /**
   * Load previous progress to resume scraping
   */
  async loadProgress() {
    try {
      const progressData = await fs.readFile(PROGRESS_FILE, 'utf8');
      const progress = JSON.parse(progressData);
      this.processedCasinos = new Map(progress.processedCasinos || []);
      this.stats.pagesProcessed = progress.pagesProcessed || 0;
      console.log(`📊 Resuming from page ${this.stats.pagesProcessed + 1}, ${this.processedCasinos.size} casinos already processed`);
    } catch (error) {
      console.log('📊 Starting fresh scraping session');
    }
  }

  /**
   * Save progress for resumable scraping
   */
  async saveProgress() {
    const progress = {
      processedCasinos: Array.from(this.processedCasinos.entries()),
      pagesProcessed: this.stats.pagesProcessed,
      timestamp: new Date().toISOString()
    };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  /**
   * Navigate to a specific AskGamblers page
   */
  async navigateToPage(pageNum) {
    const baseUrl = 'https://www.askgamblers.com/online-casinos/reviews';
    const url = pageNum === 1 ? baseUrl : `${baseUrl}/${pageNum}`;
    
    console.log(`🔍 Navigating to page ${pageNum}: ${url}`);

    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for casino listings to load
      await this.page.waitForSelector('[data-testid*="casino"], .casino-item, .casino-card, .casino-listing', {
        timeout: 15000
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to load page ${pageNum}: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract casino data from current page
   */
  async extractCasinosFromPage() {
    console.log('  📋 Extracting casino data from page...');

    try {
      const casinos = await this.page.evaluate(() => {
        const casinoData = [];
        
        // Multiple selector strategies for different page layouts
        const selectors = [
          '[data-testid*="casino"]',
          '.casino-item',
          '.casino-card', 
          '.casino-listing',
          '.casino-review-item',
          'article[class*="casino"]',
          '.review-item'
        ];

        let casinoElements = [];
        
        // Try each selector until we find casino elements
        for (const selector of selectors) {
          casinoElements = document.querySelectorAll(selector);
          if (casinoElements.length > 0) {
            console.log(`Found ${casinoElements.length} casinos using selector: ${selector}`);
            break;
          }
        }

        // If still no elements, try broader selectors
        if (casinoElements.length === 0) {
          casinoElements = document.querySelectorAll('a[href*="/casino/"], a[href*="/review/"]');
          console.log(`Fallback: Found ${casinoElements.length} casino links`);
        }

        casinoElements.forEach((element, index) => {
          try {
            // Extract casino name from multiple possible sources
            let casinoName = '';
            const nameSelectors = [
              'h3', 'h2', 'h4', '.casino-name', '.title', 
              '[data-testid*="name"]', '.name', 'strong'
            ];
            
            for (const nameSelector of nameSelectors) {
              const nameEl = element.querySelector(nameSelector);
              if (nameEl && nameEl.textContent.trim()) {
                casinoName = nameEl.textContent.trim();
                break;
              }
            }

            // If no name found in child elements, check parent or siblings
            if (!casinoName) {
              const link = element.closest('a') || element.querySelector('a');
              if (link && link.textContent.trim()) {
                casinoName = link.textContent.trim();
              }
            }

            // Extract logo image
            let logoUrl = '';
            const imgSelectors = [
              'img', '.logo img', '.casino-logo img', 
              '[data-testid*="logo"] img', '.brand-logo img'
            ];
            
            for (const imgSelector of imgSelectors) {
              const imgEl = element.querySelector(imgSelector);
              if (imgEl && imgEl.src) {
                logoUrl = imgEl.src;
                break;
              }
            }

            // Extract casino URL/slug
            let casinoUrl = '';
            const linkEl = element.querySelector('a[href*="/casino/"], a[href*="/review/"]') || 
                          element.closest('a[href*="/casino/"], a[href*="/review/"]');
            
            if (linkEl && linkEl.href) {
              casinoUrl = linkEl.href;
            }

            // Only add if we have at least a name and logo
            if (casinoName && logoUrl) {
              // Clean up casino name
              casinoName = casinoName
                .replace(/\s+/g, ' ')
                .replace(/casino/gi, '')
                .replace(/review/gi, '')
                .trim();

              // Generate slug from name
              const slug = casinoName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '');

              casinoData.push({
                name: casinoName,
                slug: slug,
                logoUrl: logoUrl,
                casinoUrl: casinoUrl,
                pageIndex: index
              });
            }
          } catch (error) {
            console.error(`Error processing casino element ${index}:`, error);
          }
        });

        return casinoData;
      });

      console.log(`  ✅ Found ${casinos.length} casinos on this page`);
      return casinos;

    } catch (error) {
      console.error(`  ❌ Failed to extract casinos: ${error.message}`);
      return [];
    }
  }

  /**
   * Download and process a single logo
   */
  async downloadLogo(casino) {
    if (this.processedCasinos.has(casino.slug)) {
      console.log(`    ⏭️  ${casino.name} already processed`);
      return true;
    }

    console.log(`    🔍 Downloading logo for: ${casino.name}`);

    try {
      // Fetch the logo
      const response = await fetch(casino.logoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.askgamblers.com/'
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Validate image with Sharp
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image format');
      }

      if (metadata.width < 50 || metadata.height < 25) {
        throw new Error(`Too small: ${metadata.width}x${metadata.height}`);
      }

      if (buffer.length < 1000) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      // Process and save optimized versions
      const success = await this.processLogo(buffer, casino.slug, metadata);
      
      if (success) {
        this.processedCasinos.set(casino.slug, {
          name: casino.name,
          logoUrl: casino.logoUrl,
          processedAt: new Date().toISOString(),
          size: `${metadata.width}x${metadata.height}`,
          fileSize: buffer.length
        });

        this.stats.logosDownloaded++;
        console.log(`    ✅ ${casino.name}: ${metadata.width}x${metadata.height} (${Math.round(buffer.length/1024)}KB)`);
        return true;
      } else {
        throw new Error('Failed to process logo');
      }

    } catch (error) {
      console.log(`    ❌ ${casino.name}: ${error.message}`);
      this.stats.logosFailed++;
      this.failedDownloads.push({
        name: casino.name,
        slug: casino.slug,
        logoUrl: casino.logoUrl,
        reason: error.message
      });
      return false;
    }
  }

  /**
   * Process logo with Sharp.js optimization
   */
  async processLogo(buffer, slug, metadata) {
    try {
      const sharpImage = sharp(buffer);
      
      // Create main PNG with white background (universal compatibility)
      const mainLogo = metadata.hasAlpha ?
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
          .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 90 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        // WebP versions
        await sharpImage
          .clone()
          .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));

        // AVIF versions (if supported)
        try {
          await sharpImage
            .clone()
            .resize(size, maxHeight, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: 80, effort: 6 })
            .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.avif`));
        } catch (e) {
          // AVIF not supported in this Sharp version
        }
      }

      return true;
    } catch (error) {
      console.error(`    💥 Processing failed for ${slug}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process a single page
   */
  async processPage(pageNum) {
    console.log(`\n[Page ${pageNum}/93]`);
    
    // Skip if already processed
    if (pageNum <= this.stats.pagesProcessed) {
      console.log(`⏭️  Page ${pageNum} already processed`);
      return true;
    }

    const success = await this.navigateToPage(pageNum);
    if (!success) {
      return false;
    }

    // Extract casino data from page
    const casinos = await this.extractCasinosFromPage();
    this.stats.casinosFound += casinos.length;

    if (casinos.length === 0) {
      console.log('  ⚠️  No casinos found on this page');
      return false;
    }

    // Download logos for each casino
    console.log(`  🔄 Processing ${casinos.length} casino logos...`);
    
    for (let i = 0; i < casinos.length; i++) {
      const casino = casinos[i];
      await this.downloadLogo(casino);
      
      // Small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save progress every 5 downloads
      if ((i + 1) % 5 === 0) {
        await this.saveProgress();
      }
    }

    // Update page progress
    this.stats.pagesProcessed = pageNum;
    await this.saveProgress();

    console.log(`  ✅ Page ${pageNum} completed: ${casinos.length} casinos processed`);
    
    // Respectful delay between pages
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }

  /**
   * Main scraping process
   */
  async scrapeAllPages() {
    console.log('🚀 Starting AskGamblers logo scraping...\n');

    const startPage = this.stats.pagesProcessed + 1;
    const endPage = 93;

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      try {
        await this.processPage(pageNum);
      } catch (error) {
        console.error(`💥 Error processing page ${pageNum}: ${error.message}`);
        
        // Save progress and continue
        await this.saveProgress();
        
        // Brief delay before continuing
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Progress update every 10 pages
      if (pageNum % 10 === 0) {
        this.printProgressReport();
      }
    }

    await this.generateFinalReport();
  }

  /**
   * Print progress report
   */
  printProgressReport() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const progress = ((this.stats.pagesProcessed / 93) * 100).toFixed(1);
    
    console.log(`\n📊 PROGRESS REPORT`);
    console.log(`================`);
    console.log(`📄 Pages: ${this.stats.pagesProcessed}/93 (${progress}%)`);
    console.log(`🎰 Casinos found: ${this.stats.casinosFound}`);
    console.log(`✅ Logos downloaded: ${this.stats.logosDownloaded}`);
    console.log(`❌ Failed downloads: ${this.stats.logosFailed}`);
    console.log(`⏱️  Runtime: ${Math.floor(duration / 60)}m ${duration % 60}s\n`);
  }

  /**
   * Generate final report
   */
  async generateFinalReport() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const successRate = this.stats.casinosFound > 0 ? 
      ((this.stats.logosDownloaded / this.stats.casinosFound) * 100).toFixed(1) : 0;

    console.log('\n🏆 ASKGAMBLERS SCRAPING COMPLETE!');
    console.log('==================================');
    console.log(`⏱️  Total Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📄 Pages Processed: ${this.stats.pagesProcessed}/93`);
    console.log(`🎰 Casinos Found: ${this.stats.casinosFound}`);
    console.log(`✅ Logos Downloaded: ${this.stats.logosDownloaded}`);
    console.log(`❌ Failed Downloads: ${this.stats.logosFailed}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.stats.logosDownloaded > 0) {
      console.log('\n📁 Casino logos saved to: public/images/casinos/');
      console.log('🔧 Each logo includes 10 optimized versions (PNG, WebP, AVIF)');
      
      console.log(`\n🎯 Downloaded ${this.processedCasinos.size} unique casino logos!`);
      
      console.log('\n🚀 Next steps:');
      console.log('1. npm run build');
      console.log('2. docker build -t casino-askgamblers-logos .');
      console.log('3. Your casino portal now has REAL AskGamblers logos!');
    }

    if (this.failedDownloads.length > 0) {
      console.log(`\n⚠️  ${this.failedDownloads.length} logos failed to download`);
      
      // Save failed downloads report
      const failedReport = {
        timestamp: new Date().toISOString(),
        totalFailed: this.failedDownloads.length,
        failures: this.failedDownloads
      };
      
      await fs.writeFile(
        path.join(__dirname, '..', 'logs', 'failed-downloads.json'),
        JSON.stringify(failedReport, null, 2)
      );
      
      console.log('📄 Failed downloads report saved to: logs/failed-downloads.json');
    }

    // Generate casino mapping file
    const mapping = Array.from(this.processedCasinos.entries()).map(([slug, data]) => ({
      slug,
      name: data.name,
      logoUrl: data.logoUrl,
      size: data.size,
      processedAt: data.processedAt
    }));

    await fs.writeFile(
      path.join(__dirname, '..', 'data', 'askgamblers-casino-mapping.json'),
      JSON.stringify(mapping, null, 2)
    );
    
    console.log('📄 Casino mapping saved to: data/askgamblers-casino-mapping.json');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const scraper = new AskGamblersLogoScraper();
  
  try {
    await scraper.initialize();
    await scraper.scrapeAllPages();
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    await scraper.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, saving progress...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, saving progress...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { AskGamblersLogoScraper };