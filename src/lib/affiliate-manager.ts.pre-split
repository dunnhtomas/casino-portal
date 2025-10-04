/**
 * Affiliate URL Manager
 * Centralized system for managing affiliate tracking URLs and casino data
 */

// Types
interface AffiliateData {
  trackingUrl: string;
  campaignId: number;
  revenue: number;
  geoTargeting: string[];
  allCampaigns: any[];
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
 * Load and cache casino data
 */
function loadCasinos(): Casino[] {
  if (!casinosCache) {
    // In a real implementation, this would load from the JSON file
    // For now, return empty array to avoid compilation errors
    casinosCache = [];
  }
  return casinosCache;
}

/**
 * Build affiliate mapping for quick lookups
 */
function buildAffiliateMapping(): Map<string, Casino> {
  if (!affiliateMapping) {
    affiliateMapping = new Map();
    const casinos = loadCasinos();
    
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
export function getAffiliateUrl(options: GetAffiliateUrlOptions): string {
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

  const mapping = buildAffiliateMapping();
  const casino = mapping.get(casinoSlug);

  if (!casino) {
    return fallbackUrl || 'https://www.example.com';
  }

  // If affiliate data exists and priority is affiliate
  if (casino.affiliate && priority === 'affiliate') {
    // Check if geo targeting matches
    const { geoTargeting, trackingUrl, allCampaigns } = casino.affiliate;
    
    // Try to find geo-specific campaign
    if (geo !== 'GLOBAL' && allCampaigns && allCampaigns.length > 0) {
      const geoSpecificCampaign = allCampaigns.find(campaign => 
        campaign.geoTargeting.includes(geo)
      );
      
      if (geoSpecificCampaign) {
        return geoSpecificCampaign.trackingUrl;
      }
    }
    
    // Use main tracking URL if geo matches or is global
    if (geoTargeting.includes('GLOBAL') || geoTargeting.includes(geo)) {
      return trackingUrl;
    }
  }

  // Fallback to casino URL or provided fallback
  return fallbackUrl || casino.url;
}

/**
 * Get top affiliate offers based on criteria
 */
export function getTopAffiliateOffer(options: TopOfferOptions = {}) {
  const { geo = 'GLOBAL', exclude = [], limit = 1 } = options;
  
  const casinos = loadCasinos();
  
  // Filter and score casinos
  const scoredOffers = casinos
    .filter(casino => {
      // Exclude specified casinos
      if (exclude.includes(casino.slug)) return false;
      
      // Must have affiliate data
      if (!casino.affiliate) return false;
      
      // Check geo targeting
      const { geoTargeting } = casino.affiliate;
      if (!geoTargeting.includes('GLOBAL') && !geoTargeting.includes(geo)) {
        return false;
      }
      
      return true;
    })
    .map(casino => {
      // Calculate offer score based on multiple factors
      const revenue = casino.affiliate?.revenue || 0;
      const avgRating = Object.values(casino.ratings).reduce((a, b) => a + b, 0) / Object.values(casino.ratings).length;
      const bonusValue = casino.ratings.bonusValue || 0;
      
      // Weighted scoring
      const score = (revenue * 0.4) + (avgRating * 10 * 0.3) + (bonusValue * 10 * 0.3);
      
      return {
        casino: casino.brand,
        slug: casino.slug,
        bonus: casino.bonuses.welcome.headline,
        revenue,
        rating: avgRating,
        score,
        trackingUrl: casino.affiliate!.trackingUrl
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredOffers.length > 0 ? scoredOffers[0] : null;
}

/**
 * Get all casinos with affiliate data
 */
export function getCasinosWithAffiliates(geo?: string): Casino[] {
  const casinos = loadCasinos();
  
  return casinos.filter(casino => {
    if (!casino.affiliate) return false;
    
    if (geo && geo !== 'GLOBAL') {
      const { geoTargeting } = casino.affiliate;
      return geoTargeting.includes('GLOBAL') || geoTargeting.includes(geo);
    }
    
    return true;
  });
}

/**
 * Get affiliate statistics
 */
export function getAffiliateStats() {
  const casinos = loadCasinos();
  const withAffiliates = casinos.filter(c => c.affiliate);
  
  const totalRevenue = withAffiliates.reduce(
    (sum, casino) => sum + (casino.affiliate?.revenue || 0), 0
  );
  
  const geoStats = withAffiliates.reduce((stats, casino) => {
    casino.affiliate?.geoTargeting.forEach(geo => {
      stats[geo] = (stats[geo] || 0) + 1;
    });
    return stats;
  }, {} as Record<string, number>);
  
  return {
    totalCasinos: casinos.length,
    withAffiliates: withAffiliates.length,
    withoutAffiliates: casinos.length - withAffiliates.length,
    totalRevenue,
    averageRevenue: totalRevenue / withAffiliates.length,
    geoDistribution: geoStats
  };
}

/**
 * Test function to validate affiliate integration
 */
export function testAffiliateIntegration() {
  const stats = getAffiliateStats();
  const topOffer = getTopAffiliateOffer();
  const sampleUrl = getAffiliateUrl({ casinoSlug: 'spellwin', geo: 'UK' });
  
  return {
    stats,
    topOffer,
    sampleUrl,
    integrationComplete: stats.withAffiliates > 0
  };
}