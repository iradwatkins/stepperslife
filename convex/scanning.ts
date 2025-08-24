import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Validate and scan a ticket by ID or code
export const scanTicket = mutation({
  args: {
    ticketIdentifier: v.string(), // Can be ticketId or ticketCode
    eventId: v.id("events"),
    scannedBy: v.string(), // User ID of staff member
    scannerName: v.string(), // Name of staff member
    scanType: v.union(v.literal("qr"), v.literal("manual")),
    deviceInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find ticket by ID first, then by code
    let ticket = await ctx.db
      .query("simpleTickets")
      .withIndex("by_ticket_id", (q) => q.eq("ticketId", args.ticketIdentifier))
      .first();
    
    if (!ticket) {
      ticket = await ctx.db
        .query("simpleTickets")
        .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketIdentifier))
        .first();
    }
    
    // Determine scan result
    let scanResult: "valid" | "already_used" | "invalid";
    
    if (!ticket) {
      scanResult = "invalid";
    } else if (ticket.eventId !== args.eventId) {
      scanResult = "invalid"; // Wrong event
    } else if (ticket.status !== "valid") {
      scanResult = "invalid"; // Cancelled or refunded
    } else if (ticket.scanned) {
      scanResult = "already_used";
    } else {
      scanResult = "valid";
      
      // Mark ticket as scanned
      await ctx.db.patch(ticket._id, {
        scanned: true,
        scannedAt: new Date().toISOString(),
        scannedBy: args.scannedBy,
        status: "used",
      });
    }
    
    // Log the scan attempt
    await ctx.db.insert("scanLogs", {
      eventId: args.eventId,
      ticketId: ticket?.ticketId || args.ticketIdentifier,
      ticketCode: ticket?.ticketCode || args.ticketIdentifier,
      scanType: args.scanType,
      scanResult,
      scannedBy: args.scannedBy,
      scannerName: args.scannerName,
      deviceInfo: args.deviceInfo,
      scannedAt: new Date().toISOString(),
    });
    
    // Return result with ticket details if found
    return {
      scanResult,
      ticket: ticket ? {
        ticketId: ticket.ticketId,
        seatLabel: ticket.seatLabel,
        tableName: ticket.tableName,
        eventTitle: ticket.eventTitle,
        purchaseId: ticket.purchaseId,
      } : null,
    };
  },
});

// Get a public ticket by ID (no auth required)
export const getPublicTicket = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("simpleTickets")
      .withIndex("by_ticket_id", (q) => q.eq("ticketId", args.ticketId))
      .first();
    
    if (!ticket) {
      return null;
    }
    
    // Don't expose sensitive information
    return {
      ticketId: ticket.ticketId,
      ticketCode: ticket.ticketCode,
      eventTitle: ticket.eventTitle,
      eventDate: ticket.eventDate,
      eventTime: ticket.eventTime,
      eventVenue: ticket.eventVenue,
      seatLabel: ticket.seatLabel,
      tableName: ticket.tableName,
      status: ticket.status,
      scanned: ticket.scanned,
      qrCode: ticket.qrCode,
    };
  },
});

// Get event attendance statistics
export const getEventAttendance = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // Get all tickets for the event
    const tickets = await ctx.db
      .query("simpleTickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const totalTickets = tickets.length;
    const scannedTickets = tickets.filter(t => t.scanned).length;
    const validTickets = tickets.filter(t => t.status === "valid" && !t.scanned).length;
    const cancelledTickets = tickets.filter(t => t.status === "cancelled").length;
    
    // Get recent scans
    const recentScans = await ctx.db
      .query("scanLogs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(10);
    
    // Get scan statistics by table
    const tableStats = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.tableName]) {
        acc[ticket.tableName] = {
          total: 0,
          scanned: 0,
        };
      }
      acc[ticket.tableName].total += 1;
      if (ticket.scanned) {
        acc[ticket.tableName].scanned += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; scanned: number }>);
    
    return {
      totalTickets,
      scannedTickets,
      validTickets,
      cancelledTickets,
      attendanceRate: totalTickets > 0 ? (scannedTickets / totalTickets) * 100 : 0,
      tableStats,
      recentScans,
    };
  },
});

// Get scan logs for an event
export const getEventScanLogs = query({
  args: {
    eventId: v.id("events"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("scanLogs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc");
    
    const logs = args.limit ? await query.take(args.limit) : await query.collect();
    
    return logs;
  },
});

// Manually check in a ticket (for staff override)
export const manualCheckIn = mutation({
  args: {
    ticketCode: v.string(),
    eventId: v.id("events"),
    staffId: v.string(),
    staffName: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("simpleTickets")
      .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketCode))
      .first();
    
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    if (ticket.eventId !== args.eventId) {
      throw new Error("Ticket is for a different event");
    }
    
    // Force check-in even if already scanned
    await ctx.db.patch(ticket._id, {
      scanned: true,
      scannedAt: new Date().toISOString(),
      scannedBy: args.staffId,
      status: "used",
    });
    
    // Log the manual check-in
    await ctx.db.insert("scanLogs", {
      eventId: args.eventId,
      ticketId: ticket.ticketId,
      ticketCode: ticket.ticketCode,
      scanType: "manual",
      scanResult: "valid",
      scannedBy: args.staffId,
      scannerName: args.staffName,
      deviceInfo: `Manual check-in${args.reason ? `: ${args.reason}` : ""}`,
      scannedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      ticket: {
        ticketId: ticket.ticketId,
        seatLabel: ticket.seatLabel,
        tableName: ticket.tableName,
      },
    };
  },
});