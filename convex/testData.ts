import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a complete test event with all ticket configurations
export const createTestEventWithAllTicketTypes = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a 3-day weekend festival event
    const eventId = await ctx.db.insert("events", {
      name: "Summer Music Festival 2025",
      description: "A 3-day music festival with multiple ticket options for testing",
      eventDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      location: "Central Park, New York",
      userId: "test_organizer",
      price: 25, // Base price
      totalTickets: 1000,
      isTicketed: true,
      is_cancelled: false,
      eventMode: "multi_day",
      isMultiDay: true,
      eventCategories: ["social_dance", "sets", "competition"],
    });

    // Create 3 event days for the multi-day event
    const day1Id = await ctx.db.insert("eventDays", {
      eventId,
      dayNumber: 1,
      dayLabel: "Day 1",
      date: Date.now() + 30 * 24 * 60 * 60 * 1000,
      startTime: "10:00 AM",
      endTime: "11:00 PM",
      location: "Central Park, New York",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const day2Id = await ctx.db.insert("eventDays", {
      eventId,
      dayNumber: 2,
      dayLabel: "Day 2",
      date: Date.now() + 31 * 24 * 60 * 60 * 1000,
      startTime: "10:00 AM",
      endTime: "11:00 PM",
      location: "Central Park, New York",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const day3Id = await ctx.db.insert("eventDays", {
      eventId,
      dayNumber: 3,
      dayLabel: "Day 3",
      date: Date.now() + 32 * 24 * 60 * 60 * 1000,
      startTime: "10:00 AM",
      endTime: "11:00 PM",
      location: "Central Park, New York",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create ticket types for each day
    // Day 1 - Single tickets
    const gaDay1Id = await ctx.db.insert("dayTicketTypes", {
      eventId,
      eventDayId: day1Id,
      name: "General Admission - Day 1",
      category: "general",
      price: 25,
      hasEarlyBird: false,
      allocatedQuantity: 500,
      availableQuantity: 500,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Day 2 - Group tickets
    const gaDay2Id = await ctx.db.insert("dayTicketTypes", {
      eventId,
      eventDayId: day2Id,
      name: "General Admission - Day 2",
      category: "general",
      price: 25,
      hasEarlyBird: false,
      allocatedQuantity: 500,
      availableQuantity: 500,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create group discount for Day 2
    const groupTicketId = await ctx.db.insert("dayTicketTypes", {
      eventId,
      eventDayId: day2Id,
      name: "Group Package (4 tickets) - Day 2",
      category: "general",
      price: 90, // Discounted from $100
      hasEarlyBird: false,
      allocatedQuantity: 200, // 50 groups of 4
      availableQuantity: 200,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Day 3 - VIP tickets for table configuration
    const vipDay3Id = await ctx.db.insert("dayTicketTypes", {
      eventId,
      eventDayId: day3Id,
      name: "VIP - Day 3",
      category: "vip",
      price: 100,
      hasEarlyBird: false,
      allocatedQuantity: 100,
      availableQuantity: 100,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create VIP Table configuration
    const vipTableId = await ctx.db.insert("tableConfigurations", {
      eventId,
      eventDayId: day3Id,
      name: "VIP Table (8 seats)",
      seatCount: 8,
      price: 400, // $50 per seat for 8 seats
      description: "Premium VIP table with bottle service and dedicated waiter",
      sourceTicketTypeId: vipDay3Id,
      sourceTicketType: "VIP - Day 3",
      maxTables: 10,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create Weekend Bundle
    const bundleId = await ctx.db.insert("ticketBundles", {
      eventId,
      name: "Weekend Pass - All 3 Days",
      description: "Access to all 3 days of the festival - Save $10!",
      bundleType: "all_days_same_type",
      includedDays: JSON.stringify([
        { dayId: day1Id, ticketTypeId: gaDay1Id, ticketType: "General Admission" },
        { dayId: day2Id, ticketTypeId: gaDay2Id, ticketType: "General Admission" },
        { dayId: day3Id, ticketTypeId: vipDay3Id, ticketType: "General Admission" }
      ]),
      bundlePrice: 65, // Save $10 from individual pricing ($75)
      savingsAmount: 10,
      maxBundles: 100,
      soldCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      eventId,
      eventDays: [day1Id, day2Id, day3Id],
      ticketTypes: {
        single: gaDay1Id,
        group: groupTicketId,
        vip: vipDay3Id,
        table: vipTableId,
        bundle: bundleId
      },
      message: "Test event created successfully with all ticket configurations"
    };
  },
});

// Create a test purchase for all ticket types
export const createAllTestPurchases = mutation({
  args: {
    eventId: v.id("events"),
    singleTicketId: v.id("dayTicketTypes"),
    groupTicketId: v.id("dayTicketTypes"),
    tableId: v.id("tableConfigurations"),
    bundleId: v.id("ticketBundles"),
  },
  handler: async (ctx, args) => {
    const results = [];
    const buyerEmail = "Appvillagellc@gmail.com";
    const buyerName = "Test Customer";
    const buyerPhone = "555-0123";

    // Helper function to generate ticket number
    async function getNextTicketNumber(ctx: any): Promise<string> {
      const year = new Date().getFullYear();
      const ticketCount = await ctx.db.query("simpleTickets").collect();
      const nextNumber = (ticketCount.length + 1).toString().padStart(6, '0');
      return `${year}-${nextNumber}`;
    }

    // Helper to generate ticket code
    function generateTicketCode(): string {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    // 1. Single Ticket Purchase
    const singlePurchaseId = await ctx.db.insert("purchases", {
      eventId: args.eventId,
      eventDayId: undefined,
      purchaseType: "individual",
      ticketTypeId: args.singleTicketId,
      buyerEmail,
      buyerName,
      buyerPhone,
      itemName: "General Admission - Day 1",
      quantity: 1,
      totalAmount: 25,
      paymentMethod: "cash",
      paymentReference: `CASH-${Date.now()}-1`,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
    });

    // Generate single ticket
    const singleTicketId = `TKT-${Date.now()}-1`;
    await ctx.db.insert("simpleTickets", {
      ticketId: singleTicketId,
      ticketCode: generateTicketCode(),
      ticketNumber: await getNextTicketNumber(ctx),
      qrCode: `https://stepperslife.com/ticket/${singleTicketId}`,
      eventId: args.eventId,
      purchaseId: singlePurchaseId,
      purchaseEmail: buyerEmail,
      ticketType: "General Admission - Day 1",
      ticketTypeId: args.singleTicketId,
      shareUrl: `https://stepperslife.com/ticket/${singleTicketId}`,
      status: "valid",
      scanned: false,
      eventTitle: "Summer Music Festival 2025",
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      eventTime: "10:00 AM",
      eventVenue: "Central Park, New York",
      createdAt: new Date().toISOString(),
    });

    results.push({
      type: "Single Ticket",
      purchaseId: singlePurchaseId,
      quantity: 1,
      amount: 25
    });

    // 2. Group Ticket Purchase (4 tickets)
    const groupPurchaseId = await ctx.db.insert("purchases", {
      eventId: args.eventId,
      eventDayId: undefined,
      purchaseType: "table",
      ticketTypeId: args.groupTicketId,
      buyerEmail,
      buyerName,
      buyerPhone,
      itemName: "Group Package (4 tickets) - Day 2",
      quantity: 4,
      totalAmount: 90,
      paymentMethod: "cash",
      paymentReference: `CASH-${Date.now()}-2`,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
    });

    // Generate 4 tickets for group
    for (let i = 0; i < 4; i++) {
      const groupTicketId = `TKT-${Date.now()}-G${i + 1}`;
      await ctx.db.insert("simpleTickets", {
        ticketId: groupTicketId,
        ticketCode: generateTicketCode(),
        ticketNumber: await getNextTicketNumber(ctx),
        qrCode: `https://stepperslife.com/ticket/${groupTicketId}`,
        eventId: args.eventId,
        purchaseId: groupPurchaseId,
        purchaseEmail: buyerEmail,
        ticketType: "Group Package - Day 2",
        ticketTypeId: args.groupTicketId,
        shareUrl: `https://stepperslife.com/ticket/${groupTicketId}`,
        status: "valid",
        scanned: false,
        eventTitle: "Summer Music Festival 2025",
        eventDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        eventTime: "10:00 AM",
        eventVenue: "Central Park, New York",
        createdAt: new Date().toISOString(),
      });
    }

    results.push({
      type: "Group Tickets",
      purchaseId: groupPurchaseId,
      quantity: 4,
      amount: 90
    });

    // 3. VIP Table Purchase (8 seats)
    const tablePurchaseId = await ctx.db.insert("purchases", {
      eventId: args.eventId,
      eventDayId: undefined,
      purchaseType: "table",
      tableConfigId: args.tableId,
      buyerEmail,
      buyerName,
      buyerPhone,
      itemName: "VIP Table (8 seats)",
      quantity: 8,
      totalAmount: 400,
      paymentMethod: "cash",
      paymentReference: `CASH-${Date.now()}-3`,
      paymentStatus: "completed",
      purchasedAt: new Date().toISOString(),
    });

    // Generate 8 tickets for table
    for (let i = 0; i < 8; i++) {
      const tableTicketId = `TKT-${Date.now()}-T${i + 1}`;
      await ctx.db.insert("simpleTickets", {
        ticketId: tableTicketId,
        ticketCode: generateTicketCode(),
        ticketNumber: await getNextTicketNumber(ctx),
        qrCode: `https://stepperslife.com/ticket/${tableTicketId}`,
        eventId: args.eventId,
        purchaseId: tablePurchaseId,
        purchaseEmail: buyerEmail,
        ticketType: "VIP Table Seat",
        seatLabel: `VIP Table, Seat ${i + 1}`,
        tableName: "VIP Table",
        shareUrl: `https://stepperslife.com/ticket/${tableTicketId}`,
        status: "valid",
        scanned: false,
        eventTitle: "Summer Music Festival 2025",
        eventDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        eventTime: "10:00 AM",
        eventVenue: "Central Park, New York",
        createdAt: new Date().toISOString(),
      });
    }

    // Update table sold count
    const tableConfig = await ctx.db.get(args.tableId);
    if (tableConfig) {
      await ctx.db.patch(args.tableId, {
        soldCount: tableConfig.soldCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    results.push({
      type: "VIP Table",
      purchaseId: tablePurchaseId,
      quantity: 8,
      amount: 400
    });

    // 4. Weekend Bundle Purchase
    const bundlePurchaseId = await ctx.db.insert("bundlePurchases", {
      bundleId: args.bundleId,
      eventId: args.eventId,
      buyerEmail,
      buyerName,
      buyerPhone,
      masterTicketId: `BUNDLE-${Date.now()}`,
      masterQRCode: `https://stepperslife.com/bundle/BUNDLE-${Date.now()}`,
      masterAccessCode: generateTicketCode(),
      totalAmount: 65,
      paymentMethod: "cash",
      paymentReference: `CASH-${Date.now()}-4`,
      paymentStatus: "completed",
      generatedTickets: "[]", // Will be populated with individual day tickets
      purchasedAt: new Date().toISOString(),
    });

    // Create a master ticket for the bundle
    const bundleTicketId = `TKT-BUNDLE-${Date.now()}`;
    await ctx.db.insert("simpleTickets", {
      ticketId: bundleTicketId,
      ticketCode: generateTicketCode(),
      ticketNumber: await getNextTicketNumber(ctx),
      qrCode: `https://stepperslife.com/ticket/${bundleTicketId}`,
      eventId: args.eventId,
      // @ts-ignore - bundlePurchaseId is from bundlePurchases table, not purchases
      purchaseId: bundlePurchaseId as any,
      purchaseEmail: buyerEmail,
      ticketType: "Weekend Pass - All 3 Days",
      isBundleTicket: true,
      bundleId: args.bundleId,
      bundlePurchaseId,
      validDays: JSON.stringify(["day1", "day2", "day3"]),
      shareUrl: `https://stepperslife.com/ticket/${bundleTicketId}`,
      status: "valid",
      scanned: false,
      eventTitle: "Summer Music Festival 2025 - Weekend Pass",
      eventDate: "All 3 Days",
      eventTime: "10:00 AM",
      eventVenue: "Central Park, New York",
      createdAt: new Date().toISOString(),
    });

    // Update bundle sold count
    const bundle = await ctx.db.get(args.bundleId);
    if (bundle) {
      await ctx.db.patch(args.bundleId, {
        soldCount: bundle.soldCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    results.push({
      type: "Weekend Bundle",
      // @ts-ignore - bundlePurchaseId is from bundlePurchases table, not purchases
      purchaseId: bundlePurchaseId as any,
      quantity: 1,
      amount: 65
    });

    return {
      success: true,
      totalPurchases: 4,
      totalTickets: 14, // 1 + 4 + 8 + 1
      totalAmount: 580, // 25 + 90 + 400 + 65
      purchases: results,
      buyerEmail,
      message: "All test purchases created successfully!"
    };
  },
});