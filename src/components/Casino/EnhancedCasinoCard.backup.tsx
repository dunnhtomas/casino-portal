/**
 * Enhanced Casino Card Component
 * Based on Context7 research and industry best practices
 * Implements premium casino comparison features
 */

import React from 'react';
import ResponsiveImage from '../Image/ResponsiveImage';
import { AdvancedRating } from '../Rating';
import { BonusDisplay } from '../Bonus';
import { TrustBadges } from '../Trust';

// Extend Window interface for gtag
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

export const EnhancedCasinoCard: React.FC<CasinoCardProps> = ({
  casino,
  variant = 'default',
  showComparison = false,
  onCompareToggle,
  isComparing = false,
  rank
}) => {
  const handleCasinoClick = () => {
    // Track casino card click
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
    // Track bonus interest
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bonus_click', {
        casino_name: casino.name,
        bonus_type: 'welcome'
      });
    }
  };

  const cardClasses = `
    bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
    ${variant === 'featured' ? 'border-gold-500 shadow-2xl ring-2 ring-gold-500/30' : 'border-gray-700 hover:border-gold-500/50'}
    ${variant === 'compact' ? 'p-4' : 'p-6'}
    ${isComparing ? 'ring-2 ring-primary-500' : ''}
    relative overflow-hidden
  `;

  return (
    <div className={cardClasses}>
      {/* Featured Badge */}
      {variant === 'featured' && (
        <div className="absolute -right-8 top-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-1 text-sm font-semibold transform rotate-12 shadow-lg border border-gold-400">
          Featured
        </div>
      )}

      {/* Popular Badge */}
      {casino.isPopular && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-red-500">
          🔥 Popular
        </div>
      )}

      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-primary-400">
          {rank}
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Header Section */}
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

          {/* Comparison Checkbox */}
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

        {/* Bonus Section */}
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

        {/* Features Section */}
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

          {/* Key Features */}
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

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-auto">
          <a
            href={`/reviews/${casino.slug}`}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
            onClick={handleCasinoClick}
          >
            Read Review
          </a>
          
          <a
            href={`/go/${casino.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={handleCasinoClick}
          >
            Play Now
          </a>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          18+ • T&Cs Apply • BeGambleAware.org
        </div>
      </div>
    </div>
  );
};

export default EnhancedCasinoCard;