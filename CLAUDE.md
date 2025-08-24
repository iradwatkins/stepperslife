# SteppersLife Platform Documentation

## Latest Update: Simplified Ticket System v2.0.0
**Date**: 2025-08-24  
**Project**: SteppersLife Event & Ticket Platform  
**URL**: https://stepperslife.com  
**Coolify**: http://72.60.28.175:3000  
**Convex Dashboard**: https://dashboard.convex.dev/t/irawatkins/stepperslife/prod:mild-newt-621

---

## 🎫 SIMPLIFIED TICKET SYSTEM (v2.0.0)

### Core Features
- **No Login Required** for ticket viewing
- **Table/Group Purchases** - Buy entire tables, receive individual tickets
- **QR Codes & 6-Character Codes** for each ticket
- **Shareable Ticket Links** - Direct URLs for each ticket
- **Real-time Scanning** with attendance tracking
- **Mobile-Optimized Scanner** with flashlight support

### Event Management Updates
1. **Selling Tickets Dropdown** (Top of form):
   - "No - Just Posting an Event" (door price only)
   - "Yes - Selling Tickets" (online sales)
   - "Custom Seating" (coming soon)

2. **Event Categories** (Multi-select):
   - Workshop, Sets/Performance, In The Park
   - Trip/Travel, Cruise, Holiday Event
   - Competition, Class/Lesson, Social Dance
   - Party, Other

3. **Dynamic Form Fields**:
   - Shows door price when "Just Posting"
   - Shows ticket fields when "Selling Tickets"

### Mobile Scanner Features
```javascript
// Mobile-optimized configuration
videoConstraints: {
  facingMode: "environment",      // Back camera
  width: { ideal: 1280 },
  height: { ideal: 720 }
},
showTorchButtonIfSupported: true  // Flashlight
```

### Key Pages
- `/test-ticket-system` - Complete system demo
- `/ticket/[ticketId]` - Public ticket view (no auth)
- `/events/[eventId]/scan` - Mobile-ready scanner
- `/seller/new-event` - Enhanced event creation

### New Database Tables
- `tableConfigurations` - Table/group setups
- `simpleTickets` - Individual tickets (no ownership tracking)
- `purchases` - Purchase records
- `scanLogs` - Check-in tracking

---

## 🔄 PREVIOUS MIGRATION (v1.0.0)
**Date**: 2025-08-19

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

---

## ✅ Complete System Status

### Working Features
- ✅ Simplified ticket system with QR codes
- ✅ Table/group purchases
- ✅ Mobile-optimized QR scanner
- ✅ Multi-select event categories
- ✅ Dynamic event creation form
- ✅ Auth.js authentication
- ✅ Square payment integration
- ✅ Convex database integration
- ✅ Service worker with offline support

### Fixed Issues
- ✅ "No valid ticket offer found" error
- ✅ Hydration errors in React
- ✅ Infinite render loops
- ✅ Service worker cache failures
- ✅ QR scanner initialization errors
- ✅ Undefined SignInButton component
- ✅ Square webhook implementation

---

## 📋 Testing Checklist

### Simplified Ticket System
- [ ] Create event with "Just Posting" option
- [ ] Create event with "Selling Tickets" option
- [ ] Select multiple event categories
- [ ] Purchase table/group tickets
- [ ] View tickets without login
- [ ] Scan QR codes on mobile
- [ ] Use manual 6-char entry
- [ ] Test flashlight on scanner

### Authentication
- [ ] User sign in with credentials
- [ ] User sign in with Google OAuth
- [ ] User sign in with GitHub OAuth
- [ ] User sign up flow
- [ ] Session persistence
- [ ] Protected routes

### Payments
- [ ] Event creation
- [ ] Ticket purchase with Square
- [ ] Square webhook handling
- [ ] Seller onboarding
- [ ] Refund processing

---

## 🔐 Environment Variables Required

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
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
```

---

## 🚀 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy to Coolify
git push origin main

# Convex Functions
npx convex dev  # Development
npx convex deploy  # Production
```

---

## 📚 Documentation

- **Simplified Ticket System**: `/docs/SIMPLIFIED_TICKET_SYSTEM.md`
- **API Documentation**: Coming soon
- **Component Library**: Coming soon

---

## 🛟 Support

For issues or questions:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Production URL: https://stepperslife.com
- Coolify Dashboard: http://72.60.28.175:3000

---

## 🚀 MANDATORY DEPLOYMENT RULES - BLUE-GREEN METHOD

### CRITICAL: Production Deployment Requirements
**ALL production deployments MUST follow the blue-green deployment method. NO EXCEPTIONS.**

#### Blue-Green Deployment Process:
1. **PRE-DEPLOYMENT CHECKS** (Blue Environment):
   ```bash
   # Build and test in staging
   npm run build
   npm run test
   npx tsc --noEmit
   ```

2. **GREEN ENVIRONMENT PREPARATION**:
   - Create feature branch: `git checkout -b deploy/[feature-name]`
   - Push to GitHub: `git push origin deploy/[feature-name]`
   - Deploy to staging/preview URL first
   - Run smoke tests on preview deployment

3. **BLUE-GREEN SWITCH**:
   ```bash
   # Only after green environment validation
   git checkout main
   git merge deploy/[feature-name] --no-ff
   git push origin main
   ```

4. **POST-DEPLOYMENT VALIDATION**:
   - Monitor production logs for 5 minutes
   - Check all critical user paths
   - Verify database migrations
   - Confirm Convex functions are synchronized

5. **ROLLBACK PROCEDURE**:
   ```bash
   # If issues detected within 15 minutes
   git revert HEAD
   git push origin main
   npx convex deploy --preview [previous-deployment]
   ```

### Theme Color Scheme Rules:
- **Light Theme**: Primary: Purple (#8B5CF6), Secondary: Teal (#5EEAD4), Accent: Gold (#FCD34D)
- **Dark Theme**: Primary: Purple (#A78BFA), Secondary: Teal (#7DD3C0), Accent: Gold (#FDE68A)
- **ALWAYS** test both themes before deployment
- **NEVER** deploy without theme toggle functionality

### Deployment Checklist (MANDATORY):
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Theme working in both light/dark modes
- [ ] Preview deployment tested
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### Environment-Specific Rules:
- **Development**: Direct push allowed to feature branches
- **Staging**: Deploy to preview URLs via Coolify
- **Production**: ONLY via blue-green method with approval

**ENFORCEMENT**: Any deployment violating these rules will be automatically rejected by CI/CD pipeline.

---

*Last updated by Claude Code using the BMAD Method - 2025-08-24*
*Blue-Green Deployment Rules Added - 2025-08-24*