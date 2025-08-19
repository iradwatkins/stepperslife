# Database Migration Guide - Payment System

## Migration Date: 2025-08-19

## Overview
This document details all database schema changes made during the payment system implementation.

---

## New Tables Created

### 1. `paymentRequests` Table
**Purpose**: Track manual payment requests (Zelle/Bank Transfer)

```typescript
// Location: /convex/schema.ts
paymentRequests: defineTable({
  // Core Fields
  ticketId: v.id("tickets"),
  userId: v.string(),
  sellerId: v.string(),
  eventId: v.id("events"),
  amount: v.number(),
  
  // Payment Method
  paymentMethod: v.union(
    v.literal("zelle"),
    v.literal("bank_transfer")
  ),
  
  // Reference & Status
  referenceNumber: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("expired")
  ),
  
  // Proof of Payment
  proofUrl: v.optional(v.string()),
  proofFileName: v.optional(v.string()),
  
  // Payment Details
  zelleEmail: v.optional(v.string()),
  zellePhone: v.optional(v.string()),
  bankAccountNumber: v.optional(v.string()),
  bankRoutingNumber: v.optional(v.string()),
  bankAccountName: v.optional(v.string()),
  
  // Admin Fields
  adminNotes: v.optional(v.string()),
  verificationCode: v.optional(v.string()),
  approvedBy: v.optional(v.string()),
  approvedAt: v.optional(v.number()),
  rejectedReason: v.optional(v.string()),
  
  // Expiration
  expiresAt: v.number(),
})
.index("by_reference", ["referenceNumber"])
.index("by_status", ["status"])
.index("by_user", ["userId"])
.index("by_seller", ["sellerId"])
```

**Indexes Created**:
- `by_reference`: Quick lookup by reference number
- `by_status`: Filter pending/approved/rejected
- `by_user`: User's payment history
- `by_seller`: Seller's received payments

---

## Modified Tables

### 2. `tickets` Table Updates

**New Fields Added**:
```typescript
// Payment method tracking
paymentMethod: v.optional(v.union(
  v.literal("square"),
  v.literal("stripe"),
  v.literal("paypal"),
  v.literal("zelle"),
  v.literal("bank_transfer")
)),

// Link to manual payment request
paymentRequestId: v.optional(v.id("paymentRequests")),

// Provider-specific IDs
paymentIntentId: v.optional(v.string()),        // Square payment ID
stripeCheckoutSessionId: v.optional(v.string()), // Stripe session
paypalOrderId: v.optional(v.string()),          // PayPal order
```

### 3. `users` Table Updates

**Payment Provider Fields**:
```typescript
// Provider account IDs
squareLocationId: v.optional(v.string()),
squareMerchantId: v.optional(v.string()),
stripeAccountId: v.optional(v.string()),
paypalMerchantId: v.optional(v.string()),
```

**Payment Preferences**:
```typescript
// Accepted methods
acceptedPaymentMethods: v.optional(v.array(v.string())),
preferredPayoutMethod: v.optional(v.string()),
```

**Zelle Configuration**:
```typescript
zelleEmail: v.optional(v.string()),
zellePhone: v.optional(v.string()),
zelleDisplayName: v.optional(v.string()),
```

**Bank Account (Encrypted)**:
```typescript
bankAccountNumber: v.optional(v.string()),  // Encrypted
bankRoutingNumber: v.optional(v.string()),
bankAccountName: v.optional(v.string()),
bankAccountType: v.optional(v.string()),    // checking/savings
```

### 4. `events` Table Updates

**Seller Payment Settings**:
```typescript
// Per-event payment configuration
acceptedPaymentMethods: v.optional(v.array(v.string())),
zelleInstructions: v.optional(v.string()),
bankInstructions: v.optional(v.string()),
```

---

## Migration Scripts

### Run Migration
```bash
# Deploy schema changes
npx convex deploy

# Verify schema
npx convex dashboard
```

### Data Migration (if needed)
```typescript
// /convex/migrations/addPaymentMethods.ts
import { mutation } from "./_generated/server";

export const migrateTickets = mutation({
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();
    
    for (const ticket of tickets) {
      // Set default payment method for existing tickets
      if (ticket.purchasedAt && !ticket.paymentMethod) {
        await ctx.db.patch(ticket._id, {
          paymentMethod: "square" // Default to square
        });
      }
    }
  },
});
```

---

## Convex Functions Created

### `/convex/payments.ts`
```typescript
// Queries
export const getPaymentRequest = query({...});
export const getPaymentRequestByReference = query({...});
export const getPendingPayments = query({...});
export const getPaymentStatistics = query({...});

// Mutations
export const createPaymentRequest = mutation({...});
export const updatePaymentStatus = mutation({...});
export const approvePayment = mutation({...});
export const rejectPayment = mutation({...});
export const expireOldPayments = mutation({...});
```

### `/convex/admin.ts`
```typescript
// Admin-only functions
export const getAdminDashboard = query({...});
export const verifyPayment = mutation({...});
export const bulkUpdatePayments = mutation({...});
export const getAuditLog = query({...});
```

### `/convex/sellers.ts`
```typescript
// Seller configuration
export const updatePaymentSettings = mutation({...});
export const getSellerPaymentMethods = query({...});
export const updateBankAccount = mutation({...});
export const updateZelleInfo = mutation({...});
```

---

## Database Indexes Performance

### Optimized Queries
1. **Reference Lookup**: O(1) with `by_reference` index
2. **Pending Payments**: O(log n) with `by_status` index
3. **User History**: O(log n) with `by_user` index
4. **Seller Payments**: O(log n) with `by_seller` index

### Query Examples
```typescript
// Fast reference lookup
const payment = await ctx.db
  .query("paymentRequests")
  .withIndex("by_reference", q => 
    q.eq("referenceNumber", "ZL-1234567890-ABC")
  )
  .first();

// Get all pending payments
const pending = await ctx.db
  .query("paymentRequests")
  .withIndex("by_status", q => 
    q.eq("status", "pending")
  )
  .collect();
```

---

## Backup & Rollback

### Backup Before Migration
```bash
# Export current data
npx convex export --path ./backup-$(date +%Y%m%d)

# Verify backup
ls -la ./backup-*
```

### Rollback Procedure
```bash
# Restore from backup
npx convex import --path ./backup-20250119

# Revert schema changes
git checkout HEAD~1 convex/schema.ts
npx convex deploy
```

---

## Monitoring & Maintenance

### Health Checks
```typescript
// Check payment request expiration
const expiredPayments = await ctx.db
  .query("paymentRequests")
  .filter(q => q.and(
    q.eq(q.field("status"), "pending"),
    q.lt(q.field("expiresAt"), Date.now())
  ))
  .collect();
```

### Scheduled Jobs
```typescript
// Run daily at 2 AM
export const cleanupExpiredPayments = cronJob(
  "cleanup expired payments",
  "0 2 * * *",
  async (ctx) => {
    // Mark expired payments
    const expired = await getExpiredPayments(ctx);
    for (const payment of expired) {
      await ctx.db.patch(payment._id, {
        status: "expired"
      });
    }
  }
);
```

---

## Security Considerations

### Encrypted Fields
- Bank account numbers
- Routing numbers
- Personal information

### Access Control
```typescript
// Only admins can approve payments
if (!isAdmin(ctx.auth.userId)) {
  throw new Error("Unauthorized");
}

// Users can only view their own payments
if (payment.userId !== ctx.auth.userId) {
  throw new Error("Access denied");
}
```

### Data Retention
- Payment requests: 90 days
- Proof documents: 30 days after approval
- Audit logs: 1 year

---

## Testing the Migration

### Test Queries
```bash
# Connect to Convex dashboard
npx convex dashboard

# Test queries in console
query("payments:getPendingPayments")
query("payments:getPaymentRequestByReference", { 
  reference: "ZL-TEST-123" 
})
```

### Verification Checklist
- [ ] All tables created successfully
- [ ] Indexes are working
- [ ] No data loss from existing tables
- [ ] Queries perform as expected
- [ ] Mutations update correctly
- [ ] Access control enforced

---

End of Database Migration Guide