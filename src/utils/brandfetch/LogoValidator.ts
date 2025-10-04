/**
 * Logo Validator
 * Validates logo URLs and determines update strategies
 */

export class LogoValidator {
  /**
   * Validate if URL is likely a working logo
   */
  isValidLogoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const problematicPatterns = [
      /google\.com\/s2\/favicons/,
      /favicon\.ico$/,
      /\.(txt|json|html)$/,
    ];

    return !problematicPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Check if logo source should be updated
   */
  shouldUpdateLogo(source?: string): boolean {
    const problematicSources = [
      'google-favicon-fallback',
      'local-fallback'
    ];
    
    return source !== undefined && problematicSources.includes(source);
  }
}
