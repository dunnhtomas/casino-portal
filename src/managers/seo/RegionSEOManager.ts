/**
 * RegionSEOManager - Handles region page SEO metadata generation
 * Single Responsibility: Generate SEO metadata for region-specific casino pages
 */

import type { SEOMetadata, ISEOMetadataGenerator } from '../../core/interfaces/SEOInterfaces';
import type { Region } from '../../core/types/DomainTypes';

export class RegionSEOManager implements ISEOMetadataGenerator {
  private readonly baseUrl = 'https://bestcasinoportal.com';

  generateMetadata(region: Region): SEOMetadata {
    const title = `Best Online Casinos in ${region.name} ${new Date().getFullYear()} - Legal & Safe Gambling`;
    const legalStatus = region.legalStatus.isLegal ? 'Legal' : 'Restricted';
    const description = `Find the best ${legalStatus.toLowerCase()} online casinos in ${region.name}. Compare ${region.recommendedCasinos.length} top-rated casinos, bonuses, and reviews for ${region.name} players.`;

    return {
      title,
      description,
      keywords: [
        `casinos in ${region.name}`,
        `${region.name} online casinos`,
        `best casinos ${region.name}`,
        'legal online casinos',
        'safe gambling',
        'casino reviews',
        'casino bonuses'
      ],
      canonical: `${this.baseUrl}/region/${region.slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${this.baseUrl}/images/region-${region.slug}.jpg`,
      twitterTitle: title,
      twitterDescription: description,
      twitterCard: 'summary_large_image',
      robots: 'index,follow',
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${this.baseUrl}/region/${region.slug}`,
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