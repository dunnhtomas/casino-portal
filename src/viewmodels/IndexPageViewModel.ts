import { SEOManager, type SEOMetadata } from '../managers/SEOManager';
import { SchemaMarkupManager } from '../managers/SchemaMarkupManager';
import { NavigationCoordinator } from '../coordinators/NavigationCoordinator';

/**
 * IndexPageViewModel - Handles all data transformation and business logic for homepage
 * Single Responsibility: Homepage data preparation and state management
 */
export class IndexPageViewModel {
  private seoManager = new SEOManager();
  private schemaManager = new SchemaMarkupManager();
  private navigationCoordinator = new NavigationCoordinator();

  async getPageData() {
    const [faqData] = await Promise.all([
      import('../../data/faqs.json').then(module => module.default)
    ]);

    return {
      seoMetadata: this.seoManager.generateHomepageMetadata(),
      schemaMarkup: {
        website: this.schemaManager.generateWebsiteSchema(),
        faq: this.schemaManager.generateFAQSchema(this.transformFAQData(faqData.homepage || [])),
        howTo: this.schemaManager.generateHowToSchema(),
        breadcrumb: this.schemaManager.generateBreadcrumbSchema(
          this.navigationCoordinator.generateBreadcrumbs('home').map(item => ({
            name: item.label,
            url: item.href
          }))
        )
      },
      navigation: {
        main: this.navigationCoordinator.generateMainNavigation(),
        footer: this.navigationCoordinator.generateFooterSections()
      },
      content: {
        faqItems: faqData.homepage || [],
        expertTeam: this.getExpertTeamData(),
        supportChannels: this.getSupportChannelsData(),
        affiliateDisclosure: this.getAffiliateDisclosureText()
      }
    };
  }

  private transformFAQData(faqItems: any[]): Array<{question: string; answer: string}> {
    return faqItems.map(item => ({
      question: item.question || item.title,
      answer: item.answer || item.content
    }));
  }

  private getExpertTeamData() {
    return [
      { 
        name: 'Sarah Johnson', 
        role: 'Senior Casino Analyst', 
        experience: '8 years', 
        focus: 'Bonus terms & game analysis' 
      },
      { 
        name: 'Michael Chen', 
        role: 'Payment Systems Expert', 
        experience: '12 years', 
        focus: 'Banking & security verification' 
      },
      { 
        name: 'Emma Rodriguez', 
        role: 'Compliance Specialist', 
        experience: '10 years', 
        focus: 'Licensing & regulatory compliance' 
      }
    ];
  }

  private getSupportChannelsData() {
    return [
      {
        icon: '💬',
        title: 'Live Chat',
        description: 'Instant support available 24/7',
        bgColor: 'bg-green-100'
      },
      {
        icon: '📧',
        title: 'Email Support', 
        description: 'Detailed responses within hours',
        bgColor: 'bg-blue-100'
      },
      {
        icon: '📞',
        title: 'Phone Support',
        description: 'Speak directly with support agents', 
        bgColor: 'bg-purple-100'
      }
    ];
  }

  private getAffiliateDisclosureText(): string {
    return "We may receive compensation when you click links to casinos. This doesn't affect our reviews or rankings, which are based solely on our expert analysis.";
  }
}