import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Production Website Audit
 * Optimized for comprehensive testing of live production site
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/production-audit.spec.ts',

  // Output directory for test artifacts (separate from HTML report)
  outputDir: 'test-results/production-audit-artifacts',

  // Timeout configuration
  timeout: 90000, // 90 seconds per test
  expect: {
    timeout: 15000
  },

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,

  // Reporting
  reporter: [
    ['html', {
      outputFolder: 'test-results/production-audit-html-report',
      open: 'never'
    }],
    ['json', {
      outputFile: 'test-results/production-audit-results.json'
    }],
    ['list'],
    ['junit', {
      outputFile: 'test-results/production-audit-junit.xml'
    }]
  ],

  // Global configuration
  use: {
    // Base URL - can be overridden with PRODUCTION_URL env var
    baseURL: process.env.PRODUCTION_URL || 'https://bestcasinoportal.com',

    // Tracing and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Network
    ignoreHTTPSErrors: false, // Strict HTTPS validation

    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,

    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BestCasinoPortal-Audit/1.0'
  },

  // Test projects for different browsers and devices
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13']
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro']
      },
    }
  ],

  // Web server configuration (if testing locally)
  webServer: process.env.TEST_LOCAL ? {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  } : undefined,
});

