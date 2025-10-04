/**
 * Casino Card Badges Component
 * Single Responsibility: Display featured, popular, and rank badges
 */

import React from 'react';

interface CasinoCardBadgesProps {
  variant?: 'default' | 'featured' | 'compact' | 'comparison';
  isPopular?: boolean;
  rank?: number;
}

export const CasinoCardBadges: React.FC<CasinoCardBadgesProps> = ({
  variant = 'default',
  isPopular = false,
  rank
}) => {
  return (
    <>
      {variant === 'featured' && (
        <div className="absolute -right-8 top-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-1 text-sm font-semibold transform rotate-12 shadow-lg border border-gold-400">
          Featured
        </div>
      )}

      {isPopular && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-red-500">
          🔥 Popular
        </div>
      )}

      {rank && (
        <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-primary-400">
          {rank}
        </div>
      )}
    </>
  );
};
