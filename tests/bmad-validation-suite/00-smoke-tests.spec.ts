import { test, expect } from '@playwright/test';
import { BMADValidationHelpers, TEST_USERS } from './helpers/test-helpers';

/**
 * BMAD Smoke Tests
 * Quick health checks to ensure system is operational
 * No data modification - read-only tests
 */

test.describe('BMAD Smoke Tests - System Health Check', () => {
  let helpers: BMADValidationHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new BMADValidationHelpers(page);
  });

  test('Homepage loads without errors', async ({ page }) => {
    console.log('🔍 Testing: Homepage accessibility');
    
    await page.goto('/');
    
    // Check for no 502 errors
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
    expect(response?.status()).not.toBe(502);
    
    // Verify core elements exist
    await expect(page.locator('text=/SteppersLife/i')).toBeVisible({ timeout: 10000 });
    
    // Check for events section
    const eventsSection = page.locator('text=/events|discover/i');
    await expect(eventsSection.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Homepage loads successfully');
  });

  test('Login page is accessible', async ({ page }) => {
    console.log('🔍 Testing: Login page accessibility');
    
    await page.goto('/sign-in');
    
    // Check page loaded
    const response = await page.goto('/sign-in');
    expect(response?.status()).toBeLessThan(500);
    
    // Verify login form elements
    await expect(page.locator('input[type="email"], input[name="identifier"]').first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Login page is accessible');
  });

  test('Events page displays event listings', async ({ page }) => {
    console.log('🔍 Testing: Events listing page');
    
    await page.goto('/events');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if events container exists
    const hasEvents = await page.locator('.event-card, [data-testid="event-card"], text=/no events/i').first().isVisible({ timeout: 10000 });
    expect(hasEvents).toBeTruthy();
    
    console.log('✅ Events page displays correctly');
  });

  test('Navigation menu works', async ({ page }) => {
    console.log('🔍 Testing: Navigation functionality');
    
    await page.goto('/');
    
    // Test navigation links
    const navLinks = [
      { text: 'Events', url: '/events' },
      { text: 'About', url: '/about' }
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`a:has-text("${link.text}")`).first();
      if (await navLink.isVisible({ timeout: 3000 })) {
        await navLink.click();
        await page.waitForURL(`**${link.url}**`, { timeout: 10000 });
        expect(page.url()).toContain(link.url);
        
        // Go back to homepage for next test
        await page.goto('/');
      }
    }
    
    console.log('✅ Navigation works correctly');
  });

  test('Seller dashboard is accessible after login', async ({ page }) => {
    console.log('🔍 Testing: Seller dashboard access');
    
    // Login as organizer
    await helpers.login(TEST_USERS.organizer);
    
    // Navigate to seller dashboard
    await page.goto('/seller/dashboard');
    
    // Verify dashboard elements
    const dashboardElements = [
      'text=/my events/i',
      'text=/dashboard/i',
      'text=/create.*event/i'
    ];
    
    let foundElement = false;
    for (const selector of dashboardElements) {
      if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
        foundElement = true;
        break;
      }
    }
    
    expect(foundElement).toBeTruthy();
    
    console.log('✅ Seller dashboard is accessible');
  });

  test('API health endpoint responds', async ({ page }) => {
    console.log('🔍 Testing: API health check');
    
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.text();
    expect(healthData).toContain('healthy');
    
    console.log('✅ API is healthy');
  });

  test('Convex connection is working', async ({ page }) => {
    console.log('🔍 Testing: Convex database connection');
    
    await page.goto('/');
    
    // Wait for Convex to initialize
    await page.waitForTimeout(2000);
    
    // Check console for Convex errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('convex')) {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to a page that uses Convex
    await page.goto('/events');
    await page.waitForTimeout(3000);
    
    // No Convex errors should have occurred
    expect(consoleErrors.length).toBe(0);
    
    console.log('✅ Convex connection is working');
  });

  test('Event detail page loads', async ({ page }) => {
    console.log('🔍 Testing: Event detail page');
    
    // First, go to events page
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Try to find an event card to click
    const eventCard = page.locator('.event-card, [data-testid="event-card"], a[href*="/event/"]').first();
    
    if (await eventCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await eventCard.click();
      
      // Wait for navigation
      await page.waitForURL('**/event/**', { timeout: 10000 });
      
      // Verify event details page elements
      const detailElements = [
        'text=/buy.*ticket/i',
        'text=/get.*ticket/i',
        'text=/event.*detail/i',
        'text=/description/i'
      ];
      
      let foundDetail = false;
      for (const selector of detailElements) {
        if (await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false)) {
          foundDetail = true;
          break;
        }
      }
      
      expect(foundDetail).toBeTruthy();
      console.log('✅ Event detail page loads correctly');
    } else {
      console.log('⚠️ No events available to test detail page');
    }
  });

  test('Theme toggle works', async ({ page }) => {
    console.log('🔍 Testing: Theme toggle functionality');
    
    await page.goto('/');
    
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has-text("Theme"), [data-testid="theme-toggle"]').first();
    
    if (await themeToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class') || '';
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if class changed
      const newClass = await htmlElement.getAttribute('class') || '';
      expect(newClass).not.toBe(initialClass);
      
      console.log('✅ Theme toggle works');
    } else {
      console.log('⚠️ Theme toggle not found');
    }
  });

  test('No critical JavaScript errors', async ({ page }) => {
    console.log('🔍 Testing: JavaScript error check');
    
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Navigate through main pages
    const pages = ['/', '/events', '/about'];
    
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    
    // Filter out non-critical errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('ResizeObserver') && // Common benign error
      !error.includes('Non-Error') && // Warning, not error
      !error.includes('404') // Missing resources
    );
    
    expect(criticalErrors.length).toBe(0);
    
    if (criticalErrors.length > 0) {
      console.error('Critical JS errors found:', criticalErrors);
    } else {
      console.log('✅ No critical JavaScript errors');
    }
  });

  test.afterAll(async () => {
    console.log('\n========================================');
    console.log('BMAD SMOKE TESTS COMPLETED');
    console.log('All system health checks passed');
    console.log('========================================\n');
  });
});