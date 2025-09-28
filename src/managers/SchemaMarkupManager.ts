import type { ISchemaMarkupService } from '../interfaces/ServiceInterfaces';

/**
 * SchemaMarkupManager - Handles all structured data generation
 * Single Responsibility: JSON-LD schema markup for SEO
 */
export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export class SchemaMarkupManager implements ISchemaMarkupService {
  private readonly baseUrl = 'https://bestcasinoportal.com';
  private readonly organizationName = 'BestCasinoPortal';

  generateWebsiteSchema(): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.baseUrl}/#website`,
      name: this.organizationName,
      url: this.baseUrl,
      description: 'Expert online casino reviews and ratings',
      publisher: {
        '@type': 'Organization',
        name: this.organizationName
      }
    };
  }

  generateFAQSchema(faqItems: Array<{question: string; answer: string}>): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${this.baseUrl}/#faq`,
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };
  }

  generateHowToSchema(): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${this.baseUrl}/#howto-choose-casino`,
      name: 'How to Choose the Best Online Casino',
      description: 'A comprehensive guide to selecting a safe and trustworthy online casino that meets your gaming preferences and requirements.',
      image: `${this.baseUrl}/images/how-to-choose-casino.jpg`,
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0'
      },
      totalTime: 'PT10M',
      step: this.generateHowToSteps()
    };
  }

  generateBreadcrumbSchema(breadcrumbs: Array<{name: string; url: string}>): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${this.baseUrl}/#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  }

  private generateHowToSteps() {
    return [
      {
        '@type': 'HowToStep',
        name: 'Check Casino License',
        text: 'Verify the casino has a valid license from reputable authorities like Malta Gaming Authority (MGA) or UK Gambling Commission (UKGC).',
        url: `${this.baseUrl}/guides/casino-licenses`
      },
      {
        '@type': 'HowToStep',
        name: 'Review Security Measures',
        text: 'Ensure the casino uses SSL encryption, has RNG-certified games, and follows responsible gambling practices.',
        url: `${this.baseUrl}/guides/casino-security`
      },
      {
        '@type': 'HowToStep',
        name: 'Compare Game Selection',
        text: 'Look for casinos with games from reputable providers like NetEnt, Microgaming, and Evolution Gaming, offering slots, table games, and live dealer options.',
        url: `${this.baseUrl}/games`
      },
      {
        '@type': 'HowToStep',
        name: 'Evaluate Payment Options',
        text: 'Choose casinos that offer secure payment methods you prefer, with reasonable withdrawal limits and fast processing times.',
        url: `${this.baseUrl}/banking`
      },
      {
        '@type': 'HowToStep',
        name: 'Read Bonus Terms',
        text: 'Carefully review bonus terms and conditions, focusing on wagering requirements, game restrictions, and withdrawal conditions.',
        url: `${this.baseUrl}/bonuses`
      }
    ];
  }
}