const { chromium } = require('playwright');

// Configuration
const BASE_URL = 'https://stepperslife.com';
const TEST_USER = {
  email: 'test@stepperslife.com',
  password: 'Test123!'
};

// Helper function to retry operations
async function retryOperation(operation, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return { success: true, result, attempt };
    } catch (error) {
      console.log(`  ⚠️ Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt === maxRetries) {
        return { success: false, error: error.message, attempt };
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// Enhanced authentication with detailed checks
async function authenticateWithDetailedChecks(page) {
  console.log('\n📍 Authentication Process');
  
  const authResult = await retryOperation(async () => {
    // Navigate to sign in
    await page.goto(`${BASE_URL}/auth/signin`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Check if already logged in
    const dashboardSelectors = ['text=Dashboard', 'text=My Events', 'a[href="/seller"]'];
    for (const selector of dashboardSelectors) {
      const isVisible = await page.locator(selector).isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        console.log('  ✅ Already authenticated');
        return true;
      }
    }
    
    // Check for form elements (now always visible)
    const hasEmailInput = await page.locator('input[type="email"]').isVisible({ timeout: 3000 }).catch(() => false);
    const hasPasswordInput = await page.locator('input[type="password"]').isVisible({ timeout: 3000 }).catch(() => false);
    const hasGoogleButton = await page.locator('text=/Sign in with Google/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    console.log(`  Email input visible: ${hasEmailInput ? '✅' : '❌'}`);
    console.log(`  Password input visible: ${hasPasswordInput ? '✅' : '❌'}`);
    console.log(`  Google sign in: ${hasGoogleButton ? '✅' : '❌'}`);
    
    // Fill credentials
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    console.log('  ✅ Credentials filled');
    
    // Submit form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Sign in")',
      'button:has-text("Log in")'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        console.log(`  ✅ Clicked submit button: ${selector}`);
        submitted = true;
        break;
      }
    }
    
    if (!submitted) {
      throw new Error('Could not find submit button');
    }
    
    // Wait for navigation
    await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 15000 }),
      page.waitForURL(/\/seller/, { timeout: 15000 }),
      page.waitForSelector('text=Dashboard', { timeout: 15000 }),
      page.waitForSelector('text=My Events', { timeout: 15000 })
    ]);
    
    console.log('  ✅ Authentication successful');
    return true;
  });
  
  return authResult;
}

async function testEventCreation(runNumber) {
  console.log(`\n🔄 Test Run ${runNumber}/3`);
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // Monitor console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  const testResults = {
    siteAvailability: false,
    signInPage: false,
    authentication: false,
    sellerAccess: false,
    eventCreation: false,
    consoleErrors: []
  };
  
  try {
    // Test 1: Check if site is up
    console.log('\n📍 Test 1: Site Availability');
    const siteCheck = await retryOperation(async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      const title = await page.title();
      console.log(`  ✅ Site is up - Title: ${title}`);
      return true;
    });
    testResults.siteAvailability = siteCheck.success;
    
    // Test 2: Sign In Page
    console.log('\n📍 Test 2: Sign In Page');
    const signInCheck = await retryOperation(async () => {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle' });
      
      // Take screenshot for debugging
      await page.screenshot({ path: `test-results/signin-page-run${runNumber}.png` });
      
      const hasAuthElements = 
        await page.locator('text=/Sign in/i').count() > 0 ||
        await page.locator('input[type="email"]').count() > 0;
      
      if (hasAuthElements) {
        console.log('  ✅ Sign in page loaded');
        return true;
      }
      throw new Error('Sign in page elements not found');
    });
    testResults.signInPage = signInCheck.success;
    
    // Test 3: Authentication
    const authResult = await authenticateWithDetailedChecks(page);
    testResults.authentication = authResult.success;
    
    // Test 4: Seller Area Access
    console.log('\n📍 Test 4: Seller Area Access');
    const sellerCheck = await retryOperation(async () => {
      await page.goto(`${BASE_URL}/seller/new-event`, { waitUntil: 'networkidle' });
      
      const currentUrl = page.url();
      
      // Take screenshot
      await page.screenshot({ path: `test-results/seller-area-run${runNumber}.png` });
      
      if (currentUrl.includes('/seller/new-event')) {
        console.log('  ✅ Accessed seller area');
        
        // Check for event creation form elements
        const formElements = {
          nameField: await page.locator('input[name="name"]').isVisible({ timeout: 3000 }).catch(() => false),
          descField: await page.locator('textarea[name="description"]').isVisible({ timeout: 3000 }).catch(() => false),
          dateField: await page.locator('input[type="date"]').isVisible({ timeout: 3000 }).catch(() => false),
          timeField: await page.locator('input[type="time"]').isVisible({ timeout: 3000 }).catch(() => false)
        };
        
        console.log(`  Event name field: ${formElements.nameField ? '✅' : '❌'}`);
        console.log(`  Description field: ${formElements.descField ? '✅' : '❌'}`);
        console.log(`  Date field: ${formElements.dateField ? '✅' : '❌'}`);
        console.log(`  Time field: ${formElements.timeField ? '✅' : '❌'}`);
        
        return true;
      } else if (currentUrl.includes('/auth/signin')) {
        throw new Error('Redirected to login - not authenticated');
      } else {
        throw new Error(`Unexpected URL: ${currentUrl}`);
      }
    });
    testResults.sellerAccess = sellerCheck.success;
    
    // Test 5: Event Creation (if we made it to seller area)
    if (testResults.sellerAccess) {
      console.log('\n📍 Test 5: Event Creation Form Fill');
      
      const eventCheck = await retryOperation(async () => {
        // Check for event type selector
        const eventTypeButton = page.locator('text=Single Day Event');
        if (await eventTypeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await eventTypeButton.click();
          console.log('  ✅ Selected Single Day Event');
          await page.waitForTimeout(500);
        }
        
        // Fill basic info
        const nameInput = page.locator('input[name="name"]').first();
        await nameInput.waitFor({ state: 'visible' });
        await nameInput.fill(`Test Event ${Date.now()}`);
        console.log('  ✅ Event name filled');
        
        const descField = page.locator('textarea[name="description"]').first();
        if (await descField.isVisible()) {
          await descField.fill('Test event created by automated test');
          console.log('  ✅ Description filled');
        }
        
        // Set date and time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          await dateInput.fill(tomorrow.toISOString().split('T')[0]);
          console.log('  ✅ Date set');
        }
        
        const timeInput = page.locator('input[type="time"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('20:00');
          console.log('  ✅ Time set');
        }
        
        // Location
        const locationFields = {
          location: 'Test Venue',
          address: '123 Test St',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601'
        };
        
        for (const [field, value] of Object.entries(locationFields)) {
          const input = page.locator(`input[name="${field}"]`).first();
          if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
            await input.fill(value);
            console.log(`  ✅ ${field} filled`);
          }
        }
        
        // Check for submit button (but don't click in test mode)
        const createButton = page.locator('button:has-text("Create")').first();
        if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('  ✅ Create button found and ready');
          return true;
        } else {
          throw new Error('Create button not found');
        }
      });
      
      testResults.eventCreation = eventCheck.success;
    }
    
    // Test 6: Console Errors
    console.log('\n📍 Test 6: Console Errors');
    testResults.consoleErrors = errors;
    if (errors.length > 0) {
      console.log(`  ⚠️ Found ${errors.length} console errors:`);
      errors.slice(0, 3).forEach(err => console.log(`    - ${err.substring(0, 100)}...`));
    } else {
      console.log('  ✅ No console errors detected');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
    console.log('\n' + '-'.repeat(50));
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`  Site Availability: ${testResults.siteAvailability ? '✅' : '❌'}`);
    console.log(`  Sign In Page: ${testResults.signInPage ? '✅' : '❌'}`);
    console.log(`  Authentication: ${testResults.authentication ? '✅' : '❌'}`);
    console.log(`  Seller Access: ${testResults.sellerAccess ? '✅' : '❌'}`);
    console.log(`  Event Creation: ${testResults.eventCreation ? '✅' : '❌'}`);
    console.log(`  Console Errors: ${testResults.consoleErrors.length === 0 ? '✅' : `❌ (${testResults.consoleErrors.length} errors)`}`);
    
    return testResults;
  }
}

async function runAllTests() {
  console.log('🧪 SteppersLife Production Test Suite');
  console.log('🌐 Testing: https://stepperslife.com');
  console.log('📅 ' + new Date().toISOString());
  
  // Create test-results directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }
  
  const allResults = [];
  
  for (let i = 1; i <= 3; i++) {
    const result = await testEventCreation(i);
    allResults.push({ run: i, ...result });
    
    if (i < 3) {
      console.log('\n⏳ Waiting 5 seconds before next run...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Calculate overall success rate
  const totalTests = allResults.length * 6; // 6 tests per run
  const passedTests = allResults.reduce((sum, result) => {
    return sum + 
      (result.siteAvailability ? 1 : 0) +
      (result.signInPage ? 1 : 0) +
      (result.authentication ? 1 : 0) +
      (result.sellerAccess ? 1 : 0) +
      (result.eventCreation ? 1 : 0) +
      (result.consoleErrors.length === 0 ? 1 : 0);
  }, 0);
  
  console.log('\n' + '=' .repeat(50));
  console.log('📈 Overall Results:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Save results to file
  fs.writeFileSync('test-results/direct-test-summary.json', JSON.stringify(allResults, null, 2));
  console.log('\n📁 Results saved to test-results/direct-test-summary.json');
  
  console.log('\n✨ Test suite completed!');
}

runAllTests().catch(console.error);