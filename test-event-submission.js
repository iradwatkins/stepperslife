const { chromium } = require('playwright');

async function testEventSubmission() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting event submission test...');
    
    // Navigate to test page that bypasses auth
    await page.goto('http://localhost:3001/test-direct-event');
    console.log('✅ Navigated to test page');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Test Direct Event Creation")', { timeout: 10000 });
    console.log('✅ Page loaded');
    
    // Fill basic info
    console.log('📝 Filling basic information...');
    
    // Event name
    await page.fill('input[name="name"], input[placeholder*="Event"]', 'Test Event Submission');
    
    // Description
    await page.fill('textarea', 'This is a test event created at ' + new Date().toISOString());
    
    // Location fields
    await page.fill('input[name="location"], input[placeholder*="Venue"]', 'Chicago Test Venue');
    await page.fill('input[name="address"], input[placeholder*="Address"]', '2740 W 83rd Pl');
    await page.fill('input[name="city"], input[placeholder*="City"]', 'Chicago');
    await page.fill('input[name="state"], select[name="state"]', 'IL');
    await page.fill('input[name="postalCode"], input[placeholder*="Zip"]', '60652');
    
    // Set date (30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Set time
    await page.fill('input[type="time"]', '19:00');
    
    // Select categories - check first 3 available
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
      await checkboxes[i].check();
    }
    
    console.log('✅ Basic info filled');
    
    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    console.log('✅ Moved to ticketing step');
    
    // Select "Yes - Selling Tickets"
    const sellingTickets = await page.locator('label:has-text("Yes"), input[value="true"]').first();
    if (await sellingTickets.isVisible()) {
      await sellingTickets.click();
      console.log('✅ Selected selling tickets');
    }
    
    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    console.log('✅ Moved to capacity step');
    
    // Set capacity
    const capacityField = await page.locator('input[type="number"]').first();
    await capacityField.fill('200');
    console.log('✅ Set capacity to 200');
    
    // Check if auto-balance is needed
    const autoBalance = await page.locator('button:has-text("Auto-Balance")');
    if (await autoBalance.isVisible()) {
      console.log('🔄 Clicking auto-balance...');
      await autoBalance.click();
      await page.waitForTimeout(500);
    }
    
    // Check if Next button is enabled
    const nextButton = await page.locator('button:has-text("Next")').first();
    const isDisabled = await nextButton.isDisabled();
    console.log('Next button disabled:', isDisabled);
    
    if (!isDisabled) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Moved to table configuration');
      
      // Skip tables
      const skipButton = await page.locator('button:has-text("Skip")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('✅ Skipped table configuration');
      } else {
        await page.click('button:has-text("Next")');
      }
      await page.waitForTimeout(1000);
      
      // Review and publish
      console.log('📋 At review step');
      await page.screenshot({ path: 'test-review-page.png' });
      
      // Click publish
      const publishButton = await page.locator('button:has-text("Publish")');
      if (await publishButton.isVisible()) {
        console.log('🚀 Publishing event...');
        await publishButton.click();
        
        // Wait for result
        await page.waitForTimeout(5000);
        
        // Check for success
        const currentUrl = page.url();
        if (currentUrl.includes('/event/')) {
          console.log('✅ SUCCESS! Event created:', currentUrl);
        } else {
          console.log('📍 Current URL:', currentUrl);
          
          // Check for result display
          const resultPre = await page.locator('pre').first();
          if (await resultPre.isVisible()) {
            const result = await resultPre.textContent();
            console.log('📊 Result:', result);
          }
        }
      }
    } else {
      console.log('❌ Next button is disabled at capacity step');
      await page.screenshot({ path: 'test-blocked-capacity.png' });
      
      // Log validation state
      const validationMessages = await page.locator('.text-red-500, .text-blue-600').allTextContents();
      console.log('Validation messages:', validationMessages);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  }
  
  // Keep browser open for manual inspection
  console.log('\n✋ Browser will stay open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

// Run the test
testEventSubmission().catch(console.error);