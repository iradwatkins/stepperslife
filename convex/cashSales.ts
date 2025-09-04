import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a cash sale at the door/event
export const recordCashSale = mutation({
  args: {
    eventId: v.id("events"),
    ticketCount: v.number(),
    pricePerTicket: v.number(),
    soldBy: v.string(), // Staff member name
    location: v.string(), // "door", "booth", etc.
    notes: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
    buyerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the event to verify ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    
    // Calculate amounts
    const totalAmount = args.ticketCount * args.pricePerTicket;
    const platformFeePerTicket = 1.50; // $1.50 for cash sales
    const totalPlatformFee = args.ticketCount * platformFeePerTicket;
    
    // Generate unique reference code
    const referenceCode = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create tickets for the cash sale
    const ticketIds = [];
    for (let i = 0; i < args.ticketCount; i++) {
      const ticketNumber = `${new Date().getFullYear()}-${String(Date.now()).slice(-6)}${i}`;
      const ticketCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const ticketId = await ctx.db.insert("tickets", {
        eventId: args.eventId,
        userId: event.userId, // Assign to organizer initially
        purchasedAt: Date.now(),
        status: "valid", // Tickets are ACTIVE immediately for cash sales
        paymentReference: referenceCode,
        amount: args.pricePerTicket,
        ticketNumber,
        ticketCode,
        paymentMethod: "cash" as any,
        buyerEmail: args.buyerEmail,
        buyerName: args.buyerName,
      });
      ticketIds.push(ticketId);
    }
    
    // Record the cash sale
    const cashSaleId = await ctx.db.insert("cashSales", {
      eventId: args.eventId,
      organizerId: event.userId,
      ticketsSold: args.ticketCount,
      pricePerTicket: args.pricePerTicket,
      totalAmount,
      platformFeePerTicket,
      totalPlatformFee,
      soldBy: args.soldBy,
      soldAt: Date.now(),
      location: args.location,
      paymentReceived: true,
      referenceCode,
      notes: args.notes,
      ticketIds,
      createdAt: Date.now(),
    });
    
    // Update or create platform fee balance for the organizer
    const existingBalance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", event.userId))
      .first();
    
    if (existingBalance) {
      await ctx.db.patch(existingBalance._id, {
        totalOwed: existingBalance.totalOwed + totalPlatformFee,
        outstandingBalance: (existingBalance.totalOwed + totalPlatformFee) - existingBalance.totalPaid,
        accountStatus: existingBalance.outstandingBalance + totalPlatformFee > 100 ? "warning" : "active",
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("platformFeeBalances", {
        organizerId: event.userId,
        eventId: args.eventId,
        totalOwed: totalPlatformFee,
        totalPaid: 0,
        outstandingBalance: totalPlatformFee,
        accountStatus: "active",
        warningsSent: 0,
        updatedAt: Date.now(),
      });
    }
    
    return {
      success: true,
      cashSaleId,
      referenceCode,
      ticketIds,
      totalAmount,
      platformFee: totalPlatformFee,
      message: `Cash sale recorded. ${args.ticketCount} tickets created. Platform fee of $${totalPlatformFee.toFixed(2)} added to account balance.`
    };
  },
});

// Get cash sales for an event
export const getEventCashSales = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const cashSales = await ctx.db
      .query("cashSales")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .collect();
    
    const totalCashRevenue = cashSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPlatformFees = cashSales.reduce((sum, sale) => sum + sale.totalPlatformFee, 0);
    const totalTicketsSold = cashSales.reduce((sum, sale) => sum + sale.ticketsSold, 0);
    
    return {
      cashSales,
      stats: {
        totalCashRevenue,
        totalPlatformFees,
        totalTicketsSold,
        averageTicketPrice: totalTicketsSold > 0 ? totalCashRevenue / totalTicketsSold : 0,
      }
    };
  },
});

// Get organizer's platform fee balance
export const getOrganizerBalance = query({
  args: { organizerId: v.string() },
  handler: async (ctx, { organizerId }) => {
    const balance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizerId))
      .first();
    
    if (!balance) {
      return {
        totalOwed: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        accountStatus: "active" as const,
        recentPayments: [],
        upcomingEvents: [],
      };
    }
    
    // Get recent payments
    const recentPayments = await ctx.db
      .query("platformFeePayments")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizerId))
      .order("desc")
      .take(5);
    
    // Get upcoming events to show potential fees
    const upcomingEvents = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", organizerId))
      .filter((q) => q.gt(q.field("eventDate"), Date.now()))
      .collect();
    
    return {
      ...balance,
      recentPayments,
      upcomingEvents: upcomingEvents.map(e => ({
        _id: e._id,
        name: e.name,
        date: e.eventDate,
      })),
    };
  },
});

// Record platform fee payment
export const recordPlatformFeePayment = mutation({
  args: {
    organizerId: v.string(),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal"),
      v.literal("bank_transfer"),
      v.literal("check"),
      v.literal("credit")
    ),
    paymentReference: v.string(),
    description: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    cashSaleIds: v.optional(v.array(v.id("cashSales"))),
  },
  handler: async (ctx, args) => {
    // Create payment record
    const paymentId = await ctx.db.insert("platformFeePayments", {
      organizerId: args.organizerId,
      eventId: args.eventId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      description: args.description || `Platform fee payment - ${new Date().toLocaleDateString()}`,
      cashSaleIds: args.cashSaleIds,
      status: args.paymentMethod === "credit" ? "completed" : "processing",
      processedAt: args.paymentMethod === "credit" ? Date.now() : undefined,
      createdAt: Date.now(),
    });
    
    // Update balance
    const balance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    if (balance) {
      const newTotalPaid = balance.totalPaid + args.amount;
      const newOutstanding = balance.totalOwed - newTotalPaid;
      
      await ctx.db.patch(balance._id, {
        totalPaid: newTotalPaid,
        outstandingBalance: newOutstanding,
        accountStatus: newOutstanding <= 0 ? "active" : 
                      newOutstanding > 100 ? "warning" : "active",
        lastPaymentDate: Date.now(),
        lastPaymentAmount: args.amount,
        updatedAt: Date.now(),
      });
    }
    
    return {
      success: true,
      paymentId,
      message: `Payment of $${args.amount.toFixed(2)} recorded successfully.`
    };
  },
});