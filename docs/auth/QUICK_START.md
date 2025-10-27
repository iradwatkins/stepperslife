# NextAuth & Roles - Quick Start Guide

**Ready to use in 5 minutes** ⚡

---

## Step 1: Update Database Enum (Required)

Connect to PostgreSQL and run:

```bash
psql postgresql://stepperslife:securepass123@localhost:5432/stepperslife
```

```sql
-- Add missing role values
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STORE_OWNER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RESTAURANT_OWNER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'INSTRUCTOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SERVICE_PROVIDER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MAGAZINE_WRITER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STORE_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RESTAURANT_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RESTAURANT_STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EVENT_STAFF';
```

Exit: `\q`

---

## Step 2: Configure NextAuth

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
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { userRoles: true }
        });
        token.roles = dbUser?.userRoles.map(r => r.role) || ['USER'];
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
};
```

---

## Step 3: Add Environment Variables

Add to `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="postgresql://stepperslife:securepass123@localhost:5432/stepperslife"

# MinIO (File Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
```

---

## Step 4: Create Session Provider

**File:** `app/providers.tsx`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Update:** `app/layout.tsx`

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

## Step 5: Test Authentication

```bash
# Start dev server
npm run dev
```

Visit: http://localhost:3001/sign-in

1. Sign in or sign up
2. Check database for user record
3. Verify roles in session

---

## Usage in Your Code

### Server Component

```typescript
import { isCurrentUserAdmin, getCurrentUserRoles } from '@/lib/auth';

export default async function Page() {
  const roles = await getCurrentUserRoles();
  const isAdmin = await isCurrentUserAdmin();

  return <div>Your roles: {roles.join(', ')}</div>;
}
```

### Client Component

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function UserMenu() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];

  return <div>{roles.join(', ')}</div>;
}
```

### API Route

```typescript
import { getCurrentUserRoles, hasRole, UserRole } from '@/lib/auth';

export async function POST(req: Request) {
  const roles = await getCurrentUserRoles();

  if (!hasRole(roles, UserRole.ADMIN)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Admin logic here
}
```

---

## Common Tasks

### Assign Role

```typescript
import { assignRoleToUser, UserRole } from '@/lib/auth';

await assignRoleToUser(
  targetUserId,
  UserRole.RESTAURANT_OWNER,
  currentUserId,
  restaurantId
);
```

### Check Permission

```typescript
import { canAssignRole, getUserRoles, UserRole } from '@/lib/auth';

const myRoles = await getUserRoles(currentUserId);
const canAssign = canAssignRole(myRoles, UserRole.RESTAURANT_MANAGER);
```

### Validate Assignment

```typescript
import { validateRoleAssignment, getUserRoles, UserRole } from '@/lib/auth';

const assignerRoles = await getUserRoles(assignerId);
const targetRoles = await getUserRoles(targetId);

const validation = validateRoleAssignment(
  assignerRoles,
  targetRoles,
  UserRole.STORE_ADMIN,
  storeId
);

if (!validation.isValid) {
  console.error(validation.errors);
}
```

---

## Troubleshooting

### User has no roles

**Solution:** Run webhook or manually initialize:

```typescript
import { initializeNewUser } from '@/lib/auth';
await initializeNewUser(clerkUserId);
```

### Permission denied

**Check:**
1. User has correct role in Clerk metadata
2. Route is protected in middleware.ts
3. Permission function using correct role

### Middleware not working

**Verify:**
1. `middleware.ts` is at project root
2. Routes match in `config.matcher`
3. SessionProvider wraps app in layout.tsx

---

## Next: Build Features

You're ready to build! Import from `@/lib/auth` anywhere:

```typescript
import {
  UserRole,
  getCurrentUserRoles,
  hasRole,
  assignRoleToUser,
  canAssignRole,
  // ... and 30+ more utilities
} from '@/lib/auth';
```

Check `/lib/auth/index.ts` for all exports and examples.

---

**Questions?** See: `docs/auth/NEXTAUTH_IMPLEMENTATION.md`
