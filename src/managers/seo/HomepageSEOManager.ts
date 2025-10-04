/**
 * HomepageSEOManager - Handles homepage SEO metadata generation
 * Single Responsibility: Generate SEO metadata for the homepage
 */

import type { SEOMetadata, ISEOMetadataGenerator } from '../../core/interfaces/SEOInterfaces';

export class HomepageSEOManager implements ISEOMetadataGenerator {
  private readonly baseUrl = 'https://bestcasinoportal.com';
  private readonly siteName = 'BestCasinoPortal';

  generateMetadata(): SEOMetadata {
    const title = 'Best Online Casinos 2024 - Expert Reviews & Ratings';
    const description = 'Discover the best online casinos with expert reviews, ratings, and bonuses. Compare top-rated casinos, read honest player reviews, and find your perfect gaming destination.';

    return {
      title,
      description,
      keywords: [
        'online casinos',
        'best casino reviews',
        'casino ratings',
        'online gambling',
        'casino bonuses',
        'safe casinos',
        'trusted casinos',
        'casino games'
      ],
      canonical: this.baseUrl,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${this.baseUrl}/images/og-homepage.jpg`,
      twitterTitle: title,
      twitterDescription: description,
      twitterCard: 'summary_large_image',
      robots: 'index,follow',
      openGraph: {
        title,
        description,
        type: 'website',
        url: this.baseUrl,
        siteName: this.siteName
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      }
    };
  }
}