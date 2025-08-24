import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Platform fee percentage (1%)
const PLATFORM_FEE_PERCENTAGE = 0.01;

export const recordTransaction = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    buyerId: v.string(),
    buyerEmail: v.string(),
    amount: v.number(),
    squarePaymentId: v.string(),
    squareOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Calculate fees
    const platformFee = Math.round(args.amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const sellerPayout = args.amount - platformFee;

    // Record the transaction
    const transactionId = await ctx.db.insert("platformTransactions", {
      eventId: args.eventId,
      eventName: event.name,
      ticketId: args.ticketId,
      sellerId: event.userId,
      buyerId: args.buyerId,
      buyerEmail: args.buyerEmail,
      amount: args.amount,
      platformFee,
      sellerPayout,
      status: "completed",
      paymentId: args.squarePaymentId || "square_payment",
      paymentProvider: "square" as const,
      paymentDetails: JSON.stringify({
        squarePaymentId: args.squarePaymentId,
        squareOrderId: args.squareOrderId,
      }),
      createdAt: Date.now(),
    });

    // Update seller balance
    const existingBalance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", event.userId))
      .first();

    if (existingBalance) {
      await ctx.db.patch(existingBalance._id, {
        availableBalance: existingBalance.availableBalance + sellerPayout,
        pendingBalance: existingBalance.pendingBalance,
        totalEarnings: existingBalance.totalEarnings + sellerPayout,
      });
    } else {
      await ctx.db.insert("sellerBalances", {
        userId: event.userId,
        availableBalance: sellerPayout,
        pendingBalance: 0,
        totalEarnings: sellerPayout,
        totalPayouts: 0,
      });
    }

    return transactionId;
  },
});

export const getAllTransactions = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("platformTransactions")
      .order("desc")
      .take(100);
    return transactions;
  },
});

export const getSellerTransactions = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("platformTransactions")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();
    return transactions;
  },
});

export const getPlatformMetrics = query({
  handler: async (ctx) => {
    const allTransactions = await ctx.db
      .query("platformTransactions")
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const monthlyTransactions = allTransactions.filter(
      tx => tx.createdAt >= thirtyDaysAgo
    );

    const totalRevenue = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPlatformFees = allTransactions.reduce((sum, tx) => sum + tx.platformFee, 0);
    const pendingPayouts = allTransactions
      .filter(tx => tx.status === "completed")
      .reduce((sum, tx) => sum + tx.sellerPayout, 0);
    const monthlyRevenue = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalRevenue,
      totalPlatformFees,
      pendingPayouts,
      monthlyRevenue,
      monthlyTransactions: monthlyTransactions.length,
      totalTransactions: allTransactions.length,
    };
  },
});

export const getSellerBalance = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return balance || {
      userId: args.userId,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalPayouts: 0,
    };
  },
});

export const processRefund = mutation({
  args: {
    transactionId: v.id("platformTransactions"),
    refundAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Update transaction status
    await ctx.db.patch(args.transactionId, {
      status: "refunded",
      refundAmount: args.refundAmount,
      refundedAt: Date.now(),
    });

    // Update seller balance (deduct the refunded amount)
    const sellerBalance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", transaction.sellerId))
      .first();

    if (sellerBalance) {
      const refundedSellerAmount = args.refundAmount * (1 - PLATFORM_FEE_PERCENTAGE);
      await ctx.db.patch(sellerBalance._id, {
        availableBalance: sellerBalance.availableBalance - refundedSellerAmount,
        totalEarnings: sellerBalance.totalEarnings - refundedSellerAmount,
      });
    }

    return { success: true };
  },
});

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
    // Check seller balance
    const balance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.sellerId))
      .first();

    if (!balance || balance.availableBalance < args.amount) {
      throw new Error("Insufficient balance");
    }

    // Create payout request
    const payoutId = await ctx.db.insert("payoutRequests", {
      sellerId: args.sellerId,
      amount: args.amount,
      status: "pending",
      bankDetails: args.bankDetails,
      requestedAt: Date.now(),
    });

    // Update seller balance (move to pending)
    await ctx.db.patch(balance._id, {
      availableBalance: balance.availableBalance - args.amount,
      pendingBalance: balance.pendingBalance + args.amount,
    });

    return payoutId;
  },
});

export const completePayout = mutation({
  args: {
    payoutId: v.id("payoutRequests"),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) throw new Error("Payout request not found");

    // Update payout status
    await ctx.db.patch(args.payoutId, {
      status: "completed",
      processedAt: Date.now(),
    });

    // Update seller balance
    const balance = await ctx.db
      .query("sellerBalances")
      .withIndex("by_userId", (q) => q.eq("userId", payout.sellerId))
      .first();

    if (balance) {
      await ctx.db.patch(balance._id, {
        pendingBalance: balance.pendingBalance - payout.amount,
        totalPayouts: balance.totalPayouts + payout.amount,
        lastPayout: Date.now(),
      });
    }

    return { success: true };
  },
});