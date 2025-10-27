/**
 * SteppersLife Authentication & Authorization System
 *
 * Central export for all auth-related utilities
 */

// ============================================================================
// ROLES & TYPES
// ============================================================================

export {
  // Enums
  UserRole,
  RoleCategory,

  // Constants
  SELF_ASSIGNABLE_ROLES,
  ASSIGNED_ROLES,
  BUSINESS_OWNER_ROLES,
  PLATFORM_ROLES,
  BUSINESS_LIMITS,
  ROLE_ASSIGNMENT_RULES,
  ROLE_METADATA,
  VERIFICATION_REQUIREMENTS,

  // Types
  type RoleMetadata,
  type UserWithRoles,
  type RoleAssignmentRequest,
  type RoleRevocationRequest,
  type VerificationRequirement,
} from './roles';

// ============================================================================
// PERMISSIONS
// ============================================================================

export {
  // Role Checking
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isAdmin,
  isBusinessOwner,
  isSpecificBusinessOwner,
  getUserBusinessOwnerRoles,
  getUserAssignedRoles,

  // Permission Checking
  canAssignRole,
  getAssignableRoles,
  canRevokeRole,
  isSelfAssignable,
  requiresBusinessOwnership,

  // Business Limits
  getBusinessLimit,
  canCreateAnotherBusiness,
  getVerificationRequirements,

  // Route Protection
  canAccessAdminRoutes,
  canAccessBusinessManagement,
  canAccessBusinessTypeManagement,
  canManageBusiness,

  // Validation
  validateRoleAssignment,
  validateRoleRevocation,
  type RoleAssignmentValidation,

  // Helper Functions
  getRoleDisplayName,
  getRoleDescription,
  getRoleCategory,
  formatRolesForDisplay,
  groupRolesByCategory,
} from './permissions';

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Check if current user is admin
 *
 * ```typescript
 * import { isCurrentUserAdmin } from '@/lib/auth';
 *
 * const admin = await isCurrentUserAdmin();
 * if (!admin) {
 *   return redirect('/unauthorized');
 * }
 * ```
 */

/**
 * Example 2: Check user roles
 *
 * ```typescript
 * import { getCurrentUserRoles, hasRole, UserRole } from '@/lib/auth';
 *
 * const roles = await getCurrentUserRoles();
 * const isRestaurantOwner = hasRole(roles, UserRole.RESTAURANT_OWNER);
 * ```
 */

/**
 * Example 3: Assign role to user
 *
 * ```typescript
 * import { assignRoleToUser, UserRole } from '@/lib/auth';
 *
 * const result = await assignRoleToUser(
 *   targetUserId,
 *   UserRole.RESTAURANT_MANAGER,
 *   currentUserId,
 *   restaurantId
 * );
 *
 * if (!result.success) {
 *   console.error(result.error);
 * }
 * ```
 */

/**
 * Example 4: Validate role assignment before attempting
 *
 * ```typescript
 * import { validateRoleAssignment, getUserRoles, UserRole } from '@/lib/auth';
 *
 * const assignerRoles = await getUserRoles(assignerId);
 * const targetRoles = await getUserRoles(targetId);
 *
 * const validation = validateRoleAssignment(
 *   assignerRoles,
 *   targetRoles,
 *   UserRole.STORE_ADMIN,
 *   storeId
 * );
 *
 * if (!validation.isValid) {
 *   return { errors: validation.errors };
 * }
 * ```
 */

/**
 * Example 5: Check business creation limits
 *
 * ```typescript
 * import { getBusinessLimit, canCreateAnotherBusiness, UserRole } from '@/lib/auth';
 *
 * const currentRestaurantCount = await db.restaurant.count({
 *   where: { ownerId: userId }
 * });
 *
 * const canCreate = canCreateAnotherBusiness(
 *   UserRole.RESTAURANT_OWNER,
 *   currentRestaurantCount
 * );
 *
 * if (!canCreate) {
 *   const limit = getBusinessLimit(UserRole.RESTAURANT_OWNER);
 *   return { error: `Maximum ${limit} restaurants allowed` };
 * }
 * ```
 */

/**
 * Example 6: Initialize new user on signup
 *
 * ```typescript
 * import { initializeNewUser } from '@/lib/auth';
 *
 * // In Clerk webhook handler
 * if (eventType === 'user.created') {
 *   await initializeNewUser(user.id);
 * }
 * ```
 */

/**
 * Example 7: Group roles by category for display
 *
 * ```typescript
 * import { getCurrentUserRoles, groupRolesByCategory } from '@/lib/auth';
 *
 * const roles = await getCurrentUserRoles();
 * const grouped = groupRolesByCategory(roles);
 *
 * console.log('Business roles:', grouped.BUSINESS_OWNER);
 * console.log('Assigned roles:', grouped.ASSIGNED);
 * ```
 */
