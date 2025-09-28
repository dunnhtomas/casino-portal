/**
 * Service Interfaces for Dependency Injection
 * Single Responsibility: Define contracts for service communication
 */

export interface ISEOService {
  generateHomepageMetadata(): any;
  generatePageMetadata(pageType: string, customTitle?: string, customDescription?: string): any;
}

export interface ISchemaMarkupService {
  generateWebsiteSchema(): any;
  generateFAQSchema(faqItems: Array<{question: string; answer: string}>): any;
  generateHowToSchema(): any;
  generateBreadcrumbSchema(breadcrumbs: Array<{name: string; url: string}>): any;
}

export interface INavigationService {
  generateMainNavigation(): any[];
  generateFooterSections(): any[];
  generateBreadcrumbs(currentPage: string): any[];
  isActiveLink(href: string, currentPath: string): boolean;
}

export interface IContentService {
  loadFAQData(): Promise<any>;
  getExpertTeamData(): any[];
  getSupportChannelsData(): any[];
  getAffiliateDisclosureText(): string;
}

export interface IPageDataService {
  getPageData(): Promise<any>;
}

// Service Registry for Dependency Injection
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found in registry`);
    }
    return service;
  }
}