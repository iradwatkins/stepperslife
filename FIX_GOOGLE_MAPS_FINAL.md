# Final Fix for Google Maps Autocomplete

## The Problem
The Google Maps autocomplete isn't working because of API configuration issues in Google Cloud Console.

## Required Google Cloud Console Configuration

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

### Step 2: Enable These APIs (CRITICAL!)
Go to **APIs & Services** → **Library** and enable:

1. **Maps JavaScript API** ✅ (for loading the map library)
2. **Places API** ✅ (for autocomplete - make sure it's the NEW one, not legacy)
3. **Geocoding API** (optional but recommended)

### Step 3: Configure Your API Key
Go to **APIs & Services** → **Credentials**

Find your API key: `AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM`

#### Application Restrictions:
- Set to: **HTTP referrers (websites)**
- Add these referrers:
  ```
  http://localhost:3000/*
  http://localhost:3001/*
  http://192.168.86.30:3000/*
  https://stepperslife.com/*
  https://www.stepperslife.com/*
  http://72.60.28.175:3000/*
  ```

#### API Restrictions:
- Either select "Don't restrict key" (easier for testing)
- OR restrict to specific APIs:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### Step 4: Check Billing
- Go to **Billing** in Google Cloud Console
- Make sure a billing account is linked
- Google provides $200/month free credit

## Common Issues and Solutions

### Issue: "InvalidKeyMapError"
**Cause**: Domain not in referrer list or API not enabled
**Fix**: Add your domain to referrers and enable APIs

### Issue: "Places API: REQUEST_DENIED"
**Cause**: Using legacy Places API or API not enabled
**Fix**: Enable "Places API" (the new one) in API Library

### Issue: "This API key is not authorized for this service"
**Cause**: API restrictions too strict
**Fix**: Either remove API restrictions or add Places API to allowed APIs

## Test Your Configuration

### 1. Direct API Test
Open browser console and run:
```javascript
// This should not throw errors if configured correctly
const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM&libraries=places&callback=testMaps';
window.testMaps = function() {
  console.log('✅ Google Maps loaded!');
  if (window.google.maps.places) {
    console.log('✅ Places API available!');
  } else {
    console.log('❌ Places API not available');
  }
};
document.head.appendChild(script);
```

### 2. Test Autocomplete
Visit: http://localhost:3000/test-google-maps
- Type an address
- Autocomplete dropdown should appear

## If Nothing Works - Alternative Solution

### Option 1: Create a New API Key
1. Create a new API key in Google Cloud Console
2. Don't add any restrictions initially
3. Enable all three APIs mentioned above
4. Test with the unrestricted key
5. Add restrictions once it's working

### Option 2: Use Google's API Key
For testing only, you can try Google's demo API key:
`AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`
(This is Google's official demo key from their documentation)

## The Component Behavior
The `GoogleMapsAddressAutocomplete` component:
- Keeps the input field active even if API fails
- Shows a retry button if Google Maps doesn't load
- Allows manual address entry as fallback
- Retries loading 3 times automatically

## Verification Checklist
- [ ] Maps JavaScript API enabled
- [ ] Places API (new) enabled  
- [ ] API key has correct referrer restrictions
- [ ] Billing is enabled
- [ ] No console errors about API key
- [ ] Autocomplete dropdown appears when typing