import { test, expect } from '@playwright/test';
import { EventTestHelpers, generateEventName, getFutureDate, formatTime, TestResult } from '../helpers/event-test-helpers';

test.describe('Save-the-Date Event Complete Flow', () => {
  let helpers: EventTestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new EventTestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== SAVE-THE-DATE TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('================================================\n');
  });

  test('Complete save-the-date event creation and publishing', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Save the Date - Summer Dance Gala');
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('Starting save-the-date event test...');
      
      // Step 1: Login
      console.log('Step 1: Logging in as event organizer...');
      await helpers.loginAsOrganizer();
      await expect(page).toHaveURL(/\/(dashboard|seller|$)/, { timeout: 15000 });
      
      // Step 2: Navigate to new event page
      console.log('Step 2: Navigating to new event page...');
      await helpers.navigateToNewEvent();
      await expect(page.locator('text="Create New Event"')).toBeVisible();
      
      // Step 3: Select Save the Date event type
      console.log('Step 3: Selecting Save the Date event type...');
      await helpers.selectEventType('save_the_date');
      
      // Step 4: Fill basic information
      console.log('Step 4: Filling basic event information...');
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Mark your calendars! Our biggest dance gala of the year is coming. Venue and ticket details to be announced soon. This will be an unforgettable night of dancing, performances, and celebration!',
        categories: ['Holiday Event', 'Social Dance'],
        isSaveTheDate: true
      });
      
      // Step 5: Verify location fields are hidden for save-the-date
      console.log('Step 5: Verifying location fields are hidden...');
      const venueField = page.locator('input[placeholder*="Grand Ballroom"]');
      await expect(venueField).not.toBeVisible();
      
      // Step 6: Set tentative date
      console.log('Step 6: Setting tentative date...');
      const eventDate = getFutureDate(90); // 90 days from now
      await helpers.setEventDateTime(eventDate, formatTime(19, 0));
      
      // Step 7: Upload event image (skip for now as it requires fixture)
      console.log('Step 7: Skipping image upload (no fixture available)...');
      // await helpers.uploadEventImage();
      
      // Step 8: Click Next to ticketing
      console.log('Step 8: Proceeding to ticketing step...');
      await helpers.clickNext('Next: Ticketing');
      
      // Step 9: Configure as non-ticketed (announcement only)
      console.log('Step 9: Configuring as announcement only...');
      await helpers.configureTicketing(false, 0);
      
      // Step 10: Skip to review
      console.log('Step 10: Proceeding to review...');
      await helpers.clickNext('Next: Review');
      
      // Step 11: Take screenshot of review page
      console.log('Step 11: Taking screenshot of review page...');
      const reviewScreenshot = await helpers.takeScreenshot('save-the-date-review');
      
      // Step 12: Publish the event
      console.log('Step 12: Publishing save-the-date event...');
      eventId = await helpers.publishEvent(30000);
      
      // Verify event was published
      expect(eventId).not.toBeNull();
      expect(eventId).toMatch(/^[a-zA-Z0-9]+$/);
      console.log(`✅ Event published successfully with ID: ${eventId}`);
      
      // Step 13: Verify event is publicly visible
      console.log('Step 13: Verifying event is publicly visible...');
      const isPublic = await helpers.verifyEventIsPublic(eventId!);
      expect(isPublic).toBe(true);
      
      // Step 14: Get and verify event details
      console.log('Step 14: Verifying event details...');
      const eventDetails = await helpers.getEventDetails(eventId!);
      
      expect(eventDetails.title).toContain(eventName);
      expect(eventDetails.description).toContain('Mark your calendars');
      
      // Save-the-date should not show location
      if (eventDetails.location) {
        expect(eventDetails.location).not.toContain('undefined');
      }
      
      // Step 15: Take final screenshot
      const finalScreenshot = await helpers.takeScreenshot('save-the-date-published');
      
      // Record success
      testResults.push({
        testName: 'Save-the-Date Event Creation',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!,
        screenshot: finalScreenshot
      });
      
      console.log(`✅ Save-the-date event test completed successfully in ${Date.now() - startTime}ms`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error(`❌ Test failed: ${error}`);
      
      // Take error screenshot
      const errorScreenshot = await helpers.takeScreenshot('save-the-date-error');
      
      // Record failure
      testResults.push({
        testName: 'Save-the-Date Event Creation',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined,
        screenshot: errorScreenshot
      });
      
      throw err;
    }
  });

  test('Save-the-date with all categories', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Multi-Category Save the Date');
    let eventId: string | null = null;

    try {
      console.log('Testing save-the-date with multiple categories...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('save_the_date');
      
      // Select multiple categories
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'A spectacular event combining workshop, competition, and social dancing!',
        categories: ['Workshop', 'Competition', 'Social Dance', 'Holiday Event'],
        isSaveTheDate: true
      });
      
      await helpers.setEventDateTime(getFutureDate(60), formatTime(18, 30));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false);
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      
      const isPublic = await helpers.verifyEventIsPublic(eventId!);
      expect(isPublic).toBe(true);
      
      testResults.push({
        testName: 'Save-the-Date with Multiple Categories',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Save-the-Date with Multiple Categories',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Save-the-date quick publish', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Quick Save the Date');
    let eventId: string | null = null;

    try {
      console.log('Testing quick save-the-date publish...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('save_the_date');
      
      // Minimal required fields only
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Quick announcement - details coming soon!',
        categories: ['Other/Party'],
        isSaveTheDate: true
      });
      
      await helpers.setEventDateTime(getFutureDate(45), formatTime(20, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false);
      await helpers.clickNext('Next: Review');
      
      // Time the publish operation
      const publishStart = Date.now();
      eventId = await helpers.publishEvent(30000);
      const publishDuration = Date.now() - publishStart;
      
      console.log(`⏱️ Event published in ${publishDuration}ms`);
      expect(eventId).not.toBeNull();
      expect(publishDuration).toBeLessThan(30000);
      
      testResults.push({
        testName: 'Save-the-Date Quick Publish',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Save-the-Date Quick Publish',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});