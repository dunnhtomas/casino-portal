/**
 * Brandfetch API Integration for Casino Logos
 * 
 * REFACTORED: This file now re-exports from BrandfetchManager
 * Maintains backward compatibility with function-based API
 */

import { brandfetchManager, BrandfetchManager } from './BrandfetchManager';
import { BRANDFETCH_CONFIG } from '../config/BrandfetchConfig';
import type { BrandfetchOptions, Casino } from '../types/BrandfetchTypes';

// Re-export types and config
export { BRANDFETCH_CONFIG };
export type { BrandfetchOptions, Casino, CasinoLogo, LogoFallbackItem } from '../types/BrandfetchTypes';

// Function-based API for backward compatibility
export function generateBrandfetchUrl(domain: string, options: BrandfetchOptions = {}): string {
  return brandfetchManager.generateUrl(domain, options);
}

export function generateLogoVariants(domain: string, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
  const manager = new BrandfetchManager(clientId);
  return manager.generateVariants(domain);
}

export function extractDomain(url: string): string | null {
  return brandfetchManager.extractDomain(url);
}

export function generateFallbackChain(casino: Casino, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID) {
  const manager = new BrandfetchManager(clientId);
  return manager.generateFallbackChain(casino);
}

export function isValidLogoUrl(url: string): boolean {
  return brandfetchManager.isValidLogoUrl(url);
}

export function updateCasinoLogo(casino: Casino, clientId: string = BRANDFETCH_CONFIG.CLIENT_ID): Casino {
  const manager = new BrandfetchManager(clientId);
  return manager.updateCasinoLogo(casino);
}

// Default export for backward compatibility
export default {
  generateBrandfetchUrl,
  generateLogoVariants,
  extractDomain,
  generateFallbackChain,
  isValidLogoUrl,
  updateCasinoLogo,
  BRANDFETCH_CONFIG
};
