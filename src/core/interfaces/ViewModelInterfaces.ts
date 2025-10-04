/**
 * ViewModel Interfaces
 * Single Responsibility: Define contracts for presentation layer
 */

import type { SEOMetadata } from './ManagerInterfaces';
import type { NavigationItem, FooterSection, Breadcrumb } from './DataServiceInterfaces';

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
