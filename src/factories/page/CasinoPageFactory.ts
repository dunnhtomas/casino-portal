/**
 * CasinoPageFactory
 * Single Responsibility: Create casino-related pages using templates and data
 */

import { CasinoGamePageTemplate, type CasinoGamePageData } from '../../templates/casino/CasinoGamePageTemplate';
import { CasinoSEOManager } from '../../managers/seo/CasinoSEOManager';

export interface CasinoPageConfig {
  slug: string;
  name: string;
  gameTypes: string[];
  features: Record<string, string[]>;
}

export class CasinoPageFactory {
  private gamePageTemplate: CasinoGamePageTemplate;
  private seoManager: CasinoSEOManager;

  constructor() {
    this.gamePageTemplate = new CasinoGamePageTemplate();
    this.seoManager = new CasinoSEOManager();
  }

  createGamePages(casinoConfig: CasinoPageConfig): Map<string, string> {
    const pages = new Map<string, string>();

    casinoConfig.gameTypes.forEach(gameType => {
      const pageData: CasinoGamePageData = {
        casinoSlug: casinoConfig.slug,
        casinoName: casinoConfig.name,
        gameType,
        gameTypeName: this.formatGameTypeName(gameType),
        description: `Play ${this.formatGameTypeName(gameType)} at ${casinoConfig.name}`,
        features: casinoConfig.features[gameType] || [],
        seoMetadata: {
          title: `${casinoConfig.name} ${this.formatGameTypeName(gameType)} - Play Online`,
          description: `Discover ${this.formatGameTypeName(gameType)} games at ${casinoConfig.name}. ${casinoConfig.features[gameType]?.join(', ') || 'Great gaming experience'}.`,
          keywords: [
            `${casinoConfig.name} ${gameType}`,
            `${gameType} games`,
            `online ${gameType}`,
            'casino games'
          ]
        }
      };

      const fileName = this.gamePageTemplate.generateFileName(casinoConfig.slug, gameType);
      const content = this.gamePageTemplate.generatePageContent(pageData);
      
      pages.set(fileName, content);
    });

    return pages;
  }

  private formatGameTypeName(gameType: string): string {
    return gameType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}