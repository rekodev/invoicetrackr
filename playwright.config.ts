import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3100';
const authFile = 'e2e/.auth/user.json';
const webServerCommand = process.env.CI
  ? 'pnpm exec concurrently --kill-others-on-fail --names server,client "pnpm --filter @invoicetrackr/server start" "pnpm --filter @invoicetrackr/client start --port 3100"'
  : 'pnpm exec concurrently --kill-others-on-fail --names server,client "pnpm --filter @invoicetrackr/server dev" "pnpm --filter @invoicetrackr/client dev --port 3100"';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
      ]
    : [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: webServerCommand,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write']
      }
    },
    {
      name: 'chromium',
      testIgnore: /setup\/.*\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
        permissions: ['clipboard-read', 'clipboard-write']
      }
    }
  ]
});
