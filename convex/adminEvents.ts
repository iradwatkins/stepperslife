import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Admin emails that can post events on behalf of organizers
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "iradwatkins@gmail.com",
  "bobbygwatkins@gmail.com",
];

// Admin user IDs for notifications
const ADMIN_USER_IDS = [
  "user_2mPqnyyK7CDiaLwgHQEj", // Replace with actual admin user IDs
  "admin",
];

// Helper function to check if user is admin
const isAdmin = (email: string | null | undefined) => {
  return email && ADMIN_EMAILS.includes(email);
};

// Helper function to check if user ID is admin
const isAdminById = (userId: string | null | undefined) => {
  return userId && ADMIN_USER_IDS.includes(userId);
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
    deleteAdminEvent: v.optional(v.boolean()), // Option to delete admin's duplicate
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

    // Create notification for the organizer
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: args.userId,
      type: "event_claim_approved",
      title: "Event Claimed Successfully",
      message: `You have successfully claimed the event "${event.name}". You can now manage this event from your dashboard.`,
      eventId: args.eventId,
    });

    // Notify admins about the claim
    for (const adminId of ADMIN_USER_IDS) {
      await ctx.runMutation(internal.notifications.createNotification, {
        userId: adminId,
        type: "event_claimed",
        title: "Event Claimed by Organizer",
        message: `The event "${event.name}" has been claimed by ${args.userEmail}.`,
        eventId: args.eventId,
        relatedUserId: args.userId,
      });
    }

    // If requested, delete the admin's version of the event
    if (args.deleteAdminEvent && event.adminUserId) {
      // Look for duplicate events by the same name and date posted by admin
      const adminEvents = await ctx.db
        .query("events")
        .filter((q) => 
          q.and(
            q.eq(q.field("name"), event.name),
            q.eq(q.field("eventDate"), event.eventDate),
            q.eq(q.field("userId"), event.adminUserId),
            q.neq(q.field("_id"), args.eventId)
          )
        )
        .collect();

      // Delete admin's duplicate events
      for (const adminEvent of adminEvents) {
        await ctx.db.delete(adminEvent._id);
        
        // Notify admin that their duplicate was deleted
        await ctx.runMutation(internal.notifications.createNotification, {
          userId: event.adminUserId,
          type: "event_deleted",
          title: "Duplicate Event Removed",
          message: `Your duplicate posting of "${event.name}" has been removed after the organizer claimed their event.`,
          eventId: adminEvent._id,
        });
      }
    }

    return { success: true };
  },
});

// Request to claim an event (for organizers to initiate claim)
export const requestEventClaim = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    userEmail: v.string(),
    organizerMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    if (!event.postedByAdmin || !event.claimable) {
      throw new Error("This event cannot be claimed");
    }

    if (event.claimedBy) {
      throw new Error("This event has already been claimed");
    }

    // Notify admins about the claim request
    for (const adminId of ADMIN_USER_IDS) {
      await ctx.runMutation(internal.notifications.createNotification, {
        userId: adminId,
        type: "event_claim_requested",
        title: "Event Claim Request",
        message: `${args.userEmail} is requesting to claim the event "${event.name}". ${args.organizerMessage ? `Message: ${args.organizerMessage}` : ''}`,
        eventId: args.eventId,
        relatedUserId: args.userId,
      });
    }

    // Also notify the requester
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: args.userId,
      type: "event_claim_requested",
      title: "Claim Request Submitted",
      message: `Your request to claim "${event.name}" has been submitted. An admin will review it shortly.`,
      eventId: args.eventId,
    });

    return { 
      success: true,
      message: "Claim request submitted. You'll be notified once it's reviewed."
    };
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
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
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