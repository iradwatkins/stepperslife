# Fix for Clerk and Google Maps Errors

## Error 1: Clerk Authentication Error
**Error**: "Invalid host - We were unable to attribute this request to an instance running on Clerk"

### Solution:
You're using production Clerk keys (`pk_live_`) in local development. You need to either:

**Option A: Use Development Keys (Recommended)**
1. Go to https://dashboard.clerk.com/
2. Switch to your development instance
3. Get the development keys (they start with `pk_test_`)
4. Update `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_KEY
CLERK_SECRET_KEY=sk_test_YOUR_DEV_SECRET
```

**Option B: Add localhost to Production Instance**
1. Go to https://dashboard.clerk.com/
2. Select your production instance
3. Go to Settings → Domains
4. Add `localhost:3000` as an allowed domain

## Error 2: Google Maps InvalidKeyMapError

### This means one of:
1. **API key restrictions don't include localhost:3000**
2. **Required APIs not enabled**
3. **Billing not set up**

### Fix Steps:

#### Step 1: Check API Key in Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key (AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM)
3. Click to edit it

#### Step 2: Update HTTP Referrer Restrictions
Make sure these are in the list:
```
http://localhost:3000/*
http://localhost:3001/*
https://stepperslife.com/*
https://www.stepperslife.com/*
http://192.168.*
http://72.60.28.175:3000/*
```

#### Step 3: Enable Required APIs
Go to: https://console.cloud.google.com/apis/library

Enable ALL of these:
1. **Maps JavaScript API** ✅
2. **Places API** (the NEW one, not legacy) ✅
3. **Geocoding API** ✅

#### Step 4: Check Billing
Go to: https://console.cloud.google.com/billing
- Ensure billing account is active
- Check if you've exceeded the free tier ($200/month)

## Quick Test Command

After fixing, test the API key directly:
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway&key=AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM"
```

Should return:
- `"status": "OK"` = Working
- `"status": "REQUEST_DENIED"` = API key issue
- `"error_message"` will tell you what's wrong

## Alternative: Create New API Key

If the current key won't work:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" → "API key"
3. Name it: "SteppersLife Local Dev"
4. Set HTTP referrer restrictions for localhost
5. Enable the 3 APIs mentioned above
6. Update `.env.local` with new key

## Test After Fixing

1. Restart dev server:
```bash
npm run dev
```

2. Visit: http://localhost:3000/test-google-maps

3. Check browser console - should see:
```
✅ Google Places Autocomplete initialized successfully
```

Not:
```
🔴 API Key Error - Switching to manual mode
```