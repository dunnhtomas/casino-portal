/**
 * IndexPageViewModel (Refactored)
 * Single Responsibility: Homepage view state management and data coordination
 * Following OOP principles with dependency injection
 */

import type { SEOMetadata } from '../core/interfaces/SEOInterfaces';
import { HomepageSEOManager } from '../managers/seo/HomepageSEOManager';
import { SchemaMarkupManager } from '../managers/SchemaMarkupManager';
import { NavigationCoordinator } from '../coordinators/NavigationCoordinator';
import { ContentManager } from '../managers/ContentManager';

// Data Providers
import { ExpertTeamDataProvider } from '../providers/data/ExpertTeamDataProvider';
import { SupportChannelsDataProvider } from '../providers/data/SupportChannelsDataProvider';
import { FAQDataProvider } from '../providers/data/FAQDataProvider';
import { AffiliateDisclosureProvider } from '../providers/data/AffiliateDisclosureProvider';

export interface HomepageData {
  seoMetadata: SEOMetadata;
  schemaMarkup: {
    website: any;
    faq: any;
    howTo: any;
    breadcrumb: any;
  };
  navigation: {
    main: any;
    footer: any;
  };
  content: {
    expertTeam: any[];
    supportChannels: any[];
    faqItems: any[];
    affiliateDisclosure: any;
  };
}

export class IndexPageViewModel {
  private seoManager: HomepageSEOManager;
  private schemaManager: SchemaMarkupManager;
  private navigationCoordinator: NavigationCoordinator;
  private contentManager: ContentManager;

  constructor() {
    // Initialize specialized managers
    this.seoManager = new HomepageSEOManager();
    this.schemaManager = new SchemaMarkupManager();
    this.navigationCoordinator = new NavigationCoordinator();
    
    // Initialize content manager with data providers
    this.contentManager = new ContentManager(
      new ExpertTeamDataProvider(),
      new SupportChannelsDataProvider(),
      new FAQDataProvider(),
      new AffiliateDisclosureProvider()
    );
  }

  async getPageData(): Promise<HomepageData> {
    // Get content data from content manager
    const contentData = await this.contentManager.getContentData();
    
    // Generate SEO metadata
    const seoMetadata = this.seoManager.generateMetadata();
    
    // Generate schema markup
    const schemaMarkup = {
      website: this.schemaManager.generateWebsiteSchema(),
      faq: this.schemaManager.generateFAQSchema(contentData.faqItems),
      howTo: this.schemaManager.generateHowToSchema(),
      breadcrumb: this.schemaManager.generateBreadcrumbSchema(
        this.navigationCoordinator.generateBreadcrumbs('home').map(item => ({
          name: item.label,
          url: item.href
        }))
      )
    };

    // Generate navigation
    const navigation = {
      main: this.navigationCoordinator.generateMainNavigation(),
      footer: this.navigationCoordinator.generateFooterSections()
    };

    return {
      seoMetadata,
      schemaMarkup,
      navigation,
      content: {
        expertTeam: contentData.expertTeam,
        supportChannels: contentData.supportChannels,
        faqItems: contentData.faqItems,
        affiliateDisclosure: contentData.affiliateDisclosure
      }
    };
  }
}