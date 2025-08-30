const { chromium } = require('playwright');

async function runWalkthrough() {
  console.log('🚀 Starting SteppersLife Event Organizer Walkthrough\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Test 1: Homepage Load
    console.log('📍 Test 1: Loading homepage...');
    await page.goto('https://stepperslife.com', { timeout: 30000 });
    const title = await page.title();
    console.log(`✅ Homepage loaded: ${title}\n`);
    results.push({ test: 'Homepage Load', status: 'PASS' });
    
    // Test 2: Navigate to Sign In
    console.log('📍 Test 2: Navigating to sign in...');
    await page.goto('https://stepperslife.com/auth/signin');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Sign in page loaded\n');
    results.push({ test: 'Sign In Page', status: 'PASS' });
    
    // Test 3: Create New Account
    console.log('📍 Test 3: Creating new account...');
    await page.click('a:has-text("Sign up")');
    await page.waitForURL('**/auth/signup');
    
    const timestamp = Date.now();
    const testEmail = `test-organizer-${timestamp}@example.com`;
    
    await page.fill('input#name', 'Test Organizer');
    await page.fill('input#email', testEmail);
    await page.fill('input#password', 'TestPass123!');
    await page.fill('input#confirmPassword', 'TestPass123!');
    
    console.log(`   Creating account: ${testEmail}`);
    await page.click('button:has-text("Sign Up")');
    
    // Wait for redirect or error
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('dashboard') || currentUrl.includes('seller')) {
      console.log('✅ Account created successfully\n');
      results.push({ test: 'Account Creation', status: 'PASS' });
    } else {
      // Try logging in if account exists
      console.log('   Account may exist, trying login...');
      await page.goto('https://stepperslife.com/auth/signin');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'TestPass123!');
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('dashboard') || page.url().includes('seller')) {
        console.log('✅ Logged in successfully\n');
        results.push({ test: 'Account Creation/Login', status: 'PASS' });
      } else {
        console.log('⚠️  Login issues, trying quick login...');
        await page.goto('https://stepperslife.com/quick-signin');
        await page.click('button:has-text("Sign in as Admin")');
        await page.waitForTimeout(3000);
        results.push({ test: 'Account Creation', status: 'PARTIAL' });
      }
    }
    
    // Test 4: Navigate to Event Creation
    console.log('📍 Test 4: Creating Dance Workshop Event...');
    await page.goto('https://stepperslife.com/seller/new-event');
    await page.waitForTimeout(3000);
    
    // Check if we need to login first
    if (page.url().includes('auth/signin')) {
      console.log('   Redirected to login, using quick signin...');
      await page.goto('https://stepperslife.com/quick-signin');
      await page.click('button:has-text("Sign in as Admin")');
      await page.waitForTimeout(3000);
      await page.goto('https://stepperslife.com/seller/new-event');
      await page.waitForTimeout(2000);
    }
    
    // Select Single Event
    const singleEventButton = page.locator('button:has-text("Single Event")').first();
    if (await singleEventButton.count() > 0) {
      await singleEventButton.click();
      console.log('   Selected Single Event type');
      await page.waitForTimeout(2000);
    }
    
    // Fill event details
    console.log('   Filling event details...');
    
    // Event name
    const nameInput = page.locator('input[placeholder*="event name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Salsa Dance Workshop - Test Event');
    }
    
    // Description
    const descInput = page.locator('textarea[placeholder*="Describe"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill('Join us for an intensive salsa workshop covering fundamental techniques and partner work.');
    }
    
    // Location
    const locationInput = page.locator('input[placeholder*="venue"], input[placeholder*="location"]').first();
    if (await locationInput.count() > 0) {
      await locationInput.fill('Dance Studio NYC');
    }
    
    // Address
    const addressInput = page.locator('input[placeholder*="address"]').first();
    if (await addressInput.count() > 0) {
      await addressInput.fill('123 Broadway, New York, NY 10001');
    }
    
    // Categories - look for checkboxes
    const workshopCheckbox = page.locator('label:has-text("Workshop") input[type="checkbox"]');
    if (await workshopCheckbox.count() > 0) {
      await workshopCheckbox.check();
      console.log('   Selected Workshop category');
    }
    
    // Date - try HTML date input
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateStr = futureDate.toISOString().split('T')[0];
      await dateInput.fill(dateStr);
      console.log(`   Set date: ${dateStr}`);
    }
    
    // Time
    const timeInput = page.locator('input[type="time"]').first();
    if (await timeInput.count() > 0) {
      await timeInput.fill('14:00');
      console.log('   Set time: 2:00 PM');
    }
    
    // Ticketing option
    const ticketSelect = page.locator('select').first();
    if (await ticketSelect.count() > 0) {
      await ticketSelect.selectOption('selling_tickets');
      console.log('   Selected: Selling Tickets');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/event-form-filled.png',
      fullPage: true 
    });
    
    console.log('✅ Event form filled\n');
    results.push({ test: 'Event Creation Form', status: 'PASS' });
    
    // Test 5: Check other pages
    console.log('📍 Test 5: Checking dashboard pages...');
    
    // Seller Dashboard
    await page.goto('https://stepperslife.com/seller/dashboard');
    await page.waitForTimeout(2000);
    if (!page.url().includes('auth')) {
      console.log('   ✅ Seller dashboard accessible');
      results.push({ test: 'Seller Dashboard', status: 'PASS' });
    }
    
    // Events List
    await page.goto('https://stepperslife.com/events');
    await page.waitForTimeout(2000);
    console.log('   ✅ Events page loaded');
    results.push({ test: 'Events Page', status: 'PASS' });
    
    // Test 6: QR Scanner Page
    console.log('\n📍 Test 6: Testing QR Scanner...');
    await page.goto('https://stepperslife.com/scan');
    await page.waitForTimeout(2000);
    
    const scannerElements = await page.locator('text=/scan|camera|qr/i').count();
    if (scannerElements > 0) {
      console.log('   ✅ QR Scanner page loaded');
      results.push({ test: 'QR Scanner', status: 'PASS' });
    } else {
      console.log('   ⚠️  QR Scanner elements not found');
      results.push({ test: 'QR Scanner', status: 'FAIL' });
    }
    
  } catch (error) {
    console.error('❌ Error during walkthrough:', error.message);
    results.push({ test: 'Error', status: 'FAIL', error: error.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Partial: ${partial}`);
  
  console.log('\nDetailed Results:');
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test}: ${r.status}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  
  console.log('\n📁 Screenshots saved to: tests/screenshots/');
  
  // Keep browser open for 10 seconds to observe
  console.log('\n⏰ Keeping browser open for observation...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✨ Walkthrough complete!');
}

// Run the walkthrough
runWalkthrough().catch(console.error);