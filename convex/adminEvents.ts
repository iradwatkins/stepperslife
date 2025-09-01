import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Admin emails that can post events on behalf of organizers
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

// Helper function to check if user is admin
const isAdmin = (email: string | null | undefined) => {
  return email && ADMIN_EMAILS.includes(email);
};

// Create event as admin on behalf of organizer
export const createAsAdmin = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    adminEmail: v.string(),
    isTicketed: v.optional(v.boolean()),
    doorPrice: v.optional(v.number()),
    eventType: v.optional(v.string()),
    totalCapacity: v.optional(v.number()),
    eventMode: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin privileges
    if (!isAdmin(args.adminEmail)) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Generate a unique claim token
    const claimToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

    // Create the event with admin posting flag
    const eventId = await ctx.db.insert("events", {
      ...args,
      userId: args.adminEmail, // Initially set to admin's email
      postedByAdmin: true,
      adminUserId: args.adminEmail,
      claimable: true,
      claimToken: claimToken,
      eventType: args.eventType as any,
      eventMode: args.eventMode as any,
    });

    return { eventId, claimToken };
  },
});

// Claim an admin-posted event
export const claimEvent = mutation({
  args: {
    eventId: v.id("events"),
    claimToken: v.string(),
    userId: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    if (!event.claimable) {
      throw new Error("This event is not claimable");
    }

    if (event.claimToken !== args.claimToken) {
      throw new Error("Invalid claim token");
    }

    if (event.claimedBy) {
      throw new Error("This event has already been claimed");
    }

    // Transfer ownership to the claiming user
    await ctx.db.patch(args.eventId, {
      userId: args.userId,
      claimable: false,
      claimedBy: args.userId,
      claimedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete any event as admin
export const deleteAdminEvent = mutation({
  args: {
    eventId: v.id("events"),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin privileges
    if (!isAdmin(args.adminEmail)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const event = await ctx.db.get(args.eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    // Delete all related tickets first
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }
    
    // Delete all waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete all affiliate programs for this event
    const affiliatePrograms = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    for (const program of affiliatePrograms) {
      await ctx.db.delete(program._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    return { success: true, message: "Event and all related data deleted successfully" };
  },
});

// Get all events for admin management
export const getAllEventsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .order("desc")  // Most recent first
      .collect();
    
    return events;
  },
});

// Get claimable events
export const getClaimableEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("claimable"), true))
      .collect();
    
    return events;
  },
});

// Get event claim status
export const getClaimStatus = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    
    if (!event) {
      return null;
    }

    return {
      postedByAdmin: event.postedByAdmin || false,
      claimable: event.claimable || false,
      claimedBy: event.claimedBy,
      claimedAt: event.claimedAt,
      adminUserId: event.adminUserId,
    };
  },
});