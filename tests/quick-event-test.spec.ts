import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3003',
  viewport: { width: 1280, height: 720 },
});

test('Quick test - verify site loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SteppersLife/i);
  console.log('✅ Site is running on localhost:3003');
});

test('Test authentication flow', async ({ page }) => {
  await page.goto('/');
  
  // Look for sign in button
  const signInBtn = page.locator('button:has-text("Sign In"), a:has-text("Sign In")');
  await expect(signInBtn.first()).toBeVisible({ timeout: 5000 });
  console.log('✅ Sign in button found');
  
  // Click sign in
  await signInBtn.first().click();
  await page.waitForTimeout(2000);
  
  // Check if Clerk modal appears
  const authModal = page.locator('[data-clerk-portal], .cl-rootBox');
  const isVisible = await authModal.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`✅ Auth modal visible: ${isVisible}`);
});