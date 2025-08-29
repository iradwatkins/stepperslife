import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create ticket types for a single event (alias for compatibility)
export const createSingleEventTickets = mutation({
  args: {
    eventId: v.id("events"),
    ticketTypes: v.array(v.object({
      name: v.string(),
      category: v.union(v.literal("general"), v.literal("vip"), v.literal("early_bird")),
      allocatedQuantity: v.number(),
      price: v.number(),
      hasEarlyBird: v.optional(v.boolean()),
      earlyBirdPrice: v.optional(v.number()),
      earlyBirdEndDate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const ticketTypeIds = [];
    
    for (const ticketType of args.ticketTypes) {
      const id = await ctx.db.insert("dayTicketTypes", {
        eventId: args.eventId,
        eventDayId: undefined, // For single events
        name: ticketType.name,
        category: ticketType.category,
        price: ticketType.price,
        hasEarlyBird: ticketType.hasEarlyBird || false,
        earlyBirdPrice: ticketType.earlyBirdPrice,
        earlyBirdEndDate: ticketType.earlyBirdEndDate,
        allocatedQuantity: ticketType.allocatedQuantity,
        tableAllocations: 0, // Will be updated when tables are created
        bundleAllocations: 0, // For multi-day events
        availableQuantity: ticketType.allocatedQuantity, // Initially all are available
        soldCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      ticketTypeIds.push(id);
    }
    
    return ticketTypeIds;
  },
});

// Create ticket types for an event (original name)
export const createTicketTypes = mutation({
  args: {
    eventId: v.id("events"),
    ticketTypes: v.array(v.object({
      name: v.string(),
      category: v.union(v.literal("general"), v.literal("vip"), v.literal("early_bird")),
      allocatedQuantity: v.number(),
      price: v.number(),
      hasEarlyBird: v.optional(v.boolean()),
      earlyBirdPrice: v.optional(v.number()),
      earlyBirdEndDate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const ticketTypeIds = [];
    
    for (const ticketType of args.ticketTypes) {
      const id = await ctx.db.insert("dayTicketTypes", {
        eventId: args.eventId,
        eventDayId: undefined, // For single events
        name: ticketType.name,
        category: ticketType.category,
        price: ticketType.price,
        hasEarlyBird: ticketType.hasEarlyBird || false,
        earlyBirdPrice: ticketType.earlyBirdPrice,
        earlyBirdEndDate: ticketType.earlyBirdEndDate,
        allocatedQuantity: ticketType.allocatedQuantity,
        tableAllocations: 0, // Will be updated when tables are created
        bundleAllocations: 0, // For multi-day events
        availableQuantity: ticketType.allocatedQuantity, // Initially all are available
        soldCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      ticketTypeIds.push(id);
    }
    
    return ticketTypeIds;
  },
});

// Get ticket types for an event
export const getEventTicketTypes = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const ticketTypes = await ctx.db
      .query("dayTicketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("eventDayId"), undefined)) // Single event tickets only
      .collect();
    
    return ticketTypes.map(ticket => ({
      ...ticket,
      currentPrice: getCurrentPrice(ticket),
    }));
  },
});

// Get available tickets for purchase
export const getAvailableTickets = query({
  args: { 
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("dayTicketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("isActive"), true));
    
    // Filter by day if provided
    if (args.eventDayId) {
      query = query.filter((q) => q.eq(q.field("eventDayId"), args.eventDayId));
    } else {
      query = query.filter((q) => q.eq(q.field("eventDayId"), undefined));
    }
    
    const ticketTypes = await query.collect();
    
    // Only return tickets with availability
    return ticketTypes
      .filter(ticket => ticket.availableQuantity > 0)
      .map(ticket => ({
        ...ticket,
        currentPrice: getCurrentPrice(ticket),
        isEarlyBird: isEarlyBirdActive(ticket),
      }));
  },
});

// Update ticket type after table allocation
export const updateTicketAllocation = mutation({
  args: {
    ticketTypeId: v.id("dayTicketTypes"),
    tableAllocation: v.number(), // How many tickets to allocate to tables
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new Error("Ticket type not found");
    }
    
    const newTableAllocation = (ticketType.tableAllocations || 0) + args.tableAllocation;
    const newAvailable = ticketType.allocatedQuantity - newTableAllocation - ticketType.soldCount;
    
    if (newAvailable < 0) {
      throw new Error("Not enough tickets available for this allocation");
    }
    
    await ctx.db.patch(args.ticketTypeId, {
      tableAllocations: newTableAllocation,
      availableQuantity: newAvailable,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      remaining: newAvailable,
    };
  },
});

// Check bundle availability for multi-day events
export const checkBundleAvailability = query({
  args: {
    bundleId: v.id("ticketBundles"),
  },
  handler: async (ctx, args) => {
    const bundle = await ctx.db.get(args.bundleId);
    if (!bundle) {
      return { available: false, reason: "Bundle not found" };
    }
    
    if (!bundle.isActive) {
      return { available: false, reason: "Bundle is not active" };
    }
    
    // Parse included days to check each component
    const includedDays = JSON.parse(bundle.includedDays);
    
    for (const day of includedDays) {
      const ticketType = await ctx.db.get(day.ticketTypeId);
      if (!ticketType) {
        return { available: false, reason: "Ticket type not found" };
      }
      
      if ((ticketType as any).availableQuantity === 0) {
        return { 
          available: false, 
          reason: `${(ticketType as any).name} is sold out for ${day.dayLabel}` 
        };
      }
    }
    
    return { available: true };
  },
});

// Get all bundles with availability status
export const getAvailableBundles = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const bundles = await ctx.db
      .query("ticketBundles")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const bundlesWithAvailability = await Promise.all(
      bundles.map(async (bundle) => {
        // Check availability for this bundle
        const includedDays = JSON.parse(bundle.includedDays);
        let isAvailable = true;
        let unavailableReason = "";
        
        for (const day of includedDays) {
          const ticketType = await ctx.db.get(day.ticketTypeId);
          if (!ticketType || (ticketType as any).availableQuantity === 0) {
            isAvailable = false;
            unavailableReason = ticketType 
              ? `${(ticketType as any).name} sold out`
              : "Ticket type not found";
            break;
          }
        }
        
        return {
          ...bundle,
          isAvailable,
          unavailableReason,
          includedDays, // Already parsed
        };
      })
    );
    
    // Only return available bundles
    return bundlesWithAvailability.filter(b => b.isAvailable);
  },
});

// Helper functions
function getCurrentPrice(ticketType: any): number {
  if (isEarlyBirdActive(ticketType)) {
    return ticketType.earlyBirdPrice || ticketType.price;
  }
  return ticketType.price;
}

function isEarlyBirdActive(ticketType: any): boolean {
  if (!ticketType.hasEarlyBird || !ticketType.earlyBirdEndDate) {
    return false;
  }
  return Date.now() < ticketType.earlyBirdEndDate;
}