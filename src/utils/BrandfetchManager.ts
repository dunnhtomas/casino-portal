/**
 * Brandfetch API Manager (Refactored)
 * 
 * Orchestrates logo operations using specialized components
 */

import type { BrandfetchOptions, CasinoLogo, Casino } from '../types/BrandfetchTypes';
import { BRANDFETCH_CONFIG } from '../config/BrandfetchConfig';
import { BrandfetchUrlBuilder } from './brandfetch/BrandfetchUrlBuilder';
import { FallbackChainGenerator } from './brandfetch/FallbackChainGenerator';
import { LogoVariantsGenerator } from './brandfetch/LogoVariantsGenerator';
import { LogoValidator } from './brandfetch/LogoValidator';

/**
 * Main manager class that coordinates logo operations
 */
export class BrandfetchManager {
  private readonly urlBuilder: BrandfetchUrlBuilder;
  private readonly fallbackGenerator: FallbackChainGenerator;
  private readonly variantsGenerator: LogoVariantsGenerator;
  private readonly validator: LogoValidator;

  constructor(clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
    this.urlBuilder = new BrandfetchUrlBuilder(clientId);
    this.fallbackGenerator = new FallbackChainGenerator(clientId);
    this.variantsGenerator = new LogoVariantsGenerator(clientId);
    this.validator = new LogoValidator();
  }

  /**
   * Generate Brandfetch logo URL
   */
  generateUrl(domain: string, options: BrandfetchOptions = {}): string {
    return this.urlBuilder.build(domain, options);
  }

  /**
   * Generate multiple logo variants
   */
  generateVariants(domain: string) {
    return this.variantsGenerator.generate(domain);
  }

  /**
   * Generate fallback chain for logo loading
   */
  generateFallbackChain(casino: Casino) {
    return this.fallbackGenerator.generate(casino);
  }

  /**
   * Update casino logo with Brandfetch API
   */
  updateCasinoLogo(casino: Casino): Casino {
    const domain = this.urlBuilder.extractDomain(casino.url);
    
    if (!domain) {
      console.warn(`Could not extract domain from ${casino.url}`);
      return casino;
    }

    if (this.validator.shouldUpdateLogo(casino.logo?.source)) {
      return this.applyNewLogo(casino, domain);
    }

    return casino;
  }

  /**
   * Extract domain from casino URL
   */
  extractDomain(url: string): string | null {
    return this.urlBuilder.extractDomain(url);
  }

  /**
   * Validate if URL is likely a working logo
   */
  isValidLogoUrl(url: string): boolean {
    return this.validator.isValidLogoUrl(url);
  }

  /**
   * Apply new logo to casino
   */
  private applyNewLogo(casino: Casino, domain: string): Casino {
    const newLogo: CasinoLogo = {
      url: this.generateUrl(domain, { 
        fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT 
      }),
      source: 'brandfetch-api',
      domain: domain,
      fallbackChain: this.generateFallbackChain(casino)
    };

    return {
      ...casino,
      logo: newLogo
    };
  }
}

// Export singleton instance
export const brandfetchManager = new BrandfetchManager();
