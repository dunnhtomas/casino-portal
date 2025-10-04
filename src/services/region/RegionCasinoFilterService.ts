/**
 * RegionCasinoFilterService
 * Single Responsibility: Filter and rank casinos by region-specific criteria
 */

import type { Casino } from '../../core/types/DomainTypes';
import { CasinoDataService } from '../data/CasinoDataService';

export interface IRegionCasinoFilterService {
  getTopCasinosForRegion(regionSlug: string, limit?: number): Promise<Casino[]>;
  filterCasinosByRegionRestrictions(casinos: Casino[], regionSlug: string): Casino[];
  rankCasinosForRegion(casinos: Casino[], regionSlug: string): Casino[];
}

export class RegionCasinoFilterService implements IRegionCasinoFilterService {
  private casinoService = new CasinoDataService();

  /**
   * Get top casinos for a specific region
   */
  async getTopCasinosForRegion(regionSlug: string, limit = 20): Promise<Casino[]> {
    const allCasinos = await this.casinoService.getAllCasinos();
    const filteredCasinos = this.filterCasinosByRegionRestrictions(allCasinos, regionSlug);
    const rankedCasinos = this.rankCasinosForRegion(filteredCasinos, regionSlug);
    
    return rankedCasinos.slice(0, limit);
  }

  /**
   * Filter casinos based on region restrictions
   */
  filterCasinosByRegionRestrictions(casinos: Casino[], regionSlug: string): Casino[] {
    return casinos.filter(casino => {
      // Check if casino accepts players from this region
      if (casino.features.restrictedCountries?.includes(this.getCountryCodeForRegion(regionSlug))) {
        return false;
      }

      // Check if casino has required licenses for this region  
      const requiredLicenses = this.getRequiredLicensesForRegion(regionSlug);
      if (requiredLicenses.length > 0) {
        const hasRequiredLicense = requiredLicenses.some(license => 
          casino.features.licenses.includes(license)
        );
        if (!hasRequiredLicense) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Rank casinos specifically for region preferences
   */
  rankCasinosForRegion(casinos: Casino[], regionSlug: string): Casino[] {
    const regionPreferences = this.getRegionPreferences(regionSlug);
    
    return casinos.sort((a, b) => {
      let scoreA = a.ratings.overall;
      let scoreB = b.ratings.overall;

      // Boost score for region-preferred payment methods
      if (regionPreferences.preferredPaymentMethods) {
        const aHasPreferred = regionPreferences.preferredPaymentMethods.some(method =>
          a.features.paymentMethods.includes(method)
        );
        const bHasPreferred = regionPreferences.preferredPaymentMethods.some(method =>
          b.features.paymentMethods.includes(method)
        );
        
        if (aHasPreferred && !bHasPreferred) scoreA += 0.5;
        if (bHasPreferred && !aHasPreferred) scoreB += 0.5;
      }

      // Boost score for region-preferred currencies
      if (regionPreferences.preferredCurrency) {
        if (a.features.currencies?.includes(regionPreferences.preferredCurrency)) scoreA += 0.3;
        if (b.features.currencies?.includes(regionPreferences.preferredCurrency)) scoreB += 0.3;
      }

      // Boost score for local language support
      if (regionPreferences.preferredLanguages) {
        const aHasLanguage = regionPreferences.preferredLanguages.some(lang =>
          a.features.languages?.includes(lang)
        );
        const bHasLanguage = regionPreferences.preferredLanguages.some(lang =>
          b.features.languages?.includes(lang)
        );
        
        if (aHasLanguage && !bHasLanguage) scoreA += 0.2;
        if (bHasLanguage && !aHasLanguage) scoreB += 0.2;
      }

      return scoreB - scoreA;
    });
  }

  /**
   * Get country code for region
   */
  private getCountryCodeForRegion(regionSlug: string): string {
    const regionCountryMap: Record<string, string> = {
      'alberta': 'CA',
      'british-columbia': 'CA', 
      'ontario': 'CA',
    };
    
    return regionCountryMap[regionSlug] || '';
  }

  /**
   * Get required licenses for region
   */
  private getRequiredLicensesForRegion(regionSlug: string): string[] {
    const regionLicenseMap: Record<string, string[]> = {
      'alberta': ['AGLC'],
      'british-columbia': ['BCLC'],
      'ontario': ['AGCO', 'iGaming Ontario'],
    };
    
    return regionLicenseMap[regionSlug] || [];
  }

  /**
   * Get region-specific preferences for ranking
   */
  private getRegionPreferences(regionSlug: string) {
    const preferencesMap: Record<string, any> = {
      'alberta': {
        preferredPaymentMethods: ['Interac', 'Credit Card', 'PayPal'],
        preferredCurrency: 'CAD',
        preferredLanguages: ['en'],
      },
      'british-columbia': {
        preferredPaymentMethods: ['Interac', 'Credit Card', 'PayPal'],
        preferredCurrency: 'CAD',
        preferredLanguages: ['en'],
      },
      'ontario': {
        preferredPaymentMethods: ['Interac', 'Credit Card', 'PayPal'],
        preferredCurrency: 'CAD', 
        preferredLanguages: ['en', 'fr'],
      },
    };
    
    return preferencesMap[regionSlug] || {};
  }
}