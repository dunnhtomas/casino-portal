/**
 * CasinoRepository
 * Responsible for data fetching and caching
 */

import type { Casino } from '../../../core/types/DomainTypes';
import { APPLICATION_CONSTANTS } from '../../../core/constants/ApplicationConstants';
import { CasinoDataTransformer } from '../../../utils/formatters/CasinoDataTransformer';

export class CasinoRepository {
  private casinoCache = new Map<string, { data: Casino[]; timestamp: number }>();
  private dataPromise: Promise<Casino[]> | null = null;

  /**
   * Get all casinos with caching
   */
  async getAllCasinos(): Promise<Casino[]> {
    const cacheKey = 'all_casinos';
    const cached = this.casinoCache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Prevent multiple concurrent requests
    if (!this.dataPromise) {
      this.dataPromise = this.fetchCasinosFromSource();
    }

    const casinos = await this.dataPromise;
    this.dataPromise = null;

    // Cache the results
    this.casinoCache.set(cacheKey, {
      data: casinos,
      timestamp: Date.now()
    });

    return casinos;
  }

  /**
   * Fetch casinos from data source
   */
  private async fetchCasinosFromSource(): Promise<Casino[]> {
    try {
      const casinoData = await import('../../../../data/casinos.json');
      const rawCasinos = casinoData.default;
      return CasinoDataTransformer.transformRawCasinos(rawCasinos);
    } catch (error) {
      console.error('Failed to load casino data:', error);
      return [];
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    const ttl = APPLICATION_CONSTANTS.CACHE_CONFIG.CASINO_DATA_TTL * 1000;
    return (now - timestamp) < ttl;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.casinoCache.clear();
    this.dataPromise = null;
  }
}
