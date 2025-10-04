/**
 * Brandfetch API Integration for Casino Logos
 * 
 * This utility provides high-quality casino logos using the Brandfetch API
 * with robust fallback handling for reliability.
 */

// Type definitions
interface LogoFallbackItem {
  url: string;
  source: string;
  description: string;
}

interface BrandfetchOptions {
  type?: string;
  theme?: string;
  fallback?: string;
  width?: number;
  height?: number;
  clientId?: string;
}

interface CasinoLogo {
  url?: string;
  source?: string;
  domain?: string;
  fallbackChain?: LogoFallbackItem[];
}

interface Casino {
  url: string;
  logo?: CasinoLogo;
  [key: string]: any;
}

// Brandfetch API configuration
const BRANDFETCH_CONFIG = {
  // Production Brandfetch client ID
  CLIENT_ID: '1idIddY-Tpnlw76kxJR',
  BASE_URL: 'https://cdn.brandfetch.io',
  
  // Logo types available
  LOGO_TYPES: {
    ICON: 'icon',      // Social profile icon
    LOGO: 'logo',      // Horizontal logo for large surfaces  
    SYMBOL: 'symbol'   // Universal brand mark
  },
  
  // Theme options
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  
  // Fallback options
  FALLBACKS: {
    BRANDFETCH: 'brandfetch',    // Brandfetch logo (default)
    TRANSPARENT: 'transparent',   // See-through placeholder
    LETTERMARK: 'lettermark',    // Square icon with first letter
    NOT_FOUND: '404'             // HTTP 404 and transparent placeholder
  }
};

/**
 * Generate Brandfetch logo URL
 * @param {string} domain - Casino domain (e.g., 'unlimluck.com')
 * @param {BrandfetchOptions} options - Logo configuration options
 * @returns {string} Brandfetch API URL
 */
export function generateBrandfetchUrl(domain: string, options: BrandfetchOptions = {}): string {
  const {
    type = BRANDFETCH_CONFIG.LOGO_TYPES.LOGO,
    theme = BRANDFETCH_CONFIG.THEMES.LIGHT,
    fallback = BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT,
    width = 128,
    height = 64,
    clientId = BRANDFETCH_CONFIG.CLIENT_ID
  } = options;

  // Clean domain (remove www, protocol, paths)
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  // Build URL with parameters
  const url = new URL(`${BRANDFETCH_CONFIG.BASE_URL}/${cleanDomain}`);
  
  // Add query parameters
  url.searchParams.set('c', clientId);
  
  // Add optional parameters if specified
  if (type !== BRANDFETCH_CONFIG.LOGO_TYPES.LOGO) {
    url.searchParams.set('type', type);
  }
  if (theme !== BRANDFETCH_CONFIG.THEMES.LIGHT) {
    url.searchParams.set('theme', theme);
  }
  if (fallback !== BRANDFETCH_CONFIG.FALLBACKS.BRANDFETCH) {
    url.searchParams.set('fallback', fallback);
  }
  if (width) {
    url.searchParams.set('w', width.toString());
  }
  if (height) {
    url.searchParams.set('h', height.toString());
  }

  return url.toString();
}

/**
 * Generate multiple logo URLs for different use cases
 * @param {string} domain - Casino domain
 * @param {string} clientId - Brandfetch client ID
 * @returns {Object} Multiple logo URL variants
 */
export function generateLogoVariants(domain: string, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
  return {
    // Standard logo for most use cases
    standard: generateBrandfetchUrl(domain, {
      clientId,
      width: 128,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    }),
    
    // Icon for small spaces
    icon: generateBrandfetchUrl(domain, {
      clientId,
      type: BRANDFETCH_CONFIG.LOGO_TYPES.ICON,
      width: 64,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.LETTERMARK
    }),
    
    // High resolution for retina displays
    highRes: generateBrandfetchUrl(domain, {
      clientId,
      width: 256,
      height: 128,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    }),
    
    // Dark theme variant
    dark: generateBrandfetchUrl(domain, {
      clientId,
      theme: BRANDFETCH_CONFIG.THEMES.DARK,
      width: 128,
      height: 64,
      fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT
    })
  };
}

/**
 * Extract domain from casino URL
 * @param {string} url - Full casino URL
 * @returns {string|null} Extracted domain or null if invalid
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return null;
  }
}

/**
 * Generate fallback chain for logo loading
 * @param {Object} casino - Casino data object
 * @param {string} clientId - Brandfetch client ID
 * @returns {Array} Array of logo URLs in fallback order
 */
export function generateFallbackChain(casino: Casino, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID): LogoFallbackItem[] {
  const domain = extractDomain(casino.url);
  const fallbackChain: LogoFallbackItem[] = [];

  if (domain) {
    // Primary: Brandfetch API
    fallbackChain.push({
      url: generateBrandfetchUrl(domain, { 
        clientId, 
        fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT 
      }),
      source: 'brandfetch-api',
      description: 'High-quality Brandfetch logo'
    });

    // Secondary: Brandfetch with lettermark fallback
    fallbackChain.push({
      url: generateBrandfetchUrl(domain, { 
        clientId, 
        type: BRANDFETCH_CONFIG.LOGO_TYPES.ICON,
        fallback: BRANDFETCH_CONFIG.FALLBACKS.LETTERMARK 
      }),
      source: 'brandfetch-lettermark',
      description: 'Brandfetch lettermark fallback'
    });
  }

  // Tertiary: Local fallback if exists
  if (casino.logo?.url?.startsWith('/images/casinos/')) {
    fallbackChain.push({
      url: casino.logo.url,
      source: 'local-fallback',
      description: 'Local casino logo image'
    });
  }

  // Final: Generic casino icon
  fallbackChain.push({
    url: '/images/casinos/default-casino.svg',
    source: 'generic-fallback',
    description: 'Generic casino icon'
  });

  return fallbackChain;
}

/**
 * Validate if a URL is likely to be a working logo
 * @param {string} url - Logo URL to validate
 * @returns {boolean} True if URL appears valid
 */
export function isValidLogoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for common problematic patterns
  const problematicPatterns = [
    /google\.com\/s2\/favicons/, // Google favicon service
    /favicon\.ico$/,            // Direct favicon files
    /\.(txt|json|html)$/,       // Non-image files
  ];

  return !problematicPatterns.some(pattern => pattern.test(url));
}

/**
 * Update casino logo with Brandfetch API
 * @param {Object} casino - Casino data object
 * @param {string} clientId - Brandfetch client ID
 * @returns {Object} Updated casino object with new logo
 */
export function updateCasinoLogo(casino: Casino, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID): Casino {
  const domain = extractDomain(casino.url);
  
  if (!domain) {
    console.warn(`Could not extract domain from ${casino.url} for ${casino.brand}`);
    return casino;
  }

  const currentSource = casino.logo?.source;
  
  // Only update problematic sources
  if (currentSource === 'google-favicon-fallback' || currentSource === 'local-fallback') {
    const newLogo = {
      url: generateBrandfetchUrl(domain, { 
        clientId,
        fallback: BRANDFETCH_CONFIG.FALLBACKS.TRANSPARENT 
      }),
      source: 'brandfetch-api',
      domain: domain,
      fallbackChain: generateFallbackChain(casino, clientId),
      updatedAt: new Date().toISOString()
    };

    return {
      ...casino,
      logo: newLogo
    };
  }

  return casino;
}

export default {
  generateBrandfetchUrl,
  generateLogoVariants,
  extractDomain,
  generateFallbackChain,
  isValidLogoUrl,
  updateCasinoLogo,
  BRANDFETCH_CONFIG
};