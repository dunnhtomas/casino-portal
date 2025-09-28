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
}

export const BonusDisplay: React.FC<BonusDisplayProps> = ({
  bonus,
  noDepositBonus,
  freeSpins,
  compact = false,
  onClick
}) => {
  return (
    <div className="bg-gradient-to-r from-gold-50 to-yellow-50 border border-gold-200 rounded-lg p-4">
      {/* Welcome Bonus */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-900 flex items-center">
            🎁 Welcome Bonus
            {bonus.type === 'match' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Match Bonus
              </span>
            )}
          </h4>
        </div>
        
        <div className="text-2xl font-bold text-gold-600 mb-1">
          {bonus.amount}
          {bonus.type === 'match' && (
            <span className="text-sm text-gray-600 ml-1">Match</span>
          )}
        </div>
        
        {!compact && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Wagering: {bonus.wagering}x</div>
            {bonus.maxWin && <div>• Max Win: {bonus.maxWin}</div>}
          </div>
        )}
      </div>

      {/* No Deposit Bonus */}
      {noDepositBonus && (
        <div className="mb-3 pt-3 border-t border-gold-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-800 flex items-center">
              💰 No Deposit Bonus
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Risk Free
              </span>
            </h5>
          </div>
          
          <div className="text-lg font-bold text-blue-600 mb-1">
            {noDepositBonus.amount}
            {noDepositBonus.type === 'spins' ? ' Free Spins' : ' Free Cash'}
          </div>
          
          {!compact && (
            <div className="text-sm text-gray-600">
              • Wagering: {noDepositBonus.wagering}x
            </div>
          )}
        </div>
      )}

      {/* Free Spins */}
      {freeSpins && (
        <div className="mb-3 pt-3 border-t border-gold-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-800 flex items-center">
              🎰 Free Spins
            </h5>
          </div>
          
          <div className="text-lg font-bold text-purple-600 mb-1">
            {freeSpins.count} Free Spins
          </div>
          
          {!compact && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Game: {freeSpins.game}</div>
              <div>• Wagering: {freeSpins.wagering}x</div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-600 hover:to-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
      >
        Claim Bonus
      </button>
      
      {!compact && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          18+ • Terms & Conditions Apply • BeGambleAware.org
        </div>
      )}
    </div>
  );
};

export default BonusDisplay;