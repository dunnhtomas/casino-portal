/**
 * CasinoSEOManager - Handles casino review page SEO metadata generation
 * Single Responsibility: Generate SEO metadata for individual casino review pages
 */

import type { SEOMetadata, ISEOMetadataGenerator } from '../../core/interfaces/SEOInterfaces';
import type { Casino } from '../../core/types/DomainTypes';

export class CasinoSEOManager implements ISEOMetadataGenerator {
  private readonly baseUrl = 'https://bestcasinoportal.com';

  generateMetadata(casino: Casino): SEOMetadata {
    const title = `${casino.name} Review ${new Date().getFullYear()} - Expert Rating & Bonuses`;
    const description = `Complete ${casino.name} review: ${casino.ratings.overall}/10 rating, ${casino.bonuses.welcome?.headline || 'great bonuses'}, ${casino.features.gameProviders.length}+ game providers. Read our expert analysis.`;

    return {
      title,
      description,
      keywords: [
        `${casino.name} review`,
        `${casino.name} bonus`,
        `${casino.name} rating`,
        'online casino review',
        'casino bonus',
        'casino rating',
        ...casino.features.gameProviders.slice(0, 3).map(provider => `${provider} games`)
      ],
      canonical: `${this.baseUrl}/casino/${casino.slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: casino.logo?.url || `${this.baseUrl}/images/casino-${casino.slug}.jpg`,
      twitterTitle: title,
      twitterDescription: description,
      twitterCard: 'summary_large_image',
      robots: 'index,follow',
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${this.baseUrl}/casino/${casino.slug}`,
        siteName: 'BestCasinoPortal'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      }
    };
  }
}