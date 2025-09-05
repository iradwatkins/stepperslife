import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all active products
export const getActiveProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: {
    category: v.union(v.literal("apparel"), v.literal("printed_materials")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category")
      .filter((q) => 
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Get all t-shirt designs
export const getTshirtDesigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tshirtDesigns")
      .withIndex("by_active")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Create a new product order
export const createProductOrder = mutation({
  args: {
    eventId: v.optional(v.id("events")),
    userId: v.string(),
    orderType: v.union(v.literal("event_products"), v.literal("general")),
    items: v.string(), // JSON string of items
    designFiles: v.optional(v.array(v.object({
      productId: v.id("products"),
      frontFileId: v.optional(v.id("_storage")),
      backFileId: v.optional(v.id("_storage")),
      customDesignRequested: v.boolean(),
      designInstructions: v.optional(v.string()),
    }))),
    subtotal: v.number(),
    designFees: v.number(),
    shippingCost: v.number(),
    totalAmount: v.number(),
    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    totalWeight: v.number(),
    shippingMethod: v.union(
      v.literal("standard"),
      v.literal("express"),
      v.literal("overnight")
    ),
    customerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique order ID
    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create the order
    const order = await ctx.db.insert("productOrders", {
      orderId,
      eventId: args.eventId,
      userId: args.userId,
      orderType: args.orderType,
      items: args.items,
      designFiles: args.designFiles,
      subtotal: args.subtotal,
      designFees: args.designFees,
      shippingCost: args.shippingCost,
      totalAmount: args.totalAmount,
      shippingAddress: args.shippingAddress,
      totalWeight: args.totalWeight,
      shippingMethod: args.shippingMethod,
      paymentStatus: "pending",
      paymentMethod: "square",
      orderStatus: "draft",
      customerNotes: args.customerNotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { orderId, id: order };
  },
});

// Update order payment status
export const updateOrderPaymentStatus = mutation({
  args: {
    orderId: v.string(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("productOrders")
      .withIndex("by_order_id")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    await ctx.db.patch(order._id, {
      paymentStatus: args.paymentStatus,
      paymentReference: args.paymentReference,
      orderStatus: args.paymentStatus === "completed" ? "submitted" : order.orderStatus,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get orders by user
export const getUserOrders = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productOrders")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get orders by event
export const getEventOrders = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productOrders")
      .withIndex("by_event")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
  },
});

// Get shipping rates
export const getShippingRates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shippingRates")
      .withIndex("by_active")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Calculate shipping cost
export const calculateShipping = query({
  args: {
    weight: v.number(), // Weight in pounds
    method: v.union(
      v.literal("standard"),
      v.literal("express"),
      v.literal("overnight")
    ),
  },
  handler: async (ctx, args) => {
    const rate = await ctx.db
      .query("shippingRates")
      .withIndex("by_method")
      .filter((q) => 
        q.and(
          q.eq(q.field("method"), args.method),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();
    
    if (!rate) {
      // Default rates if not configured
      const defaultRates = {
        standard: { base: 8, perPound: 1.5 },
        express: { base: 15, perPound: 2.5 },
        overnight: { base: 30, perPound: 3.5 },
      };
      
      const defaultRate = defaultRates[args.method];
      return {
        cost: defaultRate.base + (args.weight - 1) * defaultRate.perPound,
        estimatedDays: args.method === "standard" ? "5-7 business days" : 
                       args.method === "express" ? "2-3 business days" : 
                       "1 business day",
      };
    }
    
    // Calculate cost based on weight brackets if available
    if (rate.weightBrackets) {
      const brackets = JSON.parse(rate.weightBrackets);
      const bracket = brackets.find((b: any) => 
        args.weight >= b.min && args.weight <= b.max
      );
      if (bracket) {
        return {
          cost: bracket.price,
          estimatedDays: rate.estimatedDays,
        };
      }
    }
    
    // Otherwise use per-pound calculation
    const cost = rate.baseRate + (args.weight - 1) * rate.perPoundRate;
    
    return {
      cost: Math.max(cost, 0), // Ensure non-negative
      estimatedDays: rate.estimatedDays,
    };
  },
});

// Admin: Add a product
export const addProduct = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("tshirt"),
      v.literal("business_card"),
      v.literal("palm_card"),
      v.literal("postcard"),
      v.literal("ticket"),
      v.literal("poster")
    ),
    category: v.union(
      v.literal("apparel"),
      v.literal("printed_materials")
    ),
    basePrice: v.number(),
    minQuantity: v.number(),
    maxQuantity: v.optional(v.number()),
    quantityPricing: v.optional(v.string()),
    description: v.optional(v.string()),
    specifications: v.optional(v.string()),
    designOptions: v.optional(v.object({
      allowCustomDesign: v.boolean(),
      designFeeOneSide: v.optional(v.number()),
      designFeeTwoSides: v.optional(v.number()),
      allowFileUpload: v.boolean(),
      maxFileSize: v.optional(v.number()),
      acceptedFormats: v.optional(v.string()),
    })),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Admin: Add a t-shirt design
export const addTshirtDesign = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frontImageId: v.optional(v.id("_storage")),
    backImageId: v.optional(v.id("_storage")),
    mockupImageId: v.optional(v.id("_storage")),
    basePrice: v.number(),
    customDesignFee: v.optional(v.number()),
    availableSizes: v.string(),
    availableColors: v.string(),
    trackInventory: v.boolean(),
    inventory: v.optional(v.string()),
    isFeatured: v.boolean(),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tshirtDesigns", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Store payment link for product order
export const storeProductPaymentLink = mutation({
  args: {
    orderId: v.string(),
    paymentId: v.string(),
    metadata: v.object({
      orderReference: v.string(),
      userId: v.string(),
      eventId: v.optional(v.id("events")),
      productType: v.string(),
    }),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("productPayments", {
      orderId: args.orderId,
      paymentId: args.paymentId,
      metadata: args.metadata,
      amount: args.amount,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});