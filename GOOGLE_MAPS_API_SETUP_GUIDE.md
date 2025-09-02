# Google Maps API Complete Setup Guide

## Current Status ⚠️
Both API keys are currently **non-functional**:
- Production key (`AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE`): Invalid/expired
- Development key (`AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM`): Has referer restrictions, legacy APIs not enabled

## Immediate Actions Required

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select the correct project (or create a new one)
3. Navigate to "APIs & Services" → "Credentials"

### Step 2: Create Two API Keys

#### A. Browser API Key (for frontend)
1. Click "CREATE CREDENTIALS" → "API key"
2. Name it: "SteppersLife Browser Key"
3. Set restrictions:
   - Application restrictions: "HTTP referrers"
   - Add these referrers:
     ```
     https://stepperslife.com/*
     https://www.stepperslife.com/*
     http://localhost:3000/*
     http://localhost:3001/*
     http://72.60.28.175:3000/*
     ```
4. API restrictions: Select these APIs:
   - Maps JavaScript API
   - Places API (New)

#### B. Server API Key (for backend/testing)
1. Click "CREATE CREDENTIALS" → "API key"
2. Name it: "SteppersLife Server Key"
3. Set restrictions:
   - Application restrictions: "None" (for testing) or "IP addresses" for production
   - If using IP restrictions, add: `72.60.28.175`
4. API restrictions: Select these APIs:
   - Geocoding API
   - Places API (New)

### Step 3: Enable Required APIs
Navigate to "APIs & Services" → "Library" and enable:
1. **Maps JavaScript API** (for map display)
2. **Places API (New)** (for autocomplete - NOT the legacy one)
3. **Geocoding API** (for address validation)

### Step 4: Verify Billing
1. Go to "Billing" in Google Cloud Console
2. Ensure a billing account is linked
3. Google provides $200/month free credit

### Step 5: Update Application

#### Update Environment Variables
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_KEY_HERE
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY_HERE

# .env.production
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_KEY_HERE
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY_HERE
```

#### Update Deployment Scripts
Update `DEPLOY_FINAL.sh` and other deployment scripts with new keys.

### Step 6: Deploy Changes
```bash
# Commit and push
git add .
git commit -m "Update Google Maps API keys"
git push origin main

# Or manual deployment
ssh root@72.60.28.175
cd /opt/stepperslife
git pull
./DEPLOY_FINAL.sh
```

## Testing Procedure

### 1. Test API Keys
```bash
# Test the new keys
node test-google-maps-api.js
```

### 2. Test Local Development
```bash
npm run dev
# Visit http://localhost:3000/organizer/new-event
# Type an address and verify autocomplete works
```

### 3. Test Production
```bash
# After deployment
curl -s https://stepperslife.com/organizer/new-event | grep "maps.googleapis"
# Should see the script tag with your API key
```

## Troubleshooting

### Error: InvalidKeyMapError
- API key doesn't match domain restrictions
- Add current domain to allowed referrers

### Error: REQUEST_DENIED
- API not enabled in Google Cloud Console
- Billing not set up
- Wrong type of restrictions for the API

### Error: Places API Legacy
- Using old Places API
- Enable "Places API (New)" instead

### Error: Referer restrictions
- Server-side calls failing
- Use unrestricted key for server-side operations

## Fallback Solution
The application includes `SimpleAddressInput` component that activates automatically if Google Maps fails, allowing manual address entry.

## Monitoring
Check API usage regularly:
1. Google Cloud Console → APIs & Services → Metrics
2. Set up alerts for quota limits
3. Monitor for unusual usage patterns

## Security Best Practices
1. Use different keys for development and production
2. Restrict API keys appropriately
3. Never commit API keys to public repos
4. Rotate keys periodically
5. Monitor usage for anomalies

## Contact for Issues
If you need help setting up the Google Cloud project:
1. Check Google Maps Platform documentation
2. Contact Google Cloud Support
3. Review error logs in browser console