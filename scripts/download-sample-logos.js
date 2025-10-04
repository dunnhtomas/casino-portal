/**
 * Simple Logo Download Script
 * Downloads casino logos from multiple sources
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
    console.log(`⬇️  Downloading: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    // Check if file is valid (not empty)
    const stats = await fs.stat(filepath);
    if (stats.size > 100) {
      console.log(`✅ Saved: ${path.basename(filepath)} (${stats.size} bytes)`);
      return true;
    } else {
      await fs.unlink(filepath);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

// Download logos for sample casinos
async function downloadSampleLogos() {
  console.log('🚀 Downloading sample casino logos...\n');
  
  await ensureOutputDir();
  
  // Sample casino domains from our smart mapping
  const sampleCasinos = [
    { slug: 'spellwin', domain: 'spellwin.com' },
    { slug: 'winitbet', domain: 'winit.bet' },
    { slug: 'larabet', domain: 'larabet.com' },
    { slug: 'n1bet', domain: 'n1bet.com' },
    { slug: 'rizz', domain: 'rizzcasino.com' }
  ];
  
  const results = { success: 0, failed: 0 };
  
  for (const casino of sampleCasinos) {
    console.log(`\n🎰 Processing: ${casino.slug} (${casino.domain})`);
    
    let logoDownloaded = false;
    
    // Try logo services
    for (const source of LOGO_SOURCES) {
      if (logoDownloaded) break;
      
      const logoUrl = `${source}/${casino.domain}`;
      const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.png`);
      
      const success = await downloadImage(logoUrl, outputPath);
      if (success) {
        logoDownloaded = true;
        results.success++;
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Try favicon as fallback
    if (!logoDownloaded) {
      console.log(`🔄 Trying favicon for ${casino.slug}...`);
      const faviconUrl = `https://${casino.domain}/favicon.ico`;
      const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.ico`);
      
      const success = await downloadImage(faviconUrl, outputPath);
      if (success) {
        logoDownloaded = true;
        results.success++;
      }
    }
    
    // Create placeholder if still no logo
    if (!logoDownloaded) {
      console.log(`🎨 Creating placeholder for ${casino.slug}...`);
      const placeholderSvg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#1f2937"/>
  <text x="100" y="50" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" dy=".3em">
    ${casino.slug.toUpperCase()}
  </text>
</svg>`;
      
      const outputPath = path.join(OUTPUT_DIR, `${casino.slug}.svg`);
      await fs.writeFile(outputPath, placeholderSvg);
      console.log(`🎨 Created placeholder: ${casino.slug}.svg`);
      results.success++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 DOWNLOAD RESULTS:');
  console.log(`✅ Successful: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('\n🎯 Sample logos downloaded! Check public/images/casinos/');
}

downloadSampleLogos()
  .then(() => {
    console.log('\n✅ Logo download complete!');
  })
  .catch(error => {
    console.error('\n💥 Download failed:', error);
  });