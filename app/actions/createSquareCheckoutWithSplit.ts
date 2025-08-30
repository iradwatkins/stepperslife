"use server";

import { Client } from 'square';
import { randomUUID } from 'crypto';
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { auth } from "@clerk/nextjs/server";
import { DURATIONS } from "@/convex/constants";

export async function createSquareCheckoutWithSplit({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get seller's Square OAuth credentials
  const seller = await convex.query(api.users.getUserById, { userId: event.userId });
  if (!seller?.squareAccessToken) {
    throw new Error("Seller has not connected their Square account");
  }

  // Get waiting list entry
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  // Initialize Square client with SELLER's OAuth access token
  const sellerClient = new Client({
    accessToken: seller.squareAccessToken,
    environment: process.env.NODE_ENV === 'production' 
      ? 'production' as any
      : 'sandbox' as any,
  });

  const platformFeeAmount = Math.round(event.price * 100 * 0.01); // 1% platform fee in cents
  
  try {
    // Create payment link with automatic payment methods including Cash App
    const { result } = await sellerClient.checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: event.name,
        priceMoney: {
          amount: BigInt(Math.round(event.price * 100)), // Convert to cents
          currency: 'USD', // Using USD as requested
        },
        locationId: seller.squareLocationId!,
      },
      checkoutOptions: {
        // Platform automatically receives this fee
        applicationFeeAmountMoney: {
          amount: BigInt(platformFeeAmount),
          currency: 'USD',
        },
        // Enable ALL payment methods including Cash App
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
          cashAppPay: true, // ✅ Cash App enabled!
          afterpayClearpay: false, // Disabled - not needed for ticket sales
        },
        allowTipping: false,
        redirectUrl: `${baseUrl}/tickets/purchase-success`,
        merchantSupportEmail: seller.email,
        askForShippingAddress: false,
        enableCoupon: false,
        enableLoyalty: false,
      },
      paymentNote: `Ticket for ${event.name} - Sold by ${seller.name}`,
      description: event.description,
    });

    if (result.paymentLink) {
      // Store payment metadata for webhook processing
      const metadata = {
        eventId,
        userId,
        waitingListId: queuePosition._id,
        sellerId: event.userId,
        platformFee: platformFeeAmount / 100, // Convert back to dollars
      };

      await convex.mutation(api.payments.storeSquarePaymentLink, {
        paymentLinkId: result.paymentLink.id!,
        metadata,
        url: result.paymentLink.url!,
      });

      // Payment automatically splits:
      // - Seller receives: $99 (if ticket is $100)
      // - Platform receives: $1 (1% fee)
      // - Seller gets automatic daily payout to their bank
      // - Buyers can pay with: Credit/Debit, Cash App, Apple Pay, Google Pay

      return { 
        sessionId: result.paymentLink.id, 
        sessionUrl: result.paymentLink.url,
        paymentMethods: ['card', 'cashapp', 'applepay', 'googlepay'],
      };
    }

    throw new Error("Failed to create payment link");
  } catch (error) {
    console.error("Square checkout creation error:", error);
    throw new Error("Failed to create checkout session");
  }
}