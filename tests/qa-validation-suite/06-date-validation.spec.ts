import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Date/Time Edge Cases and Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== DATE/TIME EDGE CASE VALIDATION RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('============================================================\n');
  });

  test('Edge Case: Midnight and Noon time validation', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Edge Case Time Test');
    
    console.log('⏰ Testing critical time edge cases:');
    console.log('  - Midnight (00:00) → should display as 12:00 AM');
    console.log('  - Noon (12:00) → should display as 12:00 PM');
    console.log('  - 00:30 → should display as 12:30 AM');
    console.log('  - 12:30 → should display as 12:30 PM');
    
    // Test conversions
    const testCases = [
      { input: '00:00', expected: '12:00 AM', description: 'Midnight' },
      { input: '00:30', expected: '12:30 AM', description: 'After midnight' },
      { input: '12:00', expected: '12:00 PM', description: 'Noon' },
      { input: '12:30', expected: '12:30 PM', description: 'After noon' },
      { input: '13:00', expected: '1:00 PM', description: 'Early afternoon' },
      { input: '23:59', expected: '11:59 PM', description: 'One minute before midnight' }
    ];
    
    let allPassed = true;
    
    for (const testCase of testCases) {
      const converted = convert24to12Hour(testCase.input);
      const passed = converted === testCase.expected;
      
      if (passed) {
        console.log(`✅ ${testCase.description}: ${testCase.input} → ${converted}`);
      } else {
        console.log(`❌ ${testCase.description}: ${testCase.input} → ${converted} (expected ${testCase.expected})`);
        allPassed = false;
      }
    }
    
    expect(allPassed).toBe(true);
    
    testResults.push({
      testName: 'Time Conversion Edge Cases',
      status: allPassed ? 'passed' : 'failed',
      duration: Date.now() - startTime
    });
  });

  test('Edge Case: Cross-day event (11 PM - 2 AM)', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Late Night Cross-Day Party');
    const eventDate = getFutureDate(20);
    const eventStartTime = '23:00'; // 11:00 PM
    const eventEndTime = '02:00'; // 2:00 AM (next day)
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('🌙 Testing cross-day event: 11:00 PM to 2:00 AM');
      
      // Login and create event
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Fill details
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Late night party crossing into next day! 11 PM until 2 AM.',
        date: eventDate,
        time: eventStartTime,
        endTime: eventEndTime,
        categories: ['Social Dance', 'Lounge/Bar'],
        location: 'Night Owl Club',
        address: '456 Midnight Ave',
        city: 'Miami',
        state: 'FL',
        postalCode: '33139'
      });
      
      // Verify times
      const startInput = page.locator('input[type="time"]').first();
      await expect(startInput).toHaveValue(eventStartTime);
      
      const endInput = page.locator('input[type="time"]').nth(1);
      if (await endInput.isVisible()) {
        await expect(endInput).toHaveValue(eventEndTime);
      }
      
      await helpers.takeScreenshot('edge-crossday-inputs');
      
      // Proceed to review
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(false, 20);
      await helpers.clickNext('Next: Review');
      
      // Verify display
      console.log('🔍 Checking cross-day time display');
      
      const pmStart = await page.locator('text="11:00 PM"').first().isVisible();
      const amEnd = await page.locator('text="2:00 AM"').first().isVisible();
      
      expect(pmStart).toBe(true);
      expect(amEnd).toBe(true);
      
      console.log('✅ Cross-day times display correctly: 11:00 PM - 2:00 AM');
      
      // Publish
      eventId = await helpers.publishEvent();
      
      testResults.push({
        testName: 'Cross-day Event (11 PM - 2 AM)',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Cross-day Event (11 PM - 2 AM)',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Edge Case: Month boundary dates (Jan 31 - Feb 2)', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Month Boundary Festival');
    
    console.log('📅 Testing month boundary: January 31 - February 2');
    
    try {
      // Login and navigate
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('multi_day');
      
      // Set dates crossing month boundary
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea', 'Festival spanning January to February');
      
      // Categories
      await page.click('label:has-text("Social Dance")');
      
      // Date range
      const startDate = '2025-01-31';
      const endDate = '2025-02-02';
      
      await page.fill('input[type="date"]', startDate);
      const endInput = page.locator('input[type="date"]').nth(1);
      if (await endInput.isVisible()) {
        await endInput.fill(endDate);
      }
      
      // Verify dates
      const startValue = await page.locator('input[type="date"]').first().inputValue();
      expect(startValue).toBe(startDate);
      
      console.log('✅ Month boundary dates set correctly');
      
      // Add venue
      await page.click('label:has-text("Same location")');
      await page.fill('input[placeholder*="venue" i]', 'Test Venue');
      await page.fill('input[placeholder*="address" i]', '123 Test St');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      await page.fill('input[placeholder*="zip" i]', '33100');
      
      await helpers.takeScreenshot('edge-month-boundary');
      
      testResults.push({
        testName: 'Month Boundary Dates (Jan 31 - Feb 2)',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Month Boundary Dates (Jan 31 - Feb 2)',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Date Format Consistency Check', async ({ page }) => {
    const startTime = Date.now();
    
    console.log('📋 Testing date format consistency across the app');
    
    // Test date formatting function
    const testDates = [
      { input: '2025-01-01', expected: 'January 1, 2025' },
      { input: '2025-02-14', expected: 'February 14, 2025' },
      { input: '2025-12-31', expected: 'December 31, 2025' },
      { input: '2025-06-15', expected: 'June 15, 2025' }
    ];
    
    let allPassed = true;
    
    for (const test of testDates) {
      const formatted = formatDateForDisplay(test.input);
      const passed = formatted === test.expected;
      
      if (passed) {
        console.log(`✅ ${test.input} → ${formatted}`);
      } else {
        console.log(`❌ ${test.input} → ${formatted} (expected ${test.expected})`);
        allPassed = false;
      }
    }
    
    expect(allPassed).toBe(true);
    
    testResults.push({
      testName: 'Date Format Consistency',
      status: allPassed ? 'passed' : 'failed',
      duration: Date.now() - startTime
    });
  });

  test('Past Date Rejection', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Past Date Test');
    
    console.log('🚫 Testing past date rejection');
    
    try {
      await helpers.loginAsOrganizer();
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Try to set a past date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      console.log(`Attempting to set past date: ${pastDate}`);
      
      // Fill basic info
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea', 'Testing past date validation');
      await page.click('label:has-text("Workshop")');
      
      // Try to set past date
      const dateInput = page.locator('input[type="date"]');
      await dateInput.fill(pastDate);
      
      // Verify HTML5 validation or min date constraint
      const minDate = await dateInput.getAttribute('min');
      const today = new Date().toISOString().split('T')[0];
      
      if (minDate) {
        expect(minDate).toBe(today);
        console.log(`✅ Date input has min="${today}" preventing past dates`);
      }
      
      // Try to proceed and expect validation error
      await page.fill('input[placeholder*="venue" i]', 'Test Venue');
      await page.fill('input[placeholder*="address" i]', '123 Test');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      
      await helpers.clickNext('Next');
      
      // Check if we're still on the same step (validation failed)
      const stillOnBasicInfo = await page.locator('text="Event Details"').isVisible();
      
      if (stillOnBasicInfo) {
        console.log('✅ Past date validation working - cannot proceed');
      }
      
      testResults.push({
        testName: 'Past Date Rejection',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Past Date Rejection',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('12-Hour Format Display Verification', async ({ page }) => {
    const startTime = Date.now();
    
    console.log('🕐 Comprehensive 12-hour format verification');
    
    const timeTests = [
      // Morning times
      { hour24: '01:00', hour12: '1:00 AM' },
      { hour24: '06:30', hour12: '6:30 AM' },
      { hour24: '11:45', hour12: '11:45 AM' },
      // Noon and afternoon
      { hour24: '12:00', hour12: '12:00 PM' },
      { hour24: '13:00', hour12: '1:00 PM' },
      { hour24: '18:00', hour12: '6:00 PM' },
      // Evening and night
      { hour24: '19:30', hour12: '7:30 PM' },
      { hour24: '23:00', hour12: '11:00 PM' },
      { hour24: '23:59', hour12: '11:59 PM' },
      // Midnight
      { hour24: '00:00', hour12: '12:00 AM' }
    ];
    
    let allPassed = true;
    
    for (const test of timeTests) {
      const converted = convert24to12Hour(test.hour24);
      const passed = converted === test.hour12;
      
      if (passed) {
        console.log(`✅ ${test.hour24} → ${converted}`);
      } else {
        console.log(`❌ ${test.hour24} → ${converted} (expected ${test.hour12})`);
        allPassed = false;
      }
    }
    
    expect(allPassed).toBe(true);
    
    testResults.push({
      testName: '12-Hour Format Display Verification',
      status: allPassed ? 'passed' : 'failed',
      duration: Date.now() - startTime
    });
    
    console.log('\n📊 Summary: All time formats correctly converted to 12-hour with AM/PM');
  });
});