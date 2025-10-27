# SteppersLife Services Directory (services.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** services.stepperslife.com  
**Purpose:** Service provider directory for Chicago Steppin community (DJs, photographers, venues, etc.)

---

## Overview

### What This Website Does

services.stepperslife.com is a **directory platform** where service providers:
- Create business profiles
- List their services
- Showcase portfolios
- Collect reviews/ratings
- Respond to inquiries
- Get leads from customers

**Business Model:** Free listings OR $29/month premium

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
services.stepperslife.com (This Directory)
  ↓ Stores provider profiles, reviews
  ↓
Provides API endpoints:
- GET /api/services (list all providers)
- GET /api/services/:category (filter by category)
- POST /api/inquiries (customer inquiry)
- No payment processing (lead generation only)
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
MINIO_PORT=9006
MINIO_ACCESS_KEY="services_minio"
MINIO_SECRET_KEY="services_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="services"
```

### User Roles on This Site

```
SERVICE_PROVIDER (Primary Role)
├─ Create service profile
├─ List services offered
├─ Upload portfolio (photos/videos)
├─ Respond to inquiries
├─ Manage reviews
├─ View analytics (premium)
└─ No staff roles

CUSTOMER (User browsing)
├─ Search/filter providers
├─ View provider profiles
├─ Submit inquiries
├─ Leave reviews (if used service)
└─ Save favorites
```

---

## Tech Stack

Same core stack:
- Next.js 15, React 18, TypeScript
- NextAuth (auth)
- PostgreSQL + Prisma
- Tailwind + shadcn/ui

**Payment (Optional for Premium):**
- Stripe Subscriptions ($29/month)

**Additional:**
- Search/filtering (Algolia or PostgreSQL full-text search)
- Email for inquiry notifications (Resend)

---

## Database Schema

```prisma
model ServiceProvider {
  id            String   @id @default(cuid())
  
  // Provider (from main site)
  userId        String   @unique
  userNextAuthId   String   @unique
  
  // Business info
  businessName  String
  slug          String   @unique
  tagline       String?
  description   String
  
  // Owner contact
  ownerName     String
  email         String
  phone         String?
  website       String?
  
  // Business address
  address       Json?    // {street, city, state, zip}
  serviceArea   String[] // ["Chicago", "Suburbs"]
  
  // Categories
  category      ServiceCategory
  subCategories String[]
  
  // Services offered
  services      Service[]
  
  // Media
  logoUrl       String?
  coverImageUrl String?
  portfolioImages String[] // Gallery
  portfolioVideos String[]
  
  // Social
  instagramUrl  String?
  facebookUrl   String?
  youtubeUrl    String?
  
  // Pricing (optional display)
  startingPrice Decimal?
  priceRange    String?  // "$$" or "$500-$1000"
  
  // Reviews
  reviews       Review[]
  averageRating Decimal  @default(0)
  totalReviews  Int      @default(0)
  
  // Subscription (premium features)
  subscriptionTier SubscriptionTier @default(FREE)
  stripeSubscriptionId String?
  subscriptionStatus   String?  // active, canceled, past_due
  subscriptionEndsAt   DateTime?
  
  // Premium features
  isFeatured    Boolean  @default(false)
  isPriority    Boolean  @default(false)
  showContactInfo Boolean @default(false) // Premium: show email/phone
  
  // Inquiries
  inquiries     Inquiry[]
  
  // Status
  isApproved    Boolean  @default(false)
  isActive      Boolean  @default(true)
  
  // Stats
  totalInquiries Int     @default(0)
  profileViews   Int     @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("service_providers")
}

enum ServiceCategory {
  DJ
  PHOTOGRAPHER
  VIDEOGRAPHER
  VENUE
  CATERING
  DECORATION
  FLORIST
  HAIR_MAKEUP
  TRANSPORTATION
  ENTERTAINMENT
  OTHER
}

enum SubscriptionTier {
  FREE
  PREMIUM
}

model Service {
  id            String   @id @default(cuid())
  providerId    String
  provider      ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  
  // Service details
  name          String
  description   String
  
  // Pricing
  price         Decimal?
  priceType     String?  // "per_hour", "per_event", "starting_at"
  
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([providerId])
  @@map("services")
}

model Inquiry {
  id            String   @id @default(cuid())
  
  // Provider
  providerId    String
  provider      ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  
  // Customer (from main site)
  customerId    String?
  customerName  String
  customerEmail String
  customerPhone String?
  
  // Inquiry details
  eventDate     DateTime?
  eventType     String?  // "Wedding", "Birthday", "Corporate"
  message       String
  
  // Status
  status        InquiryStatus
  
  // Response
  response      String?
  respondedAt   DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([providerId])
  @@index([status])
  @@map("inquiries")
}

enum InquiryStatus {
  NEW
  VIEWED
  RESPONDED
  ARCHIVED
}

model Review {
  id            String   @id @default(cuid())
  
  providerId    String
  provider      ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  
  // Customer
  customerId    String
  customerName  String
  customerPhoto String?
  
  // Review
  rating        Int      // 1-5
  title         String?
  comment       String
  
  // Photos
  photos        String[]
  
  // Provider response
  response      String?
  respondedAt   DateTime?
  
  // Status
  isApproved    Boolean  @default(true)
  isFlagged     Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([providerId, customerId])
  @@index([providerId])
  @@map("reviews")
}
```

---

## APIs This Site Provides

### Public APIs

```typescript
// GET /api/services - List service providers
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const search = searchParams.get('search');
  
  const providers = await db.serviceProvider.findMany({
    where: {
      isActive: true,
      isApproved: true,
      ...(category && { category: category as ServiceCategory }),
      ...(location && { serviceArea: { has: location } }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      services: { where: { isActive: true } }
    },
    orderBy: [
      { isPriority: 'desc' },  // Premium listings first
      { averageRating: 'desc' }
    ],
    take: 50
  });
  
  return Response.json({ providers });
}

// GET /api/services/:slug - Get provider profile
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const provider = await db.serviceProvider.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { isActive: true } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!provider || !provider.isActive) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Increment profile views
  await db.serviceProvider.update({
    where: { id: provider.id },
    data: { profileViews: { increment: 1 } }
  });
  
  return Response.json({ provider });
}

// POST /api/inquiries - Submit inquiry
export async function POST(req: Request) {
  const {
    providerId,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    eventDate,
    eventType,
    message
  } = await req.json();
  
  const inquiry = await db.inquiry.create({
    data: {
      providerId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventType,
      message,
      status: 'NEW'
    }
  });
  
  // Update provider stats
  await db.serviceProvider.update({
    where: { id: providerId },
    data: { totalInquiries: { increment: 1 } }
  });
  
  // Get provider info
  const provider = await db.serviceProvider.findUnique({
    where: { id: providerId }
  });
  
  // Send email notification to provider
  await sendEmail(provider!.email, {
    subject: 'New Inquiry from SteppersLife',
    html: `
      <h2>New Inquiry</h2>
      <p><strong>From:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone || 'Not provided'}</p>
      <p><strong>Event Date:</strong> ${eventDate || 'Not specified'}</p>
      <p><strong>Event Type:</strong> ${eventType || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <a href="https://services.stepperslife.com/dashboard/inquiries/${inquiry.id}">
        View & Respond
      </a>
    `
  });
  
  // Confirmation email to customer
  await sendEmail(customerEmail, {
    subject: `Your inquiry to ${provider!.businessName}`,
    html: `
      <p>Hi ${customerName},</p>
      <p>Your inquiry has been sent to ${provider!.businessName}. They will respond shortly.</p>
      <p>We've sent a copy of your message to ${provider!.email}.</p>
    `
  });
  
  // Webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/services', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(inquiry)
    },
    body: JSON.stringify({
      event: 'inquiry.created',
      inquiryId: inquiry.id,
      providerId: inquiry.providerId,
      customerId: inquiry.customerId
    })
  });
  
  return Response.json({ 
    inquiry,
    message: 'Inquiry sent! The provider will contact you soon.'
  });
}

// POST /api/reviews - Submit review
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const {
    providerId,
    rating,
    title,
    comment,
    photos
  } = await req.json();
  
  // Get customer info
  const user = await db.user.findUnique({
    where: { userId }
  });
  
  // Check if already reviewed
  const existing = await db.review.findUnique({
    where: {
      providerId_customerId: {
        providerId,
        customerId: user!.id
      }
    }
  });
  
  if (existing) {
    return Response.json({ error: 'Already reviewed' }, { status: 400 });
  }
  
  // Create review
  const review = await db.review.create({
    data: {
      providerId,
      customerId: user!.id,
      customerName: user!.name || 'Anonymous',
      customerPhoto: user!.photoUrl,
      rating,
      title,
      comment,
      photos: photos || []
    }
  });
  
  // Update provider average rating
  const allReviews = await db.review.findMany({
    where: { 
      providerId,
      isApproved: true
    }
  });
  
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  
  await db.serviceProvider.update({
    where: { id: providerId },
    data: {
      averageRating: avgRating,
      totalReviews: allReviews.length
    }
  });
  
  return Response.json({ review });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (Green theme)
├── page.tsx                      # Landing/browse providers
│
├── (onboarding)/
│   └── create-profile/
│       ├── page.tsx             # Create provider profile
│       ├── services/page.tsx    # List services
│       └── portfolio/page.tsx   # Upload portfolio
│
├── (dashboard)/                  # Provider dashboard
│   ├── page.tsx                 # Dashboard home
│   │
│   └── provider/
│       ├── profile/page.tsx     # Edit profile
│       ├── services/page.tsx    # Manage services
│       ├── portfolio/page.tsx   # Manage portfolio
│       ├── inquiries/
│       │   ├── page.tsx         # Inquiry list
│       │   └── [id]/page.tsx    # Inquiry details
│       ├── reviews/page.tsx     # Reviews & ratings
│       ├── analytics/page.tsx   # Views, inquiries stats
│       └── subscription/page.tsx # Upgrade to premium
│
├── (browse)/
│   ├── category/[category]/page.tsx # Browse by category
│   └── [slug]/page.tsx          # Provider profile (public)
│
└── api/
    ├── services/
    │   ├── route.ts             # List providers
    │   └── [slug]/route.ts      # Get provider
    ├── inquiries/route.ts       # Submit inquiry
    ├── reviews/route.ts         # Submit review
    ├── dashboard/
    │   ├── profile/route.ts     # Manage profile
    │   ├── inquiries/route.ts   # Get inquiries
    │   └── analytics/route.ts   # Get stats
    └── webhooks/
        └── stripe/route.ts      # Subscription webhooks
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_services"
REDIS_URL="redis://localhost:6379/5"

# NextAuth (SAME)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9006
MINIO_ACCESS_KEY="services_minio"
MINIO_SECRET_KEY="services_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="services"

# Stripe (for subscriptions only)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/services"
WEBHOOK_SECRET="..."

# Storage
MINIO_BUCKET="stepperslife-services"

# App Config
NEXT_PUBLIC_APP_URL="https://services.stepperslife.com"
PORT=3006
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

## Premium Subscription

### Free vs Premium

**Free Tier:**
- Basic listing
- Up to 5 portfolio images
- Respond to inquiries
- No contact info shown (customers use inquiry form)

**Premium ($29/month):**
- Priority placement in search
- Unlimited portfolio images/videos
- Contact info displayed (email/phone)
- Featured badge
- Analytics dashboard
- Remove "Powered by SteppersLife" branding

### Stripe Subscription Setup

```typescript
// app/api/dashboard/subscription/create/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { providerId } = await req.json();
  
  // Get provider
  const provider = await db.serviceProvider.findFirst({
    where: {
      id: providerId,
      userNextAuthId: userId
    }
  });
  
  if (!provider) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Create Stripe customer if needed
  let customerId = provider.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: provider.email,
      metadata: {
        providerId: provider.id,
        userNextAuthId: userId
      }
    });
    customerId = customer.id;
    
    await db.serviceProvider.update({
      where: { id: provider.id },
      data: { stripeCustomerId: customerId }
    });
  }
  
  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: process.env.STRIPE_PREMIUM_PRICE_ID! // $29/month
    }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });
  
  // Update provider
  await db.serviceProvider.update({
    where: { id: provider.id },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionTier: 'PREMIUM'
    }
  });
  
  return Response.json({
    subscriptionId: subscription.id,
    clientSecret: subscription.latest_invoice.payment_intent.client_secret
  });
}
```

---

**End of Services Directory Specification**