import { NextResponse } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    // Test creating an event directly
    const testEventData = {
      name: "Test Event - API Debug",
      description: "Testing event and ticket connection",
      location: "Test Venue",
      eventDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      price: 25,
      totalTickets: 100,
      userId: "test_user_debug",
      isTicketed: true,
      address: "2740 W 83rd Pl",
      city: "Chicago",
      state: "IL",
      postalCode: "60652",
      totalCapacity: 100,
      eventCategories: ["social_dance", "workshop"],
    };

    console.log("Creating test event with data:", testEventData);

    // Create the event
    const eventId = await fetchMutation(api.events.create, testEventData);
    console.log("Event created with ID:", eventId);

    // Create ticket types for the event
    const ticketTypes = [
      {
        name: "General Admission",
        category: "general" as const,
        allocatedQuantity: 50,
        price: 25,
        hasEarlyBird: true,
        earlyBirdPrice: 20,
        earlyBirdEndDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        name: "VIP",
        category: "vip" as const,
        allocatedQuantity: 50,
        price: 50,
        hasEarlyBird: false,
      }
    ];

    console.log("Creating ticket types:", ticketTypes);

    const ticketIds = await fetchMutation(api.ticketTypes.createSingleEventTickets, {
      eventId,
      ticketTypes,
    });

    console.log("Ticket types created with IDs:", ticketIds);

    // Fetch the event back to verify
    const event = await fetchQuery(api.events.getById, { eventId });
    
    // Fetch the ticket types
    const tickets = await fetchQuery(api.ticketTypes.getEventTicketTypes, { eventId });

    return NextResponse.json({
      success: true,
      message: "Test event created successfully",
      data: {
        eventId,
        event,
        ticketIds,
        tickets,
        ticketCount: tickets.length,
      }
    });
  } catch (error: Error | unknown) {
    console.error("Error in test event creation:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to create test event",
      details: error.toString(),
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clean up test events
    const events = await fetchQuery(api.events.debugFindEventByName, {
      searchTerm: "Test Event - API Debug"
    });
    
    let deletedCount = 0;
    for (const event of events) {
      await fetchMutation(api.events.adminDeleteEvent, {
        eventId: event.id,
        adminUserId: "admin"
      });
      deletedCount++;
    }
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} test events`,
    });
  } catch (error: Error | unknown) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete test events",
    }, { status: 500 });
  }
}