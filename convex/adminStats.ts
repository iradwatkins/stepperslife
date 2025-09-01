import { query } from "./_generated/server";
import { v } from "convex/values";

// Get platform-wide statistics for admin dashboard
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all events
    const events = await ctx.db.query("events").collect();
    const upcomingEvents = events.filter(e => e.eventDate > Date.now() && !e.is_cancelled);
    const pastEvents = events.filter(e => e.eventDate <= Date.now() && !e.is_cancelled);
    const cancelledEvents = events.filter(e => e.is_cancelled);

    // Get all tickets
    const tickets = await ctx.db.query("tickets").collect();
    const validTickets = tickets.filter(t => t.status === "valid" || t.status === "used");
    const refundedTickets = tickets.filter(t => t.status === "refunded");
    
    // Calculate revenue
    const totalRevenue = validTickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    const platformFees = validTickets.length * 1.50; // $1.50 per ticket

    // Get all users
    const users = await ctx.db.query("users").collect();
    
    // Get unique event organizers (users who have created events)
    const organizerIds = new Set(events.map(e => e.userId));
    const activeOrganizers = organizerIds.size;

    // Get recent activity (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentTickets = tickets.filter(t => t.purchasedAt > weekAgo);
    const recentEvents = events.filter(e => e._creationTime > weekAgo);

    // Get daily ticket sales for the last 30 days
    const dailySales = new Map<string, number>();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    validTickets
      .filter(t => t.purchasedAt > thirtyDaysAgo)
      .forEach(ticket => {
        const date = new Date(ticket.purchasedAt).toISOString().split('T')[0];
        dailySales.set(date, (dailySales.get(date) || 0) + 1);
      });

    // Convert to array for chart data
    const chartData = Array.from(dailySales.entries())
      .map(([date, count]) => ({ date, tickets: count, revenue: count * 1.50 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      // Overview stats
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      cancelledEvents: cancelledEvents.length,
      
      // Ticket stats
      totalTicketsSold: validTickets.length,
      refundedTickets: refundedTickets.length,
      
      // Financial stats
      totalRevenue,
      platformFees,
      averageTicketPrice: validTickets.length > 0 ? totalRevenue / validTickets.length : 0,
      
      // User stats
      totalUsers: users.length,
      activeOrganizers,
      
      // Recent activity
      recentTicketsSold: recentTickets.length,
      recentEventsCreated: recentEvents.length,
      
      // Chart data
      dailySalesChart: chartData,
    };
  },
});

// Get recent events for admin dashboard
export const getRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const events = await ctx.db
      .query("events")
      .order("desc")
      .take(limit);
    
    // Add ticket count for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        
        const soldCount = tickets.filter(
          t => t.status === "valid" || t.status === "used"
        ).length;
        
        return {
          ...event,
          soldCount,
          revenue: soldCount * (event.price || 0),
        };
      })
    );
    
    return eventsWithStats;
  },
});

// Get top organizers by revenue
export const getTopOrganizers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get all events with their tickets
    const events = await ctx.db.query("events").collect();
    const organizerStats = new Map<string, { 
      userId: string;
      eventCount: number;
      ticketsSold: number;
      revenue: number;
    }>();
    
    for (const event of events) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .filter((q) => 
          q.or(
            q.eq(q.field("status"), "valid"),
            q.eq(q.field("status"), "used")
          )
        )
        .collect();
      
      const revenue = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const current = organizerStats.get(event.userId) || {
        userId: event.userId,
        eventCount: 0,
        ticketsSold: 0,
        revenue: 0,
      };
      
      organizerStats.set(event.userId, {
        userId: event.userId,
        eventCount: current.eventCount + 1,
        ticketsSold: current.ticketsSold + tickets.length,
        revenue: current.revenue + revenue,
      });
    }
    
    // Get user details and sort by revenue
    const organizersWithDetails = await Promise.all(
      Array.from(organizerStats.values()).map(async (stats) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), stats.userId))
          .first();
        
        return {
          ...stats,
          name: user?.name || "Unknown",
          email: user?.email || stats.userId,
        };
      })
    );
    
    return organizersWithDetails
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },
});

// Get recent ticket purchases
export const getRecentPurchases = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const tickets = await ctx.db
      .query("tickets")
      .order("desc")
      .take(limit);
    
    // Add event details for each ticket
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), ticket.userId))
          .first();
        
        return {
          ...ticket,
          eventName: event?.name || "Unknown Event",
          eventDate: event?.eventDate,
          userName: user?.name || ticket.userId,
          userEmail: user?.email || "",
        };
      })
    );
    
    return ticketsWithDetails;
  },
});