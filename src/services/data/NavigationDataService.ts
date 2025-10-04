/**
 * NavigationDataService
 * Single Responsibility: Provide navigation-related data from various sources
 */

import type { INavigationDataService, FeaturedCasinoLink } from '../../core/interfaces/ApplicationInterfaces';
import { CasinoDataService } from './CasinoDataService';
import { ContentDataService } from './ContentDataService';
import type { Casino } from '../../core/types/DomainTypes';

export class NavigationDataService implements INavigationDataService {
  private casinoService = new CasinoDataService();
  private contentService = new ContentDataService();

  /**
   * Get top casino slugs for navigation
   */
  async getTopCasinoSlugs(): Promise<string[]> {
    const topCasinos = await this.casinoService.getTopCasinos(10);
    return topCasinos.map(casino => casino.slug);
  }

  /**
   * Get casino name by slug
   */
  async getCasinoNameBySlug(slug: string): Promise<string> {
    const casino = await this.casinoService.getCasinoBySlug(slug);
    return casino?.name || this.formatSlugToName(slug);
  }

  /**
   * Get navigation menu structure from content
   */
  getMenuStructure() {
    const content = this.contentService.getNavigationContent();
    return {
      main: content.mainMenu || [],
      footer: content.footerMenu || [],
      mobile: content.mobileMenu || [],
    };
  }

  /**
   * Get featured casino links for navigation
   */
  async getFeaturedCasinoLinks(): Promise<FeaturedCasinoLink[]> {
    const featured = await this.casinoService.getFeaturedCasinos(6);
    return featured.map((casino: Casino): FeaturedCasinoLink => ({
      name: casino.name,
      slug: casino.slug,
      href: `/reviews/${casino.slug}`,
      rating: casino.ratings?.overall || 0,
      bonus: casino.bonuses?.welcome?.headline || undefined,
    }));
  }

  /**
   * Get category-based navigation links
   */
  getCategoryLinks() {
    return [
      {
        category: 'Best',
        links: [
          { label: 'Real Money Casinos', href: '/best/real-money', description: 'Top real money online casinos' },
          { label: 'Fast Withdrawal Casinos', href: '/best/fast-withdrawals', description: 'Quick payout casinos' },
          { label: 'Mobile Casinos', href: '/best/mobile', description: 'Best mobile casino apps' },
          { label: 'Live Dealer Casinos', href: '/best/live-dealer', description: 'Live casino games' },
        ],
      },
      {
        category: 'Regions',
        links: this.getRegionLinks(),
      },
      {
        category: 'Guides',
        links: [
          { label: 'How We Rate', href: '/guides/how-we-rate', description: 'Our casino rating methodology' },
          { label: 'Responsible Gambling', href: '/guides/responsible-gambling', description: 'Safe gambling practices' },
          { label: 'All Guides', href: '/guides', description: 'Complete guide directory' },
        ],
      },
    ];
  }

  /**
   * Get sitemap data for navigation
   */
  async getSitemapData() {
    const casinos = await this.casinoService.getAllCasinos();
    const regions = this.getRegionLinks();
    
    return {
      reviews: casinos.map((casino: Casino) => ({
        url: `/reviews/${casino.slug}`,
        title: `${casino.name} Review`,
        lastModified: casino.lastUpdated || new Date().toISOString(),
      })),
      categories: [
        { url: '/best/real-money', title: 'Best Real Money Casinos' },
        { url: '/best/fast-withdrawals', title: 'Fast Withdrawal Casinos' },
        { url: '/best/mobile', title: 'Best Mobile Casinos' },
        { url: '/best/live-dealer', title: 'Live Dealer Casinos' },
      ],
      regions: regions.map(region => ({
        url: region.href,
        title: region.label,
      })),
      guides: [
        { url: '/guides/how-we-rate', title: 'How We Rate Casinos' },
        { url: '/guides/responsible-gambling', title: 'Responsible Gambling Guide' },
      ],
    };
  }

  /**
   * Private helper methods
   */
  private getRegionLinks() {
    return [
      { label: 'Ontario Casinos', href: '/regions/ontario', description: 'Legal online casinos in Ontario' },
      { label: 'Alberta Casinos', href: '/regions/alberta', description: 'Online casinos for Alberta players' },
      { label: 'British Columbia Casinos', href: '/regions/british-columbia', description: 'BC online casino sites' },
    ];
  }

  private formatSlugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}