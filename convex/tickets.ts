import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getUserTicketForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .first();

    return ticket;
  },
});

export const getTicketWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;

    const event = await ctx.db.get(ticket.eventId);

    return {
      ...ticket,
      event,
    };
  },
});

export const getValidTicketsForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { ticketId, status }) => {
    await ctx.db.patch(ticketId, { status });
  },
});

export const markAsRefunded = mutation({
  args: {
    paymentIntentId: v.string(),
    refundId: v.string(),
  },
  handler: async (ctx, { paymentIntentId, refundId }) => {
    // Find ticket by payment intent ID
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", paymentIntentId))
      .first();
    
    if (!ticket) {
      throw new Error("Ticket not found for payment intent");
    }
    
    // Update ticket status to refunded
    await ctx.db.patch(ticket._id, { 
      status: "refunded" as const,
    });
    
    return ticket._id;
  },
});

export const getTicketById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    return await ctx.db.get(ticketId);
  },
});

// Check in a ticket by QR code
export const checkInTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    checkInBy: v.string(),
    checkInMethod: v.union(v.literal("qr"), v.literal("manual"), v.literal("backup_code")),
  },
  handler: async (ctx, args) => {
    // Get the ticket
    const ticket = await ctx.db.get(args.ticketId);
    
    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }

    // Check if already checked in
    if (ticket.checkedInAt) {
      const checkedInTime = new Date(ticket.checkedInAt).toLocaleString();
      return { 
        success: false, 
        message: `Already checked in at ${checkedInTime} by ${ticket.checkedInBy}`,
        alreadyCheckedIn: true,
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy
      };
    }

    // Check if ticket is valid
    if (ticket.status !== "valid") {
      return { 
        success: false, 
        message: `Ticket is ${ticket.status}` 
      };
    }

    // Get event to check if it's not cancelled
    const event = await ctx.db.get(ticket.eventId);
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    if (event.is_cancelled) {
      return { success: false, message: "Event has been cancelled" };
    }

    // Check if event has started or is within reasonable time window (4 hours before)
    const now = Date.now();
    const eventTime = event.eventDate;
    const fourHoursInMs = 4 * 60 * 60 * 1000;
    
    if (now < eventTime - fourHoursInMs) {
      const eventDate = new Date(eventTime).toLocaleString();
      return { 
        success: false, 
        message: `Too early to check in. Event starts at ${eventDate}` 
      };
    }

    // Update ticket with check-in info
    await ctx.db.patch(args.ticketId, {
      checkedInAt: now,
      checkedInBy: args.checkInBy,
      checkInMethod: args.checkInMethod,
      status: "used",
    });

    return { 
      success: true, 
      message: "Check-in successful!",
      ticketId: args.ticketId,
      eventName: event.name,
      ticketType: ticket.ticketType || "GA"
    };
  },
});

// Validate backup code
export const validateBackupCode = mutation({
  args: {
    backupCode: v.string(),
    checkInBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Clean the backup code (remove dashes and spaces)
    const cleanCode = args.backupCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Find ticket with this backup code
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("backupCode"), cleanCode))
      .collect();

    if (tickets.length === 0) {
      return { success: false, message: "Invalid backup code" };
    }

    const ticket = tickets[0];

    // Check in using the found ticket
    const result = await ctx.db.patch(ticket._id, {
      checkedInAt: Date.now(),
      checkedInBy: args.checkInBy,
      checkInMethod: "backup_code",
      status: "used",
    });

    return { 
      success: true, 
      message: "Check-in successful!",
      ticketId: ticket._id
    };
  },
});

// Get check-in statistics for an event
export const getCheckInStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const totalTickets = tickets.length;
    const checkedIn = tickets.filter(t => t.checkedInAt).length;
    const pending = totalTickets - checkedIn;

    // Group by ticket type
    const byType = tickets.reduce((acc, ticket) => {
      const type = ticket.ticketType || "GA";
      if (!acc[type]) {
        acc[type] = { total: 0, checkedIn: 0 };
      }
      acc[type].total++;
      if (ticket.checkedInAt) {
        acc[type].checkedIn++;
      }
      return acc;
    }, {} as Record<string, { total: number; checkedIn: number }>);

    // Recent check-ins (last 10)
    const recentCheckIns = tickets
      .filter(t => t.checkedInAt)
      .sort((a, b) => (b.checkedInAt || 0) - (a.checkedInAt || 0))
      .slice(0, 10)
      .map(t => ({
        ticketId: t._id,
        checkedInAt: t.checkedInAt,
        checkedInBy: t.checkedInBy,
        ticketType: t.ticketType || "GA",
      }));

    return {
      totalTickets,
      checkedIn,
      pending,
      checkInRate: totalTickets > 0 ? (checkedIn / totalTickets) * 100 : 0,
      byType,
      recentCheckIns,
    };
  },
});

// Generate backup code for a ticket
export const generateBackupCode = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // If already has backup code, return it
    if (ticket.backupCode) {
      return { backupCode: ticket.backupCode };
    }

    // Generate new backup code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // Update ticket with backup code
    await ctx.db.patch(args.ticketId, {
      backupCode: code,
    });

    return { backupCode: code };
  },
});

// Claim a ticket using claim token
export const claimTicket = mutation({
  args: {
    claimToken: v.string(),
    userId: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find ticket by claim token
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("claimToken"), args.claimToken))
      .collect();
    
    if (tickets.length === 0) {
      return { success: false, message: "Invalid or expired claim link" };
    }
    
    const ticket = tickets[0];
    
    // Check if ticket is claimable
    if (!ticket.isClaimable) {
      return { success: false, message: "This ticket cannot be transferred" };
    }
    
    // Check if already claimed by someone else
    if (ticket.currentOwner && ticket.currentOwner !== ticket.originalPurchaser) {
      if (ticket.currentOwner === args.userId) {
        return { success: false, message: "You already own this ticket" };
      }
      return { success: false, message: "This ticket has already been claimed" };
    }
    
    // Check if trying to claim own ticket
    if (ticket.originalPurchaser === args.userId) {
      return { success: false, message: "You cannot claim your own ticket" };
    }
    
    // Create claim record
    await ctx.db.insert("ticketClaims", {
      ticketId: ticket._id,
      claimToken: args.claimToken,
      fromUser: ticket.currentOwner || ticket.originalPurchaser || ticket.userId,
      toUser: args.userId,
      status: "claimed",
      createdAt: Date.now(),
      claimedAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    // Transfer the ticket
    await ctx.db.patch(ticket._id, {
      currentOwner: args.userId,
      userId: args.userId, // Update main owner field
      isClaimable: false,  // Can't be claimed again
      claimedAt: Date.now(),
    });
    
    // Get event details for response
    const event = await ctx.db.get(ticket.eventId);
    
    return {
      success: true,
      message: "Ticket successfully claimed!",
      ticketId: ticket._id,
      eventName: event?.name,
      eventDate: event?.eventDate,
      seatInfo: ticket.tableName ? `${ticket.tableName} - ${ticket.seatNumber}` : null,
    };
  },
});

// Get ticket by claim token (for preview)
export const getTicketByClaimToken = query({
  args: { claimToken: v.string() },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("claimToken"), args.claimToken))
      .collect();
    
    if (tickets.length === 0) {
      return null;
    }
    
    const ticket = tickets[0];
    const event = await ctx.db.get(ticket.eventId);
    
    // Check if already claimed
    const isClaimed = ticket.currentOwner !== ticket.originalPurchaser;
    
    return {
      ticketId: ticket._id,
      eventName: event?.name,
      eventDate: event?.eventDate,
      eventLocation: event?.location,
      tableName: ticket.tableName,
      seatNumber: ticket.seatNumber,
      ticketType: ticket.ticketType,
      isClaimed,
      isClaimable: ticket.isClaimable && !isClaimed,
    };
  },
});

// Get tickets with distribution status
export const getTicketsWithDistribution = query({
  args: {
    userId: v.string(),
    groupPurchaseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    const tickets = await query.collect();
    
    // Filter by group if specified
    const filteredTickets = args.groupPurchaseId
      ? tickets.filter(t => t.groupPurchaseId === args.groupPurchaseId)
      : tickets;
    
    // Add distribution info
    const ticketsWithInfo = await Promise.all(
      filteredTickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        
        // Check if transferred
        const isTransferred = ticket.currentOwner !== ticket.originalPurchaser;
        let transferredTo = null;
        
        if (isTransferred && ticket.currentOwner) {
          const claim = await ctx.db
            .query("ticketClaims")
            .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
            .filter((q) => q.eq(q.field("status"), "claimed"))
            .first();
          
          if (claim) {
            transferredTo = claim.toUser;
          }
        }
        
        return {
          ...ticket,
          eventName: event?.name,
          eventDate: event?.eventDate,
          claimLink: ticket.claimToken && ticket.isClaimable 
            ? `https://stepperslife.com/claim/${ticket.claimToken}`
            : null,
          isTransferred,
          transferredTo,
        };
      })
    );
    
    return ticketsWithInfo;
  },
});
