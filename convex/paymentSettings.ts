import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's payment settings
export const getUserPaymentSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      return null;
    }

    return {
      // Current preferred method
      preferredPaymentMethod: user.preferredPaymentMethod,
      
      // Square/CashApp
      squareConnected: !!user.squareAccessToken,
      squareMerchantId: user.squareMerchantId,
      
      // Stripe
      stripeConnected: !!user.stripeAccountId,
      stripeAccountId: user.stripeAccountId,
      
      // PayPal
      paypalConnected: !!user.paypalMerchantId,
      paypalEmail: user.paypalEmail,
      
      // Zelle
      zelleConfigured: !!user.zelleEmail,
      zelleEmail: user.zelleEmail,
      zellePhone: user.zellePhone,
      
      // Bank (not storing sensitive info in response)
      bankConfigured: !!user.bankAccountInfo,
    };
  },
});

// Update preferred payment method
export const updatePreferredPaymentMethod = mutation({
  args: {
    userId: v.string(),
    method: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal"),
      v.literal("zelle"),
      v.literal("bank")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the payment method is configured
    const isConfigured = 
      (args.method === "square" && user.squareAccessToken) ||
      (args.method === "stripe" && user.stripeAccountId) ||
      (args.method === "paypal" && user.paypalMerchantId) ||
      (args.method === "zelle" && user.zelleEmail) ||
      (args.method === "bank" && user.bankAccountInfo);

    if (!isConfigured) {
      throw new Error(`Payment method ${args.method} is not configured. Please connect your account first.`);
    }

    await ctx.db.patch(user._id, {
      preferredPaymentMethod: args.method,
    });

    return { success: true };
  },
});

// Update Zelle settings
export const updateZelleSettings = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      zelleEmail: args.email,
      zellePhone: args.phone,
    });

    return { success: true };
  },
});

// Store Square OAuth tokens after successful connection
export const storeSquareTokens = mutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    merchantId: v.string(),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      squareAccessToken: args.accessToken,
      squareRefreshToken: args.refreshToken,
      squareMerchantId: args.merchantId,
      squareLocationId: args.locationId,
    });

    // If this is the first payment method, set it as preferred
    if (!user.preferredPaymentMethod) {
      await ctx.db.patch(user._id, {
        preferredPaymentMethod: "square",
      });
    }

    return { success: true };
  },
});

// Store Stripe Connect account ID after successful onboarding
export const storeStripeAccount = mutation({
  args: {
    userId: v.string(),
    accountId: v.string(),
    accessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeAccountId: args.accountId,
      stripeAccessToken: args.accessToken,
    });

    // If this is the first payment method, set it as preferred
    if (!user.preferredPaymentMethod) {
      await ctx.db.patch(user._id, {
        preferredPaymentMethod: "stripe",
      });
    }

    return { success: true };
  },
});

// Store PayPal merchant info after successful onboarding
export const storePayPalAccount = mutation({
  args: {
    userId: v.string(),
    merchantId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      paypalMerchantId: args.merchantId,
      paypalEmail: args.email,
    });

    // If this is the first payment method, set it as preferred
    if (!user.preferredPaymentMethod) {
      await ctx.db.patch(user._id, {
        preferredPaymentMethod: "paypal",
      });
    }

    return { success: true };
  },
});

// Check if user has any payment method configured
export const hasPaymentMethodConfigured = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      return false;
    }

    return !!(
      user.squareAccessToken ||
      user.stripeAccountId ||
      user.paypalMerchantId ||
      user.zelleEmail ||
      user.bankAccountInfo
    );
  },
});

// Disconnect a payment provider
export const disconnectPaymentProvider = mutation({
  args: {
    userId: v.string(),
    provider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal"),
      v.literal("zelle"),
      v.literal("bank")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {};

    switch (args.provider) {
      case "square":
        updates.squareAccessToken = undefined;
        updates.squareRefreshToken = undefined;
        updates.squareMerchantId = undefined;
        updates.squareLocationId = undefined;
        break;
      case "stripe":
        updates.stripeAccountId = undefined;
        updates.stripeAccessToken = undefined;
        break;
      case "paypal":
        updates.paypalMerchantId = undefined;
        updates.paypalEmail = undefined;
        break;
      case "zelle":
        updates.zelleEmail = undefined;
        updates.zellePhone = undefined;
        break;
      case "bank":
        updates.bankAccountInfo = undefined;
        break;
    }

    // If disconnecting the preferred method, clear it
    if (user.preferredPaymentMethod === args.provider) {
      updates.preferredPaymentMethod = undefined;
    }

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});