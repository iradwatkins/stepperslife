# 🚀 Production Deployment to Coolify

## ✅ Current Status
- **Convex Database**: `little-jellyfish-146` (Development)
- **Google OAuth**: Configured and ready
- **Application**: Running successfully on localhost:3001

## Step 1: Get Production Convex Deploy Key

1. Go to: https://dashboard.convex.dev
2. Click on your **stepperslife** project
3. Navigate to: **Settings** → **Deploy Keys**
4. Click **"Generate a production deploy key"**
5. Copy the key (starts with `prod:`)

## Step 2: Set Coolify Environment Variables

In your Coolify dashboard at http://72.60.28.175:3000:

Add these environment variables:

```bash
# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://little-jellyfish-146.convex.cloud
CONVEX_DEPLOY_KEY=prod:[YOUR_DEPLOY_KEY_HERE]

# Auth.js
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=

# Google OAuth (Your credentials)
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]

# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife

# Square (Add when ready)
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_APPLICATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
```

## Step 3: Update Google OAuth Redirect URIs

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add these Authorized redirect URIs:
   - `https://stepperslife.com/api/auth/callback/google`
   - `http://stepperslife.com/api/auth/callback/google`
   - `http://72.60.28.175/api/auth/callback/google` (backup)

## Step 4: Update Build Command in Coolify

Set your build command to:
```bash
npm install --legacy-peer-deps && npx convex deploy && npm run build
```

This will:
1. Install dependencies
2. Deploy Convex schema to production
3. Build the Next.js application

## Step 5: Deploy to Coolify

```bash
git add -A
git commit -m "Production deployment configuration"
git push origin main
```

Coolify will automatically:
- Pull the latest code
- Run the build command
- Deploy to production

## Step 6: Verify Deployment

1. Visit: https://stepperslife.com
2. Test:
   - [ ] Homepage loads
   - [ ] Google OAuth login works
   - [ ] Events display correctly
   - [ ] Database connection active

## Optional: Square Payment Setup

When ready to add payments:

1. **Get Square Credentials**:
   - Login to: https://squareup.com/dashboard
   - Go to: Applications → Your App
   - Copy: Access Token, Location ID, Application ID

2. **Setup Webhook**:
   - In Square Dashboard → Webhooks
   - Add endpoint: `https://stepperslife.com/api/webhooks/square`
   - Subscribe to: `payment.created`, `payment.updated`
   - Copy the Signature Key

3. **Add to Coolify Environment**:
   ```bash
   SQUARE_ACCESS_TOKEN=[your_token]
   SQUARE_LOCATION_ID=[your_location_id]
   SQUARE_APPLICATION_ID=[your_app_id]
   SQUARE_WEBHOOK_SIGNATURE_KEY=[your_signature_key]
   ```

## Monitoring Your Production App

### Convex Dashboard
- URL: https://dashboard.convex.dev
- Monitor: Functions, Data, Logs
- Your project: `stepperslife`

### Coolify Dashboard
- URL: http://72.60.28.175:3000
- Monitor: Deployments, Logs, Resources

## Troubleshooting

### "Convex deployment failed"
- Make sure `CONVEX_DEPLOY_KEY` is set correctly
- Check if the key starts with `prod:`

### "Google OAuth not working"
- Verify redirect URIs are added in Google Console
- Check `NEXTAUTH_URL` matches your domain

### "Database not connecting"
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex dashboard for errors

## Success Checklist

- [ ] Convex deploy key generated
- [ ] Environment variables set in Coolify
- [ ] Google OAuth redirect URIs updated
- [ ] Build command updated
- [ ] Code pushed to GitHub
- [ ] Site accessible at stepperslife.com
- [ ] Google login working
- [ ] Database connected

## Your App is Ready! 🎉

Once deployed, your SteppersLife ticket marketplace will be:
- **Live** at https://stepperslife.com
- **Secured** with Google OAuth
- **Connected** to Convex real-time database
- **Ready** for Square payments (when configured)