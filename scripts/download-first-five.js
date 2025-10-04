/**
 * Casino Logo Download - Working Version
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
  'larabet': 'larabet.com',
  'n1bet': 'n1bet.com',
  'rizz': 'rizzcasino.com'
};

async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    const stats = await fs.stat(filepath);
    if (stats.size > 100) {
      console.log(`✅ ${path.basename(filepath)} (${stats.size} bytes)`);
      return true;
    } else {
      await fs.unlink(filepath);
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function processFirstFiveCasinos() {
  console.log('🚀 Processing first 5 casinos...\n');
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Load casino data
  const casinoData = await fs.readFile(CASINO_DATA_FILE, 'utf8');
  const casinos = JSON.parse(casinoData);
  
  console.log(`📊 Total casinos available: ${casinos.length}`);
  console.log('Processing first 5...\n');
  
  let successful = 0;
  
  for (let i = 0; i < Math.min(5, casinos.length); i++) {
    const casino = casinos[i];
    console.log(`[${i + 1}/5] ${casino.name} (${casino.slug})`);
    
    // Get domain
    const domain = DOMAIN_MAPPING[casino.slug] || 
                  new URL(casino.url).hostname.replace('www.', '');
    
    console.log(`  Domain: ${domain}`);
    
    // Check if already exists
    const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
    try {
      await fs.access(outputPath);
      console.log(`  ⏭️  Already exists`);
      successful++;
      continue;
    } catch {}
    
    // Try Logo.dev
    console.log(`  ⬇️  Trying Logo.dev...`);
    const logoUrl = `https://img.logo.dev/${domain}`;
    const logoSuccess = await downloadImage(logoUrl, outputPath);
    
    if (logoSuccess) {
      successful++;
    } else {
      // Try favicon
      console.log(`  🔄 Trying favicon...`);
      const faviconUrl = `https://${domain}/favicon.ico`;
      const faviconPath = path.join(OUTPUT_DIR, `${casino.slug}.ico`);
      const faviconSuccess = await downloadImage(faviconUrl, faviconPath);
      
      if (faviconSuccess) {
        successful++;
      } else {
        // Create placeholder
        console.log(`  🎨 Creating placeholder...`);
        const svg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#1f2937"/>
  <text x="100" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">
    ${casino.name.substring(0, 15)}
  </text>
</svg>`;
        await fs.writeFile(path.join(OUTPUT_DIR, `${casino.slug}.svg`), svg);
        console.log(`  🎨 Placeholder created`);
        successful++;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('');
  }
  
  console.log(`📊 Results: ${successful}/5 casinos processed`);
  console.log('✅ First batch complete!');
}

processFirstFiveCasinos()
  .catch(error => {
    console.error('❌ Error:', error);
  });