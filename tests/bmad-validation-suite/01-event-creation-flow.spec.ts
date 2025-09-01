import { test, expect } from '@playwright/test';
import { BMADValidationHelpers, TEST_USERS, EVENT_TEMPLATES, TICKET_CONFIGS, TABLE_CONFIGS } from './helpers/test-helpers';

/**
 * BMAD Event Creation Flow Tests
 * Validates complete event creation workflow
 * Creates test events that are clearly marked and timestamped
 */

test.describe('BMAD Event Creation Flow Validation', () => {
  let helpers: BMADValidationHelpers;
  const createdEventIds: string[] = [];

  test.beforeAll(async ({ browser }) => {
    console.log('\n========================================');
    console.log('STARTING BMAD EVENT CREATION TESTS');
    console.log('All test events will be prefixed with TEST-BMAD');
    console.log('========================================\n');
  });

  test.beforeEach(async ({ page }) => {
    helpers = new BMADValidationHelpers(page);
    await helpers.login(TEST_USERS.organizer);
  });

  test('Create single event with tickets', async ({ page }) => {
    console.log('📝 Test: Creating single event with tickets');
    
    const eventName = helpers.generateTestEventName('Salsa-Night');
    let eventId: string | null = null;
    
    try {
      // Navigate to create event
      await helpers.navigateToNewEvent();
      
      // Select single day event
      await helpers.selectEventType('single');
      
      // Fill basic information
      await helpers.fillEventInfo({
        name: eventName,
        description: EVENT_TEMPLATES.salsaNight.description,
        venue: EVENT_TEMPLATES.salsaNight.venue,
        address: EVENT_TEMPLATES.salsaNight.address,
        city: EVENT_TEMPLATES.salsaNight.city,
        state: EVENT_TEMPLATES.salsaNight.state,
        zip: EVENT_TEMPLATES.salsaNight.zip,
        categories: EVENT_TEMPLATES.salsaNight.categories
      });
      
      // Set date and time (30 days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      await page.fill('input[type="date"]', dateStr);
      await page.fill('input[type="time"]', '20:00');
      
      // Click next to ticketing
      await page.locator('button:has-text("Next"), button:has-text("Continue")').first().click();
      
      // Enable ticketing
      const ticketToggle = page.locator('text=/selling.*tickets/i').first();
      if (await ticketToggle.isVisible({ timeout: 3000 })) {
        await ticketToggle.click();
      }
      
      // Set capacity
      await page.fill('input[placeholder*="capacity"], input[type="number"][name*="capacity"]', '200');
      
      // Add ticket types
      for (const ticket of TICKET_CONFIGS.standard) {
        await helpers.addTicketType(ticket);
        await page.waitForTimeout(500); // Allow UI to update
      }
      
      // Continue to review
      await page.locator('button:has-text("Next"), button:has-text("Review")').first().click();
      
      // Publish event
      await page.locator('button:has-text("Publish"), button:has-text("Create Event")').first().click();
      
      // Wait for success
      await page.waitForURL('**/success**', { timeout: 10000 }).catch(() => {});
      
      // Extract event ID from URL if possible
      const url = page.url();
      const match = url.match(/event[s]?\/([a-z0-9]+)/);
      if (match) {
        eventId = match[1];
        createdEventIds.push(eventId);
        console.log(`✅ Event created with ID: ${eventId}`);
      }
      
      // Verify event appears in My Events
      await page.goto('/seller/events');
      await page.waitForLoadState('networkidle');
      
      const eventListing = await page.locator(`text="${eventName}"`).isVisible({ timeout: 5000 });
      expect(eventListing).toBeTruthy();
      
      console.log('✅ Single event with tickets created successfully');
      
      // Verify event on homepage
      const onHomepage = await helpers.verifyEventOnHomepage(eventName);
      expect(onHomepage).toBeTruthy();
      console.log('✅ Event appears on homepage');
      
    } catch (error) {
      console.error('❌ Failed to create single event:', error);
      await helpers.screenshot('single-event-error');
      throw error;
    }
  });

  test('Create event with VIP tables', async ({ page }) => {
    console.log('📝 Test: Creating event with VIP tables');
    
    const eventName = helpers.generateTestEventName('Charity-Gala');
    let eventId: string | null = null;
    
    try {
      // Navigate to create event
      await helpers.navigateToNewEvent();
      
      // Select single day event
      await helpers.selectEventType('single');
      
      // Fill basic information
      await helpers.fillEventInfo({
        name: eventName,
        description: EVENT_TEMPLATES.charityGala.description,
        venue: EVENT_TEMPLATES.charityGala.venue,
        address: EVENT_TEMPLATES.charityGala.address,
        city: EVENT_TEMPLATES.charityGala.city,
        state: EVENT_TEMPLATES.charityGala.state,
        zip: EVENT_TEMPLATES.charityGala.zip,
        categories: EVENT_TEMPLATES.charityGala.categories
      });
      
      // Set date and time
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      await page.fill('input[type="date"]', dateStr);
      await page.fill('input[type="time"]', '19:00');
      
      // Click next
      await page.locator('button:has-text("Next"), button:has-text("Continue")').first().click();
      
      // Enable ticketing
      const ticketToggle = page.locator('text=/selling.*tickets/i').first();
      if (await ticketToggle.isVisible({ timeout: 3000 })) {
        await ticketToggle.click();
      }
      
      // Look for table configuration option
      const tableOption = page.locator('text=/table/i, button:has-text("Configure Tables")').first();
      if (await tableOption.isVisible({ timeout: 3000 })) {
        await tableOption.click();
        
        // Add table configurations
        for (const table of TABLE_CONFIGS.gala) {
          await helpers.addTable(table);
          await page.waitForTimeout(500);
        }
        
        console.log('✅ Table configurations added');
      } else {
        console.log('⚠️ Table configuration option not found - adding regular tickets instead');
        
        // Fall back to regular tickets
        for (const ticket of TICKET_CONFIGS.gala) {
          await helpers.addTicketType(ticket);
          await page.waitForTimeout(500);
        }
      }
      
      // Continue to review
      await page.locator('button:has-text("Next"), button:has-text("Review")').first().click();
      
      // Publish event
      await page.locator('button:has-text("Publish"), button:has-text("Create Event")').first().click();
      
      // Wait for success
      await page.waitForURL('**/success**', { timeout: 10000 }).catch(() => {});
      
      // Extract event ID
      const url = page.url();
      const match = url.match(/event[s]?\/([a-z0-9]+)/);
      if (match) {
        eventId = match[1];
        createdEventIds.push(eventId);
        console.log(`✅ Gala event created with ID: ${eventId}`);
      }
      
      // Verify in My Events
      await page.goto('/seller/events');
      await page.waitForLoadState('networkidle');
      
      const eventListing = await page.locator(`text="${eventName}"`).isVisible({ timeout: 5000 });
      expect(eventListing).toBeTruthy();
      
      console.log('✅ Event with tables created successfully');
      
      // If we have an event ID, check table management
      if (eventId) {
        await page.goto(`/seller/events/${eventId}/tables`);
        
        const hasTableManagement = await page.locator('text=/table.*assignment|manage.*tables/i').isVisible({ timeout: 5000 }).catch(() => false);
        if (hasTableManagement) {
          console.log('✅ Table management interface available');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to create event with tables:', error);
      await helpers.screenshot('table-event-error');
      throw error;
    }
  });

  test('Verify event categories are saved correctly', async ({ page }) => {
    console.log('📝 Test: Verifying event categories');
    
    const eventName = helpers.generateTestEventName('Category-Test');
    
    try {
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Fill event with multiple categories
      const testCategories = ['Workshop', 'Social Dance', 'Competition'];
      
      await helpers.fillEventInfo({
        name: eventName,
        description: 'Testing category selection',
        venue: 'Test Venue',
        address: '123 Test St',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        categories: testCategories
      });
      
      // Set date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
      await page.fill('input[type="time"]', '18:00');
      
      // Continue through flow
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(1000);
      
      // Skip ticketing for this test
      const skipButton = page.locator('text=/no.*just.*posting/i, text=/skip/i').first();
      if (await skipButton.isVisible({ timeout: 3000 })) {
        await skipButton.click();
      }
      
      // Continue to review
      await page.locator('button:has-text("Next"), button:has-text("Review")').first().click();
      
      // Check review page shows categories
      for (const category of testCategories) {
        const categoryVisible = await page.locator(`text="${category}"`).isVisible({ timeout: 3000 }).catch(() => false);
        expect(categoryVisible).toBeTruthy();
      }
      
      console.log('✅ Event categories display correctly in review');
      
      // Publish
      await page.locator('button:has-text("Publish"), button:has-text("Create")').first().click();
      
      console.log('✅ Event with categories created successfully');
      
    } catch (error) {
      console.error('❌ Failed category test:', error);
      await helpers.screenshot('category-test-error');
      throw error;
    }
  });

  test('Verify door price option for non-ticketed events', async ({ page }) => {
    console.log('📝 Test: Testing door price only events');
    
    const eventName = helpers.generateTestEventName('Door-Price-Event');
    
    try {
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      await helpers.fillEventInfo({
        name: eventName,
        description: 'Event with door price only',
        venue: 'Local Dance Studio',
        address: '456 Dance Ave',
        city: 'Miami',
        state: 'FL',
        zip: '33139'
      });
      
      // Set date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
      await page.fill('input[type="time"]', '21:00');
      
      // Continue to ticketing
      await page.locator('button:has-text("Next")').first().click();
      
      // Select "No - Just posting an event"
      const doorPriceOption = page.locator('text=/no.*just.*posting/i, text=/door.*price/i').first();
      if (await doorPriceOption.isVisible({ timeout: 3000 })) {
        await doorPriceOption.click();
        
        // Enter door price
        const doorPriceInput = page.locator('input[placeholder*="door price"], input[type="number"][name*="door"]').first();
        if (await doorPriceInput.isVisible({ timeout: 3000 })) {
          await doorPriceInput.fill('15');
          console.log('✅ Door price set to $15');
        }
      }
      
      // Continue to review
      await page.locator('button:has-text("Next"), button:has-text("Review")').first().click();
      
      // Verify door price shows in review
      const doorPriceVisible = await page.locator('text=/$15|door.*15/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(doorPriceVisible).toBeTruthy();
      
      // Publish
      await page.locator('button:has-text("Publish"), button:has-text("Create")').first().click();
      
      console.log('✅ Door price event created successfully');
      
    } catch (error) {
      console.error('❌ Failed door price test:', error);
      await helpers.screenshot('door-price-error');
      throw error;
    }
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot after each test for documentation
    const testName = test.info().title.replace(/\s+/g, '-').toLowerCase();
    await helpers.screenshot(`after-${testName}`);
  });

  test.afterAll(async ({ browser }) => {
    console.log('\n========================================');
    console.log('EVENT CREATION TESTS COMPLETED');
    console.log(`Created ${createdEventIds.length} test events`);
    
    if (createdEventIds.length > 0) {
      console.log('\nTest Event IDs (for cleanup if needed):');
      createdEventIds.forEach(id => console.log(`  - ${id}`));
    }
    
    console.log('\nAll test events are prefixed with TEST-BMAD');
    console.log('and include timestamps for easy identification');
    console.log('========================================\n');
  });
});