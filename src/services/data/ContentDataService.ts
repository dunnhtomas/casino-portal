/**
 * ContentDataService
 * Single Responsibility: Provide content data from content.json and other content sources
 */

import type { IContentDataService } from '../../core/interfaces/ApplicationInterfaces';

interface ContentData {
  homepage?: {
    hero?: any;
    benefits?: any;
    faq?: any;
  };
  navigation?: {
    mainMenu?: any[];
    footerMenu?: any[];
    mobileMenu?: any[];
  };
  legal?: {
    terms?: string;
    privacy?: string;
    about?: string;
  };
}

export class ContentDataService implements IContentDataService {
  private contentData: ContentData | null = null;

  /**
   * Get homepage content
   */
  getHomepageContent() {
    const content = this.loadContentData();
    return {
      hero: content.homepage?.hero || this.getDefaultHeroContent(),
      benefits: content.homepage?.benefits || this.getDefaultBenefitsContent(),
      faq: content.homepage?.faq || this.getDefaultFAQContent(),
    };
  }

  /**
   * Get navigation content
   */
  getNavigationContent() {
    const content = this.loadContentData();
    return {
      mainMenu: content.navigation?.mainMenu || [],
      footerMenu: content.navigation?.footerMenu || [],
      mobileMenu: content.navigation?.mobileMenu || [],
    };
  }

  /**
   * Get legal content
   */
  getLegalContent(page: 'terms' | 'privacy' | 'about') {
    const content = this.loadContentData();
    return content.legal?.[page] || this.getDefaultLegalContent(page);
  }

  /**
   * Get FAQ data
   */
  getFAQData() {
    const content = this.loadContentData();
    return content.homepage?.faq || this.getDefaultFAQContent();
  }

  /**
   * Private helper methods
   */
  private loadContentData(): ContentData {
    if (this.contentData) {
      return this.contentData;
    }

    try {
      // In a real implementation, this would load from content.json
      // For now, return default content structure
      this.contentData = this.getDefaultContent();
      return this.contentData;
    } catch (error) {
      console.warn('Failed to load content data:', error);
      return this.getDefaultContent();
    }
  }

  private getDefaultContent(): ContentData {
    return {
      homepage: {
        hero: this.getDefaultHeroContent(),
        benefits: this.getDefaultBenefitsContent(),
        faq: this.getDefaultFAQContent(),
      },
      navigation: {
        mainMenu: [],
        footerMenu: [],
        mobileMenu: [],
      },
      legal: {
        terms: this.getDefaultLegalContent('terms'),
        privacy: this.getDefaultLegalContent('privacy'),
        about: this.getDefaultLegalContent('about'),
      },
    };
  }

  private getDefaultHeroContent() {
    return {
      headline: 'Find Your Perfect Online Casino',
      subheadline: 'Expert reviews, transparent ratings, and verified payouts from Canada\'s most trusted casino review site.',
      cta: {
        primary: { text: 'See Top Casinos', href: '#top-casinos' },
        secondary: { text: 'Learn How We Rate', href: '/guides/how-we-rate' },
      },
      trustIndicators: [
        'Expert Reviews Since 2024',
        '100+ Casinos Tested',
        'Updated Weekly',
      ],
    };
  }

  private getDefaultBenefitsContent() {
    return [
      {
        title: 'Expert Reviews',
        description: 'In-depth analysis of games, bonuses, and customer service',
        icon: 'expert-review',
      },
      {
        title: 'Transparent Ratings',
        description: 'Clear scoring methodology with detailed explanations',
        icon: 'transparent-rating',
      },
      {
        title: 'Verified Payouts',
        description: 'Real payout speeds and withdrawal testing',
        icon: 'verified-payout',
      },
      {
        title: 'Regular Updates',
        description: 'Fresh reviews and current bonus information',
        icon: 'regular-update',
      },
    ];
  }

  private getDefaultFAQContent() {
    return [
      {
        question: 'How do you rate online casinos?',
        answer: 'We use a comprehensive 5-point rating system that evaluates games, bonuses, security, customer service, and payout speeds. Each category is weighted based on player importance.',
      },
      {
        question: 'Are the casinos on your site safe?',
        answer: 'Yes, we only review licensed casinos that meet strict security standards. All recommended sites use SSL encryption and are regulated by recognized authorities.',
      },
      {
        question: 'How often do you update your reviews?',
        answer: 'We review and update our casino ratings weekly, with bonus information and game selections checked regularly to ensure accuracy.',
      },
      {
        question: 'Do you accept payments from casinos?',
        answer: 'We may earn commissions from casino referrals, but this never influences our ratings. Our editorial independence is maintained through strict review processes.',
      },
    ];
  }

  private getDefaultLegalContent(page: string): string {
    const content = {
      terms: 'Terms and Conditions content would be loaded here.',
      privacy: 'Privacy Policy content would be loaded here.',
      about: 'About Us content would be loaded here.',
    };

    return content[page] || 'Legal content not available.';
  }
}