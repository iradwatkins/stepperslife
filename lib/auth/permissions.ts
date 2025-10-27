/**
 * SteppersLife Permission System
 *
 * Utility functions for checking user roles and authorizing actions
 */

import {
  UserRole,
  RoleCategory,
  SELF_ASSIGNABLE_ROLES,
  ASSIGNED_ROLES,
  BUSINESS_OWNER_ROLES,
  ROLE_ASSIGNMENT_RULES,
  BUSINESS_LIMITS,
  ROLE_METADATA,
} from './roles';

// ============================================================================
// Role Checking Functions
// ============================================================================

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: UserRole[], role: UserRole): boolean {
  return userRoles.includes(role);
}

/**
 * Check if user has ANY of the specified roles
 */
export function hasAnyRole(userRoles: UserRole[], roles: UserRole[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}

/**
 * Check if user has ALL of the specified roles
 */
export function hasAllRoles(
  userRoles: UserRole[],
  roles: UserRole[]
): boolean {
  return roles.every((role) => userRoles.includes(role));
}

/**
 * Check if user is an admin
 */
export function isAdmin(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, UserRole.ADMIN);
}

/**
 * Check if user is a business owner (any type)
 */
export function isBusinessOwner(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, BUSINESS_OWNER_ROLES);
}

/**
 * Check if user has a specific business owner role
 */
export function isSpecificBusinessOwner(
  userRoles: UserRole[],
  businessType: UserRole
): boolean {
  if (!BUSINESS_OWNER_ROLES.includes(businessType)) {
    throw new Error(`${businessType} is not a business owner role`);
  }
  return hasRole(userRoles, businessType);
}

/**
 * Get all business owner roles the user has
 */
export function getUserBusinessOwnerRoles(
  userRoles: UserRole[]
): UserRole[] {
  return userRoles.filter((role) => BUSINESS_OWNER_ROLES.includes(role));
}

/**
 * Get all assigned roles the user has
 */
export function getUserAssignedRoles(userRoles: UserRole[]): UserRole[] {
  return userRoles.filter((role) => ASSIGNED_ROLES.includes(role));
}

// ============================================================================
// Permission Checking Functions
// ============================================================================

/**
 * Check if user can assign a specific role
 */
export function canAssignRole(
  assignerRoles: UserRole[],
  roleToAssign: UserRole
): boolean {
  // Admins can assign any role
  if (isAdmin(assignerRoles)) {
    return true;
  }

  // Check if any of the assigner's roles can assign this role
  return assignerRoles.some((assignerRole) => {
    const assignableRoles = ROLE_ASSIGNMENT_RULES[assignerRole] || [];
    return assignableRoles.includes(roleToAssign);
  });
}

/**
 * Get all roles a user can assign
 */
export function getAssignableRoles(userRoles: UserRole[]): UserRole[] {
  if (isAdmin(userRoles)) {
    return Object.values(UserRole);
  }

  const assignableRoles = new Set<UserRole>();

  userRoles.forEach((role) => {
    const rules = ROLE_ASSIGNMENT_RULES[role] || [];
    rules.forEach((r) => assignableRoles.add(r));
  });

  return Array.from(assignableRoles);
}

/**
 * Check if user can revoke a specific role
 * (Same rules as assignment)
 */
export function canRevokeRole(
  revokerRoles: UserRole[],
  roleToRevoke: UserRole
): boolean {
  return canAssignRole(revokerRoles, roleToRevoke);
}

/**
 * Check if a role can be self-assigned
 */
export function isSelfAssignable(role: UserRole): boolean {
  return SELF_ASSIGNABLE_ROLES.includes(role);
}

/**
 * Check if a role requires business ownership
 */
export function requiresBusinessOwnership(role: UserRole): boolean {
  const metadata = ROLE_METADATA[role];
  return metadata.requiresBusinessOwnership;
}

// ============================================================================
// Business Limit Functions
// ============================================================================

/**
 * Get the maximum number of businesses allowed for a role
 */
export function getBusinessLimit(role: UserRole): number {
  return BUSINESS_LIMITS[role as keyof typeof BUSINESS_LIMITS] || 0;
}

/**
 * Check if user can create another business of a specific type
 */
export function canCreateAnotherBusiness(
  role: UserRole,
  currentCount: number
): boolean {
  const limit = getBusinessLimit(role);
  if (limit === 0) {
    return false; // No limit set for this role
  }
  return currentCount < limit;
}

/**
 * Get verification requirements for business count
 */
export function getVerificationRequirements(
  businessCount: number
): string[] {
  if (businessCount === 0) {
    return ['Email verification', 'Phone verification'];
  }
  if (businessCount === 1) {
    return ['Email verification', 'Phone verification', 'Photo ID'];
  }
  return [
    'Email verification',
    'Phone verification',
    'Photo ID',
    'Additional documents',
    'Manual review',
  ];
}

// ============================================================================
// Route Protection Functions
// ============================================================================

/**
 * Check if user can access admin routes
 */
export function canAccessAdminRoutes(userRoles: UserRole[]): boolean {
  return isAdmin(userRoles);
}

/**
 * Check if user can access business management routes
 */
export function canAccessBusinessManagement(userRoles: UserRole[]): boolean {
  return isAdmin(userRoles) || isBusinessOwner(userRoles);
}

/**
 * Check if user can access specific business type management
 */
export function canAccessBusinessTypeManagement(
  userRoles: UserRole[],
  businessType: 'restaurant' | 'event' | 'store' | 'class' | 'service'
): boolean {
  if (isAdmin(userRoles)) {
    return true;
  }

  const roleMap: Record<string, UserRole> = {
    restaurant: UserRole.RESTAURANT_OWNER,
    event: UserRole.EVENT_ORGANIZER,
    store: UserRole.STORE_OWNER,
    class: UserRole.INSTRUCTOR,
    service: UserRole.SERVICE_PROVIDER,
  };

  const requiredRole = roleMap[businessType];
  return hasRole(userRoles, requiredRole);
}

/**
 * Check if user can manage a specific business (by businessId)
 * This would typically check database to verify ownership
 */
export async function canManageBusiness(
  _userId: string,
  _businessId: string,
  _businessType: UserRole
): Promise<boolean> {
  // TODO: Implement database check
  // This is a placeholder that would check:
  // 1. User owns the business
  // 2. User has required role
  // 3. Business exists and is active
  return true;
}

// ============================================================================
// Role Validation Functions
// ============================================================================

/**
 * Validate role assignment request
 */
export interface RoleAssignmentValidation {
  isValid: boolean;
  errors: string[];
}

export function validateRoleAssignment(
  assignerRoles: UserRole[],
  targetUserRoles: UserRole[],
  roleToAssign: UserRole,
  businessId?: string
): RoleAssignmentValidation {
  const errors: string[] = [];

  // Check if assigner can assign this role
  if (!canAssignRole(assignerRoles, roleToAssign)) {
    errors.push(
      `You do not have permission to assign the ${roleToAssign} role`
    );
  }

  // Check if target already has this role
  if (hasRole(targetUserRoles, roleToAssign)) {
    errors.push(`User already has the ${roleToAssign} role`);
  }

  // Check if role requires business ownership
  if (requiresBusinessOwnership(roleToAssign) && !businessId) {
    errors.push(
      `${roleToAssign} role requires association with a business`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate role revocation request
 */
export function validateRoleRevocation(
  revokerRoles: UserRole[],
  targetUserRoles: UserRole[],
  roleToRevoke: UserRole
): RoleAssignmentValidation {
  const errors: string[] = [];

  // Check if revoker can revoke this role
  if (!canRevokeRole(revokerRoles, roleToRevoke)) {
    errors.push(
      `You do not have permission to revoke the ${roleToRevoke} role`
    );
  }

  // Check if target has this role
  if (!hasRole(targetUserRoles, roleToRevoke)) {
    errors.push(`User does not have the ${roleToRevoke} role to revoke`);
  }

  // Cannot revoke USER role (everyone must have it)
  if (roleToRevoke === UserRole.USER) {
    errors.push('Cannot revoke the base USER role');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_METADATA[role]?.displayName || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_METADATA[role]?.description || '';
}

/**
 * Get role category
 */
export function getRoleCategory(role: UserRole): RoleCategory {
  return ROLE_METADATA[role]?.category || RoleCategory.BASE;
}

/**
 * Format roles for display
 */
export function formatRolesForDisplay(roles: UserRole[]): string[] {
  return roles.map(getRoleDisplayName);
}

/**
 * Group roles by category
 */
export function groupRolesByCategory(
  roles: UserRole[]
): Record<RoleCategory, UserRole[]> {
  const grouped: Record<RoleCategory, UserRole[]> = {
    [RoleCategory.PLATFORM]: [],
    [RoleCategory.BASE]: [],
    [RoleCategory.BUSINESS_OWNER]: [],
    [RoleCategory.ASSIGNED]: [],
  };

  roles.forEach((role) => {
    const category = getRoleCategory(role);
    grouped[category].push(role);
  });

  return grouped;
}
