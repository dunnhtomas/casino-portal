// Country-specific design themes with cultural color preferences
export const countryThemes = {
  // United Kingdom - Traditional Royal Colors
  'UK': {
    primary: 'rgb(0, 20, 137)', // Royal Blue
    secondary: 'rgb(206, 17, 38)', // Royal Red
    accent: 'rgb(255, 215, 0)', // Gold
    background: 'rgb(248, 249, 250)',
    text: 'rgb(17, 24, 39)',
    gradient: 'from-blue-900 via-red-700 to-yellow-500',
    cultural: {
      fontFamily: 'serif',
      patterns: ['heraldic', 'royal'],
      symbols: ['🇬🇧', '👑', '🏰']
    }
  },

  // Germany - Bold and Efficient
  'DE': {
    primary: 'rgb(0, 0, 0)', // Black
    secondary: 'rgb(221, 0, 0)', // Red
    accent: 'rgb(255, 206, 84)', // Gold
    background: 'rgb(250, 250, 250)',
    text: 'rgb(31, 41, 55)',
    gradient: 'from-gray-900 via-red-600 to-yellow-400',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['geometric', 'industrial'],
      symbols: ['🇩🇪', '🏭', '⚙️']
    }
  },

  // France - Elegant and Sophisticated  
  'FR': {
    primary: 'rgb(0, 35, 149)', // French Blue
    secondary: 'rgb(237, 41, 57)', // French Red
    accent: 'rgb(255, 255, 255)', // White
    background: 'rgb(252, 252, 252)',
    text: 'rgb(55, 65, 81)',
    gradient: 'from-blue-800 via-white to-red-600',
    cultural: {
      fontFamily: 'serif',
      patterns: ['elegant', 'ornate'],
      symbols: ['🇫🇷', '🥖', '🍷']
    }
  },

  // Spain - Warm and Vibrant
  'ES': {
    primary: 'rgb(170, 4, 36)', // Spanish Red
    secondary: 'rgb(255, 196, 37)', // Spanish Yellow
    accent: 'rgb(0, 47, 95)', // Deep Blue
    background: 'rgb(255, 248, 240)',
    text: 'rgb(87, 13, 248)',
    gradient: 'from-red-700 via-yellow-400 to-blue-800',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['flamenco', 'moorish'],
      symbols: ['🇪🇸', '💃', '🏛️']
    }
  },

  // Italy - Passionate and Artistic
  'IT': {
    primary: 'rgb(0, 140, 69)', // Italian Green
    secondary: 'rgb(206, 43, 55)', // Italian Red
    accent: 'rgb(255, 255, 255)', // White
    background: 'rgb(252, 253, 248)',
    text: 'rgb(34, 34, 34)',
    gradient: 'from-green-700 via-white to-red-600',
    cultural: {
      fontFamily: 'serif',
      patterns: ['renaissance', 'classical'],
      symbols: ['🇮🇹', '🎨', '🏛️']
    }
  },

  // Netherlands - Modern and Clean
  'NL': {
    primary: 'rgb(255, 102, 51)', // Dutch Orange
    secondary: 'rgb(0, 70, 173)', // Dutch Blue
    accent: 'rgb(255, 255, 255)', // White
    background: 'rgb(250, 251, 252)',
    text: 'rgb(31, 41, 55)',
    gradient: 'from-orange-500 via-white to-blue-700',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['minimalist', 'modern'],
      symbols: ['🇳🇱', '🌷', '🚲']
    }
  },

  // Sweden - Clean and Natural
  'SE': {
    primary: 'rgb(0, 106, 167)', // Swedish Blue
    secondary: 'rgb(254, 204, 0)', // Swedish Yellow
    accent: 'rgb(255, 255, 255)', // White
    background: 'rgb(248, 250, 252)',
    text: 'rgb(55, 65, 81)',
    gradient: 'from-blue-600 via-yellow-400 to-white',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['nordic', 'minimalist'],
      symbols: ['🇸🇪', '🌲', '❄️']
    }
  },

  // Australia - Bold and Natural
  'AU': {
    primary: 'rgb(0, 123, 191)', // Australian Blue
    secondary: 'rgb(255, 255, 255)', // White
    accent: 'rgb(255, 215, 0)', // Gold
    background: 'rgb(248, 249, 250)',
    text: 'rgb(34, 34, 34)',
    gradient: 'from-blue-600 via-white to-yellow-500',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['outback', 'coastal'],
      symbols: ['🇦🇺', '🦘', '🏄‍♂️']
    }
  },

  // Canada - Natural and Friendly
  'CA': {
    primary: 'rgb(207, 20, 43)', // Canadian Red
    secondary: 'rgb(255, 255, 255)', // White
    accent: 'rgb(255, 215, 0)', // Gold
    background: 'rgb(249, 250, 251)',
    text: 'rgb(31, 41, 55)',
    gradient: 'from-red-600 via-white to-red-600',
    cultural: {
      fontFamily: 'sans-serif',
      patterns: ['maple', 'natural'],
      symbols: ['🇨🇦', '🍁', '🏔️']
    }
  }
};

// Default theme for countries not specifically configured
export const defaultTheme = {
  primary: 'rgb(59, 130, 246)', // Blue
  secondary: 'rgb(16, 185, 129)', // Emerald
  accent: 'rgb(245, 158, 11)', // Amber
  background: 'rgb(249, 250, 251)',
  text: 'rgb(31, 41, 55)',
  gradient: 'from-blue-600 via-emerald-500 to-amber-500',
  cultural: {
    fontFamily: 'sans-serif',
    patterns: ['modern', 'international'],
    symbols: ['🌍', '🎯', '⭐']
  }
};

// Cultural design preferences by region
export const regionalPreferences = {
  'Europe': {
    layout: 'formal',
    spacing: 'comfortable',
    typography: 'traditional',
    colorIntensity: 'moderate'
  },
  'North America': {
    layout: 'casual',
    spacing: 'generous',
    typography: 'modern',
    colorIntensity: 'bold'
  },
  'Oceania': {
    layout: 'relaxed',
    spacing: 'open',
    typography: 'friendly',
    colorIntensity: 'vibrant'
  },
  'Asia': {
    layout: 'structured',
    spacing: 'precise',
    typography: 'elegant',
    colorIntensity: 'subtle'
  }
};

// Helper function to get theme for a country
export function getCountryTheme(countryCode) {
  return countryThemes[countryCode] || defaultTheme;
}

// Helper function to generate CSS custom properties
export function generateThemeCSS(theme) {
  return `
    --color-primary: ${theme.primary};
    --color-secondary: ${theme.secondary};
    --color-accent: ${theme.accent};
    --color-background: ${theme.background};
    --color-text: ${theme.text};
    --gradient-country: ${theme.gradient};
    --font-family-country: ${theme.cultural.fontFamily};
  `;
}

// Helper function to get Tailwind classes for theme
export function getThemeClasses(theme) {
  return {
    primary: `text-[${theme.primary}]`,
    secondary: `text-[${theme.secondary}]`,
    accent: `text-[${theme.accent}]`,
    background: `bg-[${theme.background}]`,
    gradient: `bg-gradient-to-r ${theme.gradient}`,
    font: theme.cultural.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
  };
}