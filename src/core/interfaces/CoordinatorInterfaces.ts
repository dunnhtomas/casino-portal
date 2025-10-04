/**
 * Coordinator Interfaces
 * Single Responsibility: Define contracts for coordinators
 */

import type { NavigationItem, FooterSection, Breadcrumb } from './DataServiceInterfaces';
import type { SEOMetadata } from './ManagerInterfaces';

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
