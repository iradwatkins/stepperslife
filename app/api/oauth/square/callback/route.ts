import { NextRequest, NextResponse } from "next/server";
import { getOAuthApi } from "@/lib/square";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("Square OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/seller/payment-settings?error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/seller/payment-settings?error=missing_params", request.url)
    );
  }

  try {
    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

    // Exchange authorization code for access token
    const oauthApi = await getOAuthApi();
    const response = await oauthApi.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET!,
      code,
      grantType: "authorization_code",
    });

    if (response.result.accessToken) {
      const { accessToken, refreshToken, merchantId } = response.result;
      
      // TODO: Store tokens in database using Convex
      // For now, we'll redirect with success
      console.log("Square OAuth successful for user:", userId);
      console.log("Merchant ID:", merchantId);
      
      // In production, you would store these tokens securely:
      // await storeSquareTokens({
      //   userId,
      //   accessToken,
      //   refreshToken,
      //   merchantId,
      //   locationId: response.result.locationId,
      // });

      return NextResponse.redirect(
        new URL("/seller/payment-settings?success=square_connected", request.url)
      );
    }
  } catch (error) {
    console.error("Failed to obtain Square access token:", error);
    return NextResponse.redirect(
      new URL("/seller/payment-settings?error=token_exchange_failed", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/seller/payment-settings?error=unknown", request.url)
  );
}