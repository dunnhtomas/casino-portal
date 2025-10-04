/**
 * Bonus Display Component
 * Enhanced bonus presentation based on Context7 research
 */

import React from 'react';

interface WelcomeBonusData {
  amount: string;
  type: 'match' | 'fixed';
  wagering: number;
  maxWin?: string;
}

interface NoDepositBonusData {
  amount: string;
  type: 'cash' | 'spins';
  wagering: number;
}

interface FreeSpinsData {
  count: number;
  game: string;
  wagering: number;
}

interface BonusDisplayProps {
  bonus: WelcomeBonusData;
  noDepositBonus?: NoDepositBonusData;
  freeSpins?: FreeSpinsData;
  compact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  casinoSlug?: string;
}

export const BonusDisplay: React.FC<BonusDisplayProps> = ({
  bonus,
  noDepositBonus,
  freeSpins,
  compact = false,
  onClick,
  casinoSlug
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 shadow-md">
      {/* Welcome Bonus */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-200 flex items-center text-sm">
            🎁 Welcome Bonus
            {bonus.type === 'match' && (
              <span className="ml-2 bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded-full border border-green-800">
                Match Bonus
              </span>
            )}
          </h4>
        </div>
        
        <div className="text-2xl font-bold text-gold-400 mb-1">
          {bonus.amount}
          {bonus.type === 'match' && (
            <span className="text-sm text-gray-400 ml-1">Match</span>
          )}
        </div>
        
        {!compact && (
          <div className="text-sm text-gray-400 space-y-1">
            <div>• Wagering: {bonus.wagering}x</div>
            {bonus.maxWin && <div>• Max Win: {bonus.maxWin}</div>}
          </div>
        )}
      </div>

      {/* No Deposit Bonus */}
      {noDepositBonus && (
        <div className="mb-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-200 flex items-center text-sm">
              💰 No Deposit Bonus
              <span className="ml-2 bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-800">
                Risk Free
              </span>
            </h5>
          </div>
          
          <div className="text-lg font-bold text-blue-400 mb-1">
            {noDepositBonus.amount}
            {noDepositBonus.type === 'spins' ? ' Free Spins' : ' Free Cash'}
          </div>
          
          {!compact && (
            <div className="text-sm text-gray-400">
              • Wagering: {noDepositBonus.wagering}x
            </div>
          )}
        </div>
      )}

      {/* Free Spins */}
      {freeSpins && (
        <div className="mb-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-200 flex items-center text-sm">
              🎰 Free Spins
            </h5>
          </div>
          
          <div className="text-lg font-bold text-purple-400 mb-1">
            {freeSpins.count} Free Spins
          </div>
          
          {!compact && (
            <div className="text-sm text-gray-400 space-y-1">
              <div>• Game: {freeSpins.game}</div>
              <div>• Wagering: {freeSpins.wagering}x</div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {casinoSlug ? (
        <a
          href={`/go/${casinoSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-center border border-gold-400"
        >
          Claim Bonus
        </a>
      ) : (
        <button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gold-400"
        >
          Claim Bonus
        </button>
      )}
      
      {!compact && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          18+ • Terms & Conditions Apply • BeGambleAware.org
        </div>
      )}
    </div>
  );
};

export default BonusDisplay;