/**
 * One-Time Logo Download Script
 * Downloads all casino logos and stores them locally
 * Eliminates dependency on external APIs
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVerifiedCasinoDomain } from '../src/config/CasinoDomainMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOGO_SOURCES = [
  'https://img.logo.dev',
  'https://logo.clearbit.com',
  'https://www.google.com/s2/favicons?domain={domain}&sz=128'
];

const OUTPUT_DIR = path.join(__dirname, '../public/images/casinos');
const CASINO_DATA_FILE = path.join(__dirname, '../data/casinos.json');

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.log(`📁 Output directory exists: ${OUTPUT_DIR}`);
  }
}

// Download image from URL
async function downloadImage(url, filepath) {
  try {
    console.log(`⬇️  Downloading: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    console.log(`✅ Saved: ${filepath}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to download ${url}: ${error.message}`);
    return false;
  }
}

// Get logo from multiple sources
async function downloadLogoFromSources(domain, slug) {
  const extensions = ['png', 'jpg', 'ico'];
  
  for (const sourceTemplate of LOGO_SOURCES) {
    for (const ext of extensions) {
      try {
        let logoUrl;
        
        if (sourceTemplate.includes('{domain}')) {
          logoUrl = sourceTemplate.replace('{domain}', domain);
        } else {
          logoUrl = `${sourceTemplate}/${domain}`;
        }
        
        const outputPath = path.join(OUTPUT_DIR, `${slug}.${ext}`);
        const success = await downloadImage(logoUrl, outputPath);
        
        if (success) {
          // Verify the file is valid (not empty)
          const stats = await fs.stat(outputPath);
          if (stats.size > 100) { // Minimum 100 bytes for a valid image
            console.log(`🎯 Successfully downloaded logo for ${slug} from ${sourceTemplate}`);
            return outputPath;
          } else {
            await fs.unlink(outputPath); // Remove empty file
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`⚠️  Source ${sourceTemplate} failed for ${domain}: ${error.message}`);
      }
    }
  }
  
  return null;
}

// Download favicon as fallback
async function downloadFavicon(domain, slug) {
  const faviconUrls = [
    `https://${domain}/favicon.ico`,
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/android-chrome-192x192.png`,
    `https://${domain}/favicon.png`
  ];
  
  for (const faviconUrl of faviconUrls) {
    try {
      const ext = path.extname(faviconUrl).slice(1) || 'ico';
      const outputPath = path.join(OUTPUT_DIR, `${slug}.${ext}`);
      
      const success = await downloadImage(faviconUrl, outputPath);
      if (success) {
        const stats = await fs.stat(outputPath);
        if (stats.size > 100) {
          console.log(`🌐 Downloaded favicon for ${slug} from ${domain}`);
          return outputPath;
        } else {
          await fs.unlink(outputPath);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`⚠️  Favicon download failed for ${domain}: ${error.message}`);
    }
  }
  
  return null;
}

// Create placeholder image if no logo found
async function createPlaceholder(slug) {
  const placeholderSvg = `
<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#1f2937"/>
  <text x="100" y="50" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" dy=".3em">
    ${slug.toUpperCase()}
  </text>
</svg>`.trim();
  
  const outputPath = path.join(OUTPUT_DIR, `${slug}.svg`);
  await fs.writeFile(outputPath, placeholderSvg);
  console.log(`🎨 Created placeholder for ${slug}`);
  return outputPath;
}

// Main download function
async function downloadAllLogos() {
  console.log('🚀 Starting one-time logo download process...\n');
  
  await ensureOutputDir();
  
  // Load casino data
  let casinos;
  try {
    const casinoData = await fs.readFile(CASINO_DATA_FILE, 'utf8');
    casinos = JSON.parse(casinoData);
    console.log(`📊 Loaded ${casinos.length} casinos from data file\n`);
  } catch (error) {
    console.error(`❌ Failed to load casino data: ${error.message}`);
    return;
  }
  
  const results = {
    successful: [],
    failed: [],
    total: casinos.length
  };
  
  // Process each casino
  for (const [index, casino] of casinos.entries()) {
    console.log(`\n[${index + 1}/${casinos.length}] Processing: ${casino.name} (${casino.slug})`);
    
    try {
      // Get verified domain
      const url = new URL(casino.url);
      const fallbackDomain = url.hostname.replace('www.', '');
      const verifiedDomain = getVerifiedCasinoDomain(casino.slug, fallbackDomain);
      
      console.log(`🔍 Using domain: ${verifiedDomain}`);
      
      // Try to download from logo services
      let logoPath = await downloadLogoFromSources(verifiedDomain, casino.slug);
      
      // If no logo found, try favicon
      if (!logoPath) {
        console.log(`🔄 Trying favicon for ${casino.slug}...`);
        logoPath = await downloadFavicon(verifiedDomain, casino.slug);
      }
      
      // If still no logo, create placeholder
      if (!logoPath) {
        console.log(`🎨 Creating placeholder for ${casino.slug}...`);
        logoPath = await createPlaceholder(casino.slug);
      }
      
      if (logoPath) {
        results.successful.push({
          slug: casino.slug,
          name: casino.name,
          domain: verifiedDomain,
          logoPath: path.basename(logoPath)
        });
        console.log(`✅ Logo ready for ${casino.slug}`);
      } else {
        results.failed.push({
          slug: casino.slug,
          name: casino.name,
          domain: verifiedDomain
        });
        console.log(`❌ Failed to get logo for ${casino.slug}`);
      }
      
    } catch (error) {
      console.error(`💥 Error processing ${casino.slug}: ${error.message}`);
      results.failed.push({
        slug: casino.slug,
        name: casino.name,
        error: error.message
      });
    }
    
    // Rate limiting between casinos
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Generate report
  console.log('\n📊 LOGO DOWNLOAD REPORT:');
  console.log(`Total Casinos: ${results.total}`);
  console.log(`Successful Downloads: ${results.successful.length}`);
  console.log(`Failed Downloads: ${results.failed.length}`);
  console.log(`Success Rate: ${((results.successful.length / results.total) * 100).toFixed(1)}%`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../reports/logo-download-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  if (results.successful.length > 0) {
    console.log('\n✅ SUCCESSFUL DOWNLOADS:');
    results.successful.forEach(r => {
      console.log(`  ${r.slug}: ${r.logoPath} (${r.domain})`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED DOWNLOADS:');
    results.failed.forEach(r => {
      console.log(`  ${r.slug}: ${r.domain} ${r.error ? `(${r.error})` : ''}`);
    });
  }
  
  console.log('\n🎯 Logo download process complete!');
  console.log('🔧 Next step: Update getBrandLogo.ts to serve local images');
  
  return results;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllLogos()
    .then(() => {
      console.log('\n✅ All done! Your casino logos are now local.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Download process failed:', error);
      process.exit(1);
    });
}

export { downloadAllLogos };