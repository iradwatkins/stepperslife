import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

// Trust level configuration
export const TRUST_LEVELS = {
  NEW: {
    name: "NEW",
    minScore: 0,
    maxEventValue: 1000,
    availableOptions: ["connect_collect"] as const,
    holdPeriod: 0, // No holding since they use own payment
    requiresVerification: false,
    maxTicketPrice: 100,
  },
  BASIC: {
    name: "BASIC",
    minScore: 30,
    maxEventValue: 5000,
    availableOptions: ["connect_collect", "premium"] as const,
    holdPeriod: 7, // 7 days for premium
    requiresVerification: true,
    maxTicketPrice: 250,
  },
  TRUSTED: {
    name: "TRUSTED",
    minScore: 60,
    maxEventValue: 25000,
    availableOptions: ["connect_collect", "premium", "split"] as const,
    holdPeriod: 5, // 5 days for premium
    requiresVerification: true,
    maxTicketPrice: 500,
  },
  VIP: {
    name: "VIP",
    minScore: 85,
    maxEventValue: 100000,
    availableOptions: ["connect_collect", "premium", "split"] as const,
    holdPeriod: 3, // 3 days for premium
    requiresVerification: true,
    maxTicketPrice: 1000,
    instantPayoutAvailable: true,
  },
};

// Calculate trust score based on various metrics
export const calculateTrustScore = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    // Get organizer's events
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    // Get completed events (past date)
    const now = Date.now();
    const completedEvents = events.filter(e => e.eventDate < now && !e.is_cancelled);
    
    // Get tickets sold
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    // Calculate metrics
    const eventsCompleted = completedEvents.length;
    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Get user account age
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.organizerId))
      .first();
    
    // Base score calculation
    let score = 0;
    
    // Events completed (max 30 points)
    if (eventsCompleted >= 10) score += 30;
    else if (eventsCompleted >= 5) score += 20;
    else if (eventsCompleted >= 3) score += 15;
    else if (eventsCompleted >= 1) score += 10;
    
    // Tickets sold (max 25 points)
    if (totalTicketsSold >= 1000) score += 25;
    else if (totalTicketsSold >= 500) score += 20;
    else if (totalTicketsSold >= 100) score += 15;
    else if (totalTicketsSold >= 50) score += 10;
    else if (totalTicketsSold >= 10) score += 5;
    
    // Revenue generated (max 25 points)
    if (totalRevenue >= 50000) score += 25;
    else if (totalRevenue >= 20000) score += 20;
    else if (totalRevenue >= 10000) score += 15;
    else if (totalRevenue >= 5000) score += 10;
    else if (totalRevenue >= 1000) score += 5;
    
    // Account age (max 10 points)
    const accountAgeDays = user ? Math.floor((now - (user as any).createdAt) / (1000 * 60 * 60 * 24)) : 0;
    if (accountAgeDays >= 365) score += 10;
    else if (accountAgeDays >= 180) score += 7;
    else if (accountAgeDays >= 90) score += 5;
    else if (accountAgeDays >= 30) score += 3;
    
    // No chargebacks bonus (10 points)
    // We'll check chargeback count when that table has data
    score += 10; // For now, assume no chargebacks
    
    // Cap at 100
    score = Math.min(score, 100);
    
    return {
      score,
      eventsCompleted,
      totalTicketsSold,
      totalRevenue,
      accountAgeDays,
    };
  },
});

// Get organizer's trust level based on score
export const getOrganizerTrustLevel = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    // Check if we have a trust record
    let trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Calculate score inline to avoid circular dependency
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const now = Date.now();
    const completedEvents = events.filter(e => e.eventDate < now && !e.is_cancelled);
    
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.organizerId))
      .first();
    
    const accountAgeDays = user ? Math.floor((now - (user as any).createdAt) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate score
    let score = 0;
    
    const eventsCompletedCount = completedEvents.length;
    if (eventsCompletedCount >= 10) score += 30;
    else if (eventsCompletedCount >= 5) score += 20;
    else if (eventsCompletedCount >= 3) score += 15;
    else if (eventsCompletedCount >= 1) score += 10;
    
    if (totalTicketsSold >= 1000) score += 25;
    else if (totalTicketsSold >= 500) score += 20;
    else if (totalTicketsSold >= 100) score += 15;
    else if (totalTicketsSold >= 50) score += 10;
    else if (totalTicketsSold >= 10) score += 5;
    
    if (totalRevenue >= 50000) score += 25;
    else if (totalRevenue >= 20000) score += 20;
    else if (totalRevenue >= 10000) score += 15;
    else if (totalRevenue >= 5000) score += 10;
    else if (totalRevenue >= 1000) score += 5;
    
    if (accountAgeDays >= 365) score += 10;
    else if (accountAgeDays >= 180) score += 7;
    else if (accountAgeDays >= 90) score += 5;
    else if (accountAgeDays >= 30) score += 3;
    
    score += 10; // No chargebacks bonus
    score = Math.min(score, 100);
    
    // Determine trust level based on score
    let trustLevel: keyof typeof TRUST_LEVELS = "NEW";
    if (score >= TRUST_LEVELS.VIP.minScore) {
      trustLevel = "VIP";
    } else if (score >= TRUST_LEVELS.TRUSTED.minScore) {
      trustLevel = "TRUSTED";
    } else if (score >= TRUST_LEVELS.BASIC.minScore) {
      trustLevel = "BASIC";
    }
    
    const level = TRUST_LEVELS[trustLevel];
    
    return {
      trustLevel,
      trustScore: score,
      ...level,
      metrics: {
        score,
        eventsCompleted: eventsCompletedCount,
        totalTicketsSold,
        totalRevenue,
        accountAgeDays
      },
      hasRecord: !!trustRecord,
    };
  },
});

// Initialize or update organizer trust record
export const updateOrganizerTrust = mutation({
  args: { 
    organizerId: v.string(),
    forceRecalculate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get existing record
    const existing = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Calculate current metrics
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const now = Date.now();
    const completedEvents = events.filter(e => e.eventDate < now && !e.is_cancelled);
    
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.organizerId))
      .first();
    
    const accountAgeDays = user ? Math.floor((now - (user as any).createdAt) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate trust score
    let score = 0;
    
    // Events completed (max 30 points)
    const eventsCompleted = completedEvents.length;
    if (eventsCompleted >= 10) score += 30;
    else if (eventsCompleted >= 5) score += 20;
    else if (eventsCompleted >= 3) score += 15;
    else if (eventsCompleted >= 1) score += 10;
    
    // Tickets sold (max 25 points)
    const totalTicketsSold = tickets.length;
    if (totalTicketsSold >= 1000) score += 25;
    else if (totalTicketsSold >= 500) score += 20;
    else if (totalTicketsSold >= 100) score += 15;
    else if (totalTicketsSold >= 50) score += 10;
    else if (totalTicketsSold >= 10) score += 5;
    
    // Revenue (max 25 points)
    if (totalRevenue >= 50000) score += 25;
    else if (totalRevenue >= 20000) score += 20;
    else if (totalRevenue >= 10000) score += 15;
    else if (totalRevenue >= 5000) score += 10;
    else if (totalRevenue >= 1000) score += 5;
    
    // Account age (max 10 points)
    if (accountAgeDays >= 365) score += 10;
    else if (accountAgeDays >= 180) score += 7;
    else if (accountAgeDays >= 90) score += 5;
    else if (accountAgeDays >= 30) score += 3;
    
    // No chargebacks bonus (10 points)
    score += 10; // For now, assume no chargebacks
    
    score = Math.min(score, 100);
    
    // Determine trust level
    let trustLevel: "NEW" | "BASIC" | "TRUSTED" | "VIP" = "NEW";
    if (score >= 85) trustLevel = "VIP";
    else if (score >= 60) trustLevel = "TRUSTED";
    else if (score >= 30) trustLevel = "BASIC";
    
    const level = TRUST_LEVELS[trustLevel];
    
    // Prepare trust record data
    const trustData = {
      trustLevel,
      trustScore: score,
      eventsCompleted: eventsCompleted,
      totalRevenue: totalRevenue,
      lifetimeTicketsSold: totalTicketsSold,
      chargebackCount: 0, // Will update when we have chargeback data
      chargebackRate: 0,
      disputeCount: 0,
      refundCount: 0,
      accountAge: accountAgeDays,
      lastEventDate: completedEvents.length > 0 
        ? Math.max(...completedEvents.map(e => e.eventDate))
        : undefined,
      averageEventValue: eventsCompleted > 0 ? totalRevenue / eventsCompleted : 0,
      maxEventValue: level.maxEventValue,
      maxTicketPrice: level.maxTicketPrice,
      holdPeriod: level.holdPeriod,
      availableOptions: [...level.availableOptions],
      instantPayoutEligible: trustLevel === "VIP",
      reducedFees: score >= 75,
      prioritySupport: trustLevel === "VIP" || trustLevel === "TRUSTED",
      updatedAt: now,
    };
    
    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, trustData);
      return { 
        action: "updated", 
        trustLevel,
        trustScore: score,
        previousLevel: existing.trustLevel,
        previousScore: existing.trustScore,
      };
    } else {
      // Create new record
      await ctx.db.insert("organizerTrust", {
        organizerId: args.organizerId,
        ...trustData,
        createdAt: now,
      });
      return { 
        action: "created",
        trustLevel,
        trustScore: score,
      };
    }
  },
});

// Get available payment options for an organizer
export const getAvailablePaymentOptions = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    // Calculate trust level inline
    const trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const now = Date.now();
    const completedEvents = events.filter(e => e.eventDate < now && !e.is_cancelled);
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.organizerId))
      .collect();
    
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.organizerId))
      .first();
    
    const accountAgeDays = user ? Math.floor((now - (user as any).createdAt) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate score
    let score = 0;
    const eventsCompletedCount = completedEvents.length;
    const totalTicketsSold = tickets.length;
    
    if (eventsCompletedCount >= 10) score += 30;
    else if (eventsCompletedCount >= 5) score += 20;
    else if (eventsCompletedCount >= 3) score += 15;
    else if (eventsCompletedCount >= 1) score += 10;
    
    if (totalTicketsSold >= 1000) score += 25;
    else if (totalTicketsSold >= 500) score += 20;
    else if (totalTicketsSold >= 100) score += 15;
    else if (totalTicketsSold >= 50) score += 10;
    else if (totalTicketsSold >= 10) score += 5;
    
    if (totalRevenue >= 50000) score += 25;
    else if (totalRevenue >= 20000) score += 20;
    else if (totalRevenue >= 10000) score += 15;
    else if (totalRevenue >= 5000) score += 10;
    else if (totalRevenue >= 1000) score += 5;
    
    if (accountAgeDays >= 365) score += 10;
    else if (accountAgeDays >= 180) score += 7;
    else if (accountAgeDays >= 90) score += 5;
    else if (accountAgeDays >= 30) score += 3;
    
    score += 10;
    score = Math.min(score, 100);
    
    // Determine trust level
    let trustLevelName: keyof typeof TRUST_LEVELS = "NEW";
    if (score >= TRUST_LEVELS.VIP.minScore) {
      trustLevelName = "VIP";
    } else if (score >= TRUST_LEVELS.TRUSTED.minScore) {
      trustLevelName = "TRUSTED";
    } else if (score >= TRUST_LEVELS.BASIC.minScore) {
      trustLevelName = "BASIC";
    }
    
    const trustLevel = TRUST_LEVELS[trustLevelName];
    
    const options = [];
    
    // Option 1: Connect Your Payment - Always available
    options.push({
      id: "connect_collect",
      name: "Connect Your Payment",
      description: "Use your Stripe, Square, or PayPal account",
      fee: "$2.00 per ticket",
      feeType: "fixed",
      pros: [
        "Instant payouts",
        "You control refunds",
        "Lowest fees",
      ],
      cons: [
        "You handle disputes",
        "Need payment account",
      ],
      available: true,
      locked: false,
      requirements: [],
    });
    
    // Option 2: Split Payments - Now second, always available
    options.push({
      id: "split",
      name: "Split Payments",
      description: "Automatic revenue sharing",
      fee: "10% or $2.50 per ticket",
      feeType: "split",
      pros: [
        "Instant split",
        "Perfect for partners",
        "Automated accounting",
      ],
      cons: [
        "Requires Stripe/Square",
        "More complex setup",
      ],
      available: true,
      locked: false,
      requirements: [],
    });
    
    // Option 3: SteppersLife Premium - Now third, always available
    options.push({
      id: "premium",
      name: "SteppersLife Premium",
      description: "We handle everything",
      fee: "6.6% + $1.79 per ticket",
      feeType: "percentage",
      pros: [
        "We handle disputes",
        "No payment account needed",
        "Professional checkout",
      ],
      cons: [
        "Higher fees",
        `${trustLevel.holdPeriod}-day payout delay`,
      ],
      available: true,
      locked: false,
      requirements: [],
    });
    
    return {
      trustLevel: trustLevelName,
      trustScore: score,
      options,
      limits: {
        maxEventValue: trustLevel.maxEventValue,
        maxTicketPrice: trustLevel.maxTicketPrice,
        holdPeriod: trustLevel.holdPeriod,
      },
      privileges: {
        instantPayout: trustLevelName === "VIP",
        reducedFees: score >= 75,
        prioritySupport: trustLevelName === "VIP" || trustLevelName === "TRUSTED",
      },
    };
  },
});

// Check if organizer can use a specific payment model
export const canUsePaymentModel = query({
  args: {
    organizerId: v.string(),
    paymentModel: v.union(
      v.literal("connect_collect"),
      v.literal("premium"),
      v.literal("split")
    ),
  },
  handler: async (ctx, args) => {
    // All payment models are now available to all organizers
    // Return simplified response without circular dependency
    return {
      allowed: true,
      reason: undefined,
      requirements: [],
      trustLevel: "BASIC", // Default trust level
      trustScore: 50, // Default score
    };
  },
});