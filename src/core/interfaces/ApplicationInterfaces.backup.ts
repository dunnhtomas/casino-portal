/**
 * Core Application Interfaces
 * Single Responsibility: Define contracts for services and managers
 */

import type { Casino, Region } from '../types/DomainTypes';

/**
 * Data Access Layer Interfaces
 */
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

export interface ISEOManager {
  generateHomepageMetadata(): SEOMetadata;
  generateCasinoReviewMetadata(casino: Casino): SEOMetadata;
  generateRegionMetadata(region: Region): SEOMetadata;
}

export interface ISchemaMarkupManager {
  generateWebsiteSchema(): SchemaMarkup;
  generateOrganizationSchema(): SchemaMarkup;
  generateBreadcrumbSchema(breadcrumbs: Array<{ label: string; href: string }>): SchemaMarkup;
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaMarkup;
}

/**
 * Business Logic Interfaces
 */
export interface IRatingManager {
  calculateOverallRating(casino: Casino): number;
  getRatingExplanation(casino: Casino): RatingExplanation[];
  compareRatings(casino1: Casino, casino2: Casino): ComparisonResult;
}

export interface IBonusManager {
  calculateBonusValue(casino: Casino): number;
  formatBonusDisplay(casino: Casino): BonusDisplay;
  validateBonusTerms(casino: Casino): ValidationResult;
}

export interface IContentManager {
  generateCasinoDescription(casino: Casino): string;
  generateSEOMetadata(casino: Casino): SEOMetadata;
  generateBreadcrumbs(path: string): Breadcrumb[];
}

/**
 * Presentation Layer Interfaces
 */
export interface IPageViewModel {
  getPageData(): Promise<PageData>;
  getMetadata(): SEOMetadata;
  getNavigationData(): NavigationData;
}

export interface IComponentViewModel {
  initialize(props: unknown): void;
  getDisplayData(): ComponentData | Promise<ComponentData>;
  handleUserInteraction(action: UserAction): void;
}

/**
 * Coordinator Interfaces
 */
export interface INavigationCoordinator {
  generateMainNavigation(): NavigationItem[];
  generateFooterSections(): FooterSection[];
  generateBreadcrumbs(path: string): Breadcrumb[];
}

export interface IPageCoordinator {
  coordinatePageFlow(route: string): Promise<PageFlowResult>;
  handlePageTransition(from: string, to: string): TransitionResult;
  validatePageAccess(route: string): AccessResult;
}

/**
 * Supporting Types
 */
export interface RatingExplanation {
  readonly category: string;
  readonly score: number;
  readonly explanation: string;
  readonly weight: number;
}

export interface ComparisonResult {
  readonly winner: Casino;
  readonly differences: RatingDifference[];
  readonly recommendation: string;
}

export interface RatingDifference {
  readonly category: string;
  readonly casino1Score: number;
  readonly casino2Score: number;
  readonly difference: number;
}

export interface BonusDisplay {
  readonly primary: string;
  readonly secondary?: string;
  readonly terms: string[];
  readonly highlight: boolean;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

export interface SEOMetadata {
  readonly title: string;
  readonly description: string;
  readonly keywords: string[];
  readonly canonical?: string;
  readonly ogImage?: string;
  readonly twitterCard?: string;
  readonly openGraph?: OpenGraphData;
}

export interface OpenGraphData {
  readonly title: string;
  readonly description: string;
  readonly image?: string;
  readonly type: string;
}

export interface Breadcrumb {
  readonly label: string;
  readonly href: string;
  readonly isActive: boolean;
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

export interface PageData {
  readonly content: unknown;
  readonly metadata: SEOMetadata;
  readonly navigation: NavigationData;
}

export interface NavigationData {
  readonly main: NavigationItem[];
  readonly footer: FooterSection[];
  readonly breadcrumbs: Breadcrumb[];
}

export interface ComponentData {
  readonly displayProps: Record<string, unknown>;
  readonly eventHandlers: Record<string, Function>;
  readonly state: Record<string, unknown>;
}

export interface UserAction {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
}

export interface PageFlowResult {
  readonly canAccess: boolean;
  readonly redirectTo?: string;
  readonly metadata: SEOMetadata;
}

export interface TransitionResult {
  readonly success: boolean;
  readonly error?: string;
  readonly analytics?: AnalyticsEvent;
}

export interface AccessResult {
  readonly hasAccess: boolean;
  readonly reason?: string;
  readonly requiredPermissions?: string[];
  readonly redirectTo?: string;
}

export interface AnalyticsEvent {
  readonly event: string;
  readonly properties: Record<string, unknown>;
  readonly timestamp: Date;
}

/**
 * Additional Supporting Types
 */
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

export interface FeaturedCasinoLink {
  readonly name: string;
  readonly slug: string;
  readonly href: string;
  readonly rating: number;
  readonly bonus?: string;
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

export interface MetaData {
  readonly title: string;
  readonly description: string;
  readonly keywords?: string;
  readonly canonical?: string;
  readonly ogTitle?: string;
  readonly ogDescription?: string;
  readonly ogImage?: string;
  readonly twitterTitle?: string;
  readonly twitterDescription?: string;
  readonly robots?: string;
}

export interface SchemaMarkup {
  readonly '@context': string;
  readonly '@type': string;
  readonly [key: string]: unknown;
}