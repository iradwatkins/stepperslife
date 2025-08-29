const { chromium } = require('playwright');

async function debugAuth() {
  console.log('🔍 Debugging authentication issue...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // First, check the CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await page.goto('https://stepperslife.com/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('   CSRF token received:', csrfData.csrfToken ? 'Yes' : 'No');
    
    // Check signin page
    console.log('\n2. Loading signin page...');
    await page.goto('https://stepperslife.com/auth/signin');
    
    // Try to sign in via API directly
    console.log('\n3. Attempting signin via API...');
    const response = await page.evaluate(async () => {
      // Get CSRF token first
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();
      
      // Try to sign in
      const signinRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          csrfToken: csrfToken,
          email: 'test@stepperslife.com',
          password: 'Test123!',
          callbackUrl: '/dashboard'
        })
      });
      
      return {
        status: signinRes.status,
        statusText: signinRes.statusText,
        url: signinRes.url,
        headers: Object.fromEntries(signinRes.headers.entries())
      };
    });
    
    console.log('   Response status:', response.status);
    console.log('   Response URL:', response.url);
    console.log('   Location header:', response.headers.location || 'none');
    
    // Check session
    console.log('\n4. Checking session...');
    const sessionResponse = await page.goto('https://stepperslife.com/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('   Session data:', JSON.stringify(sessionData, null, 2));
    
    // Check cookies after login attempt
    console.log('\n5. Checking cookies...');
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('auth') || c.name.includes('next'));
    console.log('   Auth-related cookies:');
    authCookies.forEach(c => {
      console.log(`   - ${c.name}: ${c.secure ? 'SECURE' : 'NOT SECURE'}, domain: ${c.domain}`);
    });
    
    // Check if we can access a protected page
    console.log('\n6. Testing protected page access...');
    const protectedResponse = await page.goto('https://stepperslife.com/seller/new-event', {
      waitUntil: 'load'
    });
    const finalUrl = page.url();
    console.log('   Final URL:', finalUrl);
    console.log('   Access result:', finalUrl.includes('/auth/signin') ? '❌ Redirected to login' : '✅ Access granted');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Debug complete');
  }
}

debugAuth();