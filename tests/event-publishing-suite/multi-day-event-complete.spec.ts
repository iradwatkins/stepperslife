import { test, expect } from '@playwright/test';
import { EventTestHelpers, generateEventName, getFutureDate, formatTime, TestResult } from '../helpers/event-test-helpers';

test.describe('Multi-Day Event Complete Flow', () => {
  let helpers: EventTestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new EventTestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== MULTI-DAY EVENT TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('==================================================\n');
  });

  test('Complete 3-day festival with tickets and bundles', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Summer Dance Festival');
    let eventId: string | null = null;

    try {
      console.log('Starting multi-day festival test...');
      
      // Step 1: Login
      console.log('Step 1: Logging in...');
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      console.log('Step 2: Creating new event...');
      await helpers.navigateToNewEvent();
      
      // Step 3: Select multi-day event
      console.log('Step 3: Selecting multi-day event...');
      await helpers.selectEventType('multi_day');
      
      // Step 4: Fill festival details
      console.log('Step 4: Filling festival information...');
      await page.fill('input[placeholder*="event name"]', eventName);
      await page.fill('textarea[placeholder*="description"]', `
        Three days of non-stop dancing, workshops, and performances!
        
        Day 1 (Friday): Opening workshops and welcome social
        Day 2 (Saturday): Competition day and gala night
        Day 3 (Sunday): Master classes and farewell party
        
        Featuring world-renowned instructors and DJs!
      `);
      
      // Select categories
      const categories = ['Competition', 'Workshop', 'Social Dance', 'Sets'];
      for (const category of categories) {
        await page.click(`label:has-text("${category}")`);
      }
      
      // Step 5: Set date range
      console.log('Step 5: Setting date range...');
      const startDate = getFutureDate(60);
      const endDate = getFutureDate(62);
      
      await page.fill('input[type="date"]', startDate);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(endDate);
      }
      
      // Step 6: Configure venue (same for all days)
      console.log('Step 6: Setting venue information...');
      const sameLocationCheckbox = page.locator('label:has-text("Same location for all days")');
      if (await sameLocationCheckbox.isVisible()) {
        await sameLocationCheckbox.click();
      }
      
      await page.fill('input[placeholder*="venue"]', 'Miami Convention Center');
      await page.fill('input[placeholder*="address"]', '400 SE 2nd Avenue');
      await page.fill('input[placeholder*="City"]', 'Miami');
      await page.fill('input[placeholder*="State"]', 'FL');
      await page.fill('input[placeholder*="ZIP"]', '33131');
      
      await helpers.clickNext('Next: Ticketing');
      
      // Step 7: Configure ticketing
      console.log('Step 7: Configuring ticketing...');
      await page.click('text="Yes - Selling Tickets"');
      await helpers.clickNext('Next: Days');
      
      // Step 8: Configure Day 1 tickets
      console.log('Step 8: Configuring Day 1 (Friday) tickets...');
      
      // Day 1 schedule
      const day1Schedule = page.locator('textarea').first();
      if (await day1Schedule.isVisible()) {
        await day1Schedule.fill('6 PM - 8 PM: Beginner workshops\n8 PM - 2 AM: Welcome social dance');
      }
      
      // Add Day 1 tickets
      await page.click('button:has-text("Add Ticket Type")');
      await page.fill('input[placeholder*="ticket name"]', 'Friday Full Pass');
      await page.fill('input[placeholder*="price"]', '50');
      await page.fill('input[placeholder*="quantity"]', '200');
      
      // Step 9: Configure Day 2 tickets
      console.log('Step 9: Configuring Day 2 (Saturday) tickets...');
      const nextDayButton = page.locator('button:has-text("Next Day")');
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const day2Schedule = page.locator('textarea').nth(1);
      if (await day2Schedule.isVisible()) {
        await day2Schedule.fill('12 PM - 6 PM: Competition\n8 PM - 3 AM: Gala night and social');
      }
      
      await page.click('button:has-text("Add Ticket Type")');
      await page.fill('input[placeholder*="ticket name"]', 'Saturday Full Pass');
      await page.fill('input[placeholder*="price"]', '75');
      await page.fill('input[placeholder*="quantity"]', '200');
      
      // Step 10: Configure Day 3 tickets
      console.log('Step 10: Configuring Day 3 (Sunday) tickets...');
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const day3Schedule = page.locator('textarea').nth(2);
      if (await day3Schedule.isVisible()) {
        await day3Schedule.fill('10 AM - 2 PM: Master classes\n6 PM - 10 PM: Farewell party');
      }
      
      await page.click('button:has-text("Add Ticket Type")');
      await page.fill('input[placeholder*="ticket name"]', 'Sunday Full Pass');
      await page.fill('input[placeholder*="price"]', '40');
      await page.fill('input[placeholder*="quantity"]', '150');
      
      await helpers.clickNext('Next: Bundles');
      
      // Step 11: Create bundle packages
      console.log('Step 11: Creating bundle packages...');
      
      // Weekend pass bundle
      const createBundleButton = page.locator('button:has-text("Create Bundle")');
      if (await createBundleButton.isVisible()) {
        await createBundleButton.click();
        
        await page.fill('input[placeholder*="bundle name"]', 'Weekend Pass (All 3 Days)');
        await page.fill('input[placeholder*="bundle price"]', '150');
        
        // Select all day passes
        await page.click('label:has-text("Friday Full Pass")');
        await page.click('label:has-text("Saturday Full Pass")');
        await page.click('label:has-text("Sunday Full Pass")');
        
        const saveBundleButton = page.locator('button:has-text("Save Bundle")');
        if (await saveBundleButton.isVisible()) {
          await saveBundleButton.click();
        }
      }
      
      await helpers.clickNext('Next: Review');
      
      // Step 12: Review and publish
      console.log('Step 12: Reviewing multi-day event...');
      await helpers.waitForConvexSync(3000);
      
      const reviewScreenshot = await helpers.takeScreenshot('multi-day-review');
      
      // Step 13: Publish event
      console.log('Step 13: Publishing multi-day event...');
      eventId = await helpers.publishEvent(45000); // Longer timeout for complex event
      
      expect(eventId).not.toBeNull();
      console.log(`✅ Multi-day event published with ID: ${eventId}`);
      
      // Step 14: Verify public visibility
      console.log('Step 14: Verifying public visibility...');
      const isPublic = await helpers.verifyEventIsPublic(eventId!);
      expect(isPublic).toBe(true);
      
      // Step 15: Verify event details
      const eventDetails = await helpers.getEventDetails(eventId!);
      expect(eventDetails.title).toContain(eventName);
      
      testResults.push({
        testName: 'Multi-Day Festival Event',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!,
        screenshot: reviewScreenshot
      });
      
      console.log(`✅ Multi-day event test completed in ${Date.now() - startTime}ms`);
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`❌ Test failed: ${error}`);
      
      const errorScreenshot = await helpers.takeScreenshot('multi-day-error');
      
      testResults.push({
        testName: 'Multi-Day Festival Event',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined,
        screenshot: errorScreenshot
      });
      
      throw err;
    }
  });

  test('Simple 2-day workshop event', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Weekend Workshop');
    let eventId: string | null = null;

    try {
      console.log('Testing simple 2-day workshop...');
      
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('multi_day');
      
      await page.fill('input[placeholder*="event name"]', eventName);
      await page.fill('textarea', 'Intensive weekend workshop with guest instructors');
      
      await page.click('label:has-text("Workshop")');
      await page.click('label:has-text("Class/Lesson")');
      
      const startDate = getFutureDate(30);
      const endDate = getFutureDate(31);
      
      await page.fill('input[type="date"]', startDate);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(endDate);
      }
      
      await page.fill('input[placeholder*="venue"]', 'Dance Academy');
      await page.fill('input[placeholder*="address"]', '100 Dance Street');
      await page.fill('input[placeholder*="City"]', 'Chicago');
      await page.fill('input[placeholder*="State"]', 'IL');
      await page.fill('input[placeholder*="ZIP"]', '60601');
      
      await helpers.clickNext('Next: Ticketing');
      await page.click('text="No - Just Posting"');
      await page.fill('input[placeholder*="door price"]', '100');
      
      await helpers.clickNext('Next: Review');
      
      eventId = await helpers.publishEvent(30000);
      expect(eventId).not.toBeNull();
      
      testResults.push({
        testName: '2-Day Workshop Event',
        status: 'pass',
        duration: Date.now() - startTime,
        eventId: eventId!
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: '2-Day Workshop Event',
        status: 'fail',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});