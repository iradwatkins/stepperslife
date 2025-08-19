# API Endpoints Documentation - Payment System

## Complete API Reference
**Version**: 1.0.0
**Base URL**: https://stepperslife.com
**Implementation Date**: 2025-08-19

---

## Table of Contents
1. [Authentication](#authentication)
2. [Payment Endpoints](#payment-endpoints)
3. [Webhook Endpoints](#webhook-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Seller Endpoints](#seller-endpoints)
6. [Status & Health](#status--health)

---

## Authentication

All API endpoints require authentication via NextAuth.js session cookies or API keys for webhooks.

### Session Authentication
```typescript
// Frontend requests include session cookie automatically
const response = await fetch('/api/payments/create', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
});
```

### Webhook Authentication
```typescript
// Webhook signature verification
const signature = request.headers.get('x-square-signature');
const isValid = verifyWebhookSignature(signature, body, secret);
```

---

## Payment Endpoints

### 1. Create Payment Session
**Endpoint**: `POST /api/payments/create-checkout`

**Purpose**: Create a checkout session for any payment method

**Request Body**:
```json
{
  "ticketId": "k57x8...",
  "paymentMethod": "square|stripe|paypal|zelle|bank_transfer",
  "amount": 150.00,
  "eventId": "j97x3...",
  "sellerId": "user_2abc...",
  "returnUrl": "https://stepperslife.com/tickets/success",
  "cancelUrl": "https://stepperslife.com/tickets/cancel"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.square.site/...",
  "sessionId": "cs_123...",
  "referenceNumber": "ZL-1737345678-ABC123", // For manual payments
  "paymentInstructions": {
    "zelleEmail": "seller@example.com",
    "zellePhone": "+1234567890",
    "amount": 150.00,
    "reference": "ZL-1737345678-ABC123"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid payment method",
  "code": "INVALID_PAYMENT_METHOD"
}
```

---

### 2. Submit Manual Payment Proof
**Endpoint**: `POST /api/payments/submit-manual`

**Purpose**: Submit proof of payment for Zelle/Bank transfers

**Request**: `multipart/form-data`
```typescript
const formData = new FormData();
formData.append('ticketId', 'k57x8...');
formData.append('referenceNumber', 'ZL-1737345678-ABC123');
formData.append('paymentMethod', 'zelle');
formData.append('proofFile', file); // Image/PDF file
```

**Response**:
```json
{
  "success": true,
  "paymentRequestId": "pr_123...",
  "status": "pending",
  "message": "Payment proof submitted. Awaiting admin verification.",
  "estimatedProcessingTime": "1-3 business days"
}
```

---

### 3. Check Payment Status
**Endpoint**: `GET /api/payments/status/:referenceNumber`

**Purpose**: Check status of a manual payment request

**Response**:
```json
{
  "success": true,
  "payment": {
    "referenceNumber": "ZL-1737345678-ABC123",
    "status": "pending|approved|rejected|expired",
    "amount": 150.00,
    "paymentMethod": "zelle",
    "submittedAt": "2025-01-19T10:30:00Z",
    "verificationCode": "VERIFY-ZL-1737345678-ABC123", // If approved
    "adminNotes": "Payment confirmed via bank statement",
    "rejectionReason": null // If rejected
  }
}
```

---

### 4. Cancel Payment Request
**Endpoint**: `POST /api/payments/cancel`

**Purpose**: Cancel a pending manual payment request

**Request Body**:
```json
{
  "referenceNumber": "ZL-1737345678-ABC123",
  "reason": "Changed payment method"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment request cancelled"
}
```

---

## Webhook Endpoints

### 1. Square Webhook
**Endpoint**: `POST /api/webhooks/square`

**Headers**:
```
x-square-signature: [signature]
x-square-hmacsha256-signature: [signature]
```

**Events Handled**:
- `payment.created`
- `payment.updated`
- `refund.created`
- `refund.updated`

**Request Body**:
```json
{
  "merchant_id": "ML...",
  "type": "payment.created",
  "event_id": "evt_123",
  "created_at": "2025-01-19T10:30:00Z",
  "data": {
    "type": "payment",
    "id": "payment_123",
    "object": {
      "payment": {
        "id": "payment_123",
        "amount_money": {
          "amount": 15000,
          "currency": "USD"
        },
        "status": "COMPLETED",
        "reference_id": "ticket_k57x8..."
      }
    }
  }
}
```

---

### 2. Stripe Webhook
**Endpoint**: `POST /api/webhooks/stripe`

**Headers**:
```
stripe-signature: [signature]
```

**Events Handled**:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Request Body**:
```json
{
  "id": "evt_123",
  "object": "event",
  "type": "checkout.session.completed",
  "created": 1737345678,
  "data": {
    "object": {
      "id": "cs_123",
      "payment_status": "paid",
      "amount_total": 15000,
      "metadata": {
        "ticketId": "k57x8...",
        "userId": "user_123"
      }
    }
  }
}
```

---

### 3. PayPal Webhook
**Endpoint**: `POST /api/webhooks/paypal`

**Headers**:
```
paypal-transmission-id: [id]
paypal-transmission-time: [timestamp]
paypal-transmission-sig: [signature]
paypal-cert-url: [url]
paypal-auth-algo: SHA256withRSA
```

**Events Handled**:
- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.REFUNDED`

**Request Body**:
```json
{
  "id": "WH-123",
  "event_type": "CHECKOUT.ORDER.APPROVED",
  "resource": {
    "id": "order_123",
    "status": "APPROVED",
    "purchase_units": [{
      "reference_id": "ticket_k57x8...",
      "amount": {
        "currency_code": "USD",
        "value": "150.00"
      }
    }]
  }
}
```

---

## Admin Endpoints

### 1. Get Pending Payments
**Endpoint**: `GET /api/admin/payments/pending`

**Authorization**: Admin only

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `method`: Filter by payment method
- `status`: Filter by status
- `search`: Search by reference number

**Response**:
```json
{
  "success": true,
  "payments": [
    {
      "id": "pr_123",
      "referenceNumber": "ZL-1737345678-ABC123",
      "amount": 150.00,
      "paymentMethod": "zelle",
      "status": "pending",
      "userId": "user_123",
      "userName": "John Doe",
      "sellerId": "user_456",
      "sellerName": "Jane Smith",
      "proofUrl": "https://storage.convex.dev/...",
      "submittedAt": "2025-01-19T10:30:00Z",
      "expiresAt": "2025-01-22T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

---

### 2. Verify Payment
**Endpoint**: `POST /api/admin/payments/verify`

**Authorization**: Admin only

**Request Body**:
```json
{
  "paymentRequestId": "pr_123",
  "action": "approve|reject",
  "verificationCode": "VERIFY-ZL-1737345678-ABC123",
  "adminNotes": "Verified via bank statement",
  "rejectionReason": "Insufficient proof provided" // If rejecting
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment approved successfully",
  "ticket": {
    "id": "k57x8...",
    "status": "purchased"
  },
  "emailSent": true
}
```

---

### 3. Get Payment Statistics
**Endpoint**: `GET /api/admin/payments/statistics`

**Authorization**: Admin only

**Response**:
```json
{
  "success": true,
  "statistics": {
    "total": {
      "pending": 12,
      "approved": 245,
      "rejected": 8,
      "expired": 15
    },
    "byMethod": {
      "square": 180,
      "stripe": 45,
      "paypal": 20,
      "zelle": 22,
      "bank_transfer": 13
    },
    "revenue": {
      "today": 2500.00,
      "week": 15000.00,
      "month": 45000.00,
      "total": 280000.00
    },
    "processingTime": {
      "average": "18 hours",
      "median": "12 hours",
      "fastest": "5 minutes",
      "slowest": "72 hours"
    }
  }
}
```

---

### 4. Export Payment Report
**Endpoint**: `GET /api/admin/payments/export`

**Authorization**: Admin only

**Query Parameters**:
- `format`: csv|json|excel
- `startDate`: ISO date string
- `endDate`: ISO date string
- `status`: Filter by status

**Response**: File download
```
Content-Type: text/csv
Content-Disposition: attachment; filename="payments-2025-01-19.csv"

Reference,Amount,Method,Status,User,Seller,Date
ZL-1737345678-ABC123,150.00,zelle,approved,John Doe,Jane Smith,2025-01-19
...
```

---

## Seller Endpoints

### 1. Get Payment Settings
**Endpoint**: `GET /api/seller/payment-settings`

**Authorization**: Authenticated seller

**Response**:
```json
{
  "success": true,
  "settings": {
    "acceptedMethods": ["square", "stripe", "zelle"],
    "preferredPayoutMethod": "bank_transfer",
    "zelle": {
      "email": "seller@example.com",
      "phone": "+1234567890",
      "displayName": "John's Business"
    },
    "bankAccount": {
      "last4": "6789",
      "accountType": "checking",
      "verified": true
    },
    "paymentProviders": {
      "square": {
        "connected": true,
        "locationId": "LM...",
        "merchantId": "ML..."
      },
      "stripe": {
        "connected": false
      },
      "paypal": {
        "connected": true,
        "merchantId": "PP..."
      }
    }
  }
}
```

---

### 2. Update Payment Settings
**Endpoint**: `PUT /api/seller/payment-settings`

**Authorization**: Authenticated seller

**Request Body**:
```json
{
  "acceptedMethods": ["square", "stripe", "zelle"],
  "preferredPayoutMethod": "zelle",
  "zelle": {
    "email": "newemail@example.com",
    "phone": "+1987654321",
    "displayName": "My Business"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment settings updated",
  "settings": { /* Updated settings */ }
}
```

---

### 3. Update Bank Account
**Endpoint**: `POST /api/seller/bank-account`

**Authorization**: Authenticated seller

**Request Body**:
```json
{
  "accountNumber": "123456789",
  "routingNumber": "021000021",
  "accountName": "John Doe",
  "accountType": "checking"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bank account updated",
  "verificationRequired": true,
  "verificationMethod": "micro_deposits"
}
```

---

### 4. Connect Payment Provider
**Endpoint**: `POST /api/seller/connect/:provider`

**Authorization**: Authenticated seller

**Providers**: `square`, `stripe`, `paypal`

**Request Body** (varies by provider):
```json
{
  // Square
  "authorizationCode": "sq0cgp-...",
  
  // Stripe
  "accountId": "acct_...",
  
  // PayPal
  "merchantId": "PP...",
  "refreshToken": "..."
}
```

**Response**:
```json
{
  "success": true,
  "provider": "square",
  "connected": true,
  "accountDetails": {
    "merchantId": "ML...",
    "locationId": "LM...",
    "businessName": "John's Events"
  }
}
```

---

## Status & Health

### 1. Health Check
**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T10:30:00Z",
  "services": {
    "database": "connected",
    "square": "operational",
    "stripe": "operational",
    "paypal": "operational",
    "email": "operational"
  }
}
```

---

### 2. Payment Provider Status
**Endpoint**: `GET /api/payments/provider-status`

**Response**:
```json
{
  "providers": {
    "square": {
      "status": "operational",
      "lastCheck": "2025-01-19T10:29:00Z",
      "responseTime": 245
    },
    "stripe": {
      "status": "operational",
      "lastCheck": "2025-01-19T10:29:00Z",
      "responseTime": 189
    },
    "paypal": {
      "status": "degraded",
      "lastCheck": "2025-01-19T10:29:00Z",
      "responseTime": 1245,
      "message": "Elevated response times"
    }
  }
}
```

---

## Error Codes

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* Additional context */ }
}
```

### Common Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `INVALID_REQUEST` | Invalid request parameters | 400 |
| `PAYMENT_FAILED` | Payment processing failed | 402 |
| `PROVIDER_ERROR` | Payment provider error | 502 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

---

## Rate Limiting

### Limits by Endpoint Type
| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Payment Creation | 10 | 1 minute |
| Status Check | 30 | 1 minute |
| Admin Actions | 100 | 1 minute |
| Webhooks | 1000 | 1 minute |
| Export | 5 | 1 hour |

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1737345738
```

---

## Testing

### Test Environment
Base URL: `http://localhost:3000`

### Test Credentials
```json
{
  "admin": {
    "email": "admin@test.com",
    "password": "test123"
  },
  "seller": {
    "email": "seller@test.com",
    "password": "test123"
  },
  "buyer": {
    "email": "buyer@test.com",
    "password": "test123"
  }
}
```

### Postman Collection
Import the collection from: `/docs/postman/payment-api.json`

---

End of API Documentation