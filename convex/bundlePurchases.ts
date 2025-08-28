import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a unique master ticket ID
function generateMasterTicketId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "BUNDLE-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a 6-character master access code
function generateMasterAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Purchase a bundle
export const purchaseBundle = mutation({
  args: {
    bundleId: v.id("ticketBundles"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    // Get bundle details
    const bundle = await ctx.db.get(args.bundleId);
    if (!bundle) {
      throw new Error("Bundle not found");
    }
    
    if (!bundle.isActive) {
      throw new Error("This bundle is no longer available");
    }
    
    if (bundle.maxBundles && bundle.soldCount >= bundle.maxBundles) {
      throw new Error("This bundle is sold out");
    }
    
    // Get event details
    const event = await ctx.db.get(bundle.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Generate master codes
    const masterTicketId = generateMasterTicketId();
    const masterAccessCode = generateMasterAccessCode();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";
    const masterQRCode = `${baseUrl}/bundle/${masterTicketId}`;
    
    // Create bundle purchase record
    const purchaseId = await ctx.db.insert("bundlePurchases", {
      bundleId: args.bundleId,
      eventId: bundle.eventId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      masterTicketId,
      masterQRCode,
      masterAccessCode,
      totalAmount: bundle.bundlePrice,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      paymentStatus: "completed",
      generatedTickets: "[]", // Will be populated with individual ticket IDs
      purchasedAt: new Date().toISOString(),
    });
    
    // Parse included days
    const includedDays = JSON.parse(bundle.includedDays);
    const generatedTickets = [];
    
    // Generate individual tickets for each day
    for (const day of includedDays) {
      const eventDay = await ctx.db.get(day.eventDayId as any);
      const ticketType = await ctx.db.get(day.ticketTypeId as any);
      
      if (!eventDay || !ticketType) continue;
      
      // Generate ticket for this day
      const ticketId = `${masterTicketId}-D${(eventDay as any).dayNumber}`;
      const ticketCode = masterAccessCode; // Same code for all days in bundle
      
      await ctx.db.insert("simpleTickets", {
        ticketId,
        ticketCode,
        qrCode: masterQRCode, // Same QR for all days
        eventId: bundle.eventId,
        purchaseId: purchaseId as any, // Type casting for compatibility
        ticketType: (ticketType as any).name, // Add the missing ticketType field
        seatLabel: (ticketType as any).name,
        tableName: `${bundle.name} - ${day.dayLabel}`,
        shareUrl: `${baseUrl}/ticket/${ticketId}`,
        status: "valid",
        scanned: false,
        eventTitle: event.name,
        eventDate: new Date((eventDay as any).date).toLocaleDateString(),
        eventTime: (eventDay as any).startTime,
        eventVenue: (eventDay as any).location || event.location,
        // Bundle-specific fields
        isBundleTicket: true,
        bundleId: args.bundleId,
        bundlePurchaseId: purchaseId,
        validDays: JSON.stringify([day.eventDayId]),
        usedOnDays: "[]",
        createdAt: new Date().toISOString(),
      });
      
      generatedTickets.push(ticketId);
    }
    
    // Update bundle purchase with generated ticket IDs
    await ctx.db.patch(purchaseId, {
      generatedTickets: JSON.stringify(generatedTickets),
    });
    
    // Update bundle sold count
    await ctx.db.patch(args.bundleId, {
      soldCount: bundle.soldCount + 1,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      purchaseId,
      masterTicketId,
      masterAccessCode,
      masterQRCode,
      bundleDetails: {
        name: bundle.name,
        description: bundle.description,
        includedDays: includedDays.length,
        totalSaved: bundle.savingsAmount,
      },
      generatedTickets,
    };
  },
});

// Get bundle purchase details
export const getBundlePurchase = query({
  args: { 
    masterTicketId: v.string(),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("bundlePurchases")
      .withIndex("by_master_ticket", (q) => q.eq("masterTicketId", args.masterTicketId))
      .first();
    
    if (!purchase) {
      return null;
    }
    
    // Get bundle details
    const bundle = await ctx.db.get(purchase.bundleId);
    if (!bundle) {
      return null;
    }
    
    // Get event details
    const event = await ctx.db.get(purchase.eventId);
    if (!event) {
      return null;
    }
    
    // Get all tickets for this bundle
    const tickets = await ctx.db
      .query("simpleTickets")
      .filter((q) => q.eq(q.field("bundlePurchaseId"), purchase._id))
      .collect();
    
    return {
      purchase,
      bundle: {
        ...bundle,
        includedDays: JSON.parse(bundle.includedDays),
      },
      event,
      tickets,
    };
  },
});

// Validate bundle ticket for scanning
export const validateBundleTicket = mutation({
  args: {
    ticketIdentifier: v.string(), // Master ticket ID or access code
    eventDayId: v.id("eventDays"),
    scannedBy: v.string(),
    scannerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Find bundle purchase by master ticket ID or access code
    let purchase = await ctx.db
      .query("bundlePurchases")
      .withIndex("by_master_ticket", (q) => q.eq("masterTicketId", args.ticketIdentifier))
      .first();
    
    if (!purchase) {
      // Try to find by access code
      const allPurchases = await ctx.db
        .query("bundlePurchases")
        .collect();
      
      purchase = allPurchases.find(p => p.masterAccessCode === args.ticketIdentifier) ?? null;
    }
    
    if (!purchase) {
      return {
        valid: false,
        message: "Invalid ticket",
      };
    }
    
    // Get the event day
    const eventDay = await ctx.db.get(args.eventDayId);
    if (!eventDay) {
      return {
        valid: false,
        message: "Invalid event day",
      };
    }
    
    // Check if this bundle includes this day
    const bundle = await ctx.db.get(purchase.bundleId);
    if (!bundle) {
      return {
        valid: false,
        message: "Bundle not found",
      };
    }
    
    const includedDays = JSON.parse(bundle.includedDays);
    const dayIncluded = includedDays.some((d: any) => d.eventDayId === args.eventDayId);
    
    if (!dayIncluded) {
      return {
        valid: false,
        message: "This ticket is not valid for this day",
      };
    }
    
    // Find the specific ticket for this day
    const dayTicket = await ctx.db
      .query("simpleTickets")
      .filter((q) => 
        q.and(
          q.eq(q.field("bundlePurchaseId"), purchase!._id),
          q.eq(q.field("ticketId"), `${purchase!.masterTicketId}-D${eventDay.dayNumber}`)
        )
      )
      .first();
    
    if (!dayTicket) {
      return {
        valid: false,
        message: "Day ticket not found",
      };
    }
    
    // Check if already scanned for this day
    const usedOnDays = JSON.parse(dayTicket.usedOnDays || "[]");
    const alreadyUsed = usedOnDays.some((d: any) => d.dayId === args.eventDayId);
    
    if (alreadyUsed) {
      return {
        valid: false,
        message: "Already checked in for this day",
      };
    }
    
    // Mark as used for this day
    usedOnDays.push({
      dayId: args.eventDayId,
      scannedAt: new Date().toISOString(),
      scannedBy: args.scannedBy,
    });
    
    await ctx.db.patch(dayTicket._id, {
      usedOnDays: JSON.stringify(usedOnDays),
      scanned: true,
      scannedAt: new Date().toISOString(),
      scannedBy: args.scannedBy,
    });
    
    // Log the scan
    await ctx.db.insert("scanLogs", {
      eventId: eventDay.eventId,
      ticketId: dayTicket.ticketId,
      ticketCode: dayTicket.ticketCode,
      scanType: "qr",
      scanResult: "valid",
      scannedBy: args.scannedBy,
      scannerName: args.scannerName,
      scannedAt: new Date().toISOString(),
    });
    
    return {
      valid: true,
      message: "Check-in successful",
      ticketDetails: {
        bundleName: bundle.name,
        dayLabel: eventDay.dayLabel,
        buyerName: purchase.buyerName,
      },
    };
  },
});