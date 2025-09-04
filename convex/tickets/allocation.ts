import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Allocate tickets to an affiliate
export const allocateTicketsToAffiliate = mutation({
  args: {
    eventId: v.id("events"),
    affiliateId: v.id("affiliatePrograms"),
    quantity: v.number(),
    ticketTypeId: v.optional(v.id("dayTicketTypes")),
    ticketTypeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the event and verify ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    
    // Get the affiliate program
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");
    
    // Check if allocation already exists
    const existing = await ctx.db
      .query("affiliateTicketAllocations")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();
    
    if (existing) {
      // Update existing allocation
      await ctx.db.patch(existing._id, {
        ticketsAllocated: existing.ticketsAllocated + args.quantity,
        ticketsRemaining: existing.ticketsRemaining + args.quantity,
        ticketTypeId: args.ticketTypeId || existing.ticketTypeId,
        ticketTypeName: args.ticketTypeName || existing.ticketTypeName,
        updatedAt: Date.now(),
      });
      
      return {
        action: "updated",
        allocationId: existing._id,
        totalAllocated: existing.ticketsAllocated + args.quantity,
      };
    } else {
      // Create new allocation
      const allocationId = await ctx.db.insert("affiliateTicketAllocations", {
        affiliateId: args.affiliateId,
        eventId: args.eventId,
        organizerId: event.userId,
        ticketsAllocated: args.quantity,
        ticketsSold: 0,
        ticketsRemaining: args.quantity,
        ticketTypeId: args.ticketTypeId,
        ticketTypeName: args.ticketTypeName,
        acceptsCash: true, // Default to accepting cash
        totalCollected: 0,
        totalOwedToOrganizer: 0,
        totalCommissionEarned: 0,
        totalPaidToAffiliate: 0,
        outstandingBalance: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      return {
        action: "created",
        allocationId,
        totalAllocated: args.quantity,
      };
    }
  },
});

// Record a sale by an affiliate (cash or manual payment)
export const recordAffiliateSale = mutation({
  args: {
    affiliateId: v.id("affiliatePrograms"),
    eventId: v.id("events"),
    customerEmail: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("zelle"),
      v.literal("cashapp"),
      v.literal("venmo"),
      v.literal("paypal"),
      v.literal("other")
    ),
    paymentAmount: v.number(),
    paymentReference: v.optional(v.string()),
    paymentNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get affiliate allocation
    const allocation = await ctx.db
      .query("affiliateTicketAllocations")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();
    
    if (!allocation) {
      throw new Error("No ticket allocation found for this affiliate");
    }
    
    if (allocation.ticketsRemaining <= 0) {
      throw new Error("No tickets remaining in allocation");
    }
    
    // Get affiliate program for commission
    const affiliateProgram = await ctx.db.get(args.affiliateId);
    if (!affiliateProgram) {
      throw new Error("Affiliate program not found");
    }
    
    // Create an inactive ticket
    const ticketNumber = `${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
    const ticketCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const ticketId = await ctx.db.insert("tickets", {
      eventId: args.eventId,
      userId: args.customerEmail, // Use email as temporary user ID
      purchasedAt: Date.now(),
      status: "pending" as any, // Ticket is inactive until verified
      paymentReference: args.paymentReference || `MANUAL-${Date.now()}`,
      amount: args.paymentAmount,
      ticketNumber,
      ticketCode,
      paymentMethod: args.paymentMethod as any,
      buyerEmail: args.customerEmail,
      buyerName: args.customerName,
      // Track affiliate
      referralCode: affiliateProgram.referralCode,
      affiliateCommission: affiliateProgram.commissionPerTicket,
    });
    
    // Create pending verification
    const verificationId = await ctx.db.insert("pendingTicketVerifications", {
      eventId: args.eventId,
      affiliateId: args.affiliateId,
      ticketId,
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      paymentMethod: args.paymentMethod,
      paymentAmount: args.paymentAmount,
      paymentReference: args.paymentReference,
      paymentNotes: args.paymentNotes,
      ticketStatus: "pending",
      verificationRequested: Date.now(),
      verificationDeadline: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      customerNotified: false,
      organizerNotified: false,
      remindersSent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update allocation stats
    await ctx.db.patch(allocation._id, {
      ticketsSold: allocation.ticketsSold + 1,
      ticketsRemaining: allocation.ticketsRemaining - 1,
      totalCollected: allocation.totalCollected + args.paymentAmount,
      totalCommissionEarned: allocation.totalCommissionEarned + affiliateProgram.commissionPerTicket,
      totalOwedToOrganizer: allocation.totalOwedToOrganizer + (args.paymentAmount - affiliateProgram.commissionPerTicket),
      lastSaleDate: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update affiliate program stats
    await ctx.db.patch(args.affiliateId, {
      totalSold: affiliateProgram.totalSold + 1,
      totalEarned: affiliateProgram.totalEarned + affiliateProgram.commissionPerTicket,
      outstandingBalance: affiliateProgram.outstandingBalance + affiliateProgram.commissionPerTicket,
    });
    
    return {
      success: true,
      ticketId,
      verificationId,
      ticketNumber,
      ticketCode,
      status: "pending_verification",
      message: "Sale recorded. Ticket will be activated after payment verification.",
    };
  },
});

// Verify a payment and activate the ticket
export const verifyAffiliatePayment = mutation({
  args: {
    verificationId: v.id("pendingTicketVerifications"),
    approved: v.boolean(),
    verifiedBy: v.string(), // Organizer ID
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new Error("Verification request not found");
    }
    
    if (verification.ticketStatus !== "pending") {
      throw new Error("This verification has already been processed");
    }
    
    const newStatus = args.approved ? "active" : "rejected";
    
    // Update verification record
    await ctx.db.patch(args.verificationId, {
      ticketStatus: newStatus,
      verifiedBy: args.verifiedBy,
      verifiedAt: Date.now(),
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });
    
    // Update ticket status
    await ctx.db.patch(verification.ticketId, {
      status: args.approved ? "valid" : "cancelled",
    });
    
    if (!args.approved && args.reason) {
      // If rejected, update allocation to restore the ticket
      const allocation = await ctx.db
        .query("affiliateTicketAllocations")
        .withIndex("by_affiliate", (q) => q.eq("affiliateId", verification.affiliateId))
        .filter((q) => q.eq(q.field("eventId"), verification.eventId))
        .first();
      
      if (allocation) {
        await ctx.db.patch(allocation._id, {
          ticketsSold: Math.max(0, allocation.ticketsSold - 1),
          ticketsRemaining: allocation.ticketsRemaining + 1,
          totalCollected: Math.max(0, allocation.totalCollected - verification.paymentAmount),
          updatedAt: Date.now(),
        });
      }
      
      // Update affiliate program stats
      const affiliateProgram = await ctx.db.get(verification.affiliateId);
      if (affiliateProgram) {
        await ctx.db.patch(verification.affiliateId, {
          totalSold: Math.max(0, affiliateProgram.totalSold - 1),
          totalEarned: Math.max(0, affiliateProgram.totalEarned - affiliateProgram.commissionPerTicket),
          outstandingBalance: Math.max(0, affiliateProgram.outstandingBalance - affiliateProgram.commissionPerTicket),
        });
      }
    }
    
    return {
      success: true,
      status: newStatus,
      message: args.approved 
        ? "Payment verified and ticket activated" 
        : `Payment rejected: ${args.reason}`,
    };
  },
});

// Get pending verifications for an organizer
export const getPendingVerifications = query({
  args: { 
    organizerId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    // Get all events for this organizer
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const eventIds = args.eventId ? [args.eventId] : events.map(e => e._id);
    
    // Get all pending verifications for these events
    const verifications = [];
    for (const eventId of eventIds) {
      const eventVerifications = await ctx.db
        .query("pendingTicketVerifications")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("ticketStatus"), "pending"))
        .collect();
      
      // Add event details
      const event = events.find(e => e._id === eventId);
      for (const verification of eventVerifications) {
        // Get affiliate details
        const affiliate = await ctx.db.get(verification.affiliateId);
        
        verifications.push({
          ...verification,
          eventName: event?.name || "Unknown Event",
          eventDate: event?.eventDate,
          affiliateName: affiliate?.affiliateName || "Unknown Affiliate",
          affiliateEmail: affiliate?.affiliateEmail,
          timeSinceRequest: Date.now() - verification.verificationRequested,
        });
      }
    }
    
    // Sort by request time (oldest first)
    verifications.sort((a, b) => a.verificationRequested - b.verificationRequested);
    
    return {
      verifications,
      total: verifications.length,
      stats: {
        last24Hours: verifications.filter(v => v.timeSinceRequest < 24 * 60 * 60 * 1000).length,
        last7Days: verifications.filter(v => v.timeSinceRequest < 7 * 24 * 60 * 60 * 1000).length,
        urgent: verifications.filter(v => v.timeSinceRequest > 12 * 60 * 60 * 1000).length,
      },
    };
  },
});

// Get allocations for an event
export const getEventAllocations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const allocations = await ctx.db
      .query("affiliateTicketAllocations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    // Get affiliate details for each allocation
    const allocationsWithDetails = [];
    for (const allocation of allocations) {
      const affiliate = await ctx.db.get(allocation.affiliateId);
      allocationsWithDetails.push({
        ...allocation,
        affiliateName: affiliate?.affiliateName || "Unknown",
        affiliateEmail: affiliate?.affiliateEmail || "",
        referralCode: affiliate?.referralCode || "",
        conversionRate: allocation.ticketsAllocated > 0 
          ? (allocation.ticketsSold / allocation.ticketsAllocated) * 100 
          : 0,
      });
    }
    
    // Calculate totals
    const totals = {
      totalAllocated: allocationsWithDetails.reduce((sum, a) => sum + a.ticketsAllocated, 0),
      totalSold: allocationsWithDetails.reduce((sum, a) => sum + a.ticketsSold, 0),
      totalRemaining: allocationsWithDetails.reduce((sum, a) => sum + a.ticketsRemaining, 0),
      totalCollected: allocationsWithDetails.reduce((sum, a) => sum + a.totalCollected, 0),
      totalCommissions: allocationsWithDetails.reduce((sum, a) => sum + a.totalCommissionEarned, 0),
    };
    
    return {
      allocations: allocationsWithDetails,
      totals,
    };
  },
});

// Get allocations for an affiliate
export const getAffiliateAllocations = query({
  args: { affiliateId: v.id("affiliatePrograms") },
  handler: async (ctx, args) => {
    const allocations = await ctx.db
      .query("affiliateTicketAllocations")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get event details for each allocation
    const allocationsWithEvents = [];
    for (const allocation of allocations) {
      const event = await ctx.db.get(allocation.eventId);
      allocationsWithEvents.push({
        ...allocation,
        eventName: event?.name || "Unknown Event",
        eventDate: event?.eventDate,
        eventLocation: event?.location,
        daysUntilEvent: event ? Math.ceil((event.eventDate - Date.now()) / (24 * 60 * 60 * 1000)) : 0,
      });
    }
    
    return {
      allocations: allocationsWithEvents,
      summary: {
        totalEvents: allocationsWithEvents.length,
        totalTicketsAvailable: allocationsWithEvents.reduce((sum, a) => sum + a.ticketsRemaining, 0),
        totalSold: allocationsWithEvents.reduce((sum, a) => sum + a.ticketsSold, 0),
        totalCommissionEarned: allocationsWithEvents.reduce((sum, a) => sum + a.totalCommissionEarned, 0),
        totalCommissionPaid: allocationsWithEvents.reduce((sum, a) => sum + a.totalPaidToAffiliate, 0),
        outstandingCommission: allocationsWithEvents.reduce((sum, a) => sum + a.outstandingBalance, 0),
      },
    };
  },
});