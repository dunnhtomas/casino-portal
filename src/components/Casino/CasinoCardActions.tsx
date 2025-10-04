/**
 * Casino Card Actions Component
 * Single Responsibility: Display action buttons and T&Cs
 */

import React from 'react';

interface CasinoCardActionsProps {
  casinoSlug: string;
  casinoName: string;
  rank?: number;
  onCasinoClick: () => void;
}

export const CasinoCardActions: React.FC<CasinoCardActionsProps> = ({
  casinoSlug,
  casinoName,
  rank,
  onCasinoClick
}) => {
  return (
    <>
      <div className="flex space-x-3 mt-auto">
        <a
          href={`/reviews/${casinoSlug}`}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
          onClick={onCasinoClick}
        >
          Read Review
        </a>
        
        <a
          href={`/go/${casinoSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105 shadow-lg"
          onClick={onCasinoClick}
        >
          Play Now
        </a>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        18+ • T&Cs Apply • BeGambleAware.org
      </div>
    </>
  );
};
