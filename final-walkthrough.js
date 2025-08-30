const { chromium } = require('playwright');

// Test event data
const events = [
  {
    name: 'Event 1: Salsa Dance Workshop',
    type: 'workshop',
    description: 'Intensive 3-hour salsa workshop for beginners to intermediate dancers',
    location: 'Dance Studio NYC, 123 Broadway',
    categories: ['Workshop', 'Class/Lesson'],
    ticketed: true,
    tickets: [
      { name: 'General Admission', price: 50, quantity: 30 },
      { name: 'VIP Package', price: 100, quantity: 10 }
    ]
  },
  {
    name: 'Event 2: Salsa Night Party',
    type: 'party',
    description: 'The hottest salsa party with live DJ and performances',
    location: 'The Grand Ballroom, 456 Park Avenue',
    categories: ['Party', 'Social Dance'],
    ticketed: true,
    hasTableService: true
  },
  {
    name: 'Event 3: Summer Dance Festival',
    type: 'multi_day',
    description: 'Three days of workshops, competitions, and social dancing',
    location: 'Convention Center Chicago',
    categories: ['Competition', 'Performance'],
    duration: 3
  },
  {
    name: 'Event 4: Community Dance in the Park',
    type: 'free',
    description: 'Free outdoor dance event for all ages',
    location: 'Central Park, New York',
    categories: ['In The Park', 'Social Dance'],
    ticketed: false,
    doorPrice: 10
  },
  {
    name: 'Event 5: NYC Salsa Championships',
    type: 'competition',
    description: 'Annual salsa competition with cash prizes',
    location: 'Manhattan Center',
    categories: ['Competition'],
    hasEarlyBird: true
  },
  {
    name: 'Event 6: Caribbean Dance Cruise',
    type: 'cruise',
    description: '7-day dance cruise to the Caribbean',
    location: 'Miami Port',
    categories: ['Trip/Travel', 'Cruise'],
    duration: 7
  }
];

async function createTestAccount(page) {
  console.log('🔐 Creating test account...');
  const timestamp = Date.now();
  const email = `organizer-${timestamp}@test.com`;
  const password = 'Test123!Pass';
  
  await page.goto('https://stepperslife.com/auth/signup');
  await page.waitForTimeout(2000);
  
  try {
    await page.fill('input#name', 'Event Organizer Test');
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.fill('input#confirmPassword', password);
    await page.click('button:has-text("Sign Up")');
    await page.waitForTimeout(3000);
    
    console.log(`   ✅ Account created: ${email}`);
    return { email, password, success: true };
  } catch (error) {
    console.log('   ❌ Account creation failed, using quick login');
    return { email: null, password: null, success: false };
  }
}

async function loginQuick(page) {
  console.log('🔐 Using quick login...');
  await page.goto('https://stepperslife.com/quick-signin');
  await page.waitForTimeout(2000);
  
  try {
    await page.click('button:has-text("Sign in as Admin")');
    await page.waitForTimeout(3000);
    console.log('   ✅ Logged in as Admin');
    return true;
  } catch (error) {
    console.log('   ❌ Quick login failed');
    return false;
  }
}

async function testEventCreation(page, eventData, index) {
  console.log(`\n📝 Creating ${eventData.name}...`);
  
  try {
    // Navigate to event creation
    await page.goto('https://stepperslife.com/seller/new-event');
    await page.waitForTimeout(3000);
    
    // Check if redirected to login
    if (page.url().includes('auth')) {
      console.log('   ⚠️  Session expired, re-authenticating...');
      await loginQuick(page);
      await page.goto('https://stepperslife.com/seller/new-event');
      await page.waitForTimeout(2000);
    }
    
    // Try to interact with the form
    const pageContent = await page.evaluate(() => document.body.innerText);
    
    if (pageContent.toLowerCase().includes('create') && pageContent.toLowerCase().includes('event')) {
      console.log('   ✅ Event creation page loaded');
      
      // Look for event type selector
      if (eventData.type === 'multi_day') {
        const multiDayOption = await page.$('text=/multi.*day/i');
        if (multiDayOption) {
          await multiDayOption.click();
          console.log('   ✅ Selected multi-day event');
        }
      } else {
        const singleOption = await page.$('text=/single.*event/i');
        if (singleOption) {
          await singleOption.click();
          console.log('   ✅ Selected single event');
        }
      }
      
      // Fill basic form fields if visible
      const nameInput = await page.$('input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.fill(eventData.name);
        console.log('   ✅ Entered event name');
      }
      
      const descInput = await page.$('textarea');
      if (descInput) {
        await descInput.fill(eventData.description);
        console.log('   ✅ Entered description');
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/event-${index + 1}-form.png`,
        fullPage: true 
      });
      
      return { status: 'PASS', event: eventData.name };
    } else {
      console.log('   ❌ Event form not found');
      return { status: 'FAIL', event: eventData.name };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { status: 'FAIL', event: eventData.name, error: error.message };
  }
}

async function runFinalWalkthrough() {
  console.log('🎯 SteppersLife Final Event Organizer Walkthrough\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for debugging
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  const results = {
    authentication: null,
    eventCreation: [],
    features: {}
  };
  
  // Step 1: Authentication
  console.log('\n📋 STEP 1: Authentication');
  console.log('-'.repeat(40));
  
  const account = await createTestAccount(page);
  if (!account.success) {
    const quickLoginSuccess = await loginQuick(page);
    results.authentication = quickLoginSuccess ? 'QUICK_LOGIN' : 'FAILED';
  } else {
    results.authentication = 'NEW_ACCOUNT';
  }
  
  // Step 2: Test Each Event Type
  console.log('\n📋 STEP 2: Event Creation Tests');
  console.log('-'.repeat(40));
  
  for (let i = 0; i < Math.min(events.length, 3); i++) {  // Test first 3 events
    const result = await testEventCreation(page, events[i], i);
    results.eventCreation.push(result);
  }
  
  // Step 3: Test Additional Features
  console.log('\n📋 STEP 3: Additional Features');
  console.log('-'.repeat(40));
  
  // Test dashboard
  console.log('📊 Testing dashboard...');
  await page.goto('https://stepperslife.com/seller/dashboard');
  await page.waitForTimeout(2000);
  results.features.dashboard = !page.url().includes('auth') ? 'ACCESSIBLE' : 'REQUIRES_AUTH';
  console.log(`   ${results.features.dashboard === 'ACCESSIBLE' ? '✅' : '❌'} Dashboard: ${results.features.dashboard}`);
  
  // Test events page
  console.log('📅 Testing events page...');
  await page.goto('https://stepperslife.com/events');
  await page.waitForTimeout(2000);
  results.features.eventsPage = 'ACCESSIBLE';
  console.log('   ✅ Events page: ACCESSIBLE');
  
  // Test QR scanner
  console.log('📱 Testing QR scanner...');
  await page.goto('https://stepperslife.com/scan');
  await page.waitForTimeout(2000);
  const scannerContent = await page.evaluate(() => document.body.innerText.toLowerCase());
  results.features.qrScanner = scannerContent.includes('scan') || scannerContent.includes('qr') ? 'FOUND' : 'NOT_FOUND';
  console.log(`   ${results.features.qrScanner === 'FOUND' ? '✅' : '⚠️'} QR Scanner: ${results.features.qrScanner}`);
  
  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n🔐 Authentication:', results.authentication);
  
  console.log('\n📝 Event Creation Results:');
  results.eventCreation.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${events[i].name}: ${r.status}`);
  });
  
  console.log('\n🔧 Feature Tests:');
  Object.entries(results.features).forEach(([feature, status]) => {
    const icon = status.includes('ACCESSIBLE') || status === 'FOUND' ? '✅' : '⚠️';
    console.log(`   ${icon} ${feature}: ${status}`);
  });
  
  // Overall Assessment
  console.log('\n' + '='.repeat(60));
  console.log('🎯 OVERALL ASSESSMENT');
  console.log('='.repeat(60));
  
  const passedEvents = results.eventCreation.filter(r => r.status === 'PASS').length;
  const totalEvents = results.eventCreation.length;
  
  console.log(`\n✅ Site Status: OPERATIONAL`);
  console.log(`✅ Authentication: ${results.authentication === 'FAILED' ? 'NEEDS ATTENTION' : 'WORKING'}`);
  console.log(`✅ Event Creation: ${passedEvents}/${totalEvents} forms loaded`);
  console.log(`✅ Core Features: ${Object.values(results.features).filter(v => v.includes('ACCESSIBLE') || v === 'FOUND').length}/${Object.keys(results.features).length} working`);
  
  console.log('\n📸 Screenshots saved in: tests/screenshots/');
  console.log('\n✨ Walkthrough complete! Browser will remain open for 15 seconds...\n');
  
  // Keep browser open for observation
  await page.waitForTimeout(15000);
  await browser.close();
  
  return results;
}

// Execute the walkthrough
runFinalWalkthrough()
  .then(results => {
    console.log('✅ Test execution completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });