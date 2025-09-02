# Google Maps API Fix Guide

## Current Issue
- **Error**: InvalidKeyMapError
- **API Key**: AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
- **Problem**: API key restrictions don't match the domain or key is invalid

## Required Actions in Google Cloud Console

### 1. Check API Key Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Find the API key: `AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE`
4. Click on the key to edit

### 2. Update HTTP Referrer Restrictions
Add the following domains to the allowed list:
```
https://stepperslife.com/*
https://www.stepperslife.com/*
http://localhost:3000/*
http://localhost:3001/*
http://72.60.28.175:3000/*
```

### 3. Verify Enabled APIs
Ensure these APIs are enabled:
- Maps JavaScript API
- Places API
- Geocoding API

### 4. Check Billing
- Verify billing account is active
- Check if quota limits are not exceeded

## Alternative: Create New API Key

If the current key cannot be fixed:

1. Create a new API key in Google Cloud Console
2. Enable required APIs (Maps JavaScript, Places, Geocoding)
3. Set appropriate restrictions
4. Update the environment variables

## Environment Variable Updates

Update the following files with the working API key:

### Local Development (.env.local)
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Production (.env.production)
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Deploy Scripts
Update all deployment scripts to use the correct key.

## Testing Steps

1. **Local Test**:
```bash
npm run dev
# Visit http://localhost:3000/organizer/new-event
# Test address autocomplete
```

2. **Production Test**:
```bash
# Deploy to production
git push origin main
# Visit https://stepperslife.com/organizer/new-event
# Test address autocomplete
```

## Verification Commands

```bash
# Check if API key is loaded
curl -s https://stepperslife.com/organizer/new-event | grep -o "AIzaSy[A-Za-z0-9_-]*"

# Test API directly
curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY"
```

## Fallback Solution

If Google Maps continues to fail, the application will automatically fall back to SimpleAddressInput component for manual address entry.