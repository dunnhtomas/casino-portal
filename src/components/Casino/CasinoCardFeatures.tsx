/**
 * Casino Card Features Component
 * Single Responsibility: Display casino features and key information
 */

import React from 'react';
import type { CasinoCardData } from './EnhancedCasinoCard';

interface CasinoCardFeaturesProps {
  casino: CasinoCardData;
  variant?: 'default' | 'featured' | 'compact' | 'comparison';
}

export const CasinoCardFeatures: React.FC<CasinoCardFeaturesProps> = ({
  casino,
  variant = 'default'
}) => {
  return (
    <div className="mb-4 flex-grow">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center text-gray-300">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {casino.gameCount}+ Games
        </div>
        
        <div className="flex items-center text-gray-300">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
          </svg>
          Min: {casino.minDeposit}
        </div>
        
        <div className="flex items-center text-gray-300">
          <svg className="w-4 h-4 mr-2 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {casino.payoutSpeed.min}-{casino.payoutSpeed.max}
        </div>
        
        <div className="flex items-center text-gray-300">
          <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {casino.languages.length} Languages
        </div>
      </div>

      {variant !== 'compact' && casino.features.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {casino.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800"
              >
                <span className="mr-1">{feature.icon}</span>
                {feature.label}
              </span>
            ))}
            {casino.features.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                +{casino.features.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
