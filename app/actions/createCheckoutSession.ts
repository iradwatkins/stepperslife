"use server";

import { auth } from "@/auth";
import { createSquareCheckoutSession } from "./createSquareCheckoutSession";
import { createStripeCheckoutSession } from "./createStripeCheckoutSession";
import { createPayPalCheckoutSession } from "./createPayPalCheckoutSession";

const PLATFORM_FEE_PER_TICKET = 1.50; // $1.50 per ticket platform fee

export interface CheckoutParams {
  eventId: string;
  eventName: string;
  sellerId: string;
  tickets: Array<{
    type: string;
    price: number;
    quantity: number;
  }>;
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: {
    referralCode?: string;
    tableId?: string;
    bundleId?: string;
  };
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  provider?: string;
  error?: string;
  requiresManualPayment?: boolean;
  manualInstructions?: {
    method: string;
    recipientEmail?: string;
    recipientPhone?: string;
    amount: number;
    reference: string;
  };
}

async function getSellerPaymentMethod(sellerId: string): Promise<string | null> {
  // TODO: Fetch from Convex database
  // For now, return square as default
  return "square";
}

async function calculateFees(amount: number, ticketCount: number, provider: string) {
  const platformFee = ticketCount * PLATFORM_FEE_PER_TICKET; // $1.50 per ticket
  
  // Provider-specific transaction fees
  let providerFee = 0;
  switch (provider) {
    case "square":
      providerFee = amount * 0.026 + 0.10; // 2.6% + 10¢
      break;
    case "stripe":
      providerFee = amount * 0.029 + 0.30; // 2.9% + 30¢
      break;
    case "paypal":
      providerFee = amount * 0.0289 + 0.49; // 2.89% + 49¢
      break;
    case "zelle":
      providerFee = 0; // No transaction fees
      break;
  }
  
  const sellerPayout = amount - platformFee - providerFee;
  
  return {
    grossAmount: amount,
    platformFee,
    providerFee,
    sellerPayout,
    totalFees: platformFee + providerFee,
    ticketCount,
  };
}

export async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get seller's preferred payment method
    const paymentMethod = await getSellerPaymentMethod(params.sellerId);
    
    if (!paymentMethod) {
      return {
        success: false,
        error: "Seller has not configured any payment methods. Please contact the event organizer.",
      };
    }

    // Calculate total amount and ticket count
    const totalAmount = params.tickets.reduce(
      (sum, ticket) => sum + ticket.price * ticket.quantity,
      0
    );
    const totalTickets = params.tickets.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    // Calculate fees with ticket count
    const fees = await calculateFees(totalAmount, totalTickets, paymentMethod);

    // Add fee information to metadata
    const enrichedMetadata = {
      ...params.metadata,
      platformFee: fees.platformFee.toFixed(2),
      providerFee: fees.providerFee.toFixed(2),
      sellerPayout: fees.sellerPayout.toFixed(2),
    };

    // Route to appropriate payment provider
    switch (paymentMethod) {
      case "square":
        // Use existing Square implementation with added platform fee
        const squareResult = await createSquareCheckoutSession({
          eventId: params.eventId as any, // Type conversion for now
          eventName: params.eventName,
          ticketQuantity: params.tickets.reduce((sum, t) => sum + t.quantity, 0),
          ticketPrice: totalAmount,
          buyerEmail: params.buyerEmail,
          metadata: enrichedMetadata,
        });
        
        return {
          success: !!squareResult.sessionUrl,
          checkoutUrl: squareResult.sessionUrl,
          sessionId: squareResult.sessionId,
          provider: "square",
          error: squareResult.sessionUrl ? undefined : "Failed to create checkout session",
        };

      case "stripe":
        // Use Stripe implementation
        const stripeResult = await createStripeCheckoutSession({
          eventId: params.eventId as any, // Type conversion for now
        });
        
        return {
          success: !!stripeResult.sessionUrl,
          checkoutUrl: stripeResult.sessionUrl,
          sessionId: stripeResult.sessionId,
          provider: "stripe",
          error: stripeResult.sessionUrl ? undefined : "Failed to create checkout session",
        };

      case "paypal":
        // Use PayPal implementation
        const paypalResult = await createPayPalCheckoutSession({
          eventId: params.eventId as any, // Type conversion for now
        });
        
        return {
          success: !!paypalResult.sessionUrl,
          checkoutUrl: paypalResult.sessionUrl,
          sessionId: paypalResult.sessionId,
          provider: "paypal",
          error: paypalResult.sessionUrl ? undefined : "Failed to create checkout session",
        };

      case "zelle":
        // Zelle requires manual payment handling
        const referenceCode = `SL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
        
        // TODO: Fetch seller's Zelle email from database
        const sellerZelleEmail = "seller@example.com";
        
        return {
          success: true,
          provider: "zelle",
          requiresManualPayment: true,
          manualInstructions: {
            method: "zelle",
            recipientEmail: sellerZelleEmail,
            amount: totalAmount,
            reference: referenceCode,
          },
        };

      default:
        return {
          success: false,
          error: `Payment method ${paymentMethod} is not supported`,
        };
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error: "Failed to create checkout session. Please try again.",
    };
  }
}

// Helper function to validate payment method is configured
export async function validatePaymentMethod(sellerId: string): Promise<{
  isValid: boolean;
  error?: string;
  provider?: string;
}> {
  const paymentMethod = await getSellerPaymentMethod(sellerId);
  
  if (!paymentMethod) {
    return {
      isValid: false,
      error: "No payment method configured. Sellers must set up a payment method before selling tickets.",
    };
  }
  
  // TODO: Check if the payment method credentials are still valid
  // For example, check if OAuth tokens are not expired
  
  return {
    isValid: true,
    provider: paymentMethod,
  };
}