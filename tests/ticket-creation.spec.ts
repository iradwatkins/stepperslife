import { test, expect } from '@playwright/test';
import { authenticateUser, DEFAULT_TEST_USER } from './helpers/auth.helper';

// Test configuration
import { TEST_CREDENTIALS } from './helpers/test-constants';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// Helper function to login using shared auth helper
async function login(page: any) {
  await authenticateUser(page, DEFAULT_TEST_USER, {
    baseUrl: BASE_URL,
    retries: 3
  });
}

// Helper function to create event
async function navigateToNewEvent(page: any) {
  await page.goto(`${BASE_URL}/seller/new-event`);
  await page.waitForLoadState('networkidle');
}

// Helper to check for console errors
async function checkForErrors(page: any, context: string) {
  const errors: string[] = [];
  
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error: any) => {
    errors.push(error.message);
  });
  
  // Wait a bit for any errors to appear
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.error(`Errors found in ${context}:`, errors);
  }
  
  return errors;
}

test.describe('SteppersLife Ticket Creation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error monitoring
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      console.error('Page error:', error.message);
    });
  });

  test('Test 1: Simple Event (Door Price Only)', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Select single event type
    await page.locator('button:has-text("Single Day Event")').click();
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Friday Night Social Dance');
    await page.fill('textarea[name="description"]', 'Join us for an evening of social dancing and fun!');
    
    // Select categories
    await page.locator('text=Social Dance').click();
    await page.locator('text=Lounge Bar').click();
    
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '20:00');
    
    // Location
    await page.fill('input[name="location"]', 'Dance Studio Chicago');
    await page.fill('input[name="address"]', '123 Dance Street');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60601');
    
    // Select "Just Posting" option
    await page.locator('text=No - Just Posting an Event').click();
    await page.fill('input[name="doorPrice"]', '15');
    
    // Submit
    await page.locator('button:has-text("Create Event")').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    await expect(page.locator('text=Friday Night Social Dance')).toBeVisible();
    await expect(page.locator('text=$15 at the door')).toBeVisible();
    
    // Check for errors
    const errors = await checkForErrors(page, 'Test 1: Door Price Only');
    expect(errors).toHaveLength(0);
  });

  test('Test 2: Ticketed Event with Early Bird', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Select single event type
    await page.locator('button:has-text("Single Day Event")').click();
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Summer Steppers Workshop');
    await page.fill('textarea[name="description"]', 'Learn advanced stepping techniques from professional instructors.');
    
    // Select categories
    await page.locator('text=Workshop').click();
    await page.locator('text=Class').click();
    
    // Set date (2 weeks from now)
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 14);
    await page.fill('input[type="date"]', eventDate.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '14:00');
    
    // Location
    await page.fill('input[name="location"]', 'Workshop Center');
    await page.fill('input[name="address"]', '456 Learn Ave');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60602');
    
    // Select "Selling Tickets" option
    await page.locator('text=Yes - Selling Tickets').click();
    
    // Add ticket types
    // General Admission
    await page.locator('button:has-text("Add Ticket Type")').click();
    const gaName = await page.locator('input[placeholder="Ticket Name"]').first();
    await gaName.fill('General Admission');
    const gaPrice = await page.locator('input[placeholder="Price"]').first();
    await gaPrice.fill('25');
    const gaQuantity = await page.locator('input[placeholder="Quantity"]').first();
    await gaQuantity.fill('100');
    
    // VIP with Early Bird
    await page.locator('button:has-text("Add Ticket Type")').click();
    const vipInputs = await page.locator('input[placeholder="Ticket Name"]').all();
    await vipInputs[1].fill('VIP Access');
    
    const priceInputs = await page.locator('input[placeholder="Price"]').all();
    await priceInputs[1].fill('50');
    
    const quantityInputs = await page.locator('input[placeholder="Quantity"]').all();
    await quantityInputs[1].fill('20');
    
    // Enable early bird for VIP
    await page.locator('text=Enable Early Bird').nth(1).click();
    await page.fill('input[placeholder="Early Bird Price"]', '40');
    
    // Submit
    await page.locator('button:has-text("Create Event")').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    await expect(page.locator('text=Summer Steppers Workshop')).toBeVisible();
    await expect(page.locator('text=General Admission')).toBeVisible();
    await expect(page.locator('text=VIP Access')).toBeVisible();
    await expect(page.locator('text=$40')).toBeVisible(); // Early bird price
    
    // Check for errors
    const errors = await checkForErrors(page, 'Test 2: Early Bird Tickets');
    expect(errors).toHaveLength(0);
  });

  test('Test 3: Table/Group Purchase Event', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Select single event type
    await page.locator('button:has-text("Single Day Event")').click();
    
    // Fill basic info
    await page.fill('input[name="name"]', "New Year's Eve Gala");
    await page.fill('textarea[name="description"]', 'Celebrate the new year in style with dinner, dancing, and entertainment!');
    
    // Select categories
    await page.locator('text=Party').click();
    await page.locator('text=Holiday').click();
    
    // Set date (Dec 31)
    const currentYear = new Date().getFullYear();
    await page.fill('input[type="date"]', `${currentYear}-12-31`);
    await page.fill('input[type="time"]', '21:00');
    
    // Location
    await page.fill('input[name="location"]', 'Grand Ballroom');
    await page.fill('input[name="address"]', '789 Luxury Blvd');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60603');
    
    // Select "Selling Tickets" with tables
    await page.locator('text=Yes - Selling Tickets').click();
    
    // Add individual tickets
    await page.locator('button:has-text("Add Ticket Type")').click();
    const indName = await page.locator('input[placeholder="Ticket Name"]').first();
    await indName.fill('Individual Ticket');
    const indPrice = await page.locator('input[placeholder="Price"]').first();
    await indPrice.fill('75');
    const indQuantity = await page.locator('input[placeholder="Quantity"]').first();
    await indQuantity.fill('50');
    
    // Add table configurations
    await page.locator('text=Configure Tables').click();
    
    // VIP Table
    await page.locator('button:has-text("Add Table Type")').click();
    const vipTableName = await page.locator('input[placeholder="Table Name"]').first();
    await vipTableName.fill('VIP Table');
    const vipSeats = await page.locator('input[placeholder="Seats"]').first();
    await vipSeats.fill('8');
    const vipTablePrice = await page.locator('input[placeholder="Table Price"]').first();
    await vipTablePrice.fill('800');
    const vipTableCount = await page.locator('input[placeholder="Number of Tables"]').first();
    await vipTableCount.fill('5');
    
    // General Table
    await page.locator('button:has-text("Add Table Type")').click();
    const tableInputs = await page.locator('input[placeholder="Table Name"]').all();
    await tableInputs[1].fill('General Table');
    
    const seatInputs = await page.locator('input[placeholder="Seats"]').all();
    await seatInputs[1].fill('6');
    
    const tablePriceInputs = await page.locator('input[placeholder="Table Price"]').all();
    await tablePriceInputs[1].fill('450');
    
    const tableCountInputs = await page.locator('input[placeholder="Number of Tables"]').all();
    await tableCountInputs[1].fill('10');
    
    // Submit
    await page.locator('button:has-text("Create Event")').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    await expect(page.locator("text=New Year's Eve Gala")).toBeVisible();
    await expect(page.locator('text=Individual Ticket')).toBeVisible();
    await expect(page.locator('text=VIP Table')).toBeVisible();
    await expect(page.locator('text=General Table')).toBeVisible();
    
    // Check for errors
    const errors = await checkForErrors(page, 'Test 3: Table Purchase Event');
    expect(errors).toHaveLength(0);
  });

  test('Test 4: Multi-Day Event with Bundles', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Select multi-day event type
    await page.locator('button:has-text("Multi-Day Event")').click();
    
    // Fill basic info
    await page.fill('input[name="name"]', 'SteppersLife Weekend Festival');
    await page.fill('textarea[name="description"]', 'Three days of dancing, workshops, and performances!');
    
    // Select categories
    await page.locator('text=Workshop').click();
    await page.locator('text=Competition').click();
    await page.locator('text=Party').click();
    
    // Set dates (Friday to Sunday)
    const friday = new Date();
    friday.setDate(friday.getDate() + 30); // Next month
    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2);
    
    await page.fill('input[name="startDate"]', friday.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', sunday.toISOString().split('T')[0]);
    
    // Same location for all days
    await page.locator('text=Same location for all days').click();
    
    // Location
    await page.fill('input[name="location"]', 'Convention Center');
    await page.fill('input[name="address"]', '321 Festival Way');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60604');
    
    // Configure tickets for each day
    await page.locator('text=Next: Configure Days').click();
    
    // Day 1 - Friday
    await page.fill('input[name="day1_time"]', '18:00');
    await page.locator('button:has-text("Add Ticket Type")').first().click();
    await page.fill('input[name="day1_ticket_name"]', 'Friday GA');
    await page.fill('input[name="day1_ticket_price"]', '30');
    await page.fill('input[name="day1_ticket_quantity"]', '200');
    
    await page.locator('button:has-text("Add Ticket Type")').first().click();
    await page.fill('input[name="day1_vip_name"]', 'Friday VIP');
    await page.fill('input[name="day1_vip_price"]', '60');
    await page.fill('input[name="day1_vip_quantity"]', '50');
    
    // Day 2 - Saturday
    await page.locator('text=Saturday').click();
    await page.fill('input[name="day2_time"]', '14:00');
    await page.locator('button:has-text("Copy from Friday")').click();
    
    // Day 3 - Sunday
    await page.locator('text=Sunday').click();
    await page.fill('input[name="day3_time"]', '14:00');
    await page.locator('button:has-text("Copy from Friday")').click();
    
    // Configure bundles
    await page.locator('text=Next: Configure Bundles').click();
    
    // Weekend Pass GA
    await page.locator('button:has-text("Add Bundle")').click();
    await page.fill('input[name="bundle_name"]', 'Weekend Pass GA');
    await page.locator('text=Friday GA').click();
    await page.locator('text=Saturday GA').click();
    await page.locator('text=Sunday GA').click();
    await page.fill('input[name="bundle_price"]', '75');
    
    // Weekend Pass VIP
    await page.locator('button:has-text("Add Bundle")').click();
    await page.fill('input[name="bundle_vip_name"]', 'Weekend Pass VIP');
    await page.locator('text=Friday VIP').click();
    await page.locator('text=Saturday VIP').click();
    await page.locator('text=Sunday VIP').click();
    await page.fill('input[name="bundle_vip_price"]', '150');
    
    // Submit
    await page.locator('button:has-text("Create Multi-Day Event")').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    await expect(page.locator('text=SteppersLife Weekend Festival')).toBeVisible();
    await expect(page.locator('text=3-Day Event')).toBeVisible();
    await expect(page.locator('text=Weekend Pass')).toBeVisible();
    
    // Check for errors
    const errors = await checkForErrors(page, 'Test 4: Multi-Day Event');
    expect(errors).toHaveLength(0);
  });

  test('Test 5: Save-the-Date Event', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Select save-the-date event type
    await page.locator('button:has-text("Save the Date")').click();
    
    // Fill basic info
    await page.fill('input[name="name"]', '2025 Annual Steppers Convention');
    await page.fill('textarea[name="description"]', 'Mark your calendars for the biggest stepping event of the year! Location and details coming soon.');
    
    // Select categories
    await page.locator('text=Competition').click();
    await page.locator('text=Workshop').click();
    await page.locator('text=Party').click();
    
    // Set date (6 months from now)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
    
    // Note: No location required for save-the-date
    
    // Submit
    await page.locator('button:has-text("Create Save-the-Date")').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    await expect(page.locator('text=2025 Annual Steppers Convention')).toBeVisible();
    await expect(page.locator('text=Save the Date')).toBeVisible();
    await expect(page.locator('text=Location TBD')).toBeVisible();
    
    // Check for errors
    const errors = await checkForErrors(page, 'Test 5: Save-the-Date');
    expect(errors).toHaveLength(0);
  });

  test('Complete Workflow Test - Purchase and Scan', async ({ page }) => {
    await login(page);
    
    // Navigate to events page
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Find and click on first available ticketed event
    const eventCard = page.locator('.event-card').first();
    await eventCard.click();
    
    // Check event details page loads
    await expect(page).toHaveURL(/\/event\//, { timeout: 10000 });
    
    // Try to purchase a ticket
    const buyButton = page.locator('button:has-text("Buy Ticket")').first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      
      // Fill purchase form
      await page.fill('input[name="buyerName"]', 'Test Buyer');
      await page.fill('input[name="buyerEmail"]', 'buyer@test.com');
      await page.fill('input[name="buyerPhone"]', '312-555-0100');
      
      // Select quantity
      await page.selectOption('select[name="quantity"]', '1');
      
      // Proceed to checkout
      await page.locator('button:has-text("Proceed to Checkout")').click();
      
      // Wait for ticket generation
      await expect(page.locator('text=Ticket ID')).toBeVisible({ timeout: 15000 });
      
      // Get ticket code
      const ticketCode = await page.locator('.ticket-code').textContent();
      console.log('Generated ticket code:', ticketCode);
      
      // Navigate to scanner
      const eventId = page.url().match(/event\/([^\/]+)/)?.[1];
      await page.goto(`${BASE_URL}/event/${eventId}/scan`);
      
      // Test manual code entry
      await page.fill('input[placeholder="Enter 6-digit code"]', ticketCode || '');
      await page.locator('button:has-text("Check In")').click();
      
      // Verify scan success
      await expect(page.locator('text=Check-in successful')).toBeVisible({ timeout: 5000 });
    }
    
    // Check for errors throughout workflow
    const errors = await checkForErrors(page, 'Complete Workflow Test');
    expect(errors).toHaveLength(0);
  });

  test('Error Validation Tests', async ({ page }) => {
    await login(page);
    await navigateToNewEvent(page);
    
    // Test 1: Submit without required fields
    await page.locator('button:has-text("Single Day Event")').click();
    await page.locator('button:has-text("Create Event")').click();
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
    
    // Test 2: Invalid date (past date)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[type="date"]', yesterday.toISOString().split('T')[0]);
    await page.fill('input[name="name"]', 'Test Event');
    await page.locator('button:has-text("Create Event")').click();
    
    // Should show date error
    await expect(page.locator('text=past date').or(page.locator('text=future date'))).toBeVisible();
    
    // Test 3: Duplicate ticket names
    await page.reload();
    await page.locator('button:has-text("Single Day Event")').click();
    await page.locator('text=Yes - Selling Tickets').click();
    
    await page.locator('button:has-text("Add Ticket Type")').click();
    const vipTicket = await page.locator('input[placeholder="Ticket Name"]').first();
    await vipTicket.fill('VIP');
    
    await page.locator('button:has-text("Add Ticket Type")').click();
    const ticketInputs = await page.locator('input[placeholder="Ticket Name"]').all();
    await ticketInputs[1].fill('VIP');
    
    await page.locator('button:has-text("Create Event")').click();
    
    // Should show duplicate name error
    await expect(page.locator('text=duplicate').or(page.locator('text=unique'))).toBeVisible();
    
    // Check for unexpected errors
    const errors = await checkForErrors(page, 'Error Validation Tests');
    // Some validation errors are expected, so we don't assert zero errors here
  });
});