"use server";

import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function getSquareSellerAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const convex = getConvexClient();
  
  try {
    // Get user from database
    const user = await convex.query(api.users.getUserById, { userId });
    
    if (!user) {
      return {
        hasAccount: false,
        requiresOnboarding: true,
      };
    }
    
    // Check if user has Square account connected
    if (user.squareLocationId && user.squareMerchantId) {
      return {
        hasAccount: true,
        requiresOnboarding: false,
        locationId: user.squareLocationId,
        merchantId: user.squareMerchantId,
      };
    }
    
    return {
      hasAccount: false,
      requiresOnboarding: true,
    };
  } catch (error) {
    console.error("Error getting Square seller account:", error);
    return {
      hasAccount: false,
      requiresOnboarding: true,
      error: "Failed to get seller account status",
    };
  }
}