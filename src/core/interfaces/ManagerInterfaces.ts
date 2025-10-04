/**
 * Manager Interfaces
 * Single Responsibility: Define contracts for business logic managers
 */

import type { Casino } from '../types/DomainTypes';

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

export interface ISEOManager {
  generateHomepageMetadata(): SEOMetadata;
  generateCasinoReviewMetadata(casino: Casino): SEOMetadata;
  generateRegionMetadata(region: any): SEOMetadata;
}

export interface ISchemaMarkupManager {
  generateWebsiteSchema(): SchemaMarkup;
  generateOrganizationSchema(): SchemaMarkup;
  generateBreadcrumbSchema(breadcrumbs: Array<{ label: string; href: string }>): SchemaMarkup;
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaMarkup;
}

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

export interface SchemaMarkup {
  readonly '@context': string;
  readonly '@type': string;
  readonly [key: string]: unknown;
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
