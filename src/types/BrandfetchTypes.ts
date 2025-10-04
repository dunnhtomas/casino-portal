/**
 * Type definitions for Brandfetch API
 */

export interface LogoFallbackItem {
  url: string;
  source: string;
  description: string;
}

export interface BrandfetchOptions {
  type?: string;
  theme?: string;
  fallback?: string;
  width?: number;
  height?: number;
  clientId?: string;
}

export interface CasinoLogo {
  url?: string;
  source?: string;
  domain?: string;
  fallbackChain?: LogoFallbackItem[];
  updatedAt?: string;
}

export interface Casino {
  url: string;
  brand?: string;
  logo?: CasinoLogo;
  [key: string]: any;
}
