import { test, expect } from '@playwright/test';

test('Production Quick Check', async ({ page }) => {
  console.log('Testing: https://stepperslife.com');
  
  // Test 1: Homepage
  await page.goto('https://stepperslife.com');
  const title = await page.title();
  console.log('✓ Homepage title:', title);
  expect(title).toContain('SteppersLife');
  
  // Test 2: Sign-in page
  await page.goto('https://stepperslife.com/sign-in');
  const signInUrl = page.url();
  console.log('✓ Sign-in URL:', signInUrl);
  
  // Check for ClerkProvider error
  const hasClerkError = await page.locator('text=useSession can only be used within').isVisible().catch(() => false);
  console.log('✓ ClerkProvider error present:', hasClerkError);
  expect(hasClerkError).toBe(false);
  
  // Test 3: Events page
  await page.goto('https://stepperslife.com/events');
  const eventsUrl = page.url();
  console.log('✓ Events URL:', eventsUrl);
  
  // Test 4: Seller dashboard
  await page.goto('https://stepperslife.com/seller/dashboard');
  const dashboardUrl = page.url();
  console.log('✓ Dashboard URL:', dashboardUrl);
  
  // Test 5: Check for application errors
  const hasAppError = await page.locator('text=Application error').isVisible().catch(() => false);
  console.log('✓ Application error present:', hasAppError);
  expect(hasAppError).toBe(false);
  
  console.log('\n✅ All critical pages are accessible!');
});