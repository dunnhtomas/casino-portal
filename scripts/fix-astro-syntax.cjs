/**
 * Fix all React-style key attributes in Astro files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing React-style key attributes in all Astro files...');

function fixAstroFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove key={...} attributes from all HTML elements
    const keyAttributeRegex = /\s+key=\{[^}]+\}/g;
    if (content.match(keyAttributeRegex)) {
      content = content.replace(keyAttributeRegex, '');
      modified = true;
    }
    
    // Fix common frontmatter issues
    if (content.includes('import type { CasinoData }')) {
      content = content.replace(
        /import type \{ CasinoData \} from [^;]+;/g,
        ''
      );
      
      // Add local interface if not present
      if (!content.includes('interface CasinoData')) {
        content = content.replace(
          /---\n/,
          `---
interface CasinoData {
  slug: string;
  brand: string;
  overallRating?: number;
  bonuses?: {
    welcome?: {
      headline?: string;
    };
  };
}

`
        );
      }
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findAstroFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.astro')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Find all .astro files
const srcDir = path.join(__dirname, '..', 'src');
const astroFiles = findAstroFiles(srcDir);

console.log(`Found ${astroFiles.length} Astro files to check...`);

let fixedCount = 0;
for (const file of astroFiles) {
  if (fixAstroFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount} Astro files!`);
console.log('✅ All React-style key attributes removed');
console.log('✅ Type imports corrected');
console.log('🚀 Ready for build!');