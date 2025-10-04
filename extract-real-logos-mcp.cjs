/**
 * Real Logo Extraction using MCP Workflow
 * 
 * This script:
 * 1. Loads all 79 casinos from data/casinos.json
 * 2. For each casino, navigates to their REAL website using Playwright
 * 3. Extracts the actual logo IMG element from their homepage
 * 4. Downloads the logo from the real source
 * 
 * Uses MCP tools: mcp_playwright_browser_navigate, mcp_playwright_browser_evaluate
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CASINOS_FILE = path.join(__dirname, 'data', 'casinos.json');
const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'casinos');
const RESULTS_FILE = 'real-logo-extraction-results.json';
const MCP_COMMANDS_FILE = 'mcp-real-logo-commands.json';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load casino data
const casinos = JSON.parse(fs.readFileSync(CASINOS_FILE, 'utf-8'));
console.log(`📊 Loaded ${casinos.length} casinos\n`);

/**
 * Generate MCP Playwright commands for manual execution
 * These commands can be executed by the MCP agent
 */
function generateMCPCommands() {
  const commands = casinos.map(casino => ({
    casino: casino.brand,
    slug: casino.slug,
    url: casino.url,
    step1_navigate: {
      tool: 'mcp_playwright_browser_navigate',
      params: {
        url: casino.url
      },
      description: `Navigate to ${casino.brand} homepage`
    },
    step2_extract_logo: {
      tool: 'mcp_playwright_browser_evaluate',
      params: {
        function: `() => {
          // Find logo in common locations
          const selectors = [
            'img[alt*="logo" i]',
            'img[class*="logo" i]',
            'img[id*="logo" i]',
            '.logo img',
            '#logo img',
            'header img',
            '.header img',
            'nav img',
            '.navbar img',
            'img[src*="logo" i]'
          ];
          
          for (const selector of selectors) {
            const logo = document.querySelector(selector);
            if (logo && logo.src && logo.width > 50 && logo.height > 20) {
              return {
                found: true,
                src: logo.src,
                alt: logo.alt,
                width: logo.width,
                height: logo.height,
                selector: selector
              };
            }
          }
          
          // Fallback: find largest image in header
          const headerImgs = document.querySelectorAll('header img, nav img, .header img');
          let largest = null;
          let maxArea = 0;
          
          headerImgs.forEach(img => {
            const area = img.width * img.height;
            if (area > maxArea && area < 100000) { // not too large (not banner)
              maxArea = area;
              largest = img;
            }
          });
          
          if (largest) {
            return {
              found: true,
              src: largest.src,
              alt: largest.alt,
              width: largest.width,
              height: largest.height,
              selector: 'largest-header-img'
            };
          }
          
          return { found: false, error: 'No logo found' };
        }`
      },
      description: `Extract logo URL from ${casino.brand} homepage`
    },
    step3_download: {
      note: 'Use extracted logo src URL with mcp_image-downloa_download_image',
      outputPath: path.join(OUTPUT_DIR, `${casino.slug}.png`)
    }
  }));
  
  fs.writeFileSync(MCP_COMMANDS_FILE, JSON.stringify(commands, null, 2));
  console.log(`✅ Generated MCP commands for ${commands.length} casinos`);
  console.log(`📝 Commands saved to: ${MCP_COMMANDS_FILE}\n`);
  
  return commands;
}

/**
 * Alternative: Direct extraction using node-fetch
 * This scrapes the HTML and extracts logo URLs
 */
async function extractLogoFromHTML(url, brand) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract logo URLs using regex patterns
    const patterns = [
      /<img[^>]+(?:alt|class|id)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/gi,
      /<img[^>]+src=["']([^"']+)["'][^>]+(?:alt|class|id)=["'][^"']*logo[^"']*["']/gi,
      /<img[^>]+src=["']([^"']*logo[^"']*)["']/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        const logoUrl = matches[0][1];
        // Convert relative URL to absolute
        const absoluteUrl = new URL(logoUrl, url).href;
        return {
          found: true,
          src: absoluteUrl,
          method: 'html-scraping'
        };
      }
    }
    
    return { found: false, error: 'No logo found in HTML' };
  } catch (error) {
    return { found: false, error: error.message };
  }
}

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        resolve({ success: true, size: stats.size });
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Process all casinos using HTML scraping
 */
async function processWithHTMLScraping() {
  console.log('🔍 Starting HTML scraping approach...\n');
  const results = [];
  
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
    
    console.log(`[${i + 1}/${casinos.length}] 🎰 ${casino.brand}`);
    console.log(`   URL: ${casino.url}`);
    
    // Check if already exists
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 1024) {
        console.log(`   ⏭️  Already exists (${(stats.size / 1024).toFixed(2)}KB)\n`);
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'skipped',
          reason: 'Already exists'
        });
        continue;
      }
    }
    
    try {
      // Extract logo URL
      console.log('   🔍 Scraping homepage...');
      const extraction = await extractLogoFromHTML(casino.url, casino.brand);
      
      if (!extraction.found) {
        console.log(`   ❌ ${extraction.error}\n`);
        results.push({
          casino: casino.brand,
          slug: casino.slug,
          status: 'failed',
          reason: extraction.error
        });
        continue;
      }
      
      console.log(`   ✅ Found logo: ${extraction.src}`);
      
      // Download logo
      console.log('   📥 Downloading...');
      const download = await downloadImage(extraction.src, outputPath);
      console.log(`   ✅ Downloaded (${(download.size / 1024).toFixed(2)}KB)\n`);
      
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'success',
        logoUrl: extraction.src,
        fileSize: download.size
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      results.push({
        casino: casino.brand,
        slug: casino.slug,
        status: 'failed',
        reason: error.message
      });
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Real Logo Extraction Workflow\n');
  console.log('━'.repeat(80) + '\n');
  
  // Step 1: Generate MCP commands for reference
  console.log('📋 Step 1: Generating MCP commands...\n');
  generateMCPCommands();
  
  // Step 2: Execute HTML scraping approach
  console.log('📋 Step 2: Executing HTML scraping...\n');
  const results = await processWithHTMLScraping();
  
  // Generate statistics
  const stats = {
    total: results.length,
    succeeded: results.filter(r => r.status === 'success').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    failed: results.filter(r => r.status === 'failed').length
  };
  
  const successRate = stats.total > 0
    ? ((stats.succeeded / (stats.total - stats.skipped)) * 100).toFixed(2)
    : 0;
  
  // Save results
  const output = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    successRate: `${successRate}%`,
    results: results
  };
  
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
  
  // Print summary
  console.log('━'.repeat(80));
  console.log('\n🎉 EXTRACTION COMPLETE!\n');
  console.log('📊 STATISTICS:');
  console.log(`   Total:     ${stats.total}`);
  console.log(`   ✅ Success: ${stats.succeeded}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  console.log(`   ❌ Failed:  ${stats.failed}`);
  console.log(`   🎯 Rate:    ${successRate}%`);
  
  if (stats.failed > 0) {
    console.log('\n⚠️  FAILED EXTRACTIONS:');
    results
      .filter(r => r.status === 'failed')
      .slice(0, 10)
      .forEach(r => {
        console.log(`   - ${r.casino}: ${r.reason}`);
      });
    if (stats.failed > 10) {
      console.log(`   ... and ${stats.failed - 10} more`);
    }
  }
  
  console.log(`\n💾 Results saved to: ${RESULTS_FILE}`);
  console.log(`📝 MCP commands saved to: ${MCP_COMMANDS_FILE}`);
  console.log('\n' + '━'.repeat(80));
}

// Run
main().catch(console.error);
