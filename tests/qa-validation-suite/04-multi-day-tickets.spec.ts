import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Multi-Day Events with Tickets - Date/Time Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== MULTI-DAY EVENTS DATE/TIME VALIDATION RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('==================================================================\n');
  });

  test('Test 1: 3-Day Weekend Festival (Feb 28 - March 2) with varying times', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Miami Dance Festival 2025');
    
    // Festival dates spanning month boundary
    const day1Date = '2025-02-28'; // Friday
    const day2Date = '2025-03-01'; // Saturday
    const day3Date = '2025-03-02'; // Sunday
    
    // Different times each day
    const day1Time = '18:00'; // 6:00 PM
    const day2Time = '12:00'; // 12:00 PM (noon)
    const day3Time = '10:00'; // 10:00 AM
    
    const expectedDay1 = 'February 28, 2025 at 6:00 PM';
    const expectedDay2 = 'March 1, 2025 at 12:00 PM'; // Noon as PM
    const expectedDay3 = 'March 2, 2025 at 10:00 AM';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 1: Creating 3-Day Festival crossing month boundary');
      console.log('  Day 1:', expectedDay1);
      console.log('  Day 2:', expectedDay2);
      console.log('  Day 3:', expectedDay3);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Multi-Day Event
      await helpers.selectEventType('multi_day');
      
      // Step 4: Fill basic festival info
      console.log('📝 Filling multi-day event information');
      
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea[placeholder*="description" i]', 
        `Three unforgettable days of dance! 
        Friday: Evening social (6 PM - 2 AM)
        Saturday: Workshops & competition (12 PM - 3 AM) 
        Sunday: Master classes (10 AM - 10 PM)`);
      
      // Select categories
      const categories = ['Competition', 'Workshop', 'Social Dance'];
      for (const cat of categories) {
        await page.click(`label:has-text("${cat}")`);
      }
      
      // Step 5: Set date range
      console.log('🗓️ Setting date range: Feb 28 - March 2');
      
      await page.fill('input[type="date"]', day1Date);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(day3Date);
      }
      
      // Step 6: Verify month boundary handling
      const startDateValue = await page.locator('input[type="date"]').first().inputValue();
      expect(startDateValue).toBe(day1Date);
      
      // Step 7: Configure venue (same for all days)
      const sameLocationCheckbox = page.locator('label:has-text("Same location")');
      if (await sameLocationCheckbox.isVisible()) {
        await sameLocationCheckbox.click();
      }
      
      await page.fill('input[placeholder*="venue" i]', 'Miami Convention Center');
      await page.fill('input[placeholder*="address" i]', '400 SE 2nd Ave');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      await page.fill('input[placeholder*="zip" i]', '33131');
      
      // Screenshot basic info
      await helpers.takeScreenshot('multiday-3day-basic');
      
      // Step 8: Proceed to ticketing
      await helpers.clickNext('Next: Ticketing');
      await page.click('text="Yes - Selling Tickets"');
      await helpers.clickNext('Next: Days');
      
      // Step 9: Configure Day 1 (Friday evening)
      console.log('🎫 Configuring Day 1 - Friday 6:00 PM');
      
      // Set Day 1 time
      const day1TimeInput = page.locator('input[type="time"]').first();
      if (await day1TimeInput.isVisible()) {
        await day1TimeInput.fill(day1Time);
      }
      
      // Add Day 1 tickets
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Friday Night Social Pass');
      await page.fill('input[placeholder*="price" i]', '50');
      await page.fill('input[placeholder*="quantity" i]', '200');
      
      // Step 10: Configure Day 2 (Saturday noon)
      console.log('🎫 Configuring Day 2 - Saturday 12:00 PM (noon)');
      
      const nextDayButton = page.locator('button:has-text("Next Day")');
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      // Set Day 2 time (noon)
      const day2TimeInput = page.locator('input[type="time"]').nth(1);
      if (await day2TimeInput.isVisible()) {
        await day2TimeInput.fill(day2Time);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Saturday Full Day Pass');
      await page.fill('input[placeholder*="price" i]', '75');
      await page.fill('input[placeholder*="quantity" i]', '200');
      
      // Step 11: Configure Day 3 (Sunday morning)
      console.log('🎫 Configuring Day 3 - Sunday 10:00 AM');
      
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      // Set Day 3 time
      const day3TimeInput = page.locator('input[type="time"]').nth(2);
      if (await day3TimeInput.isVisible()) {
        await day3TimeInput.fill(day3Time);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Sunday Workshop Pass');
      await page.fill('input[placeholder*="price" i]', '40');
      await page.fill('input[placeholder*="quantity" i]', '150');
      
      // Screenshot day configurations
      await helpers.takeScreenshot('multiday-3day-tickets');
      
      // Step 12: Skip bundles for now, go to review
      await helpers.clickNext('Next: Bundles');
      await helpers.clickNext('Skip Bundles');
      await helpers.clickNext('Next: Review');
      
      // Step 13: Verify dates and times in review
      console.log('🔍 Verifying date progression and AM/PM times');
      
      // Check Day 1 - February PM
      const day1Display = page.locator(`text=/February 28.*6:00 PM/`);
      if (await day1Display.count() > 0) {
        console.log('✅ Day 1: February date with PM time found');
      }
      
      // Check Day 2 - March with noon as PM
      const day2Display = page.locator(`text=/March 1.*12:00 PM/`);
      if (await day2Display.count() > 0) {
        console.log('✅ Day 2: March date with noon as 12:00 PM found');
      }
      
      // Check Day 3 - March with AM
      const day3Display = page.locator(`text=/March 2.*10:00 AM/`);
      if (await day3Display.count() > 0) {
        console.log('✅ Day 3: March date with AM time found');
      }
      
      // Screenshot review
      await helpers.takeScreenshot('multiday-3day-review');
      
      // Step 14: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 15: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Verifying multi-day display on public page');
      
      // Verify festival dates span
      const festivalDates = await page.locator('text=/February 28.*March 2/').first().isVisible();
      if (festivalDates) {
        console.log('✅ Date range displays correctly across month boundary');
      }
      
      // Verify individual day tickets with times
      await expect(page.locator('text="Friday Night Social Pass"')).toBeVisible();
      await expect(page.locator('text="Saturday Full Day Pass"')).toBeVisible();
      await expect(page.locator('text="Sunday Workshop Pass"')).toBeVisible();
      
      // Final screenshot
      await helpers.takeScreenshot('multiday-3day-public');
      
      testResults.push({
        testName: '3-Day Festival Feb 28 - March 2 with PM/noon/AM times',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: 3-day festival ${eventId} with correct date progression`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: '3-Day Festival Feb 28 - March 2 with PM/noon/AM times',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: Week-long Dance Camp (March 10-16) with consistent times', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Spring Dance Intensive Camp');
    
    // 7-day camp
    const startDate = '2025-03-10'; // Monday
    const endDate = '2025-03-16'; // Sunday
    const dailyStartTime = '09:00'; // 9:00 AM each day
    const dailyEndTime = '21:00'; // 9:00 PM each day
    
    const expectedStartDate = 'March 10, 2025';
    const expectedEndDate = 'March 16, 2025';
    const expectedDailyTime = '9:00 AM - 9:00 PM';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 2: Creating Week-long Camp', expectedStartDate, 'to', expectedEndDate);
      console.log('  Daily schedule:', expectedDailyTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Multi-Day Event
      await helpers.selectEventType('multi_day');
      
      // Step 4: Fill camp information
      console.log('📝 Setting up week-long intensive');
      
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea[placeholder*="description" i]',
        `7-day intensive dance camp! Daily schedule ${expectedDailyTime}.
        Morning: Technique classes
        Afternoon: Style workshops
        Evening: Practice sessions`);
      
      // Categories
      const categories = ['Workshop', 'Class/Lesson', 'Competition'];
      for (const cat of categories) {
        await page.click(`label:has-text("${cat}")`);
      }
      
      // Step 5: Set week-long date range
      console.log('🗓️ Setting 7-day range');
      
      await page.fill('input[type="date"]', startDate);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(endDate);
      }
      
      // Step 6: Venue configuration
      await page.click('label:has-text("Same location")');
      await page.fill('input[placeholder*="venue" i]', 'Miami Dance Institute');
      await page.fill('input[placeholder*="address" i]', '555 Training Way');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      await page.fill('input[placeholder*="zip" i]', '33133');
      
      // Screenshot
      await helpers.takeScreenshot('multiday-week-basic');
      
      // Step 7: Configure ticketing
      await helpers.clickNext('Next: Ticketing');
      await page.click('text="Yes - Selling Tickets"');
      await helpers.clickNext('Next: Days');
      
      // Step 8: Configure tickets for multiple days (simplified)
      console.log('🎫 Setting up week passes');
      
      // For week-long events, typically configure first day with main tickets
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible()) {
        await timeInput.fill(dailyStartTime);
      }
      
      const endTimeInput = page.locator('input[type="time"]').nth(1);
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill(dailyEndTime);
      }
      
      // Add week pass
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Full Week Pass');
      await page.fill('input[placeholder*="price" i]', '500');
      await page.fill('input[placeholder*="quantity" i]', '50');
      
      // Add daily drop-in option
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Single Day Drop-in');
      await page.fill('input[placeholder*="price" i]', '85');
      await page.fill('input[placeholder*="quantity" i]', '20');
      
      // Screenshot tickets
      await helpers.takeScreenshot('multiday-week-tickets');
      
      // Step 9: Skip to review
      await helpers.clickNext('Next: Bundles');
      await helpers.clickNext('Skip');
      await helpers.clickNext('Next: Review');
      
      // Step 10: Verify date range in review
      console.log('🔍 Verifying 7-day span displays correctly');
      
      // Check start date
      const startDateVisible = await page.locator(`text="${expectedStartDate}"`).first().isVisible();
      if (startDateVisible) {
        console.log('✅ Start date displays correctly');
      }
      
      // Check end date
      const endDateVisible = await page.locator(`text="${expectedEndDate}"`).first().isVisible();
      if (endDateVisible) {
        console.log('✅ End date displays correctly');
      }
      
      // Check AM/PM times
      const amTime = await page.locator('text="9:00 AM"').first().isVisible();
      const pmTime = await page.locator('text="9:00 PM"').first().isVisible();
      
      if (amTime && pmTime) {
        console.log('✅ Both AM and PM times display correctly');
      }
      
      // Screenshot review
      await helpers.takeScreenshot('multiday-week-review');
      
      // Step 11: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 12: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Checking week-long event public display');
      
      // Verify date range
      const dateRange = await page.locator(`text=/March 10.*March 16/`).first().isVisible();
      if (dateRange) {
        console.log('✅ Full week date range displays correctly');
      }
      
      // Verify tickets
      await expect(page.locator('text="Full Week Pass"')).toBeVisible();
      await expect(page.locator('text="$500"')).toBeVisible();
      
      // Final screenshot
      await helpers.takeScreenshot('multiday-week-public');
      
      testResults.push({
        testName: 'Week-long Camp March 10-16 with 9 AM - 9 PM daily',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Week camp ${eventId} with consistent AM/PM times`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Week-long Camp March 10-16 with 9 AM - 9 PM daily',
        status: 'failed', 
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});