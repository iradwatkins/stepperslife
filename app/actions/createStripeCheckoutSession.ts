"use server";

import { getStripeClient, isStripeConfigured } from "@/lib/stripe-client";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { auth } from "@clerk/nextjs/server";

export async function createStripeCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!isStripeConfigured()) {
    throw new Error("Stripe payment system is not configured.");
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
    const stripe = getStripeClient();

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ticket for ${event.name}`,
              description: `Event at ${event.location} on ${new Date(event.eventDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata: {
        eventId,
        userId,
        waitingListId: queuePosition._id,
      },
      expires_at: Math.floor((queuePosition.offerExpiresAt || Date.now() + 900000) / 1000), // 15 minutes from now
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create Stripe checkout session");
    }

    // Store the session for webhook processing
    await convex.mutation(api.payments.storeSquarePaymentLink, {
      paymentId: checkoutSession.id,
      metadata: {
        eventId,
        userId,
        waitingListId: queuePosition._id,
      },
    });

    return {
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    };
  } catch (error) {
    console.error("Stripe checkout creation error:", error);
    throw new Error("Failed to create Stripe checkout session");
  }
}