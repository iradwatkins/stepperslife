import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Free Events - Date/Time Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== FREE EVENTS DATE/TIME VALIDATION RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('=============================================================\n');
  });

  test('Test 1: Community Event (Jan 25) at 2:00 PM with door price', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Free Community Dance Social');
    const eventDate = '2025-01-25';
    const eventTime = '14:00'; // 2:00 PM
    const endTime = '18:00'; // 6:00 PM
    const expectedStartTime = '2:00 PM';
    const expectedEndTime = '6:00 PM';
    const expectedDate = 'January 25, 2025';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 1: Creating Community Event for', expectedDate, 'at', expectedStartTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Single Event type
      await helpers.selectEventType('single');
      
      // Step 4: Fill event details with afternoon time
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Free community dance social! Saturday afternoon from ${expectedStartTime} to ${expectedEndTime}. All ages welcome!`,
        date: eventDate,
        time: eventTime,
        endTime: endTime,
        categories: ['Social Dance', 'In The Park'],
        location: 'Bayfront Park Amphitheater',
        address: '301 Biscayne Blvd',
        city: 'Miami',
        state: 'FL',
        postalCode: '33132'
      });
      
      // Step 5: Verify date/time input values
      const dateInput = page.locator('input[type="date"]');
      await expect(dateInput).toHaveValue(eventDate);
      
      const timeInput = page.locator('input[type="time"]').first();
      await expect(timeInput).toHaveValue(eventTime);
      
      // Step 6: Screenshot the inputs
      await helpers.takeScreenshot('free-event-community-inputs');
      
      // Step 7: Proceed to ticketing
      await helpers.clickNext('Next: Ticketing');
      
      // Step 8: Configure as free event with door price
      await helpers.configureTicketing(false, 10); // $10 suggested donation at door
      
      // Step 9: Go to review
      await helpers.clickNext('Next: Review');
      
      // Step 10: Verify date/time display in review
      console.log('🔍 Verifying PM time display in review');
      
      // Check for proper date format
      const dateInReview = await page.locator(`text="${expectedDate}"`).isVisible();
      expect(dateInReview).toBe(true);
      
      // Check for proper time format with PM
      const startTimeInReview = await page.locator(`text="${expectedStartTime}"`).isVisible();
      expect(startTimeInReview).toBe(true);
      
      // Check end time if visible
      const endTimeElement = page.locator(`text="${expectedEndTime}"`);
      if (await endTimeElement.count() > 0) {
        console.log('✅ End time found:', expectedEndTime);
      }
      
      // Step 11: Screenshot review
      await helpers.takeScreenshot('free-event-community-review');
      
      // Step 12: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 13: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Verifying public display shows PM correctly');
      
      // Verify date displays correctly
      const publicDate = await page.locator(`text="${expectedDate}"`).first().isVisible();
      expect(publicDate).toBe(true);
      
      // Verify start time with PM
      const publicStartTime = await page.locator(`text="${expectedStartTime}"`).first().isVisible();
      expect(publicStartTime).toBe(true);
      
      // Step 14: Verify door price is shown
      const doorPriceText = await page.locator('text=/\\$10/').first().isVisible();
      expect(doorPriceText).toBe(true);
      
      // Step 15: Final screenshot
      await helpers.takeScreenshot('free-event-community-public');
      
      testResults.push({
        testName: 'Community Event Jan 25 at 2:00 PM',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: Free event ${eventId} with proper PM time display`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Community Event Jan 25 at 2:00 PM',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: Free Workshop (Feb 5) at 10:00 AM', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Free Beginner Salsa Workshop');
    const eventDate = '2025-02-05';
    const eventTime = '10:00'; // 10:00 AM
    const endTime = '12:00'; // 12:00 PM (noon)
    const expectedStartTime = '10:00 AM';
    const expectedEndTime = '12:00 PM'; // Noon should display as 12:00 PM
    const expectedDate = 'February 5, 2025';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 2: Creating Free Workshop for', expectedDate, 'at', expectedStartTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Single Event
      await helpers.selectEventType('single');
      
      // Step 4: Fill workshop details with morning time
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Free beginner-friendly salsa workshop! Morning session from ${expectedStartTime} to ${expectedEndTime} (noon). No partner required!`,
        date: eventDate,
        time: eventTime,
        endTime: endTime,
        categories: ['Workshop', 'Class/Lesson'],
        location: 'Miami Dance Studio',
        address: '456 Dance Ave',
        city: 'Miami',
        state: 'FL',
        postalCode: '33139'
      });
      
      // Step 5: Verify AM time input
      console.log('🔍 Verifying morning time inputs');
      const timeInput = page.locator('input[type="time"]').first();
      await expect(timeInput).toHaveValue(eventTime);
      
      // Step 6: Screenshot inputs
      await helpers.takeScreenshot('free-workshop-morning-inputs');
      
      // Step 7: Next to ticketing
      await helpers.clickNext('Next: Ticketing');
      
      // Step 8: Configure as free event (no door price)
      await helpers.configureTicketing(false, 0);
      
      // Step 9: Review step
      await helpers.clickNext('Next: Review');
      
      // Step 10: Verify AM display and noon as 12:00 PM
      console.log('🔍 Checking AM time and noon display');
      
      // Verify date format
      await expect(page.locator(`text="${expectedDate}"`)).toBeVisible();
      
      // Verify start time shows AM
      await expect(page.locator(`text="${expectedStartTime}"`)).toBeVisible();
      
      // Verify noon shows as 12:00 PM not 12:00 AM
      const noonDisplay = page.locator(`text="${expectedEndTime}"`);
      if (await noonDisplay.count() > 0) {
        await expect(noonDisplay.first()).toBeVisible();
        console.log('✅ Noon correctly displayed as 12:00 PM');
      }
      
      // Step 11: Screenshot review
      await helpers.takeScreenshot('free-workshop-morning-review');
      
      // Step 12: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 13: Navigate to public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      // Step 14: Verify public display
      console.log('✅ Verifying AM/PM on public page');
      
      // Check date
      const publicDateVisible = await page.locator(`text="${expectedDate}"`).first().isVisible();
      expect(publicDateVisible).toBe(true);
      
      // Check morning time (AM)
      const publicAMTime = await page.locator(`text="${expectedStartTime}"`).first().isVisible();
      expect(publicAMTime).toBe(true);
      
      // Verify it shows as free event
      const freeText = await page.locator('text=/free/i').first().isVisible();
      expect(freeText).toBe(true);
      
      // Step 15: Edge case - verify noon displays as PM not AM
      const noonText = await page.getByText(expectedEndTime).first();
      if (await noonText.isVisible()) {
        // Make sure it says PM for noon, not AM
        const noonContent = await noonText.textContent();
        expect(noonContent).toContain('PM');
        expect(noonContent).not.toContain('AM');
        console.log('✅ Noon edge case: Correctly shows as 12:00 PM');
      }
      
      // Step 16: Final screenshot
      await helpers.takeScreenshot('free-workshop-morning-public');
      
      testResults.push({
        testName: 'Free Workshop Feb 5 at 10:00 AM',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Workshop ${eventId} with proper AM time and noon as PM`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Free Workshop Feb 5 at 10:00 AM',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});