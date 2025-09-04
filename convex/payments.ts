import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const storeSquarePaymentLink = mutation({
  args: {
    paymentId: v.string(),
    metadata: v.object({
      eventId: v.id("events"),
      userId: v.string(),
      waitingListId: v.optional(v.id("waitingList")),
      referralCode: v.optional(v.string()),
      quantity: v.optional(v.number()),
      isTablePurchase: v.optional(v.boolean()),
      tableName: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Store payment link for webhook processing
    const id = await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getSquarePaymentLink = query({
  args: { paymentId: v.string() },
  handler: async (ctx, { paymentId }) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", paymentId))
      .first();
    
    return payment;
  },
});

export const deletePaymentLink = mutation({
  args: { paymentId: v.string() },
  handler: async (ctx, { paymentId }) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", paymentId))
      .first();
    
    if (payment) {
      await ctx.db.delete(payment._id);
    }
  },
});

// Get payment configuration for an event
export const getEventPaymentConfig = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    // Get the event first
    const event = await ctx.db.get(eventId);
    if (!event) {
      return null;
    }

    // Try to get payment config from paymentConfigs table
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .first();

    if (paymentConfig) {
      return {
        paymentModel: paymentConfig.paymentModel,
        platformFee: paymentConfig.platformFee,
        platformFeeType: paymentConfig.platformFeeType,
        processingFee: paymentConfig.processingFee,
        premiumServiceFeePercent: paymentConfig.premiumServiceFeePercent,
        premiumServiceFeeFixed: paymentConfig.premiumServiceFeeFixed,
      };
    }

    // Fallback to event's payment model if no config found
    if (event.paymentModel) {
      // Return default config based on payment model
      if (event.paymentModel === "connect_collect") {
        return {
          paymentModel: "connect_collect",
          platformFee: 2.00,
          platformFeeType: "fixed" as const,
          processingFee: 0, // Handled by organizer
        };
      } else if (event.paymentModel === "premium") {
        return {
          paymentModel: "premium",
          platformFee: 3.7,
          platformFeeType: "percentage" as const,
          processingFee: 2.9,
          premiumServiceFeePercent: 3.7,
          premiumServiceFeeFixed: 1.79,
        };
      } else if (event.paymentModel === "split") {
        return {
          paymentModel: "split",
          platformFee: 10,
          platformFeeType: "percentage" as const,
          processingFee: 2.9,
        };
      }
    }

    // Default to premium if no payment model specified
    return {
      paymentModel: "premium",
      platformFee: 3.7,
      platformFeeType: "percentage" as const,
      processingFee: 2.9,
      premiumServiceFeePercent: 3.7,
      premiumServiceFeeFixed: 1.79,
    };
  },
});

// Calculate total fees for a ticket price
export const calculateTotalFees = internalQuery({
  args: {
    eventId: v.id("events"),
    ticketPrice: v.number(),
  },
  handler: async (ctx, { eventId, ticketPrice }) => {
    const config = await ctx.runQuery(internal.payments.getEventPaymentConfig, { eventId });
    
    if (!config) {
      return {
        subtotal: ticketPrice,
        platformFee: 0,
        processingFee: 0,
        total: ticketPrice,
      };
    }

    let platformFee = 0;
    let processingFee = 0;

    if (config.paymentModel === "connect_collect") {
      platformFee = 2.00; // Fixed $2 fee
      processingFee = 0; // Organizer handles this
    } else if (config.paymentModel === "premium") {
      platformFee = ticketPrice * 0.037 + 1.79; // 3.7% + $1.79
      processingFee = 0; // Included in platform fee
    } else if (config.paymentModel === "split") {
      platformFee = 0; // Split happens at distribution
      processingFee = ticketPrice * 0.029 + 0.30; // Standard processing
    }

    return {
      subtotal: ticketPrice,
      platformFee,
      processingFee,
      total: ticketPrice + platformFee + processingFee,
      paymentModel: config.paymentModel,
    };
  },
});