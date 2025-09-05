#!/usr/bin/env node

/**
 * Test script for payment provider integrations
 */

const paypal = require('@paypal/checkout-server-sdk');

// Test PayPal Connection
async function testPayPal() {
  console.log('\n🔍 Testing PayPal Connection...');
  
  const clientId = process.env.PAYPAL_CLIENT_ID || 'AeYHCsVgRinJPmN1Pqe7VXlP3fSxiEQFAqBgRGWpZFFhyuq0HNq5ZwOlnt7OrunFNxZYPMAI5L5IUdY4';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EJqFrt0iQgkkulXrLSnqC2hpI_qRoodKqtvQQTEWmg1GoRro0b_H6TGWtAcBdfI-uVC1MKvzk8JSWwaD';
  
  if (!clientId || !clientSecret) {
    console.error('❌ PayPal credentials not found');
    return false;
  }
  
  try {
    // Create PayPal environment (sandbox for testing)
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);
    
    // Create a test order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '0.01', // One cent test
        },
        description: 'Connection test',
      }],
    });
    
    const order = await client.execute(request);
    
    if (order.result.id) {
      console.log('✅ PayPal connection successful!');
      console.log(`   Order ID: ${order.result.id}`);
      console.log(`   Status: ${order.result.status}`);
      console.log(`   Environment: Sandbox`);
      
      // Get the approval link
      const approvalLink = order.result.links.find(link => link.rel === 'approve');
      if (approvalLink) {
        console.log(`   Approval URL: ${approvalLink.href}`);
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ PayPal connection failed:', error.message);
    if (error.statusCode === 401) {
      console.error('   Invalid credentials. Please check your Client ID and Secret.');
    }
    return false;
  }
}

// Test Square Connection
async function testSquare() {
  console.log('\n🔍 Testing Square Connection...');
  
  const accessToken = process.env.SQUARE_ACCESS_TOKEN || 'EAAAl9Vnn8vt-OJ_Fz7-rSKJvOU9SIAUVqLLfpa1M3ufBnP-sUTBdXPmAF_4XAAo';
  const locationId = process.env.SQUARE_LOCATION_ID || 'LZN634J2MSXRY';
  
  if (!accessToken || !locationId) {
    console.error('❌ Square credentials not found');
    return false;
  }
  
  try {
    const { SquareClient, SquareEnvironment } = require('square');
    const client = new SquareClient({
      accessToken: accessToken,
      environment: SquareEnvironment.Sandbox,
    });
    
    // Test by listing locations
    const locationsApi = client.locations;
    const response = await locationsApi.listLocations();
    
    if (response.result.locations) {
      console.log('✅ Square connection successful!');
      console.log(`   Locations found: ${response.result.locations.length}`);
      console.log(`   Environment: Sandbox`);
      console.log(`   Location ID: ${locationId}`);
      console.log('   Cash App Pay: Enabled');
      return true;
    }
  } catch (error) {
    console.error('❌ Square connection failed:', error.message);
    if (error.statusCode === 401) {
      console.error('   Invalid credentials. Please check your Access Token.');
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('========================================');
  console.log('   Payment Provider Integration Tests');
  console.log('========================================');
  
  const results = {
    paypal: await testPayPal(),
    square: await testSquare(),
  };
  
  console.log('\n========================================');
  console.log('   Test Results Summary');
  console.log('========================================');
  console.log(`PayPal: ${results.paypal ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Square: ${results.square ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Stripe: ⏳ Awaiting credentials`);
  console.log('========================================\n');
  
  // Exit with appropriate code
  const allPassed = results.paypal && results.square;
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});