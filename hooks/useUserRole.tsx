"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Admin emails that have platform-wide access
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export type UserRole = "customer" | "organizer" | "admin";

interface UserRoles {
  isAdmin: boolean;
  isOrganizer: boolean;
  isCustomer: boolean;
  roles: UserRole[];
  primaryRole: UserRole;
}

export function useUserRole(): UserRoles {
  const { user, isSignedIn } = useAuth();
  
  // Get user's events to determine if they're an organizer
  const userEvents = useQuery(
    api.events.getEventsByUser,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Determine roles
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);
  const isOrganizer = (userEvents && userEvents.length > 0) || false;
  const isCustomer = isSignedIn || false; // All signed-in users are customers
  
  // Build roles array
  const roles: UserRole[] = [];
  if (isCustomer) roles.push("customer");
  if (isOrganizer) roles.push("organizer");
  if (isAdmin) roles.push("admin");
  
  // Determine primary role (admin > organizer > customer)
  let primaryRole: UserRole = "customer";
  if (isAdmin) {
    primaryRole = "admin";
  } else if (isOrganizer) {
    primaryRole = "organizer";
  }
  
  return {
    isAdmin,
    isOrganizer,
    isCustomer,
    roles,
    primaryRole,
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