import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'qa-report' }]
  ],
  timeout: 60000,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
  },

  projects: [
    {
      name: 'qa-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Don't start a server - we assume it's running on port 3001
  webServer: undefined,
});