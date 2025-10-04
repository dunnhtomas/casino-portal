/**
 * CasinoRatingManager
 * Single Responsibility: Calculate and manage casino ratings using standardized weights
 */

import type { Casino, CasinoRatings } from '../../core/types/DomainTypes';
import type { IRatingManager, RatingExplanation, ComparisonResult } from '../../core/interfaces/ApplicationInterfaces';
import { APPLICATION_CONSTANTS } from '../../core/constants/ApplicationConstants';

export class CasinoRatingManager implements IRatingManager {
  /**
   * Calculate overall rating based on weighted components
   */
  calculateOverallRating(casino: Casino): number {
    const { ratings } = casino;
    
    const weightedScore = 
      (ratings.security * APPLICATION_CONSTANTS.RATING_WEIGHTS.SECURITY) +
      (ratings.payout * APPLICATION_CONSTANTS.RATING_WEIGHTS.PAYOUT) +
      (ratings.bonusValue * APPLICATION_CONSTANTS.RATING_WEIGHTS.BONUS_VALUE) +
      (ratings.games * APPLICATION_CONSTANTS.RATING_WEIGHTS.GAMES) +
      (ratings.mobile * APPLICATION_CONSTANTS.RATING_WEIGHTS.MOBILE) +
      (ratings.support * APPLICATION_CONSTANTS.RATING_WEIGHTS.SUPPORT) +
      (ratings.reputation * APPLICATION_CONSTANTS.RATING_WEIGHTS.REPUTATION);

    return Math.round(weightedScore * 10) / 10;
  }

  /**
   * Generate detailed rating explanations for transparency
   */
  getRatingExplanation(casino: Casino): RatingExplanation[] {
    const { ratings } = casino;
    
    return [
      {
        category: 'Security & Fairness',
        score: ratings.security,
        explanation: this.getSecurityExplanation(ratings.security),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.SECURITY,
      },
      {
        category: 'Payout Speed',
        score: ratings.payout,
        explanation: this.getPayoutExplanation(ratings.payout),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.PAYOUT,
      },
      {
        category: 'Bonus Value',
        score: ratings.bonusValue,
        explanation: this.getBonusExplanation(ratings.bonusValue),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.BONUS_VALUE,
      },
      {
        category: 'Games & Providers',
        score: ratings.games,
        explanation: this.getGamesExplanation(ratings.games),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.GAMES,
      },
      {
        category: 'Mobile Experience',
        score: ratings.mobile,
        explanation: this.getMobileExplanation(ratings.mobile),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.MOBILE,
      },
      {
        category: 'Customer Support',
        score: ratings.support,
        explanation: this.getSupportExplanation(ratings.support),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.SUPPORT,
      },
      {
        category: 'Reputation',
        score: ratings.reputation,
        explanation: this.getReputationExplanation(ratings.reputation),
        weight: APPLICATION_CONSTANTS.RATING_WEIGHTS.REPUTATION,
      },
    ];
  }

  /**
   * Compare two casinos and provide detailed analysis
   */
  compareRatings(casino1: Casino, casino2: Casino): ComparisonResult {
    const rating1 = this.calculateOverallRating(casino1);
    const rating2 = this.calculateOverallRating(casino2);
    
    const winner = rating1 > rating2 ? casino1 : casino2;
    const differences = this.calculateRatingDifferences(casino1, casino2);
    const recommendation = this.generateRecommendation(casino1, casino2, differences);

    return {
      winner,
      differences,
      recommendation,
    };
  }

  /**
   * Get rating tier based on score
   */
  getRatingTier(score: number): string {
    if (score >= APPLICATION_CONSTANTS.RATING_SCALE.EXCELLENT_THRESHOLD) return 'Excellent';
    if (score >= APPLICATION_CONSTANTS.RATING_SCALE.GOOD_THRESHOLD) return 'Good';
    if (score >= APPLICATION_CONSTANTS.RATING_SCALE.AVERAGE_THRESHOLD) return 'Average';
    return 'Below Average';
  }

  /**
   * Private helper methods for generating explanations
   */
  private getSecurityExplanation(score: number): string {
    if (score >= 9) return 'Top-tier security with multiple licenses and certifications';
    if (score >= 7) return 'Strong security measures and licensed operations';
    if (score >= 5) return 'Basic security standards met with some concerns';
    return 'Security concerns identified requiring caution';
  }

  private getPayoutExplanation(score: number): string {
    if (score >= 9) return 'Lightning-fast payouts within 0-24 hours';
    if (score >= 7) return 'Quick withdrawals typically within 1-3 days';
    if (score >= 5) return 'Standard processing times of 3-5 days';
    return 'Slow withdrawal processing taking 5+ days';
  }

  private getBonusExplanation(score: number): string {
    if (score >= 9) return 'Outstanding bonus value with fair terms';
    if (score >= 7) return 'Good bonus offers with reasonable wagering';
    if (score >= 5) return 'Average bonuses with standard terms';
    return 'Limited bonus value or restrictive terms';
  }

  private getGamesExplanation(score: number): string {
    if (score >= 9) return 'Extensive game library from top providers';
    if (score >= 7) return 'Good variety of games from quality providers';
    if (score >= 5) return 'Decent game selection covering main categories';
    return 'Limited game variety or lower-quality providers';
  }

  private getMobileExplanation(score: number): string {
    if (score >= 9) return 'Exceptional mobile experience with dedicated app';
    if (score >= 7) return 'Well-optimized mobile site with full functionality';
    if (score >= 5) return 'Basic mobile compatibility with core features';
    return 'Poor mobile experience with limited functionality';
  }

  private getSupportExplanation(score: number): string {
    if (score >= 9) return '24/7 live chat with knowledgeable agents';
    if (score >= 7) return 'Good support availability with multiple channels';
    if (score >= 5) return 'Standard support hours with email/phone options';
    return 'Limited support availability or poor response quality';
  }

  private getReputationExplanation(score: number): string {
    if (score >= 9) return 'Excellent industry reputation with no major issues';
    if (score >= 7) return 'Good standing with occasional minor complaints';
    if (score >= 5) return 'Mixed reputation with some unresolved issues';
    return 'Poor reputation with significant player complaints';
  }

  private calculateRatingDifferences(casino1: Casino, casino2: Casino) {
    return [
      { category: 'Security', casino1Score: casino1.ratings.security, casino2Score: casino2.ratings.security, difference: casino1.ratings.security - casino2.ratings.security },
      { category: 'Payout', casino1Score: casino1.ratings.payout, casino2Score: casino2.ratings.payout, difference: casino1.ratings.payout - casino2.ratings.payout },
      { category: 'Bonuses', casino1Score: casino1.ratings.bonusValue, casino2Score: casino2.ratings.bonusValue, difference: casino1.ratings.bonusValue - casino2.ratings.bonusValue },
      { category: 'Games', casino1Score: casino1.ratings.games, casino2Score: casino2.ratings.games, difference: casino1.ratings.games - casino2.ratings.games },
      { category: 'Mobile', casino1Score: casino1.ratings.mobile, casino2Score: casino2.ratings.mobile, difference: casino1.ratings.mobile - casino2.ratings.mobile },
      { category: 'Support', casino1Score: casino1.ratings.support, casino2Score: casino2.ratings.support, difference: casino1.ratings.support - casino2.ratings.support },
      { category: 'Reputation', casino1Score: casino1.ratings.reputation, casino2Score: casino2.ratings.reputation, difference: casino1.ratings.reputation - casino2.ratings.reputation },
    ];
  }

  private generateRecommendation(casino1: Casino, casino2: Casino, differences: any[]): string {
    const strongestDifference = differences.reduce((max, current) => 
      Math.abs(current.difference) > Math.abs(max.difference) ? current : max
    );

    const winner = strongestDifference.difference > 0 ? casino1.brand : casino2.brand;
    const category = strongestDifference.category.toLowerCase();
    
    return `${winner} excels in ${category}, making it the better choice for players prioritizing this aspect.`;
  }
}