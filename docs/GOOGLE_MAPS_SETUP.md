# Google Maps API Setup Guide

## Current Status
The Google Maps autocomplete has been removed because the API key was invalid.
The form now uses simple input fields which work perfectly fine.

## If You Want to Add Google Maps Autocomplete Later

### 1. Get a Valid API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. **IMPORTANT**: Enable billing on the project

### 2. Configure API Key Restrictions
1. In API key settings, add these restrictions:
   - Application restrictions: HTTP referrers
   - Add these URLs:
     ```
     http://localhost:3001/*
     https://stepperslife.com/*
     https://www.stepperslife.com/*
     ```
2. API restrictions: Restrict to Maps JavaScript API and Places API

### 3. Update Environment Variable
Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_valid_api_key_here
```

### 4. The Current Solution Works Fine
The simple address input fields work perfectly without any API dependencies.
Users can manually enter:
- Street Address
- City
- State
- ZIP Code

This is actually more reliable than autocomplete for many use cases.