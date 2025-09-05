"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Admin emails that have platform-wide access
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export type UserRole = "customer" | "organizer" | "admin" | "staff" | "affiliate";

interface UserRoles {
  isAdmin: boolean;
  isOrganizer: boolean;
  isCustomer: boolean;
  isStaff: boolean;
  isAffiliate: boolean;
  roles: UserRole[];
  primaryRole: UserRole;
  // Additional details for staff/affiliate roles
  staffEvents?: any[];
  affiliatePrograms?: any[];
}

export function useUserRole(): UserRoles {
  const { user, isSignedIn } = useUser();
  
  // Get user's events to determine if they're an organizer
  const userEvents = useQuery(
    api.events.getEventsByUser,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get user's staff roles
  const staffEvents = useQuery(
    api.eventStaff.getUserStaffEvents,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get user's affiliate programs
  const affiliatePrograms = useQuery(
    api.affiliates.getUserAffiliatePrograms,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Determine roles
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);
  const isOrganizer = (userEvents && userEvents.length > 0) || false;
  const isStaff = (staffEvents && staffEvents.length > 0) || false;
  const isAffiliate = (affiliatePrograms && affiliatePrograms.length > 0) || false;
  const isCustomer = isSignedIn || false; // All signed-in users are customers
  
  // Build roles array
  const roles: UserRole[] = [];
  if (isCustomer) roles.push("customer");
  if (isOrganizer) roles.push("organizer");
  if (isStaff) roles.push("staff");
  if (isAffiliate) roles.push("affiliate");
  if (isAdmin) roles.push("admin");
  
  // Determine primary role (admin > organizer > staff > affiliate > customer)
  let primaryRole: UserRole = "customer";
  if (isAdmin) {
    primaryRole = "admin";
  } else if (isOrganizer) {
    primaryRole = "organizer";
  } else if (isStaff) {
    primaryRole = "staff";
  } else if (isAffiliate) {
    primaryRole = "affiliate";
  }
  
  return {
    isAdmin,
    isOrganizer,
    isCustomer,
    isStaff,
    isAffiliate,
    roles,
    primaryRole,
    staffEvents,
    affiliatePrograms,
  };
}

// Hook to check if user has access to a specific role
export function useHasRole(role: UserRole): boolean {
  const { roles } = useUserRole();
  return roles.includes(role);
}

// Hook to get the appropriate dashboard URL based on user's primary role
export function useRoleDashboard(): string {
  const { primaryRole } = useUserRole();
  
  switch (primaryRole) {
    case "admin":
      return "/admin";
    case "organizer":
      return "/organizer";
    case "customer":
    default:
      return "/profile";
  }
}