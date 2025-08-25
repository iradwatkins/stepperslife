// ============================================
// SIMPLIFIED TICKET SYSTEM FOR STEPPERSLIFE
// No Registration Required - Simple Distribution
// ============================================

// ============================================
// PART 1: SIMPLIFIED CONVEX SCHEMA
// File: convex/schema.ts
// ============================================

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - Only for organizers and purchasers
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    
    // Profile
    phone: v.optional(v.string()),
    isOrganizer: v.boolean(),
    organizerName: v.optional(v.string()),
    
    // Payment
    stripeCustomerId: v.optional(v.string()),
    stripeAccountId: v.optional(v.string()),
    
    createdAt: v.string(),
  })
    .index("by_email", ["email"]),

  // Events table
  events: defineTable({
    // Basic Info
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
    
    // Type
    eventType: v.union(v.literal("ticketed"), v.literal("no-ticket")),
    
    // Organizer
    organizerId: v.id("users"),
    organizerName: v.string(),
    organizerContact: v.string(),
    
    // Date & Time
    startDate: v.string(),
    startTime: v.string(),
    endDate: v.string(),
    endTime: v.string(),
    timezone: v.string(),
    
    // Location
    locationType: v.union(v.literal("physical"), v.literal("online"), v.literal("hybrid")),
    venue: v.optional(v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    })),
    onlineUrl: v.optional(v.string()),
    
    // Non-Ticketed Pricing
    doorPrice: v.optional(v.number()),
    earlyBirdDoorPrice: v.optional(v.number()),
    earlyBirdCutoffTime: v.optional(v.string()),
    
    // Capacity
    totalCapacity: v.optional(v.number()),
    ticketsSold: v.number(),
    ticketsScanned: v.number(),
    
    // Status
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("cancelled"), v.literal("completed")),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("unlisted")),
    
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["status"]),

  // Table Configurations - Simple
  tableConfigurations: defineTable({
    eventId: v.id("events"),
    
    // Configuration
    tableName: v.string(),
    tableSize: v.number(), // Number of tickets per table
    
    // Pricing
    pricePerSeat: v.number(),
    earlyBirdPricePerSeat: v.optional(v.number()),
    earlyBirdEndDate: v.optional(v.string()),
    
    // Inventory
    totalTables: v.number(),
    tablesSold: v.number(),
    
    // Details
    description: v.optional(v.string()),
    
    // Status
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("sold_out")),
    displayOrder: v.number(),
    
    createdAt: v.string(),
  })
    .index("by_event", ["eventId"]),

  // Purchases - Track who bought what
  purchases: defineTable({
    eventId: v.id("events"),
    tableConfigId: v.optional(v.id("tableConfigurations")),
    purchaserId: v.id("users"),
    
    // Purchase Details
    purchaseNumber: v.string(),
    purchaseType: v.union(v.literal("table"), v.literal("individual")),
    quantity: v.number(), // Number of tables or tickets
    totalTickets: v.number(), // Total tickets in this purchase
    
    // Pricing
    unitPrice: v.number(),
    totalPrice: v.number(),
    
    // Payment
    stripePaymentIntentId: v.string(),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
    
    // Contact for ticket delivery
    purchaserEmail: v.string(),
    purchaserName: v.string(),
    purchaserPhone: v.optional(v.string()),
    
    // Timestamps
    purchasedAt: v.string(),
  })
    .index("by_purchaser", ["purchaserId"])
    .index("by_event", ["eventId"])
    .index("by_purchase_number", ["purchaseNumber"]),

  // Tickets - Simple, no ownership tracking
  tickets: defineTable({
    // Identity
    ticketId: v.string(), // Unique ticket ID
    ticketCode: v.string(), // Short code for manual entry
    qrCode: v.string(), // QR code data
    
    // Event Info
    eventId: v.id("events"),
    purchaseId: v.id("purchases"),
    
    // Table Info (if applicable)
    tableConfigId: v.optional(v.id("tableConfigurations")),
    seatLabel: v.optional(v.string()), // "Table 1, Seat 3"
    
    // Share Links
    shareUrl: v.string(), // Public URL to view ticket
    pdfUrl: v.optional(v.string()), // Generated PDF URL
    
    // Status
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("cancelled")
    ),
    
    // Check-in
    scanned: v.boolean(),
    scannedAt: v.optional(v.string()),
    scannedBy: v.optional(v.id("users")), // Staff member who scanned
    
    // Event Details (denormalized for PDF generation)
    eventTitle: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    eventVenue: v.optional(v.string()),
    
    createdAt: v.string(),
  })
    .index("by_ticket_id", ["ticketId"])
    .index("by_ticket_code", ["ticketCode"])
    .index("by_purchase", ["purchaseId"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"]),

  // Scan Log - Track entry attempts
  scanLogs: defineTable({
    eventId: v.id("events"),
    ticketId: v.string(),
    
    // Scan Details
    scanResult: v.union(v.literal("success"), v.literal("already_used"), v.literal("invalid")),
    scannedBy: v.optional(v.id("users")),
    scanLocation: v.optional(v.string()), // "Main Entrance", "VIP Entry"
    
    // Device Info (for security)
    deviceId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    
    timestamp: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_ticket", ["ticketId"]),
});

// ============================================
// PART 2: PURCHASE & TICKET GENERATION
// File: convex/purchases.ts
// ============================================

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Purchase a table
export const purchaseTable = mutation({
  args: {
    tableConfigId: v.id("tableConfigurations"),
    quantity: v.number(), // Number of tables
    purchaserEmail: v.string(),
    purchaserName: v.string(),
    purchaserPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    // Get table configuration
    const tableConfig = await ctx.db.get(args.tableConfigId);
    if (!tableConfig) throw new Error("Table configuration not found");

    // Get event details
    const event = await ctx.db.get(tableConfig.eventId);
    if (!event) throw new Error("Event not found");

    // Check availability
    const availableTables = tableConfig.totalTables - tableConfig.tablesSold;
    if (args.quantity > availableTables) {
      throw new Error(`Only ${availableTables} tables available`);
    }

    // Calculate pricing
    const totalTickets = tableConfig.tableSize * args.quantity;
    const isEarlyBird = tableConfig.earlyBirdEndDate && 
      new Date(tableConfig.earlyBirdEndDate) > new Date();
    const pricePerSeat = isEarlyBird && tableConfig.earlyBirdPricePerSeat
      ? tableConfig.earlyBirdPricePerSeat
      : tableConfig.pricePerSeat;
    const totalPrice = pricePerSeat * totalTickets;

    // Create purchase record
    const purchaseNumber = `PUR-${Date.now().toString(36).toUpperCase()}`;
    const purchaseId = await ctx.db.insert("purchases", {
      eventId: tableConfig.eventId,
      tableConfigId: args.tableConfigId,
      purchaserId: user._id,
      purchaseNumber,
      purchaseType: "table",
      quantity: args.quantity,
      totalTickets,
      unitPrice: pricePerSeat,
      totalPrice,
      stripePaymentIntentId: `pi_mock_${Date.now()}`, // Replace with real Stripe
      paymentStatus: "completed",
      purchaserEmail: args.purchaserEmail,
      purchaserName: args.purchaserName,
      purchaserPhone: args.purchaserPhone,
      purchasedAt: new Date().toISOString(),
    });

    // Generate tickets
    const tickets = [];
    for (let tableNum = 1; tableNum <= args.quantity; tableNum++) {
      for (let seatNum = 1; seatNum <= tableConfig.tableSize; seatNum++) {
        const ticketId = generateTicketId();
        const ticketCode = generateTicketCode();
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${ticketId}`;
        
        const ticket = await ctx.db.insert("tickets", {
          ticketId,
          ticketCode,
          qrCode: JSON.stringify({ 
            id: ticketId, 
            code: ticketCode,
            event: tableConfig.eventId 
          }),
          eventId: tableConfig.eventId,
          purchaseId,
          tableConfigId: args.tableConfigId,
          seatLabel: `Table ${tableNum}, Seat ${seatNum}`,
          shareUrl,
          status: "valid",
          scanned: false,
          eventTitle: event.title,
          eventDate: event.startDate,
          eventTime: event.startTime,
          eventVenue: event.venue?.name,
          createdAt: new Date().toISOString(),
        });
        
        tickets.push({
          ticketId,
          ticketCode,
          shareUrl,
          seatLabel: `Table ${tableNum}, Seat ${seatNum}`,
        });
      }
    }

    // Update table inventory
    await ctx.db.patch(args.tableConfigId, {
      tablesSold: tableConfig.tablesSold + args.quantity,
      status: tableConfig.tablesSold + args.quantity >= tableConfig.totalTables
        ? "sold_out"
        : "active",
    });

    // Update event ticket count
    await ctx.db.patch(tableConfig.eventId, {
      ticketsSold: event.ticketsSold + totalTickets,
    });

    return {
      purchaseId,
      purchaseNumber,
      tickets,
      totalPrice,
      purchaserEmail: args.purchaserEmail,
    };
  },
});

// Get purchase with tickets
export const getPurchaseWithTickets = query({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase) return null;

    const tickets = await ctx.db
      .query("tickets")
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

// Get ticket by ID (public - no auth required)
export const getTicketPublic = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_id", (q) => q.eq("ticketId", args.ticketId))
      .collect();

    const ticket = tickets[0];
    if (!ticket) return null;

    const event = await ctx.db.get(ticket.eventId);

    return {
      ticket,
      event,
    };
  },
});

// Helper functions
function generateTicketId(): string {
  return `TKT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
}

function generateTicketCode(): string {
  // 6-character alphanumeric code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ============================================
// PART 3: TICKET SCANNING
// File: convex/scanning.ts
// ============================================

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Scan a ticket
export const scanTicket = mutation({
  args: {
    ticketIdentifier: v.string(), // Can be ticketId or ticketCode
    eventId: v.id("events"),
    scanLocation: v.optional(v.string()),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find ticket by ID first
    let tickets = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_id", (q) => q.eq("ticketId", args.ticketIdentifier))
      .collect();

    // If not found, try by code
    if (tickets.length === 0) {
      tickets = await ctx.db
        .query("tickets")
        .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketIdentifier))
        .collect();
    }

    const ticket = tickets[0];

    // Log the scan attempt
    let scanResult: "success" | "already_used" | "invalid";
    
    if (!ticket) {
      scanResult = "invalid";
    } else if (ticket.eventId !== args.eventId) {
      scanResult = "invalid";
    } else if (ticket.status === "cancelled") {
      scanResult = "invalid";
    } else if (ticket.scanned) {
      scanResult = "already_used";
    } else {
      scanResult = "success";
      
      // Mark ticket as used
      await ctx.db.patch(ticket._id, {
        status: "used",
        scanned: true,
        scannedAt: new Date().toISOString(),
      });

      // Update event scan count
      const event = await ctx.db.get(args.eventId);
      if (event) {
        await ctx.db.patch(args.eventId, {
          ticketsScanned: event.ticketsScanned + 1,
        });
      }
    }

    // Log the scan
    await ctx.db.insert("scanLogs", {
      eventId: args.eventId,
      ticketId: args.ticketIdentifier,
      scanResult,
      scanLocation: args.scanLocation,
      deviceId: args.deviceId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: scanResult === "success",
      result: scanResult,
      ticket: ticket ? {
        ticketId: ticket.ticketId,
        seatLabel: ticket.seatLabel,
        eventTitle: ticket.eventTitle,
      } : null,
    };
  },
});

// Get event scan statistics
export const getEventScanStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const recentScans = await ctx.db
      .query("scanLogs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(100);

    const successfulScans = recentScans.filter(s => s.scanResult === "success").length;
    const duplicateScans = recentScans.filter(s => s.scanResult === "already_used").length;
    const invalidScans = recentScans.filter(s => s.scanResult === "invalid").length;

    return {
      totalSold: event.ticketsSold,
      totalScanned: event.ticketsScanned,
      percentageScanned: event.ticketsSold > 0 
        ? Math.round((event.ticketsScanned / event.ticketsSold) * 100)
        : 0,
      recentScans: {
        successful: successfulScans,
        duplicate: duplicateScans,
        invalid: invalidScans,
      },
    };
  },
});

// ============================================
// PART 4: UI COMPONENTS
// ============================================

// File: app/purchase/[tableConfigId]/success/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Download, Mail, Copy, Share2, Check, 
  QrCode, Ticket, Calendar, MapPin 
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode.react";

export default function PurchaseSuccessPage({ 
  searchParams 
}: { 
  searchParams: { purchaseId: string } 
}) {
  const purchaseData = useQuery(api.purchases.getPurchaseWithTickets, {
    purchaseId: searchParams.purchaseId as Id<"purchases">,
  });

  const [copiedTickets, setCopiedTickets] = useState<Set<string>>(new Set());
  const [emailSent, setEmailSent] = useState(false);

  if (!purchaseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { purchase, tickets, event } = purchaseData;

  const copyShareLink = (ticketId: string, shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedTickets(new Set([...copiedTickets, ticketId]));
    toast.success("Share link copied!");
    
    setTimeout(() => {
      setCopiedTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }, 2000);
  };

  const downloadPDF = async (ticket: any) => {
    // In production, generate actual PDF
    const pdfContent = `
      Event: ${ticket.eventTitle}
      Date: ${ticket.eventDate}
      Time: ${ticket.eventTime}
      Venue: ${ticket.eventVenue || "TBA"}
      Ticket ID: ${ticket.ticketId}
      Ticket Code: ${ticket.ticketCode}
      ${ticket.seatLabel || ""}
    `;
    
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.ticketCode}.pdf`;
    a.click();
    
    toast.success("Ticket downloaded!");
  };

  const downloadAllPDFs = async () => {
    // In production, create a ZIP file with all PDFs
    for (const ticket of tickets) {
      await downloadPDF(ticket);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
    }
  };

  const emailTickets = async () => {
    // In production, send actual email
    setEmailSent(true);
    toast.success(`Tickets sent to ${purchase.purchaserEmail}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Purchase Successful!</h1>
            <p className="text-gray-600">
              Order #{purchase.purchaseNumber}
            </p>
          </div>

          <div className="border-t border-b py-4 my-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Event:</span>
                <p className="font-semibold">{event?.title}</p>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <p className="font-semibold">{event?.startDate} at {event?.startTime}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Tickets:</span>
                <p className="font-semibold">{purchase.totalTickets}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Paid:</span>
                <p className="font-semibold">${purchase.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={emailTickets}
              disabled={emailSent}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              <Mail className="w-5 h-5 mr-2" />
              {emailSent ? "Sent!" : `Email to ${purchase.purchaserEmail}`}
            </button>
            
            <button
              onClick={downloadAllPDFs}
              className="flex items-center justify-center px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              <Download className="w-5 h-5 mr-2" />
              Download All PDFs
            </button>
            
            <button
              onClick={() => {
                const allLinks = tickets.map(t => t.shareUrl).join("\n");
                navigator.clipboard.writeText(allLinks);
                toast.success("All share links copied!");
              }}
              className="flex items-center justify-center px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy All Links
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">How to Share Your Tickets</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share the ticket link - no registration required</li>
            <li>• Send PDF via email or messaging apps</li>
            <li>• Download and print physical tickets</li>
            <li>• Recipients can use QR code or ticket code at entry</li>
          </ul>
        </div>

        {/* Individual Tickets */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Your Tickets</h2>
          
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Ticket className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold">{ticket.seatLabel || "General Admission"}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Ticket ID:</span>
                      <p className="font-mono">{ticket.ticketId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Entry Code:</span>
                      <p className="font-mono text-lg font-bold">{ticket.ticketCode}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copyShareLink(ticket.ticketId, ticket.shareUrl)}
                      className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      {copiedTickets.has(ticket.ticketId) ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Link
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadPDF(ticket)}
                      className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </button>
                    
                    <button
                      onClick={() => {
                        // In production, implement actual email sending
                        toast.success("Email feature coming soon!");
                      }}
                      className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </button>
                    
                    <a
                      href={ticket.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      View Ticket
                    </a>
                  </div>
                </div>

                <div className="ml-4">
                  <QRCode 
                    value={ticket.qrCode} 
                    size={100}
                    level="M"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">QR Code</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Instructions */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Save this page or bookmark it to access your tickets later.</p>
          <p>Questions? Contact {event?.organizerContact}</p>
        </div>
      </div>
    </div>
  );
}

// File: app/ticket/[ticketId]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import QRCode from "qrcode.react";

export default function PublicTicketPage() {
  const params = useParams();
  const ticketData = useQuery(api.purchases.getTicketPublic, {
    ticketId: params.ticketId as string,
  });

  if (!ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
          <p className="text-gray-600">This ticket link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const { ticket, event } = ticketData;

  if (ticket.status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Ticket Cancelled</h2>
          <p className="text-gray-600">This ticket has been cancelled.</p>
        </div>
      </div>
    );
  }

  if (ticket.status === "used") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Ticket Already Used</h2>
          <p className="text-gray-600">This ticket was scanned at {ticket.scannedAt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Event Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{event?.title}</h1>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{event?.startDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{event?.startTime}</span>
              </div>
              {event?.venue && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.venue.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6">
            <div className="text-center mb-6">
              <QRCode 
                value={ticket.qrCode} 
                size={200}
                level="H"
                className="mx-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Entry Code</p>
                <p className="text-2xl font-bold font-mono">{ticket.ticketCode}</p>
              </div>

              {ticket.seatLabel && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Seating</p>
                  <p className="text-lg font-semibold">{ticket.seatLabel}</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">Ticket ID</p>
                <p className="text-xs font-mono text-gray-600">{ticket.ticketId}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
            <p className="font-semibold mb-1">Entry Instructions</p>
            <p>Show this QR code or provide the entry code at the venue</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

// File: app/events/[eventId]/scan/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  QrCode, CheckCircle, XCircle, AlertCircle, 
  Users, TrendingUp, Search 
} from "lucide-react";
import { toast } from "sonner";

export default function EventScanPage() {
  const params = useParams();
  const eventId = params.eventId as Id<"events">;
  
  const scanTicket = useMutation(api.scanning.scanTicket);
  const stats = useQuery(api.scanning.getEventScanStats, { eventId });
  
  const [manualCode, setManualCode] = useState("");
  const [lastScan, setLastScan] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (code: string) => {
    setScanning(true);
    try {
      const result = await scanTicket({
        ticketIdentifier: code,
        eventId,
        scanLocation: "Main Entrance",
        deviceId: navigator.userAgent,
      });

      setLastScan(result);
      
      if (result.success) {
        toast.success("Ticket validated successfully!");
      } else if (result.result === "already_used") {
        toast.error("Ticket already scanned!");
      } else {
        toast.error("Invalid ticket!");
      }
      
      setManualCode("");
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      handleScan(manualCode.toUpperCase());
    }
  };

  // In production, integrate with camera QR scanner
  useEffect(() => {
    // Initialize QR scanner here
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Event Check-In</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="text-2xl font-bold">{stats?.totalSold || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold">{stats?.totalScanned || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-2xl font-bold">{stats?.percentageScanned || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold">
                  {(stats?.totalSold || 0) - (stats?.totalScanned || 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Scan Ticket</h2>
            
            {/* QR Scanner Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">QR Scanner Active</p>
              <p className="text-sm text-gray-500 mt-2">
                Position QR code within frame
              </p>
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualEntry}>
              <label className="block text-sm font-medium mb-2">
                Or Enter Code Manually
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg uppercase"
                  placeholder="Enter ticket code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  disabled={scanning}
                />
                <button
                  type="submit"
                  disabled={scanning || !manualCode}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Last Scan Result */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Last Scan Result</h2>
            
            {lastScan ? (
              <div className={`p-6 rounded-lg ${
                lastScan.success 
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-red-50 border-2 border-red-500"
              }`}>
                <div className="flex items-start">
                  {lastScan.success ? (
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  ) : lastScan.result === "already_used" ? (
                    <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 mr-3" />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {lastScan.success 
                        ? "Valid Ticket"
                        : lastScan.result === "already_used"
                        ? "Already Scanned"
                        : "Invalid Ticket"}
                    </h3>
                    
                    {lastScan.ticket && (
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Ticket ID:</span>{" "}
                          <span className="font-mono">{lastScan.ticket.ticketId}</span>
                        </p>
                        {lastScan.ticket.seatLabel && (
                          <p>
                            <span className="text-gray-600">Seat:</span>{" "}
                            <span className="font-semibold">{lastScan.ticket.seatLabel}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No scans yet</p>
                <p className="text-sm mt-1">Scan a ticket to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentScans && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats.recentScans.successful}
                </p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.recentScans.duplicate}
                </p>
                <p className="text-sm text-gray-600">Duplicates</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {stats.recentScans.invalid}
                </p>
                <p className="text-sm text-gray-600">Invalid</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}