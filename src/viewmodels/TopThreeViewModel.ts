/**
 * TopThree ViewModel
 * Single Responsibility: Transform casino data to card format
 */

import type { CasinoCardData } from '../components/Casino/EnhancedCasinoCard';
import type { CasinoBonus, FreeSpinsBonus } from '../types/TopThreeTypes';
import { getBrandLogo } from '../lib/getBrandLogo';

export class TopThreeViewModel {
  mapCasinoToCardData(casino: any, rank: number): CasinoCardData {
    return {
      id: casino.slug,
      name: casino.brand,
      logo: casino.logo?.url || getBrandLogo(casino.url, casino.slug),
      slug: casino.slug,
      rating: this.mapRating(casino),
      bonuses: this.mapBonuses(casino),
      features: this.mapFeatures(casino),
      payoutSpeed: this.mapPayoutSpeed(casino),
      licenses: this.mapLicenses(casino),
      established: this.calculateEstablished(casino),
      gameCount: casino.gameCount || 2000,
      minDeposit: "$10",
      currencies: ["CAD", "USD", "EUR"],
      languages: ["English", "French"],
      isPopular: rank <= 1,
      isTrusted: casino.ratings?.reputation >= 9,
      isFeatured: rank === 1
    };
  }

  private mapRating(casino: any) {
    return {
      overall: Number(casino.overallRating?.toFixed(1)) || 9.0,
      trust: casino.ratings?.reputation || 9,
      bonuses: casino.ratings?.bonusValue || 9,
      games: casino.ratings?.games || 9,
      support: casino.ratings?.support || 9,
      payout: casino.ratings?.payout || 9
    };
  }

  private mapBonuses(casino: any) {
    const welcome = {
      amount: casino.bonuses?.welcome?.headline || "€500 Welcome Bonus",
      type: 'match' as const,
      wagering: parseInt(casino.bonuses?.welcome?.wagering?.replace('x', '')) || 35,
      maxWin: casino.bonuses?.welcome?.maxCashout 
        ? `€${casino.bonuses.welcome.maxCashout}` 
        : undefined
    };

    const noDeposit = casino.bonuses?.noDeposit ? {
      amount: casino.bonuses.noDeposit.headline,
      type: 'cash' as const,
      wagering: parseInt(casino.bonuses.noDeposit.wagering?.replace('x', '')) || 35
    } : undefined;

    const freeSpins = casino.bonuses?.freeSpins ? {
      count: casino.bonuses.freeSpins.count || 50,
      game: casino.bonuses.freeSpins.game || "Book of Dead",
      wagering: parseInt(casino.bonuses.freeSpins.wagering?.replace('x', '')) || 35
    } : undefined;

    return { welcome, noDeposit, freeSpins };
  }

  private mapFeatures(casino: any) {
    const tags = casino.topTags?.slice(0, 3);
    if (tags) {
      return tags.map((tag: string) => ({
        icon: this.getFeatureIcon(tag),
        label: tag
      }));
    }
    return this.getDefaultFeatures();
  }

  private getFeatureIcon(tag: string): string {
    if (tag.includes('Fast')) return '⚡';
    if (tag.includes('License')) return '🛡️';
    return '🎮';
  }

  private getDefaultFeatures() {
    return [
      { icon: '⚡', label: 'Fast Payouts' },
      { icon: '🛡️', label: 'Licensed' },
      { icon: '🎮', label: 'Great Games' }
    ];
  }

  private mapPayoutSpeed(casino: any) {
    const hours = casino.payoutSpeedHours || 24;
    return {
      min: `${hours}h`,
      max: `${hours * 2}h`,
      category: hours <= 4 ? 'instant' as const 
              : hours <= 24 ? 'fast' as const 
              : 'standard' as const
    };
  }

  private mapLicenses(casino: any) {
    return casino.licences?.map((license: string) => ({
      name: license,
      country: license,
      logo: `/images/licenses/${license.toLowerCase()}.png`
    })) || [];
  }

  private calculateEstablished(casino: any): number {
    return casino.safety?.yearsOnline 
      ? new Date().getFullYear() - casino.safety.yearsOnline 
      : 2018;
  }
}
