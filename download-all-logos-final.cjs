const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const LOGOS_DIR = path.join(__dirname, 'public', 'images', 'casinos');
const CASINO_DATA_FILE = path.join(__dirname, 'data', 'casinos.json');
const RESULTS_FILE = path.join(__dirname, 'logo-download-results.json');

// Stats
const stats = {
  total: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  results: []
};

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {}); // Delete incomplete file
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Try multiple logo sources for a casino
 */
async function downloadCasinoLogo(casino, index, total) {
  const slug = casino.slug;
  const url = casino.url;
  const brand = casino.brand;
  
  console.log(`\n[${index + 1}/${total}] Processing: ${brand} (${slug})`);
  
  // Extract domain
  const domain = url
    .replace('https://www.', '')
    .replace('https://', '')
    .replace('http://www.', '')
    .replace('http://', '')
    .split('/')[0];
  
  // Check if logo already exists
  const existingLogo = fs.readdirSync(LOGOS_DIR).find(file => 
    file.startsWith(slug + '.') && !file.includes('-1200w') && !file.includes('-800w') && !file.includes('-400w')
  );
  
  if (existingLogo) {
    console.log(`  ✅ Logo already exists: ${existingLogo}`);
    stats.skipped++;
    stats.results.push({
      slug,
      brand,
      status: 'skipped',
      file: existingLogo,
      reason: 'Already exists'
    });
    return true;
  }
  
  // Try multiple sources in order of quality
  const sources = [
    {
      name: 'Clearbit',
      url: `https://logo.clearbit.com/${domain}`,
      filename: `${slug}.png`
    },
    {
      name: 'Google Favicon 256',
      url: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      filename: `${slug}.png`
    },
    {
      name: 'Google Favicon 128',
      url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      filename: `${slug}.png`
    }
  ];
  
  // Try each source
  for (const source of sources) {
    try {
      console.log(`  🔄 Trying: ${source.name}...`);
      const filepath = path.join(LOGOS_DIR, source.filename);
      
      await downloadImage(source.url, filepath);
      
      // Check if file is valid (> 1KB)
      const fileStats = fs.statSync(filepath);
      if (fileStats.size > 1000) {
        console.log(`  ✅ SUCCESS via ${source.name} (${(fileStats.size / 1024).toFixed(1)} KB)`);
        stats.succeeded++;
        stats.results.push({
          slug,
          brand,
          status: 'success',
          source: source.name,
          file: source.filename,
          size: fileStats.size
        });
        return true;
      } else {
        // File too small, likely error image
        fs.unlinkSync(filepath);
        console.log(`  ⚠️  File too small, trying next source...`);
      }
    } catch (error) {
      console.log(`  ❌ ${source.name} failed: ${error.message}`);
    }
  }
  
  // All sources failed
  console.log(`  ❌ FAILED: All sources failed for ${brand}`);
  stats.failed++;
  stats.results.push({
    slug,
    brand,
    status: 'failed',
    reason: 'All sources failed'
  });
  return false;
}

/**
 * Main download function
 */
async function downloadAllLogos() {
  console.log('🎰 Casino Logo Downloader - Final Version');
  console.log('==========================================\n');
  
  // Create logos directory
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
  }
  
  // Load casino data
  console.log('📊 Loading casino data...');
  const casinos = JSON.parse(fs.readFileSync(CASINO_DATA_FILE, 'utf8'));
  stats.total = casinos.length;
  
  console.log(`✅ Found ${casinos.length} casinos to process\n`);
  console.log('🚀 Starting downloads...\n');
  
  // Process each casino with delay to avoid rate limiting
  for (let i = 0; i < casinos.length; i++) {
    await downloadCasinoLogo(casinos[i], i, casinos.length);
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(stats, null, 2));
  
  // Print summary
  console.log('\n\n🎯 DOWNLOAD COMPLETE!');
  console.log('===================');
  console.log(`Total casinos: ${stats.total}`);
  console.log(`✅ Succeeded: ${stats.succeeded}`);
  console.log(`⏭️  Skipped (already exist): ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📊 Success rate: ${((stats.succeeded / stats.total) * 100).toFixed(1)}%`);
  console.log(`\n💾 Results saved to: ${path.basename(RESULTS_FILE)}`);
  
  // List failed casinos
  if (stats.failed > 0) {
    console.log('\n❌ Failed casinos:');
    stats.results
      .filter(r => r.status === 'failed')
      .forEach(r => console.log(`   - ${r.brand} (${r.slug})`));
  }
}

// Run the downloader
downloadAllLogos().catch(console.error);
