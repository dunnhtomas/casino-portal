/**
 * Trust Badges Component
 * Security and licensing indicators based on Context7 research
 */

import React from 'react';

interface License {
  name: string;
  country: string;
  logo: string;
}

interface TrustBadgesProps {
  licenses: License[];
  isTrusted?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  licenses,
  isTrusted = false,
  size = 'medium',
  showLabels = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Trusted Badge */}
      {isTrusted && (
        <div className="flex items-center space-x-1">
          <div className="bg-green-100 p-1 rounded-full">
            <svg className={`${getSizeClasses()} text-green-600`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          {showLabels && (
            <span className={`${getTextSizeClasses()} text-green-700 font-medium`}>
              Trusted
            </span>
          )}
        </div>
      )}

      {/* License Badges */}
      {licenses.map((license, index) => (
        <div key={index} className="flex items-center space-x-1">
          <div className="bg-blue-100 p-1 rounded-full">
            <svg className={`${getSizeClasses()} text-blue-600`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </div>
          {showLabels && (
            <span className={`${getTextSizeClasses()} text-blue-700 font-medium`}>
              {license.name}
            </span>
          )}
        </div>
      ))}

      {/* SSL Security */}
      <div className="flex items-center space-x-1">
        <div className="bg-gray-100 p-1 rounded-full">
          <svg className={`${getSizeClasses()} text-gray-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        {showLabels && (
          <span className={`${getTextSizeClasses()} text-gray-700 font-medium`}>
            SSL
          </span>
        )}
      </div>

      {/* Responsible Gaming */}
      <div className="flex items-center space-x-1">
        <div className="bg-orange-100 p-1 rounded-full">
          <svg className={`${getSizeClasses()} text-orange-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        {showLabels && (
          <span className={`${getTextSizeClasses()} text-orange-700 font-medium`}>
            18+
          </span>
        )}
      </div>
    </div>
  );
};

export default TrustBadges;