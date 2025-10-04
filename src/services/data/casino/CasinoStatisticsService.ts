/**
 * CasinoStatisticsService
 * Handles statistics and aggregation operations
 */

import type { Casino } from '../../../core/types/DomainTypes';
import { CasinoRepository } from './CasinoRepository';

export interface CasinoStatistics {
  totalCasinos: number;
  averageRating: number;
  topRatedCount: number;
  licensedCount: number;
  withWelcomeBonusCount: number;
  withNoDepositBonusCount: number;
}

export class CasinoStatisticsService {
  constructor(private repository: CasinoRepository) {}

  /**
   * Get casino statistics
   */
  async getCasinoStatistics(): Promise<CasinoStatistics> {
    const casinos = await this.repository.getAllCasinos();
    
    return {
      totalCasinos: casinos.length,
      averageRating: this.calculateAverageRating(casinos),
      topRatedCount: casinos.filter(c => c.ratings.overall >= 9.0).length,
      licensedCount: casinos.filter(c => c.safety.licenses.length > 0).length,
      withWelcomeBonusCount: casinos.filter(c => c.bonuses.welcome).length,
      withNoDepositBonusCount: casinos.filter(c => c.bonuses.noDeposit).length,
    };
  }

  /**
   * Calculate average rating across all casinos
   */
  private calculateAverageRating(casinos: Casino[]): number {
    if (casinos.length === 0) return 0;
    
    const sum = casinos.reduce((acc, casino) => acc + casino.ratings.overall, 0);
    return Math.round((sum / casinos.length) * 10) / 10;
  }
}
