import { defineConfig, devices } from '@playwright/test';

/**
 * BMAD Validation Suite Configuration
 * Non-destructive testing configuration for SteppersLife platform
 */

export default defineConfig({
  testDir: './.',
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for consistent test data
  
  // Reporting
  reporter: [
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Shared settings
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Project configuration
  projects: [
    {
      name: 'bmad-validation',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        
        // Custom context options
        contextOptions: {
          ignoreHTTPSErrors: true,
          permissions: ['camera'], // For QR scanner tests
        }
      },
      
      // Test files in order
      testMatch: [
        '00-smoke-tests.spec.ts',
        '01-event-creation-flow.spec.ts',
        '02-multi-day-events.spec.ts',
        '03-reseller-program.spec.ts',
        '04-purchase-validation.spec.ts',
        '05-organizer-dashboard.spec.ts'
      ]
    },
  ],

  // Local dev server (optional)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});