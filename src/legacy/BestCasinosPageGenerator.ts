import * as fs from 'fs-extra';
import * as path from 'path';

export class BestCasinosPageGenerator {
  constructor(private projectPath: string) {}

  async generate() {
    const bestPath = path.join(this.projectPath, 'src/pages/best/index.astro');
    const bestContent = `---
import PageLayout from '../../components/Layout/PageLayout.astro';
import HeadMeta from '../../components/Layout/HeadMeta.astro';

// Import data and services
import casinos from '../../../data/casinos.json';
import { NavigationCoordinator } from '../../coordinators/NavigationCoordinator';
import { SEOManager } from '../../managers/SEOManager';

// Initialize services
const navigationCoordinator = new NavigationCoordinator();
const seoManager = new SEOManager();

// Best casino categories
const bestCategories = [
  {
    id: 'real-money',
    title: 'Best Real Money Casinos',
    description: 'Top-rated casinos for real money gambling with excellent payouts',
    icon: '💰',
    count: casinos.filter(c => c.realMoney && c.overallRating >= 8.0).length,
    link: '/best/real-money',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'fast-withdrawals',
    title: 'Fast Withdrawal Casinos',
    description: 'Quick and reliable withdrawal processing in 24 hours or less',
    icon: '⚡',
    count: casinos.filter(c => c.withdrawalSpeed === 'fast' || c.withdrawalHours <= 24).length,
    link: '/best/fast-withdrawals',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'mobile',
    title: 'Best Mobile Casinos',
    description: 'Outstanding mobile experience with responsive design and apps',
    icon: '📱',
    count: casinos.filter(c => c.mobileOptimized && c.mobileRating >= 8.0).length,
    link: '/best/mobile', 
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'live-dealer',
    title: 'Best Live Dealer Casinos',
    description: 'Premium live dealer games with professional dealers',
    icon: '🎥',
    count: casinos.filter(c => c.liveDealer && c.liveDealerRating >= 8.0).length,
    link: '/best/live-dealer',
    color: 'from-red-500 to-rose-600'
  }
];

// Top overall casinos
const topCasinos = casinos
  .filter(casino => casino.overallRating >= 8.5)
  .sort((a, b) => b.overallRating - a.overallRating)
  .slice(0, 6);

// SEO data
const seoData = seoManager.generateSEOData({
  title: 'Best Online Casinos 2025 | Top Rated Casino Sites',
  description: \`Find the best online casinos in 2025! Compare top-rated casino sites for real money, fast withdrawals, mobile gaming, and live dealer games.\`,
  keywords: ['best online casinos', 'top casinos 2025', 'best casino sites', 'top rated casinos'],
  url: '/best',
  type: 'website'
});

// Breadcrumbs
const breadcrumbs = navigationCoordinator.generateBreadcrumbs('/best');
---

<PageLayout 
  title={seoData.title}
  description={seoData.description}
  breadcrumbs={breadcrumbs}
>
  <HeadMeta slot="head" {...seoData} />
  
  <main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-white">
      <div class="container mx-auto px-6 py-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-6xl font-bold mb-6">
            🏆 Best Online Casinos 2025
          </h1>
          <p class="text-2xl text-gold-100 mb-8 leading-relaxed">
            Discover the highest-rated online casinos. Expert reviews, 
            detailed comparisons, and exclusive bonuses await!
          </p>
          <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-3xl font-bold">{casinos.length}+</div>
                <div class="text-sm text-gold-200">Casinos Reviewed</div>
              </div>
              <div>
                <div class="text-3xl font-bold">{topCasinos.length}</div>
                <div class="text-sm text-gold-200">Top Rated</div>
              </div>
              <div>
                <div class="text-3xl font-bold">4</div>
                <div class="text-sm text-gold-200">Categories</div>
              </div>
              <div>
                <div class="text-3xl font-bold">24/7</div>
                <div class="text-sm text-gold-200">Updated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Best Casino Categories -->
    <section class="container mx-auto px-6 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4">🎯 Find Your Perfect Casino</h2>
        <p class="text-xl text-gray-600">
          Browse our curated categories to find casinos that match your preferences
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8">
        {bestCategories.map((category, index) => (
          <div class={\`category-card bg-gradient-to-r \${category.color} text-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2\`}>
            <div class="flex items-center justify-between mb-6">
              <div class="text-6xl">{category.icon}</div>
              <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span class="font-bold">{category.count} Casinos</span>
              </div>
            </div>
            
            <h3 class="text-2xl font-bold mb-4">{category.title}</h3>
            <p class="text-lg text-white/90 mb-6 leading-relaxed">
              {category.description}
            </p>
            
            <a 
              href={category.link}
              class="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Category
              <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </section>

    <!-- Top Casinos Preview -->
    <section class="bg-gray-900 text-white py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">⭐ Highest Rated Casinos</h2>
          <p class="text-xl text-gray-300">
            Our top-performing casinos with ratings of 8.5+ stars
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topCasinos.map((casino, index) => (
            <div class="casino-preview-card bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-colors">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">{casino.name}</h3>
                <div class="bg-gold-500 text-black px-3 py-1 rounded-lg font-bold">
                  ⭐ {casino.overallRating}
                </div>
              </div>
              
              <div class="space-y-2 mb-6">
                {casino.welcomeBonus && (
                  <div class="flex items-center text-green-400">
                    <span class="text-sm">💰 Bonus: {casino.welcomeBonus.display}</span>
                  </div>
                )}
                {casino.freeSpins && casino.freeSpins > 0 && (
                  <div class="flex items-center text-purple-400">
                    <span class="text-sm">🎰 {casino.freeSpins} Free Spins</span>
                  </div>
                )}
                <div class="flex items-center text-blue-400">
                  <span class="text-sm">⚡ Withdrawal: {casino.withdrawalSpeed || 'Standard'}</span>
                </div>
              </div>
              
              <div class="flex gap-3">
                <a 
                  href={\`/reviews/\${casino.slug}\`}
                  class="flex-1 bg-gold-500 text-black text-center py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors"
                >
                  Read Review
                </a>
                <a 
                  href={casino.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 bg-gray-700 text-center py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Visit Casino
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div class="text-center mt-12">
          <a 
            href="/reviews"
            class="inline-block bg-gold-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-gold-400 transition-colors"
          >
            View All Casino Reviews →
          </a>
        </div>
      </div>
    </section>

    <!-- Why Choose Our Recommendations -->
    <section class="container mx-auto px-6 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4">🛡️ Why Trust Our Recommendations?</h2>
        <p class="text-xl text-gray-600">
          Our rigorous testing process ensures you get the best casino experience
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="trust-factor text-center">
          <div class="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🔍</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Expert Testing</h3>
          <p class="text-gray-600">Thorough evaluation of games, bonuses, and user experience</p>
        </div>

        <div class="trust-factor text-center">
          <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🔒</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Security First</h3>
          <p class="text-gray-600">Only licensed and regulated casinos make our list</p>
        </div>

        <div class="trust-factor text-center">
          <div class="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">💰</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Fair Play</h3>
          <p class="text-gray-600">Verified RNG and audited payout percentages</p>
        </div>

        <div class="trust-factor text-center">
          <div class="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">⏰</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Real-Time Updates</h3>
          <p class="text-gray-600">Rankings updated daily based on latest performance</p>
        </div>
      </div>
    </section>
  </main>
</PageLayout>

<style>
  .category-card {
    animation: slideInUp 0.6s ease-out;
  }
  
  .casino-preview-card {
    animation: fadeInUp 0.8s ease-out;
  }
  
  .trust-factor {
    animation: fadeInUp 1s ease-out;
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>`;
    await fs.ensureDir(path.dirname(bestPath));
    await fs.writeFile(bestPath, bestContent);
  }
}
