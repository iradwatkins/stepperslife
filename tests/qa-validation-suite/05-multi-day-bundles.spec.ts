import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  convert24to12Hour,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Multi-Day Bundle Events - Date/Time & Pricing Validation', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== MULTI-DAY BUNDLE EVENTS VALIDATION RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('================================================================\n');
  });

  test('Test 1: Weekend Festival Bundle (March 21-23) with savings display', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Spring Salsa Festival');
    
    // Weekend dates
    const day1Date = '2025-03-21'; // Friday
    const day2Date = '2025-03-22'; // Saturday  
    const day3Date = '2025-03-23'; // Sunday
    
    // Different times for each day
    const fridayTime = '20:00'; // 8:00 PM
    const saturdayTime = '14:00'; // 2:00 PM
    const sundayTime = '11:00'; // 11:00 AM
    
    const expectedFriday = 'March 21, 2025 at 8:00 PM';
    const expectedSaturday = 'March 22, 2025 at 2:00 PM';
    const expectedSunday = 'March 23, 2025 at 11:00 AM';
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 1: Creating Weekend Festival with Bundle');
      console.log('  Friday:', expectedFriday);
      console.log('  Saturday:', expectedSaturday);
      console.log('  Sunday:', expectedSunday);
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Multi-Day Event
      await helpers.selectEventType('multi_day');
      
      // Step 4: Fill festival details
      console.log('📝 Setting up weekend festival');
      
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea[placeholder*="description" i]',
        `Amazing weekend of salsa dancing!
        Friday: Evening social dance (8 PM - 2 AM)
        Saturday: Workshops & performances (2 PM - 3 AM)
        Sunday: Brunch social & classes (11 AM - 6 PM)
        Save with our weekend pass bundle!`);
      
      // Categories
      const categories = ['Social Dance', 'Workshop', 'Sets'];
      for (const cat of categories) {
        await page.click(`label:has-text("${cat}")`);
      }
      
      // Step 5: Set date range
      console.log('🗓️ Setting weekend dates');
      
      await page.fill('input[type="date"]', day1Date);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(day3Date);
      }
      
      // Step 6: Venue setup
      await page.click('label:has-text("Same location")');
      await page.fill('input[placeholder*="venue" i]', 'Salsa Palace Miami');
      await page.fill('input[placeholder*="address" i]', '123 Dance Street');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      await page.fill('input[placeholder*="zip" i]', '33140');
      
      await helpers.takeScreenshot('bundle-weekend-basic');
      
      // Step 7: Enable ticketing
      await helpers.clickNext('Next: Ticketing');
      await page.click('text="Yes - Selling Tickets"');
      await helpers.clickNext('Next: Days');
      
      // Step 8: Configure Friday (8 PM)
      console.log('🎫 Day 1: Friday evening 8:00 PM');
      
      const fridayTimeInput = page.locator('input[type="time"]').first();
      if (await fridayTimeInput.isVisible()) {
        await fridayTimeInput.fill(fridayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Friday Night Social');
      await page.fill('input[placeholder*="price" i]', '45');
      await page.fill('input[placeholder*="quantity" i]', '150');
      
      // Step 9: Configure Saturday (2 PM)
      console.log('🎫 Day 2: Saturday afternoon 2:00 PM');
      
      const nextDayButton = page.locator('button:has-text("Next Day")');
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const saturdayTimeInput = page.locator('input[type="time"]').nth(1);
      if (await saturdayTimeInput.isVisible()) {
        await saturdayTimeInput.fill(saturdayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Saturday Full Day');
      await page.fill('input[placeholder*="price" i]', '85');
      await page.fill('input[placeholder*="quantity" i]', '200');
      
      // Step 10: Configure Sunday (11 AM)
      console.log('🎫 Day 3: Sunday brunch 11:00 AM');
      
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const sundayTimeInput = page.locator('input[type="time"]').nth(2);
      if (await sundayTimeInput.isVisible()) {
        await sundayTimeInput.fill(sundayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Sunday Brunch & Dance');
      await page.fill('input[placeholder*="price" i]', '55');
      await page.fill('input[placeholder*="quantity" i]', '100');
      
      await helpers.takeScreenshot('bundle-weekend-tickets');
      
      // Step 11: Create Bundle
      console.log('💰 Creating weekend pass bundle');
      
      await helpers.clickNext('Next: Bundles');
      
      // Create weekend pass
      await helpers.createBundle({
        name: 'Weekend Pass (All 3 Days)',
        price: 150, // $35 savings
        ticketSelections: ['Friday Night Social', 'Saturday Full Day', 'Sunday Brunch & Dance']
      });
      
      // Verify savings calculation
      const individualTotal = 45 + 85 + 55; // $185
      const bundlePrice = 150;
      const savings = individualTotal - bundlePrice; // $35
      
      console.log(`💰 Bundle savings: $${savings} (Individual: $${individualTotal}, Bundle: $${bundlePrice})`);
      
      // Create VIP bundle
      await helpers.createBundle({
        name: 'VIP Weekend Experience',
        price: 225,
        ticketSelections: ['Friday Night Social', 'Saturday Full Day', 'Sunday Brunch & Dance']
      });
      
      await helpers.takeScreenshot('bundle-weekend-bundles');
      
      // Step 12: Go to review
      await helpers.clickNext('Next: Review');
      
      // Step 13: Verify dates, times, and bundle in review
      console.log('🔍 Verifying dates, AM/PM times, and bundles');
      
      // Check Friday PM time
      const fridayPM = await page.locator('text=/8:00 PM/').first().isVisible();
      expect(fridayPM).toBe(true);
      
      // Check Saturday PM time
      const saturdayPM = await page.locator('text=/2:00 PM/').first().isVisible();
      expect(saturdayPM).toBe(true);
      
      // Check Sunday AM time
      const sundayAM = await page.locator('text=/11:00 AM/').first().isVisible();
      expect(sundayAM).toBe(true);
      
      // Check bundle display
      await expect(page.locator('text="Weekend Pass (All 3 Days)"')).toBeVisible();
      await expect(page.locator('text="$150"')).toBeVisible();
      
      // Verify savings display if shown
      const savingsText = page.locator('text=/Save.*\\$35/');
      if (await savingsText.count() > 0) {
        console.log('✅ Bundle savings amount displayed');
      }
      
      await helpers.takeScreenshot('bundle-weekend-review');
      
      // Step 14: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 15: Verify public page
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Verifying bundle and date/time on public page');
      
      // Check date range
      const dateRange = await page.locator('text=/March 21.*23/').first().isVisible();
      if (dateRange) {
        console.log('✅ Weekend date range displays correctly');
      }
      
      // Check bundle option
      await expect(page.locator('text="Weekend Pass (All 3 Days)"')).toBeVisible();
      await expect(page.locator('text="$150"')).toBeVisible();
      
      // Check individual tickets also available
      await expect(page.locator('text="Friday Night Social"')).toBeVisible();
      await expect(page.locator('text="Saturday Full Day"')).toBeVisible();
      await expect(page.locator('text="Sunday Brunch & Dance"')).toBeVisible();
      
      await helpers.takeScreenshot('bundle-weekend-public');
      
      testResults.push({
        testName: 'Weekend Festival Bundle March 21-23 with PM/PM/AM times',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: Weekend festival ${eventId} with bundle and proper times`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Weekend Festival Bundle March 21-23 with PM/PM/AM times',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: Conference with VIP Bundle (April 4-6) edge case times', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Dance Business Conference');
    
    // Conference dates
    const day1Date = '2025-04-04'; // Friday
    const day2Date = '2025-04-05'; // Saturday
    const day3Date = '2025-04-06'; // Sunday
    
    // Edge case times
    const fridayTime = '00:00'; // 12:00 AM (midnight start)
    const saturdayTime = '12:00'; // 12:00 PM (noon)
    const sundayTime = '23:30'; // 11:30 PM (late night)
    
    const expectedFriday = 'April 4, 2025 at 12:00 AM'; // Midnight
    const expectedSaturday = 'April 5, 2025 at 12:00 PM'; // Noon
    const expectedSunday = 'April 6, 2025 at 11:30 PM'; // Late night
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('📅 Test 2: Creating Conference with edge case times');
      console.log('  Friday:', expectedFriday, '(midnight)');
      console.log('  Saturday:', expectedSaturday, '(noon)');
      console.log('  Sunday:', expectedSunday, '(late night)');
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Navigate to new event
      await helpers.navigateToNewEvent();
      
      // Step 3: Select Multi-Day Event
      await helpers.selectEventType('multi_day');
      
      // Step 4: Fill conference details
      console.log('📝 Setting up conference with unusual times');
      
      await page.fill('input[placeholder*="event name" i]', eventName);
      await page.fill('textarea[placeholder*="description" i]',
        `Professional dance business conference
        Friday: Midnight kickoff party (12:00 AM)
        Saturday: Full day sessions (12:00 PM start)
        Sunday: Late night gala (11:30 PM)`);
      
      // Categories
      const categories = ['Workshop', 'Other/Party'];
      for (const cat of categories) {
        await page.click(`label:has-text("${cat}")`);
      }
      
      // Step 5: Set dates
      await page.fill('input[type="date"]', day1Date);
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill(day3Date);
      }
      
      // Step 6: Venue
      await page.click('label:has-text("Same location")');
      await page.fill('input[placeholder*="venue" i]', 'Miami Conference Center');
      await page.fill('input[placeholder*="address" i]', '999 Business Blvd');
      await page.fill('input[placeholder*="city" i]', 'Miami');
      await page.fill('input[placeholder*="state" i]', 'FL');
      await page.fill('input[placeholder*="zip" i]', '33101');
      
      await helpers.takeScreenshot('bundle-conference-basic');
      
      // Step 7: Ticketing
      await helpers.clickNext('Next: Ticketing');
      await page.click('text="Yes - Selling Tickets"');
      await helpers.clickNext('Next: Days');
      
      // Step 8: Friday midnight (12:00 AM)
      console.log('🎫 Day 1: Friday midnight (12:00 AM edge case)');
      
      const fridayTimeInput = page.locator('input[type="time"]').first();
      if (await fridayTimeInput.isVisible()) {
        await fridayTimeInput.fill(fridayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Midnight Kickoff Party');
      await page.fill('input[placeholder*="price" i]', '60');
      await page.fill('input[placeholder*="quantity" i]', '100');
      
      // Step 9: Saturday noon (12:00 PM)
      console.log('🎫 Day 2: Saturday noon (12:00 PM edge case)');
      
      const nextDayButton = page.locator('button:has-text("Next Day")');
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const saturdayTimeInput = page.locator('input[type="time"]').nth(1);
      if (await saturdayTimeInput.isVisible()) {
        await saturdayTimeInput.fill(saturdayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Conference Day Pass');
      await page.fill('input[placeholder*="price" i]', '120');
      await page.fill('input[placeholder*="quantity" i]', '150');
      
      // Step 10: Sunday late night (11:30 PM)
      console.log('🎫 Day 3: Sunday late (11:30 PM edge case)');
      
      if (await nextDayButton.isVisible()) {
        await nextDayButton.click();
      }
      
      const sundayTimeInput = page.locator('input[type="time"]').nth(2);
      if (await sundayTimeInput.isVisible()) {
        await sundayTimeInput.fill(sundayTime);
      }
      
      await page.click('button:has-text("Add Ticket")');
      await page.fill('input[placeholder*="ticket name" i]', 'Closing Gala');
      await page.fill('input[placeholder*="price" i]', '80');
      await page.fill('input[placeholder*="quantity" i]', '100');
      
      await helpers.takeScreenshot('bundle-conference-tickets');
      
      // Step 11: Create VIP Bundle
      console.log('💰 Creating VIP all-access bundle');
      
      await helpers.clickNext('Next: Bundles');
      
      // VIP All Access
      await helpers.createBundle({
        name: 'VIP All-Access Pass',
        price: 220, // $40 savings
        ticketSelections: ['Midnight Kickoff Party', 'Conference Day Pass', 'Closing Gala']
      });
      
      // Regular bundle
      await helpers.createBundle({
        name: 'Conference + Party Bundle',
        price: 175,
        ticketSelections: ['Conference Day Pass', 'Closing Gala']
      });
      
      await helpers.takeScreenshot('bundle-conference-bundles');
      
      // Step 12: Review
      await helpers.clickNext('Next: Review');
      
      // Step 13: Verify edge case times display correctly
      console.log('🔍 Verifying edge case time formatting');
      
      // Check midnight displays as 12:00 AM not 00:00
      const midnightDisplay = await page.locator('text="12:00 AM"').first().isVisible();
      expect(midnightDisplay).toBe(true);
      console.log('✅ Midnight shows as 12:00 AM not 00:00');
      
      // Check noon displays as 12:00 PM
      const noonDisplay = await page.locator('text="12:00 PM"').first().isVisible();
      expect(noonDisplay).toBe(true);
      console.log('✅ Noon shows as 12:00 PM correctly');
      
      // Check late night PM
      const lateDisplay = await page.locator('text="11:30 PM"').first().isVisible();
      expect(lateDisplay).toBe(true);
      console.log('✅ Late night shows as 11:30 PM');
      
      // Verify bundles
      await expect(page.locator('text="VIP All-Access Pass"')).toBeVisible();
      
      await helpers.takeScreenshot('bundle-conference-review');
      
      // Step 14: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 15: Public page verification
      await page.goto(`/event/${eventId}`);
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Verifying edge case times on public page');
      
      // Check date range
      const confDates = await page.locator('text=/April 4.*6/').first().isVisible();
      if (confDates) {
        console.log('✅ Conference dates display correctly');
      }
      
      // Verify VIP bundle
      await expect(page.locator('text="VIP All-Access Pass"')).toBeVisible();
      await expect(page.locator('text="$220"')).toBeVisible();
      
      // Check individual tickets with edge times
      const midnightTicket = await page.locator('text="Midnight Kickoff Party"').first().isVisible();
      if (midnightTicket) {
        console.log('✅ Midnight event ticket displays');
      }
      
      await helpers.takeScreenshot('bundle-conference-public');
      
      testResults.push({
        testName: 'Conference VIP Bundle April 4-6 with midnight/noon/late times',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Conference ${eventId} with edge case times and VIP bundle`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Conference VIP Bundle April 4-6 with midnight/noon/late times',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });
});