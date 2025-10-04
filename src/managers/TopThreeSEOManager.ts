/**
 * TopThree SEO Manager
 * Single Responsibility: Generate SEO structured data
 */

import type { CasinoCardData } from '../components/Casino/EnhancedCasinoCard';

export class TopThreeSEOManager {
  generateJsonLd(casinos: CasinoCardData[]) {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Top 10 Casino Recommendations",
      "numberOfItems": casinos.length,
      "itemListElement": casinos.map((casino, index) => ({
        "@type": "Organization",
        "position": index + 1,
        "name": casino.name,
        "url": `https://casinocompare.ca/casinos/${casino.slug}`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": casino.rating.overall,
          "bestRating": "10"
        }
      }))
    };
  }
}
