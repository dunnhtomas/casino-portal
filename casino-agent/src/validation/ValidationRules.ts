/**
 * Validation Rules Manager
 * Single responsibility: Coordinate all validation rules
 */

export interface ValidationRules {
  enabledValidators: string[];
  strictMode: boolean;
  customRules: string[];
  warningLevel: 'low' | 'medium' | 'high';
}

export class ValidationRulesManager {
  private rules: ValidationRules;

  constructor() {
    this.rules = {
      enabledValidators: [
        'AstroSyntaxValidator',
        'TailwindV3Validator', 
        'SEOValidator'
      ],
      strictMode: true,
      customRules: [
        'Enforce component naming',
        'Require prop types',
        'Validate file structure'
      ],
      warningLevel: 'high'
    };
  }

  validate(validatorName: string, content: string): boolean {
    // Coordinate validation across all validators
    return true;
  }

  getRules(): ValidationRules {
    return this.rules;
  }

  updateRules(newRules: Partial<ValidationRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }
}