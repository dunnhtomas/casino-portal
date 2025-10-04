/**
 * Application Constants
 * Single Responsibility: Define application-wide constants and configuration
 */

export const APPLICATION_CONSTANTS = {
  /**
   * Rating System Constants
   */
  RATING_WEIGHTS: {
    SECURITY: 0.25,
    PAYOUT: 0.20,
    BONUS_VALUE: 0.15,
    GAMES: 0.15,
    MOBILE: 0.10,
    SUPPORT: 0.10,
    REPUTATION: 0.05,
  } as const,

  RATING_SCALE: {
    MIN: 0,
    MAX: 10,
    EXCELLENT_THRESHOLD: 8.5,
    GOOD_THRESHOLD: 7.0,
    AVERAGE_THRESHOLD: 5.0,
  } as const,

  /**
   * Content Limits
   */
  CONTENT_LIMITS: {
    DESCRIPTION_MAX_LENGTH: 160,
    TITLE_MAX_LENGTH: 60,
    EXCERPT_MAX_LENGTH: 120,
    KEYWORDS_MAX_COUNT: 10,
  } as const,

  /**
   * Display Configuration
   */
  DISPLAY_CONFIG: {
    TOP_CASINOS_LIMIT: 3,
    COMPARISON_TABLE_LIMIT: 8,
    RECENT_REVIEWS_LIMIT: 5,
    FEATURED_CASINOS_LIMIT: 10,
  } as const,

  /**
   * URL Patterns
   */
  URL_PATTERNS: {
    CASINO_REVIEW: '/reviews/{slug}',
    REGION_PAGE: '/regions/{slug}',
    CATEGORY_PAGE: '/{category}',
    LEGAL_PAGE: '/legal/{page}',
    GUIDE_PAGE: '/guides/{slug}',
  } as const,

  /**
   * Cache Configuration
   */
  CACHE_CONFIG: {
    DEFAULT_TTL: 3600, // 1 hour
    CASINO_DATA_TTL: 7200, // 2 hours
    SEO_DATA_TTL: 1800, // 30 minutes
    NAVIGATION_TTL: 86400, // 24 hours
  } as const,

  /**
   * Validation Rules
   */
  VALIDATION_RULES: {
    CASINO_SLUG_PATTERN: /^[a-z0-9-]+$/,
    RATING_RANGE: { min: 0, max: 10 },
    BONUS_AMOUNT_PATTERN: /^\$?\d+(\.\d{2})?$/,
    WAGERING_PATTERN: /^\d+x?$/,
  } as const,

  /**
   * Error Messages
   */
  ERROR_MESSAGES: {
    CASINO_NOT_FOUND: 'Casino not found',
    INVALID_RATING: 'Rating must be between 0 and 10',
    INVALID_SLUG: 'Invalid slug format',
    MISSING_REQUIRED_FIELD: 'Required field is missing',
    DATA_FETCH_ERROR: 'Failed to fetch data',
  } as const,

  /**
   * Success Messages
   */
  SUCCESS_MESSAGES: {
    DATA_LOADED: 'Data loaded successfully',
    RATING_CALCULATED: 'Rating calculated successfully',
    PAGE_GENERATED: 'Page generated successfully',
  } as const,

  /**
   * Regional Configuration
   */
  REGIONS: {
    CANADA: {
      id: 'canada',
      name: 'Canada',
      provinces: ['alberta', 'british-columbia', 'ontario'],
    },
    UK: {
      id: 'uk',
      name: 'United Kingdom',
      regions: ['england', 'scotland', 'wales', 'northern-ireland'],
    },
    SUPPORTED: [
      { name: 'Ontario', slug: 'ontario', code: 'ON' },
      { name: 'Alberta', slug: 'alberta', code: 'AB' },
      { name: 'British Columbia', slug: 'british-columbia', code: 'BC' },
    ],
  } as const,

  /**
   * License Types
   */
  LICENSE_TYPES: {
    MGA: 'Malta Gaming Authority',
    UKGC: 'UK Gambling Commission',
    CURACAO: 'Curacao eGaming',
    GIBRALTAR: 'Gibraltar Gambling Commission',
    KAHNAWAKE: 'Kahnawake Gaming Commission',
  } as const,

  /**
   * SEO Configuration
   */
  SEO: {
    BASE_URL: 'https://bestcasinoportal.com',
    SITE_NAME: 'Best Casino Portal',
    HOMEPAGE_TITLE: 'Best Online Casinos 2024 - Expert Reviews & Ratings',
    HOMEPAGE_DESCRIPTION: 'Compare the best online casinos with expert reviews, transparent ratings, and verified payouts. Find your perfect casino with fast withdrawals and fair bonuses.',
    HOMEPAGE_KEYWORDS: [
      'best online casinos 2024',
      'online casino reviews',
      'casino bonuses',
      'fast payout casinos',
      'trusted casino sites',
      'live dealer casinos',
    ],
  } as const,
} as const;