/**
 * URL Builder for Brandfetch API
 * Handles URL construction and parameter management
 */

import type { BrandfetchOptions } from '../../types/BrandfetchTypes';
import { BRANDFETCH_CONFIG } from '../../config/BrandfetchConfig';

export class BrandfetchUrlBuilder {
  private readonly clientId: string;

  constructor(clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
    this.clientId = clientId;
  }

  /**
   * Build complete Brandfetch URL with all parameters
   */
  build(domain: string, options: BrandfetchOptions = {}): string {
    const cleanDomain = this.cleanDomain(domain);
    return this.constructUrl(cleanDomain, options);
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  /**
   * Clean domain string
   */
  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
  }

  /**
   * Construct full URL with parameters
   */
  private constructUrl(domain: string, options: BrandfetchOptions): string {
    const {
      type = BRANDFETCH_CONFIG.LOGO_TYPES.LOGO,
      theme = BRANDFETCH_CONFIG.THEMES.LIGHT,
      fallback = BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT,
      width = 128,
      height = 64
    } = options;

    const url = new URL(`${BRANDFETCH_CONFIG.BASE_URL}/${domain}`);
    url.searchParams.set('c', this.clientId);
    
    this.addOptionalParameters(url, { type, theme, fallback, width, height });
    
    return url.toString();
  }

  /**
   * Add optional parameters to URL
   */
  private addOptionalParameters(
    url: URL, 
    params: { type: string; theme: string; fallback: string; width?: number; height?: number }
  ): void {
    if (params.type !== BRANDFETCH_CONFIG.LOGO_TYPES.LOGO) {
      url.searchParams.set('type', params.type);
    }
    if (params.theme !== BRANDFETCH_CONFIG.THEMES.LIGHT) {
      url.searchParams.set('theme', params.theme);
    }
    if (params.fallback !== BRANDFETCH_CONFIG.FALLBACKS.BRANDFETCH) {
      url.searchParams.set('fallback', params.fallback);
    }
    if (params.width) {
      url.searchParams.set('w', params.width.toString());
    }
    if (params.height) {
      url.searchParams.set('h', params.height.toString());
    }
  }
}
