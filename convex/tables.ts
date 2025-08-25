import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new table configuration for an event
export const createTableConfig = mutation({
  args: {
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")),
    name: v.string(),
    seatCount: v.number(),
    price: v.number(),
    description: v.optional(v.string()),
    sourceTicketTypeId: v.optional(v.id("dayTicketTypes")),
    sourceTicketType: v.optional(v.string()),
    maxTables: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // If sourceTicketTypeId provided, update that ticket type's allocation
    if (args.sourceTicketTypeId) {
      const ticketType = await ctx.db.get(args.sourceTicketTypeId);
      if (!ticketType) {
        throw new Error("Source ticket type not found");
      }
      
      // Check if enough tickets available
      if (ticketType.availableQuantity < args.seatCount) {
        throw new Error(`Not enough ${ticketType.name} tickets available for this table`);
      }
      
      // Update ticket type allocation
      await ctx.db.patch(args.sourceTicketTypeId, {
        tableAllocations: (ticketType.tableAllocations || 0) + args.seatCount,
        availableQuantity: ticketType.availableQuantity - args.seatCount,
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Create the table configuration
    const tableConfigId = await ctx.db.insert("tableConfigurations", {
      eventId: args.eventId,
      eventDayId: args.eventDayId,
      name: args.name,
      seatCount: args.seatCount,
      price: args.price,
      description: args.description,
      sourceTicketTypeId: args.sourceTicketTypeId,
      sourceTicketType: args.sourceTicketType,
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