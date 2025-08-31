"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUserWithConvex() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return { success: false, error: "No user found" };
    }

    // Sync user data with Convex
    await fetchMutation(api.users.updateUser, {
      userId: user.id,
      name: user.firstName 
        ? `${user.firstName} ${user.lastName || ''}`.trim() 
        : user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User",
      email: user.emailAddresses?.[0]?.emailAddress || "",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error syncing user with Convex:", error);
    return { success: false, error: error.message };
  }
}