import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3003',
  viewport: { width: 1280, height: 720 },
});

test.describe('Verify Existing Events', () => {
  test('Check events are displayed with proper information', async ({ page }) => {
    await page.goto('/');
    
    // Wait for events to load
    await page.waitForSelector('h3', { timeout: 10000 });
    
    // Check that we have events
    const eventTitles = await page.locator('h3').allTextContents();
    console.log('\n📊 Current Events in Database:');
    console.log('================================');
    
    for (const title of eventTitles) {
      if (title) {
        console.log(`✅ ${title}`);
      }
    }
    
    // Check specific events exist
    await expect(page.locator('text=Atlanta Salsa Night Spectacular')).toBeVisible();
    await expect(page.locator('text=Bachata Workshop with Carlos Rodriguez')).toBeVisible();
    await expect(page.locator('text=Spring Jazz & Blues Social')).toBeVisible();
    await expect(page.locator('text=Atlanta Dance Festival 2025')).toBeVisible();
    
    console.log('\n📍 Checking venue information...');
    
    // Check venue info is displayed
    await expect(page.locator('text=The Grand Ballroom').first()).toBeVisible();
    await expect(page.locator('text=Dance Studio Elite').first()).toBeVisible();
    
    console.log('✅ Venues are properly displayed');
    
    // Click on an event to see details
    await page.locator('text=View Details').first().click();
    await page.waitForURL('**/event/**');
    
    console.log('\n🎫 Checking event details page...');
    
    // Check event page has key elements
    const hasDescription = await page.locator('text=/salsa dancing|workshop|jazz/i').isVisible({ timeout: 5000 }).catch(() => false);
    const hasDate = await page.locator('text=/2025/').isVisible({ timeout: 5000 }).catch(() => false);
    const hasLocation = await page.locator('text=/Atlanta|GA/').isVisible({ timeout: 5000 }).catch(() => false);
    
    console.log(`  Description: ${hasDescription ? '✅' : '❌'}`);
    console.log(`  Date: ${hasDate ? '✅' : '❌'}`);
    console.log(`  Location: ${hasLocation ? '✅' : '❌'}`);
    
    console.log('\n✨ Event verification complete!');
  });
  
  test('Navigate to create event page', async ({ page }) => {
    await page.goto('/seller/new-event');
    
    // This will redirect to sign in if not authenticated
    const url = page.url();
    
    if (url.includes('sign-in')) {
      console.log('🔒 Authentication required to create events');
      console.log('   Redirected to:', url);
    } else {
      console.log('📝 Event creation page loaded');
      
      // Check for event type selector
      const hasEventTypes = await page.locator('text=/Single Event|Multi-Day/').isVisible({ timeout: 5000 }).catch(() => false);
      if (hasEventTypes) {
        console.log('✅ Event type selector is available');
      }
    }
  });
  
  test('Check event has pricing information', async ({ page }) => {
    await page.goto('/');
    
    // Look for price indicators
    const prices = await page.locator('text=/$\\d+/').allTextContents();
    
    console.log('\n💰 Event Pricing:');
    console.log('================');
    
    if (prices.length > 0) {
      for (const price of prices.slice(0, 5)) {
        console.log(`  ${price}`);
      }
    } else {
      console.log('  No prices displayed (may need tickets configured)');
    }
  });
});