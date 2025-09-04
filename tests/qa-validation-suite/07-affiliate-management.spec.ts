import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Affiliate Program Management', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== AFFILIATE PROGRAM TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('===================================================\n');
  });

  test('Test 1: Setup event with affiliate program and flat fee commission', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Dance Party with Affiliates');
    const eventDate = getFutureDate(30);
    const eventTime = '20:00'; // 8:00 PM
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('🤝 Test 1: Creating event with affiliate program (flat fee)');
      
      // Step 1: Login as organizer
      await helpers.loginAsOrganizer();
      
      // Step 2: Create new event
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Step 3: Fill event details
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Amazing dance party with affiliate program! Earn $10 per ticket sold.',
        date: eventDate,
        time: eventTime,
        categories: ['Social Dance', 'Party'],
        location: 'Miami Dance Hall',
        address: '123 Party Street',
        city: 'Miami',
        state: 'FL',
        postalCode: '33139'
      });
      
      // Step 4: Enable ticketing
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Step 5: Add tickets
      await helpers.addTicketType({
        name: 'General Admission',
        price: 50,
        quantity: 200
      });
      
      await helpers.addTicketType({
        name: 'VIP Pass',
        price: 100,
        quantity: 50
      });
      
      // Step 6: Enable affiliate program
      console.log('💰 Enabling affiliate program with flat fee');
      
      // Look for affiliate program checkbox/toggle
      const affiliateToggle = page.locator('label:has-text("Enable Affiliate Program")');
      if (await affiliateToggle.isVisible()) {
        await affiliateToggle.click();
        
        // Select commission type
        await page.click('input[value="flat"]');
        await page.fill('input[placeholder*="commission amount"]', '10'); // $10 per ticket
        
        // Set minimum payout threshold
        await page.fill('input[placeholder*="minimum payout"]', '50');
      }
      
      await helpers.clickNext('Next: Review');
      
      // Step 7: Publish event
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 8: Navigate to affiliate management
      console.log('📊 Navigating to affiliate management');
      await page.goto(`/organizer/events/${eventId}/affiliates`);
      
      // Step 9: Add first affiliate
      console.log('➕ Adding affiliate: John Promoter');
      
      await page.click('button:has-text("Add Affiliate")');
      await page.fill('input[placeholder*="affiliate name"]', 'John Promoter');
      await page.fill('input[placeholder*="email"]', 'john@promoter.com');
      await page.fill('input[placeholder*="phone"]', '305-555-0101');
      
      // Generate referral code
      const referralCode = 'JOHN10';
      await page.fill('input[placeholder*="referral code"]', referralCode);
      
      await page.click('button:has-text("Create Affiliate")');
      
      // Step 10: Verify affiliate was created
      await expect(page.locator('text="John Promoter"')).toBeVisible();
      await expect(page.locator(`text="${referralCode}"`)).toBeVisible();
      await expect(page.locator('text="$10 per ticket"')).toBeVisible();
      
      // Step 11: Add second affiliate
      console.log('➕ Adding affiliate: Sarah Influencer');
      
      await page.click('button:has-text("Add Affiliate")');
      await page.fill('input[placeholder*="affiliate name"]', 'Sarah Influencer');
      await page.fill('input[placeholder*="email"]', 'sarah@influencer.com');
      await page.fill('input[placeholder*="referral code"]', 'SARAH10');
      
      await page.click('button:has-text("Create Affiliate")');
      
      // Step 12: Verify both affiliates listed
      await expect(page.locator('text="John Promoter"')).toBeVisible();
      await expect(page.locator('text="Sarah Influencer"')).toBeVisible();
      
      // Take screenshot
      await helpers.takeScreenshot('affiliate-flat-fee-setup');
      
      testResults.push({
        testName: 'Event with Affiliate Program (Flat Fee)',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 1 Passed: Event ${eventId} with flat fee affiliates`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Event with Affiliate Program (Flat Fee)',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 2: Create event with percentage-based affiliate commission', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Festival with Percentage Commission');
    const eventDate = getFutureDate(45);
    const eventTime = '14:00'; // 2:00 PM
    
    let eventId: string | null = null;
    let error: string | undefined;

    try {
      console.log('🤝 Test 2: Creating event with percentage-based affiliates');
      
      // Step 1: Login
      await helpers.loginAsOrganizer();
      
      // Step 2: Create event
      await helpers.navigateToNewEvent();
      await helpers.selectEventType('single');
      
      // Step 3: Event details
      await helpers.fillBasicEventInfo({
        name: eventName,
        description: 'Big festival! Affiliates earn 15% commission on all sales.',
        date: eventDate,
        time: eventTime,
        categories: ['Festival', 'Social Dance'],
        location: 'Miami Festival Grounds',
        address: '456 Festival Way',
        city: 'Miami',
        state: 'FL',
        postalCode: '33140'
      });
      
      // Step 4: Ticketing setup
      await helpers.clickNext('Next: Ticketing');
      await helpers.configureTicketing(true);
      await helpers.clickNext('Next: Capacity');
      
      // Step 5: Multiple ticket tiers
      console.log('🎫 Setting up tiered tickets');
      
      await helpers.addTicketType({
        name: 'Early Bird',
        price: 75,
        quantity: 100,
        earlyBird: {
          price: 60,
          endDate: getFutureDate(20)
        }
      });
      
      await helpers.addTicketType({
        name: 'Regular Admission',
        price: 90,
        quantity: 300
      });
      
      await helpers.addTicketType({
        name: 'VIP Experience',
        price: 150,
        quantity: 50
      });
      
      // Step 6: Enable percentage-based affiliate program
      console.log('💰 Setting up 15% commission structure');
      
      const affiliateToggle = page.locator('label:has-text("Enable Affiliate Program")');
      if (await affiliateToggle.isVisible()) {
        await affiliateToggle.click();
        
        // Select percentage commission
        await page.click('input[value="percentage"]');
        await page.fill('input[placeholder*="commission percentage"]', '15');
        
        // Set payout threshold
        await page.fill('input[placeholder*="minimum payout"]', '100');
        
        // Set ticket allocation limit
        await page.fill('input[placeholder*="max tickets per affiliate"]', '20');
      }
      
      await helpers.clickNext('Next: Review');
      
      // Step 7: Publish
      eventId = await helpers.publishEvent();
      expect(eventId).not.toBeNull();
      
      // Step 8: Add affiliates with different tiers
      console.log('📊 Setting up tiered affiliate structure');
      await page.goto(`/organizer/events/${eventId}/affiliates`);
      
      // Tier 1 Affiliate - Higher commission
      await page.click('button:has-text("Add Affiliate")');
      await page.fill('input[placeholder*="affiliate name"]', 'Premium Partner Agency');
      await page.fill('input[placeholder*="email"]', 'partner@agency.com');
      await page.fill('input[placeholder*="referral code"]', 'PREMIUM20');
      
      // Override commission if option available
      const customCommission = page.locator('input[placeholder*="custom commission"]');
      if (await customCommission.isVisible()) {
        await customCommission.fill('20'); // 20% for premium partner
      }
      
      await page.click('button:has-text("Create Affiliate")');
      
      // Regular Affiliate
      await page.click('button:has-text("Add Affiliate")');
      await page.fill('input[placeholder*="affiliate name"]', 'Dance School Miami');
      await page.fill('input[placeholder*="email"]', 'info@danceschool.com');
      await page.fill('input[placeholder*="referral code"]', 'DANCE15');
      await page.click('button:has-text("Create Affiliate")');
      
      // Small Affiliate
      await page.click('button:has-text("Add Affiliate")');
      await page.fill('input[placeholder*="affiliate name"]', 'Local DJ Mike');
      await page.fill('input[placeholder*="email"]', 'dj@mike.com');
      await page.fill('input[placeholder*="referral code"]', 'DJMIKE');
      await page.click('button:has-text("Create Affiliate")');
      
      // Step 9: Verify affiliate list shows percentages
      await expect(page.locator('text="Premium Partner Agency"')).toBeVisible();
      await expect(page.locator('text="15%"').first()).toBeVisible();
      
      // Step 10: Check affiliate tracking URLs
      console.log('🔗 Verifying affiliate tracking URLs');
      
      const affiliateUrl = `https://stepperslife.com/event/${eventId}?ref=PREMIUM20`;
      await expect(page.locator(`text="${affiliateUrl}"`).first()).toBeVisible();
      
      // Screenshot
      await helpers.takeScreenshot('affiliate-percentage-setup');
      
      testResults.push({
        testName: 'Event with Percentage-Based Affiliates',
        status: 'passed',
        duration: Date.now() - startTime,
        eventId: eventId || undefined
      });
      
      console.log(`✅ Test 2 Passed: Event ${eventId} with percentage affiliates`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Event with Percentage-Based Affiliates',
        status: 'failed',
        duration: Date.now() - startTime,
        error,
        eventId: eventId || undefined
      });
      throw err;
    }
  });

  test('Test 3: Track affiliate sales and commission calculation', async ({ page }) => {
    const startTime = Date.now();
    const eventName = generateEventName('Test Affiliate Tracking');
    const eventId = 'test-tracking-event'; // Would be created in real test
    
    try {
      console.log('📈 Test 3: Simulating affiliate sales tracking');
      
      // This test would simulate purchases using affiliate codes
      // and verify commission calculations
      
      // Step 1: Navigate to test event page with affiliate code
      const affiliateCode = 'TEST123';
      await page.goto(`/event/${eventId}?ref=${affiliateCode}`);
      
      // Step 2: Purchase tickets
      console.log('🛒 Simulating ticket purchase with affiliate code');
      
      // Select tickets
      await page.click('button:has-text("Buy Tickets")');
      await page.fill('input[type="number"]', '2'); // Buy 2 tickets
      await page.click('button:has-text("Continue")');
      
      // Fill buyer info
      await page.fill('input[placeholder*="name"]', 'Test Buyer');
      await page.fill('input[placeholder*="email"]', 'buyer@test.com');
      
      // Verify affiliate code is applied
      await expect(page.locator(`text="Referral Code: ${affiliateCode}"`)).toBeVisible();
      
      // Complete purchase (mocked)
      await page.click('button:has-text("Complete Purchase")');
      
      // Step 3: Check affiliate dashboard
      console.log('📊 Verifying commission tracking');
      await helpers.loginAsOrganizer();
      await page.goto(`/organizer/events/${eventId}/affiliates`);
      
      // Find affiliate and check sales
      const affiliateRow = page.locator('tr:has-text("TEST123")');
      await expect(affiliateRow.locator('text="2"')).toBeVisible(); // 2 tickets sold
      await expect(affiliateRow.locator('text="$20.00"')).toBeVisible(); // Commission earned
      
      testResults.push({
        testName: 'Affiliate Sales Tracking',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 3 Passed: Affiliate tracking working correctly');
      
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Affiliate Sales Tracking',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });
});