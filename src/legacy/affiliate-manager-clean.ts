/**
 * Affiliate URL Manager
 * Centralized system for managing affiliate tracking URLs and casino data
 */

// Types
interface AffiliateData {
  link: string;
  campaignId: string;
  campaignName: string;
  lastUpdated: string;
}

interface Casino {
  slug: string;
  brand: string;
  url: string;
  affiliate: AffiliateData | null;
  bonuses: {
    welcome: {
      headline: string;
      wagering?: string;
      maxCashout?: number;
    };
  };
  ratings: {
    security: number;
    fairness: number;
    payout: number;
    bonusValue: number;
    games: number;
    support: number;
    reputation: number;
  };
}

interface GetAffiliateUrlOptions {
  casinoSlug?: string;
  fallbackUrl?: string;
  geo?: string;
  priority?: 'affiliate' | 'casino';
  campaignId?: string;
}

interface TopOfferOptions {
  geo?: string;
  exclude?: string[];
  limit?: number;
}

// Cache for performance
let casinosCache: Casino[] | null = null;
let affiliateMapping: Map<string, Casino> | null = null;

/**
 * Load casino data dynamically
 */
async function loadCasinos(): Promise<Casino[]> {
  if (!casinosCache) {
    try {
      const response = await fetch('/data/casinos.json');
      casinosCache = await response.json();
    } catch (error) {
      console.error('Failed to load casino data:', error);
      casinosCache = [];
    }
  }
  return casinosCache || [];
}

/**
 * Build affiliate mapping for quick lookups
 */
async function buildAffiliateMapping(): Promise<Map<string, Casino>> {
  if (!affiliateMapping) {
    affiliateMapping = new Map();
    const casinos = await loadCasinos();
    
    casinos.forEach(casino => {
      affiliateMapping!.set(casino.slug, casino);
      // Also map by brand name variations
      const brandSlug = casino.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
      affiliateMapping!.set(brandSlug, casino);
    });
  }
  return affiliateMapping;
}

/**
 * Get the best affiliate URL for a casino
 */
export async function getAffiliateUrl(options: GetAffiliateUrlOptions): Promise<string> {
  const {
    casinoSlug,
    fallbackUrl,
    geo = 'GLOBAL',
    priority = 'affiliate',
    campaignId
  } = options;

  // If no casino slug provided, use fallback URL
  if (!casinoSlug) {
    return fallbackUrl || 'https://www.example.com';
  }

  try {
    const mapping = await buildAffiliateMapping();
    const casino = mapping.get(casinoSlug);

    if (!casino) {
      return fallbackUrl || 'https://www.example.com';
    }

    // If affiliate data exists and priority is affiliate
    if (casino.affiliate && priority === 'affiliate') {
      return casino.affiliate.link;
    }

    // Fallback to casino URL or provided fallback
    return fallbackUrl || casino.url;
  } catch (error) {
    console.error('Error getting affiliate URL:', error);
    return fallbackUrl || 'https://www.example.com';
  }
}

/**
 * Synchronous version for components (uses cached data)
 */
export function getAffiliateUrlSync(options: GetAffiliateUrlOptions): string {
  const {
    casinoSlug,
    fallbackUrl,
    geo = 'GLOBAL',
    priority = 'affiliate'
  } = options;

  // If no casino slug provided, use fallback URL
  if (!casinoSlug) {
    return fallbackUrl || 'https://www.example.com';
  }

  // Use cached data if available
  if (!affiliateMapping || !casinosCache) {
    return fallbackUrl || 'https://www.example.com';
  }

  const casino = affiliateMapping.get(casinoSlug);
  if (!casino) {
    return fallbackUrl || 'https://www.example.com';
  }

  // If affiliate data exists and priority is affiliate
  if (casino.affiliate && priority === 'affiliate') {
    return casino.affiliate.link;
  }

  return fallbackUrl || casino.url;
}

/**
 * Get top affiliate offers based on criteria
 */
export async function getTopAffiliateOffer(options: TopOfferOptions = {}) {
  const { geo = 'GLOBAL', exclude = [], limit = 1 } = options;
  
  try {
    const casinos = await loadCasinos();
    
    // Filter and score casinos
    const scoredOffers = casinos
      .filter(casino => {
        // Exclude specified casinos
        if (exclude.includes(casino.slug)) return false;
        
        // Must have affiliate data
        if (!casino.affiliate) return false;
        
        return true;
      })
      .map(casino => {
        // Calculate offer score based on ratings
        const avgRating = Object.values(casino.ratings).reduce((a, b) => a + b, 0) / Object.values(casino.ratings).length;
        const bonusValue = casino.ratings.bonusValue || 0;
        
        // Simple scoring
        const score = (avgRating * 10 * 0.7) + (bonusValue * 10 * 0.3);
        
        return {
          casino: casino.brand,
          slug: casino.slug,
          bonus: casino.bonuses.welcome.headline,
          rating: avgRating,
          score,
          trackingUrl: casino.affiliate!.link
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredOffers.length > 0 ? scoredOffers[0] : null;
  } catch (error) {
    console.error('Error getting top affiliate offer:', error);
    return null;
  }
}

/**
 * Synchronous version for components
 */
export function getTopAffiliateOfferSync(options: TopOfferOptions = {}) {
  const { geo = 'GLOBAL', exclude = [], limit = 1 } = options;
  
  if (!casinosCache) {
    return null;
  }
  
  // Filter and score casinos
  const scoredOffers = casinosCache
    .filter(casino => {
      if (exclude.includes(casino.slug)) return false;
      if (!casino.affiliate) return false;
      
      return true;
    })
    .map(casino => {
      const avgRating = Object.values(casino.ratings).reduce((a, b) => a + b, 0) / Object.values(casino.ratings).length;
      const bonusValue = casino.ratings.bonusValue || 0;
      
      const score = (avgRating * 10 * 0.7) + (bonusValue * 10 * 0.3);
      
      return {
        casino: casino.brand,
        slug: casino.slug,
        bonus: casino.bonuses.welcome.headline,
        rating: avgRating,
        score,
        trackingUrl: casino.affiliate!.link
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredOffers.length > 0 ? scoredOffers[0] : null;
}

/**
 * Initialize affiliate system (call this on app startup)
 */
export async function initializeAffiliateSystem() {
  try {
    await loadCasinos();
    await buildAffiliateMapping();
    console.log('Affiliate system initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize affiliate system:', error);
    return false;
  }
}