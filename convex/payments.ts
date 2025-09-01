import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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