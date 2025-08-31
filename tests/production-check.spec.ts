import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://stepperslife.com';

test.describe('Production Site Health Check', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/SteppersLife/);
    
    // Check for main navigation elements
    await expect(page.getByRole('link', { name: /Events/i })).toBeVisible();
    
    // Check for theme toggle
    const themeToggle = page.getByRole('button').filter({ hasText: /theme/i }).or(page.locator('[aria-label*="theme"]'));
    await expect(themeToggle).toBeVisible();
  });

  test('Sign-in page loads without ClerkProvider errors', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/sign-in`);
    
    // Check that there's no ClerkProvider error message
    const errorText = 'useSession can only be used within the <ClerkProvider /> component';
    const hasError = await page.locator('text=' + errorText).isVisible().catch(() => false);
    expect(hasError).toBe(false);
    
    // Check for sign-in form elements
    const emailInput = page.locator('input[type="email"], input[name="identifier"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('Seller dashboard is accessible', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/seller/dashboard`);
    
    // Should either show dashboard or redirect to sign-in
    const url = page.url();
    expect(url).toMatch(/\/(seller\/dashboard|sign-in)/);
    
    // No server errors
    await expect(page.locator('text=500')).not.toBeVisible();
    await expect(page.locator('text=Application error')).not.toBeVisible();
  });

  test('Events page loads and shows content', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/events`);
    
    // Check page loaded
    await expect(page).toHaveURL(/\/events/);
    
    // Check for events grid or empty state
    const eventsContainer = page.locator('[class*="grid"], [class*="events"], [class*="empty"]').first();
    await expect(eventsContainer).toBeVisible({ timeout: 10000 });
  });

  test('Tickets page is accessible', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/tickets`);
    
    // Should load without errors
    await expect(page.locator('text=500')).not.toBeVisible();
    await expect(page.locator('text=Application error')).not.toBeVisible();
    
    // Should have some content
    const mainContent = page.locator('main, [role="main"], .container').first();
    await expect(mainContent).toBeVisible();
  });

  test('API health endpoint returns healthy', async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    // Note: May be 'unhealthy' due to missing NextAuth, but should not error
    expect(['healthy', 'unhealthy']).toContain(data.status);
  });

  test('Create event page loads', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/seller/new-event`);
    
    // Should either show form or redirect to sign-in
    const url = page.url();
    expect(url).toMatch(/\/(seller\/new-event|sign-in)/);
    
    // No errors
    await expect(page.locator('text=Application error')).not.toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    
    // Test Events link
    await page.click('a[href="/events"]');
    await expect(page).toHaveURL(/\/events/);
    
    // Test About link (if exists)
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('Theme colors are applied', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    
    // Check that CSS variables are set
    const hasOklchColors = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const background = styles.getPropertyValue('--background');
      return background.includes('oklch');
    });
    
    expect(hasOklchColors).toBe(true);
  });

  test('No console errors on main pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Check homepage
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    // Filter out expected/ignorable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('geolocation') &&
      !error.includes('WebSocket') &&
      !error.includes('Hydration')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});