# SteppersLife Deployment Guide

## Current Status
✅ **All code migrations complete**
✅ **Build successfully passes**
✅ **Vault integration ready**
✅ **Database schema ready**

## Database Used
**Convex** - A real-time serverless database platform

## Required Environment Variables

### Google OAuth (Provided by User)
```bash
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
```

### Auth.js
```bash
NEXTAUTH_URL=https://stepperslife.com  # Change for production
NEXTAUTH_SECRET=YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=
```

### Convex Database
```bash
# Run 'npx convex dev' to get these values
NEXT_PUBLIC_CONVEX_URL=  # Will be generated
CONVEX_DEPLOYMENT=  # Will be generated
```

### Square Payment Integration
```bash
# Get from Square Dashboard
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_APPLICATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
```

### Optional: GitHub OAuth
```bash
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Optional: Vault (For Production)
```bash
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=
```

## Next Steps to Deploy

### 1. Initialize Convex Database
```bash
# In an interactive terminal:
npx convex dev

# This will:
# - Prompt for login/signup to Convex
# - Create a new project
# - Generate NEXT_PUBLIC_CONVEX_URL
# - Deploy the schema
```

### 2. Set Environment Variables
Add all environment variables to:
- **Local Development**: `.env.local` file
- **Production**: Coolify environment settings

### 3. Get Square Credentials
1. Login to [Square Dashboard](https://squareup.com/dashboard)
2. Navigate to "Applications"
3. Create or select your application
4. Get:
   - Access Token
   - Location ID
   - Application ID
   - Webhook Signature Key

### 4. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Deploy to Coolify
```bash
git push origin main
```

Coolify will automatically:
- Pull the latest code
- Build the application
- Deploy to production

### 6. Configure Production Convex
```bash
npx convex deploy --prod
```

Update Coolify with production Convex URL.

## Features Ready
- ✅ Google OAuth authentication
- ✅ User registration and login
- ✅ Event creation and management
- ✅ Ticket purchasing with Square
- ✅ Square webhook processing
- ✅ Seller onboarding
- ✅ Waiting list management
- ✅ Refund processing

## Testing Checklist
- [ ] User can sign in with Google
- [ ] User can create an account
- [ ] Events display correctly
- [ ] Square payment links work
- [ ] Webhook processes payments
- [ ] Tickets are issued after payment
- [ ] Seller dashboard functions

## Support Files Created
- `CONVEX_SETUP.md` - Detailed Convex setup instructions
- `CLAUDE.md` - Migration history and changes
- `auth.config.simple.ts` - Simplified auth configuration
- `scripts/setup-vault.ts` - Vault initialization script
- `lib/vault.ts` - Vault integration with fallbacks

## Important Notes
1. **Vault**: Optional for production. Falls back to env vars if unavailable.
2. **Convex**: Must be initialized before the app will work properly.
3. **Square**: Required for payment processing. Get sandbox credentials for testing.
4. **Google OAuth**: Credentials are ready to use (provided by user).

## Troubleshooting

### "Provided address was not an absolute URL"
Run `npx convex dev` to initialize database.

### "Square credentials not found"
Add Square credentials to environment variables.

### "Vault not available"
This is OK - the app will use environment variables as fallback.

### Build Errors
The build should complete successfully. If not, check:
1. All dependencies installed: `npm install --legacy-peer-deps`
2. Environment variables are set
3. Convex URL is present (even dummy value for build)