const fs = require('fs');
const path = require('path');

/**
 * Fix casino logo paths from external CDN URLs to local paths
 * This script updates casinos.json to use local logo files from public/images/casinos/
 */

const CASINOS_JSON_PATH = path.join(__dirname, 'data', 'casinos.json');
const LOGOS_DIR = path.join(__dirname, 'public', 'images', 'casinos');
const BACKUP_PATH = path.join(__dirname, 'data', 'casinos.json.backup');

// Read casinos data
console.log('📖 Reading casinos.json...');
const casinosData = JSON.parse(fs.readFileSync(CASINOS_JSON_PATH, 'utf8'));
console.log(`✅ Loaded ${casinosData.length} casinos`);

// Get list of available logo files
console.log('\n📂 Scanning logo files...');
const logoFiles = fs.readdirSync(LOGOS_DIR);
const availableLogos = new Set();

// Build set of available logo slugs (extract base names without responsive suffixes)
logoFiles.forEach(file => {
  // Extract slug from filenames like "spellwin-1200w.avif" or "spellwin.png"
  // Pattern handles: "slug.png", "slug-800w.webp", "casino-name-1200w.avif"
  const match = file.match(/^(.+?)(?:-\d+w)?\.(?:png|avif|webp)$/i);
  if (match) {
    availableLogos.add(match[1]);
  }
});

console.log(`✅ Found ${availableLogos.size} unique logo slugs`);

// Create backup
console.log('\n💾 Creating backup...');
fs.copyFileSync(CASINOS_JSON_PATH, BACKUP_PATH);
console.log(`✅ Backup created: ${BACKUP_PATH}`);

// Update logo paths
console.log('\n🔧 Updating logo paths...');
let updatedCount = 0;
let skippedCount = 0;
let missingCount = 0;

const missingLogos = [];

casinosData.forEach(casino => {
  const { slug, brand, logo } = casino;
  
  // Check if local logo exists for this slug
  if (!availableLogos.has(slug)) {
    console.log(`⚠️  No local logo found for: ${slug} (${brand})`);
    missingLogos.push({ slug, brand });
    missingCount++;
    return;
  }
  
  // Check if already using local path
  if (logo && logo.url && logo.url.startsWith('/images/casinos/')) {
    skippedCount++;
    return;
  }
  
  // Determine the base format (prefer webp for better browser support)
  const hasWebp = logoFiles.some(f => f.startsWith(`${slug}-`) && f.endsWith('.webp'));
  const hasPng = logoFiles.some(f => f === `${slug}.png`);
  
  // Use the most common format as base URL
  let baseUrl;
  if (hasWebp) {
    baseUrl = `/images/casinos/${slug}-800w.webp`;
  } else if (hasPng) {
    baseUrl = `/images/casinos/${slug}.png`;
  } else {
    // Fallback to standard pattern even if we don't see the file
    baseUrl = `/images/casinos/${slug}.png`;
  }
  
  // Preserve existing logo object structure
  const updatedLogo = {
    url: baseUrl,
    source: 'local',
    slug: slug,
    ...(logo.domain && { domain: logo.domain }),
    updatedAt: new Date().toISOString(),
    fallbackChain: [
      {
        url: baseUrl,
        source: 'local-primary',
        description: 'Local optimized logo'
      },
      ...(logo.fallbackChain ? logo.fallbackChain.slice(-1) : [
        {
          url: '/images/casinos/default-casino.png',
          source: 'generic-fallback',
          description: 'Generic casino icon'
        }
      ])
    ]
  };
  
  // Preserve original URL for reference
  if (logo && logo.url) {
    updatedLogo.originalUrl = logo.url;
    updatedLogo.originalSource = logo.source || 'unknown';
  }
  
  casino.logo = updatedLogo;
  updatedCount++;
});

console.log('\n📊 Update Summary:');
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped (already local): ${skippedCount}`);
console.log(`   ⚠️  Missing logos: ${missingCount}`);

if (missingLogos.length > 0) {
  console.log('\n⚠️  Casinos without local logos:');
  missingLogos.forEach(({ slug, brand }) => {
    console.log(`   - ${brand} (${slug})`);
  });
}

// Write updated data
console.log('\n💾 Writing updated casinos.json...');
fs.writeFileSync(
  CASINOS_JSON_PATH, 
  JSON.stringify(casinosData, null, 2),
  'utf8'
);
console.log('✅ casinos.json updated successfully!');

console.log('\n✨ Done! Logo paths fixed.');
console.log(`\n📝 To restore from backup: cp ${BACKUP_PATH} ${CASINOS_JSON_PATH}`);
