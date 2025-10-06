/**
 * Data Schemas Interface
 * Single responsibility: Define data structure schemas
 */

export interface BonusSchema {
  welcome: {
    headline: string;
    wagering: string;
    maxCashout: number;
  };
}

export interface RatingsSchema {
  security: number;
  fairness: number;
  payout: number;
  bonusValue: number;
  games: number;
  support: number;
  reputation: number;
}

export interface DataSchemas {
  casino: {
    required: string[];
    optional: string[];
    bonusStructure: BonusSchema;
    ratingsStructure: RatingsSchema;
  };
}