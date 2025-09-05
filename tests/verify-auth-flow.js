#!/usr/bin/env node

/**
 * Verify authentication flow is working correctly after routing improvements
 */

const https = require('https');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          location: res.headers.location,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ statusCode: 0, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ statusCode: 0, error: 'Request timeout' });
    });
    
    req.end();
  });
}

async function testAuthFlow() {
  console.log(colors.cyan + '\n=== Authentication Flow Test ===' + colors.reset);
  console.log('Testing routing improvements after deployment\n');
  
  const tests = [
    {
      name: 'Homepage (Public)',
      url: 'https://stepperslife.com/',
      expectedStatus: 200,
      expectRedirect: false
    },
    {
      name: 'Events Page (Public)',
      url: 'https://stepperslife.com/events',
      expectedStatus: 200,
      expectRedirect: false
    },
    {
      name: 'Sign-In Page',
      url: 'https://stepperslife.com/sign-in',
      expectedStatus: 200,
      expectRedirect: false
    },
    {
      name: 'Sign-Up Page',
      url: 'https://stepperslife.com/sign-up',
      expectedStatus: 200,
      expectRedirect: false
    },
    {
      name: 'Organizer Dashboard (Protected)',
      url: 'https://stepperslife.com/organizer',
      expectedStatus: [307, 302], // Should redirect to sign-in
      expectRedirect: true,
      redirectPattern: /sign-in/
    },
    {
      name: 'Create Event (Protected)',
      url: 'https://stepperslife.com/organizer/new-event',
      expectedStatus: [307, 302], // Should redirect to sign-in
      expectRedirect: true,
      redirectPattern: /sign-in/
    },
    {
      name: 'Profile Page (Protected)',
      url: 'https://stepperslife.com/profile',
      expectedStatus: [307, 302], // Should redirect to sign-in
      expectRedirect: true,
      redirectPattern: /sign-in/
    },
    {
      name: 'Seller Route (Legacy Redirect)',
      url: 'https://stepperslife.com/seller',
      expectedStatus: [308, 301], // Permanent redirect
      expectRedirect: true,
      redirectPattern: /organizer/
    },
    {
      name: 'Non-existent Page (404)',
      url: 'https://stepperslife.com/this-page-does-not-exist',
      expectedStatus: 404,
      expectRedirect: false
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const response = await makeRequest(test.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SteppersLife-Auth-Test/1.0'
      }
    });
    
    if (response.error) {
      console.log(colors.red + `✗ Error: ${response.error}` + colors.reset);
      failed++;
      continue;
    }
    
    let success = false;
    let message = '';
    
    // Check status code
    const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
    if (!expectedStatuses.includes(response.statusCode)) {
      message = `Expected status ${expectedStatuses.join(' or ')}, got ${response.statusCode}`;
    }
    // Check redirect
    else if (test.expectRedirect) {
      if (!response.location) {
        message = 'Expected redirect but got none';
      } else if (test.redirectPattern && !test.redirectPattern.test(response.location)) {
        message = `Redirect to ${response.location} doesn't match expected pattern`;
      } else {
        success = true;
        message = `→ ${response.location}`;
      }
    } else if (!test.expectRedirect && response.location) {
      message = `Unexpected redirect to ${response.location}`;
    } else {
      success = true;
    }
    
    if (success) {
      console.log(colors.green + '✓' + colors.reset + (message ? ' ' + message : ''));
      passed++;
    } else {
      console.log(colors.red + '✗ ' + message + colors.reset);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + colors.cyan + '=== Test Summary ===' + colors.reset);
  console.log(`Total: ${passed + failed} tests`);
  console.log(colors.green + `Passed: ${passed}` + colors.reset);
  if (failed > 0) {
    console.log(colors.red + `Failed: ${failed}` + colors.reset);
  }
  
  // Check Clerk headers
  console.log('\n' + colors.cyan + '=== Clerk Authentication Check ===' + colors.reset);
  const clerkResponse = await makeRequest('https://stepperslife.com/organizer', {
    method: 'HEAD'
  });
  
  if (clerkResponse.headers) {
    const clerkHeaders = Object.keys(clerkResponse.headers)
      .filter(h => h.toLowerCase().includes('clerk'))
      .reduce((obj, key) => {
        obj[key] = clerkResponse.headers[key];
        return obj;
      }, {});
    
    if (Object.keys(clerkHeaders).length > 0) {
      console.log('Clerk headers found:');
      Object.entries(clerkHeaders).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log(colors.yellow + 'No Clerk headers found (may need deployment time)' + colors.reset);
    }
  }
  
  // Final verdict
  console.log('\n' + colors.bright);
  if (failed === 0) {
    console.log(colors.green + '✅ All authentication flow tests passed!' + colors.reset);
    console.log('The routing system is working correctly.');
  } else {
    console.log(colors.yellow + '⚠️ Some tests failed.' + colors.reset);
    console.log('This might be due to deployment lag. Wait 2-3 minutes and try again.');
  }
  console.log(colors.reset);
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run the test
testAuthFlow().catch(error => {
  console.error(colors.red + 'Test execution failed:', error.message + colors.reset);
  process.exit(1);
});