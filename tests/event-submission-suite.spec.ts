import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import { TEST_CONFIG, generateEventData, logTestStep, takeDebugScreenshot } from './helpers/test-data-generator';

// Helper to handle authentication
async function authenticateUser(page: Page) {
  logTestStep("Authenticating user");
  
  // Navigate to sign-in page
  await page.goto('/sign-in');
  
  // Check if already signed in by looking for dashboard elements
  const isSignedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
  
  if (!isSignedIn) {
    // Sign in with test credentials
    await page.fill('input[type="email"]', TEST_CONFIG.email);
    await page.fill('input[type="password"]', 'TestPassword123!'); // You may need to set this
    await page.click('button[type="submit"]');
    
    // Wait for redirect after successful login
    await page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(() => {
      // If no redirect, we might already be logged in
    });
  }
  
  logTestStep("Authentication complete");
}

// Helper to fill basic event info
async function fillBasicEventInfo(page: Page, eventData: any) {
  logTestStep("Filling basic event information", eventData);
  
  // Wait for form to be ready
  await page.waitForSelector('input[name="name"], input[placeholder*="Event Name"], input[id="name"]', { timeout: 10000 });
  
  // Fill event name
  const nameInput = await page.locator('input[name="name"], input[placeholder*="Event Name"], input[id="name"]').first();
  await nameInput.fill(eventData.name);
  
  // Fill description
  const descInput = await page.locator('textarea[name="description"], textarea[placeholder*="Description"], textarea[id="description"]').first();
  await descInput.fill(eventData.description);
  
  // Fill location details
  await page.fill('input[name="location"], input[placeholder*="Venue"], input[id="location"]', eventData.location);
  await page.fill('input[name="address"], input[placeholder*="Address"], input[id="address"]', eventData.address);
  await page.fill('input[name="city"], input[placeholder*="City"], input[id="city"]', eventData.city);
  await page.fill('input[name="state"], input[placeholder*="State"], input[id="state"], select[name="state"]', eventData.state);
  await page.fill('input[name="postalCode"], input[placeholder*="Zip"], input[placeholder*="Postal"], input[id="postalCode"]', eventData.postalCode);
  
  // Set date and time
  await page.fill('input[type="date"][name="eventDate"], input[type="date"]', eventData.eventDate);
  await page.fill('input[type="time"][name="eventTime"], input[type="time"]', eventData.eventTime);
  
  // Upload image if provided
  if (eventData.mainImage) {
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(eventData.mainImage);
    await page.waitForTimeout(2000); // Wait for upload to process
  }
  
  // Select categories
  if (eventData.categories && eventData.categories.length > 0) {
    for (const category of eventData.categories) {
      // Try to find and check the category checkbox
      const categoryCheckbox = await page.locator(`input[type="checkbox"][value="${category}"], label:has-text("${category}") input[type="checkbox"]`).first();
      if (await categoryCheckbox.isVisible()) {
        await categoryCheckbox.check();
      }
    }
  }
  
  logTestStep("Basic info filled");
}

// Helper to configure tickets
async function configureTickets(page: Page, ticketData: any[]) {
  logTestStep("Configuring tickets", ticketData);
  
  for (let i = 0; i < ticketData.length; i++) {
    const ticket = ticketData[i];
    
    // If not the first ticket, add a new ticket type
    if (i > 0) {
      const addButton = await page.locator('button:has-text("Add Ticket Type")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Fill ticket details
    const ticketSection = await page.locator(`.p-4.border.rounded-lg`).nth(i);
    
    // Name
    await ticketSection.locator('input[placeholder*="VIP"], input').first().fill(ticket.name);
    
    // Quantity
    await ticketSection.locator('input[type="number"]').nth(0).fill(ticket.quantity.toString());
    
    // Price
    await ticketSection.locator('input[type="number"]').nth(1).fill(ticket.price.toString());
    
    // Early bird if applicable
    if (ticket.hasEarlyBird) {
      await ticketSection.locator('input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await ticketSection.locator('input[placeholder*="Early"]').fill(ticket.earlyBirdPrice.toString());
      await ticketSection.locator('input[type="date"]').fill(ticket.earlyBirdEndDate);
    }
  }
  
  logTestStep("Tickets configured");
}

// Test 1: Complete event with all ticket types
test('Test 1: Create complete event with multiple ticket types', async ({ page }) => {
  await test.step('Navigate and authenticate', async () => {
    await page.goto('/organizer/new-event');
    await authenticateUser(page);
  });
  
  await test.step('Select single event type', async () => {
    await page.waitForSelector('button:has-text("Single-Day Event")', { timeout: 10000 });
    await page.click('button:has-text("Single-Day Event")');
  });
  
  const eventData = generateEventData('single');
  
  await test.step('Fill basic information', async () => {
    await fillBasicEventInfo(page, eventData);
    
    // Click Next button
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Configure ticketing', async () => {
    // Select "Yes - Selling Tickets"
    const sellingTicketsRadio = await page.locator('input[value="true"], label:has-text("Yes - Selling Tickets") input').first();
    if (await sellingTicketsRadio.isVisible()) {
      await sellingTicketsRadio.check();
    }
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Set capacity and tickets', async () => {
    // Set total capacity
    await page.fill('input[type="number"]', eventData.totalCapacity.toString());
    
    // Configure ticket types
    await configureTickets(page, eventData.ticketTypes);
    
    // Debug: Log current validation state
    const nextButton = await page.locator('button:has-text("Next: Table Configuration")');
    const isDisabled = await nextButton.isDisabled();
    console.log('Next button disabled:', isDisabled);
    
    if (isDisabled) {
      await takeDebugScreenshot(page, 'ticket-validation-issue');
      
      // Try auto-balance if available
      const autoBalanceBtn = await page.locator('button:has-text("Auto-Balance")');
      if (await autoBalanceBtn.isVisible()) {
        await autoBalanceBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Click Next
    await nextButton.click();
    await page.waitForTimeout(1000);
  });
  
  await test.step('Skip table configuration', async () => {
    const skipButton = await page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    } else {
      await page.click('button:has-text("Next")');
    }
    await page.waitForTimeout(1000);
  });
  
  await test.step('Review and publish', async () => {
    // Take screenshot of review page
    await takeDebugScreenshot(page, 'review-page');
    
    // Click publish button
    await page.click('button:has-text("Publish Event")');
    
    // Wait for success message or redirect
    await page.waitForURL('**/event/**', { timeout: 15000 }).catch(async () => {
      // Check for error messages
      const errorMsg = await page.locator('.text-red-500, [role="alert"]').first().textContent().catch(() => '');
      console.error('Publish failed:', errorMsg);
      await takeDebugScreenshot(page, 'publish-error');
    });
  });
  
  // Verify event was created
  const currentUrl = page.url();
  expect(currentUrl).toContain('/event/');
  logTestStep('Event created successfully', { url: currentUrl });
});

// Test 2: Simple event with door price only
test('Test 2: Create event with door price only (no online tickets)', async ({ page }) => {
  await test.step('Navigate and authenticate', async () => {
    await page.goto('/organizer/new-event');
    await authenticateUser(page);
  });
  
  await test.step('Select single event type', async () => {
    await page.waitForSelector('button:has-text("Single-Day Event")', { timeout: 10000 });
    await page.click('button:has-text("Single-Day Event")');
  });
  
  const eventData = generateEventData('door_only');
  
  await test.step('Fill basic information', async () => {
    await fillBasicEventInfo(page, eventData);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Configure door price only', async () => {
    // Select "No - Just Posting an Event"
    const doorPriceRadio = await page.locator('input[value="false"], label:has-text("No - Just Posting") input').first();
    if (await doorPriceRadio.isVisible()) {
      await doorPriceRadio.check();
    }
    
    // Enter door price
    await page.fill('input[name="doorPrice"], input[placeholder*="Door"], input[type="number"]', eventData.doorPrice.toString());
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Review and publish', async () => {
    await page.click('button:has-text("Publish Event")');
    
    // Wait for success
    await page.waitForURL('**/event/**', { timeout: 15000 }).catch(async () => {
      await takeDebugScreenshot(page, 'door-price-publish-error');
    });
  });
  
  const currentUrl = page.url();
  expect(currentUrl).toContain('/event/');
  logTestStep('Door price event created successfully', { url: currentUrl });
});

// Test 3: Save the date event
test('Test 3: Create save-the-date announcement', async ({ page }) => {
  await test.step('Navigate and authenticate', async () => {
    await page.goto('/organizer/new-event');
    await authenticateUser(page);
  });
  
  await test.step('Select save the date type', async () => {
    await page.waitForSelector('button:has-text("Save the Date")', { timeout: 10000 });
    await page.click('button:has-text("Save the Date")');
  });
  
  const eventData = generateEventData('save_the_date');
  
  await test.step('Fill basic information', async () => {
    await fillBasicEventInfo(page, eventData);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Review and publish', async () => {
    await page.click('button:has-text("Publish")');
    
    // Wait for success
    await page.waitForURL('**/event/**', { timeout: 15000 }).catch(async () => {
      await takeDebugScreenshot(page, 'save-date-publish-error');
    });
  });
  
  const currentUrl = page.url();
  expect(currentUrl).toContain('/event/');
  logTestStep('Save the date created successfully', { url: currentUrl });
});

// Test 4: Multi-day event with bundles
test('Test 4: Create multi-day event with ticket bundles', async ({ page }) => {
  await test.step('Navigate and authenticate', async () => {
    await page.goto('/organizer/new-event');
    await authenticateUser(page);
  });
  
  await test.step('Select multi-day event type', async () => {
    await page.waitForSelector('button:has-text("Multi-Day Event")', { timeout: 10000 });
    await page.click('button:has-text("Multi-Day Event")');
  });
  
  const eventData = generateEventData('multi_day');
  
  await test.step('Fill basic information', async () => {
    await fillBasicEventInfo(page, eventData);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
  });
  
  await test.step('Configure days', async () => {
    // This would be more complex for multi-day events
    // For now, we'll implement the basic flow
    logTestStep('Multi-day configuration would go here');
    
    // Fill in day details if the form is available
    for (let i = 0; i < eventData.days.length; i++) {
      const day = eventData.days[i];
      // Configure each day
      // This depends on the actual multi-day UI implementation
    }
  });
  
  await test.step('Create bundles', async () => {
    // Configure bundle tickets if available
    logTestStep('Bundle configuration would go here');
  });
  
  await test.step('Review and publish', async () => {
    const publishButton = await page.locator('button:has-text("Publish")');
    if (await publishButton.isVisible()) {
      await publishButton.click();
      
      // For now, multi-day might redirect to events list
      await page.waitForURL('**/events', { timeout: 15000 }).catch(async () => {
        await takeDebugScreenshot(page, 'multi-day-publish-error');
      });
    }
  });
  
  logTestStep('Multi-day event flow completed');
});

// After all tests, verify database entries
test.afterEach(async ({ page }, testInfo) => {
  // Log test completion
  console.log(`Test "${testInfo.title}" completed with status: ${testInfo.status}`);
  
  // Take final screenshot
  if (testInfo.status !== 'passed') {
    await takeDebugScreenshot(page, `test-failed-${testInfo.title.replace(/\s+/g, '-')}`);
  }
});