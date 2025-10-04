/**
 * Logo Variants Generator
 * Creates multiple logo variations for different use cases
 */

import { BRANDFETCH_CONFIG } from '../../config/BrandfetchConfig';
import { BrandfetchUrlBuilder } from './BrandfetchUrlBuilder';

export interface LogoVariants {
  standard: string;
  icon: string;
  highRes: string;
  dark: string;
}

export class LogoVariantsGenerator {
  private readonly urlBuilder: BrandfetchUrlBuilder;

  constructor(clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
    this.urlBuilder = new BrandfetchUrlBuilder(clientId);
  }

  /**
   * Generate all logo variants for a domain
   */
  generate(domain: string): LogoVariants {
    return {
      standard: this.generateStandard(domain),
      icon: this.generateIcon(domain),
      highRes: this.generateHighRes(domain),
      dark: this.generateDark(domain)
    };
  }

  private generateStandard(domain: string): string {
    return this.urlBuilder.build(domain, {
      width: 128,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    });
  }

  private generateIcon(domain: string): string {
    return this.urlBuilder.build(domain, {
      type: BRANDFETCH_CONFIG.LOGO_TYPES.ICON,
      width: 64,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.LETTERMARK
    });
  }

  private generateHighRes(domain: string): string {
    return this.urlBuilder.build(domain, {
      width: 256,
      height: 128,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    });
  }

  private generateDark(domain: string): string {
    return this.urlBuilder.build(domain, {
      theme: BRANDFETCH_CONFIG.THEMES.DARK,
      width: 128,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    });
  }
}
