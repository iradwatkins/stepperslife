# SteppersLife Subdomain Development Guidelines

**Last Updated:** 2025-10-09
**Purpose:** Standard prompt for all subdomain development
**Audience:** Developers, AI agents, and team members working on any SteppersLife subdomain

---

## 🎯 Core Architecture Principles

### 1. You Are Building a Microservice
Each subdomain (restaurants, events, store, classes, magazine, services) is a **completely isolated microservice**:
- Own database
- Own MinIO (file storage)
- Own business logic
- Own API endpoints
- BUT shares authentication with main site

### 2. Main Site is an Aggregator
`stepperslife.com` is NOT your database:
- It pulls data from YOUR API
- It displays YOUR content
- It routes transactions TO you
- It does NOT store your business data

### 3. Your Subdomain Must Be Self-Contained
If someone wanted to buy/license just YOUR subdomain:
- They should be able to run it standalone
- All data is in YOUR database
- All files are in YOUR MinIO
- All logic is in YOUR codebase

---

## 🏗️ Required Architecture

### Tech Stack (Non-Negotiable)
```
Framework: Next.js 15 (App Router)
Language: TypeScript
Authentication: NextAuth.js (shared config)
Database: PostgreSQL with Prisma ORM
File Storage: MinIO (S3-compatible)
Styling: TailwindCSS
Process Manager: PM2
```

### Port Assignments
| Subdomain | App Port | MinIO Port | Database Name |
|-----------|----------|------------|---------------|
| restaurants.stepperslife.com | 3010 | 9001 | stepperslife_restaurants |
| events.stepperslife.com | 3004 | 9002 | stepperslife_events |
| store.stepperslife.com | 3008 | 9003 | stepperslife_store |
| classes.stepperslife.com | 3009 | 9004 | stepperslife_classes |
| magazine.stepperslife.com | 3007 | 9005 | stepperslife_magazine |
| services.stepperslife.com | 3011 | 9006 | stepperslife_services |

---

## 📝 Environment Variables Template

Every subdomain MUST have this `.env.local` structure:

```env
# ============================================
# APP CONFIGURATION
# ============================================
PORT=XXXX  # See port assignments table above
NODE_ENV=development

# ============================================
# NEXTAUTH (SHARED - Same for ALL subdomains)
# ============================================
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-shared-secret-key"

# Optional OAuth Providers (SHARED)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# ============================================
# DATABASE (ISOLATED - Unique to this subdomain)
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_SUBDOMAIN"
# Replace SUBDOMAIN with: restaurants, events, store, classes, magazine, or services

# ============================================
# MINIO FILE STORAGE (ISOLATED - Unique to this subdomain)
# ============================================
MINIO_ENDPOINT="localhost"
MINIO_PORT=XXXX  # See port assignments table above
MINIO_ACCESS_KEY="SUBDOMAIN_minio"  # e.g., "restaurants_minio"
MINIO_SECRET_KEY="SUBDOMAIN_secret"  # e.g., "restaurants_secret"
MINIO_BUCKET_NAME="SUBDOMAIN"  # e.g., "restaurants"
MINIO_USE_SSL=false

# ============================================
# STRIPE (ISOLATED - Each subdomain has own connected account)
# ============================================
STRIPE_SECRET_KEY="sk_live_SUBDOMAIN_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_SUBDOMAIN_..."
STRIPE_WEBHOOK_SECRET="whsec_SUBDOMAIN_..."
STRIPE_CONNECT_CLIENT_ID="ca_SUBDOMAIN_..."

# ============================================
# PAYPAL (ISOLATED - Optional, each subdomain has own)
# ============================================
PAYPAL_CLIENT_ID="SUBDOMAIN_..."
PAYPAL_CLIENT_SECRET="SUBDOMAIN_..."
PAYPAL_WEBHOOK_ID="SUBDOMAIN_..."
```

---

## 🔐 Authentication Setup

### NextAuth Configuration (REQUIRED)

**File:** `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**File:** `lib/auth/config.ts`
```typescript
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // Fetch roles from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { userRoles: true }
        });
        session.user.roles = dbUser?.userRoles.map(r => r.role) || [];
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: '.stepperslife.com',  // CRITICAL: Enables SSO
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
```

**File:** `app/providers.tsx`
```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**File:** `app/layout.tsx`
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🗄️ Database Schema Requirements

### User-Related Tables (Required)
Every subdomain MUST have these tables for NextAuth:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  userRoles     UserRoles[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model UserRoles {
  id         String   @id @default(cuid())
  userId     String
  role       UserRole
  isActive   Boolean  @default(true)
  isPrimary  Boolean  @default(false)
  grantedBy  String?
  grantedAt  DateTime @default(now())
  expiresAt  DateTime?
  metadata   Json?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role])
}

enum UserRole {
  USER
  ADMIN
  STAFF
  AFFILIATE
  EVENT_ORGANIZER
  STORE_OWNER
  RESTAURANT_OWNER
  INSTRUCTOR
  SERVICE_PROVIDER
  MAGAZINE_WRITER
  STORE_ADMIN
  RESTAURANT_MANAGER
  RESTAURANT_STAFF
  EVENT_STAFF
}
```

### Business Tables (Your Domain)
Add your subdomain-specific tables:
- Restaurants: Restaurant, MenuItem, Order, etc.
- Events: Event, Ticket, Venue, etc.
- Store: Product, Vendor, Cart, etc.
- Classes: Course, Lesson, Enrollment, etc.
- Magazine: Article, Author, Category, etc.
- Services: ServiceProvider, ServiceListing, etc.

---

## 📦 MinIO Setup

### Install MinIO Client
```bash
# Install mc (MinIO Client)
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

### Initialize Your MinIO Bucket
```bash
# Example for restaurants subdomain
mc alias set myrestaurants http://localhost:9001 restaurants_minio restaurants_secret
mc mb myrestaurants/restaurants
mc anonymous set download myrestaurants/restaurants
```

### MinIO SDK Usage
```typescript
// lib/minio.ts
import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export const bucketName = process.env.MINIO_BUCKET_NAME!;
```

### Upload Example
```typescript
import { minioClient, bucketName } from '@/lib/minio';

export async function uploadFile(file: File, fileName: string) {
  const buffer = await file.arrayBuffer();

  await minioClient.putObject(
    bucketName,
    fileName,
    Buffer.from(buffer),
    file.size,
    {
      'Content-Type': file.type,
    }
  );

  const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
  return url;
}
```

---

## 🌐 API Endpoints (Required)

Every subdomain MUST expose these endpoints for the main site:

### Public API (for main site aggregation)
```typescript
// app/api/public/list/route.ts
// Returns list of items for main site to display
export async function GET(req: Request) {
  // Return paginated list of your content
  // Example: restaurants, events, products, courses, articles, services
}

// app/api/public/[slug]/route.ts
// Returns single item details
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  // Return detailed view of single item
}
```

### Transaction API (for main site to create orders/bookings)
```typescript
// app/api/transactions/create/route.ts
// Main site posts transactions to you
export async function POST(req: Request) {
  // Handle order, booking, enrollment, etc.
  // Store in YOUR database
  // Return confirmation
}
```

### Webhook API (notify main site of status changes)
```typescript
// Send webhooks to main site when status changes
const webhookUrl = 'https://stepperslife.com/api/webhooks/SUBDOMAIN';
// POST updates when order status changes, etc.
```

---

## 🎨 UI/UX Guidelines

### Dashboard Structure
```
/dashboard - Overview for business owners
  /profile - Edit business profile
  /manage - Manage items (menu, products, courses, etc.)
  /orders - View orders/bookings (if applicable)
  /analytics - View reports
  /settings - Configure settings
  /team - Manage staff (if applicable)
```

### Role-Based Access
```typescript
// Server Component Example
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  const roles = session.user.roles || [];
  const hasAccess = roles.some(role =>
    ['RESTAURANT_OWNER', 'RESTAURANT_MANAGER', 'ADMIN'].includes(role)
  );

  if (!hasAccess) {
    redirect('/unauthorized');
  }

  return <div>Dashboard</div>;
}
```

```typescript
// Client Component Example
'use client';

import { useSession } from 'next-auth/react';

export function OwnerOnlyButton() {
  const { data: session } = useSession();
  const isOwner = session?.user?.roles?.includes('RESTAURANT_OWNER');

  if (!isOwner) return null;

  return <button>Owner Only Action</button>;
}
```

---

## 📋 Required npm Packages

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^4.24.0",
    "@auth/prisma-adapter": "^2.11.0",
    "@prisma/client": "^6.17.0",
    "minio": "^8.0.0",
    "stripe": "^14.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.9.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "prisma": "^6.17.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0"
  }
}
```

---

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone/create your subdomain project
cd /root/websites/stepperslife-SUBDOMAIN

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Setup MinIO bucket (see MinIO Setup section)

# Start development server
npm run dev
```

### 2. Database Migrations
```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Apply to production
npx prisma migrate deploy
```

### 3. Testing SSO
```bash
# Start main site (must be running for SSO to work)
cd /root/websites/stepperslife
pm2 start ecosystem.config.js

# Login at stepperslife.com
# Navigate to your subdomain
# Should be automatically logged in (no re-login)
```

### 4. Deployment with PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stepperslife-SUBDOMAIN',
    script: 'npm',
    args: 'start',
    cwd: '/root/websites/stepperslife-SUBDOMAIN',
    env: {
      NODE_ENV: 'production',
      PORT: 'XXXX' // Your assigned port
    }
  }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Pre-Launch Checklist

### Environment
- [ ] `.env.local` configured with all required variables
- [ ] NextAuth URL set to `https://stepperslife.com`
- [ ] NextAuth secret matches main site
- [ ] Database created and migrated
- [ ] MinIO instance running on assigned port
- [ ] MinIO bucket created and accessible

### NextAuth SSO
- [ ] NextAuth API route exists (`app/api/auth/[...nextauth]/route.ts`)
- [ ] Session cookie domain set to `.stepperslife.com`
- [ ] SessionProvider wraps app in layout
- [ ] Can log in from main site and access subdomain

### Database
- [ ] User/Account/Session tables created (Prisma schema)
- [ ] UserRoles table with all role enums
- [ ] Business-specific tables created
- [ ] Database migrations tested
- [ ] Seed data loaded (optional)

### MinIO
- [ ] MinIO instance running on correct port
- [ ] Bucket created with subdomain name
- [ ] Upload functionality tested
- [ ] Images accessible via URL

### API Endpoints
- [ ] Public list endpoint (`/api/public/list`)
- [ ] Public detail endpoint (`/api/public/[slug]`)
- [ ] Transaction endpoint (`/api/transactions/create`)
- [ ] Tested from main site

### Role-Based Access
- [ ] Dashboard requires authentication
- [ ] Owner role can access management features
- [ ] Staff roles have appropriate permissions
- [ ] Unauthorized users redirected

### Integration with Main Site
- [ ] Main site can fetch your data via API
- [ ] Main site can display your content
- [ ] Main site can create transactions
- [ ] Webhooks send updates to main site

---

## 🆘 Common Issues & Solutions

### Issue: "User not authenticated on subdomain"
**Solution:** Check NextAuth cookie domain is `.stepperslife.com` (with leading dot)

### Issue: "MinIO connection refused"
**Solution:** Verify MinIO is running on correct port: `curl http://localhost:900X`

### Issue: "Database connection failed"
**Solution:** Verify database name in `DATABASE_URL` matches your assigned database

### Issue: "Session lost when switching subdomains"
**Solution:** Ensure all subdomains use EXACT same `NEXTAUTH_SECRET`

### Issue: "Role not found"
**Solution:** Check `UserRole` enum in Prisma schema includes your required roles

---

## 📚 Reference Documentation

- [Main Architecture](../docs/MICROSERVICES_ARCHITECTURE.md)
- [Complete Implementation Guide](../docs/MICROSERVICES_COMPLETE.md)
- [NextAuth Setup](../docs/auth/NEXTAUTH_IMPLEMENTATION.md)
- [Migration Summary](../MIGRATION_SUMMARY.md)

### External Resources
- [NextAuth.js Docs](https://next-auth.js.org/)
- [MinIO SDK Docs](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

---

## 🎯 Success Criteria

Your subdomain is ready when:

✅ User can log in on main site and access your subdomain without re-login
✅ Your data is stored in YOUR database (not main site's)
✅ File uploads go to YOUR MinIO bucket
✅ Main site can fetch and display your content via API
✅ Main site can create transactions in your system
✅ Business owners can manage their content via your dashboard
✅ Role-based permissions work correctly
✅ Your subdomain could be detached and run standalone

---

## 💬 Getting Help

If you're stuck:
1. Check the reference documentation above
2. Verify environment variables match this template
3. Test SSO by logging into main site first
4. Check PM2 logs: `pm2 logs stepperslife-SUBDOMAIN`
5. Verify database connection: `psql -d stepperslife_SUBDOMAIN`
6. Test MinIO: `mc ls mysubdomain/bucket-name`

---

**Remember:** You're building a microservice, not a feature. Your subdomain should be completely self-contained and isolated from all other services (except authentication).

**Last Updated:** 2025-10-09
**Version:** 1.0
