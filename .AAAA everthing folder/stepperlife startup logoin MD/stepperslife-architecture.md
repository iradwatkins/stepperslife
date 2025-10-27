# SteppersLife Ecosystem - Complete Architecture & Implementation Guide

**Version:** 1.0  
**Date:** October 7, 2025  
**Purpose:** Full technical specification for SteppersLife multi-platform ecosystem

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Business Model](#business-model)
3. [Platform Architecture](#platform-architecture)
4. [Authentication & Roles](#authentication--roles)
5. [Payment Processing](#payment-processing)
6. [Design System](#design-system)
7. [Database Schema](#database-schema)
8. [Server Structure](#server-structure)
9. [Deployment Strategy](#deployment-strategy)
10. [Implementation Phases](#implementation-phases)

---

## Executive Overview

### The Vision

SteppersLife is a **multi-platform ecosystem** serving the Chicago Steppin community with six integrated services:

1. **Main Portal** (stepperslife.com) - Consumer marketplace/aggregator
2. **Restaurant SaaS** (restaurants.stepperslife.com) - Pickup order system
3. **Event Platform** (events.stepperslife.com) - Ticket sales & management
4. **Store Marketplace** (store.stepperslife.com) - Multi-vendor e-commerce
5. **Classes Platform** (classes.stepperslife.com) - Video learning for dance
6. **Services Directory** (services.stepperslife.com) - Service provider listings
7. **Magazine** (magazine.stepperslife.com) - Community content & articles

### Core Principles

- **One Login, All Services** - Single sign-on via NextAuth across all platforms
- **Modular Architecture** - Each service can be spun off as standalone SaaS
- **Platform Marketplace Model** - Like Uber/Eventbrite (facilitator, not merchant)
- **Consistent Brand** - Unified design with subtle role-based theming

---

## Business Model

### Revenue Model: Platform Fees

**SteppersLife operates as a facilitator**, taking platform fees on all transactions:

#### Fee Structure

| Service | Platform Fee | Processing Fee | Business Keeps |
|---------|-------------|----------------|----------------|
| **Restaurants** | 5-8% | 2.9% + $0.30 (Stripe) or 3.49% + $0.49 (PayPal) | ~87-92% |
| **Events** | $1.50-$3.00 per ticket OR 7.5% | Included in fee | ~85-90% |
| **Store** | 7-10% | 2.9% + $0.30 (Stripe) or 3.49% + $0.49 (PayPal) | ~85-90% |
| **Classes** | 10-15% | 2.9% + $0.30 (Stripe) or 3.49% + $0.49 (PayPal) | ~80-87% |
| **Services** | $0 (lead gen) OR $29/month | N/A | 100% or subscription |

#### Example Transaction (Restaurant Order)

```
Customer pays: $50.00
├─ Business receives: $46.50 (93%)
├─ SteppersLife fee: $2.50 (5%)
└─ Stripe processing: $1.00 (2%)

Payment Flow:
Customer → Stripe → Auto-split → Business + SteppersLife
Business gets payout in 2 days
```

### Liability Model

**Independent Contractor Model (like Uber)**

- Business owners are independent operators
- SteppersLife provides technology platform only
- Each business responsible for:
  - Food safety (restaurants)
  - Event delivery (organizers)
  - Product quality (vendors)
  - Content quality (instructors)
  - Professional liability (service providers)

---

## Platform Architecture

### Multi-Domain Setup

```
Consumer Portal:
└─ stepperslife.com (main marketplace)

Business Management SaaS:
├─ restaurants.stepperslife.com
├─ events.stepperslife.com
├─ store.stepperslife.com
├─ classes.stepperslife.com
├─ services.stepperslife.com
└─ magazine.stepperslife.com
```

### How It Works

#### Customer Journey (Consumer Side)

```
User visits stepperslife.com
  ↓
Browses restaurants, events, stores, classes
  ↓
Places order / buys ticket / enrolls in class
  ↓
Payment processed on stepperslife.com
  ↓
Order sent to business via API
  ↓
Customer NEVER leaves stepperslife.com
```

#### Business Owner Journey (Management Side)

```
Owner logs in on stepperslife.com
  ↓
Clicks "Manage My Restaurant"
  ↓
Redirects to restaurants.stepperslife.com
  ↓
Auto-logged in via NextAuth session (no re-login)
  ↓
Manages menu, orders, analytics
  ↓
Can switch between businesses easily
```

### Data Flow Architecture

```
SteppersLife.com (Consumer UI)
    ↓ (API calls)
    ↓
Restaurant SaaS API ← Restaurant Owner Dashboard
Event SaaS API ← Event Organizer Dashboard
Store SaaS API ← Vendor Dashboard
Classes SaaS API ← Instructor Dashboard
Services SaaS API ← Provider Dashboard
    ↓
Each SaaS has own database
    ↓
Webhooks update SteppersLife
```

**Key Concept:** SteppersLife.com is an **aggregator** that pulls from SaaS platforms via APIs. Business owners manage via dedicated dashboards.

---

## Authentication & Roles

### Single Sign-On (SSO) Architecture

**Technology:** NextAuth.js

**How it works:**

1. **One NextAuth configuration** for entire ecosystem
2. **JWT tokens** stored in HTTP-only cookies with domain `.stepperslife.com`
3. **User logs in once** → authenticated everywhere
4. **No re-login needed** when navigating between subdomains

#### NextAuth Configuration

```
NextAuth Settings:

Supported Domains:
├─ stepperslife.com
├─ restaurants.stepperslife.com
├─ events.stepperslife.com
├─ store.stepperslife.com
├─ classes.stepperslife.com
├─ services.stepperslife.com
└─ magazine.stepperslife.com

Cookie Domain: .stepperslife.com
Session Strategy: JWT with HTTP-only cookies
Token Type: JWT
```

#### Environment Variables (Same Across All Apps)

```bash
# All apps use SAME NextAuth configuration
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET="your-secret-key"
# OAuth providers (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Role System

#### Role Hierarchy

```
ADMIN (Platform-wide)
  └─ Full access to everything
  
USER (Foundation - Everyone)
  └─ Can browse, purchase, order
  
BUSINESS OWNER (Provider Roles - Self-Assignable)
  ├─ STORE_OWNER
  │   └─ Can assign: STORE_ADMIN
  ├─ RESTAURANT_OWNER
  │   └─ Can assign: RESTAURANT_MANAGER, RESTAURANT_STAFF
  ├─ EVENT_ORGANIZER
  │   └─ Can assign: EVENT_STAFF, AFFILIATE
  ├─ INSTRUCTOR
  │   └─ Can manage own classes
  ├─ SERVICE_PROVIDER
  │   └─ Can manage own services
  └─ MAGAZINE_WRITER
      └─ Submit articles (need ADMIN approval)

ASSIGNED ROLES (Cannot self-assign)
  ├─ STORE_ADMIN
  ├─ RESTAURANT_MANAGER
  ├─ RESTAURANT_STAFF
  ├─ EVENT_STAFF
  └─ AFFILIATE
```

#### Role Assignment Logic

**1. USER Role (Automatic)**
- Assigned when user signs up
- Everyone has this by default

**2. Provider Roles (Self-Assigned via Business Creation)**
- User creates restaurant → gets RESTAURANT_OWNER role
- User creates event → gets EVENT_ORGANIZER role
- User can have MULTIPLE provider roles

**3. Helper Roles (Assigned by Business Owner)**
- Restaurant owner can assign RESTAURANT_STAFF to help manage
- Event organizer can assign AFFILIATE to sell tickets
- Only owner can assign/revoke

**4. ADMIN Role (Manually Assigned)**
- Only existing ADMIN can assign new ADMIN
- Platform-wide access

#### Business Limits

To prevent abuse:

```
Per User Account:
├─ Restaurants: Max 3
├─ Events: Max 10 ongoing event series
├─ Store Vendors: Max 3
├─ Class Instructors: Max 3
└─ Service Providers: Max 3
```

**Verification increases with each business:**
- 1st business: Email + phone verification
- 2nd business: Photo ID required
- 3rd business: Additional documents + review

---

## Payment Processing

### Two Payment Processors

**Stripe + PayPal** (Square removed due to marketplace limitations)

#### Why These Two?

| Feature | Stripe | PayPal |
|---------|--------|--------|
| Marketplace Support | ✅ Stripe Connect | ✅ Commerce Platform |
| Auto Fee Splitting | ✅ Yes | ✅ Yes |
| Direct Payouts | ✅ Yes | ✅ Yes |
| Verification | ✅ Stripe Identity | ✅ PayPal KYC |
| Processing Fee | 2.9% + $0.30 | 3.49% + $0.49 |
| Payout Speed | 2 business days | Instant to PayPal |

#### Business Owner Choice

Business owners can enable:
- **Stripe only**
- **PayPal only**
- **Both** (recommended - maximizes customer reach)

Customers see available payment methods at checkout.

### Stripe Connect Flow

```javascript
// Business owner connects Stripe account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  }
});

// Customer makes payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // $50.00
  currency: 'usd',
  application_fee_amount: 250, // $2.50 platform fee (5%)
  transfer_data: {
    destination: businessStripeAccountId
  }
});

// Money flows automatically:
// - $46.50 → Business (2 days)
// - $2.50 → SteppersLife (instant)
// - $1.00 → Stripe (processing fee)
```

### PayPal Commerce Platform Flow

```javascript
// Business owner connects PayPal account
const onboarding = await paypal.partnerReferrals.create({
  partner_config_override: {
    partner_logo_url: 'https://stepperslife.com/logo.png',
    return_url: 'https://stepperslife.com/paypal/success'
  }
});

// Customer makes payment
const order = await paypal.orders.create({
  purchase_units: [{
    amount: {
      currency_code: 'USD',
      value: '50.00'
    },
    payee: {
      merchant_id: businessPayPalMerchantId
    },
    payment_instruction: {
      platform_fees: [{
        amount: {
          currency_code: 'USD',
          value: '2.50'
        }
      }]
    }
  }]
});
```

### Verification: Stripe Identity

**Instead of manual ID review, use Stripe Identity (automated):**

```javascript
// Business owner onboarding
const verificationSession = await stripe.identity.verificationSessions.create({
  type: 'document',
  metadata: {
    business_id: 'rest_456',
    user_id: 'john_123'
  }
});

// Stripe prompts user to:
// 1. Upload photo of ID
// 2. Take selfie
// 3. Auto-verifies in seconds to minutes

// Webhook confirms verification
// Business can start accepting payments
```

**Cost:** ~$1.50 per verification (worth it to avoid manual review)

---

## Design System

### Theme Strategy

**Consistent brand with ONE color change based on context**

#### Base Theme (Unchanged)

```css
:root {
  --background: #ffffff;
  --foreground: #0f1419;
  --card: #f7f8f8;
  --card-foreground: #0f1419;
  --secondary: #0f1419;
  --muted: #e5e5e6;
  --destructive: #f4212e;
  --border: #e1eaef;
  --input: #f7f9fa;
  --font-sans: Open Sans, sans-serif;
  --radius: 1.3rem;
  /* ALL OTHER VARIABLES STAY THE SAME */
}
```

#### Only `--primary` Changes

**Customer Mode (Blue):**
```css
--primary: #1e9df1;  /* Twitter Blue */
--sidebar-primary: #1e9df1;
--ring: #1da1f2;
```

**Business Mode (Green):**
```css
--primary: #10b981;  /* Emerald Green */
--sidebar-primary: #10b981;
--ring: #10b981;
```

**Admin Mode (Orange):**
```css
--primary: #f97316;  /* Orange */
--sidebar-primary: #f97316;
--ring: #f97316;
```

### Visual Indicators

**Subtle differences admins will notice:**

1. **Primary button color** (blue → green → orange)
2. **Links and accents** (blue → green → orange)
3. **Navigation highlights** (blue → green → orange)
4. **Logo accent** (can be colored to match primary)
5. **Focus rings** (blue → green → orange)

**Everything else identical:**
- Typography
- Spacing
- Shadows
- Borders
- Layout
- Components

### Per-App CSS Override

```css
/* apps/main/app/globals.css (CUSTOMER - BLUE) */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #1e9df1;
  --sidebar-primary: #1e9df1;
  --ring: #1da1f2;
}

.dark {
  --primary: #1c9cf0;
  --sidebar-primary: #1da1f2;
  --ring: #1da1f2;
}
```

```css
/* apps/restaurants/app/globals.css (BUSINESS - GREEN) */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #10b981;
  --sidebar-primary: #10b981;
  --ring: #10b981;
}

.dark {
  --primary: #34d399;
  --sidebar-primary: #34d399;
  --ring: #34d399;
}
```

```css
/* apps/main/app/admin/layout.tsx (ADMIN - ORANGE) */
/* Override in component with inline style or className */
<div style={{'--primary': '#f97316'} as React.CSSProperties}>
  {/* Admin content */}
</div>
```

---

## Database Schema

### Core Models

#### User & Roles

```prisma
model User {
  id            String   @id @default(cuid())
  // Note: NextAuth handles user management via Prisma adapter
  // No separate auth provider ID needed
  email         String   @unique
  name          String?
  phone         String?
  
  // Roles
  roles         UserRole[]
  
  // Customer profile
  customerProfile CustomerProfile?
  
  // Business ownership
  ownedBusinesses Business[] @relation("BusinessOwner")
  managedBusinesses BusinessStaff[]
  
  // Notifications
  pushSubscription Json?
  notificationSettings NotificationSettings?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model UserRole {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role          Role
  
  // If assigned by someone (not self-assigned)
  assignedBy    String?
  assignedAt    DateTime @default(now())
  
  // If role specific to a business
  businessId    String?
  business      Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  @@unique([userId, role, businessId])
  @@index([userId])
  @@index([role])
  @@map("user_roles")
}

enum Role {
  USER
  ADMIN
  STORE_OWNER
  RESTAURANT_OWNER
  EVENT_ORGANIZER
  INSTRUCTOR
  SERVICE_PROVIDER
  MAGAZINE_WRITER
  STORE_ADMIN
  RESTAURANT_MANAGER
  RESTAURANT_STAFF
  EVENT_STAFF
  AFFILIATE
}
```

#### Business

```prisma
model Business {
  id            String   @id @default(cuid())
  
  // Owner
  ownerId       String
  owner         User     @relation("BusinessOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  
  // Staff/helpers
  staff         BusinessStaff[]
  userRoles     UserRole[]
  
  // Business details
  type          BusinessType
  name          String
  slug          String   @unique
  description   String?
  logoUrl       String?
  
  // External platform (SaaS)
  platformType  String   // 'pickuporders', 'eventflow', etc.
  platformId    String   // ID on external platform
  platformUrl   String?  // Deep link to dashboard
  
  // Stripe Connect
  stripeAccountId       String?  @unique
  stripeChargesEnabled  Boolean  @default(false)
  stripePayoutsEnabled  Boolean  @default(false)
  stripeOnboardingComplete Boolean @default(false)
  
  // PayPal Commerce
  paypalMerchantId      String?  @unique
  paypalEmailConfirmed  Boolean  @default(false)
  paypalPaymentsReceivable Boolean @default(false)
  
  // Payment processors enabled
  paymentProcessors PaymentProcessor[]
  
  // Platform fees
  platformFeePercent    Decimal  @default(5.0)
  platformFeeFixed      Decimal  @default(0)
  
  // Verification
  verification  BusinessVerification?
  
  // Status
  status        BusinessStatus @default(PENDING)
  canAcceptOrders Boolean     @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("businesses")
}

enum BusinessType {
  RESTAURANT
  EVENT_ORGANIZER
  STORE_VENDOR
  INSTRUCTOR
  SERVICE_PROVIDER
}

enum BusinessStatus {
  PENDING
  ACTIVE
  SUSPENDED
  CLOSED
}

enum PaymentProcessor {
  STRIPE
  PAYPAL
}
```

#### Business Staff

```prisma
model BusinessStaff {
  id            String   @id @default(cuid())
  
  businessId    String
  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role          Role     // STORE_ADMIN, RESTAURANT_MANAGER, etc.
  
  // Custom permissions (granular control)
  permissions   Json?    // { canEditMenu: true, canProcessOrders: true, canViewReports: false }
  
  assignedBy    String
  assignedAt    DateTime @default(now())
  
  active        Boolean  @default(true)
  revokedAt     DateTime?
  revokedBy     String?
  
  @@unique([businessId, userId, role])
  @@index([businessId])
  @@index([userId])
  @@map("business_staff")
}
```

#### Verification

```prisma
model BusinessVerification {
  id            String   @id @default(cuid())
  businessId    String   @unique
  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  status        VerificationStatus @default(PENDING)
  level         Int      @default(1) // 1=basic, 2=standard, 3=enhanced
  
  // Stripe Identity
  stripeVerified Boolean @default(false)
  stripeVerificationSessionId String?
  
  // PayPal KYC
  paypalVerified Boolean @default(false)
  
  // Platform-specific documents
  documents     VerificationDocument[]
  
  submittedAt   DateTime?
  reviewedAt    DateTime?
  verifiedAt    DateTime?
  
  reviewerId    String?
  reviewerNotes String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("business_verifications")
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
  SUSPENDED
}

model VerificationDocument {
  id              String   @id @default(cuid())
  verificationId  String
  verification    BusinessVerification @relation(fields: [verificationId], references: [id], onDelete: Cascade)
  
  type            DocumentType
  url             String   // MinIO/S3 storage URL
  status          DocumentStatus @default(PENDING)
  
  uploadedAt      DateTime @default(now())
  reviewedAt      DateTime?
  
  @@map("verification_documents")
}

enum DocumentType {
  HEALTH_PERMIT
  BUSINESS_LICENSE
  PHOTO_ID
  INSURANCE_CERT
  TAX_DOCUMENT
  OTHER
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Orders

```prisma
model Order {
  id            String   @id @default(cuid())
  
  // Customer
  customerId    String
  
  // Business
  businessId    String
  businessType  BusinessType
  
  // External platform reference
  externalPlatform String  // 'pickuporders', 'eventflow', etc.
  externalOrderId  String?
  
  // Payment details
  paymentProcessor  PaymentProcessor
  stripePaymentIntentId String?  @unique
  paypalOrderId         String?  @unique
  
  // Amounts
  subtotal      Decimal
  tax           Decimal
  total         Decimal
  platformFee   Decimal
  processingFee Decimal
  businessPayout Decimal
  
  // Status
  status        OrderStatus
  paymentStatus PaymentStatus
  
  paidAt        DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  READY
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

#### Notifications

```prisma
model NotificationSettings {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Global
  bundlingEnabled Boolean @default(true)
  bundleDelayMinutes Int  @default(30)
  
  // Quiet hours
  quietHoursEnabled Boolean @default(true)
  quietHoursStart   String  @default("22:00")
  quietHoursEnd     String  @default("07:00")
  
  // Customer notifications
  customerOrderUpdates    Boolean @default(true)
  customerEventReminders  Boolean @default(true)
  customerMarketing       Boolean @default(false)
  
  // Business notifications
  businessNewOrders       Boolean @default(true)
  businessMessages        Boolean @default(true)
  businessDailySummary    Boolean @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("notification_settings")
}

model Notification {
  id            String   @id @default(cuid())
  userId        String
  
  type          NotificationType
  priority      NotificationPriority
  
  title         String
  body          String
  data          Json?
  
  // Bundling
  bundleId      String?
  
  // Status
  read          Boolean  @default(false)
  sent          Boolean  @default(false)
  sentAt        DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([userId, read])
  @@index([bundleId])
  @@map("notifications")
}

enum NotificationType {
  ORDER_NEW
  ORDER_READY
  ORDER_COMPLETED
  TICKET_SOLD
  EVENT_REMINDER
  ENROLLMENT_NEW
  PRODUCT_SOLD
  INVENTORY_LOW
  PAYMENT_RECEIVED
  MESSAGE_RECEIVED
  VERIFICATION_UPDATE
  SYSTEM
}

enum NotificationPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

---

## Server Structure

### Monorepo Architecture

```
/root/websites/stepperslife-ecosystem/
├── apps/
│   ├── main/                          # stepperslife.com
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (customer)/
│   │   │   │   ├── restaurants/
│   │   │   │   ├── events/
│   │   │   │   ├── store/
│   │   │   │   ├── classes/
│   │   │   │   ├── services/
│   │   │   │   └── magazine/
│   │   │   ├── (business)/
│   │   │   │   └── dashboard/
│   │   │   ├── admin/
│   │   │   ├── api/
│   │   │   │   ├── webhooks/
│   │   │   │   │   ├── stripe/
│   │   │   │   │   ├── paypal/
│   │   │   │   │   ├── restaurants/
│   │   │   │   │   ├── events/
│   │   │   │   │   └── store/
│   │   │   │   ├── integrations/
│   │   │   │   │   ├── pickuporders/
│   │   │   │   │   ├── eventflow/
│   │   │   │   │   └── vendorspace/
│   │   │   │   ├── notifications/
│   │   │   │   ├── payments/
│   │   │   │   └── verifications/
│   │   │   └── globals.css
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── restaurants/                   # restaurants.stepperslife.com
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── menu/
│   │   │   ├── analytics/
│   │   │   ├── api/
│   │   │   └── globals.css
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── events/                        # events.stepperslife.com
│   ├── store/                         # store.stepperslife.com
│   ├── classes/                       # classes.stepperslife.com
│   ├── services/                      # services.stepperslife.com
│   └── magazine/                      # magazine.stepperslife.com
│
├── packages/
│   ├── database/                      # Shared Prisma schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── client.ts
│   │   └── package.json
│   │
│   ├── auth/                          # Shared auth utilities
│   │   ├── permissions.ts
│   │   ├── roles.ts
│   │   ├── middleware.ts
│   │   └── package.json
│   │
│   ├── ui/                            # Shared design system
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ... (shadcn components)
│   │   ├── hooks/
│   │   │   └── useTheme.tsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── payments/                      # Shared payment utilities
│   │   ├── stripe.ts
│   │   ├── paypal.ts
│   │   ├── types.ts
│   │   └── package.json
│   │
│   └── types/                         # Shared TypeScript types
│       ├── business.ts
│       ├── user.ts
│       ├── order.ts
│       └── package.json
│
├── package.json                       # Workspace root
├── pnpm-workspace.yaml
├── turbo.json                         # Optional: Turborepo config
└── .env                               # Shared environment variables
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "stepperslife-ecosystem",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.9.2"
  }
}
```

### Technology Stack

**Framework & Runtime:**
- Next.js 15.0.3 (App Router)
- React 18.3.1
- TypeScript 5.9.2
- Node.js (via PM2)

**Authentication:**
- NextAuth.js (next-auth ^4.24.0)

**Database & ORM:**
- PostgreSQL (primary database)
- Prisma 6.15.0
- Redis/IORedis 5.4.2 (caching)

**Payments:**
- Stripe 17.5.0
- @stripe/stripe-js 4.11.0
- PayPal SDK

**Storage:**
- MinIO 8.0.2 (R2-compatible object storage)
- Sharp 0.34.4 (image processing)

**UI/Styling:**
- Tailwind CSS 3.4.17
- shadcn/ui (Radix UI components)
- Framer Motion 12.23.22
- Lucide React (icons)
- next-themes 0.4.6

**Forms & Validation:**
- React Hook Form 7.63.0
- Zod 3.24.2

**State Management:**
- Zustand 5.0.4
- TanStack Query 5.62.0

**PWA & Notifications:**
- next-pwa 5.6.0
- Firebase Cloud Messaging
- web-push 3.6.7

**Monitoring & Email:**
- Sentry 10.16.0
- Winston 3.17.0
- Resend 6.1.1

**Testing:**
- Jest 29.5.0
- Playwright 1.49.1

---

## Deployment Strategy

### PM2 Configuration

```javascript
// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'stepperslife-main',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/main',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'stepperslife-restaurants',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/restaurants',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'stepperslife-events',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/events',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    },
    {
      name: 'stepperslife-store',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/store',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      }
    },
    {
      name: 'stepperslife-classes',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/classes',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      }
    },
    {
      name: 'stepperslife-services',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/services',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      }
    },
    {
      name: 'stepperslife-magazine',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/websites/stepperslife-ecosystem/apps/magazine',
      env: {
        NODE_ENV: 'production',
        PORT: 3007
      }
    }
  ]
};
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/stepperslife

# Main site
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Restaurant subdomain
server {
    listen 80;
    listen [::]:80;
    server_name restaurants.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Events subdomain
server {
    listen 80;
    listen [::]:80;
    server_name events.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Store subdomain
server {
    listen 80;
    listen [::]:80;
    server_name store.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Classes subdomain
server {
    listen 80;
    listen [::]:80;
    server_name classes.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Services subdomain
server {
    listen 80;
    listen [::]:80;
    server_name services.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Magazine subdomain
server {
    listen 80;
    listen [::]:80;
    server_name magazine.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates for all domains
sudo certbot --nginx -d stepperslife.com -d www.stepperslife.com \
  -d restaurants.stepperslife.com \
  -d events.stepperslife.com \
  -d store.stepperslife.com \
  -d classes.stepperslife.com \
  -d services.stepperslife.com \
  -d magazine.stepperslife.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Environment Variables

```bash
# .env (shared across all apps)

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife"
REDIS_URL="redis://localhost:6379"

# NextAuth (SAME for all apps)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-generated-secret-key"
GOOGLE_CLIENT_ID="..." # Optional OAuth
GOOGLE_CLIENT_SECRET="..." # Optional OAuth

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_ID="..."
PAYPAL_MODE="live"

# Firebase (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
FIREBASE_SERVER_KEY="..."

# MinIO/Object Storage
MINIO_ENDPOINT="..."
MINIO_ACCESS_KEY="..."
MINIO_SECRET_KEY="..."
MINIO_BUCKET="stepperslife"

# Platform Config
PLATFORM_FEE_PERCENT="5.0"
PLATFORM_NAME="SteppersLife"
NEXT_PUBLIC_APP_URL="https://stepperslife.com"

# Monitoring
SENTRY_DSN="..."
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Monorepo Setup**
- [ ] Create monorepo structure
- [ ] Set up pnpm workspaces
- [ ] Initialize all apps with Next.js
- [ ] Create shared packages (database, auth, ui)
- [ ] Configure TypeScript paths

**Week 2: Authentication & Database**
- [ ] Set up NextAuth multi-domain session sharing
- [ ] Test SSO across subdomains
- [ ] Implement Prisma schema
- [ ] Run migrations
- [ ] Create seed data
- [ ] Build role management system

**Week 3: Design System**
- [ ] Set up shared UI package
- [ ] Implement theme switching
- [ ] Create core components (Button, Card, Input, etc.)
- [ ] Set up Tailwind base config
- [ ] Test color switching per app

**Week 4: Deployment Infrastructure**
- [ ] Configure DNS for all subdomains
- [ ] Set up Nginx reverse proxy
- [ ] Configure PM2 for all apps
- [ ] Set up SSL certificates
- [ ] Deploy placeholder apps
- [ ] Test cross-domain navigation

### Phase 2: Payment Integration (Weeks 5-7)

**Week 5: Stripe Connect**
- [ ] Create Stripe Connect integration
- [ ] Build business onboarding flow
- [ ] Implement Stripe Identity verification
- [ ] Set up webhook handlers
- [ ] Test payment splitting

**Week 6: PayPal Commerce**
- [ ] Add PayPal SDK
- [ ] Build merchant onboarding
- [ ] Implement platform fees
- [ ] Set up PayPal webhooks
- [ ] Test both payment processors

**Week 7: Payment UI**
- [ ] Build checkout components
- [ ] Create payment method selector
- [ ] Implement business payout dashboard
- [ ] Add transaction history
- [ ] Test end-to-end payment flows

### Phase 3: First SaaS Platform - Restaurants (Weeks 8-12)

**Week 8: Restaurant SaaS Backend**
- [ ] Design restaurant database schema
- [ ] Create restaurant API endpoints
- [ ] Build menu management API
- [ ] Implement order processing
- [ ] Set up webhooks to main site

**Week 9: Restaurant Dashboard**
- [ ] Build restaurant owner dashboard
- [ ] Create menu editor
- [ ] Implement order queue interface
- [ ] Add analytics views
- [ ] Build settings page

**Week 10: Main Site Integration**
- [ ] Build restaurant listing page
- [ ] Create restaurant detail page
- [ ] Implement order flow on main site
- [ ] Connect to restaurant API
- [ ] Test end-to-end ordering

**Week 11: Business Onboarding**
- [ ] Create restaurant setup wizard
- [ ] Build verification document upload
- [ ] Implement automated verification (Stripe Identity)
- [ ] Add manual review system
- [ ] Test onboarding flow

**Week 12: Testing & Polish**
- [ ] E2E testing (customer + restaurant owner)
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation
- [ ] Beta launch with test restaurants

### Phase 4: Additional SaaS Platforms (Weeks 13-28)

**Weeks 13-16: Event Platform**
- [ ] Build event management system
- [ ] Implement ticket sales
- [ ] Create event organizer dashboard
- [ ] QR code check-in system
- [ ] Integrate with main site

**Weeks 17-20: Store Marketplace**
- [ ] Build multi-vendor store system
- [ ] Implement product management
- [ ] Create vendor dashboard
- [ ] Order fulfillment system
- [ ] Integrate with main site

**Weeks 21-24: Classes Platform**
- [ ] Video upload & hosting
- [ ] Course management system
- [ ] Instructor dashboard
- [ ] Student enrollment
- [ ] Integrate with main site

**Weeks 25-28: Services Directory**
- [ ] Service provider listings
- [ ] Search & filter system
- [ ] Provider profiles
- [ ] Reviews & ratings
- [ ] Integrate with main site

### Phase 5: PWA & Notifications (Weeks 29-32)

**Week 29: PWA Setup**
- [ ] Configure next-pwa
- [ ] Create manifest.json
- [ ] Generate PWA icons
- [ ] Implement service worker
- [ ] Test "Add to Home Screen"

**Week 30: Firebase Cloud Messaging**
- [ ] Set up Firebase project
- [ ] Implement push notification system
- [ ] Build notification preferences
- [ ] Create notification center UI
- [ ] Test push notifications

**Week 31: Notification Logic**
- [ ] Implement notification bundling
- [ ] Build quiet hours system
- [ ] Create priority-based notifications
- [ ] Add notification webhooks from SaaS platforms
- [ ] Test all notification types

**Week 32: Mobile Optimization**
- [ ] Optimize for mobile devices
- [ ] Test offline functionality
- [ ] Performance tuning
- [ ] Add progressive enhancement
- [ ] Final testing

### Phase 6: Magazine & Polish (Weeks 33-36)

**Week 33: Magazine Platform**
- [ ] Article submission system
- [ ] Content moderation dashboard
- [ ] Article editor (rich text)
- [ ] Categories & tags
- [ ] Integrate with main site

**Week 34: Advanced Features**
- [ ] Multi-business dashboard
- [ ] Business switcher UI
- [ ] Staff management interface
- [ ] Affiliate system (events)
- [ ] Advanced analytics

**Week 35: Testing & QA**
- [ ] Comprehensive E2E testing
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility testing
- [ ] Bug fixes

**Week 36: Launch Preparation**
- [ ] User documentation
- [ ] Business owner guides
- [ ] Marketing materials
- [ ] Support system
- [ ] **PUBLIC LAUNCH**

---

## Critical Success Factors

### Authentication Must-Haves
✅ Single NextAuth configuration for all domains
✅ Cookie domain set to `.stepperslife.com`
✅ SSO tested across all subdomains
✅ Role-based access control working
✅ Business owner can manage multiple businesses

### Payment Must-Haves
✅ Stripe Connect fully integrated
✅ PayPal Commerce Platform working
✅ Automatic fee splitting functional
✅ Stripe Identity verification automated
✅ Business owners can choose payment processors

### Design Must-Haves
✅ Consistent components across all apps
✅ Color switching (blue → green → orange) working
✅ Dark mode functional everywhere
✅ Responsive on all devices
✅ PWA installable on mobile

### Infrastructure Must-Haves
✅ All subdomains properly routed
✅ SSL certificates working
✅ PM2 managing all apps
✅ Database migrations system
✅ Backup strategy in place

---

## Risk Mitigation

### Technical Risks

**Risk:** NextAuth SSO fails across subdomains
**Mitigation:** Test thoroughly in staging with same domain structure

**Risk:** Payment processor integration issues
**Mitigation:** Build abstraction layer, extensive testing with test accounts

**Risk:** Database performance with multiple apps
**Mitigation:** Proper indexing, connection pooling, Redis caching

**Risk:** One app crashing affects others
**Mitigation:** PM2 auto-restart, isolated processes, monitoring

### Business Risks

**Risk:** Low business owner adoption
**Mitigation:** Easy onboarding, clear value proposition, low fees

**Risk:** Payment disputes/chargebacks
**Mitigation:** Clear ToS, platform model protects SteppersLife, Stripe handles disputes

**Risk:** Scalability issues
**Mitigation:** Each SaaS can scale independently, database can be sharded

---

## Next Steps

1. **Review this document** with your team
2. **Set up development environment** (monorepo structure)
3. **Configure NextAuth** for multi-domain sessions
4. **Implement database schema** (Prisma)
5. **Build authentication foundation** (roles & permissions)
6. **Start Phase 1** (Foundation)

---

## Appendix

### Key URLs

- Main Site: https://stepperslife.com
- Restaurants: https://restaurants.stepperslife.com
- Events: https://events.stepperslife.com
- Store: https://store.stepperslife.com
- Classes: https://classes.stepperslife.com
- Services: https://services.stepperslife.com
- Magazine: https://magazine.stepperslife.com

### Support Contacts

- NextAuth Docs: https://next-auth.js.org/
- Stripe Support: https://support.stripe.com
- PayPal Developer Support: https://developer.paypal.com/support

### Documentation References

- MinIO Docs: https://min.io/docs/
- Stripe Connect: https://stripe.com/docs/connect
- PayPal Commerce: https://developer.paypal.com/docs/commerce-platform
- Next.js App Router: https://nextjs.org/docs/app
- Prisma: https://www.prisma.io/docs

---

**Document End**

*This architecture is designed to be modular, scalable, and ready for future spin-offs while maintaining a unified brand experience.*