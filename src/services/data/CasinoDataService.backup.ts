/**
 * CasinoDataService
 * Single Responsibility: Handle all casino data access and caching
 */

import type { Casino } from '../../core/types/DomainTypes';
import type { ICasinoDataService } from '../../core/interfaces/ApplicationInterfaces';
import { APPLICATION_CONSTANTS } from '../../core/constants/ApplicationConstants';
import { CasinoDataTransformer } from '../../utils/formatters/CasinoDataTransformer';

export class CasinoDataService implements ICasinoDataService {
  private casinoCache = new Map<string, { data: Casino[]; timestamp: number }>();
  private dataPromise: Promise<Casino[]> | null = null;

  /**
   * Get casino by unique ID
   */
  async getCasinoById(id: string): Promise<Casino | null> {
    const casinos = await this.getAllCasinos();
    return casinos.find(casino => casino.id === id) || null;
  }

  /**
   * Get casino by URL slug
   */
  async getCasinoBySlug(slug: string): Promise<Casino | null> {
    const casinos = await this.getAllCasinos();
    return casinos.find(casino => casino.slug === slug) || null;
  }

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
   * Get top-rated casinos
   */
  async getTopCasinos(limit: number = APPLICATION_CONSTANTS.DISPLAY_CONFIG.TOP_CASINOS_LIMIT): Promise<Casino[]> {
    const casinos = await this.getAllCasinos();
    
    return casinos
      .filter(casino => casino.ratings.overall >= 7.0) // Minimum quality threshold
      .sort((a, b) => b.ratings.overall - a.ratings.overall)
      .slice(0, limit);
  }

  /**
   * Get casinos available in a specific region
   */
  async getCasinosByRegion(regionId: string): Promise<Casino[]> {
    const casinos = await this.getAllCasinos();
    
    // Filter casinos that operate in the specified region
    return casinos.filter(casino => 
      this.isCasinoAvailableInRegion(casino, regionId)
    );
  }

  /**
   * Get featured casinos for promotional display
   */
  async getFeaturedCasinos(limit: number = APPLICATION_CONSTANTS.DISPLAY_CONFIG.FEATURED_CASINOS_LIMIT): Promise<Casino[]> {
    const casinos = await this.getAllCasinos();
    
    return casinos
      .filter(casino => 
        casino.ratings.overall >= 8.0 && 
        casino.bonuses.welcome && 
        casino.safety.licenses.length > 0
      )
      .sort((a, b) => {
        // Sort by combination of rating and bonus value
        const scoreA = a.ratings.overall + (a.bonuses.welcome?.percentage || 0) / 100;
        const scoreB = b.ratings.overall + (b.bonuses.welcome?.percentage || 0) / 100;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Search casinos by criteria
   */
  async searchCasinos(criteria: CasinoSearchCriteria): Promise<Casino[]> {
    const casinos = await this.getAllCasinos();
    
    return casinos.filter(casino => {
      // Name search
      if (criteria.name && !casino.brand.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }

      // Rating filter
      if (criteria.minRating && casino.ratings.overall < criteria.minRating) {
        return false;
      }

      // License filter
      if (criteria.licenses && criteria.licenses.length > 0) {
        const hasRequiredLicense = criteria.licenses.some(license => 
          casino.safety.licenses.includes(license)
        );
        if (!hasRequiredLicense) return false;
      }

      // Payment method filter
      if (criteria.paymentMethods && criteria.paymentMethods.length > 0) {
        const hasRequiredPayment = criteria.paymentMethods.some(method => 
          casino.features.paymentMethods.includes(method)
        );
        if (!hasRequiredPayment) return false;
      }

      // Bonus requirement filter
      if (criteria.requiresBonus && !casino.bonuses.welcome) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get casino statistics
   */
  async getCasinoStatistics(): Promise<CasinoStatistics> {
    const casinos = await this.getAllCasinos();
    
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
   * Private helper methods
   */
  private async fetchCasinosFromSource(): Promise<Casino[]> {
    try {
      // Dynamic import to avoid blocking the main thread
      const casinoData = await import('../../../data/casinos.json');
      const rawCasinos = casinoData.default;
      
      // Transform raw data to domain types
      return CasinoDataTransformer.transformRawCasinos(rawCasinos);
    } catch (error) {
      console.error('Failed to load casino data:', error);
      return [];
    }
  }

  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    const ttl = APPLICATION_CONSTANTS.CACHE_CONFIG.CASINO_DATA_TTL * 1000; // Convert to milliseconds
    return (now - timestamp) < ttl;
  }

  private isCasinoAvailableInRegion(casino: Casino, regionId: string): boolean {
    // Simple region availability check
    // In a real application, this would check against a more sophisticated system
    const restrictedRegions = ['us', 'france', 'belgium']; // Example restrictions
    
    if (restrictedRegions.includes(regionId.toLowerCase())) {
      return casino.safety.licenses.some(license => 
        license.toLowerCase().includes('mga') || 
        license.toLowerCase().includes('ukgc')
      );
    }
    
    return true; // Available in most regions by default
  }

  private calculateAverageRating(casinos: Casino[]): number {
    if (casinos.length === 0) return 0;
    
    const sum = casinos.reduce((acc, casino) => acc + casino.ratings.overall, 0);
    return Math.round((sum / casinos.length) * 10) / 10;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.casinoCache.clear();
    this.dataPromise = null;
  }
}

/**
 * Supporting interfaces for the service
 */
export interface CasinoSearchCriteria {
  name?: string;
  minRating?: number;
  licenses?: string[];
  paymentMethods?: string[];
  requiresBonus?: boolean;
}

export interface CasinoStatistics {
  totalCasinos: number;
  averageRating: number;
  topRatedCount: number;
  licensedCount: number;
  withWelcomeBonusCount: number;
  withNoDepositBonusCount: number;
}