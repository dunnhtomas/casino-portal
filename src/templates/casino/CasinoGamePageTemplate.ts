/**
 * CasinoGamePageTemplate
 * Single Responsibility: Generate casino game pages from template data
 */

export interface CasinoGamePageData {
  casinoSlug: string;
  casinoName: string;
  gameType: string;
  gameTypeName: string;
  description: string;
  features: string[];
  bonuses?: string[];
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export class CasinoGamePageTemplate {
  generatePageContent(data: CasinoGamePageData): string {
    return `---
// Auto-generated casino game page
// Template: CasinoGamePageTemplate
// Generated: ${new Date().toISOString()}

import PageLayout from '../../../components/Layout/PageLayout.astro';
import CasinoGameHero from '../../../components/Casino/CasinoGameHero.astro';
import GameFeatures from '../../../components/Casino/GameFeatures.astro';
import RelatedCasinos from '../../../components/Casino/RelatedCasinos.astro';

const pageData = {
  casino: "${data.casinoName}",
  gameType: "${data.gameTypeName}",
  features: ${JSON.stringify(data.features)},
  seoMetadata: ${JSON.stringify(data.seoMetadata)}
};
---

<PageLayout seoMetadata={pageData.seoMetadata}>
  <CasinoGameHero 
    casinoName={pageData.casino}
    gameType={pageData.gameType}
  />
  
  <GameFeatures 
    features={pageData.features}
    gameType={pageData.gameType}
  />
  
  <RelatedCasinos 
    currentCasino="${data.casinoSlug}"
    gameType="${data.gameType}"
  />
</PageLayout>`;
  }

  generateFileName(casinoSlug: string, gameType: string): string {
    return `${casinoSlug}-${gameType}.astro`;
  }
}