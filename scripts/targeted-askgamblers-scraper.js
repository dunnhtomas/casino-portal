#!/usr/bin/env node

/**
 * Targeted AskGamblers Scraper 2025
 * Specifically searches for and downloads data for YOUR 79 casinos
 * Includes logos, reviews, ratings, and comprehensive data
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const SEARCH_LIST_FILE = path.join(__dirname, '..', 'data', 'casino-search-list.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');
const DATA_DIR = path.join(__dirname, '..', 'data', 'askgamblers-data');
const RESULTS_FILE = path.join(DATA_DIR, 'scraped-casino-data.json');

class TargetedAskGamblersScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetCasinos = [];
    this.scrapedData = [];
    this.matchedCasinos = new Set();
    
    this.stats = {
      totalTargets: 0,
      found: 0,
      notFound: 0,
      logosDownloaded: 0,
      reviewsExtracted: 0,
      pagesSearched: 0,
      startTime: Date.now()
    };
  }

  async initialize() {
    console.log('🎯 Targeted AskGamblers Scraper 2025');
    console.log('=====================================\n');

    // Create directories
    await fs.mkdir(LOGOS_DIR, { recursive: true });
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Load our target casino list
    try {
      const searchData = await fs.readFile(SEARCH_LIST_FILE, 'utf8');
      this.targetCasinos = JSON.parse(searchData);
      this.stats.totalTargets = this.targetCasinos.length;
      console.log(`🎰 Loaded ${this.stats.totalTargets} target casinos to find\n`);
    } catch (error) {
      console.error('❌ Failed to load casino search list:', error.message);
      process.exit(1);
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 300,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();
    console.log('✅ Browser initialized\n');
  }

  async searchAskGamblersPages() {
    console.log('🔍 Searching AskGamblers pages for our target casinos...\n');

    // Search through AskGamblers pages (let's start with first 30 pages for efficiency)
    for (let pageNum = 1; pageNum <= 30; pageNum++) {
      console.log(`[Page ${pageNum}/30] Scanning for our casinos...`);
      
      try {
        const found = await this.scanPageForTargets(pageNum);
        if (found > 0) {
          console.log(`  ✅ Found ${found} of our casinos on page ${pageNum}`);
        } else {
          console.log(`  ⚪ No matches on page ${pageNum}`);
        }
        
        this.stats.pagesSearched++;
        
        // Save progress every 5 pages
        if (pageNum % 5 === 0) {
          await this.saveProgress();
          this.printProgress();
        }
        
        // Respectful delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`  ❌ Error on page ${pageNum}: ${error.message}`);
        continue;
      }
    }

    console.log('\n🎯 Search complete! Now processing found casinos...\n');
  }

  async scanPageForTargets(pageNum) {
    const baseUrl = 'https://www.askgamblers.com/online-casinos/reviews';
    const url = pageNum === 1 ? baseUrl : `${baseUrl}/${pageNum}`;
    
    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Wait for content to load
      await this.page.waitForTimeout(3000);

      // Extract casino data from this page
      const pageData = await this.page.evaluate(() => {
        const casinoData = [];
        
        // Find all images and links that could be casinos
        const allElements = document.querySelectorAll('img, a[href*="casino"], a[href*="review"]');
        
        allElements.forEach(element => {
          try {
            let casinoName = '';
            let logoUrl = '';
            let casinoUrl = '';
            let reviewText = '';

            if (element.tagName === 'IMG') {
              casinoName = element.alt || '';
              logoUrl = element.src || '';
              
              // Try to find associated link/review
              const parentLink = element.closest('a') || 
                                element.parentElement?.querySelector('a') ||
                                element.nextElementSibling?.querySelector('a');
              if (parentLink) {
                casinoUrl = parentLink.href;
                reviewText = parentLink.textContent?.trim() || '';
              }
            }
            
            if (element.tagName === 'A') {
              casinoName = element.textContent?.trim() || '';
              casinoUrl = element.href;
              
              // Look for associated image
              const img = element.querySelector('img') ||
                         element.parentElement?.querySelector('img') ||
                         element.previousElementSibling?.querySelector('img');
              if (img) {
                logoUrl = img.src;
              }
            }

            // Clean up casino name
            if (casinoName) {
              casinoName = casinoName
                .replace(/\s+/g, ' ')
                .replace(/(casino|review|bonus|promotion|free|spins|deposit)/gi, '')
                .trim();
            }

            if (casinoName && casinoName.length > 2 && casinoName.length < 50) {
              casinoData.push({
                name: casinoName,
                logoUrl: logoUrl,
                casinoUrl: casinoUrl,
                reviewText: reviewText,
                pageNumber: pageNum
              });
            }
          } catch (e) {
            // Skip problematic elements
          }
        });

        return casinoData;
      });

      // Match against our target casinos
      let foundCount = 0;
      
      for (const pageItem of pageData) {
        const matchedTarget = this.findMatchingTarget(pageItem.name);
        
        if (matchedTarget && !this.matchedCasinos.has(matchedTarget.slug)) {
          console.log(`    🎯 FOUND: "${pageItem.name}" matches "${matchedTarget.brand}"`);
          
          this.matchedCasinos.add(matchedTarget.slug);
          foundCount++;
          this.stats.found++;
          
          // Process this casino immediately
          await this.processCasino(matchedTarget, pageItem);
        }
      }

      return foundCount;

    } catch (error) {
      console.error(`Failed to scan page ${pageNum}: ${error.message}`);
      return 0;
    }
  }

  findMatchingTarget(foundName) {
    if (!foundName) return null;
    
    const cleanFoundName = foundName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    for (const target of this.targetCasinos) {
      // Check if any of the search variations match
      for (const variation of target.searchVariations) {
        if (variation && cleanFoundName.includes(variation)) {
          return target;
        }
        
        // Reverse match - check if the variation contains the found name
        if (variation && variation.length > 3 && cleanFoundName.length > 3) {
          const similarity = this.calculateSimilarity(cleanFoundName, variation);
          if (similarity > 0.7) {
            return target;
          }
        }
      }
      
      // Direct brand name match
      const cleanBrandName = target.brand.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (cleanFoundName.includes(cleanBrandName) || cleanBrandName.includes(cleanFoundName)) {
        return target;
      }
    }
    
    return null;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async processCasino(target, foundData) {
    console.log(`    🔄 Processing ${target.brand}...`);
    
    const casinoData = {
      // Our original data
      slug: target.slug,
      brand: target.brand,
      originalBrand: target.originalBrand,
      originalUrl: target.url,
      
      // AskGamblers data
      askGamblersName: foundData.name,
      askGamblersLogoUrl: foundData.logoUrl,
      askGamblersUrl: foundData.casinoUrl,
      reviewText: foundData.reviewText,
      foundOnPage: foundData.pageNumber,
      
      // Processing timestamps
      scrapedAt: new Date().toISOString(),
      
      // Placeholders for additional data
      rating: null,
      fullReview: null,
      logoDownloaded: false
    };

    // Download logo if available
    if (foundData.logoUrl && !foundData.logoUrl.includes('placeholder')) {
      try {
        const logoSuccess = await this.downloadLogo(target.slug, foundData.logoUrl);
        casinoData.logoDownloaded = logoSuccess;
        if (logoSuccess) {
          this.stats.logosDownloaded++;
        }
      } catch (error) {
        console.log(`      ⚠️  Logo download failed: ${error.message}`);
      }
    }

    // Try to get more detailed review data if URL available
    if (foundData.casinoUrl && foundData.casinoUrl.includes('askgamblers.com')) {
      try {
        const detailedData = await this.getDetailedReviewData(foundData.casinoUrl);
        if (detailedData) {
          Object.assign(casinoData, detailedData);
          this.stats.reviewsExtracted++;
        }
      } catch (error) {
        console.log(`      ⚠️  Review extraction failed: ${error.message}`);
      }
    }

    this.scrapedData.push(casinoData);
    console.log(`    ✅ ${target.brand} processed successfully`);
  }

  async downloadLogo(slug, logoUrl) {
    try {
      if (!logoUrl || logoUrl.includes('placeholder') || logoUrl.includes('lazy-')) {
        return false;
      }

      // Make sure URL is absolute
      if (logoUrl.startsWith('/')) {
        logoUrl = `https://www.askgamblers.com${logoUrl}`;
      }

      const response = await fetch(logoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.askgamblers.com/'
        },
        timeout: 15000
      });

      if (!response.ok) return false;

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1000) return false;

      // Process with Sharp
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || metadata.width < 50) return false;

      // Save main logo
      await sharp(buffer)
        .png({ quality: 95 })
        .toFile(path.join(LOGOS_DIR, `${slug}.png`));

      // Generate responsive versions
      const sizes = [400, 800, 1200];
      for (const size of sizes) {
        await sharp(buffer)
          .resize(size, Math.round(size * 0.5), { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 90 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.png`));

        await sharp(buffer)
          .resize(size, Math.round(size * 0.5), { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(LOGOS_DIR, `${slug}-${size}w.webp`));
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async getDetailedReviewData(reviewUrl) {
    try {
      // Open review page in new tab to avoid disrupting main flow
      const reviewPage = await this.browser.newPage();
      
      await reviewPage.goto(reviewUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });

      await reviewPage.waitForTimeout(2000);

      const detailedData = await reviewPage.evaluate(() => {
        const data = {};
        
        // Try to extract rating
        const ratingEl = document.querySelector('[class*="rating"], [class*="score"], .stars, .grade');
        if (ratingEl) {
          const ratingText = ratingEl.textContent || ratingEl.getAttribute('data-rating') || '';
          const ratingMatch = ratingText.match(/[\d.]+/);
          if (ratingMatch) {
            data.rating = parseFloat(ratingMatch[0]);
          }
        }

        // Try to extract review summary
        const reviewEl = document.querySelector('[class*="review"], [class*="summary"], .content, .description');
        if (reviewEl) {
          data.fullReview = reviewEl.textContent?.trim().substring(0, 500) || '';
        }

        // Try to extract bonus info
        const bonusEl = document.querySelector('[class*="bonus"], [class*="offer"], [class*="welcome"]');
        if (bonusEl) {
          data.bonusInfo = bonusEl.textContent?.trim().substring(0, 200) || '';
        }

        // Try to extract features/pros/cons
        const prosEl = document.querySelector('[class*="pros"], [class*="advantages"], [class*="positive"]');
        const consEl = document.querySelector('[class*="cons"], [class*="disadvantages"], [class*="negative"]');
        
        if (prosEl) {
          data.pros = prosEl.textContent?.trim().substring(0, 300) || '';
        }
        
        if (consEl) {
          data.cons = consEl.textContent?.trim().substring(0, 300) || '';
        }

        return data;
      });

      await reviewPage.close();
      return detailedData;

    } catch (error) {
      return null;
    }
  }

  async saveProgress() {
    try {
      const progressData = {
        stats: this.stats,
        matchedCasinos: Array.from(this.matchedCasinos),
        scrapedData: this.scrapedData,
        timestamp: new Date().toISOString()
      };

      await fs.writeFile(RESULTS_FILE, JSON.stringify(progressData, null, 2));
    } catch (error) {
      console.error('Failed to save progress:', error.message);
    }
  }

  printProgress() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const remaining = this.stats.totalTargets - this.stats.found;
    
    console.log(`\n📊 PROGRESS UPDATE`);
    console.log(`=================`);
    console.log(`🎰 Target casinos: ${this.stats.totalTargets}`);
    console.log(`✅ Found & processed: ${this.stats.found}`);
    console.log(`❌ Still searching: ${remaining}`);
    console.log(`🖼️  Logos downloaded: ${this.stats.logosDownloaded}`);
    console.log(`📄 Reviews extracted: ${this.stats.reviewsExtracted}`);
    console.log(`📄 Pages searched: ${this.stats.pagesSearched}`);
    console.log(`⏱️  Runtime: ${Math.floor(duration / 60)}m ${duration % 60}s\n`);
  }

  async generateFinalReport() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const successRate = ((this.stats.found / this.stats.totalTargets) * 100).toFixed(1);
    
    console.log('\n🏆 TARGETED SCRAPING COMPLETE!');
    console.log('==============================');
    console.log(`⏱️  Total Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`🎯 Target Casinos: ${this.stats.totalTargets}`);
    console.log(`✅ Found & Processed: ${this.stats.found}`);
    console.log(`❌ Not Found: ${this.stats.totalTargets - this.stats.found}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`🖼️  Logos Downloaded: ${this.stats.logosDownloaded}`);
    console.log(`📄 Reviews Extracted: ${this.stats.reviewsExtracted}`);

    if (this.stats.found > 0) {
      console.log('\n✅ SUCCESSFULLY FOUND CASINOS:');
      console.log('==============================');
      this.scrapedData.forEach((casino, index) => {
        const logoStatus = casino.logoDownloaded ? '🖼️' : '⚪';
        const reviewStatus = casino.rating ? '⭐' : '⚪';
        console.log(`${index + 1}. ${casino.brand} ${logoStatus} ${reviewStatus}`);
      });

      console.log('\n📁 Data saved to:');
      console.log(`• ${path.basename(RESULTS_FILE)} - Complete scraped data`);
      console.log(`• public/images/casinos/ - Downloaded logos`);
      
      console.log('\n🚀 Next steps:');
      console.log('1. Review the scraped data');
      console.log('2. npm run build');
      console.log('3. docker build -t casino-askgamblers-complete .');
      console.log('4. Your casino portal now has real AskGamblers data!');
    }

    // Save final results
    await this.saveProgress();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
}

async function main() {
  const scraper = new TargetedAskGamblersScraper();
  
  try {
    await scraper.initialize();
    await scraper.searchAskGamblersPages();
    await scraper.generateFinalReport();
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  } finally {
    await scraper.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { TargetedAskGamblersScraper };