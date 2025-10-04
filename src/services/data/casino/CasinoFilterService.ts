/**
 * CasinoFilterService
 * Handles filtering and sorting operations
 */

import type { Casino } from '../../../core/types/DomainTypes';
import { APPLICATION_CONSTANTS } from '../../../core/constants/ApplicationConstants';
import { CasinoRepository } from './CasinoRepository';

export class CasinoFilterService {
  constructor(private repository: CasinoRepository) {}

  /**
   * Get top-rated casinos
   */
  async getTopCasinos(limit: number = APPLICATION_CONSTANTS.DISPLAY_CONFIG.TOP_CASINOS_LIMIT): Promise<Casino[]> {
    const casinos = await this.repository.getAllCasinos();
    
    return casinos
      .filter(casino => casino.ratings.overall >= 7.0)
      .sort((a, b) => b.ratings.overall - a.ratings.overall)
      .slice(0, limit);
  }

  /**
   * Get featured casinos for promotional display
   */
  async getFeaturedCasinos(limit: number = APPLICATION_CONSTANTS.DISPLAY_CONFIG.FEATURED_CASINOS_LIMIT): Promise<Casino[]> {
    const casinos = await this.repository.getAllCasinos();
    
    return casinos
      .filter(casino => 
        casino.ratings.overall >= 8.0 && 
        casino.bonuses.welcome && 
        casino.safety.licenses.length > 0
      )
      .sort((a, b) => {
        const scoreA = a.ratings.overall + (a.bonuses.welcome?.percentage || 0) / 100;
        const scoreB = b.ratings.overall + (b.bonuses.welcome?.percentage || 0) / 100;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
}
