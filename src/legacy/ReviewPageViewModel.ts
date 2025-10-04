import type { IPageViewModel } from '../core/interfaces/ApplicationInterfaces';
import { ReviewPageCoordinator } from '../coordinators/ReviewPageCoordinator';
import { NavigationCoordinator } from '../coordinators/NavigationCoordinator';
import { SEOManager } from '../managers/SEOManager';
import { SchemaMarkupManager } from '../managers/SchemaMarkupManager';

/**
 * ReviewPageViewModel - Handle review page UI state and presentation logic
 * Single Responsibility: Handle review page UI state and presentation logic
 */
export class ReviewPageViewModel implements IPageViewModel {
  private pageCoordinator = new ReviewPageCoordinator();
  private navigationCoordinator = new NavigationCoordinator();
  private seoManager = new SEOManager();
  private schemaManager = new SchemaMarkupManager();
  private currentSlug: string = '';

  /**
   * Set the current casino slug
   */
  setSlug(slug: string): void {
    this.currentSlug = slug;
  }

  /**
   * Get all review page data in structured format
   */
  async getPageData() {
    if (!this.currentSlug) {
      throw new Error('Slug not set');
    }

    const [heroData, ratingData, bonusData, featuresData, safetyData] = await Promise.all([
      this.pageCoordinator.getCasinoHeroData(this.currentSlug),
      this.pageCoordinator.getRatingBreakdownData(this.currentSlug),
      this.pageCoordinator.getBonusDetailsData(this.currentSlug),
      this.pageCoordinator.getFeaturesData(this.currentSlug),
      this.pageCoordinator.getSafetyData(this.currentSlug),
    ]);

    if (!heroData) {
      throw new Error('Casino not found');
    }

    return {
      content: {
        hero: heroData,
        quickFacts: this.generateQuickFacts(featuresData, bonusData, safetyData),
        detailed: this.generateDetailedContent(heroData.casino.name),
        rating: ratingData,
        cta: this.generateCTAData(heroData.casino.name),
        affiliateDisclosure: this.getAffiliateDisclosure(),
      },
      metadata: this.getMetadata(),
      navigation: this.getNavigationData(),
      schemaMarkup: this.getSchemaMarkup(heroData.casino.name),
    };
  }

  /**
   * Get not found page data
   */
  getNotFoundPageData() {
    return {
      content: {
        hero: null,
        quickFacts: null,
        detailed: null,
        rating: null,
        cta: null,
        affiliateDisclosure: this.getAffiliateDisclosure(),
      },
      metadata: {
        title: 'Casino Review Not Found - Best Casino Portal',
        description: 'The casino review you are looking for could not be found.',
        keywords: ['casino review', 'online casino'],
        robots: 'noindex',
      },
      navigation: this.getNavigationData(),
      schemaMarkup: {
        website: this.schemaManager.generateWebsiteSchema(),
        breadcrumbs: null,
        review: null,
      },
    };
  }

  /**
   * Get SEO metadata for the review page
   */
  getMetadata() {
    if (!this.currentSlug) {
      return this.getNotFoundPageData().metadata;
    }

    // In a real implementation, this would get actual casino data
    return {
      title: `Casino Review - Expert Analysis & Ratings`,
      description: `Comprehensive casino review with detailed analysis of games, bonuses, security, and customer service.`,
      keywords: ['casino review', 'online casino', 'casino bonus', 'casino games'],
      robots: 'index, follow',
    };
  }

  /**
   * Get navigation data
   */
  getNavigationData() {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Reviews', href: '/reviews' },
    ];

    if (this.currentSlug) {
      breadcrumbs.push({ label: 'Casino Review', href: `/reviews/${this.currentSlug}` });
    }

    return {
      main: this.navigationCoordinator.generateMainNavigation(),
      footer: this.navigationCoordinator.generateFooterSections(),
      breadcrumbs: breadcrumbs.map(b => ({
        label: b.label,
        href: b.href,
        isActive: b === breadcrumbs[breadcrumbs.length - 1]
      })),
    };
  }

  /**
   * Get structured data markup
   */
  getSchemaMarkup(casinoName: string) {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Reviews', href: '/reviews' },
      { label: casinoName, href: `/reviews/${this.currentSlug}` },
    ];

    return {
      website: this.schemaManager.generateWebsiteSchema(),
      breadcrumbs: this.schemaManager.generateBreadcrumbSchema(
        breadcrumbs.map(b => ({ name: b.label, url: `https://bestcasinoportal.com${b.href}` }))
      ),
      review: null, // Would be populated with actual casino data
    };
  }

  /**
   * Private helper methods
   */
  private generateQuickFacts(featuresData: any, bonusData: any, safetyData: any) {
    return {
      safety: {
        title: '🛡️ Safety & Security',
        items: [
          { label: 'License', value: safetyData?.licenses?.[0] || 'Not specified' },
          { label: 'Years Online', value: safetyData?.yearsOnline || 'N/A' },
          { label: 'Trust Score', value: safetyData?.trustScore ? `${safetyData.trustScore}/10` : 'N/A' },
        ],
      },
      banking: {
        title: '💰 Banking & Payments',
        items: [
          { label: 'Payment Methods', value: featuresData?.paymentMethods?.length || 'N/A' },
          { label: 'Currencies', value: featuresData?.currencies?.join(', ') || 'N/A' },
          { label: 'Safety Rating', value: safetyData?.safetyRating ? `${safetyData.safetyRating}/10` : 'N/A' },
        ],
      },
      games: {
        title: '🎮 Games & Software',
        items: [
          { label: 'Game Providers', value: featuresData?.gameProviders?.length || 'N/A' },
          { label: 'Live Dealer', value: featuresData?.liveDealer ? 'Yes' : 'No' },
          { label: 'Mobile Friendly', value: featuresData?.mobileFriendly ? 'Yes' : 'No' },
        ],
      },
    };
  }

  private generateDetailedContent(casinoName: string) {
    return {
      title: 'Detailed Review',
      content: `Our expert review team has thoroughly analyzed ${casinoName} to provide you with comprehensive insights about this online casino. We evaluate every aspect from games and bonuses to security and customer service to ensure you make an informed decision.`,
    };
  }

  private generateCTAData(casinoName: string) {
    return {
      title: `Ready to Play at ${casinoName}?`,
      subtitle: 'Join thousands of players enjoying great games and bonuses!',
      primaryButton: {
        text: `Visit ${casinoName} →`,
        href: '#', // Would be populated with actual affiliate URL
        variant: 'primary',
      },
      secondaryButton: {
        text: 'Compare More Casinos',
        href: '/reviews',
        variant: 'secondary',
      },
    };
  }

  private getAffiliateDisclosure(): string {
    return "We may receive compensation when you click links to casinos on this site. This doesn't affect our reviews or recommendations.";
  }
}