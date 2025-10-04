/**
 * Casino Card Header Component
 * Single Responsibility: Display casino logo, name, rating, and trust badges
 */

import React from 'react';
import ResponsiveImage from '../Image/ResponsiveImage';
import { AdvancedRating } from '../Rating';
import { TrustBadges } from '../Trust';
import type { CasinoCardData } from './EnhancedCasinoCard';

interface CasinoCardHeaderProps {
  casino: CasinoCardData;
  variant?: 'default' | 'featured' | 'compact' | 'comparison';
  showComparison?: boolean;
  onCompareToggle?: (casinoId: string) => void;
  isComparing?: boolean;
}

export const CasinoCardHeader: React.FC<CasinoCardHeaderProps> = ({
  casino,
  variant = 'default',
  showComparison = false,
  onCompareToggle,
  isComparing = false
}) => {
  return (
    <div className="flex items-start space-x-4 mb-4">
      <div className="flex-shrink-0">
        <ResponsiveImage
          src={casino.logo}
          alt={`${casino.name} logo`}
          className={`rounded-lg border border-gray-200 ${variant === 'compact' ? 'w-15 h-15' : 'w-20 h-20'}`}
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-xl font-bold text-white truncate mb-1">
          {casino.name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-2">
          <AdvancedRating
            rating={casino.rating}
            style="compact"
            showOverall={true}
          />
          <span className="text-sm text-gray-400">
            Est. {casino.established}
          </span>
        </div>

        <TrustBadges
          licenses={casino.licenses}
          isTrusted={casino.isTrusted}
          size="small"
        />
      </div>

      {showComparison && (
        <div className="flex-shrink-0">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isComparing}
              onChange={() => onCompareToggle?.(casino.id)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Compare</span>
          </label>
        </div>
      )}
    </div>
  );
};
