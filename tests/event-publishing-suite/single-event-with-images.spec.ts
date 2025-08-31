import { test, expect } from '@playwright/test';
import { EventTestHelpers, generateEventName, getFutureDate, formatTime, TestResult } from '../helpers/event-test-helpers';

test.describe('Single Event with Images and Tickets', () => {
  let helpers: EventTestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new EventTestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== SINGLE EVENT TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('================================================\n');
  });

  test('Complete single event with images and tickets', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Summer Salsa Night');
    let eventId: string | null = null;

    try {
      console.log('Starting single event with images test...');
      
      // Step 1: Login
      console.log('Step 1: Logging in...');
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      console.log('Step 2: Creating new event...');
      await helpers.navigateToNewEvent();
      
      // Step 3: Select single day event
      console.log('Step 3: Selecting single day event...');
      await helpers.selectEventType('single');
      
      // Step 4: Fill comprehensive event details
      console.log('Step 4: Filling event details...');
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Join us for an unforgettable night of salsa dancing! 
        
        Features:
        - Live DJ playing the hottest salsa tracks
        - Professional dance performances
        - Beginner-friendly dance lesson at 8 PM
        - Full bar and Latin food available
        - Dance floor with premium sound system
        - Air-conditioned venue
        
        Dress code: Smart casual, dance shoes recommended
        All levels welcome!`,
        categories: ['Social Dance', 'Workshop', 'Sets']
      });
      
      // Step 5: Fill location details
      console.log('Step 5: Adding location details...');
      await helpers.fillLocationInfo({
        venue: 'The Grand Ballroom Miami',
        address: '1234 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        zip: '33139'
      });
      
      // Step 6: Set date and time
      console.log('Step 6: Setting date and time...');
      const eventDate = getFutureDate(30);
      await helpers.setEventDateTime(eventDate, formatTime(20, 0));
      
      // Set end time
      const endTimeInput = page.locator('input[type="time"]').nth(1);
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill(formatTime(2, 0));
      }
      
      // Step 7: Upload image (if possible)
      console.log('Step 7: Attempting image upload...');
      // Note: Real image upload would require a test fixture
      // await helpers.uploadEventImage();
      
      // Step 8: Proceed to ticketing
      console.log('Step 8: Configuring ticketing...');
      await helpers.clickNext('Next: Ticketing');
      
      // Step 9: Configure as ticketed event
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Step 10: Set capacity and add ticket types
      console.log('Step 10: Adding ticket types...');
      
      // Set total capacity
      const capacityInput = page.locator('input[placeholder*="Total event capacity"]');
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('200');
      }
      
      // Add General Admission ticket
      await helpers.addTicketType({
        name: 'General Admission',
        price: 25,
        quantity: 150,
        hasEarlyBird: true,
        earlyBirdPrice: 20
      });
      
      // Add VIP ticket
      await helpers.addTicketType({
        name: 'VIP (Includes Reserved Table)',
        price: 50,
        quantity: 50,
        hasEarlyBird: true,
        earlyBirdPrice: 40
      });
      
      // Step 11: Skip tables (or configure if visible)
      console.log('Step 11: Proceeding past tables...');
      await helpers.clickNext('Next: Tables');
      
      const skipTablesButton = page.locator('button:has-text("Skip Tables")');
      if (await skipTablesButton.isVisible()) {
        await skipTablesButton.click();
      } else {
        await helpers.clickNext('Next: Review');
      }
      
      // Step 12: Review and publish
      console.log('Step 12: Reviewing event details...');
      await helpers.waitForConvexSync(2000);
      
      // Take review screenshot
      const reviewScreenshot = await helpers.takeScreenshot('single-event-review');
      
      // Step 13: Publish event
      console.log('Step 13: Publishing event...');
      eventId = await helpers.publishEvent(30000);
      
      expect(eventId).not.toBeNull();
      console.log(`✅ Event published with ID: ${eventId}`);
      
      // Step 14: Verify public visibility
      console.log('Step 14: Verifying public visibility...');
      const isPublic = await helpers.verifyEventIsPublic(eventId!);
      expect(isPublic).toBe(true);
      
      // Step 15: Verify event details
      console.log('Step 15: Verifying event details...');
      const eventDetails = await helpers.getEventDetails(eventId!);
      
      expect(eventDetails.title).toContain(eventName);
      expect(eventDetails.description).toBeTruthy();
      expect(eventDetails.location).toContain('Miami');
      expect(eventDetails.date).toBeTruthy();
      expect(eventDetails.price).toBeTruthy();
      
      // Record success
      testResults.push({
        testName: 'Single Event with Tickets',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!,
        screenshot: reviewScreenshot
      });
      
      console.log(`✅ Single event test completed in ${Date.now() - startTime}ms`);
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`❌ Test failed: ${error}`);
      
      const errorScreenshot = await helpers.takeScreenshot('single-event-error');
      
      testResults.push({
        testName: 'Single Event with Tickets',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined,
        screenshot: errorScreenshot
      });
      
      throw err;
    }
  });

  test('Single event with door price only', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Casual Dance Night');
    let eventId: string | null = null;

    try {
      console.log('Testing single event with door price only...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Casual dance night - pay at the door!',
        categories: ['Social Dance', 'Lounge/Bar']
      });
      
      await helpers.fillLocationInfo({
        venue: 'Downtown Dance Club',
        address: '789 Main Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      });
      
      await helpers.setEventDateTime(getFutureDate(14), formatTime(21, 30));
      await helpers.clickNext('Next: Ticketing');
      
      // Configure as door price only
      await helpers.configureTicketing(false, 15);
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      
      const eventDetails = await helpers.getEventDetails(eventId!);
      expect(eventDetails.price).toContain('15');
      
      testResults.push({
        testName: 'Single Event with Door Price',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Single Event with Door Price',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Single event with all categories selected', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Ultimate Dance Experience');
    let eventId: string | null = null;

    try {
      console.log('Testing single event with all categories...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Select maximum allowed categories (5)
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'The ultimate dance experience combining all styles!',
        categories: ['Workshop', 'Competition', 'Social Dance', 'Sets', 'Holiday Event']
      });
      
      await helpers.fillLocationInfo({
        venue: 'Convention Center',
        address: '500 Convention Way',
        city: 'Las Vegas',
        state: 'NV',
        zip: '89109'
      });
      
      await helpers.setEventDateTime(getFutureDate(60), formatTime(10, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Add single all-access ticket
      await helpers.addTicketType({
        name: 'All Access Pass',
        price: 100,
        quantity: 500
      });
      
      await helpers.clickNext('Next: Tables');
      const skipTables = page.locator('button:has-text("Skip Tables")');
      if (await skipTables.isVisible()) {
        await skipTables.click();
      }
      
      await helpers.clickNext('Next: Review');
      eventId = await helpers.publishEvent(30000);
      
      expect(eventId).not.toBeNull();
      
      testResults.push({
        testName: 'Single Event with All Categories',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Single Event with All Categories',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});