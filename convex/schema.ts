import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")), // Convex storage for event images
    is_cancelled: v.optional(v.boolean()),
    // New fields for simplified ticket system
    isTicketed: v.optional(v.boolean()), // true = online tickets, false = door pricing only (optional for backward compatibility)
    doorPrice: v.optional(v.number()), // Price at the door for non-ticketed events
    // Event categorization
    eventType: v.optional(v.union(
      v.literal("workshop"),
      v.literal("sets"),
      v.literal("in_the_park"),
      v.literal("trip"),
      v.literal("cruise"),
      v.literal("holiday"),
      v.literal("competition"),
      v.literal("class"),
      v.literal("other")
    )),
    // Geolocation fields
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_event_date", ["eventDate"])
    .index("by_event_type", ["eventType"])
    .index("by_city", ["city"])
    .index("by_location", ["latitude", "longitude"]),
  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentMethod: v.optional(v.union(
      v.literal("stripe"),
      v.literal("paypal"),
      v.literal("square"),
      v.literal("bank"),
      v.literal("zelle")
    )),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    )),
    paymentReference: v.optional(v.string()), // Generic payment reference (was paymentIntentId)
    amount: v.optional(v.number()), // Amount in USD
    // Enhanced ticket fields for check-in system
    backupCode: v.optional(v.string()),
    ticketType: v.optional(v.union(
      v.literal("VIP"),
      v.literal("GA"),
      v.literal("EARLY_BIRD"),
      v.literal("STAFF")
    )),
    checkedInAt: v.optional(v.number()),
    checkedInBy: v.optional(v.string()),
    checkInMethod: v.optional(v.union(
      v.literal("qr"),
      v.literal("manual"),
      v.literal("backup_code")
    )),
    seatNumber: v.optional(v.string()),
    accessZone: v.optional(v.string()),
    // Ownership and transfer fields
    currentOwner: v.optional(v.string()),     // Current ticket holder
    originalPurchaser: v.optional(v.string()), // Who bought it initially
    claimToken: v.optional(v.string()),       // Unique token for claiming
    isClaimable: v.optional(v.boolean()),     // Can be claimed by someone else
    claimedAt: v.optional(v.number()),        // When it was claimed
    // Group purchase fields (for tables)
    groupPurchaseId: v.optional(v.string()),  // Links tickets bought together
    groupType: v.optional(v.union(
      v.literal("table"),
      v.literal("individual")
    )),
    tableName: v.optional(v.string()),        // "VIP Table 1"
    // Affiliate tracking
    referralCode: v.optional(v.string()),     // Which affiliate sold it
    affiliateCommission: v.optional(v.number()), // Commission amount for this ticket
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_reference", ["paymentReference"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user", ["userId"]),

  eventStaff: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    role: v.union(
      v.literal("scanner"),
      v.literal("manager"),
      v.literal("organizer")
    ),
    permissions: v.array(v.string()),
    addedAt: v.number(),
    addedBy: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    // Payment provider credentials
    // Square/CashApp
    squareAccessToken: v.optional(v.string()),
    squareRefreshToken: v.optional(v.string()),
    squareLocationId: v.optional(v.string()),
    squareMerchantId: v.optional(v.string()),
    // Stripe
    stripeAccountId: v.optional(v.string()),
    stripeAccessToken: v.optional(v.string()),
    // PayPal
    paypalEmail: v.optional(v.string()),
    paypalMerchantId: v.optional(v.string()),
    // Bank Transfer
    bankAccountInfo: v.optional(v.string()), // Encrypted JSON
    // Zelle
    zelleEmail: v.optional(v.string()),
    zellePhone: v.optional(v.string()),
    // User preferences
    preferredPaymentMethod: v.optional(v.union(
      v.literal("stripe"),
      v.literal("paypal"),
      v.literal("square"),
      v.literal("bank"),
      v.literal("zelle")
    )),
    passwordHash: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  payments: defineTable({
    paymentId: v.string(),
    metadata: v.object({
      eventId: v.id("events"),
      userId: v.string(),
      waitingListId: v.id("waitingList"),
    }),
    createdAt: v.number(),
  })
    .index("by_payment_id", ["paymentId"]),

  // Platform financial tracking
  platformTransactions: defineTable({
    eventId: v.id("events"),
    eventName: v.string(),
    ticketId: v.id("tickets"),
    sellerId: v.string(),
    buyerId: v.string(),
    buyerEmail: v.string(),
    amount: v.number(), // Amount in USD
    platformFee: v.number(), // Platform fee in USD
    sellerPayout: v.number(), // Seller payout in USD
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    ),
    paymentId: v.string(), // Generic payment ID (was squarePaymentId)
    paymentProvider: v.union(
      v.literal("stripe"),
      v.literal("paypal"),
      v.literal("square"),
      v.literal("bank"),
      v.literal("zelle")
    ),
    paymentDetails: v.optional(v.string()), // JSON for provider-specific data
    refundAmount: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sellerId", ["sellerId"])
    .index("by_buyerId", ["buyerId"])
    .index("by_eventId", ["eventId"])
    .index("by_status", ["status"])
    .index("by_provider", ["paymentProvider"]),

  // Manual payment requests for bank/Zelle
  paymentRequests: defineTable({
    userId: v.string(),
    eventId: v.id("events"),
    ticketId: v.optional(v.id("tickets")),
    waitingListId: v.id("waitingList"),
    method: v.union(v.literal("bank"), v.literal("zelle")),
    amount: v.number(), // Amount in USD
    referenceNumber: v.string(), // Unique reference for tracking
    status: v.union(
      v.literal("pending"),
      v.literal("awaiting_proof"),
      v.literal("reviewing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    // Seller's payment details
    paymentInstructions: v.string(), // JSON with bank/Zelle details
    // Buyer's proof of payment
    proofOfPayment: v.optional(v.id("_storage")), // File upload
    proofUploadedAt: v.optional(v.number()),
    // Admin approval
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(), // Manual payments expire after 24 hours
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"])
    .index("by_reference", ["referenceNumber"]),

  sellerBalances: defineTable({
    userId: v.string(),
    availableBalance: v.number(),
    pendingBalance: v.number(),
    totalEarnings: v.number(),
    totalPayouts: v.number(),
    lastPayout: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  payoutRequests: defineTable({
    sellerId: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    bankDetails: v.object({
      accountNumber: v.string(),
      sortCode: v.string(),
      accountName: v.string(),
    }),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_sellerId", ["sellerId"])
    .index("by_status", ["status"]),

  // Track ticket claims and transfers
  ticketClaims: defineTable({
    ticketId: v.id("tickets"),
    claimToken: v.string(),
    
    // From → To
    fromUser: v.string(),              // Who shared it
    toUser: v.optional(v.string()),    // Who claimed it (after registration)
    
    // Status
    status: v.union(
      v.literal("active"),             // Link is active
      v.literal("claimed"),            // Someone claimed it
      v.literal("expired")             // Link expired
    ),
    
    createdAt: v.number(),
    claimedAt: v.optional(v.number()),
    expiresAt: v.number(),             // 30 days to claim
  })
    .index("by_token", ["claimToken"])
    .index("by_ticket", ["ticketId"])
    .index("by_status", ["status"]),

  // Affiliate programs for commission-based sales
  affiliatePrograms: defineTable({
    eventId: v.id("events"),
    affiliateUserId: v.string(),
    affiliateEmail: v.string(),
    affiliateName: v.string(),
    
    // Unique code like "JOHN-SUMMER25"
    referralCode: v.string(),
    
    // Fixed commission per ticket
    commissionPerTicket: v.number(),
    
    // Tracking
    totalSold: v.number(),
    totalEarned: v.number(),
    
    // Status
    isActive: v.boolean(),
    createdBy: v.string(),             // Organizer who created this
    createdAt: v.number(),
    deactivatedAt: v.optional(v.number()),
  })
    .index("by_referral_code", ["referralCode"])
    .index("by_event", ["eventId"])
    .index("by_affiliate", ["affiliateUserId"]),
  
  // ===== NEW SIMPLIFIED TICKET SYSTEM TABLES =====
  
  // Table configurations for events
  tableConfigurations: defineTable({
    eventId: v.id("events"),
    name: v.string(), // "VIP Table", "General Table"
    seatCount: v.number(), // Number of seats at this table
    price: v.number(), // Total price for the entire table
    description: v.optional(v.string()), // Optional description
    maxTables: v.optional(v.number()), // Max number of this table type available
    soldCount: v.number(), // How many of this table type sold
    isActive: v.boolean(), // Can still be purchased
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_active", ["eventId", "isActive"]),
  
  // Simplified purchases table
  purchases: defineTable({
    eventId: v.id("events"),
    tableConfigId: v.id("tableConfigurations"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    
    // Purchase details
    tableName: v.string(), // Copy of table config name at time of purchase
    seatCount: v.number(), // Number of tickets generated
    totalAmount: v.number(), // Total paid
    
    // Payment info
    paymentMethod: v.string(), // "square", "stripe", etc.
    paymentReference: v.string(), // Payment ID from provider
    paymentStatus: v.string(), // "completed", "pending", "failed"
    
    // Timestamps
    purchasedAt: v.string(),
    
    // Optional fields for tracking
    referralCode: v.optional(v.string()), // Affiliate tracking
    notes: v.optional(v.string()),
  })
    .index("by_event", ["eventId"])
    .index("by_buyer_email", ["buyerEmail"])
    .index("by_payment_reference", ["paymentReference"]),
  
  // Simplified tickets table - no ownership tracking
  simpleTickets: defineTable({
    ticketId: v.string(), // Unique ID like "TKT-ABC123"
    ticketCode: v.string(), // 6-char code for manual entry
    qrCode: v.string(), // QR code data
    
    // Event relationship
    eventId: v.id("events"),
    purchaseId: v.id("purchases"),
    
    // Seat info
    seatLabel: v.optional(v.string()), // "Table 1, Seat 3"
    tableName: v.string(), // "VIP Table"
    
    // Public sharing
    shareUrl: v.string(), // Public URL like "stepperslife.com/ticket/ABC123"
    
    // Status
    status: v.union(v.literal("valid"), v.literal("used"), v.literal("cancelled")),
    scanned: v.boolean(),
    scannedAt: v.optional(v.string()),
    scannedBy: v.optional(v.string()), // Staff member who scanned
    
    // Event details for display (denormalized for easy access)
    eventTitle: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    eventVenue: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.string(),
  })
    .index("by_ticket_id", ["ticketId"])
    .index("by_ticket_code", ["ticketCode"])
    .index("by_event", ["eventId"])
    .index("by_purchase", ["purchaseId"])
    .index("by_status", ["status"]),
  
  // Scan logs for tracking check-ins
  scanLogs: defineTable({
    eventId: v.id("events"),
    ticketId: v.string(),
    ticketCode: v.string(),
    
    // Scan details
    scanType: v.union(v.literal("qr"), v.literal("manual")),
    scanResult: v.union(v.literal("valid"), v.literal("already_used"), v.literal("invalid")),
    
    // Scanner info
    scannedBy: v.string(), // User ID of staff member
    scannerName: v.string(), // Name of staff member
    deviceInfo: v.optional(v.string()), // Browser/device info
    
    // Timestamps
    scannedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_ticket", ["ticketId"])
    .index("by_scanner", ["scannedBy"])
    .index("by_timestamp", ["scannedAt"]),
});
