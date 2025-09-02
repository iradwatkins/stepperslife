import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      const eventAffiliates = await ctx.db
        .query("eventAffiliates")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      
      // Get sales data for each affiliate
      for (const affiliate of eventAffiliates) {
        // Count tickets sold through this affiliate's referral code
        const referralTickets = await ctx.db
          .query("simpleTickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .filter((q) => q.eq(q.field("referralCode"), affiliate.referralCode))
          .collect();
        
        const affiliateSales = referralTickets.length;
        const commissionEarned = referralTickets.reduce((sum, ticket) => {
          return sum + (ticket.affiliateCommission || 0);
        }, 0);
        
        totalReferralSales += affiliateSales;
        totalCommissionPaid += commissionEarned;
        
        allAffiliates.push({
          ...affiliate,
          eventName: event.name,
          eventId: event._id,
          sales: affiliateSales,
          commission: commissionEarned
        });
      }
    }
    
    // Deduplicate affiliates by email
    const uniqueAffiliates = Array.from(
      new Map(allAffiliates.map(a => [a.email, a])).values()
    );
    
    return {
      affiliates: uniqueAffiliates,
      stats: {
        activeAffiliates: uniqueAffiliates.length,
        referralSales: totalReferralSales,
        commissionPaid: totalCommissionPaid
      }
    };
  },
});

// Create an affiliate for an event
export const createAffiliate = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    commissionRate: v.number(), // Percentage (e.g., 10 for 10%)
    commissionType: v.union(v.literal("percentage"), v.literal("fixed")),
    fixedCommission: v.optional(v.number()), // Fixed amount per ticket if type is "fixed"
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
        .query("eventAffiliates")
        .filter((q) => q.eq(q.field("referralCode"), referralCode))
        .first();
      
      if (!existing) break;
      
      referralCode = generateCode();
      attempts++;
    }
    
    // Create the affiliate
    const affiliateId = await ctx.db.insert("eventAffiliates", {
      eventId: args.eventId,
      name: args.name,
      email: args.email,
      referralCode,
      commissionRate: args.commissionRate,
      commissionType: args.commissionType,
      fixedCommission: args.fixedCommission,
      isActive: true,
      createdAt: Date.now(),
      sales: 0,
      revenue: 0,
      commissionEarned: 0,
    });
    
    return { affiliateId, referralCode };
  },
});

// Update affiliate status
export const updateAffiliateStatus = mutation({
  args: {
    affiliateId: v.id("eventAffiliates"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.affiliateId, {
      isActive: args.isActive,
    });
  },
});

// Delete affiliate
export const deleteAffiliate = mutation({
  args: {
    affiliateId: v.id("eventAffiliates"),
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
      .query("eventAffiliates")
      .filter((q) => q.eq(q.field("referralCode"), referralCode))
      .first();
  },
});

// Track affiliate sale
export const trackAffiliateSale = mutation({
  args: {
    referralCode: v.string(),
    ticketPrice: v.number(),
    ticketId: v.id("simpleTickets"),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("eventAffiliates")
      .filter((q) => q.eq(q.field("referralCode"), args.referralCode))
      .first();
    
    if (!affiliate || !affiliate.isActive) {
      return { success: false, message: "Invalid or inactive referral code" };
    }
    
    // Calculate commission
    let commission = 0;
    if (affiliate.commissionType === "percentage") {
      commission = (args.ticketPrice * affiliate.commissionRate) / 100;
    } else {
      commission = affiliate.fixedCommission || 0;
    }
    
    // Update affiliate stats
    await ctx.db.patch(affiliate._id, {
      sales: (affiliate.sales || 0) + 1,
      revenue: (affiliate.revenue || 0) + args.ticketPrice,
      commissionEarned: (affiliate.commissionEarned || 0) + commission,
    });
    
    // Update ticket with affiliate info
    await ctx.db.patch(args.ticketId, {
      referralCode: args.referralCode,
      affiliateCommission: commission,
    });
    
    return { success: true, commission };
  },
});