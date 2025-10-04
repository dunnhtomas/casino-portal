/**
 * HomeVM - Home page view model utilities
 * Contains functions for processing casino data for the home page
 */

export interface Casino {
  slug: string;
  brand: string;
  overallRating?: number;
  ratings?: {
    security?: number;
    payout?: number;
    bonusValue?: number;
    games?: number;
    support?: number;
    reputation?: number;
  };
  [key: string]: any;
}

/**
 * Get top N casinos sorted by overall rating
 */
export function getTopThree(casinos: Casino[], count: number = 3): Casino[] {
  return casinos
    .map(casino => ({
      ...casino,
      overallRating: casino.overallRating ||
        (casino.ratings ?
          (casino.ratings.security || 0) * 0.2 +
          (casino.ratings.payout || 0) * 0.2 +
          (casino.ratings.bonusValue || 0) * 0.15 +
          (casino.ratings.games || 0) * 0.2 +
          (casino.ratings.support || 0) * 0.15 +
          (casino.ratings.reputation || 0) * 0.1
          : 0)
    }))
    .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
    .slice(0, count);
}