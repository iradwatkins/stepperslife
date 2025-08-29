import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

export const DEFAULT_TEST_USER: TestUser = {
  email: 'test@stepperslife.com',
  password: 'Test123!',
};

/**
 * Robust authentication helper with retry logic and better error handling
 */
export async function authenticateUser(
  page: Page, 
  user: TestUser = DEFAULT_TEST_USER,
  options: {
    retries?: number;
    baseUrl?: string;
  } = {}
): Promise<boolean> {
  const { retries = 3, baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001' } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Navigate to sign in page
      await page.goto(`${baseUrl}/auth/signin`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      
      // Check if already logged in by looking for dashboard or seller elements
      const loggedInSelectors = ['text=Dashboard', 'text=My Events', 'a[href="/seller"]'];
      for (const selector of loggedInSelectors) {
        const isVisible = await page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          console.log('✅ Already logged in');
          return true;
        }
      }
      
      // Email/password form is now always visible - no need to expand
      
      // Fill in credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      
      // Submit form - try multiple selector strategies
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Sign in")',
        'button:has-text("Log in")',
        'form button[type="submit"]',
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 1000 })) {
            await button.click();
            submitted = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!submitted) {
        throw new Error('Could not find submit button');
      }
      
      // Wait for navigation after login
      await Promise.race([
        page.waitForURL(/\/dashboard/, { timeout: 15000 }),
        page.waitForURL(/\/seller/, { timeout: 15000 }),
        page.waitForURL(/\/events/, { timeout: 15000 }),
        page.waitForSelector('text=Dashboard', { timeout: 15000 }),
        page.waitForSelector('text=My Events', { timeout: 15000 }),
      ]);
      
      // Verify authentication succeeded
      const currentUrl = page.url();
      if (currentUrl.includes('/auth/signin') || currentUrl.includes('/auth/error')) {
        throw new Error(`Authentication failed - still on auth page: ${currentUrl}`);
      }
      
      console.log(`✅ Successfully authenticated on attempt ${attempt}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Authentication attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(`Authentication failed after ${retries} attempts: ${error}`);
      }
      
      // Wait before retry
      await page.waitForTimeout(2000);
    }
  }
  
  return false;
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const authenticatedSelectors = [
    'text=Dashboard',
    'text=My Events',
    'a[href="/seller"]',
    'button:has-text("Sign Out")',
    'button:has-text("Logout")',
  ];
  
  for (const selector of authenticatedSelectors) {
    const isVisible = await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false);
    if (isVisible) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page): Promise<void> {
  const signOutSelectors = [
    'button:has-text("Sign Out")',
    'button:has-text("Logout")',
    'a:has-text("Sign Out")',
    'a:has-text("Logout")',
  ];
  
  for (const selector of signOutSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        await element.click();
        await page.waitForURL(/\/auth\/sign/, { timeout: 10000 });
        return;
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  // If no sign out button found, navigate directly
  await page.goto('/auth/signout');
}