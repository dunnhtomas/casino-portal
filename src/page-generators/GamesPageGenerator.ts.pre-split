import * as fs from 'fs-extra';
import * as path from 'path';

export class GamesPageGenerator {
  constructor(private projectPath: string) {}

  async generate() {
    const gamesPath = path.join(this.projectPath, 'src/pages/games/index.astro');
    const gamesContent = `---
import PageLayout from '../../components/Layout/PageLayout.astro';
import HeadMeta from '../../components/Layout/HeadMeta.astro';

// Import data and services
import casinos from '../../../data/casinos.json';
import { NavigationCoordinator } from '../../coordinators/NavigationCoordinator';
import { SEOManager } from '../../managers/SEOManager';

// Initialize services
const navigationCoordinator = new NavigationCoordinator();
const seoManager = new SEOManager();

// Game categories
const gameCategories = [
  {
    id: 'slots',
    title: 'Slot Games',
    description: 'Classic and video slots with exciting themes',
    icon: '🎰',
    count: 2500,
    popularGames: ['Starburst', 'Gonzo\\'s Quest', 'Book of Dead', 'Sweet Bonanza']
  },
  {
    id: 'table-games', 
    title: 'Table Games',
    description: 'Blackjack, Roulette, Baccarat and more',
    icon: '🃏',
    count: 150,
    popularGames: ['European Roulette', 'Blackjack Pro', 'Baccarat Squeeze', 'Caribbean Poker']
  },
  {
    id: 'live-dealer',
    title: 'Live Dealer',
    description: 'Real dealers streamed in HD quality',
    icon: '🎥',
    count: 200,
    popularGames: ['Live Roulette', 'Live Blackjack', 'Crazy Time', 'Monopoly Live']
  },
  {
    id: 'jackpots',
    title: 'Progressive Jackpots',
    description: 'Life-changing jackpot prizes',
    icon: '💎',
    count: 80,
    popularGames: ['Mega Moolah', 'Divine Fortune', 'Hall of Gods', 'Arabian Nights']
  }
];

// Game providers
const topProviders = [
  { name: 'NetEnt', logo: '/images/providers/netent.png', games: 300 },
  { name: 'Microgaming', logo: '/images/providers/microgaming.png', games: 400 },
  { name: 'Play\\'n GO', logo: '/images/providers/playngo.png', games: 250 },
  { name: 'Pragmatic Play', logo: '/images/providers/pragmatic.png', games: 180 },
  { name: 'Evolution Gaming', logo: '/images/providers/evolution.png', games: 120 },
  { name: 'Yggdrasil', logo: '/images/providers/yggdrasil.png', games: 150 }
];

// SEO data
const seoData = seoManager.generateSEOData({
  title: 'Casino Games 2025 | Slots, Table Games & Live Dealer',
  description: \`Discover thousands of casino games! Play slots, table games, live dealer games and progressive jackpots from top providers like NetEnt, Microgaming and more.\`,
  keywords: ['casino games', 'online slots', 'table games', 'live dealer', 'progressive jackpots'],
  url: '/games',
  type: 'website'
});

// Breadcrumbs
const breadcrumbs = navigationCoordinator.generateBreadcrumbs('/games');
---

<PageLayout 
  title={seoData.title}
  description={seoData.description}
  breadcrumbs={breadcrumbs}
>
  <HeadMeta slot="head" {...seoData} />
  
  <main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white">
      <div class="container mx-auto px-6 py-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-6">
            🎮 Casino Games Collection
          </h1>
          <p class="text-xl text-purple-100 mb-8 leading-relaxed">
            Explore thousands of casino games from the world's top providers. 
            From classic slots to live dealer games, find your favorites here!
          </p>
        </div>
      </div>
    </section>

    <!-- Game Categories -->
    <section class="container mx-auto px-6 py-16">
      <h2 class="text-4xl font-bold text-center mb-12">🎯 Game Categories</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {gameCategories.map((category) => (
          <div class="game-category-card bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="text-6xl mb-4">{category.icon}</div>
            <h3 class="text-xl font-bold mb-3 text-gray-800">{category.title}</h3>
            <p class="text-gray-600 mb-4">{category.description}</p>
            <div class="bg-purple-100 text-purple-800 px-4 py-2 rounded-full inline-block mb-4">
              {category.count}+ Games
            </div>
            
            <div class="border-t pt-4">
              <p class="text-sm font-semibold text-gray-700 mb-2">Popular:</p>
              {category.popularGames.map((game) => (
                <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">
                  {game}
                </span>
              ))}
            </div>
            
            <a 
              href={\`/\${category.id}\`} 
              class="block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse {category.title}
            </a>
          </div>
        ))}
      </div>
    </section>

    <!-- Top Game Providers -->
    <section class="bg-gray-900 text-white py-16">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">🏭 Top Game Providers</h2>
          <p class="text-gray-300 text-lg">
            Games from the industry's most trusted and innovative studios
          </p>
        </div>

        <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
          {topProviders.map((provider) => (
            <div class="provider-card bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors">
              <div class="bg-white rounded-lg p-4 mb-4">
                <img 
                  src={provider.logo} 
                  alt={provider.name}
                  class="w-full h-12 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 class="font-semibold mb-2">{provider.name}</h3>
              <p class="text-sm text-gray-400">{provider.games} Games</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4">✨ Game Features</h2>
        <p class="text-gray-600 text-lg">
          What makes our casino games collection special
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="feature-card text-center">
          <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🆓</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Free Play</h3>
          <p class="text-gray-600">Try games for free before playing with real money</p>
        </div>

        <div class="feature-card text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📱</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Mobile Optimized</h3>
          <p class="text-gray-600">Perfect gameplay on all devices and screen sizes</p>
        </div>

        <div class="feature-card text-center">
          <div class="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🔒</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Fair & Secure</h3>
          <p class="text-gray-600">RNG certified games with provably fair results</p>
        </div>

        <div class="feature-card text-center">
          <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">⚡</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">Instant Play</h3>
          <p class="text-gray-600">No downloads required - play instantly in browser</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p class="text-xl mb-8">Choose from our top-rated casinos and start playing today!</p>
        <a 
          href="/reviews" 
          class="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Browse Top Casinos →
        </a>
      </div>
    </section>
  </main>
</PageLayout>

<style>
  .game-category-card {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .provider-card {
    animation: fadeInUp 0.8s ease-out;
  }
  
  .feature-card {
    animation: fadeInUp 1s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>`;
    await fs.ensureDir(path.dirname(gamesPath));
    await fs.writeFile(gamesPath, gamesContent);
  }
}
