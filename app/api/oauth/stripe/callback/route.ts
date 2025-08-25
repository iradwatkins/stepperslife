import { NextRequest, NextResponse } from "next/server";
import { getStripeAccountStatus } from "@/app/actions/createStripeConnectAccount";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get("account");
  const userId = searchParams.get("userId");

  if (!accountId || !userId) {
    return NextResponse.redirect(
      new URL("/seller/payment-settings?error=missing_params", request.url)
    );
  }

  try {
    // Check if the Stripe account setup is complete
    const status = await getStripeAccountStatus(accountId);
    
    if (status.success && status.chargesEnabled) {
      // TODO: Store the Stripe account ID in the database
      // await storeStripeAccount({ userId, accountId });
      
      console.log("Stripe Connect successful for user:", userId);
      console.log("Account ID:", accountId);
      console.log("Charges Enabled:", status.chargesEnabled);
      console.log("Payouts Enabled:", status.payoutsEnabled);
      
      return NextResponse.redirect(
        new URL("/seller/payment-settings?success=stripe_connected", request.url)
      );
    } else {
      // Account setup not complete, redirect back to onboarding
      console.log("Stripe account setup incomplete:", status);
      
      return NextResponse.redirect(
        new URL("/seller/onboarding/stripe?incomplete=true", request.url)
      );
    }
  } catch (error) {
    console.error("Failed to verify Stripe account:", error);
    return NextResponse.redirect(
      new URL("/seller/payment-settings?error=verification_failed", request.url)
    );
  }
}