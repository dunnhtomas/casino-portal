const fs = require('fs');
const path = require('path');

console.log('🔍 Creating smart logo mapping...');

// Create a mapping of available logo files
const logosDir = 'public/images/casinos';
const files = fs.readdirSync(logosDir);

const logoMapping = {};
const slugPatterns = {};

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const nameWithoutExt = path.basename(file, ext);
  
  // Skip responsive and special files for main mapping
  if (!nameWithoutExt.includes('-400w') && !nameWithoutExt.includes('-800w') && !nameWithoutExt.includes('-1200w')) {
    const slug = nameWithoutExt.replace(/-uk-v2$/, '').replace(/-logo$/, '').replace(/-geo-logo$/, '').replace(/-casino$/, '').replace(/-2$/, '');
    
    if (!logoMapping[slug]) {
      logoMapping[slug] = {};
    }
    
    logoMapping[slug][ext.substring(1)] = file;
    
    if (!slugPatterns[slug]) {
      slugPatterns[slug] = nameWithoutExt;
    }
  }
});

const output = {
  logoMapping,
  slugPatterns,
  generatedAt: new Date().toISOString()
};

fs.writeFileSync('src/data/logoMapping.json', JSON.stringify(output, null, 2));
console.log('✅ Logo mapping created: src/data/logoMapping.json');
console.log('📊 Found patterns for', Object.keys(slugPatterns).length, 'casinos');

// Show sample mappings
console.log('\n🔍 Sample mappings:');
Object.keys(slugPatterns).slice(0, 10).forEach(slug => {
  console.log(`  ${slug}: ${slugPatterns[slug]}`);
});

console.log('\n🎯 Special cases found:');
Object.keys(slugPatterns).filter(slug => slugPatterns[slug] !== slug).slice(0, 5).forEach(slug => {
  console.log(`  ${slug} → ${slugPatterns[slug]}`);
});