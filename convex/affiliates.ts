import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get affiliates for an organizer
export const getOrganizerAffiliates = query({
  args: { organizerId: v.string() },
  handler: async (ctx, { organizerId }) => {
    // Get all events by this organizer
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", organizerId))
      .collect();
    
    if (events.length === 0) {
      return {
        affiliates: [],
        stats: {
          activeAffiliates: 0,
          referralSales: 0,
          commissionPaid: 0
        }
      };
    }
    
    // Get all affiliates across all events
    const allAffiliates = [];
    let totalReferralSales = 0;
    let totalCommissionPaid = 0;
    
    for (const event of events) {
      const affiliatePrograms = await ctx.db
        .query("affiliatePrograms")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      
      // Get sales data for each affiliate
      for (const affiliate of affiliatePrograms) {
        // Use the totalSold and totalEarned fields that are already tracked
        totalReferralSales += affiliate.totalSold;
        totalCommissionPaid += affiliate.totalEarned;
        
        allAffiliates.push({
          ...affiliate,
          eventName: event.name,
          eventId: event._id,
          eventDate: event.eventDate,
          sales: affiliate.totalSold,
          commission: affiliate.totalEarned
        });
      }
    }
    
    // Count only active affiliates
    const activeAffiliates = allAffiliates.filter(a => a.isActive);
    
    return {
      affiliates: allAffiliates,
      stats: {
        activeAffiliates: activeAffiliates.length,
        referralSales: totalReferralSales,
        commissionPaid: totalCommissionPaid
      }
    };
  },
});

// Record affiliate payout
export const recordAffiliatePayout = mutation({
  args: {
    affiliateId: v.id("affiliatePrograms"),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("zelle"),
      v.literal("venmo"),
      v.literal("paypal"),
      v.literal("check"),
      v.literal("bank_transfer"),
      v.literal("other")
    ),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");
    
    // Create payout record
    const payoutId = await ctx.db.insert("affiliatePayouts", {
      affiliateId: args.affiliateId,
      eventId: affiliate.eventId,
      organizerId: affiliate.createdBy,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      notes: args.notes,
      isPaid: true,
      paidAt: Date.now(),
      confirmedByAffiliate: false,
      createdAt: Date.now(),
    });
    
    // Update affiliate balance
    const newTotalPaidOut = (affiliate.totalPaidOut || 0) + args.amount;
    const newOutstandingBalance = affiliate.totalEarned - newTotalPaidOut;
    
    await ctx.db.patch(args.affiliateId, {
      totalPaidOut: newTotalPaidOut,
      lastPayoutDate: Date.now(),
      outstandingBalance: newOutstandingBalance,
    });
    
    return {
      success: true,
      payoutId,
      message: `Payout of $${args.amount.toFixed(2)} recorded for ${affiliate.affiliateName}`,
      newBalance: newOutstandingBalance,
    };
  },
});

// Affiliate confirms payout receipt
export const confirmPayoutReceived = mutation({
  args: {
    payoutId: v.id("affiliatePayouts"),
    confirmed: v.boolean(),
    disputeReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.payoutId, {
      confirmedByAffiliate: args.confirmed,
      confirmedAt: Date.now(),
      disputeReason: args.disputeReason,
    });
    
    return {
      success: true,
      message: args.confirmed 
        ? "Payment confirmation recorded" 
        : "Payment dispute recorded. The organizer will be notified.",
    };
  },
});

// Get affiliate payout history
export const getAffiliatePayouts = query({
  args: { 
    affiliateId: v.optional(v.id("affiliatePrograms")),
    organizerId: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("affiliatePayouts");
    
    if (args.affiliateId) {
      query = query.withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId));
    } else if (args.organizerId) {
      query = query.withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId));
    } else if (args.eventId) {
      query = query.withIndex("by_event", (q) => q.eq("eventId", args.eventId));
    }
    
    const payouts = await query.order("desc").collect();
    
    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const confirmedPayouts = payouts.filter(p => p.confirmedByAffiliate);
    const disputedPayouts = payouts.filter(p => p.disputeReason);
    
    return {
      payouts,
      stats: {
        totalPaid,
        payoutCount: payouts.length,
        confirmedCount: confirmedPayouts.length,
        disputedCount: disputedPayouts.length,
      }
    };
  },
});

// Track social media share
export const trackAffiliateShare = mutation({
  args: {
    affiliateId: v.id("affiliatePrograms"),
    platform: v.union(
      v.literal("whatsapp"),
      v.literal("facebook"),
      v.literal("twitter"),
      v.literal("email"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");
    
    const currentShares = affiliate.sharesByPlatform || {};
    const platformShares = currentShares[args.platform] || 0;
    
    await ctx.db.patch(args.affiliateId, {
      totalShares: (affiliate.totalShares || 0) + 1,
      sharesByPlatform: {
        ...currentShares,
        [args.platform]: platformShares + 1,
      },
    });
    
    return { success: true };
  },
});

// Create an affiliate for an event
export const createAffiliate = mutation({
  args: {
    eventId: v.id("events"),
    affiliateName: v.string(),
    affiliateEmail: v.string(),
    commissionPerTicket: v.number(), // Fixed amount per ticket
    organizerId: v.string(), // The organizer creating this affiliate
  },
  handler: async (ctx, args) => {
    // Generate unique referral code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    };
    
    let referralCode = generateCode();
    
    // Ensure code is unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await ctx.db
        .query("affiliatePrograms")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
        .first();
      
      if (!existing) break;
      
      referralCode = generateCode();
      attempts++;
    }
    
    // Create the affiliate program
    const affiliateId = await ctx.db.insert("affiliatePrograms", {
      eventId: args.eventId,
      affiliateName: args.affiliateName,
      affiliateEmail: args.affiliateEmail,
      affiliateUserId: "", // Will be filled when affiliate user claims this
      referralCode,
      commissionPerTicket: args.commissionPerTicket,
      totalSold: 0,
      totalEarned: 0,
      totalPaidOut: 0, // Initialize payout tracking
      outstandingBalance: 0, // Initialize outstanding balance
      isActive: true,
      createdBy: args.organizerId,
      createdAt: Date.now(),
    });
    
    return { affiliateId, referralCode };
  },
});

// Update affiliate status
export const updateAffiliateStatus = mutation({
  args: {
    affiliateId: v.id("affiliatePrograms"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.affiliateId, {
      isActive: args.isActive,
      deactivatedAt: args.isActive ? undefined : Date.now(),
    });
  },
});

// Delete affiliate
export const deleteAffiliate = mutation({
  args: {
    affiliateId: v.id("affiliatePrograms"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.affiliateId);
  },
});

// Get affiliate by referral code
export const getAffiliateByCode = query({
  args: { referralCode: v.string() },
  handler: async (ctx, { referralCode }) => {
    return await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
      .first();
  },
});

// Track affiliate sale (called internally from purchases)
export const trackAffiliateSaleInternal = internalMutation({
  args: {
    ticketId: v.id("tickets"),
    referralCode: v.string(),
    ticketPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();
    
    if (!affiliate || !affiliate.isActive) {
      return { success: false, message: "Invalid or inactive referral code" };
    }
    
    // Calculate commission (fixed per ticket)
    const commission = affiliate.commissionPerTicket;
    
    // Update affiliate stats
    await ctx.db.patch(affiliate._id, {
      totalSold: affiliate.totalSold + 1,
      totalEarned: affiliate.totalEarned + commission,
    });
    
    // Update ticket with affiliate info
    await ctx.db.patch(args.ticketId, {
      referralCode: args.referralCode,
      affiliateCommission: commission,
    });
    
    return { success: true, commission };
  },
});

// Get affiliate programs for a specific user (affiliate side)
export const getUserAffiliatePrograms = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const programs = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", userId))
      .collect();
    
    // Add event details and generate referral links
    const programsWithDetails = await Promise.all(
      programs.map(async (program) => {
        const event = await ctx.db.get(program.eventId);
        if (!event) return null;
        
        return {
          ...program,
          eventName: event.name,
          eventDate: event.eventDate,
          eventLocation: event.location,
          referralLink: `https://stepperslife.com/event/${program.eventId}?ref=${program.referralCode}`,
        };
      })
    );
    
    return programsWithDetails.filter(p => p !== null);
  },
});

// Get affiliate stats for a user
export const getAffiliateStats = query({
  args: { affiliateUserId: v.string() },
  handler: async (ctx, { affiliateUserId }) => {
    const programs = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", affiliateUserId))
      .collect();
    
    const activePrograms = programs.filter(p => p.isActive).length;
    const totalTicketsSold = programs.reduce((sum, p) => sum + p.totalSold, 0);
    const totalEarnings = programs.reduce((sum, p) => sum + p.totalEarned, 0);
    
    return {
      activePrograms,
      totalTicketsSold,
      totalEarnings,
    };
  },
});

// Get affiliates for a specific event
export const getEventAffiliates = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const affiliates = await ctx.db
      .query("affiliatePrograms")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    
    return affiliates.map(affiliate => ({
      ...affiliate,
      referralLink: `https://stepperslife.com/event/${eventId}?ref=${affiliate.referralCode}`,
    }));
  },
});