"use server";

import { auth } from "@clerk/nextjs/server";
import { getOAuthApi } from "@/lib/square";
import { getConvexClient } from "@/lib/convex";

export async function createSquareSellerAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  
  try {
    // Get OAuth API
    
    // Generate OAuth authorization URL for Square
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    const authorizeUrl = `https://connect.squareup.com/oauth2/authorize?client_id=${
      process.env.SQUARE_APPLICATION_ID
    }&scope=MERCHANT_PROFILE_READ+PAYMENTS_WRITE+PAYMENTS_READ&session=false&state=${state}`;
    
    return {
      success: true,
      authorizeUrl,
    };
  } catch (error) {
    console.error("Error creating Square seller account:", error);
    return {
      success: false,
      error: "Failed to create seller account",
    };
  }
}