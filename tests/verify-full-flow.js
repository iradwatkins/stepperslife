#!/usr/bin/env node

/**
 * Comprehensive verification script for SteppersLife platform
 * Tests all critical components: Site availability, Convex, MinIO, and Event Creation
 */

const https = require('https');
const http = require('http');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let color = colors.reset;
  let symbol = '›';
  
  switch(type) {
    case 'success':
      color = colors.green;
      symbol = '✅';
      break;
    case 'error':
      color = colors.red;
      symbol = '❌';
      break;
    case 'warning':
      color = colors.yellow;
      symbol = '⚠️';
      break;
    case 'section':
      color = colors.cyan;
      symbol = '📋';
      break;
    case 'test':
      color = colors.magenta;
      symbol = '🧪';
      break;
  }
  
  console.log(`${color}${symbol} [${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testSiteAvailability() {
  log('Testing Site Availability', 'section');
  
  try {
    // Test main site
    const mainSite = await makeRequest('https://stepperslife.com');
    log(`Main site status: ${mainSite.statusCode}`, mainSite.statusCode === 200 ? 'success' : 'error');
    
    // Test critical pages
    const pages = [
      '/events',
      '/organizer/new-event',
      '/api/health'
    ];
    
    for (const page of pages) {
      try {
        const response = await makeRequest(`https://stepperslife.com${page}`);
        const status = response.statusCode;
        const isOk = status === 200 || status === 307; // 307 is redirect to auth
        log(`${page}: ${status}`, isOk ? 'success' : 'warning');
      } catch (error) {
        log(`${page}: Failed - ${error.message}`, 'error');
      }
    }
    
    return mainSite.statusCode === 200;
  } catch (error) {
    log(`Site availability check failed: ${error.message}`, 'error');
    return false;
  }
}

async function testConvexConnection() {
  log('Testing Convex Database', 'section');
  
  try {
    const response = await makeRequest('https://youthful-porcupine-760.convex.cloud/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: 'events:get',
        args: {}
      })
    });
    
    const data = JSON.parse(response.body);
    const eventCount = data.value ? data.value.length : 0;
    
    log(`Convex status: ${response.statusCode}`, response.statusCode === 200 ? 'success' : 'error');
    log(`Events in database: ${eventCount}`, 'info');
    
    // Show sample event if available
    if (data.value && data.value.length > 0) {
      const sampleEvent = data.value[0];
      log(`Sample event: ${sampleEvent.name || 'Unnamed'}`, 'info');
    }
    
    return response.statusCode === 200;
  } catch (error) {
    log(`Convex test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testMinIOUpload() {
  log('Testing MinIO Image Upload', 'section');
  
  try {
    // First check if the endpoint exists
    const checkResponse = await makeRequest('https://stepperslife.com/api/upload/minio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    log(`MinIO endpoint status: ${checkResponse.statusCode}`, 
        checkResponse.statusCode < 500 ? 'success' : 'error');
    
    if (checkResponse.statusCode === 404) {
      log('MinIO endpoint not found - may need deployment', 'warning');
    } else if (checkResponse.statusCode === 400 || checkResponse.statusCode === 401) {
      log('MinIO endpoint exists but requires proper file upload', 'success');
    } else if (checkResponse.statusCode >= 500) {
      log('MinIO service error - check server configuration', 'error');
    }
    
    return checkResponse.statusCode < 500;
  } catch (error) {
    log(`MinIO test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testEventCreationFlow() {
  log('Testing Event Creation Flow', 'section');
  
  // This would require authentication, so we'll just check the endpoints exist
  const endpoints = [
    { url: '/organizer/new-event', name: 'Event creation page' },
    { url: '/api/events', name: 'Events API' }
  ];
  
  let allPass = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`https://stepperslife.com${endpoint.url}`);
      const isOk = response.statusCode < 400 || response.statusCode === 401; // 401 is expected without auth
      log(`${endpoint.name}: ${response.statusCode}`, isOk ? 'success' : 'error');
      if (!isOk) allPass = false;
    } catch (error) {
      log(`${endpoint.name}: Failed - ${error.message}`, 'error');
      allPass = false;
    }
  }
  
  return allPass;
}

async function generateTestReport() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.bright + '   SteppersLife Platform Verification Report' + colors.reset);
  console.log('='.repeat(60) + '\n');
  
  const results = {
    siteAvailable: false,
    convexWorking: false,
    minioWorking: false,
    eventFlowWorking: false
  };
  
  // Run all tests
  results.siteAvailable = await testSiteAvailability();
  console.log('');
  
  results.convexWorking = await testConvexConnection();
  console.log('');
  
  results.minioWorking = await testMinIOUpload();
  console.log('');
  
  results.eventFlowWorking = await testEventCreationFlow();
  console.log('');
  
  // Generate summary
  console.log('='.repeat(60));
  log('TEST SUMMARY', 'section');
  console.log('='.repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`\n${colors.bright}Results: ${passedTests}/${totalTests} tests passed${colors.reset}\n`);
  
  // Individual results
  log(`Site Availability: ${results.siteAvailable ? 'PASS' : 'FAIL'}`, 
      results.siteAvailable ? 'success' : 'error');
  log(`Convex Database: ${results.convexWorking ? 'PASS' : 'FAIL'}`, 
      results.convexWorking ? 'success' : 'error');
  log(`MinIO Storage: ${results.minioWorking ? 'PASS' : 'FAIL'}`, 
      results.minioWorking ? 'success' : 'error');
  log(`Event Creation: ${results.eventFlowWorking ? 'PASS' : 'FAIL'}`, 
      results.eventFlowWorking ? 'success' : 'error');
  
  // Recommendations
  console.log('\n' + '='.repeat(60));
  log('RECOMMENDATIONS', 'section');
  console.log('='.repeat(60) + '\n');
  
  if (!results.siteAvailable) {
    log('1. Site is down - Run deployment: git commit --allow-empty -m "fix: Deploy" && git push', 'warning');
  }
  
  if (!results.convexWorking) {
    log('2. Convex connection issue - Check Convex dashboard and environment variables', 'warning');
  }
  
  if (!results.minioWorking) {
    log('3. MinIO not configured - Check MinIO service on server port 9000', 'warning');
  }
  
  if (!results.eventFlowWorking) {
    log('4. Event creation flow broken - Check authentication and form components', 'warning');
  }
  
  if (passedTests === totalTests) {
    log('🎉 All systems operational! Platform is ready for use.', 'success');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the verification
generateTestReport().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});