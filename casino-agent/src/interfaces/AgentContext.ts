/**
 * Agent Context Interface
 * Single responsibility: Agent runtime context definition
 */

// Import types BEFORE using them in interface definition
import type { ProjectStructure } from './ProjectStructure';
import type { DataSchemas } from './DataSchemas';
import type { ComponentInterfaces } from './ComponentInterfaces';
import type { AstroSyntaxRules } from '../validation/AstroSyntaxRules';
import type { TailwindV3Guidelines } from '../validation/TailwindV3Guidelines';
import type { SEORequirements } from '../validation/SEORequirements';
import type { ValidationRules } from '../validation/ValidationRules';

export interface AgentContext {
  projectStructure: ProjectStructure;
  dataSchemas: DataSchemas;
  componentInterfaces: ComponentInterfaces;
  astroSyntaxRules: AstroSyntaxRules;
  tailwindV3Guidelines: TailwindV3Guidelines;
  seoRequirements: SEORequirements;
  validationRules: ValidationRules;
}

// Re-exports for convenience
export type { ProjectStructure } from './ProjectStructure';
export type { DataSchemas } from './DataSchemas';
export type { ComponentInterfaces } from './ComponentInterfaces';
export type { AstroSyntaxRules } from '../validation/AstroSyntaxRules';
export type { TailwindV3Guidelines } from '../validation/TailwindV3Guidelines';
export type { SEORequirements } from '../validation/SEORequirements';
export type { ValidationRules } from '../validation/ValidationRules';