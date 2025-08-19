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
