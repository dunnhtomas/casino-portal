/**
 * Fallback Chain Generator
 * Creates multi-level fallback strategies for logo loading
 */

import type { Casino, LogoFallbackItem } from '../../types/BrandfetchTypes';
import { BRANDFETCH_CONFIG } from '../../config/BrandfetchConfig';
import { BrandfetchUrlBuilder } from './BrandfetchUrlBuilder';

export class FallbackChainGenerator {
  private readonly urlBuilder: BrandfetchUrlBuilder;

  constructor(clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
    this.urlBuilder = new BrandfetchUrlBuilder(clientId);
  }

  /**
   * Generate complete fallback chain for casino logo
   */
  generate(casino: Casino): LogoFallbackItem[] {
    const domain = this.urlBuilder.extractDomain(casino.url);
    const fallbackChain: LogoFallbackItem[] = [];

    if (domain) {
      this.addBrandfetchFallbacks(fallbackChain, domain);
    }

    this.addLocalFallbacks(fallbackChain, casino);
    this.addGenericFallback(fallbackChain);

    return fallbackChain;
  }

  /**
   * Add Brandfetch API fallbacks
   */
  private addBrandfetchFallbacks(chain: LogoFallbackItem[], domain: string): void {
    // Primary: Standard logo with transparent fallback
    chain.push({
      url: this.urlBuilder.build(domain, { 
        fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT 
      }),
      source: 'brandfetch-api',
      description: 'High-quality Brandfetch logo'
    });

    // Secondary: Icon with lettermark fallback
    chain.push({
      url: this.urlBuilder.build(domain, { 
        type: BRANDFETCH_CONFIG.LOGO_TYPES.ICON,
        fallback: BRANDFETCH_CONFIG.FALLBACKS.LETTERMARK 
      }),
      source: 'brandfetch-lettermark',
      description: 'Brandfetch lettermark fallback'
    });
  }

  /**
   * Add local fallback options
   */
  private addLocalFallbacks(chain: LogoFallbackItem[], casino: Casino): void {
    if (casino.logo?.url?.startsWith('/images/casinos/')) {
      chain.push({
        url: casino.logo.url,
        source: 'local-fallback',
        description: 'Local casino logo image'
      });
    }
  }

  /**
   * Add generic fallback
   */
  private addGenericFallback(chain: LogoFallbackItem[]): void {
    chain.push({
      url: '/images/casinos/default-casino.svg',
      source: 'generic-fallback',
      description: 'Generic casino icon'
    });
  }
}
