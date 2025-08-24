import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate a unique ticket ID
function generateTicketId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TKT-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a 6-character ticket code
function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Purchase a table and generate tickets
export const purchaseTable = mutation({
  args: {
    tableConfigId: v.id("tableConfigurations"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    paymentReference: v.string(),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get table configuration
    const tableConfig = await ctx.db.get(args.tableConfigId);
    if (!tableConfig) {
      throw new Error("Table configuration not found");
    }
    
    // Check if table is still available
    if (!tableConfig.isActive) {
      throw new Error("This table type is no longer available");
    }
    
    if (tableConfig.maxTables && tableConfig.soldCount >= tableConfig.maxTables) {
      throw new Error("This table type is sold out");
    }
    
    // Get event details
    const event = await ctx.db.get(tableConfig.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      eventId: tableConfig.eventId,
      tableConfigId: args.tableConfigId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      tableName: tableConfig.name,
      seatCount: tableConfig.seatCount,
      totalAmount: tableConfig.price,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
      referralCode: args.referralCode,
    });
    
    // Generate tickets for each seat
    const tickets = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";
    
    for (let seatNum = 1; seatNum <= tableConfig.seatCount; seatNum++) {
      const ticketId = generateTicketId();
      const ticketCode = generateTicketCode();
      const seatLabel = `${tableConfig.name}, Seat ${seatNum}`;
      
      // Create ticket record
      await ctx.db.insert("simpleTickets", {
        ticketId,
        ticketCode,
        qrCode: `${baseUrl}/ticket/${ticketId}`, // QR code contains the URL
        eventId: tableConfig.eventId,
        purchaseId,
        seatLabel,
        tableName: tableConfig.name,
        shareUrl: `${baseUrl}/ticket/${ticketId}`,
        status: "valid",
        scanned: false,
        eventTitle: event.name,
        eventDate: new Date(event.eventDate).toLocaleDateString(),
        eventTime: new Date(event.eventDate).toLocaleTimeString(),
        eventVenue: event.location,
        createdAt: new Date().toISOString(),
      });
      
      tickets.push({
        ticketId,
        ticketCode,
        seatLabel,
        shareUrl: `${baseUrl}/ticket/${ticketId}`,
      });
    }
    
    // Update sold count
    await ctx.db.patch(args.tableConfigId, {
      soldCount: tableConfig.soldCount + 1,
      updatedAt: new Date().toISOString(),
    });
    
    // Handle affiliate commission if applicable
    if (args.referralCode) {
      const affiliate = await ctx.db
        .query("affiliatePrograms")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode!))
        .first();
      
      if (affiliate && affiliate.isActive) {
        const commission = affiliate.commissionPerTicket * tableConfig.seatCount;
        await ctx.db.patch(affiliate._id, {
          totalSold: affiliate.totalSold + tableConfig.seatCount,
          totalEarned: affiliate.totalEarned + commission,
        });
      }
    }
    
    return {
      purchaseId,
      tickets,
      tableConfig: {
        name: tableConfig.name,
        seatCount: tableConfig.seatCount,
        price: tableConfig.price,
      },
    };
  },
});

// Get purchase details with tickets
export const getPurchaseWithTickets = query({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase) {
      throw new Error("Purchase not found");
    }
    
    const tickets = await ctx.db
      .query("simpleTickets")
      .withIndex("by_purchase", (q) => q.eq("purchaseId", args.purchaseId))
      .collect();
    
    const event = await ctx.db.get(purchase.eventId);
    
    return {
      purchase,
      tickets,
      event,
    };
  },
});

// Get purchases by email
export const getPurchasesByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_buyer_email", (q) => q.eq("buyerEmail", args.email))
      .collect();
    
    // Get event details for each purchase
    const purchasesWithEvents = await Promise.all(
      purchases.map(async (purchase) => {
        const event = await ctx.db.get(purchase.eventId);
        const ticketCount = await ctx.db
          .query("simpleTickets")
          .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
          .collect();
        
        return {
          ...purchase,
          event,
          ticketCount: ticketCount.length,
        };
      })
    );
    
    return purchasesWithEvents;
  },
});

// Get event sales summary
export const getEventSales = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const totalRevenue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalTicketsSold = purchases.reduce((sum, p) => sum + p.seatCount, 0);
    
    // Get table breakdown
    const tableBreakdown = purchases.reduce((acc, purchase) => {
      if (!acc[purchase.tableName]) {
        acc[purchase.tableName] = {
          count: 0,
          revenue: 0,
          seats: 0,
        };
      }
      acc[purchase.tableName].count += 1;
      acc[purchase.tableName].revenue += purchase.totalAmount;
      acc[purchase.tableName].seats += purchase.seatCount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; seats: number }>);
    
    return {
      totalPurchases: purchases.length,
      totalRevenue,
      totalTicketsSold,
      tableBreakdown,
      purchases: purchases.slice(0, 10), // Last 10 purchases
    };
  },
});