import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Get seller dashboard statistics
export const getDashboardStats = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    // Get all events for this seller
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.sellerId))
      .collect();

    // Get all tickets sold for seller's events
    const eventIds = events.map(e => e._id);
    const allTickets = [];
    
    for (const eventId of eventIds) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      allTickets.push(...tickets);
    }

    // Get payment transactions for this seller (if table exists)
    // For now, we'll skip this as paymentTransactions table doesn't exist yet
    const transactions = [];

    // Calculate statistics
    const soldTickets = allTickets.filter(t => t.status === "valid" || t.status === "used");
    const pendingTickets = allTickets.filter(t => t.paymentStatus === "pending");
    
    const totalRevenue = soldTickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
    const pendingRevenue = pendingTickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
    
    // Platform fee is $1.50 per ticket
    const platformFees = soldTickets.length * 1.50;
    const providerFees = totalRevenue * 0.029; // Average 2.9% payment processing
    const totalFees = platformFees + providerFees;
    const availableBalance = totalRevenue - totalFees;

    // Get monthly stats (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyTickets = soldTickets.filter(t => 
      t.purchasedAt && t.purchasedAt > thirtyDaysAgo
    );
    const monthlyRevenue = monthlyTickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
    const monthlyFees = (monthlyTickets.length * 1.50) + (monthlyRevenue * 0.029);
    const monthlyEarnings = monthlyRevenue - monthlyFees;

    // Get weekly stats (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyTickets = soldTickets.filter(t => 
      t.purchasedAt && t.purchasedAt > sevenDaysAgo
    );
    const weeklyRevenue = weeklyTickets.reduce((sum, ticket) => sum + (ticket.amount || 0), 0);
    const weeklyFees = (weeklyTickets.length * 1.50) + (weeklyRevenue * 0.029);
    const weeklyEarnings = weeklyRevenue - weeklyFees;

    // Calculate percentage changes (mock for now since we need historical data)
    const monthlyChange = 12.5; // Would need to compare with previous month
    const weeklyChange = -3.2; // Would need to compare with previous week

    return {
      overview: {
        availableBalance,
        pendingBalance: pendingRevenue,
        processingBalance: 0, // Would need payment status tracking
        totalEarnings: totalRevenue,
        totalPayouts: 0, // Would need payout history
        monthlyEarnings,
        monthlyChange,
        weeklyEarnings,
        weeklyChange,
        totalFees,
        platformFees,
        providerFees,
      },
      ticketStats: {
        totalSold: soldTickets.length,
        totalPending: pendingTickets.length,
        totalEvents: events.length,
      }
    };
  },
});

// Get recent transactions for seller
export const getRecentTransactions = query({
  args: { 
    sellerId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get seller's events
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.sellerId))
      .collect();
    
    const eventIds = events.map(e => e._id);
    const eventMap = new Map(events.map(e => [e._id, e]));
    
    // Get recent tickets for these events
    const recentTickets = [];
    for (const eventId of eventIds) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .order("desc")
        .take(limit);
      
      // Add event info to each ticket
      const event = eventMap.get(eventId);
      const ticketsWithEvent = tickets.map((t: any) => ({
        ...t,
        eventName: event?.name || "Unknown Event",
        eventDate: event?.eventDate || 0,
      }));
      recentTickets.push(...ticketsWithEvent);
    }

    // Sort by purchase date and limit
    const sortedTickets = recentTickets
      .sort((a, b) => (b.purchasedAt || 0) - (a.purchasedAt || 0))
      .slice(0, limit);

    // Transform to transaction format
    return sortedTickets.map(ticket => {
      const price = ticket.amount || 0;
      const platformFee = 1.50;
      const providerFee = price * 0.029;
      const sellerPayout = price - platformFee - providerFee;
      
      return {
        id: ticket._id,
        date: ticket.purchasedAt ? new Date(ticket.purchasedAt).toISOString() : new Date().toISOString(),
        eventName: ticket.eventName,
        eventDate: ticket.eventDate,
        buyerEmail: ticket.buyerEmail || "guest@example.com",
        buyerName: ticket.buyerName || "Guest",
        amount: price,
        ticketCount: 1,
        provider: ticket.paymentMethod || "square",
        platformFee,
        providerFee,
        sellerPayout,
        status: ticket.status || "completed",
        paymentMethod: ticket.paymentMethod || "Card",
      };
    });
  },
});

// Get upcoming events for seller
export const getUpcomingEvents = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get upcoming events
    const upcomingEvents = await ctx.db
      .query("events")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.sellerId),
          q.gte(q.field("eventDate"), now)
        )
      )
      .order("asc")
      .take(10);

    // Get ticket stats for each event
    const eventsWithStats = [];
    for (const event of upcomingEvents) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      
      const soldTickets = tickets.filter(t => 
        t.status === "valid" || t.status === "used"
      );
      
      const revenue = soldTickets.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      eventsWithStats.push({
        id: event._id,
        name: event.name,
        date: new Date(event.eventDate).toISOString(),
        location: event.location || "TBA",
        ticketsSold: soldTickets.length,
        totalCapacity: event.totalTickets || 0,
        revenue,
        price: event.price || 0,
      });
    }

    return eventsWithStats;
  },
});

// Get payment methods for seller
export const getPaymentMethods = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    // This would typically fetch from a payment_methods table
    // For now, return mock data structure
    return {
      preferred: "square",
      connected: [
        { 
          provider: "square", 
          status: "active", 
          lastPayout: null,
          acceptsCashApp: true 
        },
      ],
    };
  },
});

// Get payout history
export const getPayoutHistory = query({
  args: { 
    sellerId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This would fetch from a payouts table
    // For now, return empty array since we don't have payout tracking yet
    return [];
  },
});

// Get analytics data for seller
export const getAnalytics = query({
  args: { 
    sellerId: v.string(),
    period: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    const period = args.period || "month";
    
    // Get seller's events
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.sellerId))
      .collect();
    
    const eventIds = events.map(e => e._id);
    
    // Calculate time range
    let startDate = Date.now();
    if (period === "week") {
      startDate = Date.now() - (7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = Date.now() - (365 * 24 * 60 * 60 * 1000);
    }

    // Get tickets in period
    const periodTickets = [];
    for (const eventId of eventIds) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.gte(q.field("purchasedAt"), startDate))
        .collect();
      periodTickets.push(...tickets);
    }

    // Calculate revenue by payment method
    const revenueByMethod: Record<string, number> = {};
    let totalRevenue = 0;
    
    for (const ticket of periodTickets) {
      const method = ticket.paymentMethod || "square";
      const price = ticket.amount || 0;
      revenueByMethod[method] = (revenueByMethod[method] || 0) + price;
      totalRevenue += price;
    }

    // Calculate percentages
    const methodPercentages = Object.entries(revenueByMethod).map(([method, revenue]) => ({
      method,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }));

    // Calculate fees
    const platformFees = periodTickets.length * 1.50;
    const providerFees = totalRevenue * 0.029;
    const totalFees = platformFees + providerFees;
    const averageFeeRate = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;

    return {
      period,
      totalRevenue,
      totalTickets: periodTickets.length,
      revenueByMethod: methodPercentages,
      fees: {
        platformFees,
        providerFees,
        totalFees,
        averageFeeRate,
      },
    };
  },
});