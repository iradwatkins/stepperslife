# Square Marketplace Setup with Automatic Splits & Direct Payouts

## Square OAuth & Marketplace Features

Square provides similar functionality to Stripe Connect through:
1. **Square OAuth**: Sellers connect their Square accounts
2. **Split Payments**: Automatic fee deduction and direct payouts
3. **Application Fees**: Platform takes percentage automatically

## Implementation Steps

### 1. Square OAuth Flow (Like Stripe Connect)

```typescript
// app/actions/createSquareOAuthLink.ts
export async function createSquareOAuthLink(userId: string) {
  const params = new URLSearchParams({
    client_id: process.env.SQUARE_APPLICATION_ID!,
    scope: 'MERCHANT_PROFILE_READ PAYMENTS_WRITE PAYMENTS_READ',
    session: false,
    state: userId, // Pass user ID to link accounts
  });

  return `https://connect.squareup.com/oauth2/authorize?${params}`;
}
```

### 2. Square OAuth Callback

```typescript
// app/api/square/oauth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  
  // Exchange code for access token
  const response = await fetch('https://connect.squareup.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
    },
    body: JSON.stringify({
      client_id: process.env.SQUARE_APPLICATION_ID,
      client_secret: process.env.SQUARE_APPLICATION_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  
  // Save seller's Square access token
  await saveSellerSquareAccount(state, {
    access_token: data.access_token,
    merchant_id: data.merchant_id,
    refresh_token: data.refresh_token,
  });
}
```

### 3. Create Payment with Application Fee (USD)

```typescript
// app/actions/createSquareCheckoutWithSplit.ts
import { Client, Environment } from 'square';

export async function createSquareCheckoutWithSplit({
  eventId,
  sellerAccessToken,
  amount, // in USD
}: {
  eventId: Id<"events">;
  sellerAccessToken: string;
  amount: number;
}) {
  // Initialize Square client with SELLER's access token
  const sellerClient = new Client({
    accessToken: sellerAccessToken,
    environment: Environment.Production,
  });

  const platformFee = Math.round(amount * 0.01 * 100); // 1% in cents
  
  try {
    // Create payment link with application fee
    const response = await sellerClient.checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: event.name,
        priceMoney: {
          amount: BigInt(Math.round(amount * 100)), // Convert to cents
          currency: 'USD', // Using USD as requested
        },
        locationId: sellerLocationId,
      },
      paymentNote: `Ticket for ${event.name}`,
      checkoutOptions: {
        applicationFeeMoneyConfig: {
          // Platform automatically receives this fee
          amount: BigInt(platformFee),
          currency: 'USD',
        },
        allowTipping: false,
        redirectUrl: `${baseUrl}/tickets/purchase-success`,
      },
    });

    // Payment automatically splits:
    // - Seller receives: $99 (amount - fee)
    // - Platform receives: $1 (fee)
    // No manual tracking needed!

    return response.result.paymentLink;
  } catch (error) {
    console.error('Error creating split payment:', error);
    throw error;
  }
}
```

### 4. Automatic Payouts Configuration

Square handles payouts automatically:
- **Daily**: Default automatic daily payouts
- **Instant**: Available for 1.5% fee
- **Weekly/Monthly**: Configurable in Square Dashboard

```typescript
// Sellers configure payout schedule in their Square Dashboard
// No manual payout code needed - Square handles it automatically!
```

### 5. Update Database Schema (Simplified)

```typescript
// convex/schema.ts
users: defineTable({
  name: v.string(),
  email: v.string(),
  userId: v.string(),
  
  // Square OAuth credentials
  squareAccessToken: v.optional(v.string()),
  squareMerchantId: v.optional(v.string()),
  squareRefreshToken: v.optional(v.string()),
  squareLocationId: v.optional(v.string()),
  
  // Payout settings (managed by Square)
  payoutSchedule: v.optional(v.union(
    v.literal("daily"),
    v.literal("weekly"),
    v.literal("instant")
  )),
}),

// Simplified - no need for manual balance tracking
platformRevenue: defineTable({
  amount: v.number(),
  currency: v.literal("USD"),
  eventId: v.id("events"),
  sellerId: v.string(),
  squarePaymentId: v.string(),
  createdAt: v.number(),
}),
```

### 6. Seller Onboarding Flow

```typescript
// components/SellerOnboarding.tsx
export function SellerOnboarding() {
  const handleConnectSquare = async () => {
    // Generate OAuth link
    const oauthUrl = await createSquareOAuthLink(userId);
    
    // Redirect to Square OAuth
    window.location.href = oauthUrl;
  };

  return (
    <div>
      <h2>Connect Your Square Account</h2>
      <p>Receive automatic daily payouts directly to your bank</p>
      <Button onClick={handleConnectSquare}>
        Connect Square Account
      </Button>
    </div>
  );
}
```

### 7. Updated Seller Dashboard

```typescript
// components/SellerDashboard.tsx
export function SellerDashboard() {
  const squareAccount = useQuery(api.users.getSquareAccount);
  
  if (!squareAccount?.squareAccessToken) {
    return <SellerOnboarding />;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Square Account Connected ✓</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Merchant ID: {squareAccount.squareMerchantId}</p>
          <p>Payouts: {squareAccount.payoutSchedule || 'Daily'}</p>
          <p>All sales automatically deposited to your bank</p>
        </CardContent>
      </Card>
      
      {/* No manual payout requests needed! */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show sales - payouts handled by Square */}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Key Differences from Current Implementation

### Current (Manual):
- ❌ All money goes to platform account
- ❌ Manual fee calculation
- ❌ Manual payout requests
- ❌ Platform holds seller funds

### New (Square OAuth):
- ✅ Money goes directly to sellers
- ✅ Automatic 1% platform fee
- ✅ Automatic daily payouts
- ✅ Sellers manage own funds

## Environment Variables Needed

```env
# Square OAuth Application
SQUARE_APPLICATION_ID=your-app-id
SQUARE_APPLICATION_SECRET=your-app-secret
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-key

# Platform Square Account (for receiving fees)
SQUARE_PLATFORM_ACCESS_TOKEN=your-platform-token
SQUARE_PLATFORM_LOCATION_ID=your-location-id
```

## Square Dashboard Setup

1. **Create Square Application**:
   - Go to: https://developer.squareup.com/apps
   - Create new application
   - Enable OAuth
   - Set redirect URL: `https://stepperslife.com/api/square/oauth/callback`

2. **Configure Application Fees**:
   - Set application fee percentage: 1%
   - Enable split payments

3. **Webhook Configuration**:
   - Payment webhooks
   - Refund webhooks
   - OAuth webhooks

## Benefits

1. **Automatic Everything**: Square handles splits, payouts, taxes
2. **Direct Deposits**: Sellers get paid directly, no platform liability
3. **Compliance**: Square handles PCI, KYC, AML
4. **Instant Payouts**: Sellers can enable instant payouts
5. **No Manual Tracking**: Everything automated through Square

## Migration Path

1. Update environment variables
2. Implement OAuth flow
3. Update checkout to use seller tokens
4. Remove manual balance tracking
5. Simplify database schema
6. Test with sandbox accounts

This gives you the EXACT same functionality as Stripe Connect but with Square!