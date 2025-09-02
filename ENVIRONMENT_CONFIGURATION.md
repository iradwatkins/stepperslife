# Environment Configuration Guide

## Current Setup ✅

### Development (localhost:3000)
Using **Development Clerk Instance**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cm9idXN0LWZsb3VuZGVyLTc2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_IdUvBTzFnGLzA6TIKUN4UPiOx25PhWDSXLlrgrE1ul
```
- Domain: `robust-flounder-76.clerk.accounts.dev`
- Satellite domain: `localhost:3000` ✅ Verified

### Production (stepperslife.com)
Using **Production Clerk Instance**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq
```
- Domain: `stepperslife.com`
- Frontend API: `clerk.stepperslife.com`

## File Structure

### `.env.local` (For Development)
```env
# Convex
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud

# Clerk Development Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cm9idXN0LWZsb3VuZGVyLTc2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_IdUvBTzFnGLzA6TIKUN4UPiOx25PhWDSXLlrgrE1ul

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### `.env.production` (For Production Deployment)
```env
# Convex
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud

# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM

# Other production settings...
```

## Key Differences

| Environment | Clerk Instance | Key Prefix | Domain |
|------------|---------------|------------|---------|
| Development | Development | `pk_test_` / `sk_test_` | localhost:3000 |
| Production | Production | `pk_live_` / `sk_live_` | stepperslife.com |

## Testing

### Local Development
```bash
npm run dev
# Visit http://localhost:3000
# Should work without Clerk errors
```

### Production Build Test
```bash
npm run build
npm run start
# Test production build locally
```

### Deploy to Production
```bash
git push origin main
# GitHub Actions will deploy with production keys
```

## Troubleshooting

### "Invalid host" Error
- **Cause**: Using wrong Clerk keys for the environment
- **Fix**: Ensure development keys for localhost, production keys for stepperslife.com

### Google Maps Not Working
- **Check**: API key is valid and domains are whitelisted
- **Fix**: Add domain to Google Cloud Console API restrictions

## Important Notes

1. **Never commit `.env.local`** - It contains sensitive keys
2. **Keep development and production separate** - Different Clerk instances
3. **Users are separate** - Dev and prod have different user databases
4. **Test in development first** - Always test features locally before deploying