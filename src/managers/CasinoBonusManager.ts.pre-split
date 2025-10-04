/**
 * CasinoBonusManager
 * Single Responsibility: Manage and analyze casino bonus offerings
 */

import type { Casino, CasinoBonuses, WelcomeBonus } from '../../core/types/DomainTypes';
import type { IBonusManager, BonusDisplay, ValidationResult } from '../../core/interfaces/ApplicationInterfaces';

export class CasinoBonusManager implements IBonusManager {
  /**
   * Calculate the overall bonus value score for a casino
   */
  calculateBonusValue(casino: Casino): number {
    const { bonuses } = casino;
    let totalValue = 0;

    if (bonuses.welcome) {
      totalValue += this.calculateWelcomeBonusValue(bonuses.welcome);
    }

    if (bonuses.noDeposit) {
      totalValue += this.calculateNoDepositBonusValue(bonuses.noDeposit);
    }

    if (bonuses.freeSpins) {
      totalValue += this.calculateFreeSpinsBonusValue(bonuses.freeSpins);
    }

    // Normalize to 0-10 scale
    return Math.min(10, Math.round(totalValue * 10) / 10);
  }

  /**
   * Format bonus information for display
   */
  formatBonusDisplay(casino: Casino): BonusDisplay {
    const { bonuses } = casino;
    
    let primary = 'No Bonus Available';
    let secondary: string | undefined;
    const terms: string[] = [];
    let highlight = false;

    if (bonuses.welcome) {
      primary = bonuses.welcome.headline;
      terms.push(`${bonuses.welcome.wagering} wagering requirement`);
      if (bonuses.welcome.maxCashout) {
        terms.push(`Max cashout: ${bonuses.welcome.maxCashout}`);
      }
      highlight = bonuses.welcome.percentage >= 100;
    }

    if (bonuses.noDeposit) {
      secondary = `+ ${bonuses.noDeposit.headline} No Deposit`;
      terms.push(`${bonuses.noDeposit.wagering} wagering (no deposit)`);
    }

    if (bonuses.freeSpins && !secondary) {
      secondary = `+ ${bonuses.freeSpins.count} Free Spins`;
      terms.push(`Free spins on ${bonuses.freeSpins.game}`);
    }

    return {
      primary,
      secondary,
      terms,
      highlight,
    };
  }

  /**
   * Validate bonus terms and conditions
   */
  validateBonusTerms(casino: Casino): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { bonuses } = casino;

    // Validate welcome bonus
    if (bonuses.welcome) {
      this.validateWelcomeBonus(bonuses.welcome, errors, warnings);
    }

    // Validate no deposit bonus
    if (bonuses.noDeposit) {
      this.validateNoDepositBonus(bonuses.noDeposit, errors, warnings);
    }

    // Validate free spins bonus
    if (bonuses.freeSpins) {
      this.validateFreeSpinsBonus(bonuses.freeSpins, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get bonus recommendation based on player preferences
   */
  getBonusRecommendation(casino: Casino, playerType: 'conservative' | 'aggressive' | 'casual'): string {
    const { bonuses } = casino;
    
    if (playerType === 'conservative') {
      return this.getConservativeRecommendation(bonuses);
    }
    
    if (playerType === 'aggressive') {
      return this.getAggressiveRecommendation(bonuses);
    }
    
    return this.getCasualRecommendation(bonuses);
  }

  /**
   * Private calculation methods
   */
  private calculateWelcomeBonusValue(bonus: WelcomeBonus): number {
    let value = 0;
    
    // Base value from percentage and amount
    value += Math.min(bonus.percentage / 100, 2); // Cap at 200%
    value += Math.min(bonus.maxAmount / 1000, 3); // Cap at $3000 = 3 points
    
    // Wagering requirement penalty
    const wagering = parseInt(bonus.wagering.replace('x', ''));
    if (wagering <= 25) value += 1;
    else if (wagering <= 35) value += 0.5;
    else if (wagering >= 50) value -= 0.5;
    
    return Math.max(0, value);
  }

  private calculateNoDepositBonusValue(bonus: { amount: string; wagering: string }): number {
    const amount = parseFloat(bonus.amount.replace(/[$€£]/, ''));
    const wagering = parseInt(bonus.wagering.replace('x', ''));
    
    let value = amount / 10; // $10 = 1 point
    
    // Wagering penalty for no deposit bonuses
    if (wagering >= 50) value *= 0.5;
    else if (wagering <= 30) value *= 1.2;
    
    return Math.max(0, Math.min(2, value));
  }

  private calculateFreeSpinsBonusValue(bonus: { count: number; game: string; value: string }): number {
    const spinValue = parseFloat(bonus.value.replace(/[$€£]/, ''));
    const totalValue = bonus.count * spinValue;
    
    return Math.min(1, totalValue / 20); // $20 worth = 1 point
  }

  /**
   * Validation helper methods
   */
  private validateWelcomeBonus(bonus: WelcomeBonus, errors: string[], warnings: string[]): void {
    if (bonus.percentage < 50) {
      warnings.push('Welcome bonus percentage is below industry standard');
    }
    
    if (bonus.percentage > 500) {
      warnings.push('Unusually high bonus percentage may indicate restrictive terms');
    }
    
    const wagering = parseInt(bonus.wagering.replace('x', ''));
    if (wagering > 50) {
      warnings.push('High wagering requirement may make bonus difficult to complete');
    }
    
    if (!bonus.maxAmount || bonus.maxAmount < 100) {
      errors.push('Maximum bonus amount is too low or not specified');
    }
  }

  private validateNoDepositBonus(bonus: { amount: string; wagering: string }, errors: string[], warnings: string[]): void {
    const amount = parseFloat(bonus.amount.replace(/[$€£]/, ''));
    if (amount < 5) {
      warnings.push('No deposit bonus amount is very low');
    }
    
    const wagering = parseInt(bonus.wagering.replace('x', ''));
    if (wagering > 60) {
      warnings.push('No deposit bonus has very high wagering requirements');
    }
  }

  private validateFreeSpinsBonus(bonus: { count: number; game: string; value: string }, errors: string[], warnings: string[]): void {
    if (bonus.count < 10) {
      warnings.push('Free spins count is below average');
    }
    
    const spinValue = parseFloat(bonus.value.replace(/[$€£]/, ''));
    if (spinValue < 0.10) {
      warnings.push('Free spin value is very low');
    }
  }

  /**
   * Recommendation helper methods
   */
  private getConservativeRecommendation(bonuses: CasinoBonuses): string {
    if (bonuses.welcome && parseInt(bonuses.welcome.wagering.replace('x', '')) <= 30) {
      return 'Good welcome bonus with reasonable wagering requirements suitable for conservative play.';
    }
    return 'Consider focusing on the casino\'s game quality rather than bonuses for conservative play.';
  }

  private getAggressiveRecommendation(bonuses: CasinoBonuses): string {
    if (bonuses.welcome && bonuses.welcome.percentage >= 200) {
      return 'Excellent high-value bonus perfect for aggressive bonus hunting strategies.';
    }
    return 'Moderate bonus value - consider combining with other promotions for maximum value.';
  }

  private getCasualRecommendation(bonuses: CasinoBonuses): string {
    if (bonuses.welcome || bonuses.noDeposit) {
      return 'Solid bonus offering that provides good value for casual players.';
    }
    return 'Limited bonus options - focus on game variety and user experience.';
  }
}