#!/usr/bin/env node

/**
 * Enhanced Sitemap Generator
 * Generates comprehensive XML sitemaps for better SEO
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️ Generating comprehensive XML sitemap...');

// Load casino data
const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
const casinos = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Base site configuration
const siteConfig = {
  baseUrl: process.env.SITE_URL || 'https://bestcasinoportal.com',
  changefreq: {
    homepage: 'daily',
    categories: 'weekly',
    reviews: 'weekly',
    guides: 'monthly',
    legal: 'yearly'
  },
  priority: {
    homepage: '1.0',
    categories: '0.8',
    topCasinos: '0.9',
    reviews: '0.7',
    guides: '0.6',
    legal: '0.3'
  }
};

// Generate current timestamp
const currentDate = new Date().toISOString();

// Static pages configuration
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
  
  // Category pages
  { url: '/best/real-money', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
  { url: '/best/fast-withdrawals', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
  { url: '/best/live-dealer', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
  { url: '/best/mobile', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
  
  // Regional pages (load from regions.json if available)
  { url: '/regions/ontario', changefreq: 'weekly', priority: '0.7', lastmod: currentDate },
  { url: '/regions/alberta', changefreq: 'weekly', priority: '0.7', lastmod: currentDate },
  { url: '/regions/british-columbia', changefreq: 'weekly', priority: '0.7', lastmod: currentDate },
  
  // Guide pages
  { url: '/guides', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },
  { url: '/guides/how-we-rate', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },
  { url: '/guides/responsible-gambling', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },
  
  // Legal pages
  { url: '/legal/about', changefreq: 'yearly', priority: '0.3', lastmod: currentDate },
  { url: '/legal/privacy', changefreq: 'yearly', priority: '0.3', lastmod: currentDate },
  { url: '/legal/terms', changefreq: 'yearly', priority: '0.3', lastmod: currentDate }
];

// Generate casino review pages with priorities based on ranking
const casinoPages = casinos.map((casino, index) => ({
  url: `/reviews/${casino.slug}`,
  changefreq: 'weekly',
  priority: index < 10 ? '0.9' : '0.7', // Top 10 casinos get higher priority
  lastmod: currentDate
}));

// Combine all pages
const allPages = [...staticPages, ...casinoPages];

// Generate XML sitemap content
const generateSitemap = (pages) => {
  const urlEntries = pages.map(page => 
    `  <url>
    <loc>${siteConfig.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

try {
  // Generate and write main sitemap
  const sitemapContent = generateSitemap(allPages);
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent);

  // Enhanced robots.txt
  const robotsTxtContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteConfig.baseUrl}/sitemap.xml

# Allow important pages
Allow: /reviews/
Allow: /best/
Allow: /regions/
Allow: /guides/

# Block admin and internal pages
Disallow: /api/
Disallow: /_astro/

# Crawl delay
Crawl-delay: 1`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), robotsTxtContent);

  // Log statistics
  console.log('✅ Enhanced sitemap generation completed!');
  console.log(`   📄 Total pages: ${allPages.length}`);
  console.log(`   🏠 Static pages: ${staticPages.length}`);
  console.log(`   🎰 Casino reviews: ${casinoPages.length}`);
  console.log(`   🤖 Robots.txt updated`);
  
  // Log top casinos
  console.log('\n🏆 Top 5 Casinos:');
  casinos.slice(0, 5).forEach((casino, index) => {
    console.log(`   ${index + 1}. ${casino.brand} (/reviews/${casino.slug})`);
  });

} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
