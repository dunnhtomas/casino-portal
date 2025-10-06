/**
 * Agent System Manager
 * Single responsibility: Coordinate agent system operations
 */

import { AgentContext } from '../interfaces/AgentContext';
import { SmartAgent365Core, PageCreationResult } from './SmartAgent365Core';
import { PageConfig } from '../SmartAgent365System';

export class AgentSystemManager {
  private core: SmartAgent365Core;
  private validationEnabled: boolean = true;

  constructor(projectPath: string) {
    const context = this.initializeContext();
    this.core = new SmartAgent365Core(projectPath, context);
  }

  private initializeContext(): AgentContext {
    return {
      projectStructure: {
        casinoDataPath: 'data/casinos.json',
        componentPaths: {
          layout: 'src/components/Layout',
          casino: 'src/components/Casino',
          sections: 'src/components/Sections'
        },
        pagePaths: {
          reviews: 'src/pages/reviews',
          bonuses: 'src/pages/bonuses',
          games: 'src/pages/games',
          best: 'src/pages/best'
        },
        managerPaths: {
          seo: 'src/managers/SEOManager',
          navigation: 'src/coordinators/NavigationCoordinator',
          rating: 'src/managers/RatingManager'
        }
      },
      dataSchemas: {
        casino: {
          required: ['slug', 'brand', 'url', 'licences', 'bonuses', 'ratings'],
          optional: ['topTags', 'logo', 'payoutSpeedHours'],
          bonusStructure: {
            welcome: {
              headline: 'string',
              wagering: 'string',
              maxCashout: 600
            }
          },
          ratingsStructure: {
            security: 10,
            fairness: 9.9,
            payout: 9.5,
            bonusValue: 9,
            games: 10,
            support: 9,
            reputation: 9.7
          }
        }
      },
      componentInterfaces: {
        casinoCard: {
          required: ['casino'],
          optional: ['showDetailedRating', 'showBonusHighlight'],
          styling: ['enhanced', 'compact', 'detailed']
        },
        navigationMenu: {
          structure: ['hierarchical', 'breadcrumbs'],
          accessibility: ['aria-labels', 'semantic-html']
        },
        seoComponents: {
          schema: ['json-ld', 'microdata'],
          meta: ['title', 'description', 'og-tags']
        }
      },
      astroSyntaxRules: {
        frontmatterRules: [
          'Use --- delimiters for frontmatter',
          'Import statements at top',
          'Variable declarations after imports'
        ],
        templateRules: [
          'Use Astro template syntax, not JSX',
          'Use {expression} for dynamic content'
        ],
        jsxAvoidance: [
          'Never use return (<JSXElement>) syntax',
          'Use .map(item => <element>{item}</element>) directly'
        ],
        componentUsage: [
          'Props should be destructured in frontmatter',
          'Use client:load for interactive components'
        ]
      },
      tailwindV3Guidelines: {
        preferredUtilities: [
          'Use gap-* instead of space-*',
          'Use grid/flex layouts over absolute positioning'
        ],
        avoidedPatterns: [
          'Avoid @apply directives',
          'Avoid arbitrary values unless necessary'
        ],
        responsiveBreakpoints: ['sm:', 'md:', 'lg:', 'xl:', '2xl:'],
        colorPalette: [
          'gold-50', 'gold-100', 'gold-400', 'gold-500',
          'gray-50', 'gray-100', 'gray-700', 'gray-800'
        ]
      },
      seoRequirements: {
        metaTags: ['title', 'description', 'og-tags'],
        structuredData: ['json-ld', 'schema-markup'],
        accessibility: ['alt-text', 'aria-labels'],
        performance: ['image-optimization', 'css-minification']
      },
      validationRules: {
        enabledValidators: ['syntax', 'imports', 'tailwind', 'accessibility'],
        strictMode: true,
        customRules: ['component-naming', 'prop-types'],
        warningLevel: 'high'
      }
    };
  }

  async createPage(config: PageConfig): Promise<PageCreationResult> {
    return await this.core.createValidatedPage(config);
  }

  enableValidation(): void {
    this.validationEnabled = true;
  }

  disableValidation(): void {
    this.validationEnabled = false;
  }

  getContext(): AgentContext {
    return this.core.getContext();
  }

  updateContext(newContext: Partial<AgentContext>): void {
    this.core.updateContext(newContext);
  }
}