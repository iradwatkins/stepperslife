# SteppersLife Main Portal (stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** stepperslife.com  
**Purpose:** Consumer-facing marketplace/aggregator for Chicago Steppin community

---

## Overview

### What This Website Does

SteppersLife.com is the **main consumer portal** where users:
- Browse and discover restaurants, events, stores, classes, services
- Place orders, buy tickets, enroll in classes
- Read magazine articles
- Manage their account and preferences
- Access their business dashboards (if they're business owners)

**Key Concept:** This site does NOT store business data (menus, events, products). It **pulls data from** the SaaS platforms via APIs and displays it in a unified experience.

---

## Authentication & Login Flow

### NextAuth SSO Configuration

**NextAuth Application:** SteppersLife Ecosystem (shared across all sites)

```bash
# Environment Variables
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false

# NextAuth Configuration Settings
Primary Domain: stepperslife.com
Cookie Domain: .stepperslife.com  # Enables SSO across subdomains
```

### Login Flow

```
User visits stepperslife.com (not logged in)
  ↓
Clicks "Sign In"
  ↓
NextAuth modal appears
  ↓
User enters email/password (or OAuth: Google, Facebook, Apple)
  ↓
NextAuth creates session + JWT token
  ↓
Cookie set at: .stepperslife.com
  ↓
User is now logged in
  ↓
Session valid across ALL subdomains:
- stepperslife.com ✓
- restaurants.stepperslife.com ✓
- events.stepperslife.com ✓
- etc. ✓
```

### How Login Works with Restaurant Site

```
Scenario: John is logged into stepperslife.com

1. John clicks "Manage My Restaurant"
   ↓
2. Redirect to: restaurants.stepperslife.com/dashboard
   ↓
3. NextAuth checks cookie at .stepperslife.com
   ↓
4. Cookie found! (same domain family)
   ↓
5. John is ALREADY logged in (no re-authentication needed)
   ↓
6. Restaurant site checks: "Does John have RESTAURANT_OWNER role?"
   ↓
7. If YES → Show dashboard
   If NO → Show "Create Restaurant" or redirect
```

**Critical:** All sites share the SAME NextAuth instance and session cookie. Login once = logged in everywhere.

---

## User Roles on Main Site

### Roles This Site Recognizes

```
USER (Everyone - Default)
├─ Can browse all content
├─ Can place orders
├─ Can buy tickets
├─ Can shop products
├─ Can enroll in classes
└─ Can read articles

BUSINESS_OWNER (Multiple Types)
├─ RESTAURANT_OWNER
│   └─ Can access restaurant management
├─ EVENT_ORGANIZER
│   └─ Can access event management
├─ STORE_OWNER
│   └─ Can access store management
├─ INSTRUCTOR
│   └─ Can access class management
├─ SERVICE_PROVIDER
│   └─ Can access service management
└─ MAGAZINE_WRITER
    └─ Can submit articles

ADMIN (Platform Administrator)
└─ Full access to all features
```

### Role Check Example

```typescript
// lib/auth/check-role.ts
import { auth } from 'next-auth';
import { db } from '@stepperslife/database';

export async function hasRole(role: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return false;
  
  const user = await db.user.findUnique({
    where: { userId },
    include: { roles: true }
  });
  
  return user?.roles.some(r => r.role === role && r.active) ?? false;
}

// Usage in page
export default async function MyBusinessesPage() {
  const isBusinessOwner = await hasRole('RESTAURANT_OWNER') || 
                          await hasRole('EVENT_ORGANIZER') ||
                          await hasRole('STORE_OWNER');
  
  if (!isBusinessOwner) {
    redirect('/start-business');
  }
  
  // Show business dashboard
}
```

---

## Tech Stack

### Framework
- **Next.js 15.0.3** (App Router)
- **React 18.3.1**
- **TypeScript 5.9.2**

### Authentication
- **NextAuth** (next-auth 6.11.0)

### Database
- **Shared Prisma Client** (@stepperslife/database package)
- Connects to PostgreSQL
- Does NOT directly access SaaS databases

### Styling
- **Tailwind CSS 3.4.17**
- **shadcn/ui** (Radix components)
- **Framer Motion** (animations)
- **Lucide React** (icons)

### State Management
- **Zustand** (client state)
- **TanStack Query** (server state, API caching)

### PWA
- **next-pwa** (Progressive Web App)
- **Firebase Cloud Messaging** (push notifications)

### Payments
- **Stripe** (customer checkout)
- **PayPal** (customer checkout)
- Integrated via shared @stepperslife/payments package

---

## API Architecture

### This Site Consumes APIs (Does Not Provide Them)

```
stepperslife.com
  ↓ (Makes API calls to)
  ↓
restaurants.stepperslife.com/api
events.stepperslife.com/api
store.stepperslife.com/api
classes.stepperslife.com/api
services.stepperslife.com/api
```

### API Client Structure

```typescript
// lib/api/restaurant-client.ts
export const restaurantAPI = {
  // Get all restaurants
  list: async () => {
    const res = await fetch('https://restaurants.stepperslife.com/api/restaurants');
    return res.json();
  },
  
  // Get single restaurant
  get: async (slug: string) => {
    const res = await fetch(`https://restaurants.stepperslife.com/api/restaurants/${slug}`);
    return res.json();
  },
  
  // Get menu for restaurant
  getMenu: async (slug: string) => {
    const res = await fetch(`https://restaurants.stepperslife.com/api/restaurants/${slug}/menu`);
    return res.json();
  },
  
  // Place order (creates order on restaurant site)
  createOrder: async (orderData: OrderData) => {
    const res = await fetch('https://restaurants.stepperslife.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return res.json();
  }
};
```

### Data Flow Example: Restaurant Order

```
1. Customer browses restaurants on stepperslife.com
   ↓
2. SteppersLife calls: GET restaurants.stepperslife.com/api/restaurants
   ↓
3. Restaurant API returns list of restaurants
   ↓
4. Customer views "Soul Food Spot" menu
   ↓
5. SteppersLife calls: GET restaurants.stepperslife.com/api/restaurants/soul-food-spot/menu
   ↓
6. Restaurant API returns menu items
   ↓
7. Customer adds items to cart, clicks checkout
   ↓
8. SteppersLife processes payment (Stripe/PayPal)
   ↓
9. After payment success, SteppersLife calls:
   POST restaurants.stepperslife.com/api/orders
   {
     restaurantId: "soul-food-spot",
     customerId: "customer_123",
     items: [...],
     paymentIntentId: "pi_...",
     total: 50.00
   }
   ↓
10. Restaurant API creates order in restaurant database
    ↓
11. Restaurant API sends webhook to SteppersLife:
    POST stepperslife.com/api/webhooks/restaurant-order
    {
      orderId: "order_456",
      status: "confirmed"
    }
    ↓
12. SteppersLife updates customer's order history
    ↓
13. Customer sees "Order Confirmed" on stepperslife.com
```

---

## Database Schema (Main Site Only)

### What This Site Stores

```prisma
// This site's database contains:

model User {
  id            String   @id @default(cuid())
  userId       String   @unique  // NextAuth user ID
  email         String   @unique
  name          String?
  phone         String?
  
  // Roles (links to business ownership)
  roles         UserRole[]
  
  // Customer data
  customerProfile CustomerProfile?
  
  // Push notifications
  pushSubscription Json?
  notificationSettings NotificationSettings?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model CustomerProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  
  // Preferences
  favoriteRestaurants String[]  // IDs of restaurants
  favoriteEvents      String[]  // IDs of events
  savedItems          String[]  // IDs of products
  
  // Addresses
  addresses     Json?    // Shipping/delivery addresses
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Order {
  id            String   @id @default(cuid())
  
  // Customer
  customerId    String
  
  // External reference (actual order on SaaS platform)
  platform      String   // 'restaurants', 'events', 'store', 'classes'
  externalId    String   // Order ID on external platform
  platformUrl   String?  // Deep link to order details
  
  // Basic info (cached from external platform)
  businessName  String
  total         Decimal
  status        String
  
  // Payment
  paymentProcessor PaymentProcessor
  paymentIntentId  String?
  
  // Metadata
  metadata      Json?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([customerId])
  @@index([platform, externalId])
}

model UserRole {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  role          Role
  
  // If role is tied to a specific business
  businessId    String?   // Reference to business on external platform
  businessType  String?   // 'restaurant', 'event', 'store', etc.
  
  assignedBy    String?
  assignedAt    DateTime @default(now())
  active        Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  
  @@unique([userId, role, businessId])
  @@index([userId])
}

enum Role {
  USER
  ADMIN
  RESTAURANT_OWNER
  EVENT_ORGANIZER
  STORE_OWNER
  INSTRUCTOR
  SERVICE_PROVIDER
  MAGAZINE_WRITER
  // Staff roles
  RESTAURANT_STAFF
  EVENT_STAFF
  STORE_ADMIN
  AFFILIATE
}

enum PaymentProcessor {
  STRIPE
  PAYPAL
}

model Notification {
  id            String   @id @default(cuid())
  userId        String
  
  type          String
  title         String
  body          String
  data          Json?
  
  read          Boolean  @default(false)
  sent          Boolean  @default(false)
  sentAt        DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([userId, read])
}
```

**Key Point:** This database does NOT store:
- Restaurant menus (stored in restaurant SaaS)
- Event details (stored in event SaaS)
- Product catalogs (stored in store SaaS)
- Class videos (stored in classes SaaS)

It only stores:
- User accounts & roles
- Customer preferences
- Order references (links to external orders)
- Notifications

---

## APIs This Site Provides

### Webhook Endpoints (Receive Updates from SaaS Platforms)

```typescript
// app/api/webhooks/restaurants/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  
  // Verify webhook signature (security)
  const signature = req.headers.get('x-webhook-signature');
  if (!verifyWebhookSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process webhook
  switch(body.event) {
    case 'order.ready':
      await notifyCustomer(body.orderId, 'Your order is ready!');
      break;
    case 'order.completed':
      await updateOrderStatus(body.orderId, 'completed');
      break;
  }
  
  return Response.json({ received: true });
}

// app/api/webhooks/events/route.ts
// Similar structure for event updates

// app/api/webhooks/store/route.ts
// Similar structure for store updates
```

### Internal APIs (For This Site Only)

```typescript
// app/api/customer/favorites/route.ts
export async function POST(req: Request) {
  const { userId } = auth();
  const { type, itemId } = await req.json();
  
  // Add to favorites
  await db.customerProfile.update({
    where: { userId },
    data: {
      favoriteRestaurants: type === 'restaurant' 
        ? { push: itemId } 
        : undefined
    }
  });
  
  return Response.json({ success: true });
}

// app/api/notifications/subscribe/route.ts
export async function POST(req: Request) {
  const { userId } = auth();
  const { subscription } = await req.json();
  
  // Store FCM subscription
  await db.user.update({
    where: { userId: userId },
    data: { pushSubscription: subscription }
  });
  
  return Response.json({ success: true });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (NextAuth, Theme, PWA)
├── page.tsx                      # Homepage
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── (customer)/                   # Customer-facing pages
│   ├── restaurants/
│   │   ├── page.tsx             # Browse restaurants
│   │   └── [slug]/
│   │       ├── page.tsx         # Restaurant detail + menu
│   │       └── order/page.tsx   # Checkout
│   ├── events/
│   │   ├── page.tsx             # Browse events
│   │   └── [slug]/
│   │       ├── page.tsx         # Event detail
│   │       └── tickets/page.tsx # Buy tickets
│   ├── store/
│   │   ├── page.tsx             # Browse products
│   │   ├── [vendor]/
│   │   │   └── page.tsx         # Vendor storefront
│   │   └── product/[id]/page.tsx # Product detail
│   ├── classes/
│   │   ├── page.tsx             # Browse classes
│   │   └── [slug]/page.tsx      # Class detail + enroll
│   ├── services/
│   │   ├── page.tsx             # Browse services
│   │   └── [slug]/page.tsx      # Service provider profile
│   └── magazine/
│       ├── page.tsx             # Article list
│       └── [slug]/page.tsx      # Article detail
│
├── (dashboard)/                  # Customer dashboard
│   ├── account/
│   │   ├── page.tsx             # Account settings
│   │   ├── orders/page.tsx      # Order history
│   │   ├── tickets/page.tsx     # Event tickets
│   │   └── favorites/page.tsx   # Saved items
│   └── my-businesses/
│       ├── page.tsx             # List of user's businesses
│       └── create/page.tsx      # Create new business wizard
│
├── (admin)/                      # Platform admin (ADMIN role only)
│   ├── layout.tsx               # Admin theme (orange)
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   ├── businesses/page.tsx
│   └── content/page.tsx
│
└── api/
    ├── webhooks/
    │   ├── stripe/route.ts
    │   ├── paypal/route.ts
    │   ├── restaurants/route.ts
    │   ├── events/route.ts
    │   └── store/route.ts
    ├── customer/
    │   └── favorites/route.ts
    └── notifications/
        └── subscribe/route.ts
```

---

## How Data Feeds Work

### Restaurant Data Flow

```
restaurants.stepperslife.com (SaaS Platform)
  ↓
Exposes API: /api/restaurants
  ↓
Returns:
{
  restaurants: [
    {
      id: "rest_123",
      slug: "soul-food-spot",
      name: "Soul Food Spot",
      cuisine: "Soul Food",
      logo: "https://...",
      rating: 4.8,
      pickupTime: "30-45 min",
      acceptingOrders: true
    },
    ...
  ]
}
  ↓
stepperslife.com fetches this data
  ↓
Displays on /restaurants page
```

### Event Data Flow

```
events.stepperslife.com (SaaS Platform)
  ↓
Exposes API: /api/events
  ↓
Returns:
{
  events: [
    {
      id: "event_456",
      slug: "steppin-saturday",
      title: "Steppin Saturday Night",
      date: "2025-10-15T20:00:00Z",
      venue: "Chicago Ballroom",
      ticketsAvailable: 150,
      price: 25.00,
      image: "https://..."
    },
    ...
  ]
}
  ↓
stepperslife.com fetches this data
  ↓
Displays on /events page
```

### Store Data Flow

```
store.stepperslife.com (SaaS Platform)
  ↓
Exposes API: /api/products
  ↓
Returns:
{
  products: [
    {
      id: "prod_789",
      vendor: "Steppin Apparel",
      name: "Chicago Steppin T-Shirt",
      price: 29.99,
      image: "https://...",
      inStock: true
    },
    ...
  ]
}
  ↓
stepperslife.com fetches this data
  ↓
Displays on /store page
```

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_main"
REDIS_URL="redis://localhost:6379"

# NextAuth (Shared with all sites)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_ID="..."

# Firebase (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
FIREBASE_SERVER_KEY="..."

# SaaS Platform URLs
NEXT_PUBLIC_RESTAURANTS_API="https://restaurants.stepperslife.com/api"
NEXT_PUBLIC_EVENTS_API="https://events.stepperslife.com/api"
NEXT_PUBLIC_STORE_API="https://store.stepperslife.com/api"
NEXT_PUBLIC_CLASSES_API="https://classes.stepperslife.com/api"
NEXT_PUBLIC_SERVICES_API="https://services.stepperslife.com/api"

# Internal Webhook Secrets (verify incoming webhooks)
RESTAURANTS_WEBHOOK_SECRET="..."
EVENTS_WEBHOOK_SECRET="..."
STORE_WEBHOOK_SECRET="..."

# App Config
NEXT_PUBLIC_APP_URL="https://stepperslife.com"
NODE_ENV="production"
PORT=3001
```

---

## Design System (Theme)

### Color Theme: BLUE (Customer Mode)

```css
/* app/globals.css */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #1e9df1;  /* Blue */
  --sidebar-primary: #1e9df1;
  --ring: #1da1f2;
}

.dark {
  --primary: #1c9cf0;
  --sidebar-primary: #1da1f2;
  --ring: #1da1f2;
}
```

### Admin Section Override: ORANGE

```tsx
// app/(admin)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ '--primary': '#f97316' } as React.CSSProperties} className="admin-portal">
      <nav className="bg-gradient-to-r from-orange-600 to-red-500">
        <Badge className="bg-orange-100 text-orange-900 animate-pulse">
          Admin Access
        </Badge>
      </nav>
      {children}
    </div>
  );
}
```

---

## PWA Configuration

```javascript
// next.config.mjs
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig({
  // Next.js config
});
```

```json
// public/manifest.json
{
  "name": "SteppersLife",
  "short_name": "SteppersLife",
  "description": "Chicago Steppin Community Hub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e9df1",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Build & Deployment

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run with PM2
pm2 start ecosystem.config.js --only stepperslife-main
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stepperslife-main',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/root/websites/stepperslife-ecosystem/apps/main',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

---

## Integration Checklist

Before launching:

**Authentication:**
- [ ] NextAuth configured for multi-domain
- [ ] SSO tested with restaurant site
- [ ] SSO tested with events site
- [ ] SSO tested with store site
- [ ] Role-based access working

**APIs:**
- [ ] Restaurant API integration complete
- [ ] Events API integration complete
- [ ] Store API integration complete
- [ ] Classes API integration complete
- [ ] Services API integration complete
- [ ] Webhook handlers tested

**Payments:**
- [ ] Stripe checkout working
- [ ] PayPal checkout working
- [ ] Payment success webhooks handled
- [ ] Order creation on SaaS platforms verified

**PWA:**
- [ ] Manifest.json configured
- [ ] Service worker registered
- [ ] "Add to Home Screen" working
- [ ] Push notifications working
- [ ] Offline mode functional

**Design:**
- [ ] Blue theme applied
- [ ] Admin section uses orange theme
- [ ] Dark mode working
- [ ] Responsive on mobile
- [ ] All components from shared UI package

---

## Next Steps

1. Set up monorepo (if not already done)
2. Create this app: `npx create-next-app@latest apps/main`
3. Install dependencies
4. Configure NextAuth
5. Set up Prisma database
6. Build API clients for SaaS platforms
7. Create page structure
8. Implement authentication flows
9. Test SSO with other sites
10. Deploy to production

---

**End of Main Portal Specification**