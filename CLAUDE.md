# SteppersLife Migration: Clerk→Auth.js | Stripe→Square

## Migration Status
**Date**: 2025-08-19
**Project**: SteppersLife Ticket Marketplace
**URL**: https://stepperslife.com
**Coolify**: http://72.60.28.175:3000

## Changes Made

### Authentication Migration (Clerk → Auth.js)

#### 1. Updated Header Component
- **File**: `/components/Header.tsx`
- Replaced Clerk imports with next-auth/react
- Changed SignInButton/SignedIn/SignedOut to useSession hook
- Updated UserButton to custom dropdown with signOut

#### 2. Updated App Layout
- **File**: `/app/layout.tsx`
- Replaced ClerkProvider with SessionProvider
- Created new SessionProvider component
- Updated metadata

#### 3. Updated SyncUserWithConvex
- **File**: `/components/SyncUserWithConvex.tsx`
- Replaced useUser from Clerk with useSession from next-auth
- Updated user sync logic to work with Auth.js session

#### 4. Updated EventCard Component
- **File**: `/components/EventCard.tsx`
- Replaced useUser with useSession
- Updated userId references to handle email fallback

#### 5. Updated PurchaseTicket Component
- **File**: `/components/PurchaseTicket.tsx`
- Replaced useUser with useSession
- Changed import from createStripeCheckoutSession to createSquareCheckoutSession

### Payment Migration (Stripe → Square)

#### 1. Fixed Square Webhook
- **File**: `/app/api/webhooks/square/route.ts`
- Fixed webhooksHelper import to use getWebhooksHelper()
- Made it async to handle Vault credentials

#### 2. Updated Square Checkout Action
- **File**: `/app/actions/createSquareCheckoutSession.ts`
- Replaced Clerk auth with Auth.js auth
- Fixed imports for Square functions

### Database Schema Updates

#### 1. Updated Users Table
- **File**: `/convex/schema.ts`
- Replaced `stripeConnectId` with `squareLocationId` and `squareMerchantId`

### New Files Created

#### Auth Pages
- `/app/auth/signup/page.tsx` - User registration page
- `/app/auth/error/page.tsx` - Auth error handling page
- `/app/auth/signout/page.tsx` - Sign out page
- `/components/SessionProvider.tsx` - Next-auth session provider wrapper

#### Square Actions
- `/app/actions/createSquareSellerAccount.ts` - Square seller onboarding
- `/app/actions/getSquareSellerAccount.ts` - Get seller account status
- `/app/actions/refundSquarePayment.ts` - Process Square refunds

### Files Removed

#### Stripe Files (All removed)
- `/lib/stripe.ts`
- `/app/actions/createStripeCheckoutSession.ts`
- `/app/actions/createStripeConnectAccountLink.ts`
- `/app/actions/createStripeConnectCustomer.ts`
- `/app/actions/createStripeConnectLoginLink.ts`
- `/app/actions/getStripeConnectAccount.ts`
- `/app/actions/getStripeConnectAccountStatus.ts`
- `/app/api/webhooks/stripe/route.ts`

## Complete Migration Summary

### All Components Updated
- ✅ All Clerk imports replaced with next-auth/react
- ✅ All Stripe files removed
- ✅ Square integration implemented
- ✅ Auth.js properly configured
- ✅ Build errors fixed

### Known Issues Resolved
- Fixed undefined SignInButton component
- Updated all user references to handle email fallback
- Removed Stripe Connect pages
- Fixed Square webhook implementation
- Updated Convex schema and queries

## Testing Checklist
- [ ] User sign in with credentials
- [ ] User sign in with Google OAuth
- [ ] User sign in with GitHub OAuth
- [ ] User sign up flow
- [ ] Session persistence
- [ ] Protected routes
- [ ] Event creation
- [ ] Ticket purchase with Square
- [ ] Square webhook handling
- [ ] Seller onboarding
- [ ] Refund processing

## Environment Variables Required
```env
# Auth.js
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
SQUARE_APPLICATION_ID=

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

## Commands
```bash
# Development
npm run dev

# Build
npm run build

# Deploy to Coolify
git push origin main
```