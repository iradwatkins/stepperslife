#!/usr/bin/env node

const https = require('https');

// Test Google Maps API Key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE';

console.log('Testing Google Maps API Key:', API_KEY.substring(0, 10) + '...');
console.log('');

// Test 1: Geocoding API
const testGeocoding = () => {
  return new Promise((resolve) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.status === 'OK') {
          console.log('✅ Geocoding API: Working');
        } else {
          console.log('❌ Geocoding API:', result.status);
          if (result.error_message) {
            console.log('   Error:', result.error_message);
          }
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Geocoding API: Network error', err.message);
      resolve();
    });
  });
};

// Test 2: Places API (findplacefromtext)
const testPlaces = () => {
  return new Promise((resolve) => {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.status === 'OK') {
          console.log('✅ Places API: Working');
        } else {
          console.log('❌ Places API:', result.status);
          if (result.error_message) {
            console.log('   Error:', result.error_message);
          }
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Places API: Network error', err.message);
      resolve();
    });
  });
};

// Run tests
const runTests = async () => {
  console.log('=== Google Maps API Key Test ===');
  console.log('');
  
  await testGeocoding();
  await testPlaces();
  
  console.log('');
  console.log('=== Test Complete ===');
  console.log('');
  console.log('If you see errors above:');
  console.log('1. Check if the API key is valid');
  console.log('2. Verify APIs are enabled in Google Cloud Console:');
  console.log('   - Maps JavaScript API');
  console.log('   - Places API');
  console.log('   - Geocoding API');
  console.log('3. Check if billing is enabled');
  console.log('4. Verify domain restrictions (if any) in API key settings');
};

runTests();