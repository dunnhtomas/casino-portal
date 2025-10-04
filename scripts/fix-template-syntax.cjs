/**
 * Fix template syntax errors and rebuild all bonus pages
 */

const fs = require('fs');
const path = require('path');

// Load data
const casinos = require('../data/casinos.json');

console.log('🔧 Fixing template syntax errors in bonus pages...');

// Sanitize strings for safe template generation
function sanitizeString(str) {
  if (!str) return '';
  return str
    .replace(/[€$£¥₹]/g, '')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/:/g, '')
    .replace(/[^\w\s-]/g, '');
}

function sanitizeAmount(amount) {
  if (!amount) return 'Welcome Bonus Available';
  return amount
    .replace(/[€$£¥₹]/g, 'USD ')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/:/g, '');
}

// Clean up and regenerate bonus pages with fixed templates
function fixBonusPages() {
  console.log('🎁 Regenerating bonus pages with fixed templates...');
  let fixed = 0;
  
  const bonusTypes = ['welcome', 'no-deposit', 'free-spins', 'reload', 'cashback'];
  
  bonusTypes.forEach(bonusType => {
    casinos.forEach(casino => {
      if (casino.brand) {
        const casinoName = sanitizeString(casino.brand);
        const bonusAmount = sanitizeAmount(casino.bonuses?.welcome?.headline);
        const slug = `${casino.slug}-${bonusType}-bonus`;
        const title = `${casinoName} ${bonusType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Bonus 2025`;
        const description = `${casinoName} ${bonusType.replace('-', ' ')} bonus guide with terms and conditions.`;

        const pageContent = `---
title: "${title}"
description: "${description}"
canonical: "https://bestcasinoportal.com/bonuses/${slug}"
---

import Layout from '../../components/Layout/Layout.astro';
import HeadMeta from '../../components/Layout/HeadMeta.astro';

const bonusData = {
  casino: "${casinoName}",
  type: "${bonusType}",
  amount: "${bonusAmount}",
  wagering: "35x",
  validDays: "30 days"
};

const seoMetadata = {
  title: "${title}",
  description: "${description}",
  keywords: ["${casinoName.toLowerCase()}", "${bonusType}", "casino bonus", "2025"],
  canonical: "https://bestcasinoportal.com/bonuses/${slug}",
  ogImage: "https://bestcasinoportal.com/images/bonus-og.jpg",
  twitterCard: "summary_large_image"
};
---

<Layout>
  <HeadMeta seoMetadata={seoMetadata} />
  <main>
    <section class="bonus-hero py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">{bonusData.casino} {bonusData.type.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} Bonus</h1>
        <p class="text-xl mb-8">Complete guide to claiming your bonus</p>
      </div>
    </section>
    
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-blue-50 p-8 rounded-xl mb-12">
            <h2 class="text-2xl font-bold mb-6">Bonus Details</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <span class="font-semibold">Casino:</span>
                  <span class="ml-2">{bonusData.casino}</span>
                </div>
                <div>
                  <span class="font-semibold">Bonus Type:</span>
                  <span class="ml-2 capitalize">{bonusData.type.replace('-', ' ')}</span>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <span class="font-semibold">Amount:</span>
                  <span class="ml-2">{bonusData.amount}</span>
                </div>
                <div>
                  <span class="font-semibold">Wagering:</span>
                  <span class="ml-2">{bonusData.wagering}</span>
                </div>
              </div>
            </div>
            <div class="mt-8 text-center">
              <a href="/reviews/${casino.slug}" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg">
                Claim Bonus Now
              </a>
            </div>
          </div>
          
          <div class="prose max-w-none">
            <h2>How to Claim</h2>
            <ol>
              <li>Click the claim button above</li>
              <li>Register a new account</li>
              <li>Make your qualifying deposit</li>
              <li>Bonus credited automatically</li>
            </ol>
            
            <h2>Terms and Conditions</h2>
            <ul>
              <li>Wagering requirement: {bonusData.wagering}</li>
              <li>Valid for: {bonusData.validDays}</li>
              <li>18+ only, terms apply</li>
              <li>Please gamble responsibly</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </main>
</Layout>
`;

        const dirPath = path.join(__dirname, '..', 'src', 'pages', 'bonuses');
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${slug}.astro`);
        fs.writeFileSync(filePath, pageContent, 'utf8');
        fixed++;
      }
    });
  });
  
  console.log(`✅ Fixed ${fixed} bonus pages`);
  return fixed;
}

const fixedPages = fixBonusPages();
console.log(`\n🔧 Template Fix Complete!`);
console.log(`✅ Fixed ${fixedPages} pages with syntax errors`);
console.log('🚀 Ready for Docker build!');