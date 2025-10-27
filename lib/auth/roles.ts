/**
 * SteppersLife Role System
 *
 * Based on architecture specification from .AAAA everthing folder/stepperslife-architecture.md
 *
 * Role Hierarchy:
 * - ADMIN: Platform-wide access
 * - USER: Base role for all authenticated users
 * - Business Owner Roles: Self-assignable when creating businesses
 * - Assigned Roles: Only assignable by business owners
 */

// ============================================================================
// Core Role Enums
// ============================================================================

/**
 * All possible roles in the SteppersLife ecosystem
 */
export enum UserRole {
  // Platform Administrator
  ADMIN = 'ADMIN',

  // Base User (Everyone)
  USER = 'USER',

  // Business Owner Roles (Self-assignable via business creation)
  STORE_OWNER = 'STORE_OWNER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  EVENT_ORGANIZER = 'EVENT_ORGANIZER',
  INSTRUCTOR = 'INSTRUCTOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  MAGAZINE_WRITER = 'MAGAZINE_WRITER',

  // Assigned Roles (Only assignable by business owners)
  STORE_ADMIN = 'STORE_ADMIN',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
  EVENT_STAFF = 'EVENT_STAFF',
  AFFILIATE = 'AFFILIATE',
}

/**
 * Role categories for grouping and permission checking
 */
export enum RoleCategory {
  PLATFORM = 'PLATFORM',
  BASE = 'BASE',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ASSIGNED = 'ASSIGNED',
}

// ============================================================================
// Role Groupings
// ============================================================================

/**
 * Roles that can be self-assigned when creating a business
 */
export const SELF_ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.STORE_OWNER,
  UserRole.RESTAURANT_OWNER,
  UserRole.EVENT_ORGANIZER,
  UserRole.INSTRUCTOR,
  UserRole.SERVICE_PROVIDER,
  UserRole.MAGAZINE_WRITER,
];

/**
 * Roles that must be assigned by a business owner
 */
export const ASSIGNED_ROLES: UserRole[] = [
  UserRole.STORE_ADMIN,
  UserRole.RESTAURANT_MANAGER,
  UserRole.RESTAURANT_STAFF,
  UserRole.EVENT_STAFF,
  UserRole.AFFILIATE,
];

/**
 * All business owner roles
 */
export const BUSINESS_OWNER_ROLES: UserRole[] = [
  UserRole.STORE_OWNER,
  UserRole.RESTAURANT_OWNER,
  UserRole.EVENT_ORGANIZER,
  UserRole.INSTRUCTOR,
  UserRole.SERVICE_PROVIDER,
  UserRole.MAGAZINE_WRITER,
];

/**
 * Platform management roles
 */
export const PLATFORM_ROLES: UserRole[] = [
  UserRole.ADMIN,
];

// ============================================================================
// Business Limits (per architecture spec)
// ============================================================================

/**
 * Maximum number of businesses a user can own per type
 */
export const BUSINESS_LIMITS = {
  [UserRole.RESTAURANT_OWNER]: 3,
  [UserRole.STORE_OWNER]: 3,
  [UserRole.INSTRUCTOR]: 3,
  [UserRole.SERVICE_PROVIDER]: 3,
  [UserRole.EVENT_ORGANIZER]: 10, // Max 10 ongoing event series
} as const;

// ============================================================================
// Role Assignment Rules
// ============================================================================

/**
 * Defines which roles can assign which other roles
 */
export const ROLE_ASSIGNMENT_RULES: Record<UserRole, UserRole[]> = {
  // Admin can assign any role
  [UserRole.ADMIN]: Object.values(UserRole),

  // Base user cannot assign roles
  [UserRole.USER]: [],

  // Store owner can assign store staff
  [UserRole.STORE_OWNER]: [UserRole.STORE_ADMIN],

  // Restaurant owner can assign restaurant staff
  [UserRole.RESTAURANT_OWNER]: [
    UserRole.RESTAURANT_MANAGER,
    UserRole.RESTAURANT_STAFF,
  ],

  // Event organizer can assign event staff and affiliates
  [UserRole.EVENT_ORGANIZER]: [
    UserRole.EVENT_STAFF,
    UserRole.AFFILIATE,
  ],

  // Other business owner roles cannot assign staff
  [UserRole.INSTRUCTOR]: [],
  [UserRole.SERVICE_PROVIDER]: [],
  [UserRole.MAGAZINE_WRITER]: [],

  // Assigned roles cannot assign other roles
  [UserRole.STORE_ADMIN]: [],
  [UserRole.RESTAURANT_MANAGER]: [],
  [UserRole.RESTAURANT_STAFF]: [],
  [UserRole.EVENT_STAFF]: [],
  [UserRole.AFFILIATE]: [],
};

// ============================================================================
// Role Metadata
// ============================================================================

/**
 * Metadata for each role including description and category
 */
export interface RoleMetadata {
  role: UserRole;
  category: RoleCategory;
  displayName: string;
  description: string;
  isSelfAssignable: boolean;
  requiresBusinessOwnership: boolean;
}

/**
 * Complete role metadata mapping
 */
export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    category: RoleCategory.PLATFORM,
    displayName: 'Platform Administrator',
    description: 'Full access to entire SteppersLife platform',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },

  [UserRole.USER]: {
    role: UserRole.USER,
    category: RoleCategory.BASE,
    displayName: 'User',
    description: 'Base user with consumer access (browse, purchase, order)',
    isSelfAssignable: true, // Automatically assigned on signup
    requiresBusinessOwnership: false,
  },

  [UserRole.STORE_OWNER]: {
    role: UserRole.STORE_OWNER,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Store Owner',
    description: 'Owns and manages online store on SteppersLife marketplace',
    isSelfAssignable: true,
    requiresBusinessOwnership: true,
  },

  [UserRole.RESTAURANT_OWNER]: {
    role: UserRole.RESTAURANT_OWNER,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Restaurant Owner',
    description: 'Owns and manages restaurant with pickup order system',
    isSelfAssignable: true,
    requiresBusinessOwnership: true,
  },

  [UserRole.EVENT_ORGANIZER]: {
    role: UserRole.EVENT_ORGANIZER,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Event Organizer',
    description: 'Creates and manages events with ticket sales',
    isSelfAssignable: true,
    requiresBusinessOwnership: true,
  },

  [UserRole.INSTRUCTOR]: {
    role: UserRole.INSTRUCTOR,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Class Instructor',
    description: 'Creates and manages dance classes and video content',
    isSelfAssignable: true,
    requiresBusinessOwnership: true,
  },

  [UserRole.SERVICE_PROVIDER]: {
    role: UserRole.SERVICE_PROVIDER,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Service Provider',
    description: 'Lists and manages professional services',
    isSelfAssignable: true,
    requiresBusinessOwnership: true,
  },

  [UserRole.MAGAZINE_WRITER]: {
    role: UserRole.MAGAZINE_WRITER,
    category: RoleCategory.BUSINESS_OWNER,
    displayName: 'Magazine Writer',
    description: 'Submits articles for magazine (requires admin approval)',
    isSelfAssignable: true,
    requiresBusinessOwnership: false,
  },

  [UserRole.STORE_ADMIN]: {
    role: UserRole.STORE_ADMIN,
    category: RoleCategory.ASSIGNED,
    displayName: 'Store Administrator',
    description: 'Manages store on behalf of owner',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },

  [UserRole.RESTAURANT_MANAGER]: {
    role: UserRole.RESTAURANT_MANAGER,
    category: RoleCategory.ASSIGNED,
    displayName: 'Restaurant Manager',
    description: 'Manages restaurant operations and staff',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },

  [UserRole.RESTAURANT_STAFF]: {
    role: UserRole.RESTAURANT_STAFF,
    category: RoleCategory.ASSIGNED,
    displayName: 'Restaurant Staff',
    description: 'Assists with order processing and fulfillment',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },

  [UserRole.EVENT_STAFF]: {
    role: UserRole.EVENT_STAFF,
    category: RoleCategory.ASSIGNED,
    displayName: 'Event Staff',
    description: 'Assists with event management and operations',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },

  [UserRole.AFFILIATE]: {
    role: UserRole.AFFILIATE,
    category: RoleCategory.ASSIGNED,
    displayName: 'Event Affiliate',
    description: 'Sells event tickets and earns commissions',
    isSelfAssignable: false,
    requiresBusinessOwnership: false,
  },
};

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User with roles (used in Clerk metadata and database)
 */
export interface UserWithRoles {
  userId: string;
  email: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  targetUserId: string;
  role: UserRole;
  assignedBy: string;
  businessId?: string; // Optional: link to specific business
  reason?: string;
}

/**
 * Role revocation request
 */
export interface RoleRevocationRequest {
  targetUserId: string;
  role: UserRole;
  revokedBy: string;
  businessId?: string;
  reason?: string;
}

// ============================================================================
// Verification Thresholds (per architecture spec)
// ============================================================================

/**
 * Verification requirements increase with each business
 */
export interface VerificationRequirement {
  businessCount: number;
  requirements: string[];
}

export const VERIFICATION_REQUIREMENTS: VerificationRequirement[] = [
  {
    businessCount: 1,
    requirements: ['Email verification', 'Phone verification'],
  },
  {
    businessCount: 2,
    requirements: ['Email verification', 'Phone verification', 'Photo ID'],
  },
  {
    businessCount: 3,
    requirements: [
      'Email verification',
      'Phone verification',
      'Photo ID',
      'Additional documents',
      'Manual review',
    ],
  },
];
