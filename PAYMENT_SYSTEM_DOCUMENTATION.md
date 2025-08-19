# SteppersLife Multi-Payment System Documentation

## Complete Implementation Guide
**Implementation Date**: 2025-08-19
**Version**: 1.0.0
**Project**: SteppersLife Ticket Marketplace
**Live URL**: https://stepperslife.com

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Payment Methods](#payment-methods)
3. [Database Schema](#database-schema)
4. [File Structure](#file-structure)
5. [API Endpoints](#api-endpoints)
6. [Admin Dashboard](#admin-dashboard)
7. [Seller Configuration](#seller-configuration)
8. [Payment Flow](#payment-flow)
9. [Security Features](#security-features)
10. [Environment Variables](#environment-variables)
11. [Testing Guide](#testing-guide)
12. [Deployment Instructions](#deployment-instructions)

---

## System Overview

The SteppersLife payment system is a comprehensive multi-provider solution that supports both instant and manual payment methods. The system integrates with Square, Stripe, PayPal, and provides manual verification for Zelle and bank transfers.

### Key Features
- **5 Payment Methods**: Square, Stripe, PayPal, Zelle, Bank Transfer
- **Instant Processing**: Credit/debit cards and digital wallets
- **Manual Verification**: Admin dashboard for Zelle/bank transfers
- **Seller Configuration**: Individual payment method preferences
- **Reference Tracking**: Unique codes for manual payments
- **Proof of Payment**: File upload for manual methods
- **Admin Dashboard**: Complete payment management interface

---

## Payment Methods

### 1. Square (Primary - Instant)
- **Processing Time**: Instant
- **Supported**: Credit/debit cards
- **Fee**: 2.9% + $0.30
- **Integration**: OAuth + Checkout API
- **Status**: ✅ Fully Implemented

### 2. Stripe (Instant)
- **Processing Time**: Instant
- **Supported**: Cards, Apple Pay, Google Pay
- **Fee**: 2.9% + $0.30
- **Integration**: Checkout Sessions API
- **Status**: ✅ Fully Implemented

### 3. PayPal (Instant)
- **Processing Time**: Instant
- **Supported**: PayPal balance, linked cards
- **Fee**: 2.9% + $0.30
- **Integration**: PayPal Checkout SDK
- **Status**: ✅ Fully Implemented

### 4. Zelle (Manual - 1-3 days)
- **Processing Time**: 1-3 business days
- **Verification**: Admin approval required
- **Reference Format**: ZL-TIMESTAMP-RANDOM
- **Proof Required**: Yes
- **Status**: ✅ Fully Implemented

### 5. Bank Transfer (Manual - 2-5 days)
- **Processing Time**: 2-5 business days
- **Verification**: Admin approval required
- **Reference Format**: BT-TIMESTAMP-RANDOM
- **Proof Required**: Yes
- **Status**: ✅ Fully Implemented

---

## Database Schema

### Convex Tables

#### 1. `paymentRequests` Table
```typescript
paymentRequests: defineTable({
  ticketId: v.id("tickets"),
  userId: v.string(),
  sellerId: v.string(),
  eventId: v.id("events"),
  amount: v.number(),
  paymentMethod: v.union(
    v.literal("zelle"),
    v.literal("bank_transfer")
  ),
  referenceNumber: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("expired")
  ),
  proofUrl: v.optional(v.string()),
  proofFileName: v.optional(v.string()),
  zelleEmail: v.optional(v.string()),
  zellePhone: v.optional(v.string()),
  bankAccountNumber: v.optional(v.string()),
  bankRoutingNumber: v.optional(v.string()),
  bankAccountName: v.optional(v.string()),
  adminNotes: v.optional(v.string()),
  verificationCode: v.optional(v.string()),
  approvedBy: v.optional(v.string()),
  approvedAt: v.optional(v.number()),
  rejectedReason: v.optional(v.string()),
  expiresAt: v.number(),
})
.index("by_reference", ["referenceNumber"])
.index("by_status", ["status"])
.index("by_user", ["userId"])
.index("by_seller", ["sellerId"])
```

#### 2. `tickets` Table Updates
```typescript
tickets: defineTable({
  // ... existing fields
  paymentMethod: v.optional(v.union(
    v.literal("square"),
    v.literal("stripe"),
    v.literal("paypal"),
    v.literal("zelle"),
    v.literal("bank_transfer")
  )),
  paymentRequestId: v.optional(v.id("paymentRequests")),
  paymentIntentId: v.optional(v.string()),
  stripeCheckoutSessionId: v.optional(v.string()),
  paypalOrderId: v.optional(v.string()),
})
```

#### 3. `users` Table Updates
```typescript
users: defineTable({
  // ... existing fields
  
  // Payment Provider IDs
  squareLocationId: v.optional(v.string()),
  squareMerchantId: v.optional(v.string()),
  stripeAccountId: v.optional(v.string()),
  paypalMerchantId: v.optional(v.string()),
  
  // Payment Preferences
  acceptedPaymentMethods: v.optional(v.array(v.string())),
  preferredPayoutMethod: v.optional(v.string()),
  
  // Zelle Configuration
  zelleEmail: v.optional(v.string()),
  zellePhone: v.optional(v.string()),
  zelleDisplayName: v.optional(v.string()),
  
  // Bank Account (encrypted)
  bankAccountNumber: v.optional(v.string()),
  bankRoutingNumber: v.optional(v.string()),
  bankAccountName: v.optional(v.string()),
  bankAccountType: v.optional(v.string()),
})
```

---

## File Structure

### Core Payment Components
```
/components/
├── PaymentMethodSelector.tsx       # Payment method selection UI
├── ZellePaymentInstructions.tsx   # Zelle payment flow
├── BankTransferInstructions.tsx   # Bank transfer flow
├── PaymentStatusTracker.tsx       # Track payment status
└── PurchaseTicket.tsx             # Updated purchase flow

/app/admin/payments/
├── page.tsx                       # Admin dashboard
├── PaymentRequestTable.tsx       # Pending payments table
├── PaymentVerificationModal.tsx  # Approve/reject modal
└── PaymentStatistics.tsx         # Analytics dashboard

/app/seller/payment-settings/
├── page.tsx                       # Seller settings
├── PaymentMethodToggle.tsx       # Enable/disable methods
├── ZelleConfiguration.tsx        # Zelle setup
├── BankAccountForm.tsx           # Bank account setup
└── PayoutPreferences.tsx         # Payout configuration
```

### API Routes
```
/app/api/
├── webhooks/
│   ├── square/route.ts           # Square webhooks
│   ├── stripe/route.ts           # Stripe webhooks
│   └── paypal/route.ts           # PayPal webhooks
├── payments/
│   ├── create-checkout/route.ts  # Unified checkout
│   ├── verify-payment/route.ts   # Admin verification
│   └── upload-proof/route.ts     # Proof upload
└── admin/
    └── payments/route.ts          # Admin API endpoints
```

### Convex Functions
```
/convex/
├── payments.ts                    # Payment mutations/queries
├── paymentRequests.ts            # Manual payment handling
├── admin.ts                      # Admin functions
└── sellers.ts                    # Seller configuration
```

---

## API Endpoints

### Payment Creation
```typescript
POST /api/payments/create-checkout
{
  ticketId: string
  paymentMethod: "square" | "stripe" | "paypal" | "zelle" | "bank_transfer"
  amount: number
  sellerId: string
}
```

### Manual Payment Submission
```typescript
POST /api/payments/submit-manual
{
  ticketId: string
  paymentMethod: "zelle" | "bank_transfer"
  proofFile: File
  referenceNumber: string
}
```

### Admin Verification
```typescript
POST /api/admin/payments/verify
{
  paymentRequestId: string
  action: "approve" | "reject"
  verificationCode?: string
  rejectionReason?: string
  adminNotes?: string
}
```

### Payment Status Check
```typescript
GET /api/payments/status/:referenceNumber
Response: {
  status: "pending" | "approved" | "rejected" | "expired"
  verificationCode?: string
  adminNotes?: string
}
```

---

## Admin Dashboard

### Location
`/app/admin/payments/page.tsx`

### Features
1. **Pending Payments Queue**
   - Filter by payment method
   - Sort by date/amount
   - Search by reference number
   - Bulk actions support

2. **Verification Modal**
   - View proof of payment
   - Check seller details
   - Add admin notes
   - Generate verification code
   - Approve/reject with reason

3. **Payment Statistics**
   - Total pending amount
   - Average processing time
   - Method breakdown
   - Success/rejection rates

4. **Audit Trail**
   - Admin actions log
   - Payment history
   - Status changes
   - Timestamp tracking

### Admin Access Control
```typescript
// Middleware check
const isAdmin = (email: string) => {
  const adminEmails = [
    "admin@stepperslife.com",
    "ira@stepperslife.com",
    // Add more admin emails
  ];
  return adminEmails.includes(email);
};
```

---

## Seller Configuration

### Location
`/app/seller/payment-settings/page.tsx`

### Configuration Options

#### 1. Payment Methods
- Toggle each method on/off
- Set method-specific fees
- Configure minimum amounts
- Set processing times

#### 2. Zelle Setup
```typescript
{
  zelleEmail: string
  zellePhone: string
  zelleDisplayName: string
  autoApprove: boolean
  maxAmount: number
}
```

#### 3. Bank Account
```typescript
{
  accountNumber: string (encrypted)
  routingNumber: string
  accountName: string
  accountType: "checking" | "savings"
  verificationStatus: "pending" | "verified"
}
```

#### 4. Payout Preferences
- Preferred payout method
- Payout schedule
- Minimum payout amount
- Tax information

---

## Payment Flow

### Instant Payment Flow (Square/Stripe/PayPal)
```mermaid
1. User selects payment method
2. System creates checkout session
3. User redirected to payment page
4. Payment processed by provider
5. Webhook received
6. Ticket marked as purchased
7. Confirmation email sent
```

### Manual Payment Flow (Zelle/Bank Transfer)
```mermaid
1. User selects manual method
2. System generates reference number
3. User shown payment instructions
4. User submits proof of payment
5. Admin reviews in dashboard
6. Admin approves/rejects
7. User notified of decision
8. Ticket released if approved
```

### Reference Number Generation
```typescript
// Zelle format
const zelleRef = `ZL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
// Example: ZL-1737345678901-X7K9M2P4Q

// Bank transfer format  
const bankRef = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
// Example: BT-1737345678901-A3B7C9D2E
```

### Verification Code Generation
```typescript
const verificationCode = `VERIFY-${referenceNumber}`;
// Example: VERIFY-ZL-1737345678901-X7K9M2P4Q
```

---

## Security Features

### 1. Payment Validation
- Amount verification
- Seller verification
- Duplicate prevention
- Expiration checks

### 2. Data Encryption
- Bank account numbers
- Routing numbers
- Personal information
- API keys in Vault

### 3. Admin Controls
- IP whitelisting
- Action logging
- Two-factor authentication (recommended)
- Role-based access

### 4. Manual Payment Security
- Unique reference numbers
- Proof requirement
- Admin verification
- Expiration after 3 days
- Verification codes

### 5. Rate Limiting
```typescript
// Rate limits
const LIMITS = {
  paymentCreation: 10, // per minute
  proofUpload: 5,      // per minute
  statusCheck: 30,     // per minute
  adminActions: 100    // per minute
};
```

---

## Environment Variables

### Required Variables
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
CONVEX_DEPLOY_KEY=

# Auth
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=

# Square
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
SQUARE_ENVIRONMENT=sandbox|production
SQUARE_ACCESS_TOKEN=
SQUARE_WEBHOOK_SIGNATURE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENVIRONMENT=sandbox|production

# Email
EMAIL_FROM=noreply@stepperslife.com
EMAIL_ADMIN=admin@stepperslife.com

# Payment Configuration
PAYMENT_PROCESSING_FEE_PERCENTAGE=2.9
PAYMENT_PROCESSING_FEE_FIXED=0.30
ZELLE_PROCESSING_DAYS=3
BANK_TRANSFER_PROCESSING_DAYS=5
```

### Vault Storage
```bash
# Sensitive keys stored in Vault
vault kv put stepperslife/payment \
  square_access_token="" \
  stripe_secret_key="" \
  paypal_client_secret=""
```

---

## Testing Guide

### Test Payment Methods

#### Square Sandbox
```javascript
// Test card numbers
4111 1111 1111 1111 - Visa
5105 1051 0510 5100 - Mastercard
3782 822463 10005 - Amex

// CVV: Any 3 digits
// Expiry: Any future date
```

#### Stripe Test Mode
```javascript
// Test cards
4242 4242 4242 4242 - Success
4000 0000 0000 9995 - Decline
4000 0025 0000 3155 - Requires authentication
```

#### PayPal Sandbox
```javascript
// Sandbox accounts created in PayPal Developer Dashboard
// Personal: sb-buyer@example.com
// Business: sb-seller@example.com
```

#### Zelle Testing
```javascript
// Test flow
1. Select Zelle payment
2. Use reference: ZL-TEST-123456789
3. Upload any image as proof
4. Admin approves in dashboard
```

### Test Scenarios

1. **Successful Payment**
   - Select Square/Stripe/PayPal
   - Complete payment
   - Verify ticket purchase
   - Check email confirmation

2. **Failed Payment**
   - Use decline test card
   - Verify error handling
   - Check ticket availability

3. **Manual Payment Approval**
   - Submit Zelle payment
   - Admin approves
   - Verify ticket release
   - Check verification code

4. **Manual Payment Rejection**
   - Submit bank transfer
   - Admin rejects with reason
   - Verify ticket returned to pool
   - Check user notification

5. **Payment Expiration**
   - Create manual payment
   - Wait 3 days (or modify timestamp)
   - Verify auto-expiration
   - Check ticket availability

---

## Deployment Instructions

### 1. Coolify Deployment

#### Step 1: Update Environment Variables
```bash
# Copy from coolify-env.txt
cat stepperslife/coolify-env.txt
# Paste in Coolify → Environment Variables
```

#### Step 2: Deploy Application
```bash
git add .
git commit -m "Deploy payment system"
git push origin main
```

#### Step 3: Verify Deployment
```bash
# Check application logs
coolify logs app-name

# Verify database migrations
npx convex deploy

# Test payment endpoints
curl https://stepperslife.com/api/payments/health
```

### 2. Production Checklist

#### Pre-Deployment
- [ ] Replace sandbox API keys with production keys
- [ ] Configure production webhook URLs
- [ ] Set up email service (SendGrid/SES)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Sentry/LogRocket)
- [ ] Configure backup strategy

#### Security
- [ ] Enable HTTPS everywhere
- [ ] Set up WAF rules
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up alerting
- [ ] Review admin access list

#### Testing
- [ ] End-to-end payment flow
- [ ] Webhook handling
- [ ] Email notifications
- [ ] Admin dashboard access
- [ ] Mobile responsiveness
- [ ] Performance testing

#### Post-Deployment
- [ ] Monitor error rates
- [ ] Check payment success rates
- [ ] Review admin activity
- [ ] Verify email delivery
- [ ] Test customer support flow
- [ ] Document known issues

---

## Troubleshooting

### Common Issues

#### 1. Payment Provider Connection
```bash
# Check API key validity
curl -X GET https://api.squareup.com/v2/locations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Verify webhook endpoint
ngrok http 3000  # For local testing
```

#### 2. Manual Payment Not Showing
```typescript
// Check indexes
convex dev
// Run: query paymentRequests:by_status { status: "pending" }
```

#### 3. Admin Dashboard Access
```typescript
// Verify admin email in:
/app/admin/payments/page.tsx
// Line: const adminEmails = [...]
```

#### 4. Verification Code Issues
```typescript
// Check code generation
console.log(`VERIFY-${referenceNumber}`);
// Ensure exact match in admin approval
```

### Debug Commands
```bash
# Check Convex functions
npx convex logs

# Verify environment variables
npm run env:check

# Test payment webhook
npm run test:webhook

# Check database state
npx convex dashboard
```

---

## Support & Maintenance

### Regular Tasks
- **Daily**: Check pending payments queue
- **Weekly**: Review payment statistics
- **Monthly**: Audit admin actions
- **Quarterly**: Update API keys

### Monitoring
- Payment success rate > 95%
- Manual payment processing < 24 hours
- Webhook response time < 500ms
- Error rate < 1%

### Contact
- **Technical Issues**: dev@stepperslife.com
- **Payment Support**: support@stepperslife.com
- **Admin Access**: admin@stepperslife.com

---

## Version History

### v1.0.0 (2025-08-19)
- Initial implementation
- 5 payment methods
- Admin dashboard
- Seller configuration
- Manual payment verification
- Reference tracking system

### Planned Features (v2.0.0)
- Cryptocurrency payments
- International payment methods
- Automated KYC/AML
- Advanced fraud detection
- Multi-currency support
- Payment splitting

---

## License & Credits

**Project**: SteppersLife
**Developer**: Ira Watkins
**Implementation Date**: January 19, 2025
**Technology Stack**: Next.js, Convex, Square, Stripe, PayPal

---

End of Documentation