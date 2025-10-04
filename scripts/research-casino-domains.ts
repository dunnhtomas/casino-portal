/**
 * Casino Domain Research Script
 * Uses Playwright to visit each casino URL and discover the actual domain
 * by following redirects and checking the final landing page
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Casino {
  slug: string;
  brand: string;
  url: string;
  originalBrand?: string;
}

interface DomainMapping {
  slug: string;
  brand: string;
  originalUrl: string;
  actualDomain: string;
  finalUrl: string;
  redirectChain: string[];
}

async function researchCasinoDomain(casino: Casino): Promise<DomainMapping> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const redirectChain: string[] = [];
  let actualDomain = '';
  let finalUrl = '';
  
  try {
    // Track redirects
    page.on('response', response => {
      const url = response.url();
      if (response.status() >= 300 && response.status() < 400) {
        redirectChain.push(url);
      }
    });
    
    // Visit the casino URL with a timeout
    console.log(`\n🔍 Researching: ${casino.brand} (${casino.slug})`);
    console.log(`   Original URL: ${casino.url}`);
    
    const response = await page.goto(casino.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Get final URL after all redirects
    finalUrl = page.url();
    const finalUrlObj = new URL(finalUrl);
    actualDomain = finalUrlObj.hostname.replace('www.', '');
    
    console.log(`   ✅ Final URL: ${finalUrl}`);
    console.log(`   🎯 Actual Domain: ${actualDomain}`);
    
    if (redirectChain.length > 0) {
      console.log(`   🔄 Redirects: ${redirectChain.length}`);
    }
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    // Fallback to original URL if we can't reach the site
    try {
      const urlObj = new URL(casino.url);
      actualDomain = urlObj.hostname.replace('www.', '');
      finalUrl = casino.url;
    } catch {
      actualDomain = 'unknown';
      finalUrl = casino.url;
    }
  } finally {
    await browser.close();
  }
  
  return {
    slug: casino.slug,
    brand: casino.brand,
    originalUrl: casino.url,
    actualDomain,
    finalUrl,
    redirectChain
  };
}

async function main() {
  console.log('🚀 Starting Casino Domain Research...\n');
  console.log('=' .repeat(80));
  
  // Load casino data
  const dataPath = path.join(__dirname, '../data/casino-brands-clean.json');
  const casinos: Casino[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  console.log(`📊 Found ${casinos.length} casinos to research\n`);
  
  const results: DomainMapping[] = [];
  const domainMap: Record<string, string> = {};
  
  // Research each casino (with delay to avoid rate limiting)
  for (let i = 0; i < casinos.length; i++) {
    const casino = casinos[i];
    
    try {
      const result = await researchCasinoDomain(casino);
      results.push(result);
      
      // Only add to mapping if domain is different from URL
      const originalDomain = new URL(casino.url).hostname.replace('www.', '');
      if (result.actualDomain !== 'unknown' && result.actualDomain !== originalDomain) {
        domainMap[casino.slug] = result.actualDomain;
        console.log(`   📝 Domain mapping needed: ${originalDomain} → ${result.actualDomain}`);
      }
      
      // Add delay between requests (2 seconds)
      if (i < casinos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to research ${casino.slug}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Research complete! Processed ${results.length} casinos`);
  console.log(`📝 Found ${Object.keys(domainMap).length} domain mappings needed\n`);
  
  // Save detailed results
  const resultsPath = path.join(__dirname, '../data/casino-domain-research.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Saved detailed results to: ${resultsPath}`);
  
  // Generate TypeScript domain mapping code
  const mappingCode = generateMappingCode(domainMap);
  const mappingPath = path.join(__dirname, '../src/config/CasinoDomainMapping.ts');
  fs.writeFileSync(mappingPath, mappingCode);
  console.log(`💾 Updated domain mapping: ${mappingPath}`);
  
  // Generate summary report
  const reportPath = path.join(__dirname, '../data/casino-domain-research-report.md');
  const report = generateReport(results, domainMap);
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Generated report: ${reportPath}\n`);
}

function generateMappingCode(domainMap: Record<string, string>): string {
  const entries = Object.entries(domainMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, domain]) => `  '${slug}': '${domain}',`)
    .join('\n');
  
  return `/**
 * Casino Domain Mapping
 * Maps casino slugs to their actual/verified domains for Brandfetch API
 * This corrects cases where the affiliate URL domain differs from the real casino domain
 * 
 * Auto-generated by scripts/research-casino-domains.ts
 * Last updated: ${new Date().toISOString()}
 */

export const CASINO_DOMAIN_MAPPING: Record<string, string> = {
${entries}
};

/**
 * Get the verified casino domain for Brandfetch API
 * @param slug - Casino slug
 * @param fallbackDomain - Domain extracted from URL as fallback
 * @returns The verified domain to use with Brandfetch
 */
export function getVerifiedCasinoDomain(slug: string, fallbackDomain: string): string {
  // Check if we have a verified domain mapping
  if (CASINO_DOMAIN_MAPPING[slug]) {
    return CASINO_DOMAIN_MAPPING[slug];
  }
  
  // Use the fallback domain from the URL
  return fallbackDomain;
}
`;
}

function generateReport(results: DomainMapping[], domainMap: Record<string, string>): string {
  const needMapping = results.filter(r => domainMap[r.slug]);
  const noChange = results.filter(r => !domainMap[r.slug] && r.actualDomain !== 'unknown');
  const failed = results.filter(r => r.actualDomain === 'unknown');
  
  let report = `# Casino Domain Research Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Casinos:** ${results.length}\n`;
  report += `- **Domains Need Mapping:** ${needMapping.length}\n`;
  report += `- **Domains Correct:** ${noChange.length}\n`;
  report += `- **Failed/Unknown:** ${failed.length}\n\n`;
  
  if (needMapping.length > 0) {
    report += `## Casinos Requiring Domain Mapping (${needMapping.length})\n\n`;
    report += `| Casino | Slug | Original Domain | Actual Domain |\n`;
    report += `|--------|------|----------------|---------------|\n`;
    needMapping.forEach(r => {
      const origDomain = new URL(r.originalUrl).hostname.replace('www.', '');
      report += `| ${r.brand} | \`${r.slug}\` | ${origDomain} | **${r.actualDomain}** |\n`;
    });
    report += `\n`;
  }
  
  if (noChange.length > 0) {
    report += `## Casinos with Correct Domains (${noChange.length})\n\n`;
    report += `| Casino | Slug | Domain |\n`;
    report += `|--------|------|--------|\n`;
    noChange.forEach(r => {
      report += `| ${r.brand} | \`${r.slug}\` | ${r.actualDomain} |\n`;
    });
    report += `\n`;
  }
  
  if (failed.length > 0) {
    report += `## Failed/Unreachable Casinos (${failed.length})\n\n`;
    report += `| Casino | Slug | Original URL |\n`;
    report += `|--------|------|-------------|\n`;
    failed.forEach(r => {
      report += `| ${r.brand} | \`${r.slug}\` | ${r.originalUrl} |\n`;
    });
    report += `\n`;
  }
  
  return report;
}

// Run the research
main().catch(console.error);
