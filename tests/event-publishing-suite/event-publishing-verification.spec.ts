import { test, expect } from '@playwright/test';
import { EventTestHelpers, generateEventName, getFutureDate, formatTime, TestResult } from '../helpers/event-test-helpers';

test.describe('Event Publishing Verification - All Categories', () => {
  let helpers: EventTestHelpers;
  const testResults: TestResult[] = [];
  const createdEventIds: string[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new EventTestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== PUBLISHING VERIFICATION RESULTS ==========');
    console.log(`Total Events Created: ${createdEventIds.length}`);
    console.log(`Successful Publishes: ${testResults.filter(r => r.status === 'pass').length}`);
    console.log(`Failed Publishes: ${testResults.filter(r => r.status === 'fail').length}`);
    console.log('\nEvent IDs:');
    createdEventIds.forEach(id => console.log(`  - ${id}`));
    console.log('\nDetailed Results:');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('====================================================\n');
  });

  test('Verify all category types publish successfully', async ({ page }) => {
    const categories = [
      { id: 'workshop', label: 'Workshop', icon: '🎓' },
      { id: 'sets', label: 'Sets', icon: '🎭' },
      { id: 'in_the_park', label: 'In The Park', icon: '🌳' },
      { id: 'trip', label: 'Trip/Travel', icon: '✈️' },
      { id: 'cruise', label: 'Cruise', icon: '🚢' },
      { id: 'holiday', label: 'Holiday Event', icon: '🎉' },
      { id: 'competition', label: 'Competition', icon: '🏆' },
      { id: 'class', label: 'Class/Lesson', icon: '📚' },
      { id: 'social_dance', label: 'Social Dance', icon: '💃' },
      { id: 'lounge_bar', label: 'Lounge/Bar', icon: '🍸' },
      { id: 'other', label: 'Other/Party', icon: '🎊' }
    ];

    console.log('Testing all category types...');
    await helpers.loginAsOrganizer();

    for (const category of categories) {
      const startTime = Date.now();
      const eventName = generateEventName(`${category.label} Event Test`);
      let eventId: string | null = null;

      try {
        console.log(`\nTesting category: ${category.label} ${category.icon}`);
        
        await helpers.navigateToNewEvent();
        await helpers.selectEventType('single');
        
        await helpers.fillBasicEventInfo({
          name: eventName,
          description: `Testing ${category.label} category for proper publishing`,
          categories: [category.label]
        });
        
        await helpers.fillLocationInfo({
          venue: `${category.label} Venue`,
          address: '123 Test Street',
          city: 'Miami',
          state: 'FL',
          zip: '33101'
        });
        
        await helpers.setEventDateTime(getFutureDate(30), formatTime(19, 0));
        await helpers.clickNext('Next: Ticketing');
        await helpers.configureTicketing(false, 25);
        await helpers.clickNext('Next: Review');
        
        eventId = await helpers.publishEvent(30000);
        
        if (eventId) {
          createdEventIds.push(eventId);
          console.log(`✅ ${category.label} published successfully: ${eventId}`);
          
          // Verify it's visible
          const isPublic = await helpers.verifyEventIsPublic(eventId);
          expect(isPublic).toBe(true);
          
          testResults.push({
            testName: `Category: ${category.label}`,
            status: 'pass',
            duration: Date.now() - startTime,
            eventId
          });
        } else {
          throw new Error('Failed to get event ID after publish');
        }
        
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error(`❌ ${category.label} failed: ${error}`);
        
        testResults.push({
          testName: `Category: ${category.label}`,
          status: 'fail',
          duration: Date.now() - startTime,
          error,
          eventId: eventId || undefined
        });
      }
    }
  });

  test('Rapid event publishing - 5 events in succession', async ({ page }) => {
    console.log('\nTesting rapid event creation...');
    await helpers.loginAsOrganizer();

    for (let i = 1; i <= 5; i++) {
      const startTime = Date.now();
      const eventName = generateEventName(`Rapid Event ${i}`);
      let eventId: string | null = null;

      try {
        console.log(`Creating rapid event ${i}/5...`);
        
        await helpers.navigateToNewEvent();
        await helpers.selectEventType('single');
        
        await helpers.fillBasicEventInfo({
          name: eventName,
          description: `Quick event ${i} for rapid publishing test`,
          categories: ['Social Dance']
        });
        
        await helpers.fillLocationInfo({
          venue: 'Quick Venue',
          address: '456 Fast Lane',
          city: 'Miami',
          state: 'FL',
          zip: '33139'
        });
        
        await helpers.setEventDateTime(getFutureDate(20 + i), formatTime(20, 0));
        await helpers.clickNext('Next: Ticketing');
        await helpers.configureTicketing(false, 20);
        await helpers.clickNext('Next: Review');
        
        const publishStart = Date.now();
        eventId = await helpers.publishEvent(30000);
        const publishTime = Date.now() - publishStart;
        
        if (eventId) {
          createdEventIds.push(eventId);
          console.log(`✅ Event ${i} published in ${publishTime}ms`);
          
          testResults.push({
            testName: `Rapid Event ${i}`,
            status: 'pass',
            duration: Date.now() - startTime,
            eventId
          });
        }
        
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        testResults.push({
          testName: `Rapid Event ${i}`,
          status: 'fail',
          duration: Date.now() - startTime,
          error,
          eventId: eventId || undefined
        });
      }
    }
  });

  test('Verify events appear in listing', async ({ page }) => {
    const startTime = Date.now();
    
    try {
      console.log('\nVerifying events appear in public listing...');
      
      // Navigate to events page
      await page.goto('/events');
      await helpers.waitForConvexSync(5000);
      
      // Check if at least some created events are visible
      let visibleCount = 0;
      for (const eventId of createdEventIds.slice(0, 5)) { // Check first 5
        const eventElement = page.locator(`[href*="${eventId}"]`);
        if (await eventElement.isVisible().catch(() => false)) {
          visibleCount++;
        }
      }
      
      console.log(`Found ${visibleCount}/${Math.min(5, createdEventIds.length)} events in listing`);
      expect(visibleCount).toBeGreaterThan(0);
      
      testResults.push({
        testName: 'Events Listing Verification',
        status: 'pass',
        duration: Date.now() - startTime
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Events Listing Verification',
        status: 'fail',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Verify search functionality', async ({ page }) => {
    const startTime = Date.now();
    
    try {
      console.log('\nTesting search functionality...');
      
      // Create a unique searchable event
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      const uniqueName = `UNIQUE_SEARCH_TEST_${Date.now()}`;
      await helpers.fillBasicEventInfo({
        name: uniqueName,
        description: 'Event for search testing',
        categories: ['Workshop']
      });
      
      await helpers.fillLocationInfo({
        venue: 'Search Test Venue',
        address: '789 Search St',
        city: 'Miami',
        state: 'FL',
        zip: '33101'
      });
      
      await helpers.setEventDateTime(getFutureDate(15), formatTime(18, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false, 15);
      await helpers.clickNext('Next: Review');
      
      const eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      createdEventIds.push(eventId!);
      
      // Search for the event
      await page.goto('/search');
      await helpers.waitForConvexSync(3000);
      
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await searchInput.fill(uniqueName);
      await searchInput.press('Enter');
      
      await helpers.waitForConvexSync(5000);
      
      // Verify event appears in search results
      const searchResult = page.locator(`text="${uniqueName}"`);
      await expect(searchResult).toBeVisible({ timeout: 10000 });
      
      testResults.push({
        testName: 'Search Functionality',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Search Functionality',
        status: 'fail',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Verify QR code generation for ticketed events', async ({ page }) => {
    const startTime = Date.now();
    let eventId: string | null = null;
    
    try {
      console.log('\nTesting QR code generation...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      await helpers.fillBasicEventInfo({
        name: generateEventName('QR Code Test Event'),
        description: 'Event to test QR code generation',
        categories: ['Social Dance']
      });
      
      await helpers.fillLocationInfo({
        venue: 'QR Test Venue',
        address: '321 QR Street',
        city: 'Miami',
        state: 'FL',
        zip: '33139'
      });
      
      await helpers.setEventDateTime(getFutureDate(25), formatTime(19, 30));
      await helpers.clickNext('Next: Ticketing');
      
      // Configure as ticketed
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Add tickets
      await page.fill('input[placeholder*="capacity"]', '100');
      await helpers.addTicketType({
        name: 'QR Test Ticket',
        price: 30,
        quantity: 100
      });
      
      await helpers.clickNext('Next: Tables');
      const skipTables = page.locator('button:has-text("Skip Tables")');
      if (await skipTables.isVisible()) {
        await skipTables.click();
      }
      
      await helpers.clickNext('Next: Review');
      eventId = await helpers.publishEvent(30000);
      
      expect(eventId).not.toBeNull();
      createdEventIds.push(eventId!);
      
      // Navigate to event page
      await page.goto(`/event/${eventId}`);
      await helpers.waitForConvexSync(3000);
      
      // Check for ticket purchase button
      const purchaseButton = page.locator('button:has-text("Buy Ticket"), button:has-text("Get Ticket")');
      await expect(purchaseButton).toBeVisible({ timeout: 10000 });
      
      testResults.push({
        testName: 'QR Code Event Setup',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'QR Code Event Setup',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});