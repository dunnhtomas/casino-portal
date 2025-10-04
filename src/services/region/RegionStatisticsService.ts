/**
 * RegionStatisticsService  
 * Single Responsibility: Calculate and provide statistical data for regions
 */

import type { Casino, Region } from '../../core/types/DomainTypes';
import { RegionCasinoFilterService } from './RegionCasinoFilterService';

export interface RegionStatistics {
  readonly totalCasinos: number;
  readonly averageRating: number;
  readonly topRatedCasinoCount: number;
  readonly averageBonusAmount: number;
  readonly mostCommonLicenses: string[];
  readonly paymentMethodsAvailable: number;
  readonly lastUpdated: string;
}

export interface IRegionStatisticsService {
  getRegionStatistics(regionSlug: string): Promise<RegionStatistics>;
  calculateAverageRating(casinos: Casino[]): number;
  calculateAverageBonusAmount(casinos: Casino[]): number;
  getMostCommonLicenses(casinos: Casino[]): string[];
  getUniquePaymentMethods(casinos: Casino[]): string[];
}

export class RegionStatisticsService implements IRegionStatisticsService {
  private casinoFilterService = new RegionCasinoFilterService();

  /**
   * Get comprehensive statistics for a region
   */
  async getRegionStatistics(regionSlug: string): Promise<RegionStatistics> {
    const casinos = await this.casinoFilterService.getTopCasinosForRegion(regionSlug, 100);
    
    if (casinos.length === 0) {
      return this.getEmptyStatistics();
    }

    const averageRating = this.calculateAverageRating(casinos);
    const averageBonusAmount = this.calculateAverageBonusAmount(casinos);
    const mostCommonLicenses = this.getMostCommonLicenses(casinos);
    const uniquePaymentMethods = this.getUniquePaymentMethods(casinos);

    return {
      totalCasinos: casinos.length,
      averageRating,
      topRatedCasinoCount: casinos.filter(casino => casino.ratings.overall >= 8.5).length,
      averageBonusAmount,
      mostCommonLicenses,
      paymentMethodsAvailable: uniquePaymentMethods.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Calculate average rating across casinos
   */
  calculateAverageRating(casinos: Casino[]): number {
    if (casinos.length === 0) return 0;
    
    const sum = casinos.reduce((total, casino) => total + casino.ratings.overall, 0);
    return Math.round((sum / casinos.length) * 10) / 10;
  }

  /**
   * Calculate average bonus amount
   */
  calculateAverageBonusAmount(casinos: Casino[]): number {
    const casinosWithBonuses = casinos.filter(casino => 
      casino.bonuses.welcome && this.extractBonusAmount(casino.bonuses.welcome.headline)
    );
    
    if (casinosWithBonuses.length === 0) return 0;
    
    const sum = casinosWithBonuses.reduce((total, casino) => {
      const amount = casino.bonuses?.welcome?.headline ? this.extractBonusAmount(casino.bonuses.welcome.headline) : 0;
      return total + amount;
    }, 0);
    
    return Math.round(sum / casinosWithBonuses.length);
  }

  /**
   * Get most common licenses across casinos
   */
  getMostCommonLicenses(casinos: Casino[]): string[] {
    const licenseCount = new Map<string, number>();
    
    casinos.forEach(casino => {
      casino.features.licenses.forEach(license => {
        licenseCount.set(license, (licenseCount.get(license) || 0) + 1);
      });
    });
    
    return Array.from(licenseCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([license]) => license);
  }

  /**
   * Get unique payment methods available
   */
  getUniquePaymentMethods(casinos: Casino[]): string[] {
    const paymentMethods = new Set<string>();
    
    casinos.forEach(casino => {
      casino.features.paymentMethods.forEach(method => {
        paymentMethods.add(method);
      });
    });
    
    return Array.from(paymentMethods);
  }

  /**
   * Extract numeric bonus amount from headline
   */
  private extractBonusAmount(headline: string): number {
    if (!headline) return 0;
    
    // Match patterns like €500, $1000, 500€, etc.
    const matches = headline.match(/[€$£¥₹]?(\d+)[€$£¥₹]?/);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  /**
   * Get empty statistics object
   */
  private getEmptyStatistics(): RegionStatistics {
    return {
      totalCasinos: 0,
      averageRating: 0,
      topRatedCasinoCount: 0,
      averageBonusAmount: 0,
      mostCommonLicenses: [],
      paymentMethodsAvailable: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}