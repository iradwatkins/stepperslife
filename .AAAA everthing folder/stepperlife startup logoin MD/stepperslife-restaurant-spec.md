# SteppersLife Restaurant SaaS (restaurants.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** restaurants.stepperslife.com  
**Purpose:** Restaurant management platform for pickup orders

---

## Overview

### What This Website Does

restaurants.stepperslife.com is a **SaaS platform** where restaurant owners:
- Manage their restaurant profile
- Create and edit menus
- Receive and process pickup orders
- View analytics and reports
- Manage staff access
- Configure payment settings (Stripe/PayPal)

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
restaurants.stepperslife.com (This SaaS)
  ↓ Stores all restaurant data
  ↓
Provides API endpoints:
- GET /api/restaurants (list all restaurants)
- GET /api/restaurants/:slug (get restaurant + menu)
- POST /api/orders (create new order)
- Webhooks to stepperslife.com when order status changes
```

---

## Authentication & Login Flow

### NextAuth SSO (Same Instance as Main Site)

```bash
# Environment Variables (SAME as main site)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9001
MINIO_ACCESS_KEY="restaurants_minio"
MINIO_SECRET_KEY="restaurants_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="restaurants"

# NextAuth Configuration Settings
Cookie Domain: .stepperslife.com  # Shared session
```

### Login Flow from Main Site

```
User logged into stepperslife.com
  ↓
Clicks "Manage My Restaurant"
  ↓
Redirect to: restaurants.stepperslife.com/dashboard
  ↓
NextAuth checks session cookie (.stepperslife.com)
  ↓
Cookie exists → User ALREADY logged in (no prompt)
  ↓
Check: Does user have RESTAURANT_OWNER role?
  ↓
YES → Show dashboard
NO → Redirect to "Create Restaurant" page
```

### User Roles on This Site

```
RESTAURANT_OWNER (Primary Role)
├─ Create/edit restaurant profile
├─ Manage menu items
├─ Process orders
├─ View analytics
├─ Manage staff
├─ Configure payment settings
└─ Assign helper roles:
    ├─ RESTAURANT_MANAGER
    └─ RESTAURANT_STAFF

RESTAURANT_MANAGER (Assigned by Owner)
├─ Edit menu items
├─ Process orders
├─ View analytics
├─ Manage staff (limited)
└─ Cannot: Delete restaurant, change payment settings

RESTAURANT_STAFF (Assigned by Owner or Manager)
├─ View orders
├─ Mark orders ready/complete
└─ Cannot: Edit menu, view financial reports
```

### Role Check Middleware

```typescript
// lib/auth/require-role.ts
import { auth } from 'next-auth';
import { db } from '@stepperslife/database';
import { redirect } from 'next/navigation';

export async function requireRestaurantOwner(restaurantId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect('/sign-in');
  
  const user = await db.user.findUnique({
    where: { userId },
    include: { 
      ownedBusinesses: {
        where: { 
          id: restaurantId,
          type: 'RESTAURANT' 
        }
      }
    }
  });
  
  if (!user?.ownedBusinesses.length) {
    redirect('/unauthorized');
  }
  
  return user;
}
```

---

## Tech Stack

### Framework
- **Next.js 15.0.3** (App Router)
- **React 18.3.1**
- **TypeScript 5.9.2**

### Authentication
- **NextAuth** (next-auth 6.11.0) - Shared with main site

### Database
- **PostgreSQL** (dedicated database for restaurant data)
- **Prisma 6.15.0**
- **Redis** (caching, real-time order queue)

### Payments
- **Stripe Connect** (restaurant payouts)
- **PayPal Commerce** (restaurant payouts)

### Styling
- **Tailwind CSS 3.4.17**
- **shadcn/ui** (shared components)
- **Framer Motion** (animations)

### State Management
- **Zustand** (local state)
- **TanStack Query** (API caching)

### Real-time
- **Pusher** or **Socket.io** (real-time order notifications)

---

## Database Schema (This Site Only)

### Restaurant-Specific Tables

```prisma
// This database stores ALL restaurant data

model Restaurant {
  id            String   @id @default(cuid())
  
  // Owner (links to main site's user database)
  ownerId       String   // User ID from main database
  ownerNextAuthId  String   // NextAuth ID for quick lookup
  
  // Basic info
  name          String
  slug          String   @unique
  description   String?
  cuisine       String[]
  
  // Contact
  phone         String
  email         String
  address       Json     // {street, city, state, zip}
  
  // Branding
  logoUrl       String?
  coverImageUrl String?
  
  // Hours
  hours         Json?    // {monday: {open: "10:00", close: "22:00"}, ...}
  
  // Settings
  acceptingOrders      Boolean  @default(false)
  estimatedPickupTime  Int      @default(30) // minutes
  minimumOrder         Decimal? @default(0)
  
  // Payment (Stripe Connect)
  stripeAccountId      String?  @unique
  stripeChargesEnabled Boolean  @default(false)
  stripePayoutsEnabled Boolean  @default(false)
  
  // Payment (PayPal Commerce)
  paypalMerchantId     String?  @unique
  paypalEmailConfirmed Boolean  @default(false)
  
  // Which processors are enabled
  paymentProcessors    PaymentProcessor[]
  
  // Platform fee
  platformFeePercent   Decimal  @default(5.0)
  
  // Verification
  verification  RestaurantVerification?
  
  // Relations
  menuItems     MenuItem[]
  orders        Order[]
  staff         RestaurantStaff[]
  
  // Status
  status        RestaurantStatus @default(PENDING)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("restaurants")
}

enum RestaurantStatus {
  PENDING
  ACTIVE
  SUSPENDED
  CLOSED
}

enum PaymentProcessor {
  STRIPE
  PAYPAL
}

model MenuItem {
  id            String   @id @default(cuid())
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Item details
  name          String
  description   String?
  price         Decimal
  
  // Category
  category      String   // "Entrees", "Sides", "Desserts", "Drinks"
  
  // Image
  imageUrl      String?
  
  // Availability
  available     Boolean  @default(true)
  
  // Options/Modifiers
  options       Json?    // [{name: "Size", choices: ["Small", "Large"]}]
  
  // Ordering
  displayOrder  Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@map("menu_items")
}

model Order {
  id            String   @id @default(cuid())
  
  // Restaurant
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id])
  
  // Customer (from main site)
  customerId    String   // User ID from main database
  customerName  String
  customerPhone String
  customerEmail String?
  
  // Order details
  items         Json     // [{menuItemId, name, price, quantity, options}]
  subtotal      Decimal
  tax           Decimal
  total         Decimal
  
  // Payment
  paymentProcessor  PaymentProcessor
  paymentIntentId   String?  @unique
  platformFee       Decimal
  restaurantPayout  Decimal
  
  // Pickup
  pickupTime    DateTime
  specialInstructions String?
  
  // Status
  status        OrderStatus
  
  // Timestamps
  placedAt      DateTime @default(now())
  confirmedAt   DateTime?
  readyAt       DateTime?
  completedAt   DateTime?
  cancelledAt   DateTime?
  
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId, status])
  @@index([customerId])
  @@map("orders")
}

enum OrderStatus {
  PENDING      // Just placed
  CONFIRMED    // Restaurant confirmed
  PREPARING    // Restaurant is preparing
  READY        // Ready for pickup
  COMPLETED    // Customer picked up
  CANCELLED    // Cancelled
  NO_SHOW      // Customer didn't pick up
}

model RestaurantStaff {
  id            String   @id @default(cuid())
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Staff member (from main site user database)
  userId        String
  userNextAuthId   String
  userName      String
  userEmail     String
  
  // Role
  role          StaffRole
  
  // Permissions (for granular control)
  permissions   Json?    // {canEditMenu: true, canProcessOrders: true, canViewReports: false}
  
  // Assignment
  assignedBy    String
  assignedAt    DateTime @default(now())
  
  // Status
  active        Boolean  @default(true)
  revokedAt     DateTime?
  revokedBy     String?
  
  @@unique([restaurantId, userId])
  @@index([restaurantId])
  @@index([userId])
  @@map("restaurant_staff")
}

enum StaffRole {
  MANAGER
  STAFF
}

model RestaurantVerification {
  id            String   @id @default(cuid())
  restaurantId  String   @unique
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Verification status
  status        VerificationStatus @default(PENDING)
  
  // Documents
  healthPermitUrl     String?
  businessLicenseUrl  String?
  photoIdUrl          String?
  
  // Stripe Identity (automated)
  stripeVerified      Boolean @default(false)
  stripeSessionId     String?
  
  // Manual review
  reviewedBy    String?
  reviewedAt    DateTime?
  reviewNotes   String?
  
  submittedAt   DateTime?
  verifiedAt    DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("restaurant_verifications")
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
}
```

---

## APIs This Site Provides

### Public APIs (Consumed by Main Site)

```typescript
// app/api/restaurants/route.ts
// GET /api/restaurants - List all restaurants
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cuisine = searchParams.get('cuisine');
  const acceptingOrders = searchParams.get('acceptingOrders');
  
  const restaurants = await db.restaurant.findMany({
    where: {
      status: 'ACTIVE',
      ...(cuisine && { cuisine: { has: cuisine } }),
      ...(acceptingOrders === 'true' && { acceptingOrders: true })
    },
    select: {
      id: true,
      slug: true,
      name: true,
      cuisine: true,
      logoUrl: true,
      acceptingOrders: true,
      estimatedPickupTime: true,
      minimumOrder: true,
      // Don't expose sensitive data
    }
  });
  
  return Response.json({ restaurants });
}

// app/api/restaurants/[slug]/route.ts
// GET /api/restaurants/:slug - Get restaurant details
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const restaurant = await db.restaurant.findUnique({
    where: { slug: params.slug },
    include: {
      menuItems: {
        where: { available: true },
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
  
  if (!restaurant) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json({ restaurant });
}

// app/api/orders/route.ts
// POST /api/orders - Create new order
export async function POST(req: Request) {
  const {
    restaurantId,
    customerId,
    customerName,
    customerPhone,
    items,
    pickupTime,
    paymentIntentId,
    paymentProcessor
  } = await req.json();
  
  // Verify payment was successful
  const paymentVerified = await verifyPayment(paymentIntentId, paymentProcessor);
  if (!paymentVerified) {
    return Response.json({ error: 'Payment not verified' }, { status: 400 });
  }
  
  // Calculate totals
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  
  // Create order
  const order = await db.order.create({
    data: {
      restaurantId,
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      pickupTime,
      paymentProcessor,
      paymentIntentId,
      platformFee: total * 0.05, // 5%
      restaurantPayout: total * 0.95,
      status: 'PENDING'
    }
  });
  
  // Send webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/restaurants', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(order)
    },
    body: JSON.stringify({
      event: 'order.created',
      orderId: order.id,
      customerId: order.customerId,
      restaurantId: order.restaurantId
    })
  });
  
  // Send real-time notification to restaurant
  await notifyRestaurant(restaurantId, 'New order received!');
  
  return Response.json({ order });
}

// app/api/orders/[id]/status/route.ts
// PATCH /api/orders/:id/status - Update order status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { status } = await req.json();
  
  // Verify user has permission to update this order
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { restaurant: true }
  });
  
  if (!order) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Check if user owns this restaurant or is staff
  const canUpdate = await canManageRestaurant(userId, order.restaurantId);
  if (!canUpdate) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Update order
  const updated = await db.order.update({
    where: { id: params.id },
    data: {
      status,
      ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(status === 'READY' && { readyAt: new Date() }),
      ...(status === 'COMPLETED' && { completedAt: new Date() })
    }
  });
  
  // Send webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/restaurants', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(updated)
    },
    body: JSON.stringify({
      event: `order.${status.toLowerCase()}`,
      orderId: updated.id,
      customerId: updated.customerId,
      status: updated.status
    })
  });
  
  // Notify customer (via main site push notification)
  if (status === 'READY') {
    await notifyCustomer(updated.customerId, 'Your order is ready for pickup!');
  }
  
  return Response.json({ order: updated });
}
```

### Private APIs (Dashboard Only)

```typescript
// app/api/dashboard/restaurants/route.ts
// GET /api/dashboard/restaurants - Get user's restaurants
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get restaurants owned by this user
  const user = await db.user.findUnique({
    where: { userId },
    include: {
      ownedBusinesses: {
        where: { type: 'RESTAURANT' }
      }
    }
  });
  
  // Also get restaurants where user is staff
  const staffRestaurants = await db.restaurantStaff.findMany({
    where: { 
      userNextAuthId: userId,
      active: true
    },
    include: { restaurant: true }
  });
  
  return Response.json({
    owned: user?.ownedBusinesses || [],
    staff: staffRestaurants.map(s => s.restaurant)
  });
}

// app/api/dashboard/menu/route.ts
// POST /api/dashboard/menu - Create menu item
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { restaurantId, name, description, price, category, imageUrl } = await req.json();
  
  // Verify ownership
  const canManage = await canManageRestaurant(userId, restaurantId);
  if (!canManage) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const menuItem = await db.menuItem.create({
    data: {
      restaurantId,
      name,
      description,
      price,
      category,
      imageUrl
    }
  });
  
  return Response.json({ menuItem });
}

// app/api/dashboard/analytics/route.ts
// GET /api/dashboard/analytics - Get restaurant analytics
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get('restaurantId');
  
  if (!restaurantId) {
    return Response.json({ error: 'Missing restaurantId' }, { status: 400 });
  }
  
  // Verify ownership
  const canView = await canManageRestaurant(userId, restaurantId);
  if (!canView) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Get analytics
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [totalOrders, totalRevenue, avgOrderValue] = await Promise.all([
    db.order.count({
      where: {
        restaurantId,
        placedAt: { gte: thirtyDaysAgo }
      }
    }),
    db.order.aggregate({
      where: {
        restaurantId,
        status: 'COMPLETED',
        placedAt: { gte: thirtyDaysAgo }
      },
      _sum: { restaurantPayout: true }
    }),
    db.order.aggregate({
      where: {
        restaurantId,
        status: 'COMPLETED',
        placedAt: { gte: thirtyDaysAgo }
      },
      _avg: { total: true }
    })
  ]);
  
  return Response.json({
    period: '30 days',
    totalOrders,
    totalRevenue: totalRevenue._sum.restaurantPayout || 0,
    avgOrderValue: avgOrderValue._avg.total || 0
  });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (NextAuth, Green theme)
├── page.tsx                      # Landing page (for business owners)
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── (onboarding)/                 # New restaurant setup
│   └── create/
│       ├── page.tsx             # Step 1: Basic info
│       ├── menu/page.tsx        # Step 2: Initial menu
│       ├── payment/page.tsx     # Step 3: Stripe/PayPal
│       └── verification/page.tsx # Step 4: Documents
│
├── (dashboard)/                  # Restaurant management
│   ├── layout.tsx               # Dashboard layout
│   ├── page.tsx                 # Dashboard home (select restaurant)
│   │
│   └── [restaurantId]/
│       ├── layout.tsx           # Restaurant-specific layout
│       ├── page.tsx             # Overview/stats
│       ├── orders/
│       │   ├── page.tsx         # Order queue
│       │   └── [orderId]/page.tsx # Order details
│       ├── menu/
│       │   ├── page.tsx         # Menu management
│       │   ├── create/page.tsx  # Add menu item
│       │   └── [itemId]/page.tsx # Edit menu item
│       ├── analytics/page.tsx   # Reports & analytics
│       ├── staff/
│       │   ├── page.tsx         # Manage staff
│       │   └── invite/page.tsx  # Invite staff member
│       ├── settings/
│       │   ├── page.tsx         # General settings
│       │   ├── hours/page.tsx   # Operating hours
│       │   ├── payment/page.tsx # Payment settings
│       │   └── profile/page.tsx # Restaurant profile
│       └── verification/page.tsx # Verification status
│
└── api/
    ├── restaurants/
    │   ├── route.ts             # Public: List restaurants
    │   └── [slug]/
    │       ├── route.ts         # Public: Get restaurant
    │       └── menu/route.ts    # Public: Get menu
    ├── orders/
    │   ├── route.ts             # Public: Create order
    │   └── [id]/
    │       ├── route.ts         # Public: Get order
    │       └── status/route.ts  # Private: Update status
    ├── dashboard/
    │   ├── restaurants/route.ts # Get user's restaurants
    │   ├── menu/route.ts        # Manage menu items
    │   ├── staff/route.ts       # Manage staff
    │   └── analytics/route.ts   # Get analytics
    └── webhooks/
        ├── stripe/route.ts
        └── paypal/route.ts
```

---

## Environment Variables

```bash
# .env.local

# Database (Separate from main site)
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_restaurants"
REDIS_URL="redis://localhost:6379/1"

# NextAuth (SAME as main site)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9001
MINIO_ACCESS_KEY="restaurants_minio"
MINIO_SECRET_KEY="restaurants_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="restaurants"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/restaurants"
WEBHOOK_SECRET="..."

# Real-time
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."

# Storage (MinIO)
MINIO_ENDPOINT="..."
MINIO_ACCESS_KEY="..."
MINIO_SECRET_KEY="..."
MINIO_BUCKET="stepperslife-restaurants"

# App Config
NEXT_PUBLIC_APP_URL="https://restaurants.stepperslife.com"
NODE_ENV="production"
PORT=3010
```

---

## Design System (Theme)

### Color Theme: GREEN (Business Mode)

```css
/* app/globals.css */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #10b981;  /* Green */
  --sidebar-primary: #10b981;
  --ring: #10b981;
}

.dark {
  --primary: #34d399;
  --sidebar-primary: #34d399;
  --ring: #34d399;
}
```

---

## Integration Checklist

**Before Launch:**

- [ ] NextAuth SSO configured (shared with main site)
- [ ] Database schema implemented
- [ ] Stripe Connect onboarding flow
- [ ] PayPal Commerce integration
- [ ] Menu management working
- [ ] Order processing functional
- [ ] Real-time notifications setup
- [ ] Webhooks to main site tested
- [ ] Public APIs documented
- [ ] Staff management working
- [ ] Analytics dashboard complete
- [ ] Verification system ready
- [ ] Mobile-responsive design
- [ ] Production deployment ready

---

**End of Restaurant SaaS Specification**