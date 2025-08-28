import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to generate claim token
function generateClaimToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Helper to generate group ID
function generateGroupId(): string {
  return `TBL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

// Sell a table (bulk tickets) - ORGANIZER ONLY
export const sellTable = mutation({
  args: {
    eventId: v.id("events"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    companyName: v.optional(v.string()),
    tableConfig: v.object({
      tableName: v.string(),        // "VIP Table 1"
      seatCount: v.number(),        // 10
      pricePerSeat: v.number(),     // $100
      ticketType: v.optional(v.union(
        v.literal("VIP"),
        v.literal("GA"),
        v.literal("EARLY_BIRD")
      )),
    }),
    paymentReference: v.string(),
    paymentMethod: v.string(),
    sellerId: v.string(),           // Must be organizer
  },
  handler: async (ctx, args) => {
    // Verify seller is event organizer
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    if (event.userId !== args.sellerId) {
      throw new Error("Only event organizer can sell tables");
    }

    // Check if buyer has an account
    let buyerUserId = args.buyerEmail;
    const buyerUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.buyerEmail))
      .first();
    
    if (buyerUser) {
      buyerUserId = buyerUser.userId;
    }

    // Generate group ID for linking tickets
    const groupPurchaseId = generateGroupId();
    const totalAmount = args.tableConfig.seatCount * args.tableConfig.pricePerSeat;
    
    // Create tickets for each seat
    const ticketIds: Id<"tickets">[] = [];
    const claimLinks: { seatNumber: string; claimToken: string; claimLink: string }[] = [];
    
    for (let i = 1; i <= args.tableConfig.seatCount; i++) {
      const claimToken = generateClaimToken();
      const seatNumber = `Seat ${i}`;
      
      const ticketId = await ctx.db.insert("tickets", {
        eventId: args.eventId,
        userId: buyerUserId,
        currentOwner: buyerUserId,
        originalPurchaser: buyerUserId,
        purchasedAt: Date.now(),
        status: "valid",
        
        // Payment info
        paymentMethod: args.paymentMethod as any,
        paymentStatus: "completed",
        paymentReference: args.paymentReference,
        amount: args.tableConfig.pricePerSeat,
        
        // Table grouping
        groupPurchaseId,
        groupType: "table",
        tableName: args.tableConfig.tableName,
        seatNumber,
        ticketType: args.tableConfig.ticketType || "GA",
        
        // Transfer capability
        claimToken,
        isClaimable: true,
        
        // Generate backup code
        backupCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      
      ticketIds.push(ticketId);
      claimLinks.push({
        seatNumber,
        claimToken,
        claimLink: `https://stepperslife.com/claim/${claimToken}`,
      });
    }

    // Record the transaction
    await ctx.db.insert("platformTransactions", {
      eventId: args.eventId,
      eventName: event.name,
      ticketId: ticketIds[0], // Reference first ticket
      sellerId: args.sellerId,
      buyerId: buyerUserId,
      buyerEmail: args.buyerEmail,
      amount: totalAmount,
      ticketCount: args.tableConfig.seatCount, // Add missing ticketCount field
      platformFee: totalAmount * 0.05, // 5% platform fee
      sellerPayout: totalAmount * 0.95, // 95% to organizer
      status: "completed",
      paymentId: args.paymentReference,
      paymentProvider: args.paymentMethod as any,
      createdAt: Date.now(),
    });

    return {
      success: true,
      groupPurchaseId,
      ticketIds,
      claimLinks,
      totalAmount,
      message: `Successfully created ${args.tableConfig.seatCount} tickets for ${args.tableConfig.tableName}`,
    };
  },
});

// Get table tickets for a buyer
export const getTableTickets = query({
  args: {
    userId: v.string(),
    groupPurchaseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("groupType"), "table"));
    
    if (args.groupPurchaseId) {
      query = query.filter((q) => q.eq(q.field("groupPurchaseId"), args.groupPurchaseId));
    }
    
    const tickets = await query.collect();
    
    // Group by purchase ID
    const groupedTickets = tickets.reduce((acc, ticket) => {
      const groupId = ticket.groupPurchaseId || 'individual';
      if (!acc[groupId]) {
        acc[groupId] = {
          groupId,
          tableName: ticket.tableName || 'Unknown Table',
          tickets: [],
          totalSeats: 0,
          claimedSeats: 0,
        };
      }
      
      acc[groupId].tickets.push({
        ...ticket,
        claimLink: ticket.claimToken ? `https://stepperslife.com/claim/${ticket.claimToken}` : null,
        isClaimed: ticket.currentOwner !== ticket.originalPurchaser,
      });
      
      acc[groupId].totalSeats++;
      if (ticket.currentOwner !== ticket.originalPurchaser) {
        acc[groupId].claimedSeats++;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(groupedTickets);
  },
});

// Get all tables sold for an event (organizer view)
export const getEventTables = query({
  args: { 
    eventId: v.id("events"),
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify organizer
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== args.organizerId) {
      return [];
    }

    // Get all table tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("groupType"), "table"))
      .collect();
    
    // Group by purchase and get buyer info
    const tables = tickets.reduce((acc, ticket) => {
      const groupId = ticket.groupPurchaseId;
      if (!groupId || acc[groupId]) return acc;
      
      const tableTickets = tickets.filter(t => t.groupPurchaseId === groupId);
      const distributedCount = tableTickets.filter(t => t.currentOwner !== t.originalPurchaser).length;
      
      acc[groupId] = {
        groupPurchaseId: groupId,
        tableName: ticket.tableName || 'Unknown',
        buyerEmail: ticket.originalPurchaser || '',
        seatCount: tableTickets.length,
        distributedSeats: distributedCount,
        purchasedAt: ticket.purchasedAt,
        totalAmount: tableTickets.reduce((sum, t) => sum + (t.amount || 0), 0),
        tickets: tableTickets.map(t => ({
          ticketId: t._id,
          seatNumber: t.seatNumber,
          currentOwner: t.currentOwner,
          isClaimed: t.currentOwner !== t.originalPurchaser,
          claimedAt: t.claimedAt,
        })),
      };
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(tables).sort((a, b) => b.purchasedAt - a.purchasedAt);
  },
});

// Get table configuration options for an event
export const getTableOptions = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    // Define standard table configurations
    // This could be customized per event in the future
    return {
      configurations: [
        {
          name: "VIP Table",
          seatCount: 10,
          pricePerSeat: event.price * 1.5, // 50% premium
          description: "Premium table with best view",
          ticketType: "VIP",
        },
        {
          name: "Standard Table",
          seatCount: 10,
          pricePerSeat: event.price,
          description: "Regular table seating",
          ticketType: "GA",
        },
        {
          name: "Small Table",
          seatCount: 6,
          pricePerSeat: event.price,
          description: "Intimate table for smaller groups",
          ticketType: "GA",
        },
      ],
      customAllowed: true, // Allow custom configurations
    };
  },
});

// Get table sale statistics for an event
export const getTableSalesStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("groupType"), "table"))
      .collect();
    
    // Calculate statistics
    const uniqueTables = new Set(tickets.map(t => t.groupPurchaseId)).size;
    const totalSeats = tickets.length;
    const distributedSeats = tickets.filter(t => t.currentOwner !== t.originalPurchaser).length;
    const revenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Group by table type
    const byType = tickets.reduce((acc, ticket) => {
      const type = ticket.tableName?.split(' ')[0] || 'Standard';
      if (!acc[type]) {
        acc[type] = { count: 0, seats: 0, revenue: 0 };
      }
      acc[type].seats++;
      acc[type].revenue += ticket.amount || 0;
      return acc;
    }, {} as Record<string, any>);
    
    // Count unique tables per type
    Object.keys(byType).forEach(type => {
      const typeTables = new Set(
        tickets
          .filter(t => (t.tableName?.split(' ')[0] || 'Standard') === type)
          .map(t => t.groupPurchaseId)
      ).size;
      byType[type].count = typeTables;
    });
    
    return {
      totalTables: uniqueTables,
      totalSeats,
      distributedSeats,
      availableForDistribution: totalSeats - distributedSeats,
      totalRevenue: revenue,
      byType,
    };
  },
});