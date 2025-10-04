/**
 * Casino Domain Verification and Update Script
 * Analyzes scraped Bing results to determine real casino domains
 * Updates casino data files with verified domains
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VERIFICATION_CONFIG = {
  httpTimeout: 10000,
  maxRedirects: 5,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  confidenceThreshold: 0.7,
  backupOriginalFiles: true
};

console.log(`🔍 CASINO DOMAIN VERIFICATION & UPDATE`);
console.log(`═══════════════════════════════════════════════════════\n`);

/**
 * Load scraped Bing results
 */
function loadScrapedResults() {
  const scrapedFile = path.join(__dirname, '../data/bing-casino-domains-scraped.json');
  
  if (!fs.existsSync(scrapedFile)) {
    throw new Error(`Scraped results file not found: ${scrapedFile}. Run the scraper first.`);
  }
  
  const data = JSON.parse(fs.readFileSync(scrapedFile, 'utf8'));
  console.log(`📊 Loaded scraped results for ${data.results.length} casinos`);
  return data;
}

/**
 * Load current casino data
 */
function loadCasinoData() {
  const casinoFile = path.join(__dirname, '../data/casinos.json');
  const casinos = JSON.parse(fs.readFileSync(casinoFile, 'utf8'));
  console.log(`🎰 Loaded current data for ${casinos.length} casino entries`);
  return casinos;
}

/**
 * Extract clean domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * Calculate domain similarity score
 */
function calculateDomainSimilarity(brandName, domain) {
  const brand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domainClean = domain.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Exact match
  if (domainClean.includes(brand)) return 1.0;
  
  // Partial match
  const words = brandName.toLowerCase().split(/\s+/);
  let score = 0;
  for (const word of words) {
    if (word.length > 2 && domainClean.includes(word)) {
      score += 0.3;
    }
  }
  
  // Character similarity
  let commonChars = 0;
  for (let i = 0; i < brand.length && i < domainClean.length; i++) {
    if (brand[i] === domainClean[i]) commonChars++;
  }
  score += (commonChars / Math.max(brand.length, domainClean.length)) * 0.3;
  
  return Math.min(score, 1.0);
}

/**
 * Check if domain is accessible
 */
function checkDomainAccessibility(domain) {
  return new Promise((resolve) => {
    const url = `https://${domain}`;
    
    const req = https.request(url, {
      method: 'HEAD',
      timeout: VERIFICATION_CONFIG.httpTimeout,
      headers: {
        'User-Agent': VERIFICATION_CONFIG.userAgent
      }
    }, (res) => {
      resolve({
        accessible: true,
        statusCode: res.statusCode,
        redirected: res.url !== url,
        finalUrl: res.url || url
      });
    });
    
    req.on('error', () => {
      resolve({
        accessible: false,
        statusCode: null,
        redirected: false,
        finalUrl: url
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        accessible: false,
        statusCode: null,
        redirected: false,
        finalUrl: url
      });
    });
    
    req.end();
  });
}

/**
 * Analyze and rank domains for a casino
 */
async function analyzeCasinoDomains(casino) {
  const { brand, bingResults, currentDomain } = casino;
  
  console.log(`\\n🎯 Analyzing ${brand}:`);
  
  if (!bingResults || bingResults.length === 0) {
    console.log(`  ⚠️  No Bing results found`);
    return {
      recommendedDomain: currentDomain,
      confidence: 0.1,
      reason: 'No search results available',
      alternatives: []
    };
  }
  
  const domainAnalysis = [];
  
  // Analyze each result
  for (const result of bingResults) {
    if (!result.domain) continue;
    
    const domain = extractDomain(result.domain);
    const similarity = calculateDomainSimilarity(brand, domain);
    
    // Check accessibility
    const accessibility = await checkDomainAccessibility(domain);
    
    let confidence = 0;
    
    // Scoring factors
    confidence += similarity * 0.4; // Domain similarity (40%)
    confidence += (result.position === 1 ? 0.3 : result.position === 2 ? 0.2 : 0.1); // Search position (30%)
    confidence += (result.isOfficialLooking ? 0.2 : 0); // Official indicators (20%)
    confidence += (accessibility.accessible ? 0.1 : -0.2); // Accessibility (10%)
    
    domainAnalysis.push({
      domain,
      confidence: Math.max(0, Math.min(1, confidence)),
      similarity,
      position: result.position,
      title: result.title,
      accessible: accessibility.accessible,
      statusCode: accessibility.statusCode,
      isOfficialLooking: result.isOfficialLooking,
      url: result.url
    });
    
    console.log(`  ${domain}: ${(confidence * 100).toFixed(1)}% confidence (pos=${result.position}, sim=${(similarity * 100).toFixed(1)}%, acc=${accessibility.accessible})`);
  }
  
  // Sort by confidence
  domainAnalysis.sort((a, b) => b.confidence - a.confidence);
  
  const recommended = domainAnalysis[0];
  
  if (recommended && recommended.confidence >= VERIFICATION_CONFIG.confidenceThreshold) {
    console.log(`  ✅ Recommended: ${recommended.domain} (${(recommended.confidence * 100).toFixed(1)}% confidence)`);
    return {
      recommendedDomain: recommended.domain,
      confidence: recommended.confidence,
      reason: `High confidence match from Bing search (similarity: ${(recommended.similarity * 100).toFixed(1)}%, position: ${recommended.position})`,
      alternatives: domainAnalysis.slice(1, 3),
      analysis: domainAnalysis
    };
  } else {
    console.log(`  ⚠️  Low confidence, keeping current domain: ${currentDomain}`);
    return {
      recommendedDomain: currentDomain,
      confidence: recommended ? recommended.confidence : 0.1,
      reason: `Low confidence in search results (best: ${recommended ? (recommended.confidence * 100).toFixed(1) : 0}%)`,
      alternatives: domainAnalysis.slice(0, 3),
      analysis: domainAnalysis
    };
  }
}

/**
 * Update casino data with verified domains
 */
function updateCasinoData(casinos, verificationResults) {
  console.log(`\\n📝 Updating casino data...`);
  
  let updatedCount = 0;
  const updateLog = [];
  
  // Create a map for quick lookup
  const verificationMap = new Map();
  verificationResults.forEach(result => {
    verificationMap.set(result.slug, result);
  });
  
  // Update each casino entry
  const updatedCasinos = casinos.map(casino => {
    const verification = verificationMap.get(casino.slug);
    
    if (verification && verification.recommendedDomain) {
      const currentDomain = extractDomain(casino.url);
      const newDomain = verification.recommendedDomain;
      
      if (currentDomain !== newDomain && verification.confidence >= VERIFICATION_CONFIG.confidenceThreshold) {
        const newUrl = casino.url.replace(currentDomain, newDomain);
        
        updateLog.push({
          brand: casino.brand,
          slug: casino.slug,
          oldDomain: currentDomain,
          newDomain: newDomain,
          oldUrl: casino.url,
          newUrl: newUrl,
          confidence: verification.confidence,
          reason: verification.reason
        });
        
        updatedCount++;
        
        return {
          ...casino,
          url: newUrl
        };
      }
    }
    
    return casino;
  });
  
  console.log(`✅ Updated ${updatedCount} casino domains`);
  
  return { updatedCasinos, updateLog };
}

/**
 * Backup original files
 */
function backupFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, `../data/backups/${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup casinos.json
  const casinosFile = path.join(__dirname, '../data/casinos.json');
  const casinosBackup = path.join(backupDir, 'casinos.json');
  fs.copyFileSync(casinosFile, casinosBackup);
  
  console.log(`💾 Backup created: ${backupDir}`);
  return backupDir;
}

/**
 * Main verification function
 */
async function verifyAndUpdateDomains() {
  try {
    // Load data
    const scrapedData = loadScrapedResults();
    const casinos = loadCasinoData();
    
    // Backup original files
    if (VERIFICATION_CONFIG.backupOriginalFiles) {
      backupFiles();
    }
    
    console.log(`\\n🔍 Starting domain verification...`);
    
    const verificationResults = [];
    
    // Process each casino
    for (const casino of scrapedData.results) {
      const analysis = await analyzeCasinoDomains(casino);
      
      verificationResults.push({
        slug: casino.slug,
        brand: casino.brand,
        originalDomain: casino.currentDomain,
        recommendedDomain: analysis.recommendedDomain,
        confidence: analysis.confidence,
        reason: analysis.reason,
        alternatives: analysis.alternatives || [],
        analysis: analysis.analysis || [],
        verifiedAt: new Date().toISOString()
      });
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save verification results
    const verificationFile = path.join(__dirname, '../data/domain-verification-results.json');
    fs.writeFileSync(verificationFile, JSON.stringify({
      verifiedAt: new Date().toISOString(),
      totalCasinos: verificationResults.length,
      config: VERIFICATION_CONFIG,
      results: verificationResults
    }, null, 2));
    
    console.log(`\\n💾 Verification results saved to: ${verificationFile}`);
    
    // Update casino data
    const { updatedCasinos, updateLog } = updateCasinoData(casinos, verificationResults);
    
    // Save updated casino data
    if (updateLog.length > 0) {
      const casinosFile = path.join(__dirname, '../data/casinos.json');
      fs.writeFileSync(casinosFile, JSON.stringify(updatedCasinos, null, 2));
      
      // Save update log
      const updateLogFile = path.join(__dirname, '../data/domain-update-log.json');
      fs.writeFileSync(updateLogFile, JSON.stringify({
        updatedAt: new Date().toISOString(),
        totalUpdates: updateLog.length,
        updates: updateLog
      }, null, 2));
      
      console.log(`\\n📋 Update log saved to: ${updateLogFile}`);
    }
    
    // Generate summary
    const summary = {
      totalCasinos: verificationResults.length,
      highConfidence: verificationResults.filter(r => r.confidence >= VERIFICATION_CONFIG.confidenceThreshold).length,
      domainsUpdated: updateLog.length,
      averageConfidence: (verificationResults.reduce((sum, r) => sum + r.confidence, 0) / verificationResults.length).toFixed(3)
    };
    
    console.log(`\\n✅ VERIFICATION COMPLETE!`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`Total casinos analyzed: ${summary.totalCasinos}`);
    console.log(`High confidence results: ${summary.highConfidence}/${summary.totalCasinos}`);
    console.log(`Domains updated: ${summary.domainsUpdated}`);
    console.log(`Average confidence: ${summary.averageConfidence}`);
    
    if (updateLog.length > 0) {
      console.log(`\\n📊 DOMAIN UPDATES:`);
      updateLog.forEach(update => {
        console.log(`  ${update.brand}: ${update.oldDomain} → ${update.newDomain} (${(update.confidence * 100).toFixed(1)}%)`);
      });
    }
    
    return {
      verificationResults,
      updateLog,
      summary
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

// Run the verification
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyAndUpdateDomains()
    .then((results) => {
      console.log('\\n🎯 Domain verification and update complete!');
      console.log('\\n🔧 Next steps:');
      console.log('1. Review the update log for changes');
      console.log('2. Test the updated domains');
      console.log('3. Update other data files if needed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { verifyAndUpdateDomains };