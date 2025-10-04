/**
 * CasinoQueryService
 * Handles direct queries for specific casinos
 */

import type { Casino } from '../../../core/types/DomainTypes';
import { CasinoRepository } from './CasinoRepository';

export interface CasinoSearchCriteria {
  name?: string;
  minRating?: number;
  licenses?: string[];
  paymentMethods?: string[];
  requiresBonus?: boolean;
}

export class CasinoQueryService {
  constructor(private repository: CasinoRepository) {}

  /**
   * Get casino by unique ID
   */
  async getCasinoById(id: string): Promise<Casino | null> {
    const casinos = await this.repository.getAllCasinos();
    return casinos.find(casino => casino.id === id) || null;
  }

  /**
   * Get casino by URL slug
   */
  async getCasinoBySlug(slug: string): Promise<Casino | null> {
    const casinos = await this.repository.getAllCasinos();
    return casinos.find(casino => casino.slug === slug) || null;
  }

  /**
   * Get casinos available in a specific region
   */
  async getCasinosByRegion(regionId: string): Promise<Casino[]> {
    const casinos = await this.repository.getAllCasinos();
    return casinos.filter(casino => 
      this.isCasinoAvailableInRegion(casino, regionId)
    );
  }

  /**
   * Search casinos by criteria
   */
  async searchCasinos(criteria: CasinoSearchCriteria): Promise<Casino[]> {
    const casinos = await this.repository.getAllCasinos();
    
    return casinos.filter(casino => {
      if (criteria.name && !casino.brand.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }

      if (criteria.minRating && casino.ratings.overall < criteria.minRating) {
        return false;
      }

      if (criteria.licenses && criteria.licenses.length > 0) {
        const hasRequiredLicense = criteria.licenses.some(license => 
          casino.safety.licenses.includes(license)
        );
        if (!hasRequiredLicense) return false;
      }

      if (criteria.paymentMethods && criteria.paymentMethods.length > 0) {
        const hasRequiredPayment = criteria.paymentMethods.some(method => 
          casino.features.paymentMethods.includes(method)
        );
        if (!hasRequiredPayment) return false;
      }

      if (criteria.requiresBonus && !casino.bonuses.welcome) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if casino is available in region
   */
  private isCasinoAvailableInRegion(casino: Casino, regionId: string): boolean {
    const restrictedRegions = ['us', 'france', 'belgium'];
    
    if (restrictedRegions.includes(regionId.toLowerCase())) {
      return casino.safety.licenses.some(license => 
        license.toLowerCase().includes('mga') || 
        license.toLowerCase().includes('ukgc')
      );
    }
    
    return true;
  }
}
