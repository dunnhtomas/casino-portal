/**
 * Hybrid Casino Logo System - Enhanced getBrandLogo
 * Integrates Logo.dev + Direct Fetching + Brandfetch for maximum authenticity
 * Progressive enhancement approach based on MCP Sequential Thinking analysis
 */

import { BRANDFETCH_CONFIG } from '../config/BrandfetchConfig';
import { getVerifiedCasinoDomain } from '../config/CasinoDomainMapping';

// Logo source configuration
const LOGO_SOURCES = {
  logodev: {
    baseUrl: 'https://img.logo.dev',
    priority: 1,
    confidence: 90
  },
  direct: {
    priority: 2,
    confidence: 85,
    commonPaths: [
      'logo.png',
      'assets/images/logo.png',
      'images/logo.png',
      'static/logo.png'
    ]
  },
  brandfetch: {
    priority: 3,
    confidence: 60
  }
};

/**
 * Generate Logo.dev URL for a casino domain
 */
function generateLogoDevUrl(domain: string): string {
  const params = new URLSearchParams({
    size: '400',
    format: 'png',
    fallback: 'transparent',
    theme: 'auto'
  });

  // Add API key if available in environment
  if (typeof process !== 'undefined' && process.env?.LOGODEV_API_KEY) {
    params.append('token', process.env.LOGODEV_API_KEY);
  }

  return `${LOGO_SOURCES.logodev.baseUrl}/${domain}?${params.toString()}`;
}

/**
 * Generate direct casino logo URLs based on common patterns
 */
function generateDirectLogoUrls(casinoUrl: string): string[] {
  try {
    const url = new URL(casinoUrl);
    const domain = url.hostname.replace(/^www\./, '');
    const protocol = url.protocol;
    
    return LOGO_SOURCES.direct.commonPaths.map(path => 
      `${protocol}//${domain}/${path}`
    );
  } catch (error) {
    return [];
  }
}

/**
 * Generate Brandfetch URL (fallback)
 */
function generateBrandfetchUrl(domain: string): string {
  const { CLIENT_ID, BASE_URL } = BRANDFETCH_CONFIG;
  return `${BASE_URL}/${domain}?c=${CLIENT_ID}&fallback=transparent&w=400&h=200`;
}

/**
 * Enhanced getBrandLogo with hybrid source support
 * Returns multiple logo sources for progressive enhancement
 */
export function getBrandLogo(casinoUrl: string, slug: string): string {
  try {
    // Extract domain from casino URL
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    
    // Get verified domain (uses mapping if available)
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    // For now, return Logo.dev as primary choice
    // This will be the most authentic logo source
    const logoDevUrl = generateLogoDevUrl(verifiedDomain);
    
    return logoDevUrl;
    
  } catch (error) {
    console.warn(`Failed to generate hybrid logo for ${slug}:`, error);
    return `/images/casinos/${slug}.png`;
  }
}

/**
 * Logo source interface
 */
interface LogoSource {
  url: string;
  source: string;
  priority: number;
  confidence: number;
}

/**
 * Get all available logo sources for a casino (for advanced usage)
 * Returns array of logo URLs in priority order
 */
export function getAllLogoSources(casinoUrl: string, slug: string): LogoSource[] {
  try {
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    const sources: LogoSource[] = [];
    
    // Logo.dev (highest priority)
    sources.push({
      url: generateLogoDevUrl(verifiedDomain),
      source: 'logodev',
      priority: LOGO_SOURCES.logodev.priority,
      confidence: LOGO_SOURCES.logodev.confidence
    });
    
    // Direct casino logos (medium priority) 
    const directUrls = generateDirectLogoUrls(casinoUrl);
    directUrls.forEach(directUrl => {
      sources.push({
        url: directUrl,
        source: 'direct',
        priority: LOGO_SOURCES.direct.priority,
        confidence: LOGO_SOURCES.direct.confidence
      });
    });
    
    // Brandfetch (fallback)
    sources.push({
      url: generateBrandfetchUrl(verifiedDomain),
      source: 'brandfetch',
      priority: LOGO_SOURCES.brandfetch.priority,
      confidence: LOGO_SOURCES.brandfetch.confidence
    });
    
    // Local fallback
    sources.push({
      url: `/images/casinos/${slug}.png`,
      source: 'local',
      priority: 4,
      confidence: 30
    });
    
    return sources;
    
  } catch (error) {
    console.warn(`Failed to generate logo sources for ${slug}:`, error);
    return [{
      url: `/images/casinos/${slug}.png`,
      source: 'local',
      priority: 4,
      confidence: 30
    }];
  }
}

/**
 * Get responsive logo URLs with different sizes
 */
export function getResponsiveLogoUrls(casinoUrl: string, slug: string): {
  small: string;
  medium: string;
  large: string;
  vector?: string;
} {
  try {
    const url = new URL(casinoUrl);
    const fallbackDomain = url.hostname.replace('www.', '');
    const verifiedDomain = getVerifiedCasinoDomain(slug, fallbackDomain);
    
    const baseLogoDevUrl = LOGO_SOURCES.logodev.baseUrl;
    const apiKey = typeof process !== 'undefined' && process.env?.LOGODEV_API_KEY 
      ? `&token=${process.env.LOGODEV_API_KEY}` 
      : '';
    
    return {
      small: `${baseLogoDevUrl}/${verifiedDomain}?size=128&format=png&fallback=transparent${apiKey}`,
      medium: `${baseLogoDevUrl}/${verifiedDomain}?size=256&format=png&fallback=transparent${apiKey}`,
      large: `${baseLogoDevUrl}/${verifiedDomain}?size=400&format=png&fallback=transparent${apiKey}`,
      vector: `${baseLogoDevUrl}/${verifiedDomain}?format=svg&fallback=transparent${apiKey}`
    };
    
  } catch (error) {
    console.warn(`Failed to generate responsive logos for ${slug}:`, error);
    const localFallback = `/images/casinos/${slug}.png`;
    return {
      small: localFallback,
      medium: localFallback,
      large: localFallback
    };
  }
}

/**
 * Legacy getBrandLogo function for backward compatibility
 * TODO: Remove after migration to hybrid system
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