/**
 * CasinoCardHeader
 * Single Responsibility: Display casino logo, name, and overall rating
 */

import React from 'react';
import ResponsiveImage from '../../Image/ResponsiveImage';
import type { CasinoCardData } from './CasinoCardTypes';

interface CasinoCardHeaderProps {
  readonly data: Pick<CasinoCardData, 'name' | 'logo' | 'rating'>;
  readonly variant?: 'compact' | 'detailed';
}

export const CasinoCardHeader: React.FC<CasinoCardHeaderProps> = ({ 
  data, 
  variant = 'detailed' 
}) => {
  const { name, logo, rating } = data;

  const renderRatingStars = (ratingValue: number): React.ReactElement[] => {
    const stars: React.ReactElement[] = [];
    const fullStars = Math.floor(ratingValue / 2);
    const hasHalfStar = ratingValue % 2 >= 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={`star-full-${i}`} className="text-yellow-400 text-lg">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={`star-half-${i}`} className="text-yellow-400 text-lg">☆</span>
        );
      } else {
        stars.push(
          <span key={`star-empty-${i}`} className="text-gray-300 text-lg">☆</span>
        );
      }
    }
    
    return stars;
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`casino-card-header ${isCompact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`casino-logo ${isCompact ? 'w-12 h-12' : 'w-16 h-16'}`}>
            <ResponsiveImage
              src={logo}
              alt={`${name} Casino Logo`}
              width={isCompact ? 48 : 64}
              height={isCompact ? 48 : 64}
              className="rounded-lg object-contain bg-white shadow-sm"
              loading="lazy"
            />
          </div>
          
          <div className="casino-info">
            <h3 className={`casino-name font-bold text-white ${isCompact ? 'text-lg' : 'text-xl'}`}>
              {name}
            </h3>
            {!isCompact && (
              <div className="casino-rating-details text-sm text-gray-400 mt-1">
                <span>Overall Rating</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="casino-rating-badge flex flex-col items-end">
          <div className="rating-score bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg px-3 py-1">
            <span className={isCompact ? 'text-lg' : 'text-xl'}>
              {rating.overall.toFixed(1)}
            </span>
            <span className="text-sm">/10</span>
          </div>
          
          {!isCompact && (
            <div className="rating-stars flex mt-2">
              {renderRatingStars(rating.overall)}
            </div>
          )}
        </div>
      </div>
      
      {!isCompact && (
        <div className="rating-breakdown grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-700">Trust</div>
            <div className="text-blue-600 font-bold">{rating.trust}/10</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">Games</div>
            <div className="text-green-600 font-bold">{rating.games}/10</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">Payout</div>
            <div className="text-purple-600 font-bold">{rating.payout}/10</div>
          </div>
        </div>
      )}
    </div>
  );
};