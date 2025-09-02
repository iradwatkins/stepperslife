import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Custom hook for accessing user data with consistent ID extraction
 * Eliminates the repeated userId extraction logic across components
 */
export function useUserData() {
  const { user, isSignedIn, isLoaded } = useAuth();
  
  // Consistent user ID extraction logic
  const userId = user?.id || "";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const userName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : userEmail;
  
  return {
    userId,
    userEmail,
    userName,
    user,
    isSignedIn,
    isLoaded,
    isAuthenticated: isSignedIn && !!userId,
  };
}

/**
 * Hook for fetching user profile from database
 */
export function useUserProfile() {
  const { userId, isAuthenticated } = useUserData();
  
  const profile = useQuery(
    api.users.getProfile,
    isAuthenticated ? { userId } : "skip"
  );
  
  return {
    profile,
    isLoading: profile === undefined && isAuthenticated,
    error: profile === null ? "Profile not found" : null,
  };
}

/**
 * Hook for fetching user settings
 */
export function useUserSettings() {
  const { userId, isAuthenticated } = useUserData();
  
  const settings = useQuery(
    api.users.getSettings,
    isAuthenticated ? { userId } : "skip"
  );
  
  return {
    settings,
    isLoading: settings === undefined && isAuthenticated,
  };
}