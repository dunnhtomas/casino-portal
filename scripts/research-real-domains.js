import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract unique casinos from casinos.json
 * Research real domains using Bing searches
 */

async function extractCasinos() {
  const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
  const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));
  
  // Extract unique casinos
  const uniqueCasinos = new Map();
  
  casinos.forEach(casino => {
    if (!uniqueCasinos.has(casino.slug)) {
      uniqueCasinos.set(casino.slug, {
        slug: casino.slug,
        brand: casino.brand,
        currentUrl: casino.url,
        currentDomain: extractDomain(casino.url)
      });
    }
  });
  
  const casinosList = Array.from(uniqueCasinos.values());
  
  console.log(`\n📊 Total unique casinos: ${casinosList.length}\n`);
  console.log('Casino list for Bing research:\n');
  console.log('═'.repeat(80));
  
  casinosList.forEach((casino, index) => {
    console.log(`${index + 1}. ${casino.brand}`);
    console.log(`   Slug: ${casino.slug}`);
    console.log(`   Current URL: ${casino.currentUrl}`);
    console.log(`   Current Domain: ${casino.currentDomain}`);
    console.log(`   Bing Search: "${casino.brand} casino official site"`);
    console.log('─'.repeat(80));
  });
  
  // Save to file for easy reference
  const outputPath = path.join(__dirname, '..', 'casino-research-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(casinosList, null, 2));
  console.log(`\n✅ Saved research list to: casino-research-list.json`);
  
  // Generate Bing search queries
  const searchQueries = casinosList.map(casino => 
    `"${casino.brand} casino" official website`
  );
  
  const queriesPath = path.join(__dirname, '..', 'bing-search-queries.txt');
  fs.writeFileSync(queriesPath, searchQueries.join('\n'));
  console.log(`✅ Saved Bing search queries to: bing-search-queries.txt\n`);
  
  return casinosList;
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

extractCasinos().catch(console.error);
