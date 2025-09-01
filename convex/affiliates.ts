import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create an affiliate program for an event
export const createAffiliateProgram = mutation({
  args: {
    eventId: v.id("events"),
    affiliateEmail: v.string(),
    affiliateName: v.string(),
    commissionPerTicket: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the creator is the event organizer
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    if (event.userId !== args.createdBy) {
      throw new Error("Only event organizer can create affiliate programs");
    }

    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.affiliateEmail))
      .first();
    
    if (!user) {
      return { 
        success: false, 
        message: "User not found. They need to register first." 
      };
    }

    // Check if affiliate program already exists
    const existing = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("affiliateUserId"), user.userId))
      .first();
    
    if (existing) {
      return { 
        success: false, 
        message: "Affiliate program already exists for this user" 
      };
    }

    // Generate unique referral code
    const eventName = event.name.substring(0, 8).toUpperCase().replace(/\s+/g, '');
    const userName = args.affiliateName.substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const referralCode = `${userName}-${eventName}-${random}`;

    // Create affiliate program
    const affiliateId = await ctx.db.insert("affiliatePrograms", {
      eventId: args.eventId,
      affiliateUserId: user.userId,
      affiliateEmail: args.affiliateEmail,
      affiliateName: args.affiliateName,
      referralCode,
      commissionPerTicket: args.commissionPerTicket,
      totalSold: 0,
      totalEarned: 0,
      isActive: true,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    return { 
      success: true, 
      affiliateId,
      referralCode,
      referralLink: `https://stepperslife.com/events/${args.eventId}?ref=${referralCode}`
    };
  },
});

// Get affiliate programs for an event
export const getEventAffiliates = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const affiliates = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    return affiliates;
  },
});

// Get affiliate programs for a user
export const getUserAffiliatePrograms = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const programs = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get event details for each program
    const programsWithEvents = await Promise.all(
      programs.map(async (program) => {
        const event = await ctx.db.get(program.eventId);
        return {
          ...program,
          eventName: event?.name || "Unknown Event",
          eventDate: event?.eventDate,
          referralLink: `https://stepperslife.com/events/${program.eventId}?ref=${program.referralCode}`
        };
      })
    );
    
    return programsWithEvents;
  },
});

// Internal mutation for tracking affiliate sales
export const trackAffiliateSaleInternal = internalMutation({
  args: {
    ticketId: v.id("tickets"),
    referralCode: v.string(),
    ticketPrice: v.number(),
  },
  handler: async (ctx, args) => {
    return trackAffiliateSaleHandler(ctx, args);
  },
});

// Track a sale through affiliate
export const trackAffiliateSale = mutation({
  args: {
    ticketId: v.id("tickets"),
    referralCode: v.string(),
    ticketPrice: v.number(),
  },
  handler: async (ctx, args) => {
    return trackAffiliateSaleHandler(ctx, args);
  },
});

// Shared handler for tracking affiliate sales
async function trackAffiliateSaleHandler(ctx: any, args: {
  ticketId: Id<"tickets">,
  referralCode: string,
  ticketPrice: number,
}) {
    // Find affiliate program by referral code
    const affiliate = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_referral_code", (q: any) => q.eq("referralCode", args.referralCode))
      .first();
    
    if (!affiliate || !affiliate.isActive) {
      return { success: false, message: "Invalid or inactive referral code" };
    }

    // Update ticket with affiliate info
    await ctx.db.patch(args.ticketId, {
      referralCode: args.referralCode,
      affiliateCommission: affiliate.commissionPerTicket,
    });

    // Update affiliate stats
    await ctx.db.patch(affiliate._id, {
      totalSold: affiliate.totalSold + 1,
      totalEarned: affiliate.totalEarned + affiliate.commissionPerTicket,
    });

    // Update seller balance
    const sellerBalance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q: any) => q.eq("userId", affiliate.affiliateUserId))
      .first();
    
    if (sellerBalance) {
      await ctx.db.patch(sellerBalance._id, {
        availableBalance: sellerBalance.availableBalance + affiliate.commissionPerTicket,
        totalEarnings: sellerBalance.totalEarnings + affiliate.commissionPerTicket,
      });
    } else {
      // Create new seller balance
      await ctx.db.insert("sellerBalances", {
        userId: affiliate.affiliateUserId,
        availableBalance: affiliate.commissionPerTicket,
        pendingBalance: 0,
        totalEarnings: affiliate.commissionPerTicket,
        totalPayouts: 0,
      });
    }

    return { 
      success: true, 
      commission: affiliate.commissionPerTicket,
      affiliateName: affiliate.affiliateName
    };
}

// Get affiliate stats
export const getAffiliateStats = query({
  args: { 
    affiliateUserId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("affiliatePrograms")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", args.affiliateUserId));
    
    if (args.eventId) {
      query = query.filter((q) => q.eq(q.field("eventId"), args.eventId));
    }
    
    const programs = await query.collect();
    
    // Calculate totals
    const stats = {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.isActive).length,
      totalTicketsSold: programs.reduce((sum, p) => sum + p.totalSold, 0),
      totalEarnings: programs.reduce((sum, p) => sum + p.totalEarned, 0),
      programs: programs,
    };
    
    return stats;
  },
});

// Deactivate affiliate program
export const deactivateAffiliateProgram = mutation({
  args: {
    affiliateProgramId: v.id("affiliatePrograms"),
    deactivatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const program = await ctx.db.get(args.affiliateProgramId);
    if (!program) {
      throw new Error("Affiliate program not found");
    }

    // Verify permission (only creator can deactivate)
    if (program.createdBy !== args.deactivatedBy) {
      throw new Error("Only the organizer can deactivate affiliate programs");
    }

    await ctx.db.patch(args.affiliateProgramId, {
      isActive: false,
      deactivatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update commission rate
export const updateCommissionRate = mutation({
  args: {
    affiliateProgramId: v.id("affiliatePrograms"),
    newCommissionPerTicket: v.number(),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const program = await ctx.db.get(args.affiliateProgramId);
    if (!program) {
      throw new Error("Affiliate program not found");
    }

    // Verify permission
    if (program.createdBy !== args.updatedBy) {
      throw new Error("Only the organizer can update commission rates");
    }

    await ctx.db.patch(args.affiliateProgramId, {
      commissionPerTicket: args.newCommissionPerTicket,
    });

    return { success: true };
  },
});