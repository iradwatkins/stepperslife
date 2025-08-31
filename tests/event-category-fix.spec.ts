import { test, expect } from '@playwright/test';

test.describe('Event Category Creation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Sign in if needed
    const signInButton = page.locator('text=Sign In').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForURL('**/sign-in*');
      
      // Use test credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for redirect
      await page.waitForURL('**/seller/new-event', { timeout: 10000 });
    }
  });

  test('should create event with Other/Party category successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/seller/new-event');
    
    // Select single event type
    await page.click('text=Single Day Event');
    
    // Fill basic info
    await page.fill('input[placeholder="Summer Dance Festival"]', 'Test Party Event');
    await page.fill('textarea[placeholder*="Join us for an amazing evening"]', 'Test party event description');
    
    // Select Other/Party category
    await page.click('label:has-text("Other/Party")');
    
    // Fill location (if not save the date)
    const saveTheDateCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Save the Date' });
    const isSaveTheDate = await saveTheDateCheckbox.isChecked();
    
    if (!isSaveTheDate) {
      await page.fill('input[placeholder="The Grand Ballroom"]', 'Test Venue');
      await page.fill('input[placeholder="Start typing to search for address..."]', '123 Test Street');
      await page.fill('input[placeholder="Miami"]', 'Miami');
      await page.fill('input[placeholder="FL"]', 'FL');
      await page.fill('input[placeholder="33139"]', '33139');
    }
    
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', dateStr);
    await page.fill('input[type="time"]', '19:00');
    
    // Click Next
    await page.click('button:has-text("Next: Ticketing")');
    
    // Select ticketing option
    await page.click('text=No - Just Posting an Event');
    
    // Set door price
    await page.fill('input[placeholder="Door price"]', '25');
    
    // Click Next to Review
    await page.click('button:has-text("Next: Review")');
    
    // Publish event
    await page.click('button:has-text("Publish Event")');
    
    // Wait for success message or redirect
    await expect(page).toHaveURL(/\/event\/.*/, { timeout: 30000 });
    
    // Verify event was created
    const eventTitle = page.locator('h1:has-text("Test Party Event")');
    await expect(eventTitle).toBeVisible({ timeout: 10000 });
  });

  test('should create event with multiple categories including Other', async ({ page }) => {
    await page.goto('http://localhost:3000/seller/new-event');
    
    // Select single event type
    await page.click('text=Single Day Event');
    
    // Fill basic info
    await page.fill('input[placeholder="Summer Dance Festival"]', 'Multi-Category Event');
    await page.fill('textarea[placeholder*="Join us for an amazing evening"]', 'Event with multiple categories');
    
    // Select multiple categories
    await page.click('label:has-text("Workshop")');
    await page.click('label:has-text("Social Dance")');
    await page.click('label:has-text("Other/Party")');
    
    // Fill location
    await page.fill('input[placeholder="The Grand Ballroom"]', 'Multi Venue');
    await page.fill('input[placeholder="Start typing to search for address..."]', '456 Dance Street');
    await page.fill('input[placeholder="Miami"]', 'Miami');
    await page.fill('input[placeholder="FL"]', 'FL');
    await page.fill('input[placeholder="33139"]', '33139');
    
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', dateStr);
    await page.fill('input[type="time"]', '20:00');
    
    // Click Next
    await page.click('button:has-text("Next: Ticketing")');
    
    // Select ticketing option
    await page.click('text=Yes - Selling Tickets Online');
    
    // Click Next
    await page.click('button:has-text("Next: Capacity")');
    
    // Set capacity
    await page.fill('input[placeholder="Total event capacity"]', '100');
    
    // Add a ticket type
    await page.click('button:has-text("Add Ticket Type")');
    await page.fill('input[placeholder="General Admission"]', 'General');
    await page.fill('input[placeholder="0"]', '50');
    await page.fill('input[placeholder="100"]', '100');
    
    // Click Next
    await page.click('button:has-text("Next: Tables")');
    
    // Skip tables
    await page.click('button:has-text("Skip Tables")');
    
    // Review and publish
    await page.click('button:has-text("Publish Event")');
    
    // Wait for success
    await expect(page).toHaveURL(/\/event\/.*/, { timeout: 30000 });
    
    // Verify event was created
    const eventTitle = page.locator('h1:has-text("Multi-Category Event")');
    await expect(eventTitle).toBeVisible({ timeout: 10000 });
  });

  test('should handle all valid categories without party', async ({ page }) => {
    const validCategories = [
      'Workshop',
      'Sets/Performance',
      'In The Park',
      'Trip/Travel',
      'Cruise',
      'Holiday Event',
      'Competition',
      'Class/Lesson',
      'Social Dance',
      'Lounge/Bar',
      'Other/Party'
    ];
    
    await page.goto('http://localhost:3000/seller/new-event');
    
    // Select single event type
    await page.click('text=Single Day Event');
    
    // Verify all categories are present and none say just "Party"
    for (const category of validCategories) {
      const categoryLabel = page.locator(`label:has-text("${category}")`);
      await expect(categoryLabel).toBeVisible();
    }
    
    // Verify "Party" without "Other/" is not present
    const partyOnlyLabel = page.locator('label').filter({ hasText: /^Party$/ });
    await expect(partyOnlyLabel).toHaveCount(0);
  });
});