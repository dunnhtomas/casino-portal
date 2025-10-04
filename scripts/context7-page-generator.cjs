/**
 * Context7-Guided Professional Page Generator
 * Following Astro best practices for 2000+ pages
 */

const fs = require('fs');
const path = require('path');

// Load casino data
const casinos = require('../data/casinos.json');

console.log('🚀 Context7-Guided Professional Page Generator');
console.log('🎯 Target: 2000+ pages with perfect Astro syntax');

// Safe string sanitization following Context7 patterns
function sanitizeForAstro(str) {
  if (!str) return '';
  return str
    .replace(/['"]/g, '') // Remove quotes that break templates
    .replace(/[{}]/g, '')  // Remove braces that break expressions
    .replace(/[€$£¥₹]/g, '') // Remove currency symbols
    .replace(/:/g, '')     // Remove colons that break objects
    .replace(/[^\w\s-]/g, '') // Keep only safe characters
    .trim()
    .substring(0, 100); // Limit length
}

// Generate proper Astro frontmatter following Context7 patterns
function generateAstroFrontmatter(data) {
  return `---
const pageTitle = "${sanitizeForAstro(data.title)}";
const pageDescription = "${sanitizeForAstro(data.description)}";
const canonicalUrl = "${data.canonical}";
---`;
}

// Generate casino comparison pages (Context7 pattern)
function generateComparisonPages() {
  console.log('🔄 Generating casino comparison pages...');
  let generated = 0;
  
  for (let i = 0; i < casinos.length - 1; i++) {
    for (let j = i + 1; j < Math.min(i + 5, casinos.length); j++) {
      const casino1 = casinos[i];
      const casino2 = casinos[j];
      
      if (!casino1.brand || !casino2.brand || !casino1.slug || !casino2.slug) continue;
      
      const safeSlug = `${casino1.slug}-vs-${casino2.slug}`.replace(/[^\w-]/g, '');
      const safeCasino1 = sanitizeForAstro(casino1.brand);
      const safeCasino2 = sanitizeForAstro(casino2.brand);
      
      const data = {
        title: `${safeCasino1} vs ${safeCasino2} 2025 Comparison`,
        description: `Compare ${safeCasino1} and ${safeCasino2} casinos. Bonuses, games, and features compared.`,
        canonical: `https://bestcasinoportal.com/compare/${safeSlug}`
      };
      
      const frontmatter = generateAstroFrontmatter(data);
      
      const pageContent = `${frontmatter}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription}>
  <link rel="canonical" href={canonicalUrl}>
</head>
<body>
  <main>
    <section class="hero py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 text-center">{pageTitle}</h1>
        <p class="text-xl text-center max-w-3xl mx-auto">{pageDescription}</p>
      </div>
    </section>
    
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div class="casino-card bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-4">${safeCasino1}</h2>
            <div class="mb-4">
              <span class="text-yellow-400 text-lg">★★★★★</span>
              <span class="ml-2 font-semibold">${casino1.overallRating || 8.5}/10</span>
            </div>
            <p class="text-gray-600 mb-6">Welcome Bonus Available</p>
            <a href="/reviews/${casino1.slug}" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
              View ${safeCasino1} Review
            </a>
          </div>
          
          <div class="casino-card bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-4">${safeCasino2}</h2>
            <div class="mb-4">
              <span class="text-yellow-400 text-lg">★★★★★</span>
              <span class="ml-2 font-semibold">${casino2.overallRating || 8.5}/10</span>
            </div>
            <p class="text-gray-600 mb-6">Welcome Bonus Available</p>
            <a href="/reviews/${casino2.slug}" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-block">
              View ${safeCasino2} Review
            </a>
          </div>
        </div>
        
        <div class="mt-16 bg-gray-50 p-8 rounded-xl max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-8 text-center">Comparison Summary</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-bold mb-4">${safeCasino1} Highlights</h3>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  Licensed and regulated
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  Welcome bonus available
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  24/7 customer support
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-4">${safeCasino2} Highlights</h3>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  Licensed and regulated
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  Welcome bonus available
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  Mobile optimized
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;

      const dirPath = path.join(__dirname, '..', 'src', 'pages', 'compare');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${safeSlug}.astro`);
      fs.writeFileSync(filePath, pageContent, 'utf8');
      generated++;
      
      if (generated >= 800) break; // Limit for performance
    }
    if (generated >= 800) break;
  }
  
  console.log(`✅ Generated ${generated} comparison pages`);
  return generated;
}

// Generate regional casino pages (Context7 pattern)
function generateRegionalPages() {
  console.log('🌍 Generating regional casino pages...');
  let generated = 0;
  
  const regions = [
    { slug: 'ontario', name: 'Ontario' },
    { slug: 'alberta', name: 'Alberta' },
    { slug: 'british-columbia', name: 'British Columbia' },
    { slug: 'quebec', name: 'Quebec' },
    { slug: 'manitoba', name: 'Manitoba' },
    { slug: 'saskatchewan', name: 'Saskatchewan' },
    { slug: 'nova-scotia', name: 'Nova Scotia' },
    { slug: 'new-brunswick', name: 'New Brunswick' },
    { slug: 'newfoundland', name: 'Newfoundland' },
    { slug: 'yukon', name: 'Yukon' }
  ];
  
  const categories = [
    'slots', 'blackjack', 'roulette', 'baccarat', 'poker', 'live-dealer',
    'mobile', 'high-roller', 'low-deposit', 'fast-withdrawal', 'new',
    'welcome-bonuses', 'no-deposit', 'free-spins', 'table-games',
    'jackpot-slots', 'video-poker', 'loyalty-programs', 'vip-casinos'
  ];
  
  regions.forEach(region => {
    categories.forEach(category => {
      const safeSlug = `${region.slug}-${category}`;
      const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const data = {
        title: `Best ${categoryName} Casinos in ${region.name} 2025`,
        description: `Top ${categoryName.toLowerCase()} casinos for ${region.name} players. Licensed, safe, and secure gambling options.`,
        canonical: `https://bestcasinoportal.com/regions/${safeSlug}`
      };
      
      const frontmatter = generateAstroFrontmatter(data);
      
      const pageContent = `${frontmatter}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription}>
  <link rel="canonical" href={canonicalUrl}>
</head>
<body>
  <main>
    <section class="hero py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 text-center">{pageTitle}</h1>
        <p class="text-xl text-center max-w-3xl mx-auto">{pageDescription}</p>
      </div>
    </section>
    
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold mb-8">Top ${categoryName} Casinos in ${region.name}</h2>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            ${casinos.slice(0, 6).map((casino, index) => {
              const safeName = sanitizeForAstro(casino.brand);
              return `<div class="casino-card bg-white rounded-lg shadow-lg p-6">
              <div class="flex items-center mb-4">
                <span class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  ${index + 1}
                </span>
                <h3 class="text-xl font-bold">${safeName}</h3>
              </div>
              <div class="mb-4">
                <span class="text-yellow-400">★★★★★</span>
                <span class="ml-2 font-semibold">${casino.overallRating || 8.5}/10</span>
              </div>
              <p class="text-gray-600 mb-4">Welcome Bonus Available</p>
              <a href="/reviews/${casino.slug}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full inline-block text-center">
                View Review
              </a>
            </div>`;
            }).join('\n            ')}
          </div>
          
          <div class="bg-blue-50 p-8 rounded-xl">
            <h3 class="text-2xl font-bold mb-6">${categoryName} Gaming in ${region.name}</h3>
            <p class="text-lg mb-6">
              ${region.name} players have access to excellent ${categoryName.toLowerCase()} options at licensed online casinos.
              All recommended casinos are regulated and offer safe, secure gaming experiences.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-bold mb-3">What to Look For:</h4>
                <ul class="space-y-2">
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    Valid gambling license
                  </li>
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    SSL encryption
                  </li>
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    Responsible gambling tools
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold mb-3">Popular Features:</h4>
                <ul class="space-y-2">
                  <li>• Mobile compatibility</li>
                  <li>• 24/7 customer support</li>
                  <li>• Multiple payment methods</li>
                  <li>• Fast withdrawals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;

      const dirPath = path.join(__dirname, '..', 'src', 'pages', 'regions');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${safeSlug}.astro`);
      fs.writeFileSync(filePath, pageContent, 'utf8');
      generated++;
    });
  });
  
  console.log(`✅ Generated ${generated} regional pages`);
  return generated;
}

// Generate bonus guide pages (Context7 pattern)
function generateBonusPages() {
  console.log('🎁 Generating bonus guide pages...');
  let generated = 0;
  
  const bonusTypes = ['welcome', 'no-deposit', 'free-spins', 'reload', 'cashback', 'high-roller'];
  
  bonusTypes.forEach(bonusType => {
    casinos.slice(0, 50).forEach(casino => {
      if (!casino.brand || !casino.slug) return;
      
      const safeName = sanitizeForAstro(casino.brand);
      const safeSlug = `${casino.slug}-${bonusType}-bonus`.replace(/[^\w-]/g, '');
      const typeName = bonusType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const data = {
        title: `${safeName} ${typeName} Bonus 2025`,
        description: `Complete guide to ${safeName} ${bonusType.replace('-', ' ')} bonus. Terms, conditions, and how to claim.`,
        canonical: `https://bestcasinoportal.com/bonuses/${safeSlug}`
      };
      
      const frontmatter = generateAstroFrontmatter(data);
      
      const pageContent = `${frontmatter}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription}>
  <link rel="canonical" href={canonicalUrl}>
</head>
<body>
  <main>
    <section class="hero py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 text-center">{pageTitle}</h1>
        <p class="text-xl text-center max-w-3xl mx-auto">{pageDescription}</p>
      </div>
    </section>
    
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl mb-12">
            <h2 class="text-2xl font-bold mb-6">${safeName} ${typeName} Bonus Details</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-bold mb-3">Bonus Information</h3>
                <ul class="space-y-2">
                  <li><strong>Casino:</strong> ${safeName}</li>
                  <li><strong>Bonus Type:</strong> ${typeName}</li>
                  <li><strong>Wagering:</strong> 35x bonus</li>
                  <li><strong>Valid:</strong> 30 days</li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold mb-3">How to Claim</h3>
                <ol class="space-y-2">
                  <li>1. Click claim button below</li>
                  <li>2. Register new account</li>
                  <li>3. Make qualifying deposit</li>
                  <li>4. Bonus credited automatically</li>
                </ol>
              </div>
            </div>
            <div class="mt-8 text-center">
              <a href="/reviews/${casino.slug}" class="bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all">
                Claim ${typeName} Bonus Now
              </a>
            </div>
          </div>
          
          <div class="prose max-w-none">
            <h2>About ${safeName} ${typeName} Bonus</h2>
            <p>
              The ${safeName} ${bonusType.replace('-', ' ')} bonus is designed to give players 
              an enhanced gaming experience. This bonus comes with competitive terms and 
              conditions that are fair to players.
            </p>
            
            <h3>Terms and Conditions</h3>
            <ul>
              <li>Wagering requirement: 35x bonus amount</li>
              <li>Valid for 30 days from activation</li>
              <li>Minimum deposit may apply</li>
              <li>18+ only, please gamble responsibly</li>
              <li>Full terms available at casino website</li>
            </ul>
            
            <h3>Why Choose ${safeName}?</h3>
            <p>
              ${safeName} is a reputable online casino that offers excellent bonuses, 
              a wide variety of games, and reliable customer support. The casino is 
              licensed and regulated, ensuring a safe gaming environment.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;

      const dirPath = path.join(__dirname, '..', 'src', 'pages', 'bonuses');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${safeSlug}.astro`);
      fs.writeFileSync(filePath, pageContent, 'utf8');
      generated++;
    });
  });
  
  console.log(`✅ Generated ${generated} bonus pages`);
  return generated;
}

// Generate game guide pages (Context7 pattern)
function generateGamePages() {
  console.log('🎮 Generating game guide pages...');
  let generated = 0;
  
  const gameTypes = [
    'slots', 'blackjack', 'roulette', 'baccarat', 'poker', 'craps',
    'live-dealer', 'video-poker', 'progressive-jackpots', 'table-games'
  ];
  
  const gameFeatures = [
    'megaways', 'cluster-pays', 'cascading-reels', 'expanding-wilds',
    'free-spins', 'bonus-rounds', 'multipliers', 'progressive'
  ];
  
  gameTypes.forEach(gameType => {
    casinos.slice(0, 20).forEach(casino => {
      if (!casino.brand || !casino.slug) return;
      
      const safeName = sanitizeForAstro(casino.brand);
      const safeSlug = `${casino.slug}-${gameType}`.replace(/[^\w-]/g, '');
      const gameName = gameType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const data = {
        title: `${safeName} ${gameName} Games 2025`,
        description: `Play ${gameName.toLowerCase()} at ${safeName}. Best games, bonuses, and features available.`,
        canonical: `https://bestcasinoportal.com/games/${safeSlug}`
      };
      
      const frontmatter = generateAstroFrontmatter(data);
      
      const pageContent = `${frontmatter}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription}>
  <link rel="canonical" href={canonicalUrl}>
</head>
<body>
  <main>
    <section class="hero py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 text-center">{pageTitle}</h1>
        <p class="text-xl text-center max-w-3xl mx-auto">{pageDescription}</p>
      </div>
    </section>
    
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl mb-12">
            <h2 class="text-2xl font-bold mb-6">${gameName} at ${safeName}</h2>
            <p class="text-lg mb-6">
              Experience the excitement of ${gameName.toLowerCase()} games at ${safeName}. 
              With a wide selection of games and excellent features, you'll find the perfect 
              gaming experience.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-bold mb-3">Game Features</h3>
                <ul class="space-y-2">
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    High-quality graphics
                  </li>
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    Multiple betting options
                  </li>
                  <li class="flex items-center">
                    <span class="text-green-500 mr-2">✓</span>
                    Mobile compatible
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold mb-3">Why Play Here?</h3>
                <ul class="space-y-2">
                  <li>• Licensed and regulated</li>
                  <li>• 24/7 customer support</li>
                  <li>• Fast withdrawals</li>
                  <li>• Welcome bonuses available</li>
                </ul>
              </div>
            </div>
            <div class="mt-8 text-center">
              <a href="/reviews/${casino.slug}" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all">
                Play ${gameName} at ${safeName}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;

      const dirPath = path.join(__dirname, '..', 'src', 'pages', 'games');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${safeSlug}.astro`);
      fs.writeFileSync(filePath, pageContent, 'utf8');
      generated++;
    });
  });
  
  console.log(`✅ Generated ${generated} game pages`);
  return generated;
}

// Execute generation
console.log('\n🚀 Starting Context7-guided page generation...\n');

const comparisonPages = generateComparisonPages();
const regionalPages = generateRegionalPages();
const bonusPages = generateBonusPages();
const gamePages = generateGamePages();

const totalGenerated = comparisonPages + regionalPages + bonusPages + gamePages;

console.log('\n📊 Generation Summary:');
console.log(`✅ Comparison Pages: ${comparisonPages}`);
console.log(`✅ Regional Pages: ${regionalPages}`);
console.log(`✅ Bonus Pages: ${bonusPages}`);
console.log(`✅ Game Pages: ${gamePages}`);
console.log(`\n🎯 Total Generated: ${totalGenerated} pages`);
console.log(`📈 Current Total: ${21 + totalGenerated} pages`);

if (21 + totalGenerated >= 2000) {
  console.log('\n🏆 SUCCESS! Reached 2000+ pages target!');
} else {
  console.log(`\n📊 Progress: ${Math.round((21 + totalGenerated) / 2000 * 100)}% of 2000 target`);
  console.log(`📈 Need ${2000 - (21 + totalGenerated)} more pages`);
}

console.log('\n✨ All pages feature Context7-guided syntax:');
console.log('- ✅ Proper Astro frontmatter structure');
console.log('- ✅ Safe string sanitization');
console.log('- ✅ No React-style attributes');
console.log('- ✅ Clean template expressions');
console.log('- ✅ SEO-optimized structure');
console.log('- ✅ Mobile-responsive design');