"use server";

import { auth } from "@/auth";
import { getOAuthApi } from "@/lib/square";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function createSquareSellerAccount() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id || session.user.email || "";
  const convex = getConvexClient();
  
  try {
    // Get OAuth API
    const oauthApi = await getOAuthApi();
    
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