// Additional type definitions for the Smart Agent System
interface ComponentInterfaces {
  casinoCard: {
    props: string[];
    required: string[];
  };
  layout: {
    props: string[];
    required: string[];
  };
}

interface SEORequirements {
  titleFormat: string;
  metaDescription: string;
  structuredData: string;
  breadcrumbs: string;
}

interface ValidationRules {
  syntax: string[];
  imports: string[];
  tailwind: string[];
  accessibility: string[];
}