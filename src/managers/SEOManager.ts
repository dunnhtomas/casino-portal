import type { ISEOService } from '../interfaces/ServiceInterfaces';

/**
 * SEOManager - Handles all SEO-related metadata generation
 * Single Responsibility: SEO meta tags and social media metadata
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  twitterCard: string;
  canonicalUrl: string;
}

export class SEOManager implements ISEOService {
  private readonly baseUrl = 'https://bestcasinoportal.com';

  generateHomepageMetadata(): SEOMetadata {
    const title = "Best Online Casinos 2025 - Expert Reviews & Ratings";
    const description = "Compare the best online casinos with expert reviews, transparent ratings, and verified payouts. Find your perfect casino with fast withdrawals and fair bonuses.";
    
    return {
      title,
      description,
      keywords: "best online casinos 2025, online casino reviews, casino bonuses, fast payout casinos, trusted casino sites, live dealer casinos",
      ogImage: `${this.baseUrl}/images/og-casino-reviews.jpg`,
      twitterCard: 'summary_large_image',
      canonicalUrl: this.baseUrl
    };
  }

  generatePageMetadata(pageType: string, customTitle?: string, customDescription?: string): SEOMetadata {
    const baseMetadata = this.generateHomepageMetadata();
    
    return {
      ...baseMetadata,
      title: customTitle || baseMetadata.title,
      description: customDescription || baseMetadata.description,
      canonicalUrl: `${this.baseUrl}/${pageType}`
    };
  }
}