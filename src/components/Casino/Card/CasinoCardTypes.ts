/**
 * CasinoCardTypes
 * Single Responsibility: Define all interfaces and types for casino card components
 */

export interface CasinoCardData {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
  readonly slug: string;
  readonly rating: CasinoRating;
  readonly bonuses: CasinoBonuses;
  readonly features: CasinoFeatures;
  readonly trustIndicators: TrustIndicators;
  readonly ctaData: CTAData;
}

export interface CasinoRating {
  readonly overall: number;
  readonly trust: number;
  readonly bonuses: number;
  readonly games: number;
  readonly support: number;
  readonly payout: number;
}

export interface CasinoBonuses {
  readonly welcome: WelcomeBonus;
  readonly noDeposit?: NoDepositBonus;
  readonly freeSpins?: FreeSpinsBonus;
}

export interface WelcomeBonus {
  readonly amount: string;
  readonly type: 'match' | 'fixed';
  readonly wagering: number;
  readonly maxWin?: string;
}

export interface NoDepositBonus {
  readonly amount: string;
  readonly type: 'cash' | 'spins';
  readonly wagering: number;
}

export interface FreeSpinsBonus {
  readonly count: number;
  readonly game: string;
  readonly wagering: number;
}

export interface CasinoFeatures {
  readonly gameCount: number;
  readonly payoutSpeed: string;
  readonly licenses: string[];
  readonly paymentMethods: string[];
  readonly mobileOptimized: boolean;
  readonly liveChat: boolean;
}

export interface TrustIndicators {
  readonly yearsActive: number;
  readonly playerCount?: string;
  readonly certifications: string[];
  readonly awards: string[];
}

export interface CTAData {
  readonly primaryText: string;
  readonly secondaryText?: string;
  readonly affiliateUrl: string;
  readonly reviewUrl: string;
  readonly trackingParams: Record<string, string>;
}

export interface CasinoCardProps {
  readonly data: CasinoCardData;
  readonly variant?: 'compact' | 'detailed' | 'featured';
  readonly showComparison?: boolean;
  readonly onCompareToggle?: (casinoId: string) => void;
  readonly className?: string;
}