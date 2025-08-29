const { chromium } = require('playwright');

async function testSimpleAuth() {
  console.log('Testing authentication...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser to see what's happening
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to signin page
    console.log('1. Navigating to signin page...');
    await page.goto('http://localhost:3001/auth/signin');
    
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
      
      // Click sign in
      console.log('5. Clicking sign in button...');
      await page.click('button[type="submit"]');
      
      // Wait a bit
      console.log('6. Waiting for response...');
      await page.waitForTimeout(5000);
      
      // Check where we are
      const currentUrl = page.url();
      console.log(`7. Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('dashboard') || currentUrl.includes('seller')) {
        console.log('✅ LOGIN SUCCESSFUL!');
      } else if (currentUrl.includes('auth/signin')) {
        console.log('❌ Still on signin page - login failed');
        
        // Check for error messages
        const errorText = await page.textContent('body');
        if (errorText.includes('Invalid')) {
          console.log('   Error: Invalid credentials');
        }
      } else {
        console.log('⚠️ Redirected to unexpected page');
      }
    }
    
    console.log('\nKeeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleAuth();