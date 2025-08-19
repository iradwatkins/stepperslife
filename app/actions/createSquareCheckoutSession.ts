"use server";

import { getCheckoutApi, getLocationId } from "@/lib/square";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { auth } from "@/auth";
import { DURATIONS } from "@/convex/constants";
import { randomUUID } from "crypto";

export type SquareCheckoutMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

export async function createSquareCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const userId = session.user.id || session.user.email || "";

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get waiting list entry
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const squareMerchantId = await convex.query(
    api.users.getUsersSquareMerchantId,
    {
      userId: event.userId,
    }
  );

  if (!squareMerchantId) {
    throw new Error("Square Merchant ID not found for owner of the event!");
  }

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offer has no expiration date");
  }

  const metadata: SquareCheckoutMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  try {
    // Create Square Checkout Link
    const { result } = await checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: event.name,
        priceMoney: {
          amount: BigInt(Math.round(event.price * 100)),
          currency: "GBP",
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
      paymentNote: `Ticket for ${event.name}`,
    });

    if (result.paymentLink) {
      // Store the payment link ID with metadata in your database
      await convex.mutation(api.payments.storeSquarePaymentLink, {
        paymentLinkId: result.paymentLink.id!,
        metadata,
        url: result.paymentLink.url!,
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