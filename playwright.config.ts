import { defineConfig, devices } from '@playwright/test';

/**
 * Smart Playwright Configuration for 2000+ Page Testing
 * Features: 16 workers, max 5 failures fail-fast, comprehensive Astro+Tailwind verification
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* 16 workers for maximum parallel execution as requested */
  workers: 16,
  /* 60 second timeout per test for thorough verification */
  timeout: 60000,
  /* Global timeout - 30 minutes total */
  globalTimeout: 30 * 60 * 1000,
  /* Fast assertion timeout - 15s */
  expect: { timeout: 15000 },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry only on CI */
  retries: process.env.CI ? 2 : 0,
  /* MAX FAILURES - Stop after 5 failures as requested */
  maxFailures: 5,
  /* Comprehensive reporter configuration */
  reporter: [
    ['list'], // Real-time console output
    ['json', { outputFile: 'test-results/comprehensive-audit.json' }],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL for live website testing */
    baseURL: 'https://bestcasinopo.vps.webdock.cloud',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording for failures */
    video: 'retain-on-failure',
    /* Balanced timeouts for live website testing */
    actionTimeout: 30000,
    navigationTimeout: 60000,
    /* Enhanced user agent for testing */
    userAgent: 'CasinoPortal-SmartBot/1.0 Playwright-16Workers'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Performance optimizations for live testing */
        launchOptions: {
          args: [
            '--disable-dev-shm-usage', 
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
    },
  ],
});