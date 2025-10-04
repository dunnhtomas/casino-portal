/**
 * Core Domain Types
 * Single Responsibility: Define core domain models for the casino application
 */

export interface Casino {
  readonly id: string;
  readonly slug: string;
  readonly brand: string;
  readonly name: string; // Added for display purposes
  readonly domain: string;
  readonly website: string; // Added for schema markup
  readonly ratings: CasinoRatings;
  readonly bonuses: CasinoBonuses;
  readonly features: CasinoFeatures;
  readonly safety: CasinoSafety;
  readonly logo?: CasinoLogo;
  readonly reviewDate: string; // Added for schema markup
  readonly lastUpdated: string; // Added for schema markup
}

export interface CasinoRatings {
  readonly overall: number;
  readonly security: number;
  readonly payout: number;
  readonly bonusValue: number;
  readonly games: number;
  readonly mobile: number;
  readonly support: number;
  readonly reputation: number;
}

export interface CasinoBonuses {
  readonly welcome?: WelcomeBonus;
  readonly noDeposit?: NoDepositBonus;
  readonly freeSpins?: FreeSpinsBonus;
}

export interface WelcomeBonus {
  readonly headline: string;
  readonly amount: string;
  readonly percentage: number;
  readonly maxAmount: number;
  readonly wagering: string;
  readonly maxCashout?: string;
}

export interface NoDepositBonus {
  readonly headline: string;
  readonly amount: string;
  readonly wagering: string;
  readonly maxCashout?: string;
}

export interface FreeSpinsBonus {
  readonly count: number;
  readonly game: string;
  readonly value: string;
  readonly wagering: string;
}

export interface CasinoFeatures {
  readonly gameProviders: string[];
  readonly paymentMethods: string[];
  readonly currencies: string[];
  readonly languages: string[];
  readonly licenses: string[];
  readonly restrictedCountries?: string[];
}

export interface CasinoSafety {
  readonly yearsOnline?: number;
  readonly licenses: string[];
  readonly certification: string[];
  readonly securityMeasures: string[];
}

export interface CasinoLogo {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface Region {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly legalStatus: LegalStatus;
  readonly recommendedCasinos: string[];
}

export interface LegalStatus {
  readonly isLegal: boolean;
  readonly regulatoryBody?: string;
  readonly restrictions: string[];
  readonly notes?: string;
}