import { test, expect } from '@playwright/test';

test.describe('Clerk Authentication Fix', () => {
  test('Home page loads without Clerk errors', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3000');
    
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/SteppersLife/);
    
    // Verify no Clerk-related errors in console
    const clerkErrors = consoleErrors.filter(error => 
      error.includes('ClerkProvider') || 
      error.includes('useUser') ||
      error.includes('Clerk')
    );
    
    expect(clerkErrors).toHaveLength(0);
    
    // Verify the header is visible
    const header = page.locator('header, [role="banner"], div:has(> a[href="/"])')
    await expect(header).toBeVisible();
    
    // Verify mock user is present in development
    const userButton = page.locator('button:has-text("T")').first();
    await expect(userButton).toBeVisible();
  });
  
  test('Events page loads without errors', async ({ page }) => {
    await page.goto('http://localhost:3000/events');
    
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check for Clerk errors
    const clerkErrors = consoleErrors.filter(error => 
      error.includes('ClerkProvider') || 
      error.includes('useUser') ||
      error.includes('Clerk')
    );
    
    expect(clerkErrors).toHaveLength(0);
    
    // Verify page content loads
    await expect(page.locator('text=/Upcoming Events|All Events/i')).toBeVisible();
  });
  
  test('Test purchase page loads without errors', async ({ page }) => {
    await page.goto('http://localhost:3000/test-purchase');
    
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check for Clerk errors
    const clerkErrors = consoleErrors.filter(error => 
      error.includes('ClerkProvider') || 
      error.includes('useUser') ||
      error.includes('Clerk')
    );
    
    expect(clerkErrors).toHaveLength(0);
    
    // Verify purchase flow loads
    await expect(page.locator('text=/Test Purchase|Select Event/i').first()).toBeVisible();
  });
  
  test('Event card click navigates to event page', async ({ page }) => {
    await page.goto('http://localhost:3000/events');
    await page.waitForLoadState('networkidle');
    
    // Find the first event card
    const eventCard = page.locator('a[href^="/event/"]').first();
    const eventHref = await eventCard.getAttribute('href');
    
    if (eventHref) {
      // Click the event card
      await eventCard.click();
      
      // Wait for navigation
      await page.waitForURL(`**${eventHref}`);
      
      // Verify we're on the event page
      expect(page.url()).toContain('/event/');
      
      // Verify tickets are shown on event page
      await expect(page.locator('text=/Tickets|Purchase|Buy Now/i').first()).toBeVisible();
    } else {
      // If no events, that's okay for this test
      console.log('No events found to test navigation');
    }
  });
});