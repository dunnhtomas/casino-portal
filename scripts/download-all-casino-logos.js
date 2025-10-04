/**
 * Complete Casino Logo Download Script
 * Downloads all casino logos from the casino data file
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOGO_SOURCES = [
  'https://img.logo.dev',
  'https://logo.clearbit.com'
];

const OUTPUT_DIR = path.join(__dirname, '../public/images/casinos');
const CASINO_DATA_FILE = path.join(__dirname, '../data/casinos.json');

// Smart domain mapping for better logo discovery
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
  'vipzino': 'vipzino.com'
};

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory ready: ${OUTPUT_DIR}`);
  } catch (error) {
    console.log(`📁 Output directory exists`);
  }
}

// Download image from URL
async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    // Check if file is valid (not empty)
    const stats = await fs.stat(filepath);
    if (stats.size > 100) {
      console.log(`✅ Downloaded: ${path.basename(filepath)} (${stats.size} bytes)`);
      return true;
    } else {
      await fs.unlink(filepath);
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Get domain for casino
function getCasinoDomain(slug, casinoUrl) {
  // Use smart mapping if available
  if (DOMAIN_MAPPING[slug]) {
    return DOMAIN_MAPPING[slug];
  }
  
  // Extract from URL
  try {
    const url = new URL(casinoUrl);
    return url.hostname.replace('www.', '');
  } catch (error) {
    return slug + '.com'; // fallback
  }
}

// Download logo from multiple sources
async function downloadCasinoLogo(casino) {
  const domain = getCasinoDomain(casino.slug, casino.url);
  console.log(`\n🎰 ${casino.name} (${casino.slug}) → ${domain}`);
  
  // Check if logo already exists
  const existingFiles = await fs.readdir(OUTPUT_DIR).catch(() => []);
  const hasLogo = existingFiles.some(file => file.startsWith(casino.slug + '.'));
  
  if (hasLogo) {
    console.log(`⏭️  Logo already exists for ${casino.slug}`);
    return true;
  }
  
  // Try logo services
  for (const source of LOGO_SOURCES) {
    const logoUrl = `${source}/${domain}`;
    const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
    
    console.log(`⬇️  Trying: ${source}`);
    const success = await downloadImage(logoUrl, outputPath);
    if (success) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Try favicon as fallback
  console.log(`🔄 Trying favicon...`);
  const faviconUrl = `https://${domain}/favicon.ico`;
  const faviconPath = path.join(OUTPUT_DIR, `${casino.slug}.ico`);
  
  const faviconSuccess = await downloadImage(faviconUrl, faviconPath);
  if (faviconSuccess) {
    return true;
  }
  
  // Create placeholder
  console.log(`🎨 Creating placeholder...`);
  const placeholderSvg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#1f2937"/>
  <text x="100" y="50" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dy=".3em">
    ${casino.name.substring(0, 20)}
  </text>
</svg>`;
  
  const placeholderPath = path.join(OUTPUT_DIR, `${casino.slug}.svg`);
  await fs.writeFile(placeholderPath, placeholderSvg);
  console.log(`🎨 Created placeholder for ${casino.slug}`);
  
  return true;
}

// Main download function
async function downloadAllCasinoLogos() {
  console.log('🚀 Starting complete casino logo download...\n');
  
  await ensureOutputDir();
  
  // Load casino data
  let casinos;
  try {
    const casinoData = await fs.readFile(CASINO_DATA_FILE, 'utf8');
    casinos = JSON.parse(casinoData);
    console.log(`📊 Found ${casinos.length} casinos to process\n`);
  } catch (error) {
    console.error(`❌ Failed to load casino data: ${error.message}`);
    return;
  }
  
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    startTime: Date.now()
  };
  
  // Process each casino
  for (const [index, casino] of casinos.entries()) {
    console.log(`[${index + 1}/${casinos.length}]`);
    
    try {
      const success = await downloadCasinoLogo(casino);
      results.processed++;
      
      if (success) {
        results.successful++;
      } else {
        results.failed++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Progress report every 10 casinos
      if ((index + 1) % 10 === 0) {
        const elapsed = Math.round((Date.now() - results.startTime) / 1000);
        const rate = results.processed / elapsed * 60;
        console.log(`\n📈 Progress: ${results.processed}/${casinos.length} (${rate.toFixed(1)} casinos/min)`);
      }
      
    } catch (error) {
      console.error(`💥 Error processing ${casino.slug}: ${error.message}`);
      results.failed++;
      results.processed++;
    }
  }
  
  // Final report
  const totalTime = Math.round((Date.now() - results.startTime) / 1000);
  
  console.log('\n🎯 COMPLETE LOGO DOWNLOAD REPORT:');
  console.log(`Total Casinos: ${casinos.length}`);
  console.log(`Processed: ${results.processed}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.successful / results.processed) * 100).toFixed(1)}%`);
  console.log(`Total Time: ${totalTime}s`);
  console.log(`Average Rate: ${(results.processed / totalTime * 60).toFixed(1)} casinos/min`);
  
  console.log('\n✅ All casino logos processed!');
  console.log('🌐 Your casino portal now serves local logos for fast, reliable display.');
  
  return results;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllCasinoLogos()
    .then(() => {
      console.log('\n🎖️  Mission accomplished! Casino logos are now local and fast.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Download process failed:', error);
      process.exit(1);
    });
}

export { downloadAllCasinoLogos };