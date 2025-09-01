import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Generate a unique ticket ID with sequential numbering
async function generateTicketId(ctx: any): Promise<string> {
  // Get the current year
  const year = new Date().getFullYear();
  
  // Count existing tickets for sequential numbering
  const ticketCount = await ctx.db.query("simpleTickets").collect();
  const nextNumber = (ticketCount.length + 1).toString().padStart(6, '0');
  
  return `TKT-${year}-${nextNumber}`;
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

// Generate a sequential ticket number
async function generateTicketNumber(ctx: any): Promise<string> {
  const year = new Date().getFullYear();
  const ticketCount = await ctx.db.query("simpleTickets").collect();
  const nextNumber = (ticketCount.length + 1).toString().padStart(6, '0');
  return `${year}-${nextNumber}`;
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
      eventDayId: tableConfig.eventDayId,
      purchaseType: "table",
      tableConfigId: args.tableConfigId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      itemName: tableConfig.name,
      quantity: tableConfig.seatCount,
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
      const ticketId = await generateTicketId(ctx);
      const ticketCode = generateTicketCode();
      const ticketNumber = await generateTicketNumber(ctx);
      const seatLabel = `${tableConfig.name}, Seat ${seatNum}`;
      
      // Create ticket record
      await ctx.db.insert("simpleTickets", {
        ticketId,
        ticketCode,
        ticketNumber,
        qrCode: `${baseUrl}/ticket/${ticketId}`, // QR code contains the URL
        eventId: tableConfig.eventId,
        eventDayId: tableConfig.eventDayId,
        purchaseId,
        purchaseEmail: args.buyerEmail, // Link to buyer email
        ticketType: tableConfig.sourceTicketType || "Table Seat",
        ticketTypeId: tableConfig.sourceTicketTypeId,
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
        ticketNumber,
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

// Purchase individual tickets (not tables)
export const purchaseIndividualTickets = mutation({
  args: {
    ticketTypeId: v.id("dayTicketTypes"),
    quantity: v.number(),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    paymentReference: v.string(),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get ticket type
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new Error("Ticket type not found");
    }
    
    // Check availability
    if (ticketType.availableQuantity < args.quantity) {
      throw new Error(`Only ${ticketType.availableQuantity} tickets available`);
    }
    
    // Get event details
    const event = await ctx.db.get(ticketType.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Calculate price (check for early bird)
    const isEarlyBird = ticketType.hasEarlyBird && 
      ticketType.earlyBirdEndDate && 
      Date.now() < ticketType.earlyBirdEndDate;
    const pricePerTicket = isEarlyBird && ticketType.earlyBirdPrice 
      ? ticketType.earlyBirdPrice 
      : ticketType.price;
    const totalAmount = pricePerTicket * args.quantity;
    
    // Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      eventId: ticketType.eventId,
      eventDayId: ticketType.eventDayId,
      purchaseType: "individual",
      ticketTypeId: args.ticketTypeId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      itemName: ticketType.name,
      quantity: args.quantity,
      totalAmount,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
      referralCode: args.referralCode,
    });
    
    // Generate individual tickets
    const tickets = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";
    
    for (let i = 0; i < args.quantity; i++) {
      const ticketId = await generateTicketId(ctx);
      const ticketCode = generateTicketCode();
      const ticketNumber = await generateTicketNumber(ctx);
      
      // Create ticket record
      await ctx.db.insert("simpleTickets", {
        ticketId,
        ticketCode,
        ticketNumber,
        qrCode: `${baseUrl}/ticket/${ticketId}`,
        eventId: ticketType.eventId,
        eventDayId: ticketType.eventDayId,
        purchaseId,
        purchaseEmail: args.buyerEmail, // Link to buyer email
        ticketType: ticketType.name,
        ticketTypeId: args.ticketTypeId,
        seatLabel: undefined, // No seat for individual tickets
        tableName: undefined, // No table for individual tickets
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
        ticketNumber,
        shareUrl: `${baseUrl}/ticket/${ticketId}`,
      });
    }
    
    // Update ticket type availability
    await ctx.db.patch(args.ticketTypeId, {
      availableQuantity: ticketType.availableQuantity - args.quantity,
      soldCount: ticketType.soldCount + args.quantity,
      updatedAt: new Date().toISOString(),
    });
    
    // Handle affiliate commission if applicable
    if (args.referralCode) {
      const affiliate = await ctx.db
        .query("affiliatePrograms")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode!))
        .first();
      
      if (affiliate && affiliate.isActive) {
        const commission = affiliate.commissionPerTicket * args.quantity;
        await ctx.db.patch(affiliate._id, {
          totalSold: affiliate.totalSold + args.quantity,
          totalEarned: affiliate.totalEarned + commission,
        });
      }
    }
    
    return {
      purchaseId,
      tickets,
      ticketType: {
        name: ticketType.name,
        pricePerTicket,
        quantity: args.quantity,
        totalAmount,
        wasEarlyBird: isEarlyBird,
      },
    };
  },
});

// Create test purchase for testing payment flow
export const createTestPurchase = mutation({
  args: {
    eventId: v.id("events"),
    ticketTypeId: v.optional(v.id("dayTicketTypes")),
    quantity: v.number(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    totalAmount: v.number(),
    paymentMethod: v.string(),
    testMode: v.boolean(),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate test mode
    if (!args.testMode) {
      throw new Error("This mutation is only for test purchases");
    }

    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get ticket type if provided
    let ticketTypeName = "General Admission";
    let pricePerTicket = args.totalAmount / args.quantity;
    
    if (args.ticketTypeId) {
      const ticketType = await ctx.db.get(args.ticketTypeId);
      if (ticketType) {
        ticketTypeName = ticketType.name;
        
        // Check if early bird pricing applies
        const isEarlyBird = ticketType.hasEarlyBird && 
          ticketType.earlyBirdEndDate && 
          Date.now() < ticketType.earlyBirdEndDate;
        
        pricePerTicket = isEarlyBird && ticketType.earlyBirdPrice 
          ? ticketType.earlyBirdPrice 
          : ticketType.price;
      }
    }

    // Handle affiliate referral if provided
    let affiliateProgram = null;
    if (args.referralCode) {
      affiliateProgram = await ctx.db
        .query("affiliatePrograms")
        .filter((q) => q.eq(q.field("referralCode"), args.referralCode))
        .filter((q) => q.eq(q.field("eventId"), args.eventId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      
      if (affiliateProgram) {
        // Update affiliate stats
        await ctx.db.patch(affiliateProgram._id, {
          totalSold: affiliateProgram.totalSold + args.quantity,
          totalEarned: affiliateProgram.totalEarned + (affiliateProgram.commissionPerTicket * args.quantity),
        });
        
        console.log(`Affiliate sale recorded: ${args.referralCode} - ${args.quantity} tickets`);
      }
    }

    // Create purchase record with TEST prefix
    const purchaseId = await ctx.db.insert("purchases", {
      eventId: args.eventId,
      eventDayId: undefined, // Single day event for test
      purchaseType: "individual",
      ticketTypeId: args.ticketTypeId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      itemName: `TEST - ${ticketTypeName}`,
      quantity: args.quantity,
      totalAmount: args.totalAmount,
      paymentMethod: "test_cash",
      paymentReference: `TEST-${Date.now()}`,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
      referralCode: args.referralCode || undefined,
      affiliateId: affiliateProgram?._id || undefined,
    });

    // Generate test tickets
    const tickets = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";

    for (let i = 0; i < args.quantity; i++) {
      const baseTicketId = await generateTicketId(ctx);
      const ticketId = `TEST-${baseTicketId}`;
      const ticketCode = generateTicketCode();
      const ticketNumber = await generateTicketNumber(ctx);
      
      // Create ticket record
      const ticketDbId = await ctx.db.insert("simpleTickets", {
        ticketId,
        ticketCode,
        ticketNumber,
        qrCode: `${baseUrl}/ticket/${ticketId}`,
        eventId: args.eventId,
        eventDayId: undefined,
        purchaseId,
        purchaseEmail: args.buyerEmail, // Link to buyer email
        ticketType: ticketTypeName,
        ticketTypeId: args.ticketTypeId,
        seatLabel: undefined,
        tableName: undefined,
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
        id: ticketDbId,
        ticketId,
        ticketCode,
        ticketNumber,
        qrData: `${baseUrl}/ticket/${ticketId}`,
        shareUrl: `${baseUrl}/ticket/${ticketId}`,
        ticketType: ticketTypeName,
      });
    }

    // Update ticket type availability if applicable
    if (args.ticketTypeId) {
      const ticketType = await ctx.db.get(args.ticketTypeId);
      if (ticketType) {
        await ctx.db.patch(args.ticketTypeId, {
          availableQuantity: Math.max(0, ticketType.availableQuantity - args.quantity),
          soldCount: ticketType.soldCount + args.quantity,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Schedule email sending (commented out for now - email handled via API)
    // await ctx.scheduler.runAfter(0, internal.emailActions.sendPurchaseEmail, {
    //   buyerName: args.buyerName,
    //   buyerEmail: args.buyerEmail,
    //   eventName: event.name,
    //   eventDate: new Date(event.eventDate).toLocaleDateString(),
    //   eventTime: new Date(event.eventDate).toLocaleTimeString(),
    //   eventLocation: event.location,
    //   tickets: tickets.map(t => ({
    //     ticketId: t.ticketId,
    //     ticketNumber: t.ticketNumber,
    //     ticketCode: t.ticketCode,
    //     ticketType: t.ticketType,
    //     shareUrl: t.shareUrl,
    //   })),
    //   totalAmount: args.totalAmount,
    //   purchaseId: purchaseId.toString(),
    // });

    return {
      purchaseId,
      tickets,
      event: {
        name: event.name,
        date: event.eventDate,
        location: event.location,
      },
      purchase: {
        ticketType: ticketTypeName,
        quantity: args.quantity,
        totalAmount: args.totalAmount,
        isTestPurchase: true,
      },
    };
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
    const totalTicketsSold = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
    
    // Get breakdown by type
    const typeBreakdown = purchases.reduce((acc, purchase) => {
      const key = purchase.purchaseType || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          revenue: 0,
          tickets: 0,
        };
      }
      acc[key].count += 1;
      acc[key].revenue += purchase.totalAmount;
      acc[key].tickets += purchase.quantity || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; tickets: number }>);
    
    return {
      totalPurchases: purchases.length,
      totalRevenue,
      totalTicketsSold,
      typeBreakdown,
      purchases: purchases.slice(0, 10), // Last 10 purchases
    };
  },
});

// Get all customers for a seller's events
export const getSellerCustomers = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    // First get all events for this seller
    const sellerEvents = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.sellerId))
      .collect();
    
    const eventIds = sellerEvents.map(e => e._id);
    
    // Get all purchases for these events
    const allPurchases = [];
    for (const eventId of eventIds) {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      
      // Add event info to each purchase
      const event = sellerEvents.find(e => e._id === eventId);
      const purchasesWithEvent = purchases.map(p => ({
        ...p,
        eventName: event?.name || "Unknown Event",
        eventDate: event?.eventDate || 0,
      }));
      
      allPurchases.push(...purchasesWithEvent);
    }
    
    return allPurchases;
  },
});