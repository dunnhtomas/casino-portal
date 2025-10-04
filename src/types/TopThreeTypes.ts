/**
 * Type definitions for TopThree component
 * Single Responsibility: Type safety for casino top list
 */

export interface CasinoBonus {
  amount: string;
  type: 'match' | 'cash' | 'spins';
  wagering: number;
  maxWin?: string;
}

export interface FreeSpinsBonus {
  count: number;
  game: string;
  wagering: number;
}

export interface CasinoBonuses {
  welcome: CasinoBonus;
  noDeposit?: CasinoBonus;
  freeSpins?: FreeSpinsBonus;
}

export interface PayoutSpeed {
  min: string;
  max: string;
  category: 'instant' | 'fast' | 'standard';
}

export interface License {
  name: string;
  country: string;
  logo: string;
}

export interface CasinoFeature {
  icon: string;
  label: string;
}
