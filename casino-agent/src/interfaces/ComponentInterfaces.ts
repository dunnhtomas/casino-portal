/**
 * Component Interfaces
 * Single responsibility: Define component interface contracts
 */

export interface ComponentInterfaces {
  casinoCard: {
    required: string[];
    optional: string[];
    styling: string[];
  };
  navigationMenu: {
    structure: string[];
    accessibility: string[];
  };
  seoComponents: {
    schema: string[];
    meta: string[];
  };
}