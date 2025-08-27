import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create event days for a multi-day event
export const createEventDays = mutation({
  args: {
    eventId: v.id("events"),
    startDate: v.number(),
    endDate: v.number(),
    sameLocation: v.boolean(),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dayIds = [];
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    
    // Calculate number of days
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let dayNumber = 1; dayNumber <= dayCount; dayNumber++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayNumber - 1);
      
      // Format day label
      const dayLabel = `Day ${dayNumber} - ${currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })}`;
      
      const dayId = await ctx.db.insert("eventDays", {
        eventId: args.eventId,
        dayNumber,
        date: currentDate.getTime(),
        dayLabel,
        // Location fields (only if same location for all days)
        location: args.sameLocation ? args.location : undefined,
        address: args.sameLocation ? args.address : undefined,
        latitude: args.sameLocation ? args.latitude : undefined,
        longitude: args.sameLocation ? args.longitude : undefined,
        city: args.sameLocation ? args.city : undefined,
        state: args.sameLocation ? args.state : undefined,
        postalCode: args.sameLocation ? args.postalCode : undefined,
        // Default times (can be updated later)
        startTime: "09:00",
        endTime: "23:00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      dayIds.push(dayId);
    }
    
    return dayIds;
  },
});

// Create ticket types for an event or event day
export const createTicketType = mutation({
  args: {
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")),
    name: v.string(),
    category: v.union(v.literal("general"), v.literal("vip"), v.literal("early_bird")),
    price: v.number(),
    earlyBirdPrice: v.optional(v.number()),
    earlyBirdEndDate: v.optional(v.number()),
    maxQuantity: v.number(),
  },
  handler: async (ctx, args) => {
    const ticketTypeId = await ctx.db.insert("dayTicketTypes", {
      eventId: args.eventId,
      eventDayId: args.eventDayId,
      name: args.name,
      category: args.category,
      price: args.price,
      hasEarlyBird: args.earlyBirdPrice !== undefined,
      earlyBirdPrice: args.earlyBirdPrice,
      earlyBirdEndDate: args.earlyBirdEndDate,
      allocatedQuantity: args.maxQuantity,
      tableAllocations: 0,
      bundleAllocations: 0,
      availableQuantity: args.maxQuantity,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return ticketTypeId;
  },
});

// Create a ticket bundle
export const createBundle = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    bundleType: v.union(v.literal("all_days_same_type"), v.literal("custom_selection")),
    includedDays: v.array(v.object({
      eventDayId: v.id("eventDays"),
      ticketTypeId: v.id("dayTicketTypes"),
      dayLabel: v.string(),
      originalPrice: v.number(),
    })),
    bundlePrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Calculate savings
    const totalOriginalPrice = args.includedDays.reduce((sum, day) => sum + day.originalPrice, 0);
    const savingsAmount = totalOriginalPrice - args.bundlePrice;
    
    const bundleId = await ctx.db.insert("ticketBundles", {
      eventId: args.eventId,
      name: args.name,
      description: args.description,
      bundleType: args.bundleType,
      includedDays: JSON.stringify(args.includedDays),
      bundlePrice: args.bundlePrice,
      savingsAmount,
      maxBundles: undefined,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return bundleId;
  },
});

// Auto-generate standard bundles for a multi-day event
export const generateStandardBundles = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get all event days
    const eventDays = await ctx.db
      .query("eventDays")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    if (eventDays.length === 0) {
      return [];
    }
    
    // Get all ticket types for this event
    const ticketTypes = await ctx.db
      .query("dayTicketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    // Group ticket types by category
    const generalTickets = ticketTypes.filter(t => t.category === "general");
    const vipTickets = ticketTypes.filter(t => t.category === "vip");
    
    const bundles = [];
    
    // Create "All Days General Admission" bundle if GA tickets exist for all days
    if (generalTickets.length === eventDays.length) {
      const gaBundle = generalTickets.map((ticket, index) => ({
        eventDayId: eventDays[index]._id,
        ticketTypeId: ticket._id,
        dayLabel: eventDays[index].dayLabel,
        originalPrice: ticket.price,
      }));
      
      const totalPrice = gaBundle.reduce((sum, day) => sum + day.originalPrice, 0);
      const bundlePrice = Math.floor(totalPrice * 0.85); // 15% discount
      
      const bundleId = await ctx.db.insert("ticketBundles", {
        eventId: args.eventId,
        name: "All Days - General Admission",
        description: "Access to all days with General Admission",
        bundleType: "all_days_same_type",
        includedDays: JSON.stringify(gaBundle),
        bundlePrice,
        savingsAmount: totalPrice - bundlePrice,
        soldCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      bundles.push(bundleId);
    }
    
    // Create "All Days VIP" bundle if VIP tickets exist for all days
    if (vipTickets.length === eventDays.length) {
      const vipBundle = vipTickets.map((ticket, index) => ({
        eventDayId: eventDays[index]._id,
        ticketTypeId: ticket._id,
        dayLabel: eventDays[index].dayLabel,
        originalPrice: ticket.price,
      }));
      
      const totalPrice = vipBundle.reduce((sum, day) => sum + day.originalPrice, 0);
      const bundlePrice = Math.floor(totalPrice * 0.85); // 15% discount
      
      const bundleId = await ctx.db.insert("ticketBundles", {
        eventId: args.eventId,
        name: "All Days - VIP Pass",
        description: "VIP access to all days",
        bundleType: "all_days_same_type",
        includedDays: JSON.stringify(vipBundle),
        bundlePrice,
        savingsAmount: totalPrice - bundlePrice,
        soldCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      bundles.push(bundleId);
    }
    
    return bundles;
  },
});

// Get event days for an event
export const getEventDays = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const days = await ctx.db
      .query("eventDays")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    return days.sort((a, b) => a.dayNumber - b.dayNumber);
  },
});

// Get ticket types for an event or day
export const getTicketTypes = query({
  args: {
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("dayTicketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));
    
    const allTypes = await query.collect();
    
    if (args.eventDayId) {
      return allTypes.filter(t => t.eventDayId === args.eventDayId);
    }
    
    return allTypes;
  },
});

// Get bundles for an event
export const getBundles = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const bundles = await ctx.db
      .query("ticketBundles")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Parse the includedDays JSON for each bundle
    return bundles.map(bundle => ({
      ...bundle,
      includedDays: JSON.parse(bundle.includedDays),
    }));
  },
});