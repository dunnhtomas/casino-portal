#!/usr/bin/env node

/**
 * Logo.dev API Integration for Real Casino Logos
 * Upgrades from Brandfetch to Logo.dev API for better logo accuracy
 * Uses Logo.dev with 99% uptime and millions of company logos
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CASINOS_FILE = path.join(__dirname, '..', 'data', 'casinos.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'casino-logos-logodev.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'casinos');

// Logo.dev Configuration
const LOGO_DEV_CONFIG = {
  // Note: Get your API key from https://logo.dev/
  API_KEY: process.env.LOGODEV_API_KEY || 'YOUR_LOGODEV_API_KEY_HERE',
  BASE_URL: 'https://img.logo.dev',
  SEARCH_API: 'https://api.logo.dev/search',
  DEFAULT_SIZE: 400,
  DEFAULT_FORMAT: 'png',
  THEME: 'auto', // auto, light, dark
  RETINA: false,
  FALLBACK: 'monogram' // monogram or 404
};

/**
 * Logo.dev API Integration Class
 */
class LogoDevIntegration {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.apiKey = LOGO_DEV_CONFIG.API_KEY;
    
    if (this.apiKey === 'YOUR_LOGODEV_API_KEY_HERE') {
      console.log('⚠️  Using free tier (rate limited). Get API key from https://logo.dev/ for production');
    }
  }

  /**
   * Generate Logo.dev URL for a casino domain
   */
  generateLogoDevUrl(domain, options = {}) {
    const {
      size = LOGO_DEV_CONFIG.DEFAULT_SIZE,
      format = LOGO_DEV_CONFIG.DEFAULT_FORMAT,
      theme = LOGO_DEV_CONFIG.THEME,
      retina = LOGO_DEV_CONFIG.RETINA,
      fallback = LOGO_DEV_CONFIG.FALLBACK
    } = options;

    let url = `${LOGO_DEV_CONFIG.BASE_URL}/${domain}`;
    const params = new URLSearchParams();

    // Add API key if available
    if (this.apiKey && this.apiKey !== 'YOUR_LOGODEV_API_KEY_HERE') {
      params.append('token', this.apiKey);
    }

    // Add parameters
    if (size !== 128) params.append('size', size.toString());
    if (format !== 'jpg') params.append('format', format);
    if (theme !== 'auto') params.append('theme', theme);
    if (retina) params.append('retina', 'true');
    if (fallback !== 'monogram') params.append('fallback', fallback);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    return url;
  }

  /**
   * Search for company using Logo.dev search API
   */
  async searchCompany(companyName) {
    if (!this.apiKey || this.apiKey === 'YOUR_LOGODEV_API_KEY_HERE') {
      return null; // Skip search without API key
    }

    try {
      const response = await fetch(`${LOGO_DEV_CONFIG.SEARCH_API}?q=${encodeURIComponent(companyName)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Search API HTTP ${response.status}`);
      }

      const results = await response.json();
      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      console.log(`    ❌ Search failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract domain variations for a casino
   */
  extractDomainVariations(casinoUrl, casinoSlug) {
    const domains = new Set();
    
    // From casino URL
    if (casinoUrl) {
      try {
        const url = new URL(casinoUrl);
        domains.add(url.hostname.replace(/^www\./, ''));
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // From slug variations
    const baseSlug = casinoSlug.replace(/-v2|-uk|-es|-de|-fr|-at|-cz|-be|-gr|-se|-fi|-nl|-au|-ca|-us/g, '');
    domains.add(`${baseSlug}.com`);
    domains.add(`${baseSlug}.net`);
    domains.add(`${baseSlug}.casino`);
    domains.add(`${baseSlug}.co`);
    
    // Handle special cases
    if (baseSlug.includes('-')) {
      const noDashSlug = baseSlug.replace(/-/g, '');
      domains.add(`${noDashSlug}.com`);
    }

    return Array.from(domains);
  }

  /**
   * Test if Logo.dev URL returns a valid logo
   */
  async testLogoUrl(logoUrl) {
    try {
      console.log(`    🔍 Testing: ${logoUrl}`);

      const response = await fetch(logoUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/*,*/*;q=0.8'
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
      
      // Quality checks for real logos vs. fallback monograms
      if (metadata.width < 64 || metadata.height < 32) {
        throw new Error(`Too small: ${metadata.width}x${metadata.height}`);
      }

      if (buffer.length < 800) {
        throw new Error(`File too small: ${buffer.length} bytes`);
      }

      // Check if it's not just a generic monogram
      const stats = await sharp(buffer).stats();
      const isMonochrome = stats.channels.every(channel => 
        Math.abs(channel.mean - stats.channels[0].mean) < 10
      );

      if (isMonochrome && buffer.length < 2000) {
        throw new Error('Likely generic monogram fallback');
      }

      console.log(`    ✅ Valid logo: ${metadata.width}x${metadata.height}, ${Math.round(buffer.length/1024)}KB`);
      
      return {
        url: logoUrl,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
        format: metadata.format,
        quality: this.assessLogoQuality(metadata, buffer.length)
      };

    } catch (error) {
      console.log(`    ❌ Failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Assess logo quality based on metadata
   */
  assessLogoQuality(metadata, fileSize) {
    let score = 50; // Base score

    // Size scoring
    if (metadata.width >= 200 && metadata.height >= 100) score += 20;
    if (metadata.width >= 400 && metadata.height >= 200) score += 15;
    
    // File size scoring
    if (fileSize > 5000) score += 10;
    if (fileSize > 10000) score += 10;
    
    // Format scoring
    if (metadata.format === 'png') score += 5;
    if (metadata.format === 'svg') score += 10;

    return Math.min(100, score);
  }

  /**
   * Find best logo for a casino using Logo.dev
   */
  async findBestLogo(casino) {
    console.log(`🎯 Finding Logo.dev logo for: ${casino.brand} (${casino.slug})`);

    const results = [];

    // Method 1: Search API (if available)
    if (this.apiKey && this.apiKey !== 'YOUR_LOGODEV_API_KEY_HERE') {
      console.log(`  🔍 Searching Logo.dev database for: ${casino.brand}`);
      const searchResult = await this.searchCompany(casino.brand);
      
      if (searchResult && searchResult.domain) {
        const logoUrl = this.generateLogoDevUrl(searchResult.domain);
        const result = await this.testLogoUrl(logoUrl);
        
        if (result) {
          results.push({
            ...result,
            source: 'logodev-search',
            domain: searchResult.domain,
            confidence: 95
          });
        }
      }
    }

    // Method 2: Direct domain attempts
    console.log(`  🌐 Trying domain variations...`);
    const domains = this.extractDomainVariations(casino.url, casino.slug);
    
    for (const domain of domains.slice(0, 5)) { // Test top 5 domains
      const logoUrl = this.generateLogoDevUrl(domain);
      const result = await this.testLogoUrl(logoUrl);
      
      if (result) {
        results.push({
          ...result,
          source: 'logodev-domain',
          domain,
          confidence: 80
        });
      }
    }

    // Return best result
    if (results.length === 0) {
      console.log(`  ❌ No Logo.dev logo found for ${casino.brand}`);
      return null;
    }

    // Sort by quality and confidence
    results.sort((a, b) => {
      const scoreA = a.quality * (a.confidence / 100);
      const scoreB = b.quality * (b.confidence / 100);
      return scoreB - scoreA;
    });

    const best = results[0];
    console.log(`  ✅ Found high-quality logo: ${best.domain} (${best.quality}% quality)`);
    
    return best;
  }
}

/**
 * Main process to upgrade to Logo.dev
 */
async function upgradeToLogoDev() {
  console.log('🚀 Logo.dev API Integration');
  console.log('Upgrading from Brandfetch to Logo.dev for authentic casino logos');
  console.log('================================================================\n');

  // Create directories
  await fs.mkdir(LOGOS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  // Load casino data
  let casinos;
  try {
    const casinosData = await fs.readFile(CASINOS_FILE, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Processing ${casinos.length} casinos for Logo.dev upgrade\n`);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    process.exit(1);
  }

  const logoDevApi = new LogoDevIntegration();
  
  // Statistics
  const stats = {
    total: casinos.length,
    successful: 0,
    improved: 0,
    failed: 0,
    startTime: Date.now()
  };

  const logoResults = {};
  const improvements = [];

  // Process each casino (test with first 20)
  const casinosToProcess = casinos.slice(0, 20);
  console.log(`🎯 Testing Logo.dev with first ${casinosToProcess.length} casinos...\n`);

  for (let i = 0; i < casinosToProcess.length; i++) {
    const casino = casinosToProcess[i];
    const progress = Math.round((i / casinosToProcess.length) * 100);
    
    console.log(`\n[${i + 1}/${casinosToProcess.length}] (${progress}%)`);

    try {
      const logoResult = await logoDevApi.findBestLogo(casino);
      
      if (logoResult) {
        logoResults[casino.slug] = {
          brand: casino.brand,
          slug: casino.slug,
          logodev: logoResult,
          original_brandfetch: casino.logo?.url || 'none',
          improvement: true,
          timestamp: new Date().toISOString()
        };

        improvements.push({
          casino: casino.brand,
          old_source: 'brandfetch',
          new_source: 'logodev',
          quality_improvement: logoResult.quality,
          url: logoResult.url
        });

        stats.successful++;
        stats.improved++;
        
      } else {
        logoResults[casino.slug] = {
          brand: casino.brand,
          slug: casino.slug,
          logodev: null,
          original_brandfetch: casino.logo?.url || 'none',
          improvement: false,
          fallback_recommended: 'brandfetch',
          timestamp: new Date().toISOString()
        };
        
        stats.failed++;
      }

    } catch (error) {
      console.error(`  💥 Error processing ${casino.brand}: ${error.message}`);
      stats.failed++;
    }

    // Rate limiting for free tier
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(logoResults, null, 2));

  // Final report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('\n🏆 LOGO.DEV UPGRADE COMPLETE!');
  console.log('=================================');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 Processed: ${casinosToProcess.length}/${casinos.length} casinos`);
  console.log(`✅ Logo.dev Logos Found: ${stats.successful}`);
  console.log(`📈 Improvements: ${stats.improved}`);
  console.log(`❌ No Logo.dev Match: ${stats.failed}`);
  console.log(`📈 Success Rate: ${((stats.successful / casinosToProcess.length) * 100).toFixed(1)}%`);

  if (improvements.length > 0) {
    console.log('\n🎊 LOGO IMPROVEMENTS FOUND:');
    improvements.slice(0, 10).forEach(item => {
      console.log(`  ✅ ${item.casino}: ${item.quality_improvement}% quality (Logo.dev)`);
    });
    if (improvements.length > 10) {
      console.log(`  ... and ${improvements.length - 10} more improvements!`);
    }

    console.log('\n📁 Results saved to:', OUTPUT_FILE);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Review the results in casino-logos-logodev.json');
    console.log('2. Run the hybrid logo system script');
    console.log('3. Update getBrandLogo.ts to use Logo.dev URLs');
    console.log('4. Deploy with authentic casino logos! 🎰✨');
    
    console.log('\n💡 Logo.dev provides:');
    console.log('• 99% uptime vs Brandfetch issues');
    console.log('• Millions of company logos including casinos');
    console.log('• Multiple fallback options');
    console.log('• Better accuracy for brand recognition');
  }

  console.log('\n🔗 Get Logo.dev API key: https://logo.dev/');
  console.log('💰 Free tier: 1000 requests/month');
  console.log('🚀 Pro tier: Unlimited requests + search API');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  upgradeToLogoDev().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

export { LogoDevIntegration, upgradeToLogoDev };