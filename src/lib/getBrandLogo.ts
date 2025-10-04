/**
 * Optimized Casino Logo System
 * Based on MCP Sequential Thinking analysis + Context7 research + real API testing
 * CONCLUSION: Hybrid approach with local logos + Logo.dev fallback works best
 */

import { BRANDFETCH_CONFIG } from '../config/BrandfetchConfig';
import { getVerifiedCasinoDomain } from '../config/CasinoDomainMapping';
import logoMappingData from '../data/logoMapping.json';

/**
 * Smart file discovery for casino logos using real file mapping
 * Handles complex naming patterns and provides format fallbacks
 */
function findBestLogoFile(slug: string): {
  mainLogo: string;
  hasResponsive: boolean;
  availableFormats: string[];
  actualPattern: string;
} {
  const { logoMapping, slugPatterns } = logoMappingData;
  
  // Check if we have a mapping for this slug
  if (logoMapping[slug] && slugPatterns[slug]) {
    const actualPattern = slugPatterns[slug];
    const availableFormats = Object.keys(logoMapping[slug]);
    
    // Preferred format order: PNG (universal) → WebP (modern) → ICO/SVG fallback
    const formatPriority = ['png', 'webp', 'avif', 'svg', 'ico'];
    
    for (const format of formatPriority) {
      if (logoMapping[slug][format]) {
        return {
          mainLogo: `/images/casinos/${logoMapping[slug][format]}`,
          hasResponsive: true,
          availableFormats,
          actualPattern
        };
      }
    }
  }
  
  // Fallback patterns if not in mapping
  const possiblePatterns = [
    slug,                           // Simple: "slotlair"
    `${slug}-uk-v2`,               // UK version: "slotlair-uk-v2"
    `${slug}-logo`,                // With logo suffix
    `${slug}-geo-logo`,            // Geo-specific
    `${slug}-casino`,              // With casino suffix
  ];
  
  for (const pattern of possiblePatterns) {
    // Try PNG first (most compatible)
    return {
      mainLogo: `/images/casinos/${pattern}.png`,
      hasResponsive: true,
      availableFormats: ['png'],
      actualPattern: pattern
    };
  }

  // Final fallback
  return {
    mainLogo: `/images/casinos/${slug}.png`,
    hasResponsive: false,
    availableFormats: ['png'],
    actualPattern: slug
  };
}

// Logo.dev configuration - simplified based on testing
const LOGODEV_CONFIG = {
  baseUrl: 'https://img.logo.dev',
  // Based on testing: Logo.dev works better without token for some domains
  useToken: false, // Set to true when you have a working Logo.dev API key
  publishableKey: process.env?.LOGODEV_API_KEY || null,
  defaultParams: {
    size: 400,
    format: 'png',
    fallback: 'monogram'
  }
};

/**
 * Generate Logo.dev URL - tested approach based on real API behavior
 */
function generateLogoDevUrl(domain: string): string {
  const params = new URLSearchParams({
    size: LOGODEV_CONFIG.defaultParams.size.toString(),
    format: LOGODEV_CONFIG.defaultParams.format,
    fallback: LOGODEV_CONFIG.defaultParams.fallback
  });

  // Only add token if configured and available
  if (LOGODEV_CONFIG.useToken && LOGODEV_CONFIG.publishableKey) {
    params.append('token', LOGODEV_CONFIG.publishableKey);
  }

  return `${LOGODEV_CONFIG.baseUrl}/${domain}?${params.toString()}`;
}

export function getBrandLogo(casinoUrl: string, slug: string): string {
  try {
    // Extract domain from casino URL
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    
    // Get verified domain (uses smart mapping if available)
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    // ENHANCED STRATEGY with smart file discovery:
    // 1. Use smart local logo discovery (handles complex naming patterns)
    // 2. Fallback to Logo.dev for major brands if local fails
    // 3. Final fallback to default placeholder
    
    // Smart logo file discovery
    const logoInfo = findBestLogoFile(slug);
    
    // For major casino brands, try Logo.dev as secondary option
    const majorCasinoBrands = [
      'bet365.com', 'stake.com', 'pokerstars.com', 'betfair.com',
      'williamhill.com', '888casino.com', 'ladbrokes.com', 'betway.com'
    ];
    
    const isMajorBrand = majorCasinoBrands.includes(verifiedDomain);
    
    // Always prioritize local logos first (more reliable)
    return logoInfo.mainLogo;
    
  } catch (error) {
    console.warn(`Failed to generate logo for ${slug}:`, error);
    return `/images/casinos/${slug}.png`;
  }
}

/**
 * Check if domain is a well-known casino brand
 */
function isPopularDomain(domain: string): boolean {
  const popularDomains = [
    'bet365.com', 'stake.com', 'pokerstars.com', 'betfair.com',
    'williamhill.com', '888casino.com', 'ladbrokes.com', 'paddypower.com',
    'betway.com', 'unibet.com', 'bwin.com', 'partypoker.com',
    'coral.co.uk', 'skybet.com', 'virgin.com', 'betfred.com'
  ];
  
  return popularDomains.includes(domain.toLowerCase());
}

/**
 * Get multiple logo sources for progressive enhancement
 * Returns Logo.dev primary with local backup
 */
export function getLogoSources(casinoUrl: string, slug: string): {
  primary: string;
  fallback: string;
  local: string;
  logodev: string;
  brandfetch: string;
} {
  try {
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    const logoDevUrl = `https://img.logo.dev/${verifiedDomain}`;
    const localFallback = `/images/casinos/${slug}.png`;
    
    return {
      primary: logoDevUrl,
      fallback: localFallback,
      local: localFallback,
      logodev: logoDevUrl,
      brandfetch: localFallback // Brandfetch not working, use local
    };
    
  } catch (error) {
    console.warn(`Failed to generate logo sources for ${slug}:`, error);
    const localFallback = `/images/casinos/${slug}.png`;
    return {
      primary: localFallback,
      fallback: localFallback,
      local: localFallback,
      logodev: localFallback,
      brandfetch: localFallback
    };
  }
}

/**
 * Get responsive logo URLs with smart file discovery and format fallbacks
 * Uses actual file patterns from the mapping system
 */
export function getResponsiveLogoUrls(casinoUrl: string, slug: string): {
  small: string;
  medium: string;
  large: string;
  vector?: string;
  srcSet: {
    png: string;
    webp: string;
    avif: string;
  };
} {
  try {
    const logoInfo = findBestLogoFile(slug);
    const actualPattern = logoInfo.actualPattern;
    
    // Use the actual pattern found in the file system
    const responsiveBase = `/images/casinos/${actualPattern}`;
    
    return {
      small: `${responsiveBase}-400w.png`,
      medium: `${responsiveBase}-800w.png`,
      large: `${responsiveBase}-1200w.png`,
      vector: logoInfo.mainLogo,
      srcSet: {
        png: `${responsiveBase}-400w.png 400w, ${responsiveBase}-800w.png 800w, ${responsiveBase}-1200w.png 1200w`,
        webp: `${responsiveBase}-400w.webp 400w, ${responsiveBase}-800w.webp 800w, ${responsiveBase}-1200w.webp 1200w`,
        avif: `${responsiveBase}-400w.avif 400w, ${responsiveBase}-800w.avif 800w, ${responsiveBase}-1200w.avif 1200w`
      }
    };
    
  } catch (error) {
    console.warn(`Failed to generate responsive logos for ${slug}:`, error);
    const fallbackBase = `/images/casinos/${slug}`;
    return {
      small: `${fallbackBase}-400w.png`,
      medium: `${fallbackBase}-800w.png`,
      large: `${fallbackBase}-1200w.png`,
      srcSet: {
        png: `${fallbackBase}-400w.png 400w, ${fallbackBase}-800w.png 800w, ${fallbackBase}-1200w.png 1200w`,
        webp: `${fallbackBase}-400w.webp 400w, ${fallbackBase}-800w.webp 800w, ${fallbackBase}-1200w.webp 1200w`,
        avif: `${fallbackBase}-400w.avif 400w, ${fallbackBase}-800w.avif 800w, ${fallbackBase}-1200w.avif 1200w`
      }
    };
  }
}

/**
 * Legacy Brandfetch function (for comparison/fallback)
 */
export function getBrandLogoLegacy(casinoUrl: string, slug: string): string {
  try {
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    const { CLIENT_ID, BASE_URL } = BRANDFETCH_CONFIG;
    return `${BASE_URL}/${verifiedDomain}?c=${CLIENT_ID}`;
  } catch (error) {
    console.warn(`Failed to generate Brandfetch logo for ${slug}:`, error);
    return `/images/casinos/${slug}.png`;
  }
}
