/**
 * Advanced Rating Component
 * Multi-dimensional rating system based on Context7 research
 */

import React from 'react';

interface RatingData {
  overall: number;
  trust: number;
  bonuses: number;
  games: number;
  support: number;
  payout: number;
}

interface AdvancedRatingProps {
  rating: RatingData;
  style?: 'detailed' | 'compact' | 'stars-only';
  showOverall?: boolean;
  showBreakdown?: boolean;
}

// Helper component for progress bars with dynamic width
const ProgressBar: React.FC<{ value: number; max?: number }> = ({ value, max = 10 }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const getWidthClass = (pct: number) => {
    if (pct >= 90) return 'w-full';
    if (pct >= 80) return 'w-4/5';
    if (pct >= 70) return 'w-3/5';
    if (pct >= 60) return 'w-3/5';
    if (pct >= 50) return 'w-1/2';
    if (pct >= 40) return 'w-2/5';
    if (pct >= 30) return 'w-1/3';
    if (pct >= 20) return 'w-1/5';
    if (pct >= 10) return 'w-1/6';
    return 'w-1/12';
  };
  
  return (
    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 transition-all duration-300 ${getWidthClass(percentage)}`}
        title={`Rating: ${value.toFixed(1)} out of ${max}`}
      />
    </div>
  );
};

export const AdvancedRating: React.FC<AdvancedRatingProps> = ({
  rating,
  style = 'compact',
  showOverall = true,
  showBreakdown = false
}) => {
  const renderStars = (score: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = (score % 2) >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    
    return (
      <div className="flex items-center">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
          </svg>
        ))}
        
        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <svg className={`${starSize} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
            </svg>
            <div className="absolute inset-0 overflow-hidden half-star-clip">
              <svg className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className={`${starSize} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
          </svg>
        ))}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (style === 'stars-only') {
    return (
      <div className="flex items-center space-x-2">
        {renderStars(rating.overall)}
        <span className="text-sm font-medium text-gray-600">
          {(rating.overall / 2).toFixed(1)}
        </span>
      </div>
    );
  }

  if (style === 'compact') {
    return (
      <div className="flex items-center space-x-3">
        {showOverall && (
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-lg font-bold text-sm ${getScoreColor(rating.overall)}`}>
              {rating.overall.toFixed(1)}
            </div>
            {renderStars(rating.overall)}
          </div>
        )}
      </div>
    );
  }

  // Detailed view
  const categories = [
    { key: 'trust', label: 'Trust & Security', value: rating.trust },
    { key: 'games', label: 'Game Selection', value: rating.games },
    { key: 'bonuses', label: 'Bonuses', value: rating.bonuses },
    { key: 'support', label: 'Customer Support', value: rating.support },
    { key: 'payout', label: 'Payout Speed', value: rating.payout }
  ];

  return (
    <div className="space-y-3">
      {showOverall && (
        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(rating.overall).split(' ')[0]}`}>
              {rating.overall.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Overall</div>
          </div>
          <div className="flex flex-col space-y-1">
            {renderStars(rating.overall, 'md')}
            <div className="text-sm text-gray-600">
              Based on {categories.length} factors
            </div>
          </div>
        </div>
      )}

      {showBreakdown && (
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {category.label}
              </span>
              <div className="flex items-center space-x-2">
                <ProgressBar value={category.value} max={10} />
                <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(category.value)}`}>
                  {category.value.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedRating;