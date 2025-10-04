/**
 * Brandfetch API Configuration
 */

export const BRANDFETCH_CONFIG = {
  // Production Brandfetch client ID
  CLIENT_ID: '1idIddY-Tpnlw76kxJR',
  BASE_URL: 'https://cdn.brandfetch.io',
  
  // Logo types available
  LOGO_TYPES: {
    ICON: 'icon',      // Social profile icon
    LOGO: 'logo',      // Horizontal logo for large surfaces  
    SYMBOL: 'symbol'   // Universal brand mark
  },
  
  // Theme options
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  
  // Fallback options
  FALLBACKS: {
    BRANDFETCH: 'brandfetch',    // Brandfetch logo (default)
    TRANSPARENT: 'transparent',   // See-through placeholder
    LETTERMARK: 'lettermark',    // Square icon with first letter
    NOT_FOUND: '404'             // HTTP 404 and transparent placeholder
  }
} as const;
