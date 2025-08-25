"use server";

import { auth } from "@/auth";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe-server";

export async function createStripeConnectAccount() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id || session.user.email || "";
  const userEmail = session.user.email || "";
  
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Stripe is not configured. Please contact support.",
    };
  }
  
  try {
    const stripe = getStripeServer();
    
    // Create a Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: userEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        userId,
        platform: "SteppersLife",
      },
    });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/onboarding/stripe?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/stripe/callback?account=${account.id}&userId=${userId}`,
      type: "account_onboarding",
    });

    return {
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create Stripe account",
    };
  }
}

export async function getStripeAccountStatus(accountId: string) {
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Stripe is not configured. Please contact support.",
    };
  }
  
  try {
    const stripe = getStripeServer();
    const account = await stripe.accounts.retrieve(accountId);
    
    return {
      success: true,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error("Error retrieving Stripe account:", error);
    return {
      success: false,
      error: "Failed to retrieve account status",
    };
  }
}

export async function createStripeAccountLink(accountId: string) {
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Stripe is not configured. Please contact support.",
    };
  }
  
  try {
    const stripe = getStripeServer();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/onboarding/stripe?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/payment-settings?success=stripe_connected`,
      type: "account_onboarding",
    });

    return {
      success: true,
      url: accountLink.url,
    };
  } catch (error) {
    console.error("Error creating account link:", error);
    return {
      success: false,
      error: "Failed to create account link",
    };
  }
}