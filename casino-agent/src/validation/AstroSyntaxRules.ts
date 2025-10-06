/**
 * Astro Syntax Rules Validator
 * Single responsibility: Astro framework syntax validation
 */

export interface AstroSyntaxRules {
  frontmatterRules: string[];
  templateRules: string[];
  jsxAvoidance: string[];
  componentUsage: string[];
}

export class AstroSyntaxValidator {
  private rules: AstroSyntaxRules;

  constructor() {
    this.rules = {
      frontmatterRules: [
        'Use --- delimiter for frontmatter',
        'Define types for all props',
        'Import statements at top'
      ],
      templateRules: [
        'Use Astro components for layouts',
        'Prefer server-side rendering',
        'Minimize client-side JavaScript'
      ],
      jsxAvoidance: [
        'Avoid React-style event handlers',
        'Use Astro directives instead of JSX',
        'Server-first approach'
      ],
      componentUsage: [
        'Export default for Astro components',
        'Use .astro extension',
        'Follow component naming conventions'
      ]
    };
  }

  validate(content: string): boolean {
    // Validation logic implementation
    return true;
  }

  getRules(): AstroSyntaxRules {
    return this.rules;
  }
}