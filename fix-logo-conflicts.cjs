const fs = require('fs');
const path = require('path');

// Read the casinos JSON
const casinosPath = path.join(__dirname, 'data', 'casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Get list of PNG files
const imagesDir = path.join(__dirname, 'public', 'images', 'casinos');
const pngFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.png'))
  .map(file => file.replace('.png', ''));

console.log(`Found ${pngFiles.length} PNG files:`, pngFiles);

let updatedCount = 0;
let removedCount = 0;

// Update casinos
casinos.forEach(casino => {
  const slug = casino.slug;
  
  // Check if this casino has a PNG file
  if (pngFiles.includes(slug)) {
    // Update the logo to point to the PNG file
    casino.logo = {
      url: `/images/casinos/${slug}.png`,
      source: "local",
      slug: slug,
      domain: casino.url ? casino.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '',
      updatedAt: new Date().toISOString(),
      fallbackChain: [
        {
          url: `/images/casinos/${slug}.png`,
          source: "local-primary",
          description: "Local PNG logo"
        }
      ]
    };
    updatedCount++;
    console.log(`✓ Updated ${slug} to use PNG logo`);
  } else if (casino.logo && casino.logo.url && casino.logo.url.includes('.webp')) {
    // Remove webp references for casinos that don't have PNG files
    delete casino.logo;
    removedCount++;
    console.log(`✗ Removed webp logo reference for ${slug} (no PNG available)`);
  }
});

// Save updated JSON
fs.writeFileSync(casinosPath, JSON.stringify(casinos, null, 2), 'utf8');

console.log(`\n✅ Done!`);
console.log(`Updated ${updatedCount} casinos to use PNG logos`);
console.log(`Removed ${removedCount} webp references without PNG files`);
console.log(`Total casinos: ${casinos.length}`);
