const { chromium } = require('playwright');

async function testLoginIssue() {
  console.log('🔍 Testing login issue on production...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser to see what happens
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  // Monitor network requests
  page.on('response', response => {
    if (response.url().includes('/api/auth') && response.status() >= 400) {
      console.log(`❌ Auth API error: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    // Navigate to signin
    console.log('1. Going to signin page...');
    await page.goto('https://stepperslife.com/auth/signin', {
      waitUntil: 'networkidle'
    });
    
    // Check if form is visible
    const emailVisible = await page.locator('input[type="email"]').isVisible();
    const passwordVisible = await page.locator('input[type="password"]').isVisible();
    
    console.log(`2. Form visible: Email=${emailVisible}, Password=${passwordVisible}`);
    
    // Fill in credentials
    console.log('3. Filling test@stepperslife.com / Test123!');
    await page.fill('input[type="email"]', 'test@stepperslife.com');
    await page.fill('input[type="password"]', 'Test123!');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/before-submit.png' });
    
    // Click sign in
    console.log('4. Clicking Sign In button...');
    await page.click('button[type="submit"]');
    
    // Wait and observe what happens
    console.log('5. Waiting for response...');
    
    // Check multiple times to see the redirect behavior
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`   After ${i*2} seconds: ${currentUrl}`);
      
      // Check for error messages
      const errorElement = await page.locator('.bg-red-50').first();
      if (await errorElement.isVisible().catch(() => false)) {
        const errorText = await errorElement.textContent();
        console.log(`   ❌ Error shown: ${errorText}`);
      }
      
      // If we're not on signin anymore, try to navigate somewhere
      if (!currentUrl.includes('/auth/signin')) {
        console.log('6. Redirected! Trying to access /seller/new-event...');
        await page.goto('https://stepperslife.com/seller/new-event');
        await page.waitForTimeout(3000);
        const newUrl = page.url();
        console.log(`   After navigation: ${newUrl}`);
        
        if (newUrl.includes('/auth/signin')) {
          console.log('   ❌ ISSUE CONFIRMED: Pushed back to login!');
        } else {
          console.log('   ✅ Can access protected page');
        }
        break;
      }
    }
    
    // Check cookies
    console.log('\n7. Checking cookies...');
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('auth'));
    console.log(`   Auth cookies found: ${authCookies.length}`);
    authCookies.forEach(c => {
      console.log(`   - ${c.name}: ${c.value ? 'has value' : 'empty'} (secure: ${c.secure}, httpOnly: ${c.httpOnly})`);
    });
    
    // Check session storage
    console.log('\n8. Checking session/local storage...');
    const sessionData = await page.evaluate(() => {
      return {
        sessionStorage: Object.keys(sessionStorage),
        localStorage: Object.keys(localStorage)
      };
    });
    console.log('   Session storage keys:', sessionData.sessionStorage);
    console.log('   Local storage keys:', sessionData.localStorage);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-state.png' });
    
    console.log('\nKeeping browser open for 15 seconds to observe...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test complete');
  }
}

testLoginIssue();