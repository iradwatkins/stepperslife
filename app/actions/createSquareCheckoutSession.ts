"use server";

import { getCheckoutApi, getLocationId, isSquareReady } from "@/lib/square-client";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DURATIONS } from "@/convex/constants";
import { randomUUID } from "crypto";

export type SquareCheckoutMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId?: Id<"waitingList">;
  quantity?: number;
  isTablePurchase?: boolean;
  tableName?: string;
  referralCode?: string;
};

export async function createSquareCheckoutSession({
  eventId,
  quantity = 1,
  isTablePurchase = false,
  tableName,
  referralCode,
}: {
  eventId: Id<"events">;
  quantity?: number;
  isTablePurchase?: boolean;
  tableName?: string;
  referralCode?: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // For table purchases, we don't need waiting list
  let waitingListId: Id<"waitingList"> | undefined;
  
  if (!isTablePurchase) {
    // Get waiting list entry for individual tickets
    const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
      eventId,
      userId,
    });

    if (!queuePosition || queuePosition.status !== "offered") {
      throw new Error("No valid ticket offer found");
    }
    waitingListId = queuePosition._id;
  }

  // For now, we'll use the platform's Square account for all transactions
  // Later we can implement seller-specific Square accounts
  const squareMerchantId = await convex.query(
    api.users.getUsersSquareMerchantId,
    {
      userId: event.userId,
    }
  );

  // Don't require seller to have Square account - use platform account
  // if (!squareMerchantId) {
  //   throw new Error("Square Merchant ID not found for owner of the event!");
  // }

  const metadata: SquareCheckoutMetaData = {
    eventId,
    userId,
    waitingListId,
    quantity,
    isTablePurchase,
    tableName,
    referralCode,
  };

  try {
    // Check if Square is ready
    if (!isSquareReady()) {
      throw new Error("Square payment system is not configured. Please contact support.");
    }
    
    // Get Square API instances
    const checkoutApi = getCheckoutApi();
    const locationId = getLocationId();
    
    // Create Square Checkout Link
    const { result } = await checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: isTablePurchase && tableName 
          ? `${tableName} - ${event.name}`
          : `${event.name} (${quantity} ticket${quantity > 1 ? 's' : ''})`,
        priceMoney: {
          amount: BigInt(Math.round(event.price * quantity * 100)),
          currency: "USD",
        },
        locationId: locationId,
      },
      checkoutOptions: {
        allowTipping: false,
        redirectUrl: `${baseUrl}/tickets/purchase-success`,
        merchantSupportEmail: "support@stepperslife.com",
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: undefined, // You can add user email here if available
      },
      paymentNote: isTablePurchase 
        ? `${tableName || 'Table'} purchase for ${event.name} (${quantity} seats)`
        : `${quantity} ticket${quantity > 1 ? 's' : ''} for ${event.name}`,
    });

    if (result.paymentLink) {
      // Store the payment link ID with metadata in your database
      await convex.mutation(api.payments.storeSquarePaymentLink, {
        paymentId: result.paymentLink.id!,
        metadata,
      });

      return { 
        sessionId: result.paymentLink.id, 
        sessionUrl: result.paymentLink.url 
      };
    }

    throw new Error("Failed to create payment link");
  } catch (error) {
    console.error("Square checkout creation error:", error);
    throw new Error("Failed to create checkout session");
  }
}