import * as fs from 'fs-extra';
import * as path from 'path';

export class BonusesPageGenerator {
  constructor(private projectPath: string) {}

  async generate() {
    const bonusesPath = path.join(this.projectPath, 'src/pages/bonuses/index.astro');
    const bonusesContent = `---
import PageLayout from '../../components/Layout/PageLayout.astro';
import EnhancedCasinoCard from '../../components/Casino/EnhancedCasinoCard';
import HeadMeta from '../../components/Layout/HeadMeta.astro';

// Import data and services
import casinos from '../../../data/casinos.json';
import { NavigationCoordinator } from '../../coordinators/NavigationCoordinator';
import { SEOManager } from '../../managers/SEOManager';

// Initialize services
const navigationCoordinator = new NavigationCoordinator();
const seoManager = new SEOManager();

// Filter casinos with best bonuses
const bonusCasinos = casinos
  .filter(casino => casino.welcomeBonus && casino.welcomeBonus.amount > 0)
  .sort((a, b) => (b.welcomeBonus?.amount || 0) - (a.welcomeBonus?.amount || 0))
  .slice(0, 20);

// SEO data
const seoData = seoManager.generateSEOData({
  title: 'Best Casino Bonuses 2025 | Welcome Bonuses & Free Spins',
  description: \`Find the best casino bonuses in 2025! Compare welcome bonuses, no deposit offers, and free spins from \${bonusCasinos.length}+ top-rated online casinos.\`,
  keywords: ['casino bonuses', 'welcome bonus', 'no deposit bonus', 'free spins', 'casino offers 2025'],
  url: '/bonuses',
  type: 'website'
});

// Breadcrumbs
const breadcrumbs = navigationCoordinator.generateBreadcrumbs('/bonuses');

// Bonus types
const bonusTypes = [
  {
    type: 'welcome',
    title: 'Welcome Bonuses',
    description: 'Match your first deposit with bonus funds',
    icon: '🎁',
    count: bonusCasinos.filter(c => c.welcomeBonus?.type === 'deposit_match').length
  },
  {
    type: 'no-deposit', 
    title: 'No Deposit Bonuses',
    description: 'Free bonus money without deposit required',
    icon: '💰',
    count: bonusCasinos.filter(c => c.noDepositBonus).length
  },
  {
    type: 'free-spins',
    title: 'Free Spins',
    description: 'Free spins on popular slot machines',
    icon: '🎰',
    count: bonusCasinos.filter(c => c.freeSpins && c.freeSpins > 0).length
  }
];
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
      <div class="container mx-auto px-6 py-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-6">
            🎁 Best Casino Bonuses 2025
          </h1>
          <p class="text-xl text-gold-100 mb-8 leading-relaxed">
            Discover the most lucrative casino bonuses! Compare welcome offers, 
            no deposit bonuses, and free spins from {bonusCasinos.length}+ top casinos.
          </p>
        </div>
      </div>
    </section>

    <!-- Bonus Types Section -->
    <section class="container mx-auto px-6 py-12">
      <h2 class="text-3xl font-bold text-center mb-12">Popular Bonus Types</h2>
      
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        {bonusTypes.map((bonus) => (
          <div class="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
            <div class="text-6xl mb-4">{bonus.icon}</div>
            <h3 class="text-xl font-bold mb-3 text-gray-800">{bonus.title}</h3>
            <p class="text-gray-600 mb-4">{bonus.description}</p>
            <div class="bg-gold-100 text-gold-800 px-4 py-2 rounded-full inline-block">
              {bonus.count} Available
            </div>
          </div>
        ))}
      </div>
    </section>

    <!-- Best Bonus Casinos -->
    <section class="container mx-auto px-6 pb-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4">🏆 Top Bonus Casinos</h2>
        <p class="text-gray-600 text-lg">
          Handpicked casinos with the most generous bonus offers
        </p>
      </div>

      <!-- Casino Grid -->
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {bonusCasinos.map((casino, index) => (
          <div class="casino-card transform hover:-translate-y-2 transition-all duration-300">
            <EnhancedCasinoCard 
              client:load
              casino={casino}
              showDetailedRating={true}
              showBonusHighlight={true}
              showQuickFacts={true}
              priority={index < 6}
            />
          </div>
        ))}
      </div>
    </section>

    <!-- Bonus Terms Info -->
    <section class="bg-gray-800 text-white py-16">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">
            📋 Understanding Bonus Terms
          </h2>
          <p class="text-gray-300 text-lg max-w-2xl mx-auto">
            Important information to help you make the most of casino bonuses
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-3xl mb-4">🔄</div>
            <h3 class="font-semibold mb-2">Wagering Requirements</h3>
            <p class="text-sm text-gray-400">
              How many times you need to play through the bonus before withdrawing
            </p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl mb-4">⏰</div>
            <h3 class="font-semibold mb-2">Time Limits</h3>
            <p class="text-sm text-gray-400">
              Deadline to use your bonus funds before they expire
            </p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl mb-4">🎮</div>
            <h3 class="font-semibold mb-2">Game Restrictions</h3>
            <p class="text-sm text-gray-400">
              Which games count towards wagering requirements
            </p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl mb-4">💵</div>
            <h3 class="font-semibold mb-2">Max Bet Limits</h3>
            <p class="text-sm text-gray-400">
              Maximum bet allowed when playing with bonus funds
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</PageLayout>

<style>
  .casino-card {
    animation: fadeInUp 0.6s ease-out;
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
    await fs.ensureDir(path.dirname(bonusesPath));
    await fs.writeFile(bonusesPath, bonusesContent);
  }
}
