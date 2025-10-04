import fs from 'fs';

console.log(`🔧 Updating Casino Logos with Brandfetch API`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Production Brandfetch client ID
const BRANDFETCH_CLIENT_ID = '1idIddY-Tpnlw76kxJR';

// Utility functions
function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return null;
  }
}

function generateBrandfetchUrl(domain, options = {}) {
  const {
    clientId = BRANDFETCH_CLIENT_ID,
    type = 'logo',
    theme = 'light',
    fallback = 'transparent',
    width = 128,
    height = 64
  } = options;

  const baseUrl = `https://cdn.brandfetch.io/${domain}`;
  const url = new URL(baseUrl);
  
  url.searchParams.set('c', clientId);
  if (type !== 'logo') url.searchParams.set('type', type);
  if (theme !== 'light') url.searchParams.set('theme', theme);
  if (fallback !== 'brandfetch') url.searchParams.set('fallback', fallback);
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());

  return url.toString();
}

// Load current casino data
const casinosPath = 'data/casinos.json';
const casinosData = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

console.log(`📊 Loaded ${casinosData.length} casinos`);

// Create backup
const backupPath = `data/casinos.json.backup.${Date.now()}`;
fs.writeFileSync(backupPath, JSON.stringify(casinosData, null, 2));
console.log(`💾 Backup created: ${backupPath}`);

// Track updates
const updateStats = {
  total: casinosData.length,
  updated: 0,
  googleFaviconFixed: 0,
  localFallbackUpgraded: 0,
  skipped: 0,
  errors: []
};

// Update casino logos
const updatedCasinos = casinosData.map((casino) => {
  try {
    const originalSource = casino.logo?.source;
    const originalUrl = casino.logo?.url;
    
    // Update problematic logos
    if (originalSource === 'google-favicon-fallback' || originalSource === 'local-fallback') {
      const domain = extractDomain(casino.url);
      
      if (!domain) {
        updateStats.errors.push(`No domain extracted for ${casino.brand} (${casino.url})`);
        updateStats.skipped++;
        return casino;
      }

      // Generate new Brandfetch URL
      const brandfetchUrl = generateBrandfetchUrl(domain, {
        clientId: BRANDFETCH_CLIENT_ID,
        width: 128,
        height: 64,
        fallback: 'transparent'
      });

      // Create updated logo object
      const updatedLogo = {
        url: brandfetchUrl,
        source: 'brandfetch-api',
        domain: domain,
        originalUrl: originalUrl,
        originalSource: originalSource,
        updatedAt: new Date().toISOString(),
        fallbackChain: [
          {
            url: brandfetchUrl,
            source: 'brandfetch-api',
            description: 'Primary Brandfetch logo'
          },
          {
            url: generateBrandfetchUrl(domain, {
              clientId: BRANDFETCH_CLIENT_ID,
              type: 'icon',
              fallback: 'lettermark'
            }),
            source: 'brandfetch-lettermark',
            description: 'Brandfetch lettermark fallback'
          }
        ]
      };

      // Add local fallback if it exists
      if (originalSource === 'local-fallback' && originalUrl) {
        updatedLogo.fallbackChain.push({
          url: originalUrl,
          source: 'local-fallback',
          description: 'Original local fallback image'
        });
      }

      // Add generic fallback
      updatedLogo.fallbackChain.push({
        url: '/images/casinos/default-casino.png',
        source: 'generic-fallback',
        description: 'Generic casino icon'
      });

      updateStats.updated++;
      if (originalSource === 'google-favicon-fallback') {
        updateStats.googleFaviconFixed++;
      } else if (originalSource === 'local-fallback') {
        updateStats.localFallbackUpgraded++;
      }

      console.log(`✅ ${casino.brand}: ${originalSource} → brandfetch-api`);
      console.log(`   ${originalUrl}`);
      console.log(`   → ${brandfetchUrl}`);

      return {
        ...casino,
        logo: updatedLogo
      };
    } else {
      updateStats.skipped++;
      return casino;
    }
  } catch (error) {
    updateStats.errors.push(`Error updating ${casino.brand}: ${error.message}`);
    updateStats.skipped++;
    return casino;
  }
});

// Save updated data
fs.writeFileSync(casinosPath, JSON.stringify(updatedCasinos, null, 2));

console.log(`\n📈 UPDATE SUMMARY`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Total casinos: ${updateStats.total}`);
console.log(`Updated: ${updateStats.updated}`);
console.log(`  • Google favicon fixed: ${updateStats.googleFaviconFixed}`);
console.log(`  • Local fallback upgraded: ${updateStats.localFallbackUpgraded}`);
console.log(`Skipped: ${updateStats.skipped}`);
console.log(`Errors: ${updateStats.errors.length}`);

if (updateStats.errors.length > 0) {
  console.log(`\n⚠️  ERRORS:`);
  updateStats.errors.forEach(error => console.log(`   • ${error}`));
}

console.log(`\n🎯 BRANDFETCH INTEGRATION COMPLETE`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ ${updateStats.updated} casinos now use high-quality Brandfetch logos`);
console.log(`✅ Robust fallback chain implemented for reliability`);
console.log(`✅ Original data backed up to: ${backupPath}`);

console.log(`\n📝 NEXT STEPS:`);
console.log(`1. Get actual Brandfetch client ID from: https://docs.brandfetch.com/`);
console.log(`2. Update BRANDFETCH_CLIENT_ID in brandfetchUtils.ts`);
console.log(`3. Test logo loading in browser`);
console.log(`4. Deploy updated site`);

// Generate summary report
const report = {
  updateDate: new Date().toISOString(),
  stats: updateStats,
  brandfetchConfig: {
    clientId: BRANDFETCH_CLIENT_ID,
    baseUrl: 'https://cdn.brandfetch.io'
  },
  sampleUrls: updatedCasinos
    .filter(c => c.logo?.source === 'brandfetch-api')
    .slice(0, 5)
    .map(c => ({
      brand: c.brand,
      domain: c.logo.domain,
      url: c.logo.url
    }))
};

fs.writeFileSync('reports/brandfetch-update-report.json', JSON.stringify(report, null, 2));
console.log(`📊 Detailed report saved to: reports/brandfetch-update-report.json`);