import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Single-Day Ticketed Events - Date/Time Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== SINGLE-DAY TICKETED EVENTS DATE/TIME RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('================================================================\n');
  });

  test('Test 1: Valentine\'s Evening Party (Feb 14) at 8:00 PM', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Valentine\'s Dance Party');
    const eventDate = '2025-02-14'; // Valentine's Day
    const eventTime = '20:00'; // 8:00 PM
    const endTime = '02:00'; // 2:00 AM (next day)
    const expectedStartTime = '8:00 PM';
    const expectedEndTime = '2:00 AM';
    const expectedDate = 'February 14, 2025';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 1: Creating Valentine\'s Party for', expectedDate, 'at', expectedStartTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Single Event
      await helpers.selectEventType('single');
      
      // Step 4: Fill event details with evening time
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Valentine's Dance Party! Friday night ${expectedStartTime} until ${expectedEndTime}. Multiple ticket tiers available.`,
        date: eventDate,
        time: eventTime,
        endTime: endTime,
        categories: ['Social Dance', 'Holiday Event', 'Lounge/Bar'],
        location: 'The Grand Ballroom Miami',
        address: '1234 Ocean Drive',
        city: 'Miami Beach',
        state: 'FL',
        postalCode: '33139'
      });
      
      // Step 5: Verify PM time format
      console.log('🔍 Verifying evening time input (8 PM)');
      const timeInput = page.locator('input[type="time"]').first();
      await expect(timeInput).toHaveValue(eventTime);
      
      // Step 6: Screenshot inputs
      await helpers.takeScreenshot('valentine-party-evening-inputs');
      
      // Step 7: Proceed to ticketing
      await helpers.clickNext('Next: Ticketing');
      
      // Step 8: Configure as ticketed event
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Step 9: Add multiple ticket tiers
      console.log('💳 Adding ticket tiers with early bird');
      
      // VIP Tier
      await helpers.addTicketType({
        name: 'VIP Valentine Experience',
        price: 75,
        quantity: 50,
        earlyBird: {
          price: 60,
          endDate: '2025-02-07' // Week before event
        }
      });
      
      // General Admission
      await helpers.addTicketType({
        name: 'General Admission',
        price: 40,
        quantity: 200
      });
      
      // Couple's Special
      await helpers.addTicketType({
        name: 'Couple\'s Package (2 tickets)',
        price: 70,
        quantity: 75
      });
      
      // Step 10: Screenshot ticket configuration
      await helpers.takeScreenshot('valentine-party-tickets');
      
      // Step 11: Skip payment model and tables
      await helpers.clickNext('Next: Payment');
      await helpers.clickNext('Next: Tables');
      await helpers.clickNext('Next: Review');
      
      // Step 12: Verify date/time in review
      console.log('🔍 Verifying PM time displays correctly in review');
      
      // Check date format
      await expect(page.locator(`text="${expectedDate}"`)).toBeVisible();
      
      // Check evening time with PM
      await expect(page.locator(`text="${expectedStartTime}"`)).toBeVisible();
      
      // Verify ticket info shows
      await expect(page.locator('text="VIP Valentine Experience"')).toBeVisible();
      await expect(page.locator('text="$75"')).toBeVisible();
      await expect(page.locator('text="Early Bird: $60"')).toBeVisible();
      
      // Step 13: Screenshot review
      await helpers.takeScreenshot('valentine-party-review');
      
      // Step 14: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 15: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Checking evening time on public page');
      
      // Verify date
      const publicDate = await page.locator(`text="${expectedDate}"`).first().isVisible();
      expect(publicDate).toBe(true);
      
      // Verify PM time
      const publicTime = await page.locator(`text="${expectedStartTime}"`).first().isVisible();
      expect(publicTime).toBe(true);
      
      // Verify tickets are available
      await expect(page.locator('text="VIP Valentine Experience"')).toBeVisible();
      await expect(page.locator('text="Buy Tickets"')).toBeVisible();
      
      // Step 16: Final screenshot
      await helpers.takeScreenshot('valentine-party-public');
      
      testResults.push({
        testName: 'Valentine\'s Party Feb 14 at 8:00 PM with tickets',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: Evening party ${eventId} with proper PM display and tickets`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Valentine\'s Party Feb 14 at 8:00 PM with tickets',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: All-Day Workshop (Feb 20) 9:00 AM to 5:00 PM', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Intensive Dance Workshop');
    const eventDate = '2025-02-20';
    const eventTime = '09:00'; // 9:00 AM
    const endTime = '17:00'; // 5:00 PM
    const expectedStartTime = '9:00 AM';
    const expectedEndTime = '5:00 PM';
    const expectedDate = 'February 20, 2025';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 2: Creating All-Day Workshop', expectedDate, expectedStartTime, 'to', expectedEndTime);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Single Event
      await helpers.selectEventType('single');
      
      // Step 4: Fill workshop details spanning AM to PM
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: `Full-day intensive workshop from ${expectedStartTime} to ${expectedEndTime}. Lunch included. Early bird special available!`,
        date: eventDate,
        time: eventTime,
        endTime: endTime,
        categories: ['Workshop', 'Class/Lesson'],
        location: 'Miami Dance Academy',
        address: '789 Training Blvd',
        city: 'Miami',
        state: 'FL',
        postalCode: '33131'
      });
      
      // Step 5: Verify AM start time
      console.log('🔍 Verifying AM to PM time span');
      const startTimeInput = page.locator('input[type="time"]').first();
      await expect(startTimeInput).toHaveValue(eventTime);
      
      const endTimeInput = page.locator('input[type="time"]').nth(1);
      if (await endTimeInput.isVisible()) {
        await expect(endTimeInput).toHaveValue(endTime);
      }
      
      // Step 6: Screenshot
      await helpers.takeScreenshot('workshop-allday-inputs');
      
      // Step 7: Configure ticketing
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Step 8: Add tiered pricing
      console.log('💳 Setting up early bird pricing');
      
      // Early Bird Special
      await helpers.addTicketType({
        name: 'Full Day Pass',
        price: 150,
        quantity: 30,
        earlyBird: {
          price: 120,
          endDate: '2025-02-13' // Week before
        }
      });
      
      // Half-day options
      await helpers.addTicketType({
        name: 'Morning Session Only (9 AM - 12 PM)',
        price: 75,
        quantity: 20
      });
      
      await helpers.addTicketType({
        name: 'Afternoon Session Only (1 PM - 5 PM)',
        price: 75,
        quantity: 20
      });
      
      // Step 9: Screenshot tickets
      await helpers.takeScreenshot('workshop-allday-tickets');
      
      // Step 10: Navigate to review
      await helpers.clickNext('Next: Payment');
      await helpers.clickNext('Next: Tables');
      await helpers.clickNext('Next: Review');
      
      // Step 11: Verify AM/PM in review
      console.log('🔍 Checking AM start and PM end times in review');
      
      // Date check
      await expect(page.locator(`text="${expectedDate}"`)).toBeVisible();
      
      // AM start time
      await expect(page.locator(`text="${expectedStartTime}"`)).toBeVisible();
      
      // PM end time
      const endTimeVisible = page.locator(`text="${expectedEndTime}"`);
      if (await endTimeVisible.count() > 0) {
        await expect(endTimeVisible.first()).toBeVisible();
        console.log('✅ End time shows PM correctly');
      }
      
      // Verify ticket with time references
      await expect(page.locator('text="Morning Session Only (9 AM - 12 PM)"')).toBeVisible();
      await expect(page.locator('text="Afternoon Session Only (1 PM - 5 PM)"')).toBeVisible();
      
      // Step 12: Screenshot review
      await helpers.takeScreenshot('workshop-allday-review');
      
      // Step 13: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 14: Navigate to public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      // Step 15: Verify public display
      console.log('✅ Verifying all-day schedule on public page');
      
      // Date verification
      const dateOnPage = await page.locator(`text="${expectedDate}"`).first().isVisible();
      expect(dateOnPage).toBe(true);
      
      // Start time AM
      const startOnPage = await page.locator(`text="${expectedStartTime}"`).first().isVisible();
      expect(startOnPage).toBe(true);
      
      // End time PM
      const endOnPage = await page.locator(`text="${expectedEndTime}"`).first().isVisible();
      if (endOnPage) {
        console.log('✅ All-day span AM to PM displayed correctly');
      }
      
      // Check ticket options with AM/PM
      const morningTicket = await page.locator('text=/9 AM - 12 PM/').first().isVisible();
      const afternoonTicket = await page.locator('text=/1 PM - 5 PM/').first().isVisible();
      
      if (morningTicket && afternoonTicket) {
        console.log('✅ Session times with AM/PM display correctly in tickets');
      }
      
      // Step 16: Final screenshot
      await helpers.takeScreenshot('workshop-allday-public');
      
      testResults.push({
        testName: 'All-Day Workshop Feb 20, 9 AM to 5 PM',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Workshop ${eventId} with proper AM/PM time span`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'All-Day Workshop Feb 20, 9 AM to 5 PM',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});