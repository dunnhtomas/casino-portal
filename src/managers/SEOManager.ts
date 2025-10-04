/**
 * SEOManagerCoordinator (Refactored)
 * Single Responsibility: Coordinate different SEO managers
 * Follows composition over inheritance principle
 */

import type { ISEOManager } from '../core/interfaces/ApplicationInterfaces';
import type { Casino, Region } from '../core/types/DomainTypes';
import type { SEOMetadata } from '../core/interfaces/SEOInterfaces';

import { HomepageSEOManager } from './seo/HomepageSEOManager';
import { CasinoSEOManager } from './seo/CasinoSEOManager';
import { RegionSEOManager } from './seo/RegionSEOManager';

// Legacy interface for backward compatibility
interface MetaData extends SEOMetadata {}

export class SEOManager implements ISEOManager {
  private homepageSEOManager: HomepageSEOManager;
  private casinoSEOManager: CasinoSEOManager;
  private regionSEOManager: RegionSEOManager;

  constructor() {
    this.homepageSEOManager = new HomepageSEOManager();
    this.casinoSEOManager = new CasinoSEOManager();
    this.regionSEOManager = new RegionSEOManager();
  }

  /**
   * Generate homepage SEO metadata
   */
  generateHomepageMetadata(): SEOMetadata {
    return this.homepageSEOManager.generateMetadata();
  }

  /**
   * Generate casino review SEO metadata
   */
  generateCasinoReviewMetadata(casino: Casino): MetaData {
    return this.casinoSEOManager.generateMetadata(casino);
  }

  /**
   * Generate region page SEO metadata
   */
  generateRegionMetadata(region: Region): MetaData {
    return this.regionSEOManager.generateMetadata(region);
  }
}

// Re-export for backward compatibility
export type { SEOMetadata };