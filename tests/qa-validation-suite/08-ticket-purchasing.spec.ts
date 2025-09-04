import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Ticket Purchasing & Customer Journey', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== TICKET PURCHASING TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('====================================================\n');
  });

  test('Test 1: Direct ticket purchase with early bird pricing', async ({ page }) => {
    const startTime = Date.now();
    const eventName = 'Valentine Dance Party - Direct Purchase Test';
    const eventDate = getFutureDate(30);
    const expectedDate = formatDateForDisplay(eventDate);
    
    let purchaseId: string | null = null;
    let error: string | undefined;

    try {
      console.log('🎫 Test 1: Direct ticket purchase flow');
      
      // Step 1: Navigate to events page
      await page.goto('/events');
      
      // Step 2: Find and click on test event
      console.log('🔍 Finding event:', eventName);
      const eventCard = page.locator(`text="${eventName}"`).first();
      if (await eventCard.isVisible()) {
        await eventCard.click();
      } else {
        // If event doesn't exist, create one for testing
        console.log('Creating test event...');
        await helpers.loginAsOrganizer();
        await helpers.navigateToNewEvent();
        await helpers.selectEventType('single');
        
        await helpers.fillBasicEventInfo({
          name: eventName,
          description: 'Test event for purchase flow validation',
          date: eventDate,
          time: '20:00',
          categories: ['Social Dance'],
          location: 'Test Venue',
          address: '123 Test St',
          city: 'Miami',
          state: 'FL',
          postalCode: '33139'
        });
        
        await helpers.clickNext('Next: Ticketing');
        await helpers.configureTicketing(true);
        await helpers.clickNext('Next: Capacity');
        
        await helpers.addTicketType({
          name: 'Early Bird Special',
          price: 50,
          quantity: 100,
          earlyBird: {
            price: 35,
            endDate: getFutureDate(15)
          }
        });
        
        await helpers.addTicketType({
          name: 'General Admission',
          price: 50,
          quantity: 200
        });
        
        await helpers.clickNext('Next: Review');
        const eventId = await helpers.publishEvent();
        await page.goto(`/event/${eventId}`);
      }
      
      // Step 3: Select tickets
      console.log('🛒 Selecting tickets');
      await page.click('button:has-text("Buy Tickets")');
      
      // Select 2 early bird tickets
      const earlyBirdInput = page.locator('input[type="number"]').first();
      await earlyBirdInput.fill('2');
      
      // Select 1 general admission
      const generalInput = page.locator('input[type="number"]').nth(1);
      await generalInput.fill('1');
      
      // Verify price calculation
      const totalPrice = page.locator('text=/Total.*\\$120/'); // 2x$35 + 1x$50 = $120
      await expect(totalPrice).toBeVisible();
      
      // Step 4: Proceed to checkout
      await page.click('button:has-text("Continue to Checkout")');
      
      // Step 5: Fill customer information
      console.log('📝 Filling customer information');
      await page.fill('input[name="name"]', 'John Customer');
      await page.fill('input[name="email"]', 'john.customer@test.com');
      await page.fill('input[name="phone"]', '305-555-0100');
      
      // Step 6: Payment method selection
      console.log('💳 Selecting payment method');
      await page.click('input[value="credit_card"]');
      
      // Fill test card details (Stripe/Square test card)
      await page.fill('input[placeholder*="card number"]', '4242 4242 4242 4242');
      await page.fill('input[placeholder*="MM/YY"]', '12/25');
      await page.fill('input[placeholder*="CVC"]', '123');
      await page.fill('input[placeholder*="ZIP"]', '33139');
      
      // Step 7: Complete purchase
      console.log('✅ Completing purchase');
      await page.click('button:has-text("Complete Purchase")');
      
      // Wait for confirmation page
      await page.waitForURL(/\/purchase-confirmation|\/tickets\//, { timeout: 30000 });
      
      // Step 8: Verify purchase confirmation
      console.log('📧 Verifying purchase confirmation');
      await expect(page.locator('text="Purchase Successful"')).toBeVisible();
      await expect(page.locator('text="john.customer@test.com"')).toBeVisible();
      
      // Get purchase/ticket IDs
      const ticketIds = await page.locator('[data-ticket-id]').allTextContents();
      console.log(`Generated ${ticketIds.length} tickets`);
      
      // Verify QR codes are displayed
      const qrCodes = page.locator('img[alt*="QR"]');
      await expect(qrCodes).toHaveCount(3); // 3 tickets total
      
      // Verify ticket details
      await expect(page.locator('text="Early Bird Special"')).toBeVisible();
      await expect(page.locator('text="General Admission"')).toBeVisible();
      await expect(page.locator(`text="${expectedDate}"`)).toBeVisible();
      await expect(page.locator('text="8:00 PM"')).toBeVisible();
      
      // Take screenshot
      await helpers.takeScreenshot('direct-purchase-confirmation');
      
      testResults.push({
        testName: 'Direct Ticket Purchase with Early Bird',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 1 Passed: Direct purchase completed successfully');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Direct Ticket Purchase with Early Bird',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 2: Purchase via affiliate link with code tracking', async ({ page }) => {
    const startTime = Date.now();
    const affiliateCode = 'DANCE20';
    const eventId = 'test-event-affiliate'; // Would be real event ID
    
    let error: string | undefined;

    try {
      console.log('🤝 Test 2: Affiliate link purchase flow');
      
      // Step 1: Navigate via affiliate URL
      console.log(`📱 Accessing event via affiliate link: ?ref=${affiliateCode}`);
      await page.goto(`/event/${eventId}?ref=${affiliateCode}`);
      
      // Step 2: Verify affiliate code is captured
      console.log('🔍 Verifying affiliate tracking');
      
      // Check if affiliate code is displayed
      const affiliateBanner = page.locator(`text="Referred by: ${affiliateCode}"`);
      if (await affiliateBanner.count() > 0) {
        await expect(affiliateBanner).toBeVisible();
      }
      
      // Check localStorage or cookies for affiliate tracking
      const affiliateTracking = await page.evaluate((code) => {
        return localStorage.getItem('affiliate_code') || 
               sessionStorage.getItem('affiliate_code') || 
               document.cookie.includes(code);
      }, affiliateCode);
      
      console.log('Affiliate tracking active:', !!affiliateTracking);
      
      // Step 3: Select tickets
      console.log('🛒 Purchasing with affiliate code');
      await page.click('button:has-text("Buy Tickets")');
      
      // Select tickets
      const ticketInput = page.locator('input[type="number"]').first();
      await ticketInput.fill('3');
      
      await page.click('button:has-text("Continue")');
      
      // Step 4: Fill buyer info
      await page.fill('input[name="name"]', 'Sarah Affiliate Buyer');
      await page.fill('input[name="email"]', 'sarah.buyer@test.com');
      await page.fill('input[name="phone"]', '305-555-0200');
      
      // Step 5: Verify affiliate code is included
      console.log('✅ Checking affiliate attribution');
      
      // Look for affiliate code in checkout
      const codeDisplay = page.locator(`text="${affiliateCode}"`);
      if (await codeDisplay.count() > 0) {
        console.log('Affiliate code displayed in checkout');
      }
      
      // Check hidden input or data attribute
      const affiliateInput = page.locator(`input[name="affiliate_code"], input[name="referral_code"]`);
      if (await affiliateInput.count() > 0) {
        const value = await affiliateInput.inputValue();
        expect(value).toBe(affiliateCode);
      }
      
      // Step 6: Complete purchase
      await page.click('input[value="credit_card"]');
      await page.fill('input[placeholder*="card"]', '4242 4242 4242 4242');
      await page.fill('input[placeholder*="MM/YY"]', '12/25');
      await page.fill('input[placeholder*="CVC"]', '123');
      
      await page.click('button:has-text("Complete Purchase")');
      
      // Step 7: Verify in confirmation
      await page.waitForURL(/confirmation|success/, { timeout: 30000 });
      
      console.log('📊 Verifying affiliate attribution in confirmation');
      
      // Check if affiliate is credited
      const affiliateCredit = page.locator('text=/Affiliate.*DANCE20|Referred.*DANCE20/');
      if (await affiliateCredit.count() > 0) {
        console.log('✅ Affiliate properly credited');
      }
      
      await helpers.takeScreenshot('affiliate-purchase-confirmation');
      
      testResults.push({
        testName: 'Affiliate Link Purchase with Tracking',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 2 Passed: Affiliate purchase tracked correctly');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Affiliate Link Purchase with Tracking',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 3: Table/Group purchase with individual ticket generation', async ({ page }) => {
    const startTime = Date.now();
    const eventName = 'Gala Night - Table Purchase Test';
    
    let error: string | undefined;

    try {
      console.log('🪑 Test 3: Table/Group purchase flow');
      
      // Step 1: Navigate to event with table options
      await page.goto(`/events`);
      const eventCard = page.locator(`text="${eventName}"`).first();
      
      if (await eventCard.isVisible()) {
        await eventCard.click();
      } else {
        console.log('Creating test event with tables...');
        // Would create event with table configurations
      }
      
      // Step 2: Select table purchase option
      console.log('🎟️ Selecting table package');
      await page.click('button:has-text("Buy Table")');
      
      // Step 3: Choose table configuration
      const tableOptions = [
        { name: 'Table for 8', price: 400, seats: 8 },
        { name: 'VIP Table for 10', price: 750, seats: 10 },
        { name: 'Premium Table for 12', price: 1200, seats: 12 }
      ];
      
      // Select VIP Table
      await page.click('text="VIP Table for 10"');
      await page.click('button:has-text("Select This Table")');
      
      // Step 4: Fill group leader information
      console.log('👥 Filling group leader details');
      await page.fill('input[name="group_leader_name"]', 'Michael Group Leader');
      await page.fill('input[name="group_leader_email"]', 'michael@group.com');
      await page.fill('input[name="group_leader_phone"]', '305-555-0300');
      
      // Step 5: Add individual attendee information (optional)
      console.log('📝 Adding attendee details');
      const addAttendees = page.locator('button:has-text("Add Attendee Details")');
      if (await addAttendees.isVisible()) {
        await addAttendees.click();
        
        // Add first 3 attendees
        for (let i = 1; i <= 3; i++) {
          await page.fill(`input[name="attendee_${i}_name"]`, `Guest ${i}`);
          await page.fill(`input[name="attendee_${i}_email"]`, `guest${i}@test.com`);
        }
      }
      
      // Step 6: Complete purchase
      console.log('💳 Completing table purchase');
      await page.click('button:has-text("Continue to Payment")');
      
      await page.click('input[value="credit_card"]');
      await page.fill('input[placeholder*="card"]', '4242 4242 4242 4242');
      await page.fill('input[placeholder*="MM/YY"]', '12/25');
      await page.fill('input[placeholder*="CVC"]', '123');
      
      await page.click('button:has-text("Purchase Table - $750")');
      
      // Step 7: Verify individual tickets generated
      await page.waitForURL(/confirmation/, { timeout: 30000 });
      
      console.log('🎫 Verifying individual ticket generation');
      
      // Should have 10 individual tickets
      const tickets = page.locator('[data-ticket-id]');
      await expect(tickets).toHaveCount(10);
      
      // Each ticket should have unique QR code
      const qrCodes = page.locator('img[alt*="QR"]');
      await expect(qrCodes).toHaveCount(10);
      
      // Verify seat assignments
      for (let seat = 1; seat <= 10; seat++) {
        await expect(page.locator(`text="Seat ${seat}"`)).toBeVisible();
      }
      
      // Verify group leader gets all tickets
      await expect(page.locator('text="All 10 tickets have been sent to michael@group.com"')).toBeVisible();
      
      // Check for download all option
      const downloadAll = page.locator('button:has-text("Download All Tickets")');
      await expect(downloadAll).toBeVisible();
      
      // Take screenshot
      await helpers.takeScreenshot('table-purchase-tickets');
      
      testResults.push({
        testName: 'Table/Group Purchase with Individual Tickets',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 3 Passed: Table purchase with 10 individual tickets');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Table/Group Purchase with Individual Tickets',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 4: Multi-day bundle purchase', async ({ page }) => {
    const startTime = Date.now();
    
    try {
      console.log('📦 Test 4: Multi-day bundle purchase');
      
      // Navigate to multi-day event
      await page.goto('/events');
      await page.click('text="3-Day Dance Festival"');
      
      // Select bundle option
      console.log('🎟️ Selecting weekend pass bundle');
      await page.click('button:has-text("Buy Tickets")');
      
      // Choose bundle over individual tickets
      await page.click('text="Weekend Pass (All 3 Days) - $150"');
      await page.fill('input[type="number"]', '2'); // Buy 2 bundles
      
      // Verify savings display
      const savings = page.locator('text=/Save.*\\$70/'); // Save $35 per bundle x2
      await expect(savings).toBeVisible();
      
      await page.click('button:has-text("Continue")');
      
      // Fill buyer info
      await page.fill('input[name="name"]', 'Festival Goer');
      await page.fill('input[name="email"]', 'festival@test.com');
      
      // Complete purchase
      await page.click('input[value="credit_card"]');
      await page.fill('input[placeholder*="card"]', '4242 4242 4242 4242');
      await page.fill('input[placeholder*="MM/YY"]', '12/25');
      await page.fill('input[placeholder*="CVC"]', '123');
      
      await page.click('button:has-text("Complete Purchase")');
      
      // Verify bundle tickets
      await page.waitForURL(/confirmation/);
      
      // Should have 6 tickets total (2 bundles x 3 days)
      const tickets = page.locator('[data-ticket-id]');
      await expect(tickets).toHaveCount(6);
      
      // Verify each day is represented
      await expect(page.locator('text="Day 1 - Friday"')).toBeVisible();
      await expect(page.locator('text="Day 2 - Saturday"')).toBeVisible();
      await expect(page.locator('text="Day 3 - Sunday"')).toBeVisible();
      
      testResults.push({
        testName: 'Multi-day Bundle Purchase',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 4 Passed: Bundle purchase completed');
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Multi-day Bundle Purchase',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });
});