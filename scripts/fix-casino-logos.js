#!/usr/bin/env node

/**
 * Logo Validation and Fixing Script
 * Checks casino logo URLs and replaces broken ones with fallbacks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASINO_DATA_PATH = path.join(__dirname, '../data/casinos.json');
const TIMEOUT_MS = 5000; // 5 second timeout for URL checks

/**
 * Check if a URL is accessible
 */
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate fallback logo URL
 */
function generateFallbackLogo(casino) {
  // Try different URL formats for the casino domain
  const domain = casino.url ? new URL(casino.url).hostname : `${casino.slug}.com`;
  
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * Process and fix casino logos
 */
async function fixCasinoLogos() {
  console.log('🔍 Loading casino data...');
  
  if (!fs.existsSync(CASINO_DATA_PATH)) {
    console.error(`❌ Casino data file not found: ${CASINO_DATA_PATH}`);
    process.exit(1);
  }
  
  const casinos = JSON.parse(fs.readFileSync(CASINO_DATA_PATH, 'utf8'));
  console.log(`📊 Found ${casinos.length} casinos to check`);
  
  let checkedCount = 0;
  let fixedCount = 0;
  let failedCount = 0;
  
  for (const casino of casinos) {
    if (!casino.logo || !casino.logo.url) {
      console.log(`⚠️  ${casino.brand || casino.slug}: No logo URL found`);
      continue;
    }
    
    checkedCount++;
    const logoUrl = casino.logo.url;
    
    // Only check external URLs (Google favicon URLs)
    if (!logoUrl.includes('google.com') && !logoUrl.includes('gstatic.com')) {
      continue;
    }
    
    console.log(`🔍 Checking ${casino.brand || casino.slug}...`);
    
    const isWorking = await checkUrl(logoUrl);
    
    if (!isWorking) {
      console.log(`❌ ${casino.brand || casino.slug}: Logo URL failed - ${logoUrl}`);
      
      // Try to generate a better fallback
      const fallbackUrl = generateFallbackLogo(casino);
      const fallbackWorks = await checkUrl(fallbackUrl);
      
      if (fallbackWorks && fallbackUrl !== logoUrl) {
        console.log(`✅ ${casino.brand || casino.slug}: Using fallback - ${fallbackUrl}`);
        casino.logo.url = fallbackUrl;
        casino.logo.source = 'google-favicon-fallback-fixed';
        fixedCount++;
      } else {
        console.log(`🔄 ${casino.brand || casino.slug}: Will use local fallback`);
        // Mark for local fallback - the frontend will handle this
        casino.logo.url = `/images/casinos/${casino.slug}.png`;
        casino.logo.source = 'local-fallback';
        failedCount++;
      }
    } else {
      console.log(`✅ ${casino.brand || casino.slug}: Logo URL works`);
    }
    
    // Add a small delay to be respectful to Google's servers
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📈 Summary:');
  console.log(`  Checked: ${checkedCount} casinos`);
  console.log(`  Fixed: ${fixedCount} logos`);
  console.log(`  Failed: ${failedCount} logos (will use local fallbacks)`);
  
  if (fixedCount > 0 || failedCount > 0) {
    // Create backup
    const backupPath = `${CASINO_DATA_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(CASINO_DATA_PATH, backupPath);
    console.log(`💾 Backup created: ${backupPath}`);
    
    // Save updated data
    fs.writeFileSync(CASINO_DATA_PATH, JSON.stringify(casinos, null, 2));
    console.log('✅ Updated casino data saved');
  } else {
    console.log('ℹ️  No changes needed');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Casino Logo Validator & Fixer\n');
  
  try {
    await fixCasinoLogos();
    console.log('\n🎉 Logo validation complete!');
  } catch (error) {
    console.error('\n❌ Error during logo validation:', error.message);
    process.exit(1);
  }
}

main();