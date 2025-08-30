import { test, expect } from '@playwright/test';

test.describe('Basic Site Functionality', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('https://stepperslife.com');
    
    // Check for title or main heading
    const title = await page.title();
    expect(title).toContain('SteppersLife');
    
    console.log('✅ Homepage loaded:', title);
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('https://stepperslife.com/auth/signin');
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Login page loaded');
  });

  test('Quick signin page works', async ({ page }) => {
    await page.goto('https://stepperslife.com/quick-signin');
    
    // Check for quick signin buttons
    const adminButton = page.locator('button:has-text("Sign in as Admin")');
    await expect(adminButton).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Quick signin page loaded');
  });

  test('Event creation page requires auth', async ({ page }) => {
    await page.goto('https://stepperslife.com/seller/new-event');
    
    // Should redirect to login
    await page.waitForURL('**/auth/signin**', { timeout: 10000 });
    
    console.log('✅ Auth redirect working');
  });
});