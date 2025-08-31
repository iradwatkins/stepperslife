"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export default function SyncUserWithConvex() {
  // Check if Clerk is disabled
  const skipClerk = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'false' || 
                    process.env.NODE_ENV === 'development';
  
  // Mock user for development when Clerk is disabled
  const mockUser = skipClerk ? {
    id: "dev_user_123",
    fullName: "Test User",
    emailAddresses: [{ emailAddress: "test@example.com" }]
  } : null;

  // Only import and use Clerk hooks if enabled
  let user: any = mockUser;
  let isSignedIn = skipClerk ? true : false;
  
  if (!skipClerk) {
    try {
      const { useUser } = require("@clerk/nextjs");
      const clerkData = useUser();
      user = clerkData.user;
      isSignedIn = clerkData.isSignedIn;
    } catch (e) {
      console.log("Clerk not available in development mode");
    }
  }
  const updateUser = useMutation(api.users.updateUser);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const syncUser = async () => {
      try {
        await updateUser({
          userId: user.id,
          name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [user, isSignedIn, updateUser]);

  return null;
}