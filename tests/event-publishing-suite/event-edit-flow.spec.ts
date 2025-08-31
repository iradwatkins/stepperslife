import { test, expect } from '@playwright/test';
import { EventTestHelpers, generateEventName, getFutureDate, formatTime, TestResult } from '../helpers/event-test-helpers';

test.describe('Event Edit and Update Flow', () => {
  let helpers: EventTestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new EventTestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== EVENT EDIT TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('==============================================\n');
  });

  test('Create event then edit all details', async ({ page }) => {
    const startTime = Date.now();
    const originalName = generateEventName('Original Event Name');
    const updatedName = generateEventName('Updated Event Name');
    let eventId: string | null = null;

    try {
      console.log('Starting event edit test...');
      
      // Part 1: Create original event
      console.log('Part 1: Creating original event...');
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      await helpers.fillBasicEventInfo({
        name: originalName,
        description: 'Original description - will be updated',
        categories: ['Workshop']
      });
      
      await helpers.fillLocationInfo({
        venue: 'Original Venue',
        address: '123 Original St',
        city: 'Boston',
        state: 'MA',
        zip: '02101'
      });
      
      await helpers.setEventDateTime(getFutureDate(30), formatTime(18, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false, 20);
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      console.log(`✅ Original event created with ID: ${eventId}`);
      
      // Part 2: Navigate to edit page
      console.log('Part 2: Navigating to edit page...');
      await page.goto(`/seller/events/${eventId}/edit`);
      await helpers.waitForConvexSync(3000);
      
      // Part 3: Edit event details
      console.log('Part 3: Editing event details...');
      
      // Update name
      const nameInput = page.locator('input[value*="Original Event Name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await nameInput.fill(updatedName);
      }
      
      // Update description
      const descriptionTextarea = page.locator('textarea').first();
      if (await descriptionTextarea.isVisible()) {
        await descriptionTextarea.clear();
        await descriptionTextarea.fill('Updated description with more details about the amazing event!');
      }
      
      // Change categories
      const workshopCheckbox = page.locator('label:has-text("Workshop")');
      if (await workshopCheckbox.isVisible()) {
        await workshopCheckbox.click(); // Uncheck
      }
      await page.click('label:has-text("Social Dance")');
      await page.click('label:has-text("Competition")');
      
      // Update venue
      const venueInput = page.locator('input[value*="Original Venue"]').first();
      if (await venueInput.isVisible()) {
        await venueInput.clear();
        await venueInput.fill('New Amazing Venue');
      }
      
      // Update city
      const cityInput = page.locator('input[value="Boston"]');
      if (await cityInput.isVisible()) {
        await cityInput.clear();
        await cityInput.fill('Cambridge');
      }
      
      // Update date
      const newDate = getFutureDate(45);
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill(newDate);
      }
      
      // Update time
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible()) {
        await timeInput.fill(formatTime(20, 30));
      }
      
      // Update price
      const priceInput = page.locator('input[value="20"]');
      if (await priceInput.isVisible()) {
        await priceInput.clear();
        await priceInput.fill('25');
      }
      
      // Part 4: Save changes
      console.log('Part 4: Saving changes...');
      const saveButton = page.locator('button:has-text("Save Changes")').first();
      await saveButton.click();
      
      // Wait for save confirmation
      await helpers.waitForConvexSync(5000);
      
      // Part 5: Verify changes persisted
      console.log('Part 5: Verifying changes...');
      await page.goto(`/event/${eventId}`);
      await helpers.waitForConvexSync(3000);
      
      const eventDetails = await helpers.getEventDetails(eventId);
      
      // Verify updated name
      expect(eventDetails.title).toContain(updatedName);
      expect(eventDetails.title).not.toContain('Original Event Name');
      
      // Verify updated description
      expect(eventDetails.description).toContain('Updated description');
      
      // Verify updated location
      if (eventDetails.location) {
        expect(eventDetails.location).toContain('Cambridge');
      }
      
      // Take screenshot of updated event
      const updatedScreenshot = await helpers.takeScreenshot('event-after-edit');
      
      testResults.push({
        testName: 'Event Edit - All Fields',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId,
        screenshot: updatedScreenshot
      });
      
      console.log(`✅ Event edit test completed in ${Date.now() - startTime}ms`);
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`❌ Edit test failed: ${error}`);
      
      const errorScreenshot = await helpers.takeScreenshot('event-edit-error');
      
      testResults.push({
        testName: 'Event Edit - All Fields',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined,
        screenshot: errorScreenshot
      });
      
      throw err;
    }
  });

  test('Quick edit - change date and price only', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Quick Edit Test');
    let eventId: string | null = null;

    try {
      console.log('Testing quick edit...');
      
      // Create event
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Event for quick edit test',
        categories: ['Social Dance']
      });
      
      await helpers.fillLocationInfo({
        venue: 'Test Venue',
        address: '456 Test Ave',
        city: 'Seattle',
        state: 'WA',
        zip: '98101'
      });
      
      await helpers.setEventDateTime(getFutureDate(20), formatTime(19, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false, 30);
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      
      // Edit event
      await page.goto(`/seller/events/${eventId}/edit`);
      await helpers.waitForConvexSync(3000);
      
      // Change date only
      const newDate = getFutureDate(35);
      const dateInput = page.locator('input[type="date"]').first();
      await dateInput.fill(newDate);
      
      // Change price
      const priceInput = page.locator('input[value="30"]');
      if (await priceInput.isVisible()) {
        await priceInput.clear();
        await priceInput.fill('35');
      }
      
      // Save
      await page.click('button:has-text("Save Changes")');
      await helpers.waitForConvexSync(5000);
      
      // Verify
      const eventDetails = await helpers.getEventDetails(eventId);
      expect(eventDetails.price).toContain('35');
      
      testResults.push({
        testName: 'Quick Edit - Date and Price',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Quick Edit - Date and Price',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Edit save-the-date to add location', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Save Date Update Test');
    let eventId: string | null = null;

    try {
      console.log('Testing save-the-date location update...');
      
      // Create save-the-date
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('save_the_date');
      
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Venue TBA',
        categories: ['Holiday Event'],
        isSaveTheDate: true
      });
      
      await helpers.setEventDateTime(getFutureDate(60), formatTime(20, 0));
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false);
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      
      // Edit to add location
      await page.goto(`/seller/events/${eventId}/edit`);
      await helpers.waitForConvexSync(3000);
      
      // Uncheck save-the-date
      const saveTheDateCheckbox = page.locator('label:has-text("Save the Date")');
      if (await saveTheDateCheckbox.isVisible()) {
        await saveTheDateCheckbox.click();
      }
      
      // Add location details
      await page.fill('input[placeholder*="venue"]', 'Grand Hotel Ballroom');
      await page.fill('input[placeholder*="address"]', '789 Luxury Lane');
      await page.fill('input[placeholder*="City"]', 'Miami');
      await page.fill('input[placeholder*="State"]', 'FL');
      await page.fill('input[placeholder*="ZIP"]', '33101');
      
      // Save
      await page.click('button:has-text("Save Changes")');
      await helpers.waitForConvexSync(5000);
      
      // Verify location added
      const eventDetails = await helpers.getEventDetails(eventId);
      expect(eventDetails.location).toContain('Miami');
      
      testResults.push({
        testName: 'Save-the-Date Location Update',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Save-the-Date Location Update',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});