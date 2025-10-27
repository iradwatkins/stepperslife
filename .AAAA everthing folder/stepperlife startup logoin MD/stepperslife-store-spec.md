# SteppersLife Store Marketplace (store.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** store.stepperslife.com  
**Purpose:** Multi-vendor e-commerce marketplace for Chicago Steppin products

---

## Overview

### What This Website Does

store.stepperslife.com is a **multi-vendor marketplace SaaS** where vendors:
- Create their online store
- List products (clothing, shoes, accessories)
- Manage inventory
- Process orders
- Ship products
- View sales analytics
- Manage store staff

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
store.stepperslife.com (This SaaS)
  ↓ Stores all product/order data
  ↓
Provides API endpoints:
- GET /api/products (list all products)
- GET /api/vendors/:slug (get vendor + products)
- POST /api/orders (create order)
- Webhooks for order status updates
```

---

## Authentication & Login Flow

### NextAuth SSO (Same Instance)

```bash
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9003
MINIO_ACCESS_KEY="store_minio"
MINIO_SECRET_KEY="store_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="store"
```

### User Roles on This Site

```
STORE_OWNER (Primary Role)
├─ Create/edit store
├─ List products
├─ Manage inventory
├─ Process orders
├─ View analytics
├─ Configure shipping
├─ Manage payments
└─ Assign helper role:
    └─ STORE_ADMIN (full store management access)

STORE_ADMIN (Assigned by Owner)
├─ Manage products
├─ Process orders
├─ Manage inventory
├─ View analytics
└─ Cannot: Delete store, change payment settings
```

---

## Tech Stack

Same core stack:
- Next.js 15, React 18, TypeScript
- NextAuth (auth)
- PostgreSQL + Prisma
- Stripe/PayPal
- Tailwind + shadcn/ui

**Additional:**
- **Image optimization** (Sharp)
- **Shipping calculation** (ShipEngine API or similar)

---

## Database Schema

```prisma
model Store {
  id            String   @id @default(cuid())
  
  // Owner (from main site)
  ownerId       String
  ownerNextAuthId  String
  
  // Store details
  name          String
  slug          String   @unique
  description   String?
  tagline       String?
  
  // Branding
  logoUrl       String?
  bannerUrl     String?
  
  // Contact
  email         String
  phone         String?
  
  // Shipping
  shipFrom      Json?    // {street, city, state, zip}
  shippingRates Json?    // Flat rate, free over X, etc.
  
  // Products
  products      Product[]
  
  // Orders
  orders        Order[]
  
  // Payment processors
  paymentProcessors PaymentProcessor[]
  
  // Stripe
  stripeAccountId String? @unique
  stripeChargesEnabled Boolean @default(false)
  
  // PayPal
  paypalMerchantId String? @unique
  
  // Platform fee
  platformFeePercent Decimal @default(7.0)
  
  // Staff
  staff         StoreStaff[]
  
  // Settings
  isActive      Boolean  @default(false)
  
  // Stats (cached)
  totalProducts Int      @default(0)
  totalSales    Decimal  @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("stores")
}

model Product {
  id            String   @id @default(cuid())
  storeId       String
  store         Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Product details
  name          String
  slug          String
  description   String
  
  // Pricing
  price         Decimal
  compareAtPrice Decimal? // Original price (for sale display)
  
  // Inventory
  sku           String?
  quantity      Int
  trackInventory Boolean @default(true)
  
  // Images
  images        String[] // Array of image URLs
  
  // Categorization
  category      String   // "Clothing", "Shoes", "Accessories"
  tags          String[] // ["steppin", "vintage", "sale"]
  
  // Variants (sizes, colors)
  variants      ProductVariant[]
  
  // Shipping
  weight        Decimal? // In pounds
  requiresShipping Boolean @default(true)
  
  // SEO
  metaTitle     String?
  metaDescription String?
  
  // Status
  status        ProductStatus
  
  // Relations
  orderItems    OrderItem[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId])
  @@index([category])
  @@index([status])
  @@map("products")
}

enum ProductStatus {
  DRAFT
  ACTIVE
  OUT_OF_STOCK
  ARCHIVED
}

model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Variant details
  name          String   // "Small / Red", "Large / Blue"
  sku           String?
  
  // Options
  options       Json     // {size: "Small", color: "Red"}
  
  // Pricing (if different from product)
  price         Decimal?
  
  // Inventory
  quantity      Int
  
  // Image (if different)
  imageUrl      String?
  
  available     Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([productId])
  @@map("product_variants")
}

model Order {
  id            String   @id @default(cuid())
  orderNumber   String   @unique  // "SL-ORD-12345"
  
  // Store
  storeId       String
  store         Store    @relation(fields: [storeId], references: [id])
  
  // Customer (from main site)
  customerId    String
  customerName  String
  customerEmail String
  customerPhone String?
  
  // Items
  items         OrderItem[]
  
  // Amounts
  subtotal      Decimal
  shipping      Decimal
  tax           Decimal
  discount      Decimal  @default(0)
  total         Decimal
  
  // Payment
  paymentProcessor PaymentProcessor
  paymentIntentId  String? @unique
  platformFee      Decimal
  vendorPayout     Decimal
  
  // Shipping address
  shippingAddress Json   // {name, street, city, state, zip, country}
  
  // Shipping details
  shippingMethod  String?
  trackingNumber  String?
  carrier         String?
  
  // Status
  status        OrderStatus
  fulfillmentStatus FulfillmentStatus
  
  // Notes
  customerNotes String?
  internalNotes String?
  
  // Timestamps
  placedAt      DateTime @default(now())
  paidAt        DateTime?
  shippedAt     DateTime?
  deliveredAt   DateTime?
  cancelledAt   DateTime?
  
  updatedAt     DateTime @updatedAt
  
  @@index([storeId])
  @@index([customerId])
  @@index([status])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  PAID
  CANCELLED
  REFUNDED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
  SHIPPED
  DELIVERED
}

model OrderItem {
  id            String   @id @default(cuid())
  
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  
  variantId     String?
  
  // Item details (snapshot at time of purchase)
  name          String
  sku           String?
  price         Decimal
  quantity      Int
  
  // Variant info (if applicable)
  variantName   String?
  
  // Image
  imageUrl      String?
  
  createdAt     DateTime @default(now())
  
  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model StoreStaff {
  id            String   @id @default(cuid())
  
  storeId       String
  store         Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Staff member (from main site)
  userId        String
  userNextAuthId   String
  userName      String
  userEmail     String
  
  // Role
  role          StoreStaffRole
  
  // Permissions
  canManageProducts  Boolean @default(true)
  canManageOrders    Boolean @default(true)
  canViewAnalytics   Boolean @default(true)
  canManageSettings  Boolean @default(false)
  
  assignedBy    String
  assignedAt    DateTime @default(now())
  
  active        Boolean  @default(true)
  
  @@unique([storeId, userId])
  @@index([storeId])
  @@map("store_staff")
}

enum StoreStaffRole {
  ADMIN
}

model Category {
  id            String   @id @default(cuid())
  name          String   @unique
  slug          String   @unique
  description   String?
  imageUrl      String?
  
  parentId      String?
  parent        Category? @relation("SubCategories", fields: [parentId], references: [id])
  children      Category[] @relation("SubCategories")
  
  createdAt     DateTime @default(now())
  
  @@map("categories")
}
```

---

## APIs This Site Provides

### Public APIs

```typescript
// GET /api/products - List all products
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const storeId = searchParams.get('storeId');
  const search = searchParams.get('search');
  
  const products = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(category && { category }),
      ...(storeId && { storeId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    },
    include: {
      store: {
        select: {
          name: true,
          slug: true,
          logoUrl: true
        }
      }
    },
    take: 50
  });
  
  return Response.json({ products });
}

// GET /api/vendors/:slug - Get vendor store
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        take: 20
      }
    }
  });
  
  if (!store || !store.isActive) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json({ store });
}

// POST /api/orders - Create order
export async function POST(req: Request) {
  const {
    storeId,
    customerId,
    customerName,
    customerEmail,
    items,
    shippingAddress,
    paymentIntentId,
    paymentProcessor
  } = await req.json();
  
  // Verify payment
  const paymentVerified = await verifyPayment(paymentIntentId, paymentProcessor);
  if (!paymentVerified) {
    return Response.json({ error: 'Payment not verified' }, { status: 400 });
  }
  
  // Check inventory
  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId }
    });
    
    if (!product || product.quantity < item.quantity) {
      return Response.json({ 
        error: `Insufficient inventory for ${product?.name}` 
      }, { status: 400 });
    }
  }
  
  // Calculate totals
  const subtotal = calculateSubtotal(items);
  const shipping = calculateShipping(items, shippingAddress);
  const tax = calculateTax(subtotal, shippingAddress);
  const total = subtotal + shipping + tax;
  
  // Create order
  const orderNumber = `SL-ORD-${Date.now()}`;
  
  const order = await db.order.create({
    data: {
      orderNumber,
      storeId,
      customerId,
      customerName,
      customerEmail,
      subtotal,
      shipping,
      tax,
      total,
      paymentProcessor,
      paymentIntentId,
      platformFee: total * 0.07,
      vendorPayout: total * 0.93,
      shippingAddress,
      status: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      items: {
        create: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        }))
      }
    },
    include: { items: true }
  });
  
  // Decrease inventory
  for (const item of items) {
    await db.product.update({
      where: { id: item.productId },
      data: { quantity: { decrement: item.quantity } }
    });
  }
  
  // Send email to customer
  await sendOrderConfirmationEmail(order);
  
  // Send email to vendor
  await sendNewOrderEmailToVendor(order);
  
  // Webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/store', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(order)
    },
    body: JSON.stringify({
      event: 'order.created',
      orderId: order.id,
      customerId: order.customerId,
      storeId: order.storeId
    })
  });
  
  return Response.json({ order });
}

// PATCH /api/orders/:id/fulfill - Mark order as shipped
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { trackingNumber, carrier } = await req.json();
  
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { store: true }
  });
  
  if (!order) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Verify ownership
  const canManage = await canManageStore(userId, order.storeId);
  if (!canManage) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Update order
  const updated = await db.order.update({
    where: { id: params.id },
    data: {
      fulfillmentStatus: 'SHIPPED',
      trackingNumber,
      carrier,
      shippedAt: new Date()
    }
  });
  
  // Send tracking email to customer
  await sendShippingConfirmationEmail(updated);
  
  // Webhook to main site
  await notifyCustomer(order.customerId, `Your order has shipped! Track: ${trackingNumber}`);
  
  return Response.json({ order: updated });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (Green theme)
├── page.tsx                      # Landing/marketing page
│
├── (onboarding)/
│   └── create/
│       ├── page.tsx             # Create store wizard
│       ├── products/page.tsx    # Add initial products
│       └── payment/page.tsx     # Payment setup
│
├── (dashboard)/
│   ├── page.tsx                 # Dashboard home
│   │
│   └── [storeId]/
│       ├── page.tsx             # Store overview
│       ├── products/
│       │   ├── page.tsx         # Product list
│       │   ├── create/page.tsx  # Add product
│       │   └── [productId]/page.tsx # Edit product
│       ├── orders/
│       │   ├── page.tsx         # Order list
│       │   └── [orderId]/page.tsx # Order details
│       ├── inventory/page.tsx   # Inventory management
│       ├── analytics/page.tsx   # Sales analytics
│       ├── staff/page.tsx       # Manage staff
│       ├── shipping/page.tsx    # Shipping settings
│       └── settings/page.tsx    # Store settings
│
└── api/
    ├── products/
    │   ├── route.ts             # List products
    │   └── [id]/route.ts        # Get product
    ├── vendors/
    │   └── [slug]/route.ts      # Get vendor
    ├── orders/
    │   ├── route.ts             # Create order
    │   └── [id]/
    │       ├── route.ts         # Get order
    │       └── fulfill/route.ts # Ship order
    ├── dashboard/
    │   ├── stores/route.ts      # Get user's stores
    │   ├── products/route.ts    # Manage products
    │   └── analytics/route.ts   # Get analytics
    └── webhooks/
        ├── stripe/route.ts
        └── paypal/route.ts
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_store"
REDIS_URL="redis://localhost:6379/3"

# NextAuth (SAME)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9003
MINIO_ACCESS_KEY="store_minio"
MINIO_SECRET_KEY="store_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="store"

# Stripe/PayPal (SAME)
STRIPE_SECRET_KEY="sk_live_..."
PAYPAL_CLIENT_ID="..."

# Shipping
SHIPENGINE_API_KEY="..."

# Email
RESEND_API_KEY="re_..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/store"
WEBHOOK_SECRET="..."

# Storage
MINIO_BUCKET="stepperslife-store"

# App Config
NEXT_PUBLIC_APP_URL="https://store.stepperslife.com"
PORT=3004
```

---

## Design System

```css
/* app/globals.css */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #10b981;  /* Green */
  --sidebar-primary: #10b981;
  --ring: #10b981;
}
```

---

**End of Store Marketplace Specification**