import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry failed tests
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  timeout: 60000, // 60 seconds per test
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // 15 seconds for actions
    navigationTimeout: 30000, // 30 seconds for navigation
    // Better handling for slow networks
    ignoreHTTPSErrors: true,
    // Viewport for consistent testing
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});