# Three-Option Payment Architecture Implementation

## ✅ Completed Implementation Summary
**Date**: January 4, 2025
**Status**: Core Infrastructure Complete

---

## 🎯 What We've Built

### 1. Database Schema (`/convex/schema.ts`)
✅ **Completed Tables:**
- `paymentConfigs` - Stores payment model configuration per event
- `organizerTrust` - Trust levels and scoring for graduated access
- `scheduledPayouts` - Payout scheduling for Premium model
- `chargebacks` - Chargeback tracking across all models

### 2. Trust Scoring System (`/convex/trust/trustScoring.ts`)
✅ **Implemented Features:**
- Automatic trust score calculation (0-100)
- Four trust levels: NEW, BASIC, TRUSTED, VIP
- Dynamic payment option availability
- Event value limits based on trust
- Payout hold period configuration

**Trust Level Requirements:**
```typescript
NEW (0-29 points):
  - First-time organizers
  - Connect & Collect only
  - $1,000 max event value

BASIC (30-59 points):  
  - 1+ completed events
  - Connect & Collect + Premium
  - $5,000 max event value
  - 7-day hold on Premium payouts

TRUSTED (60-84 points):
  - 3+ completed events
  - All three payment options
  - $25,000 max event value
  - 5-day hold on Premium payouts

VIP (85-100 points):
  - High-volume organizers
  - All options + instant payouts
  - $100,000 max event value
  - 3-day hold on Premium payouts
```

### 3. Payment Model Selector UI (`/components/payment/PaymentModelSelector.tsx`)
✅ **Features:**
- Visual trust level indicator with progress bar
- Three payment option cards with lock states
- Real-time fee calculator
- Pros/cons display for each option
- Requirements for locked options
- Fee comparison table

### 4. Connect & Collect Implementation (`/convex/payments/connectCollect.ts`)
✅ **Option 1 Features:**
- OAuth token storage for Stripe/Square/PayPal
- $2.00 fixed platform fee per ticket
- Application fee processing
- Instant payouts to organizer
- Organizer handles chargebacks

**Fee Structure:**
```
Platform Fee: $2.00 per ticket (fixed)
Processing: Handled by organizer's account
Organizer Receives: Ticket Price - $2.00
```

### 5. Premium Processing Implementation (`/convex/payments/premiumProcessing.ts`)
✅ **Option 2 Features:**
- SteppersLife processes all payments
- 6.6% + $1.79 total fees (matching Eventbrite)
- Scheduled payouts 5 days post-event
- Platform handles chargebacks
- 10% chargeback reserve

**Fee Breakdown:**
```
Service Fee: 3.7% + $1.79
Processing Fee: 2.9%
Total: ~6.6% + $1.79
Example: $50 ticket = $5.09 in fees
```

---

## 📋 Implementation Checklist

### ✅ Completed
- [x] Database schema with all payment tables
- [x] Trust scoring and level calculation
- [x] Payment model selector component
- [x] Connect & Collect processing logic
- [x] Premium processing with fee calculation
- [x] Scheduled payout system
- [x] Trust-based option locking

### 🚧 In Progress / Next Steps
- [ ] Split payment implementation (Option 3)
- [ ] OAuth connectors for Stripe/Square/PayPal
- [ ] API routes for payment processing
- [ ] Event creation flow integration
- [ ] Payment dashboard for organizers
- [ ] Webhook handlers for payment providers
- [ ] Testing suite for all scenarios

---

## 🔧 How to Use What's Built

### 1. Initialize Trust for New Organizer
```typescript
import { api } from "@/convex/_generated/api";

// When organizer signs up or creates first event
await updateOrganizerTrust({
  organizerId: "user_123",
  forceRecalculate: true,
});
```

### 2. Show Payment Options in Event Creation
```tsx
import PaymentModelSelector from "@/components/payment/PaymentModelSelector";

<PaymentModelSelector
  organizerId={userId}
  onSelect={(model) => setPaymentModel(model)}
  selectedModel={paymentModel}
  ticketPrice={eventTicketPrice}
/>
```

### 3. Configure Payment Model for Event
```typescript
// Option 1: Connect & Collect
await configureConnectCollect({
  eventId,
  organizerId,
  provider: "stripe",
  stripeConnectId: "acct_123...",
});

// Option 2: Premium Processing
await configurePremiumProcessing({
  eventId,
  organizerId,
});
```

### 4. Process Payments
```typescript
// Option 1: Connect & Collect
const result = await processConnectCollect({
  eventId,
  ticketId,
  organizerId,
  buyerId,
  amount: ticketPrice,
  paymentProvider: "stripe",
  paymentToken: token,
  buyerEmail,
  buyerName,
});

// Option 2: Premium
const result = await processPremiumPayment({
  eventId,
  ticketId,
  organizerId,
  buyerId,
  ticketPrice,
  paymentMethod: "card",
  paymentToken: token,
  buyerEmail,
  buyerName,
});
```

---

## 🚀 Next Implementation Steps

### Phase 1: Complete Core Features
1. **Split Payments (Option 3)**
   - Implement 90/10 automatic splits
   - Configure Stripe Direct Charges
   - Handle split chargeback liability

2. **OAuth Integration**
   - Stripe Connect OAuth flow
   - Square OAuth implementation
   - PayPal merchant onboarding

### Phase 2: Integration
1. **Event Creation Flow**
   - Add payment model selection step
   - Show trust requirements
   - Guide OAuth connection

2. **API Routes**
   - `/api/payments/connect-collect`
   - `/api/payments/premium`
   - `/api/payments/split`
   - `/api/oauth/[provider]/callback`

### Phase 3: Dashboard & Monitoring
1. **Organizer Dashboard**
   - Payment model status
   - Payout schedule
   - Trust level progress
   - Fee analytics

2. **Admin Tools**
   - Chargeback management
   - Payout processing
   - Trust score overrides
   - Risk monitoring

---

## 📊 Business Logic Summary

### Risk Management
```typescript
// Graduated limits by trust
NEW: $1,000 max, Connect & Collect only
BASIC: $5,000 max, + Premium option
TRUSTED: $25,000 max, + Split option
VIP: $100,000 max, instant payouts
```

### Chargeback Liability
```typescript
Connect & Collect: Organizer liable
Premium: Platform liable (offset from future)
Split: Follows the money holder
```

### Payout Timeline
```typescript
Connect & Collect: Instant to organizer
Premium: Event date + hold period (3-7 days)
Split: Instant split at transaction
```

---

## 🔒 Security Considerations

1. **OAuth Token Storage**
   - Encrypt all tokens in production
   - Implement token refresh mechanism
   - Validate tokens before each use

2. **Payment Processing**
   - PCI compliance for Premium model
   - Webhook signature validation
   - Idempotency keys for retries

3. **Trust System**
   - Automated fraud detection
   - Manual review triggers
   - Gradual limit increases

---

## 📝 Testing Scenarios

### Trust Level Progression
1. New organizer → NEW level, Connect only
2. Complete 1 event → BASIC level, unlock Premium
3. Complete 3 events → TRUSTED level, unlock Split
4. High volume → VIP level, instant payouts

### Payment Flow Testing
1. Connect & Collect with $2 app fee
2. Premium with 6.6% + $1.79 fees
3. Scheduled payout processing
4. Chargeback handling per model
5. Trust score impact from chargebacks

---

## 📚 Documentation Files

- `/convex/schema.ts` - Database schema
- `/convex/trust/trustScoring.ts` - Trust system
- `/convex/payments/connectCollect.ts` - Option 1
- `/convex/payments/premiumProcessing.ts` - Option 2
- `/components/payment/PaymentModelSelector.tsx` - UI component

---

## ✨ Ready for Testing

The core infrastructure is now in place. You can:
1. Test trust level calculations
2. View payment options with locking
3. Configure payment models
4. Process test payments
5. Schedule and track payouts

The system is designed to grow with organizers, starting them with low-risk options and gradually unlocking more features as they build trust.