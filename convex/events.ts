import { query, mutation, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { DURATIONS, WAITING_LIST_STATUS, TICKET_STATUS } from "./constants";
import { components, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
// import { processQueue } from "./waitingList";
// import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

export type Metrics = {
  soldTickets: number;
  refundedTickets: number;
  cancelledTickets: number;
  revenue: number;
};

// Initialize rate limiter - disabled for now due to component issues
// const rateLimiter = new RateLimiter(components.rateLimiter, {
//   queueJoin: {
//     kind: "fixed window",
//     rate: 3, // 3 joins allowed
//     period: 30 * MINUTE, // in 30 minutes
//   },
// });

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const getSellerEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
    
    // Add purchased count for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .filter((q) => q.neq(q.field("status"), "refunded"))
          .collect();
        
        return {
          ...event,
          purchasedCount: tickets.length,
        };
      })
    );
    
    return eventsWithCounts;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(), // Store as timestamp
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")), // Convex storage ID for images
    eventType: v.optional(v.string()),
    eventCategories: v.optional(v.array(v.string())), // Support for multiple categories
    isTicketed: v.optional(v.boolean()), // For new simplified ticket system
    doorPrice: v.optional(v.number()), // Door price for non-ticketed events
    // Multi-day event support
    endDate: v.optional(v.number()), 
    isMultiDay: v.optional(v.boolean()),
    isSaveTheDate: v.optional(v.boolean()),
    sameLocation: v.optional(v.boolean()),
    eventMode: v.optional(v.string()),
    // Location fields
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
      imageStorageId: args.imageStorageId,
      eventType: args.eventType as any,
      eventCategories: args.eventCategories as any, // Save the array of categories
      isTicketed: args.isTicketed !== undefined ? args.isTicketed : true, // Default to ticketed
      doorPrice: args.doorPrice,
      // Multi-day event support
      endDate: args.endDate,
      isMultiDay: args.isMultiDay,
      isSaveTheDate: args.isSaveTheDate,
      sameLocation: args.sameLocation,
      eventMode: args.eventMode as any,
      // Location fields
      latitude: args.latitude,
      longitude: args.longitude,
      address: args.address,
      city: args.city,
      state: args.state,
      country: args.country,
      postalCode: args.postalCode,
    });
    return eventId;
  },
});

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Join waiting list for an event
export const joinWaitingList = mutation({
  // Function takes an event ID and user ID as arguments
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }): Promise<any> => {
    // Rate limit check - disabled for now
    // const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId });
    // if (!status.ok) {
    //   throw new ConvexError(
    //     `You've joined the waiting list too many times. Please wait ${Math.ceil(
    //       status.retryAfter / (60 * 1000)
    //     )} minutes before trying again.`
    //   );
    // }

    // First check if user already has an active entry in waiting list for this event
    // Active means any status except EXPIRED
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    // Don't allow duplicate entries
    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Verify the event exists
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if there are any available tickets right now
    const { available } = await ctx.runQuery(internal.events.checkAvailabilityInternal, { eventId }) as { available: boolean };

    const now = Date.now();

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Schedule a job to expire this offer after the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? "Ticket offered - you have 15 minutes to purchase"
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

// Purchase ticket
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    console.log("Starting purchaseTicket handler", {
      eventId,
      userId,
      waitingListId,
    });

    // Verify waiting list entry exists and is valid
    const waitingListEntry = await ctx.db.get(waitingListId);
    console.log("Waiting list entry:", waitingListEntry);

    if (!waitingListEntry) {
      console.error("Waiting list entry not found");
      throw new Error("Waiting list entry not found");
    }

    if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
      console.error("Invalid waiting list status", {
        status: waitingListEntry.status,
      });
      throw new Error(
        "Invalid waiting list status - ticket offer may have expired"
      );
    }

    if (waitingListEntry.userId !== userId) {
      console.error("User ID mismatch", {
        waitingListUserId: waitingListEntry.userId,
        requestUserId: userId,
      });
      throw new Error("Waiting list entry does not belong to this user");
    }

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    console.log("Event details:", event);

    if (!event) {
      console.error("Event not found", { eventId });
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      console.error("Attempted purchase of cancelled event", { eventId });
      throw new Error("Event is no longer active");
    }

    try {
      console.log("Creating ticket with payment info", paymentInfo);
      // Create ticket with payment info
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentReference: (paymentInfo as any).paymentIntentId || (paymentInfo as any).paymentReference,
        amount: paymentInfo.amount,
      });

      console.log("Updating waiting list status to purchased");
      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });

      console.log("Processing queue for next person");
      // Process queue for next person
      await ctx.runMutation(internal.waitingList.processQueueInternal, { eventId });

      console.log("Purchase ticket completed successfully");
    } catch (error) {
      console.error("Failed to complete ticket purchase:", error);
      throw new Error(`Failed to complete ticket purchase: ${error}`);
    }
  },
});

// Get user's tickets with event information
export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          event,
        };
      })
    );

    return ticketsWithEvents;
  },
});

// Get user's waiting list entries with event information
export const getUserWaitingList = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entriesWithEvents = await Promise.all(
      entries.map(async (entry) => {
        const event = await ctx.db.get(entry.eventId);
        return {
          ...entry,
          event,
        };
      })
    );

    return entriesWithEvents;
  },
});

export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if this is a ticketed event with configured ticket types
    const isTicketed = event.isTicketed;
    let totalTickets = event.totalTickets;
    let purchasedCount = 0;

    if (isTicketed) {
      // For ticketed events, calculate total from ticket types
      const ticketTypes = await ctx.db
        .query("dayTicketTypes")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("eventDayId"), undefined)) // Single event tickets only
        .collect();
      
      // Calculate total available tickets from all ticket types
      if (ticketTypes.length > 0) {
        totalTickets = ticketTypes.reduce((sum, ticket) => sum + ticket.allocatedQuantity, 0);
        purchasedCount = ticketTypes.reduce((sum, ticket) => sum + ticket.soldCount, 0);
      }
    } else {
      // For non-ticketed events, use the original logic
      purchasedCount = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect()
        .then(
          (tickets) =>
            tickets.filter(
              (t) =>
                t.status === TICKET_STATUS.VALID ||
                t.status === TICKET_STATUS.USED
            ).length
        );
    }

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= totalTickets,
      totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, totalTickets - totalReserved),
    };
  },
});

// Get price range for ticketed events
export const getEventPriceRange = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // For non-ticketed events, return the single price
    if (!event.isTicketed) {
      return {
        minPrice: event.price,
        maxPrice: event.price,
        hasEarlyBird: false,
        earlyBirdPrice: null,
      };
    }

    // For ticketed events, get all ticket types
    const ticketTypes = await ctx.db
      .query("dayTicketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("eventDayId"), undefined)) // Single event tickets only
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // If no ticket types configured yet, return placeholder
    if (ticketTypes.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        hasEarlyBird: false,
        earlyBirdPrice: null,
      };
    }

    // Calculate price range
    const prices = ticketTypes.map(t => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Check for active early bird pricing
    const now = Date.now();
    const activeEarlyBird = ticketTypes.find(t => 
      t.hasEarlyBird && 
      t.earlyBirdPrice && 
      t.earlyBirdEndDate && 
      t.earlyBirdEndDate > now
    );

    return {
      minPrice,
      maxPrice,
      hasEarlyBird: !!activeEarlyBird,
      earlyBirdPrice: activeEarlyBird?.earlyBirdPrice || null,
      ticketCount: ticketTypes.length,
    };
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
      );
    });
  },
});

// Internal version of checkAvailability for use in mutations
export const checkAvailabilityInternal = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Duplicate function removed - using the one defined at line 41

// Update event total tickets after ticket configuration
export const updateEventTotals = mutation({
  args: {
    eventId: v.id("events"),
    totalTickets: v.number(),
    minPrice: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      totalTickets: args.totalTickets,
      price: args.minPrice, // Use the minimum price as the display price
    });
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    eventCategories: v.optional(v.array(v.string())),
    eventType: v.optional(v.string()),
    isTicketed: v.optional(v.boolean()),
    doorPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Get current event to check tickets sold
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    // Ensure new total tickets is not less than sold tickets
    if (updates.totalTickets < soldTickets.length) {
      throw new Error(
        `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(eventId, updates as any);
    return eventId;
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    if (tickets.length > 0) {
      throw new Error(
        "Cannot cancel event with active tickets. Please refund all tickets first."
      );
    }

    // Mark event as cancelled
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });

    // Delete any waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect();

    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});
