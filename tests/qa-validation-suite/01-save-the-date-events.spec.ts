import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Save-the-Date Events - Date/Time Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== SAVE-THE-DATE DATE/TIME VALIDATION RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('==============================================================\n');
  });

  test('Test 1: Future Save-the-Date (90 days) with 7:00 PM time', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Future Gala Save-the-Date');
    const eventDate = getFutureDate(90); // 90 days from now
    const eventTime = '19:00'; // 7:00 PM in 24-hour format
    const expectedTime = '7:00 PM';
    const expectedDate = formatDateForDisplay(eventDate);
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 1: Creating Save-the-Date for', expectedDate, 'at', expectedTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Save the Date type
      await helpers.selectEventType('save_the_date');
      
      // Step 4: Fill basic info with specific date/time
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Mark your calendars for our biggest event! Date: ${expectedDate} Time: ${expectedTime}`,
        date: eventDate,
        time: eventTime,
        categories: ['Holiday Event', 'Social Dance']
      });
      
      // Step 5: Verify Save-the-Date checkbox is checked
      const saveTheDateCheckbox = page.locator('input[type="checkbox"]:near(text="Save the Date")');
      if (await saveTheDateCheckbox.isVisible()) {
        await expect(saveTheDateCheckbox).toBeChecked();
      }
      
      // Step 6: Verify location fields are hidden
      const venueField = page.locator('input[placeholder*="venue" i]');
      await expect(venueField).not.toBeVisible();
      
      // Step 7: Take screenshot of date/time inputs
      await helpers.takeScreenshot('save-date-90days-inputs');
      
      // Step 8: Proceed to next step
      await helpers.clickNext('Next: Ticketing');
      
      // Step 9: Configure as non-ticketed
      await helpers.configureTicketing(false);
      
      // Step 10: Go to review
      await helpers.clickNext('Next: Review');
      
      // Step 11: Verify date/time display in review
      console.log('🔍 Verifying date/time in review:', expectedDate, expectedTime);
      const dateVisible = await helpers.verifyDateTimeDisplay(expectedDate, expectedTime);
      expect(dateVisible).toBe(true);
      
      // Step 12: Take screenshot of review
      await helpers.takeScreenshot('save-date-90days-review');
      
      // Step 13: Publish event
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 14: Verify on public page
      await page.goto(`/event/${eventId}`);
      console.log('✅ Verifying public display of date/time');
      
      // Check date format
      const publicDateVisible = await helpers.verifyDateTimeDisplay(expectedDate, expectedTime);
      expect(publicDateVisible).toBe(true);
      
      // Step 15: Take final screenshot
      await helpers.takeScreenshot('save-date-90days-public');
      
      testResults.push({
        testName: 'Save-the-Date 90 days future with 7:00 PM',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: Event ${eventId} created with date ${expectedDate} at ${expectedTime}`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Save-the-Date 90 days future with 7:00 PM',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: Near-term Save-the-Date (30 days) with 6:30 PM time', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Upcoming Dance Save-the-Date');
    const eventDate = getFutureDate(30); // 30 days from now
    const eventTime = '18:30'; // 6:30 PM in 24-hour format
    const expectedTime = '6:30 PM';
    const expectedDate = formatDateForDisplay(eventDate);
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 2: Creating Save-the-Date for', expectedDate, 'at', expectedTime);
      
      // Step 1: Login (might already be logged in)
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Save the Date type
      await helpers.selectEventType('save_the_date');
      
      // Step 4: Fill basic info with specific date/time
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Save the date! Coming soon on ${expectedDate} at ${expectedTime}. Venue TBA.`,
        date: eventDate,
        time: eventTime,
        categories: ['Workshop', 'Class/Lesson']
      });
      
      // Step 5: Verify no location required
      const locationSection = page.locator('text="Save the Date Event"');
      await expect(locationSection).toBeVisible();
      
      // Step 6: Verify date input value
      const dateInput = page.locator('input[type="date"]');
      const dateValue = await dateInput.inputValue();
      expect(dateValue).toBe(eventDate);
      
      // Step 7: Verify time input value  
      const timeInput = page.locator('input[type="time"]');
      const timeValue = await timeInput.inputValue();
      expect(timeValue).toBe(eventTime);
      
      // Step 8: Take screenshot
      await helpers.takeScreenshot('save-date-30days-inputs');
      
      // Step 9: Proceed to ticketing
      await helpers.clickNext('Next: Ticketing');
      
      // Step 10: Configure as announcement only
      await helpers.configureTicketing(false);
      
      // Step 11: Go to review
      await helpers.clickNext('Next: Review');
      
      // Step 12: Verify date/time display format
      console.log('🔍 Verifying review displays:', expectedDate, expectedTime);
      
      // Look for the formatted date
      const formattedDateVisible = await page.locator(`text="${expectedDate}"`).isVisible();
      expect(formattedDateVisible).toBe(true);
      
      // Look for the formatted time
      const formattedTimeVisible = await page.locator(`text="${expectedTime}"`).isVisible();
      expect(formattedTimeVisible).toBe(true);
      
      // Step 13: Screenshot review
      await helpers.takeScreenshot('save-date-30days-review');
      
      // Step 14: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 15: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Checking public page for correct date/time display');
      
      // Verify date and time are displayed correctly
      const publicDateCheck = await helpers.verifyDateTimeDisplay(expectedDate, expectedTime);
      expect(publicDateCheck).toBe(true);
      
      // Step 16: Verify "Save the Date" indicator
      const saveTheDateBadge = page.locator('text="Save the Date"');
      await expect(saveTheDateBadge).toBeVisible();
      
      // Step 17: Final screenshot
      await helpers.takeScreenshot('save-date-30days-public');
      
      testResults.push({
        testName: 'Save-the-Date 30 days future with 6:30 PM',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Event ${eventId} created with date ${expectedDate} at ${expectedTime}`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Save-the-Date 30 days future with 6:30 PM',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});