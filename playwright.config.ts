import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure test app and port based on environment variable
const testApp = process.env.TEST_APP || 'simple';
const testPort = testApp.includes('tanstack') ? '3000' : '5173';
const baseURL = `http://localhost:${testPort}`;

/**
 * Playwright Configuration for DevCaddy E2E Tests
 *
 * Uses global setup/teardown to manage ephemeral Supabase test branches.
 * Each test run gets an isolated database with migrations applied.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], // Show test results in terminal
    ['html', { open: 'never' }] // Generate HTML report but don't auto-open
  ],

  /* Global setup and teardown */
  // TODO: Enable when Supabase is linked (run: npx supabase link)
  // globalSetup: resolve(__dirname, './tests/setup/global-setup.ts'),
  // globalTeardown: resolve(__dirname, './tests/setup/global-teardown.ts'),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test in Firefox and Safari
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npm run dev -w examples/${testApp}`,
    url: baseURL,
    // Set to false to always start fresh server and shut down after tests
    // Set to true to reuse existing server (faster for local development)
    reuseExistingServer: false,
    timeout: 120 * 1000, // 2 minutes
  },
});
