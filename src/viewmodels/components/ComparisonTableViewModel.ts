/**
 * ComparisonTableViewModel
 * Single Responsibility: Handle comparison table data and presentation logic
 */

import type { IComponentViewModel, ComponentData, UserAction } from '../../core/interfaces/ApplicationInterfaces';
import { CasinoDataService } from '../../services/data/CasinoDataService';
import { CasinoRatingManager } from '../../managers/casino/CasinoRatingManager';
import { CasinoBonusManager } from '../../managers/casino/CasinoBonusManager';
import type { Casino } from '../../core/types/DomainTypes';

export class ComparisonTableViewModel implements IComponentViewModel {
  private casinoService = new CasinoDataService();
  private ratingManager = new CasinoRatingManager();
  private bonusManager = new CasinoBonusManager();
  private props: { limit?: number } = {};

  /**
   * Initialize with component props
   */
  initialize(props: { limit?: number }): void {
    this.props = props;
  }

  /**
   * Get display data for comparison table
   */
  async getDisplayData(): Promise<ComponentData> {
    const limit = this.props.limit || 8;
    const topCasinos = await this.casinoService.getTopCasinos(limit);
    
    const tableData = await Promise.all(
      topCasinos.map(async (casino, index) => ({
        rank: index + 1,
        casino: {
          name: casino.brand,
          slug: casino.slug,
          logo: casino.logo?.url,
          domain: casino.domain,
        },
        rating: {
          overall: casino.ratings.overall,
          display: casino.ratings.overall.toFixed(1),
          tier: this.ratingManager.getRatingTier(casino.ratings.overall),
          ratingData: {
            overall: casino.ratings.overall,
            trust: casino.ratings.reputation,
            bonuses: casino.ratings.bonusValue,
            games: casino.ratings.games,
            support: casino.ratings.support,
            payout: casino.ratings.payout,
          },
        },
        bonus: this.formatBonusForTable(casino),
        payout: this.formatPayoutSpeed(casino),
        cta: {
          text: 'Play Now',
          href: `${casino.website}?ref=bestcasinoportal`,
          variant: index === 0 ? 'primary' : 'secondary',
        },
        styling: this.getRankStyling(index),
        isTop3: index < 3,
      }))
    );

    return {
      displayProps: {
        title: '🏅 Compare Top Online Casinos',
        subtitle: 'Our highest-rated casino sites ranked by expert analysis',
        tableData,
        lastUpdated: new Date().toISOString(),
        tableId: 'comparison-table',
      },
      eventHandlers: {
        onCasinoClick: this.handleCasinoClick.bind(this),
        onRatingClick: this.handleRatingClick.bind(this),
        onBonusClick: this.handleBonusClick.bind(this),
      },
      state: {
        isLoading: false,
        sortBy: 'overall',
        sortOrder: 'desc',
        selectedCasino: null,
      },
    };
  }

  /**
   * Handle user interactions
   */
  handleUserInteraction(action: UserAction): void {
    switch (action.type) {
      case 'casino_click':
        this.handleCasinoClick(action.payload as string);
        break;
      case 'rating_click':
        this.handleRatingClick(action.payload as string);
        break;
      case 'bonus_click':
        this.handleBonusClick(action.payload as string);
        break;
    }
  }

  /**
   * Private helper methods
   */
  private formatBonusForTable(casino: Casino) {
    const bonusDisplay = this.bonusManager.formatBonusDisplay(casino);
    
    if (!casino.bonuses.welcome) {
      return {
        display: 'No Bonus',
        amount: null,
        highlight: false,
      };
    }

    return {
      display: bonusDisplay.primary,
      amount: casino.bonuses.welcome.amount,
      percentage: casino.bonuses.welcome.percentage,
      wagering: casino.bonuses.welcome.wagering,
      highlight: bonusDisplay.highlight,
    };
  }

  private formatPayoutSpeed(casino: Casino): string {
    // This would be based on actual payout data
    // For now, use rating as proxy
    const payoutRating = casino.ratings.payout;
    
    if (payoutRating >= 9) return '⚡ Instant';
    if (payoutRating >= 7) return '🚀 Fast';
    if (payoutRating >= 5) return '⏱️ Medium';
    return '🐌 Slow';
  }

  private getRankStyling(index: number) {
    const rankClasses = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600', // Gold
      'bg-gradient-to-r from-gray-400 to-gray-600',     // Silver
      'bg-gradient-to-r from-amber-600 to-amber-800',   // Bronze
    ];

    return {
      badgeClass: rankClasses[index] || 'bg-gradient-to-r from-blue-500 to-blue-700',
      rowClass: index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
      isTopRank: index < 3,
    };
  }

  private handleCasinoClick(casinoSlug: string): void {
    // Track analytics
    this.trackEvent('casino_click', { casino: casinoSlug });
  }

  private handleRatingClick(casinoSlug: string): void {
    // Show rating breakdown modal or navigate to details
    this.trackEvent('rating_click', { casino: casinoSlug });
  }

  private handleBonusClick(casinoSlug: string): void {
    // Show bonus terms modal or navigate to casino
    this.trackEvent('bonus_click', { casino: casinoSlug });
  }

  private trackEvent(event: string, properties: Record<string, unknown>): void {
    // Analytics tracking would go here
    console.log(`Tracked: ${event}`, properties);
  }
}