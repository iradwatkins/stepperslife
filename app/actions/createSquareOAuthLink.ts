"use server";

import { auth } from "@/auth";
import baseUrl from "@/lib/baseUrl";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function createSquareOAuthLink() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id || session.user.email || "";
  
  // Square OAuth parameters
  const params = new URLSearchParams({
    client_id: process.env.SQUARE_APPLICATION_ID!,
    scope: 'MERCHANT_PROFILE_READ PAYMENTS_WRITE PAYMENTS_READ PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS',
    session: 'false',
    state: userId, // Pass user ID to link accounts after OAuth
  });

  // Use sandbox for development, production for live
  const squareUrl = process.env.NODE_ENV === 'production' 
    ? 'https://connect.squareup.com/oauth2/authorize'
    : 'https://connect.squareupsandbox.com/oauth2/authorize';

  return `${squareUrl}?${params}`;
}

export async function getSquareOAuthStatus(userId: string) {
  // Check if user has connected Square account
  const convex = getConvexClient();
  const user = await convex.query(api.users.getUser, { userId });
  
  return {
    isConnected: !!user?.squareAccessToken,
    merchantId: user?.squareMerchantId,
    locationId: user?.squareLocationId,
  };
}