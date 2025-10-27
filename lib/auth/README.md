# SteppersLife Authentication & Authorization System

> **NextAuth.js-powered authentication with 15-role RBAC system**

---

## Quick Import

```typescript
import {
  // Core
  UserRole,
  getCurrentUserRoles,
  hasRole,
  isCurrentUserAdmin,

  // Assignment
  assignRoleToUser,
  canAssignRole,

  // Business
  getBusinessLimit,
  canCreateAnotherBusiness,
} from '@/lib/auth';
```

---

## 📁 Module Structure

```
/lib/auth/
├── index.ts              ← Import from here (exports everything)
├── roles.ts              ← Role definitions & constants
├── permissions.ts        ← Permission checking functions
├── nextauth-helpers.ts   ← NextAuth API wrappers
└── README.md             ← You are here
```

---

## 🎭 Available Roles

### Platform
- **ADMIN** - Platform administrator

### Base
- **USER** - All authenticated users (auto-assigned)

### Business Owners (Self-assignable)
- **STORE_OWNER**
- **RESTAURANT_OWNER**
- **EVENT_ORGANIZER**
- **INSTRUCTOR**
- **SERVICE_PROVIDER**
- **MAGAZINE_WRITER**

### Assigned Roles
- **STORE_ADMIN**
- **RESTAURANT_MANAGER**
- **RESTAURANT_STAFF**
- **EVENT_STAFF**
- **AFFILIATE**

---

## 🔥 Most Used Functions

### Check Roles

```typescript
// Is current user admin?
const admin = await isCurrentUserAdmin();

// Get all roles
const roles = await getCurrentUserRoles();

// Check specific role
const isOwner = hasRole(roles, UserRole.RESTAURANT_OWNER);

// Check any of multiple roles
const hasAccess = hasAnyRole(roles, [
  UserRole.RESTAURANT_OWNER,
  UserRole.RESTAURANT_MANAGER
]);
```

### Assign Roles

```typescript
// Assign role to user
const result = await assignRoleToUser(
  targetUserId,
  UserRole.RESTAURANT_MANAGER,
  currentUserId,
  restaurantId
);

if (!result.success) {
  console.error(result.error);
}
```

### Validate Before Assign

```typescript
// Check if assignment is allowed
const validation = validateRoleAssignment(
  assignerRoles,
  targetRoles,
  UserRole.STORE_ADMIN,
  storeId
);

if (!validation.isValid) {
  return { errors: validation.errors };
}
```

### Check Permissions

```typescript
// Can user assign this role?
const canAssign = canAssignRole(myRoles, UserRole.EVENT_STAFF);

// What roles can user assign?
const assignable = getAssignableRoles(myRoles);
```

### Business Limits

```typescript
// Get max businesses allowed
const limit = getBusinessLimit(UserRole.RESTAURANT_OWNER); // 3

// Can create another?
const canCreate = canCreateAnotherBusiness(
  UserRole.RESTAURANT_OWNER,
  currentCount
);
```

---

## 📖 Full Documentation

- **Implementation Guide:** `/docs/auth/NEXTAUTH_IMPLEMENTATION.md`
- **Quick Start:** `/docs/auth/QUICK_START.md`
- **All Exports & Examples:** `/lib/auth/index.ts`

---

## 🚀 Example: Protect Server Component

```typescript
import { isCurrentUserAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const admin = await isCurrentUserAdmin();

  if (!admin) {
    redirect('/unauthorized');
  }

  return <div>Admin Dashboard</div>;
}
```

---

## 🚀 Example: Protect API Route

```typescript
import { getCurrentUserRoles, hasRole, UserRole } from '@/lib/auth';

export async function POST(req: Request) {
  const roles = await getCurrentUserRoles();

  if (!hasRole(roles, UserRole.ADMIN)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Admin logic
}
```

---

## 🚀 Example: Client Component

```typescript
'use client';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/auth';

export function UserMenu() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];

  const isAdmin = roles.includes(UserRole.ADMIN);

  return (
    <div>
      {isAdmin && <AdminButton />}
    </div>
  );
}
```

---

## 🔐 Role Assignment Rules

| Assigner Role           | Can Assign                        |
|-------------------------|-----------------------------------|
| ADMIN                   | Any role                          |
| STORE_OWNER             | STORE_ADMIN                       |
| RESTAURANT_OWNER        | RESTAURANT_MANAGER, RESTAURANT_STAFF |
| EVENT_ORGANIZER         | EVENT_STAFF, AFFILIATE            |

---

## 📊 Business Limits

| Role                    | Max Count |
|-------------------------|-----------|
| RESTAURANT_OWNER        | 3         |
| STORE_OWNER             | 3         |
| INSTRUCTOR              | 3         |
| SERVICE_PROVIDER        | 3         |
| EVENT_ORGANIZER         | 10        |

---

## 🛠️ Utilities Reference

### Role Checking
- `hasRole()`
- `hasAnyRole()`
- `hasAllRoles()`
- `isAdmin()`
- `isBusinessOwner()`
- `isSpecificBusinessOwner()`
- `getUserBusinessOwnerRoles()`
- `getUserAssignedRoles()`

### Permissions
- `canAssignRole()`
- `canRevokeRole()`
- `getAssignableRoles()`
- `isSelfAssignable()`
- `requiresBusinessOwnership()`
- `canAccessAdminRoutes()`
- `canAccessBusinessManagement()`
- `canAccessBusinessTypeManagement()`

### Validation
- `validateRoleAssignment()`
- `validateRoleRevocation()`

### Business
- `getBusinessLimit()`
- `canCreateAnotherBusiness()`
- `getVerificationRequirements()`

### NextAuth Helpers
- `getCurrentUserRoles()`
- `getUserRoles()`
- `currentUserHasRole()`
- `isCurrentUserAdmin()`
- `assignRoleToUser()`
- `revokeRoleFromUser()`
- `setUserRoles()`
- `initializeNewUser()`
- `incrementBusinessCount()`
- `associateBusinessWithUser()`
- `removeBusinessFromUser()`
- `getUserBusinesses()`

### Display
- `getRoleDisplayName()`
- `getRoleDescription()`
- `getRoleCategory()`
- `formatRolesForDisplay()`
- `groupRolesByCategory()`

---

**Built with:** NextAuth.js + Next.js 15 + TypeScript + Prisma + MinIO
**Status:** ✅ Production Ready
**Docs:** See `/docs/auth/`
