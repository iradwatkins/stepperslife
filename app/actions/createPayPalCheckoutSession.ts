"use server";

import { getPayPalClient, isPayPalConfigured } from "@/lib/paypal-client";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const paypal = require('@paypal/checkout-server-sdk');

export async function createPayPalCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  if (!userId) throw new Error("Not authenticated");

  if (!isPayPalConfigured()) {
    throw new Error("PayPal payment system is not configured.");
  }

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

  try {
    const client = getPayPalClient();
    if (!client) {
      throw new Error("PayPal client not initialized");
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: event.price.toFixed(2),
        },
        description: `Ticket for ${event.name}`,
        custom_id: JSON.stringify({
          eventId,
          userId,
          waitingListId: queuePosition._id,
        }),
      }],
      application_context: {
        brand_name: 'SteppersLife',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${baseUrl}/api/payments/paypal/capture`,
        cancel_url: `${baseUrl}/event/${eventId}`,
      },
    });

    const order = await client.execute(request);
    
    // Get the approval link
    const approvalLink = order.result.links.find((link: any) => link.rel === 'approve');
    
    if (!approvalLink) {
      throw new Error("Failed to get PayPal approval link");
    }

    // Store the order for processing
    await convex.mutation(api.payments.storeSquarePaymentLink, {
      paymentId: order.result.id,
      metadata: {
        eventId,
        userId,
        waitingListId: queuePosition._id,
      },
    });

    return {
      sessionId: order.result.id,
      sessionUrl: approvalLink.href,
    };
  } catch (error) {
    console.error("PayPal checkout creation error:", error);
    throw new Error("Failed to create PayPal checkout session");
  }
}