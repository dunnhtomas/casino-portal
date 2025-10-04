/**
 * CasinoDataTransformer
 * Single Responsibility: Transform raw casino data to domain types
 */

import type { Casino } from '../../core/types/DomainTypes';

export class CasinoDataTransformer {
  /**
   * Transform raw casino data to domain Casino type
   */
  static transformRawCasino(rawCasino: any): Casino {
    return {
      id: rawCasino.slug, // Use slug as ID for now
      slug: rawCasino.slug,
      name: rawCasino.brand, // Use brand as name
      brand: rawCasino.brand,
      domain: rawCasino.url,
      website: rawCasino.url, // Use URL as website
      reviewDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      ratings: {
        overall: rawCasino.overallRating || 0,
        security: rawCasino.ratings?.security || 0,
        payout: rawCasino.ratings?.payout || 0,
        bonusValue: rawCasino.ratings?.bonusValue || 0,
        games: rawCasino.ratings?.games || 0,
        mobile: rawCasino.ratings?.mobile || 0,
        support: rawCasino.ratings?.support || 0,
        reputation: rawCasino.ratings?.reputation || 0,
      },
      bonuses: {
        welcome: rawCasino.bonuses?.welcome ? {
          headline: rawCasino.bonuses.welcome.headline,
          amount: rawCasino.bonuses.welcome.amount || '0',
          percentage: rawCasino.bonuses.welcome.percentage || 0,
          maxAmount: rawCasino.bonuses.welcome.maxCashout || 0,
          wagering: rawCasino.bonuses.welcome.wagering || '35x',
          maxCashout: rawCasino.bonuses.welcome.maxCashout ? `$${rawCasino.bonuses.welcome.maxCashout}` : undefined,
        } : undefined,
        noDeposit: rawCasino.bonuses?.noDeposit ? {
          headline: rawCasino.bonuses.noDeposit.headline,
          amount: rawCasino.bonuses.noDeposit.amount || '0',
          wagering: rawCasino.bonuses.noDeposit.wagering || '35x',
          maxCashout: rawCasino.bonuses.noDeposit.maxCashout ? `$${rawCasino.bonuses.noDeposit.maxCashout}` : undefined,
        } : undefined,
        freeSpins: rawCasino.bonuses?.freeSpins ? {
          count: rawCasino.bonuses.freeSpins.count || 0,
          game: rawCasino.bonuses.freeSpins.game || 'Selected Games',
          value: rawCasino.bonuses.freeSpins.value || '$0.10',
          wagering: rawCasino.bonuses.freeSpins.wagering || '35x',
        } : undefined,
      },
      features: {
        gameProviders: rawCasino.providers || [],
        paymentMethods: rawCasino.banking || [],
        currencies: rawCasino.currencies || ['USD', 'EUR'],
        languages: rawCasino.languages || ['English'],
        licenses: rawCasino.licences || [],
      },
      safety: {
        yearsOnline: rawCasino.safety?.yearsOnline,
        licenses: rawCasino.licences || [],
        certification: rawCasino.safety?.certification || [],
        securityMeasures: rawCasino.safety?.securityMeasures || ['SSL Encryption'],
      },
      logo: rawCasino.logo ? {
        url: rawCasino.logo.url,
        alt: `${rawCasino.brand} Logo`,
        width: rawCasino.logo.width,
        height: rawCasino.logo.height,
      } : undefined,
    };
  }

  /**
   * Transform array of raw casinos
   */
  static transformRawCasinos(rawCasinos: any[]): Casino[] {
    return rawCasinos.map(rawCasino => this.transformRawCasino(rawCasino));
  }

  /**
   * Validate transformed casino data
   */
  static validateCasino(casino: Casino): string[] {
    const errors: string[] = [];

    if (!casino.id) errors.push('Casino ID is required');
    if (!casino.slug) errors.push('Casino slug is required');
    if (!casino.brand) errors.push('Casino brand name is required');
    if (!casino.domain) errors.push('Casino domain is required');
    
    // Validate ratings are within acceptable range
    Object.entries(casino.ratings).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 10) {
        errors.push(`Invalid ${key} rating: ${value}`);
      }
    });

    return errors;
  }
}