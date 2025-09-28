#!/usr/bin/env node

/**
 * Batch Real Logo Fetcher
 * Orchestrates the complete logo fetching process with Google Custom Search
 */

const fs = require('fs').promises;
const path = require('path');
const { GoogleLogoSearcher } = require('./google-logo-fetcher');

// Load environment variables if .env file exists
const ENV_FILE = path.join(__dirname, '..', '.env');

async function loadEnvironment() {
  try {
    const envContent = await fs.readFile(ENV_FILE, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.log('ℹ️  No .env file found, using system environment variables');
  }
}

/**
 * Enhanced logo fetcher with better error handling and reporting
 */
async function fetchAllRealLogos() {
  console.log('🎰 Real Casino Logo Fetcher v2.0');
  console.log('=====================================\n');

  // Load environment
  await loadEnvironment();

  // Validate requirements
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.log('❌ Missing Google API Configuration!\n');
    console.log('Please run: node scripts/setup-google-api.js');
    console.log('Then edit the .env file with your credentials.\n');
    process.exit(1);
  }

  // Load casino data
  const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
  const logosDir = path.join(__dirname, '..', 'public', 'images', 'casinos');

  let casinos;
  try {
    const casinosData = await fs.readFile(casinosPath, 'utf8');
    casinos = JSON.parse(casinosData);
    console.log(`📊 Loaded ${casinos.length} partner casinos\n`);
  } catch (error) {
    console.error('❌ Failed to load casino data:', error.message);
    process.exit(1);
  }

  // Create directories
  await fs.mkdir(logosDir, { recursive: true });

  // Initialize searcher
  const searcher = new GoogleLogoSearcher(apiKey, searchEngineId);
  
  // Statistics tracking
  const stats = {
    total: casinos.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now()
  };

  const failedCasinos = [];
  const successfulCasinos = [];

  console.log('🚀 Starting logo fetching process...\n');

  // Process each casino with progress tracking
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    const progress = Math.round((i / casinos.length) * 100);
    const eta = stats.successful > 0 ? 
      Math.round(((Date.now() - stats.startTime) / stats.successful) * (casinos.length - i) / 1000) : 0;

    console.log(`\n[${i + 1}/${casinos.length}] (${progress}%) ETA: ${eta}s`);
    console.log(`🎯 Fetching logo for: ${casino.name}`);

    // Check if logo already exists
    const existingLogo = path.join(logosDir, `${casino.slug}.png`);
    try {
      await fs.access(existingLogo);
      console.log('  ⏭️  Logo already exists, skipping...');
      stats.skipped++;
      continue;
    } catch (error) {
      // Logo doesn't exist, proceed with fetch
    }

    try {
      // Enhanced search queries
      const searchQueries = [
        `${casino.name} casino logo`,
        `${casino.name} online casino brand logo`,
        `site:${casino.slug}.com logo`,
        `"${casino.name}" casino logo png`
      ];

      let logoFetched = false;

      // Try different search queries
      for (const query of searchQueries) {
        if (logoFetched) break;

        console.log(`  🔍 Searching: "${query}"`);
        
        // Construct search parameters
        const params = new URLSearchParams({
          key: apiKey,
          cx: searchEngineId,
          q: query,
          searchType: 'image',
          imgSize: 'medium',
          imgType: 'png',
          safe: 'active',
          num: '10',
          fileType: 'png'
        });

        try {
          const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
          const data = await response.json();

          if (data.error) {
            console.log(`  ⚠️  API Error: ${data.error.message}`);
            continue;
          }

          const images = data.items || [];
          console.log(`  📸 Found ${images.length} potential logos`);

          // Try to download and process images
          for (const image of images) {
            const imageUrl = image.link;
            console.log(`  ⬇️  Trying: ${imageUrl.substring(0, 60)}...`);

            try {
              // Download image
              const response = await fetch(imageUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
              });

              if (!response.ok) {
                console.log(`    ❌ HTTP ${response.status}`);
                continue;
              }

              const buffer = Buffer.from(await response.arrayBuffer());
              
              // Process logo using the searcher
              const processed = await searcher.processLogo(buffer, casino.slug);
              
              if (processed) {
                console.log(`  ✅ Successfully fetched and processed logo!`);
                stats.successful++;
                successfulCasinos.push({
                  name: casino.name,
                  slug: casino.slug,
                  source: imageUrl,
                  query: query
                });
                logoFetched = true;
                break;
              }

            } catch (downloadError) {
              console.log(`    ❌ Download failed: ${downloadError.message}`);
            }
          }

          if (logoFetched) break;

        } catch (searchError) {
          console.log(`  ❌ Search failed: ${searchError.message}`);
        }

        // Rate limiting between searches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (!logoFetched) {
        console.log(`  ❌ No suitable logo found for ${casino.name}`);
        stats.failed++;
        failedCasinos.push({
          name: casino.name,
          slug: casino.slug,
          reason: 'No suitable logo found'
        });
      }

    } catch (error) {
      console.error(`  💥 Error processing ${casino.name}:`, error.message);
      stats.failed++;
      failedCasinos.push({
        name: casino.name,
        slug: casino.slug,
        reason: error.message
      });
    }

    // Rate limiting between casinos
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Generate comprehensive report
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  
  console.log('\n🏆 LOGO FETCHING COMPLETE!');
  console.log('=====================================');
  console.log(`⏱️  Total Time: ${duration} seconds`);
  console.log(`📊 Total Casinos: ${stats.total}`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`⏭️  Skipped (existed): ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📈 Success Rate: ${((stats.successful / (stats.total - stats.skipped)) * 100).toFixed(1)}%`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    duration: duration,
    statistics: stats,
    successful: successfulCasinos,
    failed: failedCasinos,
    apiUsage: {
      estimatedQueries: stats.successful * 2, // Average 2 queries per success
      remainingQuota: 'Check Google Cloud Console'
    }
  };

  await fs.writeFile(
    path.join(__dirname, '..', 'logs', `logo-fetch-report-${Date.now()}.json`),
    JSON.stringify(report, null, 2)
  );

  if (stats.successful > 0) {
    console.log('\n📁 Real casino logos saved to: public/images/casinos/');
    console.log('🔧 Each successful logo includes:');
    console.log('  - Original PNG (fallback)');
    console.log('  - WebP versions (3 sizes: 400w, 800w, 1200w)');
    console.log('  - AVIF versions (3 sizes: 400w, 800w, 1200w)');
    console.log('  - Optimized for responsive design');
  }

  if (failedCasinos.length > 0) {
    console.log('\n⚠️  Failed Casinos:');
    failedCasinos.slice(0, 5).forEach(casino => {
      console.log(`  • ${casino.name}: ${casino.reason}`);
    });
    if (failedCasinos.length > 5) {
      console.log(`  ... and ${failedCasinos.length - 5} more (see report)`);
    }
  }

  console.log('\n🔍 Next Steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: docker build -t casino-with-real-logos .');
  console.log('3. Check the site with real partner logos!');
}

// Create logs directory if it doesn't exist
async function ensureLogsDir() {
  const logsDir = path.join(__dirname, '..', 'logs');
  await fs.mkdir(logsDir, { recursive: true });
}

if (require.main === module) {
  ensureLogsDir()
    .then(() => fetchAllRealLogos())
    .catch(error => {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchAllRealLogos };