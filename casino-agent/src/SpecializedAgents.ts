import { SmartAgent365System, PageConfig } from './SmartAgent365System';
import { Context7Integration } from './Context7Integration';

/**
 * Specialized Agent Roles with Domain Expertise
 * Each agent has specific knowledge and validation rules for their domain
 */

export abstract class SpecializedAgent {
  protected smartSystem: SmartAgent365System;
  protected context7: Context7Integration;
  protected role: string;
  protected expertise: string[];

  constructor(smartSystem: SmartAgent365System, role: string) {
    this.smartSystem = smartSystem;
    this.context7 = new Context7Integration();
    this.role = role;
    this.expertise = this.defineExpertise();
  }

  protected abstract defineExpertise(): string[];
  public abstract validateContent(content: string, config: PageConfig): Promise<ValidationResult>;
  public abstract enhanceConfig(config: PageConfig): Promise<PageConfig>;
}

/**
 * 🏗️ Architect Agent - Project Structure & Architecture
 */
export class ArchitectAgent extends SpecializedAgent {
  constructor(smartSystem: SmartAgent365System) {
    super(smartSystem, 'Architect');
    console.log('🏗️ ARCHITECT AGENT: Project structure and architecture specialist');
  }

  protected defineExpertise(): string[] {
    return [
      'Project structure and file organization',
      'Component architecture and patterns',
      'Import/export management',
      'Module dependency optimization',
      'Code organization best practices',
      'Scalability and maintainability patterns'
    ];
  }

  public async validateContent(content: string, config: PageConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate component structure
    if (!content.includes('---')) {
      errors.push('ARCHITECT: Missing Astro frontmatter section');
    }

    // Validate imports organization
    const importSection = content.split('---')[1];
    if (importSection) {
      const lines = importSection.split('\\n');
      const imports = lines.filter(line => line.trim().startsWith('import'));
      const nonImports = lines.filter(line => !line.trim().startsWith('import') && line.trim() && !line.trim().startsWith('//'));
      
      if (imports.length > 0 && nonImports.length > 0) {
        const firstNonImport = lines.findIndex(line => !line.trim().startsWith('import') && line.trim() && !line.trim().startsWith('//'));
        const lastImport = lines.map((line, i) => line.trim().startsWith('import') ? i : -1).filter(i => i !== -1).pop();
        
        if (lastImport && firstNonImport < lastImport) {
          warnings.push('ARCHITECT: Consider grouping all imports at the top of frontmatter');
        }
      }
    }

    // Validate component naming and structure
    if (config.outputPath.includes('/index.astro') && !content.includes('<main')) {
      warnings.push('ARCHITECT: Page components should include semantic <main> element');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async enhanceConfig(config: PageConfig): Promise<PageConfig> {
    return {
      ...config,
      // Architect enhancements as additional properties
      seoOptimized: config.seoOptimized || true,
      accessibilityCompliant: config.accessibilityCompliant || true
    };
  }
}

/**
 * 🎨 Frontend Agent - UI/UX and Visual Design
 */
export class FrontendAgent extends SpecializedAgent {
  constructor(smartSystem: SmartAgent365System) {
    super(smartSystem, 'Frontend');
    console.log('🎨 FRONTEND AGENT: UI/UX and visual design specialist');
  }

  protected defineExpertise(): string[] {
    return [
      'Tailwind CSS v3 utilities and patterns',
      'Responsive design and mobile-first approach',
      'Accessibility (WCAG 2.1) compliance',
      'Visual hierarchy and typography',
      'Color theory and brand consistency',
      'Animation and micro-interactions',
      'Cross-browser compatibility'
    ];
  }

  public async validateContent(content: string, config: PageConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate Tailwind v3 usage
    const deprecatedClasses = ['space-x-', 'space-y-', 'divide-x-', 'divide-y-'];
    deprecatedClasses.forEach(deprecated => {
      if (content.includes(deprecated)) {
        errors.push(`FRONTEND: Replace deprecated '${deprecated}' with gap-* utilities`);
      }
    });

    // Validate responsive design patterns
    if (!content.includes('md:') && !content.includes('lg:')) {
      warnings.push('FRONTEND: Consider adding responsive breakpoints for better mobile experience');
    }

    // Validate accessibility
    if (content.includes('<img') && !content.includes('alt=')) {
      errors.push('FRONTEND: All images must have alt attributes for accessibility');
    }

    if (content.includes('<button') && !content.includes('aria-')) {
      warnings.push('FRONTEND: Consider adding ARIA attributes to buttons for accessibility');
    }

    // Validate color consistency
    const colorPattern = /(?:bg-|text-|border-)(\\w+)-(\\d+)/g;
    const colors = [...content.matchAll(colorPattern)];
    const uniqueColors = [...new Set(colors.map(match => match[1]))];
    
    if (uniqueColors.length > 4) {
      warnings.push('FRONTEND: Consider limiting color palette for better brand consistency');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async enhanceConfig(config: PageConfig): Promise<PageConfig> {
    return {
      ...config,
      // Frontend enhancements
      accessibilityCompliant: true,
      mobileOptimized: true,
      colorScheme: config.colorScheme || { primary: 'gold', secondary: 'gray', accent: 'blue' }
    };
  }
}

/**
 * 🗄️ Backend Agent - Data Management & Logic
 */
export class BackendAgent extends SpecializedAgent {
  constructor(smartSystem: SmartAgent365System) {
    super(smartSystem, 'Backend');
    console.log('🗄️ BACKEND AGENT: Data management and business logic specialist');
  }

  protected defineExpertise(): string[] {
    return [
      'Data schema validation and type safety',
      'API integration and data fetching',
      'State management patterns',
      'Error handling and resilience',
      'Performance optimization',
      'Security best practices',
      'Database query optimization'
    ];
  }

  public async validateContent(content: string, config: PageConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate data access patterns
    if (content.includes('.welcomeBonus')) {
      errors.push('BACKEND: Use correct schema - casino.bonuses.welcome instead of casino.welcomeBonus');
    }

    if (content.includes('.overallRating')) {
      errors.push('BACKEND: Use correct schema - casino.ratings.reputation instead of casino.overallRating');
    }

    // Validate error handling
    if (content.includes('filter(') && !content.includes('?.')) {
      warnings.push('BACKEND: Consider using optional chaining (?.) for safer property access');
    }

    // Validate data processing efficiency
    if (content.includes('.filter(') && content.includes('.sort(') && content.includes('.slice(')) {
      const filterIndex = content.indexOf('.filter(');
      const sortIndex = content.indexOf('.sort(');
      const sliceIndex = content.indexOf('.slice(');
      
      if (sliceIndex < sortIndex || sliceIndex < filterIndex) {
        warnings.push('BACKEND: Apply .slice() after .filter() and .sort() for better performance');
      }
    }

    // Validate type safety
    if (content.includes('|| 0') || content.includes('|| \'\'\'')) {
      warnings.push('BACKEND: Consider using proper TypeScript types instead of fallback operators');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async enhanceConfig(config: PageConfig): Promise<PageConfig> {
    return {
      ...config,
      // Backend enhancements
      performanceOptimized: true,
      seoOptimized: true
    };
  }
}

/**
 * 🚀 SEO Agent - Search Engine Optimization
 */
export class SEOAgent extends SpecializedAgent {
  constructor(smartSystem: SmartAgent365System) {
    super(smartSystem, 'SEO');
    console.log('🚀 SEO AGENT: Search engine optimization and content specialist');
  }

  protected defineExpertise(): string[] {
    return [
      'Meta tags optimization',
      'Structured data and schema markup',
      'URL structure and slugification',
      'Content optimization and keyword density',
      'Core Web Vitals and page speed',
      'Internal linking strategies',
      'Social media integration'
    ];
  }

  public async validateContent(content: string, config: PageConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate title length
    if (config.title && config.title.length > 60) {
      warnings.push('SEO: Title should be under 60 characters for optimal search display');
    }

    // Validate meta description
    if (config.description && (config.description.length < 120 || config.description.length > 160)) {
      warnings.push('SEO: Description should be 120-160 characters for optimal search display');
    }

    // Validate heading structure
    const h1Count = (content.match(/<h1/g) || []).length;
    if (h1Count === 0) {
      errors.push('SEO: Page must have exactly one H1 heading');
    } else if (h1Count > 1) {
      errors.push('SEO: Page should have only one H1 heading');
    }

    // Validate structured data
    if (!content.includes('schema') && !content.includes('json-ld')) {
      warnings.push('SEO: Consider adding structured data for better search visibility');
    }

    // Validate internal linking
    if (!content.includes('href="/') && config.pageType !== 'comparison') {
      warnings.push('SEO: Add internal links to improve site navigation and SEO');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async enhanceConfig(config: PageConfig): Promise<PageConfig> {
    return {
      ...config,
      // SEO enhancements
      seoOptimized: true,
      accessibilityCompliant: true,
      mobileOptimized: true
    };
  }
}

/**
 * 🧪 QA Agent - Quality Assurance & Testing
 */
export class QAAgent extends SpecializedAgent {
  constructor(smartSystem: SmartAgent365System) {
    super(smartSystem, 'QA');
    console.log('🧪 QA AGENT: Quality assurance and testing specialist');
  }

  protected defineExpertise(): string[] {
    return [
      'Code quality and consistency',
      'Cross-browser compatibility',
      'Performance testing and optimization',
      'Accessibility testing (WCAG compliance)',
      'User experience validation',
      'Security vulnerability scanning',
      'Content quality assurance'
    ];
  }

  public async validateContent(content: string, config: PageConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate code consistency
    const indentationPattern = /^(\\t+|  +)/gm;
    const indentations = content.match(indentationPattern);
    if (indentations) {
      const hasSpaces = indentations.some(indent => indent.includes(' '));
      const hasTabs = indentations.some(indent => indent.includes('\\t'));
      if (hasSpaces && hasTabs) {
        warnings.push('QA: Inconsistent indentation - use either spaces or tabs consistently');
      }
    }

    // Validate performance patterns
    if (content.includes('client:load') && !content.includes('priority={')) {
      warnings.push('QA: Consider adding priority prop to client:load components for better performance');
    }

    // Validate content quality
    if (content.includes('Lorem ipsum') || content.includes('placeholder')) {
      errors.push('QA: Remove placeholder content before production');
    }

    // Validate accessibility
    if (content.includes('onClick') && !content.includes('onKeyDown')) {
      warnings.push('QA: Interactive elements should support keyboard navigation');
    }

    // Validate security
    if (content.includes('dangerouslySetInnerHTML') || content.includes('innerHTML')) {
      warnings.push('QA: Avoid innerHTML manipulation - potential XSS vulnerability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async enhanceConfig(config: PageConfig): Promise<PageConfig> {
    return {
      ...config,
      // QA enhancements
      performanceOptimized: true,
      accessibilityCompliant: true,
      seoOptimized: true
    };
  }
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export { ValidationResult };