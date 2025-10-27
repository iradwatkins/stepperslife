# SteppersLife Subdomain - Quick Start Prompt

> **Copy/paste this to AI assistants or share with developers working on ANY SteppersLife subdomain**

---

## 🎯 What You're Building

A **completely isolated microservice** for SteppersLife ecosystem:
- Own database: `stepperslife_SUBDOMAIN`
- Own MinIO: Port `900X`, bucket `SUBDOMAIN`
- Own API endpoints
- BUT shares NextAuth SSO with main site

---

## 📋 Your Assignment

| Subdomain | App Port | DB Name | MinIO Port | Bucket |
|-----------|----------|---------|------------|--------|
| restaurants.stepperslife.com | 3010 | stepperslife_restaurants | 9001 | restaurants |
| events.stepperslife.com | 3004 | stepperslife_events | 9002 | events |
| store.stepperslife.com | 3008 | stepperslife_store | 9003 | store |
| classes.stepperslife.com | 3009 | stepperslife_classes | 9004 | classes |
| magazine.stepperslife.com | 3007 | stepperslife_magazine | 9005 | magazine |
| services.stepperslife.com | 3011 | stepperslife_services | 9006 | services |

---

## 🔧 Required Stack

```
Next.js 15 + TypeScript
NextAuth.js (shared SSO)
PostgreSQL + Prisma
MinIO (file storage)
TailwindCSS
PM2
```

---

## 📝 Environment Variables (.env.local)

```env
# App
PORT=XXXX  # Your assigned port from table above

# NextAuth (SHARED - same for ALL subdomains)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-shared-secret-key"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Database (ISOLATED - unique to your subdomain)
DATABASE_URL="postgresql://user:pass@localhost:5432/stepperslife_SUBDOMAIN"

# MinIO (ISOLATED - unique to your subdomain)
MINIO_ENDPOINT="localhost"
MINIO_PORT=XXXX  # Your assigned MinIO port
MINIO_ACCESS_KEY="SUBDOMAIN_minio"
MINIO_SECRET_KEY="SUBDOMAIN_secret"
MINIO_BUCKET_NAME="SUBDOMAIN"
MINIO_USE_SSL=false

# Stripe (ISOLATED)
STRIPE_SECRET_KEY="sk_live_SUBDOMAIN_..."
```

---

## 🔐 NextAuth Setup (Critical for SSO)

**1. API Route:** `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**2. Config:** `lib/auth/config.ts`
```typescript
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [/* OAuth providers */],
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: '.stepperslife.com',  // CRITICAL!
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
```

**3. Provider:** `app/providers.tsx`
```typescript
'use client';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**4. Layout:** `app/layout.tsx`
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🗄️ Required Database Tables

```prisma
// NextAuth tables (required)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  accounts      Account[]
  sessions      Session[]
  userRoles     UserRoles[]
}

model Account { /* NextAuth */ }
model Session { /* NextAuth */ }
model VerificationToken { /* NextAuth */ }

model UserRoles {
  id        String   @id @default(cuid())
  userId    String
  role      UserRole
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, role])
}

enum UserRole {
  USER
  ADMIN
  RESTAURANT_OWNER
  RESTAURANT_MANAGER
  RESTAURANT_STAFF
  EVENT_ORGANIZER
  EVENT_STAFF
  STORE_OWNER
  INSTRUCTOR
  SERVICE_PROVIDER
  MAGAZINE_WRITER
  AFFILIATE
}

// Add your business tables here
// e.g., Restaurant, Event, Product, Course, Article, Service
```

---

## 🌐 Required API Endpoints

### For Main Site to Consume
```typescript
// GET /api/public/list - List items for main site
// GET /api/public/[slug] - Get single item details
// POST /api/transactions/create - Create order/booking
```

---

## 🎨 Role-Based Access Examples

### Server Component
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');

  const hasAccess = session.user.roles.includes('RESTAURANT_OWNER');
  if (!hasAccess) redirect('/unauthorized');

  return <div>Dashboard</div>;
}
```

### Client Component
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function OwnerButton() {
  const { data: session } = useSession();
  const isOwner = session?.user?.roles?.includes('RESTAURANT_OWNER');
  if (!isOwner) return null;
  return <button>Owner Action</button>;
}
```

---

## 📦 MinIO File Upload

```typescript
// lib/minio.ts
import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function uploadFile(file: File, fileName: string) {
  const buffer = await file.arrayBuffer();
  const bucketName = process.env.MINIO_BUCKET_NAME!;

  await minioClient.putObject(
    bucketName,
    fileName,
    Buffer.from(buffer),
    file.size
  );

  return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
}
```

---

## ✅ Critical Rules

### ✅ DO
- Store ALL your data in YOUR database
- Upload ALL files to YOUR MinIO bucket
- Use NextAuth with cookie domain `.stepperslife.com`
- Expose API endpoints for main site to consume
- Protect routes with role-based access
- Make your subdomain runnable standalone

### ❌ DON'T
- Store business data in main site's database
- Use main site's MinIO
- Use Clerk.com (we use NextAuth)
- Use Supabase (we use PostgreSQL)
- Use Vercel-specific features
- Share database with other subdomains

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install next@15 next-auth @auth/prisma-adapter @prisma/client minio

# Setup Prisma
npx prisma init
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

---

## 🎯 Test SSO

1. Start main site: `pm2 start stepperslife-main`
2. Login at `stepperslife.com`
3. Navigate to your subdomain
4. Should be **automatically logged in** (no re-login)

If not working, check:
- Cookie domain is `.stepperslife.com` (with leading dot)
- `NEXTAUTH_SECRET` matches across all apps
- `NEXTAUTH_URL` is `https://stepperslife.com`

---

## 📚 Full Documentation

For complete details, see:
- [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
- [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)
- [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md)

---

## 💡 Key Concept

You're building a **microservice**, not a feature:
- Main site is just an aggregator
- Your subdomain owns its domain data
- Should be sellable/licensable as standalone SaaS
- Only shares authentication (NextAuth SSO)

**Everything else is isolated: database, files, business logic, APIs.**

---

**Ready to build? Follow this guide exactly and you'll have a properly isolated microservice that integrates seamlessly with the SteppersLife ecosystem!**
