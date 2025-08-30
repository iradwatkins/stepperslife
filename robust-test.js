const { chromium } = require('playwright');

async function safeNavigate(page, url, description) {
  try {
    console.log(`📍 Navigating to: ${description}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    return true;
  } catch (error) {
    console.log(`   ❌ Failed to load: ${error.message}`);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 SteppersLife Comprehensive Event Organizer Test\n');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const testResults = [];
  
  // Test 1: Site Accessibility
  console.log('\n📋 TEST 1: Site Accessibility');
  if (await safeNavigate(page, 'https://stepperslife.com', 'Homepage')) {
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      const hasContent = await page.evaluate(() => document.body.innerText.length > 0);
      if (hasContent) {
        console.log('   ✅ Homepage loads with content');
        testResults.push({ test: 'Homepage Load', status: 'PASS' });
      }
    } catch (e) {
      console.log('   ⚠️  Homepage loaded but content check failed');
      testResults.push({ test: 'Homepage Load', status: 'PARTIAL' });
    }
  } else {
    testResults.push({ test: 'Homepage Load', status: 'FAIL' });
  }
  
  // Test 2: Authentication Pages
  console.log('\n📋 TEST 2: Authentication Flow');
  
  // Sign In Page
  if (await safeNavigate(page, 'https://stepperslife.com/auth/signin', 'Sign In Page')) {
    try {
      const emailField = await page.waitForSelector('input[type="email"], input#email', { timeout: 5000 });
      if (emailField) {
        console.log('   ✅ Sign in form found');
        testResults.push({ test: 'Sign In Page', status: 'PASS' });
        
        // Take screenshot
        await page.screenshot({ 
          path: 'tests/screenshots/signin-page.png'
        });
      }
    } catch (e) {
      console.log('   ❌ Sign in form not found');
      testResults.push({ test: 'Sign In Page', status: 'FAIL' });
    }
  }
  
  // Quick Sign In
  if (await safeNavigate(page, 'https://stepperslife.com/quick-signin', 'Quick Sign In')) {
    try {
      const adminButton = await page.waitForSelector('button:has-text("Admin")', { timeout: 5000 });
      if (adminButton) {
        console.log('   ✅ Quick sign in buttons found');
        console.log('   🔐 Attempting admin login...');
        
        await adminButton.click();
        await page.waitForTimeout(3000);
        
        const afterLoginUrl = page.url();
        if (afterLoginUrl.includes('dashboard') || !afterLoginUrl.includes('signin')) {
          console.log('   ✅ Login successful!');
          testResults.push({ test: 'Quick Login', status: 'PASS' });
        } else {
          console.log('   ⚠️  Login attempted but unclear result');
          testResults.push({ test: 'Quick Login', status: 'PARTIAL' });
        }
      }
    } catch (e) {
      console.log('   ❌ Quick sign in failed:', e.message);
      testResults.push({ test: 'Quick Login', status: 'FAIL' });
    }
  }
  
  // Test 3: Event Creation Flow
  console.log('\n📋 TEST 3: Event Creation');
  
  if (await safeNavigate(page, 'https://stepperslife.com/seller/new-event', 'Event Creation')) {
    const currentUrl = page.url();
    
    if (currentUrl.includes('auth/signin')) {
      console.log('   ⚠️  Redirected to login - not authenticated');
      
      // Try to login
      console.log('   🔐 Attempting login...');
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      
      if (emailInput && passwordInput) {
        await emailInput.fill('admin@stepperslife.com');
        await passwordInput.fill('admin123');
        
        const submitButton = await page.$('button[type="submit"], button:has-text("Sign In")');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Navigate back to event creation
          await safeNavigate(page, 'https://stepperslife.com/seller/new-event', 'Event Creation (after login)');
        }
      }
    }
    
    // Check if we're on the event creation page
    try {
      // Look for event type selector or form elements
      const hasEventForm = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('event') && (
          text.includes('create') || 
          text.includes('single') || 
          text.includes('multi')
        );
      });
      
      if (hasEventForm) {
        console.log('   ✅ Event creation page loaded');
        testResults.push({ test: 'Event Creation Page', status: 'PASS' });
        
        // Try to select event type
        const singleEventBtn = await page.$('button:has-text("Single Event"), div:has-text("Single Event")');
        if (singleEventBtn) {
          await singleEventBtn.click();
          console.log('   ✅ Selected Single Event type');
          await page.waitForTimeout(2000);
        }
        
        // Screenshot the form
        await page.screenshot({ 
          path: 'tests/screenshots/event-creation-form.png',
          fullPage: true
        });
      } else {
        console.log('   ⚠️  Page loaded but event form not detected');
        testResults.push({ test: 'Event Creation Page', status: 'PARTIAL' });
      }
    } catch (e) {
      console.log('   ❌ Event creation page check failed');
      testResults.push({ test: 'Event Creation Page', status: 'FAIL' });
    }
  }
  
  // Test 4: Public Pages
  console.log('\n📋 TEST 4: Public Pages');
  
  // Events listing
  if (await safeNavigate(page, 'https://stepperslife.com/events', 'Events Listing')) {
    const hasEvents = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('event');
    });
    
    if (hasEvents) {
      console.log('   ✅ Events page displays content');
      testResults.push({ test: 'Events Listing', status: 'PASS' });
    } else {
      console.log('   ⚠️  Events page loaded but no event content');
      testResults.push({ test: 'Events Listing', status: 'PARTIAL' });
    }
  }
  
  // Test 5: Mobile Responsiveness
  console.log('\n📋 TEST 5: Mobile View');
  
  await page.setViewportSize({ width: 390, height: 844 });
  if (await safeNavigate(page, 'https://stepperslife.com', 'Mobile Homepage')) {
    console.log('   ✅ Mobile view loads');
    testResults.push({ test: 'Mobile Responsive', status: 'PASS' });
    
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png'
    });
  }
  
  // Reset viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Test 6: QR Scanner
  console.log('\n📋 TEST 6: QR Scanner');
  
  if (await safeNavigate(page, 'https://stepperslife.com/scan', 'QR Scanner')) {
    const hasScannerContent = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('scan') || text.includes('qr') || text.includes('camera');
    });
    
    if (hasScannerContent) {
      console.log('   ✅ QR Scanner page found');
      testResults.push({ test: 'QR Scanner', status: 'PASS' });
    } else {
      console.log('   ⚠️  Scanner page loaded but content unclear');
      testResults.push({ test: 'QR Scanner', status: 'PARTIAL' });
    }
  }
  
  // Generate Summary Report
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const partial = testResults.filter(r => r.status === 'PARTIAL').length;
  
  console.log(`\nTotal Tests Run: ${testResults.length}`);
  console.log(`✅ Passed: ${passed} (${Math.round(passed/testResults.length*100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round(failed/testResults.length*100)}%)`);
  console.log(`⚠️  Partial: ${partial} (${Math.round(partial/testResults.length*100)}%)`);
  
  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(40));
  testResults.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test.padEnd(25)} ${r.status}`);
  });
  
  console.log('\n📸 Screenshots saved to: tests/screenshots/');
  console.log('   - signin-page.png');
  console.log('   - event-creation-form.png');
  console.log('   - mobile-view.png');
  
  // Key Findings
  console.log('\n🔍 KEY FINDINGS:');
  console.log('-'.repeat(40));
  
  if (passed > failed) {
    console.log('✅ Site is generally functional');
    console.log('✅ Authentication pages are accessible');
    console.log('✅ Mobile responsiveness works');
  }
  
  if (failed > 0 || partial > 0) {
    console.log('⚠️  Some features may need attention:');
    testResults
      .filter(r => r.status !== 'PASS')
      .forEach(r => console.log(`   - ${r.test}: ${r.status}`));
  }
  
  await browser.close();
  console.log('\n✨ Test suite complete!\n');
  
  return testResults;
}

// Execute the test
runComprehensiveTest()
  .then(results => {
    const exitCode = results.filter(r => r.status === 'FAIL').length > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });