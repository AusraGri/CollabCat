import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../client/.env') })
const authFile = path.resolve(__dirname, 'e2e/utils/auth.json')
/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 30_000 : 10_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: process.env.CI ? 5_000 : 2_000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5174',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Only on CI systems run the tests headless */
    headless: !!process.env.CI,

    /* Set the test id to use a custom data attribute for your tests. */
    testIdAttribute: 'data-test',
  },

  /* Configure projects for major browsers */
  projects: [
    // ✅ Setup project - Logs in and saves auth.json
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/, // Only runs files matching "*.setup.ts"
    },

    // ✅ Chromium project - Uses saved session from auth.json
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile, // Load saved session
      },
      dependencies: ['setup'], // Waits for setup to complete first
    },
  ],

  // projects: [
  //   {
  //     name: 'chromium',
  //     use: {
  //       ...devices['Desktop Chrome'],
  //     },
  //   },

  //   /*
  //   {
  //     name: 'firefox',
  //     use: {
  //       ...devices['Desktop Firefox']
  //     }
  //   },
  //   {
  //     name: 'webkit',
  //     use: {
  //       ...devices['Desktop Safari']
  //     }
  //   },
  //   */
  // ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * Use the dev server by default for faster feedback loop.
     * Use the preview server on CI for more realistic testing.
    Playwright will re-use the local server if there is already a dev-server running.
     */
    command: process.env.CI ? 'npx vite preview --port 5174' : 'npx vite dev',
    port: 5174,
    reuseExistingServer: !process.env.CI,
  },
}

export default config
