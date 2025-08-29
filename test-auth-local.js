const { chromium } = require('playwright');

async function testAuth() {
  console.log('Testing authentication locally...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser
    timeout: 30000 
  });
  
  const page = await browser.newPage();
  
  try {
    // Test with local server
    console.log('1. Navigating to local signin page...');
    await page.goto('http://localhost:3001/auth/signin');
    
    // Check if form is visible
    const emailVisible = await page.locator('input[type="email"]').isVisible();
    const passwordVisible = await page.locator('input[type="password"]').isVisible();
    
    console.log(`2. Email input visible: ${emailVisible ? '✅' : '❌'}`);
    console.log(`3. Password input visible: ${passwordVisible ? '✅' : '❌'}`);
    
    // Test with correct credentials
    console.log('\n4. Testing with test@stepperslife.com / Test123!');
    await page.fill('input[type="email"]', 'test@stepperslife.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`   Result URL: ${currentUrl}`);
    
    if (!currentUrl.includes('auth/signin')) {
      console.log('   ✅ LOGIN SUCCESSFUL - Redirected from signin!');
    } else {
      console.log('   ❌ Still on signin page');
      
      // Check for errors
      const errorElement = await page.locator('.bg-red-50').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`   Error: ${errorText}`);
      }
    }
    
    // Clear and try legacy credentials
    await page.goto('http://localhost:3001/auth/signin');
    console.log('\n5. Testing with legacy test@example.com / test123');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(5000);
    
    const url2 = page.url();
    console.log(`   Result URL: ${url2}`);
    
    if (!url2.includes('auth/signin')) {
      console.log('   ✅ LEGACY LOGIN WORKS!');
    } else {
      console.log('   ❌ Legacy login failed');
    }
    
    console.log('\nKeeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Test complete!');
  }
}

testAuth();