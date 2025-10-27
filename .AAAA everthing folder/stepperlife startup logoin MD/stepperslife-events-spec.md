# SteppersLife Events Platform (events.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** events.stepperslife.com  
**Purpose:** Event ticketing and management platform for Chicago Steppin events

---

## Overview

### What This Website Does

events.stepperslife.com is a **SaaS platform** where event organizers:
- Create and manage events
- Sell tickets with different tiers (VIP, General Admission, etc.)
- Check-in attendees (QR code scanning)
- Manage event staff and affiliates
- View ticket sales analytics
- Process refunds
- Send event updates to attendees

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
events.stepperslife.com (This SaaS)
  ↓ Stores all event/ticket data
  ↓
Provides API endpoints:
- GET /api/events (list all upcoming events)
- GET /api/events/:slug (get event details)
- POST /api/tickets/purchase (buy tickets)
- Webhooks to stepperslife.com when tickets sold/refunded
```

---

## Authentication & Login Flow

### NextAuth SSO (Same Instance)

```bash
# Environment Variables (SAME as main site)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9002
MINIO_ACCESS_KEY="events_minio"
MINIO_SECRET_KEY="events_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="events"
```

### User Roles on This Site

```
EVENT_ORGANIZER (Primary Role)
├─ Create/edit events
├─ Create ticket tiers
├─ View ticket sales
├─ Check-in attendees
├─ Manage event staff/affiliates
├─ Process refunds
├─ Send event updates
└─ Assign helper roles:
    ├─ EVENT_STAFF (check-in, customer service)
    └─ AFFILIATE (sell tickets, earn commission)

EVENT_STAFF (Assigned by Organizer)
├─ Check-in attendees
├─ View attendee list
├─ Handle on-site customer service
└─ Cannot: Edit event, view financial reports

AFFILIATE (Assigned by Organizer)
├─ Get unique ticket link
├─ Earn commission on ticket sales
├─ View their sales stats
└─ Cannot: Access event management
```

---

## Tech Stack

Same as restaurant platform:
- Next.js 15.0.3, React 18, TypeScript
- NextAuth (auth)
- PostgreSQL + Prisma
- Stripe/PayPal
- Tailwind + shadcn/ui

**Additional:**
- **QR Code generation** (qrcode library)
- **PDF generation** (for tickets - PDFKit)
- **Email service** (Resend - send tickets)

---

## Database Schema

```prisma
model Event {
  id            String   @id @default(cuid())
  
  // Organizer (from main site user database)
  organizerId   String
  organizerNextAuthId String
  
  // Event details
  title         String
  slug          String   @unique
  description   String
  shortDescription String?
  
  // Venue
  venueName     String
  venueAddress  Json     // {street, city, state, zip}
  venueCapacity Int?
  
  // Date/Time
  startDateTime DateTime
  endDateTime   DateTime
  timezone      String   @default("America/Chicago")
  
  // Images
  coverImageUrl String?
  imageGallery  String[] // Array of image URLs
  
  // Ticket sales
  ticketTiers   TicketTier[]
  sales         TicketSale[]
  
  // Settings
  salesStartDate DateTime?
  salesEndDate   DateTime?
  isPublished    Boolean  @default(false)
  isFeatured     Boolean  @default(false)
  
  // Payment processors enabled
  paymentProcessors PaymentProcessor[]
  
  // Stripe
  stripeAccountId String? // Organizer's Connected Account
  
  // PayPal
  paypalMerchantId String?
  
  // Platform fee
  platformFeePercent Decimal @default(7.5)
  platformFeeFixed   Decimal @default(0)
  
  // Staff
  staff         EventStaff[]
  affiliates    Affiliate[]
  
  // Status
  status        EventStatus @default(DRAFT)
  
  // Stats (cached)
  totalTicketsSold Int @default(0)
  totalRevenue     Decimal @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("events")
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ONGOING
  COMPLETED
  CANCELLED
}

model TicketTier {
  id            String   @id @default(cuid())
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // Tier details
  name          String   // "VIP", "General Admission", "Early Bird"
  description   String?
  price         Decimal
  
  // Inventory
  quantity      Int
  sold          Int      @default(0)
  available     Int      // Computed: quantity - sold
  
  // Sales window
  salesStart    DateTime?
  salesEnd      DateTime?
  
  // Settings
  minPerOrder   Int      @default(1)
  maxPerOrder   Int      @default(10)
  isActive      Boolean  @default(true)
  
  // Display
  displayOrder  Int      @default(0)
  
  // Relations
  tickets       Ticket[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([eventId])
  @@map("ticket_tiers")
}

model TicketSale {
  id            String   @id @default(cuid())
  
  // Event
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id])
  
  // Customer (from main site)
  customerId    String
  customerName  String
  customerEmail String
  customerPhone String?
  
  // Purchase details
  tickets       Ticket[]
  quantity      Int
  subtotal      Decimal
  fees          Decimal
  total         Decimal
  
  // Payment
  paymentProcessor  PaymentProcessor
  paymentIntentId   String?  @unique
  platformFee       Decimal
  organizerPayout   Decimal
  
  // Affiliate tracking
  affiliateId   String?
  affiliateCommission Decimal @default(0)
  
  // Status
  status        SaleStatus
  
  // Timestamps
  purchasedAt   DateTime @default(now())
  refundedAt    DateTime?
  
  @@index([eventId])
  @@index([customerId])
  @@index([affiliateId])
  @@map("ticket_sales")
}

enum SaleStatus {
  COMPLETED
  REFUNDED
  PARTIALLY_REFUNDED
}

model Ticket {
  id            String   @id @default(cuid())
  
  // Relations
  saleId        String
  sale          TicketSale @relation(fields: [saleId], references: [id])
  
  tierId        String
  tier          TicketTier @relation(fields: [tierId], references: [id])
  
  // Ticket details
  ticketNumber  String   @unique  // "SL-EVENT123-001"
  qrCode        String   @unique  // QR code data
  qrCodeUrl     String?  // URL to QR code image
  
  // Holder info
  holderName    String
  holderEmail   String?
  
  // Check-in
  checkedIn     Boolean  @default(false)
  checkedInAt   DateTime?
  checkedInBy   String?  // Staff member who checked in
  
  // Status
  status        TicketStatus
  
  createdAt     DateTime @default(now())
  
  @@index([saleId])
  @@index([tierId])
  @@index([qrCode])
  @@map("tickets")
}

enum TicketStatus {
  VALID
  CHECKED_IN
  REFUNDED
  TRANSFERRED
}

model EventStaff {
  id            String   @id @default(cuid())
  
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // Staff member (from main site)
  userId        String
  userNextAuthId   String
  userName      String
  userEmail     String
  
  // Role
  role          EventStaffRole
  
  // Permissions
  canCheckIn    Boolean  @default(true)
  canViewSales  Boolean  @default(false)
  canRefund     Boolean  @default(false)
  
  // Assignment
  assignedBy    String
  assignedAt    DateTime @default(now())
  
  active        Boolean  @default(true)
  
  @@unique([eventId, userId])
  @@index([eventId])
  @@map("event_staff")
}

enum EventStaffRole {
  MANAGER
  STAFF
}

model Affiliate {
  id            String   @id @default(cuid())
  
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // Affiliate (from main site)
  userId        String
  userNextAuthId   String
  userName      String
  userEmail     String
  
  // Unique link
  affiliateCode String   @unique  // "JOHNDOE"
  affiliateUrl  String   // "stepperslife.com/events/slug?ref=JOHNDOE"
  
  // Commission
  commissionPercent Decimal @default(10)  // 10% of ticket price
  
  // Stats
  ticketsSold   Int      @default(0)
  totalRevenue  Decimal  @default(0)
  totalCommission Decimal @default(0)
  
  // Status
  active        Boolean  @default(true)
  
  // Assignment
  assignedBy    String
  assignedAt    DateTime @default(now())
  
  @@unique([eventId, userId])
  @@index([eventId])
  @@index([affiliateCode])
  @@map("affiliates")
}
```

---

## APIs This Site Provides

### Public APIs (Consumed by Main Site)

```typescript
// GET /api/events - List upcoming events
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');
  const upcoming = searchParams.get('upcoming');
  
  const now = new Date();
  
  const events = await db.event.findMany({
    where: {
      status: 'PUBLISHED',
      ...(featured === 'true' && { isFeatured: true }),
      ...(upcoming === 'true' && { startDateTime: { gte: now } })
    },
    include: {
      ticketTiers: {
        where: { isActive: true },
        orderBy: { price: 'asc' }
      }
    },
    orderBy: { startDateTime: 'asc' }
  });
  
  return Response.json({ events });
}

// GET /api/events/:slug - Get event details
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    include: {
      ticketTiers: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
  
  if (!event || event.status !== 'PUBLISHED') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json({ event });
}

// POST /api/tickets/purchase - Buy tickets
export async function POST(req: Request) {
  const {
    eventId,
    customerId,
    customerName,
    customerEmail,
    tickets, // [{ tierId, quantity, holderNames }]
    paymentIntentId,
    paymentProcessor,
    affiliateCode
  } = await req.json();
  
  // Verify payment
  const paymentVerified = await verifyPayment(paymentIntentId, paymentProcessor);
  if (!paymentVerified) {
    return Response.json({ error: 'Payment not verified' }, { status: 400 });
  }
  
  // Check ticket availability
  for (const ticket of tickets) {
    const tier = await db.ticketTier.findUnique({
      where: { id: ticket.tierId }
    });
    
    if (!tier || tier.available < ticket.quantity) {
      return Response.json({ 
        error: `Not enough tickets available for ${tier?.name}` 
      }, { status: 400 });
    }
  }
  
  // Find affiliate if code provided
  let affiliate = null;
  if (affiliateCode) {
    affiliate = await db.affiliate.findUnique({
      where: { affiliateCode }
    });
  }
  
  // Calculate totals
  const subtotal = calculateTicketSubtotal(tickets);
  const fees = subtotal * 0.075; // 7.5% platform fee
  const total = subtotal + fees;
  const affiliateCommission = affiliate ? subtotal * (affiliate.commissionPercent / 100) : 0;
  
  // Create sale
  const sale = await db.ticketSale.create({
    data: {
      eventId,
      customerId,
      customerName,
      customerEmail,
      quantity: tickets.reduce((sum, t) => sum + t.quantity, 0),
      subtotal,
      fees,
      total,
      paymentProcessor,
      paymentIntentId,
      platformFee: fees,
      organizerPayout: subtotal - affiliateCommission,
      affiliateId: affiliate?.id,
      affiliateCommission,
      status: 'COMPLETED'
    }
  });
  
  // Create individual tickets with QR codes
  const createdTickets = [];
  let ticketCounter = 1;
  
  for (const ticketGroup of tickets) {
    for (let i = 0; i < ticketGroup.quantity; i++) {
      const ticketNumber = `SL-${eventId.slice(0, 8)}-${String(ticketCounter).padStart(4, '0')}`;
      const qrCode = generateQRCodeData({ saleId: sale.id, ticketNumber });
      
      const ticket = await db.ticket.create({
        data: {
          saleId: sale.id,
          tierId: ticketGroup.tierId,
          ticketNumber,
          qrCode,
          holderName: ticketGroup.holderNames?.[i] || customerName,
          holderEmail: customerEmail,
          status: 'VALID'
        }
      });
      
      createdTickets.push(ticket);
      ticketCounter++;
      
      // Update tier sold count
      await db.ticketTier.update({
        where: { id: ticketGroup.tierId },
        data: { sold: { increment: 1 } }
      });
    }
  }
  
  // Update affiliate stats
  if (affiliate) {
    await db.affiliate.update({
      where: { id: affiliate.id },
      data: {
        ticketsSold: { increment: sale.quantity },
        totalRevenue: { increment: subtotal },
        totalCommission: { increment: affiliateCommission }
      }
    });
  }
  
  // Send tickets via email
  await sendTicketEmail(customerEmail, createdTickets);
  
  // Webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/events', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(sale)
    },
    body: JSON.stringify({
      event: 'tickets.purchased',
      saleId: sale.id,
      eventId: sale.eventId,
      customerId: sale.customerId,
      quantity: sale.quantity
    })
  });
  
  return Response.json({ sale, tickets: createdTickets });
}

// POST /api/tickets/checkin - Check-in attendee
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { qrCode } = await req.json();
  
  // Find ticket
  const ticket = await db.ticket.findUnique({
    where: { qrCode },
    include: {
      tier: { include: { event: true } },
      sale: true
    }
  });
  
  if (!ticket) {
    return Response.json({ error: 'Invalid ticket' }, { status: 404 });
  }
  
  // Verify user has permission to check-in for this event
  const canCheckIn = await canCheckInEvent(userId, ticket.tier.eventId);
  if (!canCheckIn) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Check if already checked in
  if (ticket.checkedIn) {
    return Response.json({ 
      error: 'Already checked in',
      checkedInAt: ticket.checkedInAt 
    }, { status: 400 });
  }
  
  // Check in
  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: userId,
      status: 'CHECKED_IN'
    }
  });
  
  return Response.json({ 
    success: true,
    ticket: updated,
    attendee: {
      name: ticket.holderName,
      tierName: ticket.tier.name
    }
  });
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
│       ├── page.tsx             # Create event wizard
│       ├── tickets/page.tsx     # Set up ticket tiers
│       └── publish/page.tsx     # Review & publish
│
├── (dashboard)/
│   ├── page.tsx                 # Dashboard home
│   │
│   └── [eventId]/
│       ├── page.tsx             # Event overview
│       ├── tickets/
│       │   ├── page.tsx         # Ticket sales
│       │   └── tiers/page.tsx   # Manage tiers
│       ├── attendees/
│       │   ├── page.tsx         # Attendee list
│       │   └── checkin/page.tsx # Check-in interface (QR scanner)
│       ├── staff/
│       │   ├── page.tsx         # Manage staff
│       │   └── affiliates/page.tsx # Manage affiliates
│       ├── analytics/page.tsx   # Sales analytics
│       ├── settings/page.tsx    # Event settings
│       └── updates/page.tsx     # Send updates to attendees
│
└── api/
    ├── events/
    │   ├── route.ts             # List events
    │   └── [slug]/route.ts      # Get event
    ├── tickets/
    │   ├── purchase/route.ts    # Buy tickets
    │   ├── checkin/route.ts     # Check-in
    │   └── verify/route.ts      # Verify ticket
    ├── dashboard/
    │   ├── events/route.ts      # Get user's events
    │   ├── sales/route.ts       # Get sales data
    │   └── staff/route.ts       # Manage staff
    └── webhooks/
        ├── stripe/route.ts
        └── paypal/route.ts
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_events"
REDIS_URL="redis://localhost:6379/2"

# NextAuth (SAME)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9002
MINIO_ACCESS_KEY="events_minio"
MINIO_SECRET_KEY="events_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="events"

# Stripe/PayPal (SAME)
STRIPE_SECRET_KEY="sk_live_..."
PAYPAL_CLIENT_ID="..."

# Email (for sending tickets)
RESEND_API_KEY="re_..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/events"
WEBHOOK_SECRET="..."

# QR Code Storage
MINIO_BUCKET="stepperslife-events"

# App Config
NEXT_PUBLIC_APP_URL="https://events.stepperslife.com"
PORT=3003
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

## Key Features

### QR Code Generation

```typescript
import QRCode from 'qrcode';

async function generateTicketQR(ticket: Ticket) {
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    eventId: ticket.eventId,
    checksum: generateChecksum(ticket)
  });
  
  const qrCodeUrl = await QRCode.toDataURL(qrData);
  
  return qrCodeUrl;
}
```

### Ticket PDF Generation

```typescript
import PDFDocument from 'pdfkit';

async function generateTicketPDF(ticket: Ticket, event: Event) {
  const doc = new PDFDocument();
  
  // Add event info
  doc.fontSize(20).text(event.title);
  doc.fontSize(12).text(`${event.venueName}`);
  doc.text(`${formatDate(event.startDateTime)}`);
  
  // Add ticket info
  doc.text(`Ticket #: ${ticket.ticketNumber}`);
  doc.text(`Holder: ${ticket.holderName}`);
  
  // Add QR code
  const qrImage = await generateTicketQR(ticket);
  doc.image(qrImage, { width: 200 });
  
  return doc;
}
```

---

**End of Events Platform Specification**