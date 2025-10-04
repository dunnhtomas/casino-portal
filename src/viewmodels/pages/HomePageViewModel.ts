/**
 * HomePageViewModel
 * Single Responsibility: Handle homepage UI state and data presentation logic
 */

import type { IPageViewModel } from '../../core/interfaces/ApplicationInterfaces';
import { HomePageCoordinator } from '../../coordinators/page/HomePageCoordinator';
import { NavigationCoordinator } from '../../coordinators/NavigationCoordinator';
import { SEOManager } from '../../managers/SEOManager';
import { SchemaMarkupManager } from '../../managers/SchemaMarkupManager';

export class HomePageViewModel implements IPageViewModel {
  private pageCoordinator = new HomePageCoordinator();
  private navigationCoordinator = new NavigationCoordinator();
  private seoManager = new SEOManager();
  private schemaManager = new SchemaMarkupManager();

  /**
   * Get all homepage data in structured format
   */
  async getPageData() {
    const [heroData, topThreeData, comparisonData, benefitsData, faqData] = await Promise.all([
      this.pageCoordinator.getHeroData(),
      this.pageCoordinator.getTopThreeData(),
      this.pageCoordinator.getComparisonTableData(),
      this.pageCoordinator.getBenefitsData(),
      this.pageCoordinator.getFAQData(),
    ]);

    return {
      content: {
        hero: heroData,
        topThree: topThreeData,
        comparison: comparisonData,
        benefits: benefitsData,
        faq: faqData,
        affiliateDisclosure: this.getAffiliateDisclosure(),
      },
      metadata: this.getMetadata(),
      navigation: this.getNavigationData(),
      schemaMarkup: this.getSchemaMarkup(),
    };
  }

  /**
   * Get SEO metadata for the homepage
   */
  getMetadata() {
    return this.seoManager.generateHomepageMetadata();
  }

  /**
   * Get navigation data
   */
  getNavigationData() {
    return {
      main: this.navigationCoordinator.generateMainNavigation(),
      footer: this.navigationCoordinator.generateFooterSections(),
      breadcrumbs: [], // No breadcrumbs on homepage
    };
  }

  /**
   * Get structured data markup
   */
  getSchemaMarkup() {
    return {
      website: this.schemaManager.generateWebsiteSchema(),
      organization: this.schemaManager.generateOrganizationSchema(),
      breadcrumbs: this.schemaManager.generateBreadcrumbSchema([]),
      faq: this.schemaManager.generateFAQSchema([]), // Will be populated with actual FAQ data
    };
  }

  /**
   * Get hero section display data
   */
  getHeroDisplayData() {
    return {
      showTrustIndicators: true,
      showFeaturePreview: true,
      ctaVariant: 'primary',
      backgroundPattern: 'grid',
    };
  }

  /**
   * Get comparison table display configuration
   */
  getComparisonTableConfig() {
    return {
      showRatings: true,
      showBonuses: true,
      showPayoutSpeeds: true,
      showLicenses: true,
      maxCasinos: 8,
      sortBy: 'overall_rating',
      sortOrder: 'desc',
    };
  }

  /**
   * Private helper methods
   */
  private getAffiliateDisclosure(): string {
    return "This site contains affiliate links. We may earn a commission if you click through and make a deposit. This doesn't affect our recommendations or reviews.";
  }
}