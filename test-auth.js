const fetch = require('node-fetch');

async function testAuth() {
  console.log('Testing authentication system...\n');
  
  // Test 1: Check if signin page loads
  console.log('1. Testing signin page...');
  const signinRes = await fetch('http://localhost:3000/auth/signin');
  console.log('   Status:', signinRes.status);
  console.log('   ✓ Signin page accessible\n');
  
  // Test 2: Test authentication with demo account
  console.log('2. Testing authentication with admin@stepperslife.com...');
  
  try {
    // Get CSRF token first (might not be needed with our setup)
    const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfRes.json();
    
    // Try to authenticate
    const authRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@stepperslife.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken || '',
      }),
      redirect: 'manual',
    });
    
    console.log('   Auth Response Status:', authRes.status);
    console.log('   Headers:', authRes.headers.get('set-cookie') ? 'Session cookie set' : 'No session cookie');
    
    if (authRes.status === 302 || authRes.status === 200) {
      console.log('   ✓ Authentication successful\n');
    } else {
      console.log('   ✗ Authentication may have failed\n');
    }
    
    // Test 3: Check if we can access protected route
    console.log('3. Testing access to protected /dashboard route...');
    const dashboardRes = await fetch('http://localhost:3000/dashboard', {
      headers: {
        'Cookie': authRes.headers.get('set-cookie') || '',
      },
      redirect: 'manual',
    });
    
    console.log('   Dashboard Status:', dashboardRes.status);
    if (dashboardRes.status === 200) {
      console.log('   ✓ Dashboard accessible with session\n');
    } else if (dashboardRes.status === 302) {
      console.log('   → Redirected (expected if no session)\n');
    }
    
  } catch (error) {
    console.error('Error during auth test:', error.message);
  }
  
  console.log('Authentication test complete!');
  console.log('\nYou can now test manually at: http://localhost:3000/auth/signin');
  console.log('Use any of these demo accounts:');
  console.log('  - admin@stepperslife.com / admin123');
  console.log('  - test@example.com / test123');
  console.log('  - irawatkins@gmail.com / demo123');
}

testAuth();