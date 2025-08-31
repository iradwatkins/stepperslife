"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export async function publishEvent(eventData: any) {
  try {
    // Get the current user
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to create an event"
      };
    }

    // Add userId to event data
    const completeEventData = {
      ...eventData,
      userId,
      eventDate: new Date(eventData.eventDate + " " + eventData.eventTime).getTime(),
      totalTickets: eventData.ticketTypes?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0
    };

    // Create the event using server-side mutation
    const eventId = await fetchMutation(api.events.create, completeEventData);

    // If there are ticket types, create them
    if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
      await fetchMutation(api.ticketTypes.createSingleEventTickets, {
        eventId,
        ticketTypes: eventData.ticketTypes,
        tables: eventData.tables || []
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