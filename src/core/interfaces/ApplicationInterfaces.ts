/**
 * Application Interfaces - Main Export
 * Single Responsibility: Re-export all interfaces from domain-specific files
 */

// Data Service Interfaces
export type {
  ICasinoDataService,
  IRegionDataService,
  INavigationDataService,
  IContentDataService,
  MenuStructure,
  FeaturedCasinoLink,
  HomepageContent,
  HeroContent,
  CTAButtons,
  BenefitItem,
  NavigationContent,
  FAQItem,
  NavigationItem,
  FooterSection
} from './DataServiceInterfaces';

// Manager Interfaces
export type {
  IRatingManager,
  IBonusManager,
  IContentManager,
  ISEOManager,
  ISchemaMarkupManager,
  RatingExplanation,
  ComparisonResult,
  RatingDifference,
  BonusDisplay,
  ValidationResult,
  SEOMetadata,
  OpenGraphData,
  Breadcrumb,
  SchemaMarkup,
  MetaData
} from './ManagerInterfaces';

// Coordinator Interfaces
export type {
  INavigationCoordinator,
  IPageCoordinator,
  PageFlowResult,
  TransitionResult,
  AccessResult,
  AnalyticsEvent
} from './CoordinatorInterfaces';

// ViewModel Interfaces
export type {
  IPageViewModel,
  IComponentViewModel,
  PageData,
  NavigationData,
  ComponentData,
  UserAction
} from './ViewModelInterfaces';
