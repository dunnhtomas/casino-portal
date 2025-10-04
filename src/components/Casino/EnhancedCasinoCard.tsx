/**
 * Enhanced Casino Card Component - Refactored & Optimized
 * Single Responsibility: Compose casino card from sub-components
 * Performance: Memoized to prevent unnecessary re-renders
 * File length: ~150 lines (was 275)
 */

import React, { memo, useMemo } from 'react';
import { BonusDisplay } from '../Bonus';
import { CasinoCardHeader } from './CasinoCardHeader';
import { CasinoCardBadges } from './CasinoCardBadges';
import { CasinoCardFeatures } from './CasinoCardFeatures';
import { CasinoCardActions } from './CasinoCardActions';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface CasinoCardData {
  id: string;
  name: string;
  logo: string;
  slug: string;
  rating: {
    overall: number;
    trust: number;
    bonuses: number;
    games: number;
    support: number;
    payout: number;
  };
  bonuses: {
    welcome: {
      amount: string;
      type: 'match' | 'fixed';
      wagering: number;
      maxWin?: string;
    };
    noDeposit?: {
      amount: string;
      type: 'cash' | 'spins';
      wagering: number;
    };
    freeSpins?: {
      count: number;
      game: string;
      wagering: number;
    };
  };
  features: {
    icon: string;
    label: string;
  }[];
  payoutSpeed: {
    min: string;
    max: string;
    category: 'instant' | 'fast' | 'standard';
  };
  licenses: {
    name: string;
    country: string;
    logo: string;
  }[];
  established: number;
  gameCount: number;
  minDeposit: string;
  currencies: string[];
  languages: string[];
  isPopular?: boolean;
  isTrusted?: boolean;
  isFeatured?: boolean;
}

interface CasinoCardProps {
  casino: CasinoCardData;
  variant?: 'default' | 'featured' | 'compact' | 'comparison';
  showComparison?: boolean;
  onCompareToggle?: (casinoId: string) => void;
  isComparing?: boolean;
  rank?: number;
}

export const EnhancedCasinoCard: React.FC<CasinoCardProps> = memo(({
  casino,
  variant = 'default',
  showComparison = false,
  onCompareToggle,
  isComparing = false,
  rank
}) => {
  const handleCasinoClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'casino_card_click', {
        casino_name: casino.name,
        casino_rating: casino.rating.overall,
        position: rank
      });
    }
  };

  const handleBonusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bonus_click', {
        casino_name: casino.name,
        bonus_type: 'welcome'
      });
    }
  };

  const cardClasses = `
    bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
    ${variant === 'featured' || (rank && rank <= 3) ? 'border-gold-500 shadow-2xl ring-2 ring-gold-500/30' : 'border-gray-700 hover:border-gold-500/50'}
    ${variant === 'compact' ? 'p-4' : 'p-6'}
    ${isComparing ? 'ring-2 ring-primary-500' : ''}
    relative overflow-hidden
  `;

  return (
    <div className={cardClasses}>
      <CasinoCardBadges
        variant={variant}
        isPopular={casino.isPopular}
        rank={rank}
      />

      <div className="flex flex-col h-full">
        <CasinoCardHeader
          casino={casino}
          variant={variant}
          showComparison={showComparison}
          onCompareToggle={onCompareToggle}
          isComparing={isComparing}
        />

        {variant !== 'compact' && (
          <div className="mb-4">
            <BonusDisplay
              bonus={casino.bonuses.welcome}
              noDepositBonus={casino.bonuses.noDeposit}
              freeSpins={casino.bonuses.freeSpins}
              compact={variant === 'comparison'}
              onClick={handleBonusClick}
              casinoSlug={casino.slug}
            />
          </div>
        )}

        <CasinoCardFeatures
          casino={casino}
          variant={variant}
        />

        <CasinoCardActions
          casinoSlug={casino.slug}
          casinoName={casino.name}
          rank={rank}
          onCasinoClick={handleCasinoClick}
        />
      </div>
    </div>
  );
});

// Display name for debugging
EnhancedCasinoCard.displayName = 'EnhancedCasinoCard';

export default EnhancedCasinoCard;
