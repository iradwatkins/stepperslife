import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUsersSquareLocationId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.neq(q.field("squareLocationId"), undefined))
      .first();
    return user?.squareLocationId;
  },
});

export const getUsersStripeConnectId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Legacy support - return null
    return null;
  },
});

export const updateOrCreateUserSquareLocationId = mutation({
  args: { 
    userId: v.string(), 
    squareLocationId: v.string(),
    squareMerchantId: v.optional(v.string()),
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
      squareLocationId: args.squareLocationId,
      squareMerchantId: args.squareMerchantId,
    });
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, name, email }) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name,
        email,
      });
      return existingUser._id;
    }

    // Create new user
    const newUserId = await ctx.db.insert("users", {
      userId,
      name,
      email,
      squareLocationId: undefined,
      squareMerchantId: undefined,
    });

    return newUserId;
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return user;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    return user;
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, passwordHash }) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (existing) {
      throw new Error("User already exists");
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      userId: email, // Use email as userId for simplicity
      email,
      name,
      passwordHash,
    });
    
    return userId;
  },
});

export const getUsersSquareMerchantId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.neq(q.field("squareMerchantId"), undefined))
      .first();
    return user?.squareMerchantId;
  },
});

export const updateSquareCredentials = mutation({
  args: {
    userId: v.string(),
    squareAccessToken: v.string(),
    squareMerchantId: v.string(),
    squareRefreshToken: v.optional(v.string()),
    squareLocationId: v.string(),
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
      squareAccessToken: args.squareAccessToken,
      squareMerchantId: args.squareMerchantId,
      squareRefreshToken: args.squareRefreshToken,
      squareLocationId: args.squareLocationId,
    });
  },
});

export const getSquareAccount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!user) return null;
    
    return {
      isConnected: !!user.squareAccessToken,
      merchantId: user.squareMerchantId,
      locationId: user.squareLocationId,
      hasAccessToken: !!user.squareAccessToken,
    };
  },
});
