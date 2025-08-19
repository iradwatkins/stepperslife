# SteppersLife - Quick Setup Guide

## 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

## 2. Set Up Environment Variables
```bash
# Copy the example file
cp .env.local .env.local.backup

# Edit .env.local with your actual values
# You MUST add:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - Google OAuth credentials
# - Square API keys
```

## 3. Set Up Convex Database
```bash
# Install Convex CLI
npm install -g convex

# Deploy to Convex (creates new deployment)
npx convex dev
# Then in another terminal:
npx convex deploy
```

## 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 5. Build for Production
```bash
npm run build
npm start
```

## 6. Deploy to Coolify
1. Push to GitHub
2. Coolify webhook will auto-deploy
3. Make sure webhook URL is in GitHub secrets:
   - COOLIFY_WEBHOOK_URL=http://72.60.28.175:8000/webhooks/source/github/events/manual

## IMPORTANT NOTES
- NO test banners should appear
- Site should show EventsDisplay component
- Payments: Square, PayPal, Cash App only (NO Stripe!)
- If site shows old cached version, clear all caches!

## Troubleshooting Cache Issues
If the site shows old content:
1. Add `?v=${Date.now()}` to URLs
2. Clear browser cache
3. Check response headers - should NOT have long cache times
4. On server: `rm -rf .next/cache`
5. Restart the application

## File Structure
- `/app` - Next.js pages and API routes
- `/components` - React components
- `/convex` - Database functions and schema
- `/lib` - Utility functions
- `/public` - Static assets
- `/hooks` - React hooks