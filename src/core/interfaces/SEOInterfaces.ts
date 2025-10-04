/**
 * SEO Manager Interfaces
 * Single Responsibility: Define contracts for all SEO managers
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterCard?: string;
  robots?: string;
  openGraph?: {
    title: string;
    description: string;
    type: string;
    url: string;
    siteName: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
  };
  structuredData?: any;
}

export interface ISEOMetadataGenerator {
  generateMetadata(...args: any[]): SEOMetadata;
}

export interface ISEOKeywordGenerator {
  generateKeywords(...args: any[]): string[];
}

export interface ISEOImageGenerator {
  generateImageUrl(...args: any[]): string;
}