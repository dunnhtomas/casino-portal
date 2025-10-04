/**
 * Data Service Interfaces
 * Single Responsibility: Define contracts for data access layer
 */

import type { Casino, Region } from '../types/DomainTypes';

export interface ICasinoDataService {
  getCasinoById(id: string): Promise<Casino | null>;
  getCasinoBySlug(slug: string): Promise<Casino | null>;
  getAllCasinos(): Promise<Casino[]>;
  getTopCasinos(limit?: number): Promise<Casino[]>;
  getCasinosByRegion(regionId: string): Promise<Casino[]>;
}

export interface IRegionDataService {
  getRegionById(id: string): Promise<Region | null>;
  getRegionBySlug(slug: string): Promise<Region | null>;
  getAllRegions(): Promise<Region[]>;
}

export interface INavigationDataService {
  getTopCasinoSlugs(): Promise<string[]>;
  getCasinoNameBySlug(slug: string): Promise<string>;
  getMenuStructure(): MenuStructure;
  getFeaturedCasinoLinks(): Promise<FeaturedCasinoLink[]>;
}

export interface IContentDataService {
  getHomepageContent(): HomepageContent;
  getNavigationContent(): NavigationContent;
  getLegalContent(page: 'terms' | 'privacy' | 'about'): string;
  getFAQData(): FAQItem[];
}

export interface MenuStructure {
  readonly main: NavigationItem[];
  readonly footer: FooterSection[];
  readonly mobile: NavigationItem[];
}

export interface FeaturedCasinoLink {
  readonly name: string;
  readonly slug: string;
  readonly href: string;
  readonly rating: number;
  readonly bonus?: string;
}

export interface HomepageContent {
  readonly hero: HeroContent;
  readonly benefits: BenefitItem[];
  readonly faq: FAQItem[];
}

export interface HeroContent {
  readonly headline: string;
  readonly subheadline: string;
  readonly cta: CTAButtons;
  readonly trustIndicators: string[];
}

export interface CTAButtons {
  readonly primary: { text: string; href: string };
  readonly secondary: { text: string; href: string };
}

export interface BenefitItem {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export interface NavigationContent {
  readonly mainMenu: NavigationItem[];
  readonly footerMenu: FooterSection[];
  readonly mobileMenu: NavigationItem[];
}

export interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

export interface NavigationItem {
  readonly label: string;
  readonly href: string;
  readonly isExternal?: boolean;
  readonly children?: NavigationItem[];
  readonly badge?: string;
}

export interface FooterSection {
  readonly title: string;
  readonly links: NavigationItem[];
}

export interface Breadcrumb {
  readonly label: string;
  readonly href: string;
  readonly isActive: boolean;
}
