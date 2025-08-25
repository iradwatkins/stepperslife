import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Record a new transaction with $1 per ticket platform fee
export const recordTransaction = mutation({
  args: {
    eventId: v.id("events"),
    eventName: v.string(),
    ticketId: v.id("tickets"),
    sellerId: v.string(),
    buyerId: v.string(),
    buyerEmail: v.string(),
    amount: v.number(),
    ticketCount: v.number(), // Number of tickets for fee calculation
    paymentProvider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal"),
      v.literal("zelle")
    ),
    paymentId: v.string(),
    paymentDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate fees
    const platformFee = args.ticketCount * 1.50; // $1.50 per ticket
    
    // Calculate provider fees
    let providerFee = 0;
    switch (args.paymentProvider) {
      case "square":
        providerFee = args.amount * 0.026 + 0.10;
        break;
      case "stripe":
        providerFee = args.amount * 0.029 + 0.30;
        break;
      case "paypal":
        providerFee = args.amount * 0.0289 + 0.49;
        break;
      case "zelle":
        providerFee = 0;
        break;
    }
    
    const sellerPayout = args.amount - platformFee - providerFee;
    
    // Create transaction record
    const transactionId = await ctx.db.insert("platformTransactions", {
      eventId: args.eventId,
      eventName: args.eventName,
      ticketId: args.ticketId,
      sellerId: args.sellerId,
      buyerId: args.buyerId,
      buyerEmail: args.buyerEmail,
      amount: args.amount,
      ticketCount: args.ticketCount,
      platformFee,
      sellerPayout,
      status: "pending",
      paymentId: args.paymentId,
      paymentProvider: args.paymentProvider,
      paymentDetails: args.paymentDetails,
      createdAt: Date.now(),
    });
    
    // Update seller balance
    await updateSellerBalance(ctx, args.sellerId, sellerPayout, "pending");
    
    return { 
      transactionId,
      platformFee,
      providerFee,
      sellerPayout,
      ticketCount: args.ticketCount
    };
  },
});

// Update transaction status (e.g., after webhook confirmation)
export const updateTransactionStatus = mutation({
  args: {
    paymentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    // Find transaction by payment ID
    const transaction = await ctx.db
      .query("platformTransactions")
      .filter((q) => q.eq(q.field("paymentId"), args.paymentId))
      .first();
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    // Update transaction status
    await ctx.db.patch(transaction._id, {
      status: args.status,
    });
    
    // Update seller balance based on status change
    if (args.status === "completed" && transaction.status === "pending") {
      // Move from pending to available balance
      await updateSellerBalance(ctx, transaction.sellerId, transaction.sellerPayout, "completed");
    } else if (args.status === "refunded") {
      // Deduct from seller balance
      await updateSellerBalance(ctx, transaction.sellerId, -transaction.sellerPayout, "refunded");
      
      // Record refund details
      await ctx.db.patch(transaction._id, {
        refundAmount: transaction.amount,
        refundedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Get seller's transaction history
export const getSellerTransactions = query({
  args: {
    sellerId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("platformTransactions")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId));
    
    if (args.status) {
      const allTransactions = await query.collect();
      const filtered = allTransactions.filter(t => t.status === args.status);
      const limited = args.limit ? filtered.slice(0, args.limit) : filtered;
      return limited.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    const transactions = await query.collect();
    const sorted = transactions.sort((a, b) => b.createdAt - a.createdAt);
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});

// Get transaction analytics for seller
export const getSellerAnalytics = query({
  args: {
    sellerId: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("platformTransactions")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .collect();
    
    // Filter by date range if provided
    const filtered = transactions.filter(t => {
      if (args.startDate && t.createdAt < args.startDate) return false;
      if (args.endDate && t.createdAt > args.endDate) return false;
      return true;
    });
    
    // Calculate analytics
    const analytics = {
      totalTransactions: filtered.length,
      totalTicketsSold: filtered.reduce((sum, t) => sum + (t.ticketCount || 0), 0),
      totalRevenue: filtered.reduce((sum, t) => sum + t.amount, 0),
      totalPlatformFees: filtered.reduce((sum, t) => sum + t.platformFee, 0),
      totalSellerPayouts: filtered.reduce((sum, t) => sum + t.sellerPayout, 0),
      averageTicketPrice: 0,
      averagePlatformFeePerTicket: 1.50, // Always $1.50 per ticket
      
      // By status
      pendingCount: filtered.filter(t => t.status === "pending").length,
      completedCount: filtered.filter(t => t.status === "completed").length,
      refundedCount: filtered.filter(t => t.status === "refunded").length,
      
      // By provider
      providerBreakdown: {} as Record<string, {
        count: number;
        revenue: number;
        ticketCount: number;
      }>,
    };
    
    // Calculate average ticket price
    if (analytics.totalTicketsSold > 0) {
      analytics.averageTicketPrice = analytics.totalRevenue / analytics.totalTicketsSold;
    }
    
    // Calculate provider breakdown
    const providers = ["stripe", "square", "paypal", "zelle"];
    for (const provider of providers) {
      const providerTxs = filtered.filter(t => t.paymentProvider === provider);
      analytics.providerBreakdown[provider] = {
        count: providerTxs.length,
        revenue: providerTxs.reduce((sum, t) => sum + t.sellerPayout, 0),
        ticketCount: providerTxs.reduce((sum, t) => sum + (t.ticketCount || 0), 0),
      };
    }
    
    return analytics;
  },
});

// Helper function to update seller balance
async function updateSellerBalance(
  ctx: any,
  sellerId: string,
  amount: number,
  operation: "pending" | "completed" | "refunded"
) {
  const balance = await ctx.db
    .query("sellerBalances")
    .withIndex("by_userId", (q: any) => q.eq("userId", sellerId))
    .first();
  
  if (!balance) {
    // Create new balance record
    await ctx.db.insert("sellerBalances", {
      userId: sellerId,
      availableBalance: operation === "completed" ? amount : 0,
      pendingBalance: operation === "pending" ? amount : 0,
      totalEarnings: operation !== "refunded" ? amount : 0,
      totalPayouts: 0,
    });
  } else {
    // Update existing balance
    const updates: any = {
      totalEarnings: balance.totalEarnings + (operation !== "refunded" ? amount : 0),
    };
    
    if (operation === "pending") {
      updates.pendingBalance = balance.pendingBalance + amount;
    } else if (operation === "completed") {
      updates.pendingBalance = Math.max(0, balance.pendingBalance - amount);
      updates.availableBalance = balance.availableBalance + amount;
    } else if (operation === "refunded") {
      updates.availableBalance = Math.max(0, balance.availableBalance - Math.abs(amount));
    }
    
    await ctx.db.patch(balance._id, updates);
  }
}

// Process a payout request
export const requestPayout = mutation({
  args: {
    sellerId: v.string(),
    amount: v.number(),
    bankDetails: v.object({
      accountNumber: v.string(),
      sortCode: v.string(),
      accountName: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Get seller balance
    const balance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.sellerId))
      .first();
    
    if (!balance || balance.availableBalance < args.amount) {
      throw new Error("Insufficient available balance");
    }
    
    // Create payout request
    const payoutId = await ctx.db.insert("payoutRequests", {
      sellerId: args.sellerId,
      amount: args.amount,
      status: "pending",
      bankDetails: args.bankDetails,
      requestedAt: Date.now(),
    });
    
    // Deduct from available balance
    await ctx.db.patch(balance._id, {
      availableBalance: balance.availableBalance - args.amount,
    });
    
    return { payoutId, success: true };
  },
});

// Get seller balance
export const getSellerBalance = query({
  args: {
    sellerId: v.string(),
  },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.sellerId))
      .first();
    
    if (!balance) {
      return {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalPayouts: 0,
        lastPayout: null,
      };
    }
    
    return balance;
  },
});

// Get platform-wide analytics (admin only)
export const getPlatformAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("platformTransactions")
      .collect();
    
    // Filter by date range if provided
    const filtered = transactions.filter(t => {
      if (args.startDate && t.createdAt < args.startDate) return false;
      if (args.endDate && t.createdAt > args.endDate) return false;
      return true;
    });
    
    return {
      totalTransactions: filtered.length,
      totalTicketsSold: filtered.reduce((sum, t) => sum + (t.ticketCount || 0), 0),
      totalGrossRevenue: filtered.reduce((sum, t) => sum + t.amount, 0),
      totalPlatformRevenue: filtered.reduce((sum, t) => sum + t.platformFee, 0),
      averageRevenuePerTicket: 1.50, // Always $1.50 per ticket
      
      // Daily breakdown for charts
      dailyRevenue: calculateDailyRevenue(filtered),
      
      // Top events by revenue
      topEvents: getTopEvents(filtered),
    };
  },
});

// Helper functions for analytics
function calculateDailyRevenue(transactions: any[]) {
  const dailyMap = new Map<string, { revenue: number; tickets: number }>();
  
  transactions.forEach(t => {
    const date = new Date(t.createdAt).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { revenue: 0, tickets: 0 };
    dailyMap.set(date, {
      revenue: existing.revenue + t.platformFee,
      tickets: existing.tickets + (t.ticketCount || 0),
    });
  });
  
  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    tickets: data.tickets,
    revenuePerTicket: 1.50, // Always $1.50
  }));
}

function getTopEvents(transactions: any[]) {
  const eventMap = new Map<string, { name: string; revenue: number; tickets: number }>();
  
  transactions.forEach(t => {
    const key = t.eventId;
    const existing = eventMap.get(key) || { name: t.eventName, revenue: 0, tickets: 0 };
    eventMap.set(key, {
      name: t.eventName,
      revenue: existing.revenue + t.platformFee,
      tickets: existing.tickets + (t.ticketCount || 0),
    });
  });
  
  return Array.from(eventMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}