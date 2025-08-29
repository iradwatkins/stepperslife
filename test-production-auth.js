const { chromium } = require('playwright');

async function testProductionAuth() {
  console.log('Testing production authentication...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to signin page
    console.log('1. Navigating to signin page...');
    await page.goto('https://stepperslife.com/auth/signin', {
      waitUntil: 'networkidle'
    });
    
    // Check if form is visible
    const emailVisible = await page.locator('input[type="email"]').isVisible();
    const passwordVisible = await page.locator('input[type="password"]').isVisible();
    
    console.log(`2. Email input visible: ${emailVisible ? '✅' : '❌'}`);
    console.log(`3. Password input visible: ${passwordVisible ? '✅' : '❌'}`);
    
    if (emailVisible && passwordVisible) {
      // Fill in credentials
      console.log('4. Filling in credentials...');
      await page.fill('input[type="email"]', 'test@stepperslife.com');
      await page.fill('input[type="password"]', 'Test123!');
      
      // Take screenshot before clicking
      await page.screenshot({ path: 'test-results/before-signin.png' });
      
      // Click sign in
      console.log('5. Clicking sign in button...');
      await page.click('button[type="submit"]');
      
      // Wait for navigation or error
      console.log('6. Waiting for response...');
      await page.waitForTimeout(10000);
      
      // Take screenshot after
      await page.screenshot({ path: 'test-results/after-signin.png' });
      
      // Check where we are
      const currentUrl = page.url();
      console.log(`7. Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('dashboard') || currentUrl.includes('seller') || !currentUrl.includes('auth/signin')) {
        console.log('✅ LOGIN SUCCESSFUL - Redirected from signin page!');
      } else if (currentUrl.includes('auth/signin')) {
        console.log('❌ Still on signin page - login may have failed');
        
        // Check for error messages
        const errorElement = await page.locator('.bg-red-50').first();
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          console.log(`   Error message: ${errorText}`);
        }
      }
      
      // Try to access a protected page
      console.log('\n8. Testing access to protected page...');
      await page.goto('https://stepperslife.com/seller/new-event');
      await page.waitForTimeout(3000);
      
      const newUrl = page.url();
      if (newUrl.includes('seller/new-event')) {
        console.log('✅ Can access protected seller page - AUTH WORKING!');
      } else if (newUrl.includes('auth/signin')) {
        console.log('❌ Redirected to signin - not authenticated');
      } else {
        console.log(`⚠️ Unexpected URL: ${newUrl}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Test complete!');
  }
}

testProductionAuth();