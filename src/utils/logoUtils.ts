/**
 * Utility functions for handling casino logos with fallbacks
 */

/**
 * Validates and provides fallback for casino logo URLs
 * @param logoUrl - The original logo URL (might be from Google favicon service)
 * @param casinoSlug - The casino slug for fallback local images
 * @returns A more reliable logo URL with fallback
 */
export function getCasinoLogoUrl(logoUrl: string | undefined, casinoSlug: string): string {
  // If no logo URL provided, use local fallback
  if (!logoUrl) {
    return `/images/casinos/${casinoSlug}.png`;
  }

  // If it's a Google favicon URL, we can keep it but ensure it has proper fallback handling
  if (logoUrl.includes('google.com/s2/favicons') || logoUrl.includes('gstatic.com')) {
    // Return the Google URL - the ResponsiveImage component will handle fallbacks
    return logoUrl;
  }

  // If it's another external URL, return as-is
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }

  // If it's a relative URL, ensure it starts with /
  if (!logoUrl.startsWith('/')) {
    return `/${logoUrl}`;
  }

  return logoUrl;
}

/**
 * Gets a reliable fallback logo URL for when primary logo fails
 * @param casinoSlug - The casino slug
 * @returns Fallback logo URL
 */
export function getFallbackLogoUrl(casinoSlug: string): string {
  // First try local casino-specific logo
  const localLogo = `/images/casinos/${casinoSlug}.png`;
  
  // If that's not available, the ResponsiveImage component will fall back to
  // '/images/casino-default-logo.svg' automatically
  return localLogo;
}

/**
 * Creates an improved img element with better error handling
 * @param logoUrl - The logo URL
 * @param casinoSlug - The casino slug for fallbacks
 * @param alt - Alt text
 * @param className - CSS classes
 * @returns Image HTML string with proper error handling
 */
export function createCasinoLogoImg(
  logoUrl: string | undefined, 
  casinoSlug: string, 
  alt: string, 
  className: string = ''
): string {
  const primaryUrl = getCasinoLogoUrl(logoUrl, casinoSlug);
  const fallbackUrl = getFallbackLogoUrl(casinoSlug);
  const defaultUrl = '/images/casino-default-logo.svg';
  
  return `<img 
    src="${primaryUrl}" 
    alt="${alt}"
    class="${className}"
    loading="lazy"
    decoding="async"
    onerror="this.onerror=null; this.src='${defaultUrl}';"
    style="max-width: 100%; height: auto;"
  />`;
}

/**
 * Enhanced casino logo data with better error handling
 */
export interface EnhancedCasinoLogo {
  primary: string;
  fallback: string;
  default: string;
  alt: string;
}

/**
 * Creates enhanced logo data with multiple fallback options
 * @param logoUrl - Original logo URL
 * @param casinoSlug - Casino slug
 * @param casinoName - Casino name for alt text
 * @returns Enhanced logo data
 */
export function createEnhancedLogoData(
  logoUrl: string | undefined,
  casinoSlug: string,
  casinoName: string
): EnhancedCasinoLogo {
  return {
    primary: getCasinoLogoUrl(logoUrl, casinoSlug),
    fallback: getFallbackLogoUrl(casinoSlug),
    default: '/images/casino-default-logo.svg',
    alt: `${casinoName} Casino Logo`
  };
}