import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all platform users with their stats
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get events created by this user
        const events = await ctx.db
          .query("events")
          .withIndex("by_user", (q) => q.eq("userId", user.userId))
          .collect();
        
        // Get tickets purchased by this user
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_user", (q) => q.eq("userId", user.userId))
          .collect();
        
        const validTickets = tickets.filter(
          t => t.status === "valid" || t.status === "used"
        );
        
        return {
          ...user,
          eventsCreated: events.length,
          ticketsPurchased: validTickets.length,
          totalSpent: validTickets.reduce((sum, t) => sum + (t.amount || 0), 0),
          isOrganizer: events.length > 0,
          lastActivity: Math.max(
            user._creationTime,
            ...events.map(e => e._creationTime),
            ...tickets.map(t => t.purchasedAt)
          ),
        };
      })
    );
    
    return usersWithStats;
  },
});

// Get all event organizers with detailed stats
export const getAllOrganizers = query({
  args: {},
  handler: async (ctx) => {
    // Get all events to find unique organizers
    const events = await ctx.db.query("events").collect();
    const organizerIds = [...new Set(events.map(e => e.userId))];
    
    // Get detailed stats for each organizer
    const organizers = await Promise.all(
      organizerIds.map(async (userId) => {
        // Get user info
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), userId))
          .first();
        
        // Get all events by this organizer
        const organizerEvents = events.filter(e => e.userId === userId);
        const upcomingEvents = organizerEvents.filter(e => e.eventDate > Date.now() && !e.is_cancelled);
        const pastEvents = organizerEvents.filter(e => e.eventDate <= Date.now() && !e.is_cancelled);
        const cancelledEvents = organizerEvents.filter(e => e.is_cancelled);
        
        // Calculate total tickets sold and revenue
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let totalCapacity = 0;
        
        for (const event of organizerEvents) {
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
          
          totalTicketsSold += tickets.length;
          totalRevenue += tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
          totalCapacity += event.totalCapacity || event.totalTickets || 0;
        }
        
        // Get payment settings
        const hasPaymentSetup = !!(
          user?.squareLocationId || 
          user?.stripeAccountId || 
          user?.paypalEmail ||
          user?.zelleEmail ||
          user?.bankAccountInfo
        );
        
        // Get affiliate programs
        const affiliatePrograms = await ctx.db
          .query("affiliatePrograms")
          .filter((q) => q.eq(q.field("createdBy"), userId))
          .collect();
        
        return {
          userId,
          name: user?.name || "Unknown",
          email: user?.email || userId,
          
          // Event stats
          totalEvents: organizerEvents.length,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          cancelledEvents: cancelledEvents.length,
          
          // Sales stats
          totalTicketsSold,
          totalRevenue,
          totalCapacity,
          fillRate: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0,
          averageTicketPrice: totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0,
          
          // Platform stats
          platformFees: totalTicketsSold * 1.50,
          netRevenue: totalRevenue - (totalTicketsSold * 1.50),
          
          // Payment & features
          hasPaymentSetup,
          paymentMethods: {
            square: !!user?.squareLocationId,
            stripe: !!user?.stripeAccountId,
            paypal: !!user?.paypalEmail,
            zelle: !!user?.zelleEmail,
            bank: !!user?.bankAccountInfo,
          },
          affiliateProgramsCount: affiliatePrograms.length,
          
          // Activity
          accountCreated: user?._creationTime || 0,
          lastEventCreated: organizerEvents.length > 0 
            ? Math.max(...organizerEvents.map(e => e._creationTime))
            : 0,
        };
      })
    );
    
    return organizers;
  },
});

// Suspend or activate a user
export const toggleUserStatus = mutation({
  args: {
    userId: v.string(),
    suspended: v.boolean(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin verification
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Add suspended field to user
    await ctx.db.patch(user._id, {
      suspended: args.suspended,
      suspendedAt: args.suspended ? Date.now() : undefined,
      suspendedBy: args.suspended ? args.adminEmail : undefined,
    } as any);
    
    return { success: true };
  },
});

// Get user activity logs
export const getUserActivity = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all user activities
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const waitingList = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Combine and sort activities
    const activities = [
      ...events.map(e => ({
        type: "event_created" as const,
        timestamp: e._creationTime,
        details: `Created event: ${e.name}`,
        data: e,
      })),
      ...tickets.map(t => ({
        type: "ticket_purchased" as const,
        timestamp: t.purchasedAt,
        details: `Purchased ticket`,
        data: t,
      })),
      ...waitingList.map(w => ({
        type: "waitlist_joined" as const,
        timestamp: w._creationTime,
        details: `Joined waiting list`,
        data: w,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    return activities;
  },
});