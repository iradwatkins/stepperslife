"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";

export async function publishEvent(data: {
  event: any;
  ticketTypes?: any[];
  tables?: any[];
}) {
  try {
    // Get the current user
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return {
        success: false,
        error: "You must be signed in to create an event"
      };
    }

    // Prepare event data
    const eventData = {
      ...data.event,
      userId: user.id,
      eventDate: new Date(data.event.eventDate + " " + data.event.eventTime).getTime(),
      totalTickets: data.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0
    };

    // Validate event data
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(", ")
      };
    }

    // Prepare data for Convex
    const convexData = prepareEventDataForConvex(eventData);

    console.log("Publishing event with server action:", convexData);

    // Create the event using server-side mutation
    const eventId = await fetchMutation(api.events.create, convexData);

    // If ticketed, create ticket types
    if (data.event.isTicketed && data.ticketTypes && data.ticketTypes.length > 0) {
      await fetchMutation(api.ticketTypes.createSingleEventTickets, {
        eventId,
        ticketTypes: data.ticketTypes.map(ticket => ({
          name: ticket.name,
          category: "general",
          allocatedQuantity: ticket.quantity,
          price: ticket.price,
          hasEarlyBird: ticket.hasEarlyBird,
          earlyBirdPrice: ticket.earlyBirdPrice,
          earlyBirdEndDate: ticket.earlyBirdEndDate,
        })),
      });
    }

    return {
      success: true,
      eventId
    };
  } catch (error: any) {
    console.error("Error publishing event:", error);
    return {
      success: false,
      error: error.message || "Failed to publish event"
    };
  }
}

export async function generateUploadUrl() {
  try {
    const uploadUrl = await fetchMutation(api.storage.generateUploadUrl, {});
    return {
      success: true,
      uploadUrl
    };
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    return {
      success: false,
      error: error.message || "Failed to generate upload URL"
    };
  }
}