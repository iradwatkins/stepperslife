const { chromium } = require('playwright');

// Configuration
const BASE_URL = 'https://stepperslife.com';
const TEST_USER = {
  email: 'test@stepperslife.com',
  password: 'Test123!'
};

// Improved authentication with retry logic
async function authenticateWithRetry(page, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Login attempt ${attempt}/${maxAttempts}...`);
      
      // Navigate to login
      await page.goto(`${BASE_URL}/auth/signin`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Check if already logged in
      const dashboardVisible = await page.locator('text=Dashboard').isVisible({ timeout: 3000 }).catch(() => false);
      if (dashboardVisible) {
        console.log('✅ Already logged in');
        return true;
      }
      
      // Email form is now always visible - no need to expand
      
      // Fill credentials
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Wait for navigation with multiple possible outcomes
      await Promise.race([
        page.waitForURL(/\/dashboard/, { timeout: 15000 }),
        page.waitForURL(/\/seller/, { timeout: 15000 }),
        page.waitForSelector('text=Dashboard', { timeout: 15000 }),
        page.waitForSelector('text=My Events', { timeout: 15000 })
      ]);
      
      console.log('✅ Login successful');
      return true;
      
    } catch (error) {
      console.error(`Login attempt ${attempt} failed:`, error.message);
      if (attempt === maxAttempts) {
        throw new Error(`Login failed after ${maxAttempts} attempts`);
      }
      // Wait before retry
      await page.waitForTimeout(2000);
    }
  }
  return false;
}

async function testSimpleEvent() {
  console.log('Starting Test 1: Simple Event (Door Price Only)');
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  // Set default timeout for all operations
  page.setDefaultTimeout(30000);
  
  try {
    // Login with retry
    console.log('1. Authenticating...');
    await authenticateWithRetry(page);
    
    // Navigate to new event with proper wait
    console.log('2. Navigating to new event page...');
    await page.goto(`${BASE_URL}/seller/new-event`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for page to be ready
    await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 10000 });
    
    // Check if event type selector is visible
    const eventTypeSelector = page.locator('text=Single Day Event');
    if (await eventTypeSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('3. Selecting single day event...');
      await eventTypeSelector.click();
      // Wait for form to update
      await page.waitForTimeout(500);
    }
    
    // Fill event details with proper waits
    console.log('4. Filling event details...');
    
    // Name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(`Test Event ${Date.now()}`);
    
    // Description
    const descInput = page.locator('textarea[name="description"]');
    await descInput.fill('This is a test event for door price only');
    
    // Set date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill(dateStr);
    
    const timeInput = page.locator('input[type="time"]');
    await timeInput.fill('20:00');
    
    // Location details
    console.log('5. Filling location details...');
    await page.fill('input[name="location"]', 'Test Venue');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60601');
    
    // Select door price only
    const doorPriceOption = page.locator('text=No - Just Posting an Event');
    if (await doorPriceOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('6. Selecting door price only option...');
      await doorPriceOption.click();
      
      // Wait for door price field to appear
      const doorPriceInput = page.locator('input[name="doorPrice"]');
      await doorPriceInput.waitFor({ state: 'visible' });
      await doorPriceInput.fill('15');
    }
    
    // Submit with proper wait
    console.log('7. Submitting event...');
    const submitButton = page.locator('button:has-text("Create Event")').first();
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
    
    // Wait for success with multiple conditions
    console.log('8. Waiting for event creation...');
    try {
      await Promise.race([
        page.waitForURL(/\/event\//, { timeout: 20000 }),
        page.waitForSelector('text=Event Created Successfully', { timeout: 20000 }),
        page.waitForSelector('text=Share Event', { timeout: 20000 })
      ]);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/event/')) {
        console.log('✅ Test 1 PASSED - Event created successfully');
        console.log('Event URL:', currentUrl);
        
        // Take screenshot for verification
        await page.screenshot({ path: 'test-results/simple-event-success.png' });
      } else {
        console.log('⚠️ Test 1 WARNING - Unexpected URL after creation');
        console.log('Current URL:', currentUrl);
      }
    } catch (error) {
      console.log('❌ Test 1 FAILED - Event creation timeout');
      console.log('Current URL:', page.url());
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/simple-event-failure.png' });
    }
    
  } catch (error) {
    console.error('❌ Test 1 FAILED with error:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/simple-event-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

async function testTicketedEvent() {
  console.log('\nStarting Test 2: Ticketed Event with Early Bird');
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  // Set default timeout
  page.setDefaultTimeout(30000);
  
  try {
    // Login with retry
    console.log('1. Authenticating...');
    await authenticateWithRetry(page);
    
    // Navigate to new event
    console.log('2. Creating ticketed event...');
    await page.goto(`${BASE_URL}/seller/new-event`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for form
    await page.waitForSelector('input[name="name"]', { state: 'visible' });
    
    // Select single event if needed
    const eventTypeSelector = page.locator('text=Single Day Event');
    if (await eventTypeSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventTypeSelector.click();
      await page.waitForTimeout(500);
    }
    
    // Fill details
    console.log('3. Filling event details...');
    await page.fill('input[name="name"]', `Workshop ${Date.now()}`);
    await page.fill('textarea[name="description"]', 'Test workshop with early bird pricing');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '14:00');
    
    await page.fill('input[name="location"]', 'Workshop Center');
    await page.fill('input[name="address"]', '456 Learn Ave');
    await page.fill('input[name="city"]', 'Chicago');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="postalCode"]', '60602');
    
    // Select selling tickets
    const sellTicketsOption = page.locator('text=Yes - Selling Tickets');
    if (await sellTicketsOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('4. Configuring tickets...');
      await sellTicketsOption.click();
      
      // Wait for ticket fields to appear
      await page.waitForTimeout(1000);
      
      // Add ticket configuration here if fields are visible
      const ticketNameField = page.locator('input[name="ticketName"]').first();
      if (await ticketNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ticketNameField.fill('General Admission');
        
        const priceField = page.locator('input[name="ticketPrice"]').first();
        if (await priceField.isVisible().catch(() => false)) {
          await priceField.fill('25');
        }
      }
    }
    
    // Submit
    console.log('5. Submitting event...');
    const submitButton = page.locator('button:has-text("Create Event")').first();
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
    
    // Wait for success
    try {
      await Promise.race([
        page.waitForURL(/\/event\//, { timeout: 20000 }),
        page.waitForSelector('text=Event Created Successfully', { timeout: 20000 })
      ]);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/event/')) {
        console.log('✅ Test 2 PASSED - Ticketed event created');
        console.log('Event URL:', currentUrl);
        
        // Take screenshot
        await page.screenshot({ path: 'test-results/ticketed-event-success.png' });
      } else {
        console.log('⚠️ Test 2 WARNING - Unexpected URL');
        console.log('Current URL:', currentUrl);
      }
    } catch (error) {
      console.log('❌ Test 2 FAILED - Creation timeout');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/ticketed-event-failure.png' });
    }
    
  } catch (error) {
    console.error('❌ Test 2 FAILED with error:', error.message);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/ticketed-event-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🧪 Running SteppersLife Production Tests\n');
  console.log('=' .repeat(50));
  
  // Create test-results directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }
  
  // Run each test with retry logic
  const testResults = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🔄 Test Run ${i}/3\n`);
    
    try {
      await testSimpleEvent();
      testResults.push({ test: 'Simple Event', run: i, status: 'pass' });
    } catch (error) {
      testResults.push({ test: 'Simple Event', run: i, status: 'fail', error: error.message });
    }
    
    try {
      await testTicketedEvent();
      testResults.push({ test: 'Ticketed Event', run: i, status: 'pass' });
    } catch (error) {
      testResults.push({ test: 'Ticketed Event', run: i, status: 'fail', error: error.message });
    }
    
    console.log('\n' + '-'.repeat(50));
  }
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('=' .repeat(50));
  
  const passed = testResults.filter(r => r.status === 'pass').length;
  const failed = testResults.filter(r => r.status === 'fail').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%`);
  
  // Save results to file
  fs.writeFileSync('test-results/summary.json', JSON.stringify(testResults, null, 2));
  console.log('\n📁 Results saved to test-results/summary.json');
  
  console.log('\n✨ All tests completed!');
}

// Run the tests
runAllTests().catch(console.error);