import { defineConfig, devices } from '@playwright/test';

/**
 * Advanced Playwright Configuration for Casino Portal
 * Features: 20 workers, smart error handling, comprehensive reporting
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* OPTIMIZED parallel workers for Docker - 6 workers */
  workers: process.env.CI ? 4 : 6,
  /* Increased timeout for Docker warmup - 45s per test */
  timeout: 45000,
  /* Global timeout - 15 minutes total */
  globalTimeout: 900000,
  /* Fast assertion timeout - 10s */
  expect: { timeout: 10000 },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* NO RETRIES for speed - fail fast */
  retries: 0,
  /* MAX FAILURES - Stop after 5 failures */
  maxFailures: 5,
  /* FAST reporter configuration */
  reporter: [
    ['list'], // Simple console output
    ['json', { outputFile: 'test-results/smart-audit.json' }],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* NO trace for speed */
    trace: 'off',
    /* Take screenshot on failure only */
    screenshot: 'only-on-failure',
    /* NO video for speed */
    video: 'off',
    /* FAST timeouts - BALANCED for Docker */
    actionTimeout: 10000,
    navigationTimeout: 30000, // Increased for Docker container warmup
    /* Enhanced user agent for testing */
    userAgent: 'CasinoPortal-TestBot/1.0 Playwright'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* SPEED OPTIMIZATIONS */
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
        }
      },
    },

    /* Disabled for speed - uncomment if needed
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});