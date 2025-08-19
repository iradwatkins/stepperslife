# 💰 Platform Revenue & Financial Tracking System

## Current State vs Original

### Original (Stripe Connect):
- **Platform Fee**: 1% automatically deducted
- **Seller Payouts**: Direct to seller's Stripe account
- **Revenue Tracking**: Per event in dashboard
- **Platform Earnings**: Automatic via Stripe Connect fees

### Current (Square):
- **Platform Fee**: NOT IMPLEMENTED ❌
- **Seller Payouts**: NOT IMPLEMENTED ❌
- **Revenue Tracking**: Basic (just counts tickets)
- **Platform Earnings**: NOT TRACKED ❌

## Implementation Plan for Financial Tracking

### 1. Database Schema Updates Needed

```typescript
// Add to convex/schema.ts

// Platform transactions table
platformTransactions: defineTable({
  eventId: v.id("events"),
  ticketId: v.id("tickets"),
  userId: v.string(),
  sellerId: v.string(),
  amount: v.number(),
  platformFee: v.number(), // 1% of amount
  sellerPayout: v.number(), // amount - platformFee
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("refunded")
  ),
  squarePaymentId: v.string(),
  createdAt: v.number(),
}),

// Platform balance tracking
platformBalance: defineTable({
  totalRevenue: v.number(),
  totalFees: v.number(),
  totalPayouts: v.number(),
  pendingPayouts: v.number(),
  lastUpdated: v.number(),
}),

// Seller balance tracking  
sellerBalances: defineTable({
  userId: v.string(),
  availableBalance: v.number(),
  pendingBalance: v.number(),
  totalEarnings: v.number(),
  totalPayouts: v.number(),
  lastPayout: v.optional(v.number()),
}),

// Payout requests
payoutRequests: defineTable({
  sellerId: v.string(),
  amount: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  requestedAt: v.number(),
  processedAt: v.optional(v.number()),
  bankDetails: v.object({
    accountNumber: v.string(),
    sortCode: v.string(),
    accountName: v.string(),
  }),
}),
```

### 2. Square Payment Split Options

Since Square doesn't have built-in marketplace split payments like Stripe Connect, we have THREE options:

#### Option A: Manual Platform Fee Calculation (RECOMMENDED)
```typescript
// In createSquareCheckoutSession.ts
const ticketPrice = event.price;
const platformFee = ticketPrice * 0.01; // 1% platform fee
const sellerPayout = ticketPrice - platformFee;

// After successful payment, record in database:
await convex.mutation(api.platformTransactions.create, {
  eventId,
  amount: ticketPrice,
  platformFee,
  sellerPayout,
  sellerId: event.userId,
  status: "completed"
});
```

#### Option B: Use Square OAuth for Seller Accounts
- Each seller connects their own Square account
- Platform takes fee before transfer
- More complex but similar to Stripe Connect

#### Option C: Hold Funds & Manual Payouts
- All money goes to platform Square account
- Manual weekly/monthly payouts to sellers
- Simple but requires more management

### 3. Financial Dashboard Pages Needed

```
/app/admin/
├── revenue/
│   ├── page.tsx          # Platform revenue overview
│   ├── transactions.tsx  # All transactions
│   └── fees.tsx         # Platform fees collected
├── payouts/
│   ├── page.tsx         # Payout management
│   ├── pending.tsx      # Pending payouts
│   └── history.tsx      # Payout history
└── reports/
    ├── page.tsx         # Financial reports
    ├── export.tsx       # Export to CSV/Excel
    └── analytics.tsx    # Revenue analytics

/app/seller/
├── earnings/
│   ├── page.tsx         # Seller earnings dashboard
│   ├── balance.tsx      # Current balance
│   └── history.tsx      # Transaction history
└── payouts/
    ├── request.tsx      # Request payout
    └── settings.tsx     # Bank account settings
```

### 4. Implementation Steps

#### Phase 1: Track Platform Fees (IMMEDIATE)
1. Update `createSquareCheckoutSession.ts` to calculate fees
2. Create `platformTransactions` table in Convex
3. Record every transaction with fee breakdown
4. Update seller dashboard to show net earnings

#### Phase 2: Platform Admin Dashboard
1. Create `/app/admin/revenue/page.tsx`
2. Show total platform revenue
3. Show fees collected
4. Transaction history with filters

#### Phase 3: Seller Payouts
1. Create seller balance tracking
2. Add payout request system
3. Manual approval workflow
4. Bank transfer integration (or manual)

#### Phase 4: Automated Reporting
1. Daily revenue reports
2. Monthly statements for sellers
3. Tax reporting features
4. CSV/Excel exports

### 5. Quick Implementation Code

```typescript
// lib/fees.ts
export const PLATFORM_FEE_PERCENTAGE = 0.01; // 1%

export function calculateFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
  const sellerPayout = amount - platformFee;
  
  return {
    total: amount,
    platformFee,
    sellerPayout,
    feePercentage: PLATFORM_FEE_PERCENTAGE * 100
  };
}

// convex/platformTransactions.ts
export const recordTransaction = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    amount: v.number(),
    squarePaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const fees = calculateFees(args.amount);
    
    // Record transaction
    await ctx.db.insert("platformTransactions", {
      ...args,
      platformFee: fees.platformFee,
      sellerPayout: fees.sellerPayout,
      status: "completed",
      createdAt: Date.now(),
    });
    
    // Update seller balance
    await ctx.db.patch(sellerId, {
      availableBalance: currentBalance + fees.sellerPayout,
      totalEarnings: totalEarnings + fees.sellerPayout,
    });
    
    // Update platform balance
    await updatePlatformBalance(ctx, fees.platformFee);
  },
});
```

### 6. UI Components Needed

```typescript
// components/RevenueCard.tsx
export function RevenueCard({ 
  title, 
  amount, 
  change, 
  period 
}: RevenueCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold mt-2">£{amount.toFixed(2)}</p>
      <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? '+' : ''}{change}% from {period}
      </p>
    </div>
  );
}

// components/TransactionTable.tsx
export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th>Date</th>
          <th>Event</th>
          <th>Amount</th>
          <th>Platform Fee</th>
          <th>Seller Payout</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(tx => (
          <tr key={tx.id}>
            <td>{formatDate(tx.createdAt)}</td>
            <td>{tx.eventName}</td>
            <td>£{tx.amount.toFixed(2)}</td>
            <td>£{tx.platformFee.toFixed(2)}</td>
            <td>£{tx.sellerPayout.toFixed(2)}</td>
            <td>{tx.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Summary

The platform currently has NO financial tracking beyond basic revenue calculation. To properly track money:

1. **IMMEDIATE**: Add platform fee calculation (1%)
2. **URGENT**: Create transaction recording system
3. **IMPORTANT**: Build admin revenue dashboard
4. **NEEDED**: Implement seller payout system

Without this, you cannot:
- Know how much money the platform makes
- Pay sellers their earnings
- Track financial performance
- Generate reports for taxes
- Manage refunds properly