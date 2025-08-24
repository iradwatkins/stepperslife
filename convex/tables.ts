import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new table configuration for an event
export const createTableConfig = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    seatCount: v.number(),
    price: v.number(),
    description: v.optional(v.string()),
    maxTables: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the event exists and user owns it
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Create the table configuration
    const tableConfigId = await ctx.db.insert("tableConfigurations", {
      eventId: args.eventId,
      name: args.name,
      seatCount: args.seatCount,
      price: args.price,
      description: args.description,
      maxTables: args.maxTables,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return tableConfigId;
  },
});

// Get all table configurations for an event
export const getTableConfigs = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("tableConfigurations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    return configs;
  },
});

// Get active table configurations for purchase
export const getActiveTableConfigs = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("tableConfigurations")
      .withIndex("by_event_active", (q) => 
        q.eq("eventId", args.eventId).eq("isActive", true)
      )
      .collect();
    
    // Filter out sold out tables if maxTables is set
    return configs.filter(config => {
      if (!config.maxTables) return true;
      return config.soldCount < config.maxTables;
    });
  },
});

// Update a table configuration
export const updateTableConfig = mutation({
  args: {
    id: v.id("tableConfigurations"),
    name: v.optional(v.string()),
    seatCount: v.optional(v.number()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    maxTables: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Get existing config
    const config = await ctx.db.get(id);
    if (!config) {
      throw new Error("Table configuration not found");
    }
    
    // Update with new values
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    return id;
  },
});

// Delete a table configuration (soft delete by deactivating)
export const deleteTableConfig = mutation({
  args: { id: v.id("tableConfigurations") },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.id);
    if (!config) {
      throw new Error("Table configuration not found");
    }
    
    // Check if any tables have been sold
    if (config.soldCount > 0) {
      // Soft delete - just deactivate
      await ctx.db.patch(args.id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
      return { deleted: false, deactivated: true };
    }
    
    // Hard delete if no sales
    await ctx.db.delete(args.id);
    return { deleted: true, deactivated: false };
  },
});

// Get table availability for an event
export const getTableAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("tableConfigurations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    return configs.map(config => ({
      id: config._id,
      name: config.name,
      seatCount: config.seatCount,
      price: config.price,
      available: config.maxTables ? config.maxTables - config.soldCount : "Unlimited",
      soldCount: config.soldCount,
      isActive: config.isActive,
    }));
  },
});