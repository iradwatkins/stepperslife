# Square Split Payments Implementation Guide for SteppersLife

## Important Note: Square's Current Limitations

**⚠️ CRITICAL: Square does NOT currently support automatic split payments in their API.** 

Unlike Stripe Connect, Square doesn't have a native split payment feature where one transaction automatically splits between multiple merchants. However, there are workarounds to achieve the same result.

## Three Approaches to "Split Payments" with Square

### Option 1: App Fee Model (Recommended) ✅
Take your platform fee from organizer's Square account

### Option 2: Sequential Payments
Charge customer once, then transfer to organizer

### Option 3: Marketplace Model (Beta - Limited Access)
Square's new marketplace API (requires approval)

---

## Option 1: App Fee Model (RECOMMENDED)

This is the closest to true split payments and what most platforms use.

### Step 1: Create Square Application

1. **Go to Square Developer Dashboard**
   ```
   https://developer.squareup.com/apps
   ```

2. **Create New Application**
   - Click "+" or "New Application"
   - Name: "SteppersLife Platform"
   - Click "Create"

3. **Get Your Credentials**
   ```
   Application ID: sq0idp-xxxxxxxxxxxxx
   Access Token: [Sandbox first, then Production]
   Application Secret: sq0csp-xxxxxxxxxxxxx
   ```

### Step 2: Set Up OAuth

**Configure OAuth Settings:**

1. In Square Dashboard → Your App → OAuth
2. Set Redirect URL:
   ```
   https://stepperslife.com/api/square/callback
   ```

3. Set Required Permissions:
   ```
   MERCHANT_PROFILE_READ
   PAYMENTS_WRITE
   PAYMENTS_READ
   REFUNDS_WRITE
   REFUNDS_READ
   DISPUTES_READ
   ```

### Step 3: Database Setup

```sql
-- Add to your database
ALTER TABLE organizers ADD COLUMN square_merchant_id VARCHAR(255);
ALTER TABLE organizers ADD COLUMN square_access_token TEXT;
ALTER TABLE organizers ADD COLUMN square_refresh_token TEXT;
ALTER TABLE organizers ADD COLUMN square_token_expires_at TIMESTAMP;
ALTER TABLE organizers ADD COLUMN square_location_id VARCHAR(255);
ALTER TABLE organizers ADD COLUMN payment_mode ENUM('direct', 'app_fee', 'managed') DEFAULT 'app_fee';

-- Track app fees
CREATE TABLE app_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(255) UNIQUE,
  order_id UUID REFERENCES orders(id),
  organizer_id UUID REFERENCES organizers(id),
  total_amount INTEGER, -- in cents
  app_fee_amount INTEGER, -- your fee in cents
  net_amount INTEGER, -- what organizer gets
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: Organizer Onboarding Flow

```typescript
// app/api/square/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SQUARE_AUTH_URL = 'https://connect.squareup.com/oauth2/authorize';

export async function GET(request: NextRequest) {
  const organizerId = request.nextUrl.searchParams.get('organizer_id');
  
  // Generate state for security
  const state = Buffer.from(JSON.stringify({
    organizer_id: organizerId,
    timestamp: Date.now()
  })).toString('base64');
  
  // Store state in session/database for verification
  await storeOAuthState(state, organizerId);
  
  const params = new URLSearchParams({
    client_id: process.env.SQUARE_APPLICATION_ID!,
    scope: 'MERCHANT_PROFILE_READ PAYMENTS_WRITE PAYMENTS_READ',
    state: state,
    session: 'false' // Don't require Square login if already logged in
  });
  
  return NextResponse.redirect(`${SQUARE_AUTH_URL}?${params}`);
}
```

### Step 5: OAuth Callback Handler

```typescript
// app/api/square/callback/route.ts
import { Client, Environment } from 'square';

const squareClient = new Client({
  environment: Environment.Production,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  
  // Verify state
  const decodedState = JSON.parse(Buffer.from(state!, 'base64').toString());
  const storedState = await getOAuthState(state!);
  
  if (!storedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }
  
  try {
    // Exchange code for access token
    const { result } = await squareClient.oAuthApi.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET!,
      code: code!,
      grantType: 'authorization_code'
    });
    
    // Store tokens
    await updateOrganizer(decodedState.organizer_id, {
      square_access_token: result.accessToken,
      square_refresh_token: result.refreshToken,
      square_merchant_id: result.merchantId,
      square_token_expires_at: result.expiresAt
    });
    
    // Get location ID (required for payments)
    const merchantClient = new Client({
      environment: Environment.Production,
      accessToken: result.accessToken!
    });
    
    const { result: locations } = await merchantClient.locationsApi.listLocations();
    const mainLocation = locations.locations?.find(l => l.status === 'ACTIVE');
    
    await updateOrganizer(decodedState.organizer_id, {
      square_location_id: mainLocation?.id
    });
    
    return NextResponse.redirect('/organizer/payment-settings?connected=success');
    
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect('/organizer/payment-settings?connected=error');
  }
}
```

### Step 6: Create Payment with App Fee

```typescript
// app/api/checkout/square-app-fee/route.ts
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { 
    organizerId, 
    amount, // total amount in cents
    customerEmail,
    sourceId, // payment source (card nonce or payment token)
    ticketCount
  } = body;
  
  // Get organizer's Square credentials
  const organizer = await getOrganizer(organizerId);
  
  if (!organizer.square_access_token) {
    return NextResponse.json({ error: 'Organizer not connected to Square' }, { status: 400 });
  }
  
  // Calculate fees
  const PLATFORM_FEE_PER_TICKET = 250; // $2.50 in cents
  const appFeeAmount = PLATFORM_FEE_PER_TICKET * ticketCount;
  
  // Create client with ORGANIZER's access token
  const organizerSquareClient = new Client({
    environment: Environment.Production,
    accessToken: organizer.square_access_token
  });
  
  try {
    const idempotencyKey = randomUUID();
    
    // Create payment on ORGANIZER's account with YOUR app fee
    const { result } = await organizerSquareClient.paymentsApi.createPayment({
      sourceId: sourceId,
      idempotencyKey: idempotencyKey,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD'
      },
      // THIS IS THE KEY PART - App Fee goes to YOUR account
      appFeeMoney: {
        amount: BigInt(appFeeAmount),
        currency: 'USD'
      },
      locationId: organizer.square_location_id,
      buyerEmailAddress: customerEmail,
      note: `SteppersLife Event Tickets`,
      referenceId: body.orderId
    });
    
    // Record the transaction
    await recordTransaction({
      payment_id: result.payment?.id,
      order_id: body.orderId,
      organizer_id: organizerId,
      total_amount: amount,
      app_fee_amount: appFeeAmount,
      net_amount: amount - appFeeAmount,
      status: result.payment?.status
    });
    
    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      status: result.payment?.status,
      receiptUrl: result.payment?.receiptUrl
    });
    
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({
      error: error.errors?.[0]?.detail || 'Payment failed'
    }, { status: 400 });
  }
}
```

### Step 7: Frontend Payment Flow

```typescript
// app/components/checkout/SquarePayment.tsx
'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Square: any;
  }
}

export function SquarePayment({ 
  amount, 
  organizerId, 
  ticketCount,
  onSuccess 
}: PaymentProps) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Calculate fees for display
  const platformFee = 2.50 * ticketCount;
  const organizerReceives = (amount / 100) - platformFee;
  
  useEffect(() => {
    // Load Square Web SDK
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use production URL in prod
    script.onload = initializeSquare;
    document.head.appendChild(script);
  }, []);
  
  async function initializeSquare() {
    if (!window.Square) return;
    
    const payments = window.Square.payments(
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
    );
    
    const card = await payments.card();
    await card.attach('#card-container');
    setCard(card);
  }
  
  async function handlePayment() {
    if (!card) return;
    setLoading(true);
    
    try {
      // Generate payment token
      const result = await card.tokenize();
      
      if (result.status === 'OK') {
        // Send to your backend
        const response = await fetch('/api/checkout/square-app-fee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizerId,
            amount,
            ticketCount,
            sourceId: result.token,
            customerEmail: document.getElementById('email')?.value
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          onSuccess(data);
        } else {
          alert('Payment failed: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>
      
      {/* Fee Disclosure */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="flex justify-between mb-2">
          <span>Ticket Price:</span>
          <span>${(amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Platform Fee:</span>
          <span>${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Organizer Receives:</span>
          <span>${organizerReceives.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Email Input */}
      <input
        type="email"
        id="email"
        placeholder="Email address"
        className="w-full p-2 border rounded mb-4"
        required
      />
      
      {/* Square Card Element */}
      <div id="card-container" className="mb-4"></div>
      
      <button
        onClick={handlePayment}
        disabled={loading || !card}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
      
      <p className="text-xs text-gray-500 mt-4">
        Payment processed securely by Square. The event organizer will receive 
        ${organizerReceives.toFixed(2)} after platform fees.
      </p>
    </div>
  );
}
```

### Step 8: Webhook Handler for Disputes

```typescript
// app/api/webhooks/square/route.ts
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-square-hmacsha256-signature');
  
  // Verify webhook signature
  const hash = createHmac('sha256', process.env.SQUARE_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');
  
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  switch (event.type) {
    case 'payment.created':
      // Payment successful
      await handlePaymentSuccess(event.data);
      break;
      
    case 'dispute.created':
      // CRITICAL: Chargeback initiated
      await handleDispute(event.data);
      break;
      
    case 'dispute.state.changed':
      // Dispute status updated
      await updateDisputeStatus(event.data);
      break;
      
    case 'refund.created':
      // Refund processed
      await handleRefund(event.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handleDispute(data: any) {
  const { dispute } = data.object;
  
  // Find the transaction
  const transaction = await getTransactionByPaymentId(dispute.payment_id);
  
  if (transaction) {
    // Notify organizer IMMEDIATELY
    await sendUrgentEmail(transaction.organizer_id, {
      subject: 'URGENT: Chargeback Received - Action Required',
      template: 'chargeback_alert',
      data: {
        amount: dispute.amount_money.amount / 100,
        reason: dispute.reason,
        deadline: dispute.evidence_due_by,
        payment_id: dispute.payment_id
      }
    });
    
    // Update your database
    await updateTransaction(transaction.id, {
      dispute_status: 'open',
      dispute_amount: dispute.amount_money.amount,
      dispute_reason: dispute.reason
    });
    
    // Create internal alert
    await createAdminAlert({
      type: 'CHARGEBACK',
      severity: 'HIGH',
      message: `Chargeback received for ${transaction.organizer_name}: $${dispute.amount_money.amount / 100}`
    });
  }
}
```

### Step 9: Testing Flow

```bash
# 1. Set up environment variables
SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
SQUARE_APPLICATION_SECRET=sandbox-sq0csb-xxxxx
SQUARE_ACCESS_TOKEN=EAAAEE-sandbox-xxxxx
SQUARE_LOCATION_ID=sandbox-location-id
SQUARE_WEBHOOK_SECRET=your-webhook-secret

# 2. Test cards for sandbox
Success: 4111 1111 1111 1111
Decline: 4000 0000 0000 0002
Dispute: 4000 0000 0000 0259

# 3. Test OAuth flow
1. Organizer clicks "Connect Square"
2. Redirected to Square OAuth
3. Approves connection
4. Redirected back to your app
5. Tokens stored

# 4. Test payment with app fee
1. Customer selects tickets
2. Enters card details
3. Payment processed on organizer's account
4. Your app fee automatically transferred to you
5. Both parties see transaction
```

### Step 10: Production Checklist

```typescript
// Production configuration changes

// 1. Update Square SDK URL
script.src = 'https://web.squarecdn.com/v1/square.js'; // Remove 'sandbox'

// 2. Update environment
const squareClient = new Client({
  environment: Environment.Production, // Not Sandbox
  accessToken: organizer.square_access_token
});

// 3. Configure webhooks in Square Dashboard
// Square Dashboard > Webhooks > Add Endpoint
// URL: https://stepperslife.com/api/webhooks/square
// Events: payment.created, dispute.*, refund.created

// 4. Set up proper error handling
try {
  // Payment code
} catch (error: any) {
  // Log to error tracking service
  await logError({
    service: 'square',
    error: error.errors?.[0] || error,
    organizerId,
    amount
  });
  
  // User-friendly error
  return { error: getReadableError(error) };
}

// 5. Add monitoring
await track('payment.attempted', { provider: 'square', amount });
await track('payment.succeeded', { provider: 'square', amount });
await track('payment.failed', { provider: 'square', reason: error });
```

---

## Option 2: Sequential Payments (Alternative)

If app fees don't work for your use case:

```typescript
// Process payment to YOUR account first, then transfer

async function processSequentialPayment(orderData: any) {
  // Step 1: Charge customer to YOUR Square account
  const payment = await yourSquareClient.paymentsApi.createPayment({
    sourceId: orderData.sourceId,
    amountMoney: { amount: BigInt(orderData.amount), currency: 'USD' },
    locationId: YOUR_LOCATION_ID
  });
  
  // Step 2: Calculate split
  const platformFee = 250 * orderData.ticketCount; // Your fee
  const organizerAmount = orderData.amount - platformFee;
  
  // Step 3: Transfer to organizer (requires separate integration)
  // Note: Square doesn't have direct transfer API, so you'd need:
  // - Bank transfer via ACH
  // - PayPal payout
  // - Check
  // - Manual Square send
  
  await schedulePayoutToOrganizer({
    organizerId: orderData.organizerId,
    amount: organizerAmount,
    method: 'ach',
    paymentRef: payment.result.payment?.id
  });
}
```

---

## Option 3: Square Marketplace (Beta - Requires Approval)

Square is rolling out a true marketplace solution, but it's invitation-only:

```typescript
// If approved for Square Marketplace
const payment = await squareClient.paymentsApi.createPayment({
  sourceId: sourceId,
  amountMoney: { amount: BigInt(totalAmount), currency: 'USD' },
  locationId: organizerLocationId,
  
  // Marketplace split (if approved)
  marketplaceFee: {
    amount: BigInt(platformFee),
    currency: 'USD',
    destinationLocationId: YOUR_LOCATION_ID
  }
});
```

To apply: Contact Square partnership team at partnerships@squareup.com

---

## Recommended Architecture Decision

**For SteppersLife, I recommend:**

1. **Start with App Fee Model** - It's available now and works well
2. **Set fee at $2.50/ticket** for split payment mode
3. **Organizer handles all disputes** - Made clear in terms
4. **You only risk your fee** in chargebacks
5. **Apply for Marketplace** access for future upgrade

This gives you immediate functionality while protecting you from major chargeback liability!