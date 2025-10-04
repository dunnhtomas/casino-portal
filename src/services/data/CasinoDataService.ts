/**
 * CasinoDataService (Refactored)
 * Facade that coordinates all casino data operations
 */

import type { Casino } from '../../core/types/DomainTypes';
import type { ICasinoDataService } from '../../core/interfaces/ApplicationInterfaces';
import { CasinoRepository } from './casino/CasinoRepository';
import { CasinoQueryService } from './casino/CasinoQueryService';
import { CasinoFilterService } from './casino/CasinoFilterService';
import { CasinoStatisticsService } from './casino/CasinoStatisticsService';

export class CasinoDataService implements ICasinoDataService {
  private repository: CasinoRepository;
  private queryService: CasinoQueryService;
  private filterService: CasinoFilterService;
  private statisticsService: CasinoStatisticsService;

  constructor() {
    this.repository = new CasinoRepository();
    this.queryService = new CasinoQueryService(this.repository);
    this.filterService = new CasinoFilterService(this.repository);
    this.statisticsService = new CasinoStatisticsService(this.repository);
  }

  // Delegate to QueryService
  async getCasinoById(id: string): Promise<Casino | null> {
    return this.queryService.getCasinoById(id);
  }

  async getCasinoBySlug(slug: string): Promise<Casino | null> {
    return this.queryService.getCasinoBySlug(slug);
  }

  async getCasinosByRegion(regionId: string): Promise<Casino[]> {
    return this.queryService.getCasinosByRegion(regionId);
  }

  async searchCasinos(criteria: import('./casino/CasinoQueryService').CasinoSearchCriteria): Promise<Casino[]> {
    return this.queryService.searchCasinos(criteria);
  }

  // Delegate to FilterService
  async getTopCasinos(limit?: number): Promise<Casino[]> {
    return this.filterService.getTopCasinos(limit);
  }

  async getFeaturedCasinos(limit?: number): Promise<Casino[]> {
    return this.filterService.getFeaturedCasinos(limit);
  }

  // Delegate to Repository
  async getAllCasinos(): Promise<Casino[]> {
    return this.repository.getAllCasinos();
  }

  // Delegate to StatisticsService
  async getCasinoStatistics(): Promise<import('./casino/CasinoStatisticsService').CasinoStatistics> {
    return this.statisticsService.getCasinoStatistics();
  }

  // Cache management
  clearCache(): void {
    this.repository.clearCache();
  }
}

// Re-export types for backward compatibility
export type { CasinoSearchCriteria } from './casino/CasinoQueryService';
export type { CasinoStatistics } from './casino/CasinoStatisticsService';
