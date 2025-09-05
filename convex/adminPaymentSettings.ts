import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin check helper
const isAdmin = (userId: string): boolean => {
  // Add your admin user IDs here
  const adminIds = [
    "user_2qYrQkP7dQH4VgNfHQYjKQoJQxJ", // Replace with actual admin IDs
  ];
  return adminIds.includes(userId);
};

// Get all payment settings (admin only)
export const getAllPaymentSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const settings = await ctx.db.query("adminPaymentSettings").collect();
    
    // Don't expose raw credentials to frontend
    return settings.map(setting => ({
      ...setting,
      credentials: {
        ...setting.credentials,
        // Mask sensitive data
        squareAccessToken: setting.credentials.squareAccessToken ? "••••••••" : undefined,
        paypalClientSecret: setting.credentials.paypalClientSecret ? "••••••••" : undefined,
        stripeSecretKey: setting.credentials.stripeSecretKey ? "••••••••" : undefined,
      }
    }));
  },
});

// Get specific provider settings
export const getProviderSettings = query({
  args: { 
    userId: v.string(),
    provider: v.union(
      v.literal("square"),
      v.literal("cashapp"),
      v.literal("paypal"),
      v.literal("stripe"),
      v.literal("zelle")
    )
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const setting = await ctx.db
      .query("adminPaymentSettings")
      .withIndex("by_provider", q => q.eq("provider", args.provider))
      .first();

    if (!setting) return null;

    // Return with masked credentials
    return {
      ...setting,
      credentials: {
        ...setting.credentials,
        squareAccessToken: setting.credentials.squareAccessToken ? "••••••••" : undefined,
        paypalClientSecret: setting.credentials.paypalClientSecret ? "••••••••" : undefined,
        stripeSecretKey: setting.credentials.stripeSecretKey ? "••••••••" : undefined,
      }
    };
  },
});

// Update or create payment settings
export const upsertPaymentSettings = mutation({
  args: {
    userId: v.string(),
    provider: v.union(
      v.literal("square"),
      v.literal("cashapp"),
      v.literal("paypal"),
      v.literal("stripe"),
      v.literal("zelle")
    ),
    enabled: v.boolean(),
    environment: v.union(v.literal("sandbox"), v.literal("production")),
    credentials: v.object({
      squareAccessToken: v.optional(v.string()),
      squareApplicationId: v.optional(v.string()),
      squareLocationId: v.optional(v.string()),
      squareWebhookSignature: v.optional(v.string()),
      cashAppPayEnabled: v.optional(v.boolean()),
      paypalClientId: v.optional(v.string()),
      paypalClientSecret: v.optional(v.string()),
      paypalWebhookId: v.optional(v.string()),
      stripePublishableKey: v.optional(v.string()),
      stripeSecretKey: v.optional(v.string()),
      stripeWebhookSecret: v.optional(v.string()),
      zelleEmail: v.optional(v.string()),
      zellePhone: v.optional(v.string()),
    }),
    processingFee: v.optional(v.object({
      percentage: v.number(),
      fixed: v.number(),
    })),
    platformFeePerTicket: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const existing = await ctx.db
      .query("adminPaymentSettings")
      .withIndex("by_provider", q => q.eq("provider", args.provider))
      .first();

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const allSettings = await ctx.db.query("adminPaymentSettings").collect();
      for (const setting of allSettings) {
        if (setting.isDefault && setting.provider !== args.provider) {
          await ctx.db.patch(setting._id, { isDefault: false });
        }
      }
    }

    const now = Date.now();
    
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        environment: args.environment,
        credentials: {
          ...existing.credentials,
          ...args.credentials,
        },
        processingFee: args.processingFee || existing.processingFee,
        platformFeePerTicket: args.platformFeePerTicket ?? existing.platformFeePerTicket,
        isDefault: args.isDefault ?? existing.isDefault,
        lastUpdatedBy: args.userId,
        updatedAt: now,
      });
      
      return { success: true, id: existing._id };
    } else {
      // Create new
      const id = await ctx.db.insert("adminPaymentSettings", {
        provider: args.provider,
        enabled: args.enabled,
        environment: args.environment,
        credentials: args.credentials,
        processingFee: args.processingFee,
        platformFeePerTicket: args.platformFeePerTicket,
        isDefault: args.isDefault,
        lastUpdatedBy: args.userId,
        createdAt: now,
        updatedAt: now,
      });
      
      return { success: true, id };
    }
  },
});

// Toggle provider status
export const toggleProviderStatus = mutation({
  args: {
    userId: v.string(),
    provider: v.union(
      v.literal("square"),
      v.literal("cashapp"),
      v.literal("paypal"),
      v.literal("stripe"),
      v.literal("zelle")
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const setting = await ctx.db
      .query("adminPaymentSettings")
      .withIndex("by_provider", q => q.eq("provider", args.provider))
      .first();

    if (!setting) {
      throw new Error(`Payment provider ${args.provider} not configured`);
    }

    await ctx.db.patch(setting._id, {
      enabled: args.enabled,
      lastUpdatedBy: args.userId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Test payment provider connection
export const testProviderConnection = mutation({
  args: {
    userId: v.string(),
    provider: v.union(
      v.literal("square"),
      v.literal("cashapp"),
      v.literal("paypal"),
      v.literal("stripe"),
      v.literal("zelle")
    ),
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const setting = await ctx.db
      .query("adminPaymentSettings")
      .withIndex("by_provider", q => q.eq("provider", args.provider))
      .first();

    if (!setting) {
      throw new Error(`Payment provider ${args.provider} not configured`);
    }

    // Update test status
    await ctx.db.patch(setting._id, {
      lastTestDate: Date.now(),
      lastTestStatus: "pending",
    });

    // Note: Actual testing would be done via API routes that can access the payment SDKs
    // This just updates the database to track the test request

    return { 
      success: true, 
      message: "Test initiated. Check provider status for results.",
      testId: `test_${args.provider}_${Date.now()}`
    };
  },
});

// Get platform configuration
export const getPlatformConfig = query({
  args: { 
    userId: v.string(),
    category: v.optional(v.union(
      v.literal("payment"),
      v.literal("security"),
      v.literal("general"),
      v.literal("email"),
      v.literal("features")
    ))
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    let query = ctx.db.query("platformConfig");
    
    if (args.category) {
      const configs = await query.collect();
      return configs.filter(c => c.category === args.category);
    }
    
    return await query.collect();
  },
});

// Update platform configuration
export const updatePlatformConfig = mutation({
  args: {
    userId: v.string(),
    key: v.string(),
    value: v.any(),
    category: v.union(
      v.literal("payment"),
      v.literal("security"),
      v.literal("general"),
      v.literal("email"),
      v.literal("features")
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!isAdmin(args.userId)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const existing = await ctx.db
      .query("platformConfig")
      .withIndex("by_key", q => q.eq("key", args.key))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        category: args.category,
        description: args.description ?? existing.description,
        lastUpdatedBy: args.userId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("platformConfig", {
        key: args.key,
        value: args.value,
        category: args.category,
        description: args.description,
        adminOnly: true,
        lastUpdatedBy: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Get active payment providers for checkout
export const getActivePaymentProviders = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("adminPaymentSettings")
      .withIndex("by_enabled", q => q.eq("enabled", true))
      .collect();

    return settings.map(s => ({
      provider: s.provider,
      environment: s.environment,
      isDefault: s.isDefault,
      processingFee: s.processingFee,
      platformFeePerTicket: s.platformFeePerTicket,
      // Only return non-sensitive data
      hasCredentials: !!(
        s.credentials.squareAccessToken ||
        s.credentials.paypalClientId ||
        s.credentials.stripePublishableKey ||
        s.credentials.zelleEmail
      ),
    }));
  },
});