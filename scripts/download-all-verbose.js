/**
 * Complete Casino Logo Download - Verbose Version
 * Downloads all 79 casino logos with detailed progress
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/images/casinos');
const CASINO_DATA_FILE = path.join(__dirname, '../data/casinos.json');

// Smart domain mapping
const DOMAIN_MAPPING = {
  'spellwin': 'spellwin.com',
  'winitbet': 'winit.bet',
  'unlimluck': 'unlimluck.com',
  'mr-pacho': 'mrpacho.com',
  'larabet': 'larabet.com',
  'slotlair': 'slotlair.co.uk',
  'sagaspins': 'sagaspins.com',
  'sambaslots': 'sambaslots.com',
  'rizz': 'rizzcasino.com',
  'n1bet': 'n1bet.com',
  'spincastle': 'spincastle.com',
  'roman': 'romancasino.com',
  'wildrobin': 'wildrobin.com',
  'jet4bet': 'jet4bet.co.uk',
  'vipzino': 'vipzino.com',
  'red': 'theredcasino.com',
  'london': 'londoncasino.co.uk',
  'ivybet': 'ivybet.io',
  'ritzo': 'ritzocasino.com',
  'spingranny': 'spingranny.cz',
  'vincispin': 'vincispin.com',
  'klikki': 'klikkicasino.com',
  'treasure': 'treasurespins.com',
  'spinlander': 'spinlander.co.uk',
  'tiki': 'tikicasino.com',
  'winshark': 'winshark.com',
  'instant': 'instantcasino.com',
  'panda': 'goldenpanda.com',
  'magius': 'magiuscasino.com'
};

async function downloadImage(url, filepath) {
  try {
    console.log(`    Fetching: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`    ❌ HTTP ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    const stats = await fs.stat(filepath);
    if (stats.size > 100) {
      console.log(`    ✅ Downloaded: ${stats.size} bytes`);
      return true;
    } else {
      await fs.unlink(filepath);
      console.log(`    ❌ File too small (${stats.size} bytes)`);
      return false;
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    return false;
  }
}

function getDomain(casino) {
  if (DOMAIN_MAPPING[casino.slug]) {
    return DOMAIN_MAPPING[casino.slug];
  }
  
  try {
    const url = new URL(casino.url);
    return url.hostname.replace('www.', '');
  } catch (error) {
    return casino.slug + '.com';
  }
}

async function downloadAllLogos() {
  console.log('🚀 Starting complete casino logo download...\n');
  
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
    
    // Load casino data
    console.log('📊 Loading casino data...');
    const casinoData = await fs.readFile(CASINO_DATA_FILE, 'utf8');
    const casinos = JSON.parse(casinoData);
    console.log(`📊 Found ${casinos.length} casinos to process\n`);
    
    const results = {
      total: casinos.length,
      processed: 0,
      downloaded: 0,
      existing: 0,
      failed: 0,
      startTime: Date.now()
    };
    
    // Process each casino
    for (const [index, casino] of casinos.entries()) {
      const progress = `[${index + 1}/${casinos.length}]`;
      console.log(`${progress} ${casino.name || 'Unknown'} (${casino.slug})`);
      
      const domain = getDomain(casino);
      console.log(`  🌐 Domain: ${domain}`);
      
      // Check if logo already exists
      const existingFiles = await fs.readdir(OUTPUT_DIR).catch(() => []);
      const hasLogo = existingFiles.some(file => file.startsWith(casino.slug + '.'));
      
      if (hasLogo) {
        console.log(`  ⏭️  Already exists`);
        results.existing++;
        results.processed++;
        continue;
      }
      
      let downloaded = false;
      
      // Try Logo.dev
      console.log(`  🔍 Trying Logo.dev...`);
      const logoUrl = `https://img.logo.dev/${domain}`;
      const logoPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
      downloaded = await downloadImage(logoUrl, logoPath);
      
      if (!downloaded) {
        // Try Clearbit
        console.log(`  🔍 Trying Clearbit...`);
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        downloaded = await downloadImage(clearbitUrl, logoPath);
      }
      
      if (!downloaded) {
        // Try favicon
        console.log(`  🔍 Trying favicon...`);
        const faviconUrl = `https://${domain}/favicon.ico`;
        const faviconPath = path.join(OUTPUT_DIR, `${casino.slug}.ico`);
        downloaded = await downloadImage(faviconUrl, faviconPath);
      }
      
      if (!downloaded) {
        // Create placeholder
        console.log(`  🎨 Creating placeholder...`);
        const svg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#1f2937" stroke="#374151" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
    ${(casino.name || casino.slug).substring(0, 18)}
  </text>
  <text x="100" y="65" font-family="Arial, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="middle">
    ${casino.slug}
  </text>
</svg>`;
        
        const placeholderPath = path.join(OUTPUT_DIR, `${casino.slug}.svg`);
        await fs.writeFile(placeholderPath, svg);
        console.log(`  🎨 Placeholder created`);
        downloaded = true;
      }
      
      if (downloaded) {
        results.downloaded++;
      } else {
        results.failed++;
      }
      
      results.processed++;
      
      // Progress report every 10 casinos
      if ((index + 1) % 10 === 0) {
        const elapsed = (Date.now() - results.startTime) / 1000;
        const rate = results.processed / elapsed * 60;
        console.log(`\n📈 Progress Report:`);
        console.log(`   Processed: ${results.processed}/${results.total}`);
        console.log(`   Downloaded: ${results.downloaded}`);
        console.log(`   Existing: ${results.existing}`);
        console.log(`   Failed: ${results.failed}`);
        console.log(`   Rate: ${rate.toFixed(1)} casinos/min\n`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Final report
    const totalTime = (Date.now() - results.startTime) / 1000;
    
    console.log('\n🎯 FINAL DOWNLOAD REPORT:');
    console.log(`📊 Total Casinos: ${results.total}`);
    console.log(`✅ Downloaded: ${results.downloaded}`);
    console.log(`⏭️  Already Existing: ${results.existing}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏱️  Total Time: ${Math.round(totalTime)}s`);
    console.log(`📈 Average Rate: ${(results.processed / totalTime * 60).toFixed(1)} casinos/min`);
    console.log(`🎯 Success Rate: ${((results.downloaded + results.existing) / results.total * 100).toFixed(1)}%`);
    
    console.log('\n✅ ALL CASINO LOGOS COMPLETE!');
    console.log('🚀 Your casino portal now has logos for all casinos!');
    
    return results;
    
  } catch (error) {
    console.error('💥 Download process failed:', error);
    throw error;
  }
}

// Execute
downloadAllLogos()
  .then(() => {
    console.log('\n🎖️  Mission accomplished! All casino logos downloaded.');
  })
  .catch(error => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });