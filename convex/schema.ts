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
    // Temporary: keeping imageStorageId to fix migration
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()), // External image URL
    is_cancelled: v.optional(v.boolean()),
    // New fields for simplified ticket system
    isTicketed: v.optional(v.boolean()), // true = online tickets, false = door pricing only (optional for backward compatibility)
    doorPrice: v.optional(v.number()), // Price at the door for non-ticketed events
    // Event categorization - supports multiple categories
    eventType: v.optional(v.union(
      v.literal("workshop"),
      v.literal("sets"),
      v.literal("in_the_park"),
      v.literal("trip"),
      v.literal("cruise"),
      v.literal("holiday"),
      v.literal("competition"),
      v.literal("class"),
      v.literal("social_dance"),
      v.literal("lounge_bar"),
      v.literal("other")
    )),
    // NEW: Support for multiple event categories
    eventCategories: v.optional(v.array(v.union(
      v.literal("workshop"),
      v.literal("sets"),
      v.literal("in_the_park"),
      v.literal("trip"),
      v.literal("cruise"),
      v.literal("holiday"),
      v.literal("competition"),
      v.literal("class"),
      v.literal("social_dance"),
      v.literal("lounge_bar"),
      v.literal("other")
    ))),
    // Geolocation fields
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    // Multi-day event support
    endDate: v.optional(v.number()), // Last day of multi-day event
    isMultiDay: v.optional(v.boolean()), // Flag for multi-day events
    isSaveTheDate: v.optional(v.boolean()), // Save the date events (no location required)
    sameLocation: v.optional(v.boolean()), // All days at same location for multi-day events
    // Capacity management fields
    totalCapacity: v.optional(v.number()), // Total venue capacity (replaces totalTickets eventually)
    capacityBreakdown: v.optional(v.string()), // JSON of ticket type allocations
    eventMode: v.optional(v.union(
      v.literal("single"),
      v.literal("multi_day"),
      v.literal("save_the_date")
    )),
    // Admin posting fields
    postedByAdmin: v.optional(v.boolean()), // True if posted by admin on behalf of organizer
    adminUserId: v.optional(v.string()), // Admin who posted the event
    claimable: v.optional(v.boolean()), // True if event can be claimed by organizer
    claimToken: v.optional(v.string()), // Unique token for claiming the event
    claimedBy: v.optional(v.string()), // User who claimed the event
    claimedAt: v.optional(v.number()), // Timestamp when event was claimed
    // Timezone support fields
    eventTimezone: v.optional(v.string()), // IANA timezone identifier (e.g., 'America/New_York')
    eventDateUTC: v.optional(v.number()), // UTC timestamp for the event start
    // Payment model configuration
    paymentModel: v.optional(v.union(
      v.literal("connect_collect"),  // Option 1: Organizer's payment + app fee
      v.literal("premium"),          // Option 2: SteppersLife processes everything
      v.literal("split")            // Option 3: Automatic split payments
    )),
    // Affiliate ticket allocation
    hasAffiliateProgram: v.optional(v.boolean()),
    affiliateCommissionPercent: v.optional(v.number()),
    maxAffiliateTickets: v.optional(v.number()),
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
      waitingListId: v.optional(v.id("waitingList")),
      referralCode: v.optional(v.string()),
      quantity: v.optional(v.number()),
      isTablePurchase: v.optional(v.boolean()),
      tableName: v.optional(v.string()),
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
    ticketCount: v.number(), // Number of tickets in this transaction
    platformFee: v.number(), // Platform fee in USD ($1 per ticket)
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

  // Cash sales tracking for door/event sales
  cashSales: defineTable({
    eventId: v.id("events"),
    organizerId: v.string(),
    
    // Sale details
    ticketsSold: v.number(),
    pricePerTicket: v.number(),
    totalAmount: v.number(),
    
    // Platform fee tracking
    platformFeePerTicket: v.number(), // $1.50 for cash sales
    totalPlatformFee: v.number(),
    
    // Recording details
    soldBy: v.string(), // Staff member name who recorded sale
    soldAt: v.number(), // Timestamp
    location: v.string(), // "door", "booth", "event", etc.
    paymentReceived: v.boolean(), // Cash was collected from customer
    
    // Reference for tracking
    referenceCode: v.string(), // Unique reference for this cash sale
    notes: v.optional(v.string()),
    
    // Linked tickets (created from this cash sale)
    ticketIds: v.array(v.id("tickets")),
    
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_organizer", ["organizerId"])
    .index("by_reference", ["referenceCode"]),

  // Platform fee balances and payments
  platformFeeBalances: defineTable({
    organizerId: v.string(),
    eventId: v.optional(v.id("events")), // Optional for account-level fees
    
    // Balance tracking
    totalOwed: v.number(), // Total platform fees owed
    totalPaid: v.number(), // Total platform fees paid
    outstandingBalance: v.number(), // totalOwed - totalPaid
    
    // Account status
    accountStatus: v.union(
      v.literal("active"), // All fees paid or within grace period
      v.literal("warning"), // Overdue fees, warning sent
      v.literal("suspended") // Account suspended for non-payment
    ),
    
    // Payment tracking
    lastPaymentDate: v.optional(v.number()),
    lastPaymentAmount: v.optional(v.number()),
    nextDueDate: v.optional(v.number()),
    
    // Warnings
    warningsSent: v.number(),
    lastWarningDate: v.optional(v.number()),
    suspendedAt: v.optional(v.number()),
    
    updatedAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["accountStatus"])
    .index("by_balance", ["outstandingBalance"]),

  // Platform fee payments
  platformFeePayments: defineTable({
    organizerId: v.string(),
    eventId: v.optional(v.id("events")),
    
    // Payment details
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal"),
      v.literal("bank_transfer"),
      v.literal("check"),
      v.literal("credit")
    ),
    paymentReference: v.string(), // Transaction ID or check number
    
    // What this payment covers
    description: v.string(),
    cashSaleIds: v.optional(v.array(v.id("cashSales"))), // Which cash sales this covers
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    
    createdAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["status"])
    .index("by_event", ["eventId"]),

  // Enhanced affiliate payout tracking
  affiliatePayouts: defineTable({
    affiliateId: v.id("affiliatePrograms"),
    eventId: v.id("events"),
    organizerId: v.string(),
    
    // Payout details
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("zelle"),
      v.literal("venmo"),
      v.literal("paypal"),
      v.literal("check"),
      v.literal("bank_transfer"),
      v.literal("other")
    ),
    paymentReference: v.optional(v.string()), // Transaction ID, check #, etc
    notes: v.optional(v.string()),
    
    // Confirmation tracking
    isPaid: v.boolean(),
    paidAt: v.number(),
    confirmedByAffiliate: v.boolean(),
    confirmedAt: v.optional(v.number()),
    disputeReason: v.optional(v.string()),
    
    createdAt: v.number(),
  })
    .index("by_affiliate", ["affiliateId"])
    .index("by_event", ["eventId"])
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["isPaid"]),

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
    
    // Payout tracking
    totalPaidOut: v.number(), // Track total paid to this affiliate
    lastPayoutDate: v.optional(v.number()),
    outstandingBalance: v.number(), // totalEarned - totalPaidOut
    
    // Social sharing tracking
    totalShares: v.optional(v.number()),
    sharesByPlatform: v.optional(v.object({
      whatsapp: v.optional(v.number()),
      facebook: v.optional(v.number()),
      twitter: v.optional(v.number()),
      email: v.optional(v.number()),
      other: v.optional(v.number()),
    })),
    
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
    eventDayId: v.optional(v.id("eventDays")), // For multi-day events
    name: v.string(), // "VIP Table", "General Table"
    seatCount: v.number(), // Number of seats at this table
    price: v.number(), // Total price for the entire table
    description: v.optional(v.string()), // Optional description
    sourceTicketTypeId: v.optional(v.id("dayTicketTypes")), // Which ticket type this pulls from
    sourceTicketType: v.optional(v.string()), // Name of ticket type (for display)
    maxTables: v.optional(v.number()), // Max number of this table type available
    soldCount: v.number(), // How many of this table type sold
    isActive: v.boolean(), // Can still be purchased
    
    // Hidden table functionality
    isHidden: v.optional(v.boolean()), // If true, only accessible via direct link
    shareableLink: v.optional(v.string()), // Unique link for private table sales
    shareToken: v.optional(v.string()), // Token for accessing hidden tables
    
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_active", ["eventId", "isActive"]),
  
  // Simplified purchases table
  purchases: defineTable({
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")), // For multi-day events
    
    // Purchase type
    purchaseType: v.optional(v.union(
      v.literal("table"),
      v.literal("individual"),
      v.literal("bundle")
    )),
    
    // References based on type
    tableConfigId: v.optional(v.id("tableConfigurations")), // For table purchases
    ticketTypeId: v.optional(v.id("dayTicketTypes")), // For individual purchases
    bundleId: v.optional(v.id("ticketBundles")), // For bundle purchases
    
    // Buyer info
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    
    // Purchase details
    itemName: v.optional(v.string()), // Table name, ticket type, or bundle name
    quantity: v.optional(v.number()), // Number of tickets/seats/bundles
    totalAmount: v.number(), // Total paid
    
    // Legacy fields (for backward compatibility)
    seatCount: v.optional(v.number()),
    tableName: v.optional(v.string()),
    
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
    ticketNumber: v.optional(v.string()), // Sequential number like "2025-000001"
    qrCode: v.string(), // QR code data
    
    // Event relationship
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")), // For multi-day events
    purchaseId: v.id("purchases"),
    purchaseEmail: v.optional(v.string()), // Buyer's email for linking to account
    
    // Ticket info
    ticketType: v.optional(v.string()), // "VIP", "General Admission", custom name
    ticketTypeId: v.optional(v.id("dayTicketTypes")), // Reference to ticket type
    seatLabel: v.optional(v.string()), // "Table 1, Seat 3" for tables, null for individual
    tableName: v.optional(v.string()), // "VIP Table" for tables, null for individual
    
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
    
    // Bundle support
    isBundleTicket: v.optional(v.boolean()),
    bundleId: v.optional(v.id("ticketBundles")),
    bundlePurchaseId: v.optional(v.id("bundlePurchases")),
    
    // Multi-day validation (JSON arrays for flexibility)
    validDays: v.optional(v.string()), // JSON array of eventDay IDs this ticket works for
    usedOnDays: v.optional(v.string()), // JSON array of days where ticket was scanned
    
    // Timestamps
    createdAt: v.string(),
  })
    .index("by_ticket_id", ["ticketId"])
    .index("by_ticket_code", ["ticketCode"])
    .index("by_event", ["eventId"])
    .index("by_purchase", ["purchaseId"])
    .index("by_purchase_email", ["purchaseEmail"])
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
  
  // ===== MULTI-DAY EVENT SUPPORT TABLES =====
  
  // Individual days for multi-day events
  eventDays: defineTable({
    eventId: v.id("events"),
    dayNumber: v.number(), // 1, 2, 3...
    date: v.number(), // Timestamp for this specific day
    dayLabel: v.string(), // "Day 1 - Friday, Nov 7th"
    
    // Location (only if different locations per day)
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    
    // Time can differ per day
    startTime: v.string(),
    endTime: v.optional(v.string()),
    
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_date", ["date"]),
  
  // Ticket types per day
  dayTicketTypes: defineTable({
    eventId: v.id("events"),
    eventDayId: v.optional(v.id("eventDays")), // Null for single events
    
    // Ticket details
    name: v.string(), // "General Admission", "VIP", or custom name
    category: v.union(
      v.literal("general"),
      v.literal("vip"),
      v.literal("early_bird")
    ),
    
    // Pricing
    price: v.number(),
    hasEarlyBird: v.optional(v.boolean()), // Enable early bird pricing
    earlyBirdPrice: v.optional(v.number()),
    earlyBirdEndDate: v.optional(v.number()),
    
    // Capacity allocation
    allocatedQuantity: v.number(), // Total allocated for this type
    tableAllocations: v.optional(v.number()), // How many used for tables
    bundleAllocations: v.optional(v.number()), // Reserved for bundles (dynamic)
    availableQuantity: v.number(), // Remaining for individual sale
    soldCount: v.number(),
    isActive: v.boolean(),
    
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_day", ["eventDayId"]),
  
  // Ticket bundles for multi-day events
  ticketBundles: defineTable({
    eventId: v.id("events"), // Parent multi-day event
    
    // Bundle configuration
    name: v.string(), // "Weekend Pass - GA", "VIP All Days"
    description: v.optional(v.string()),
    bundleType: v.union(
      v.literal("all_days_same_type"), // All days, same ticket type
      v.literal("custom_selection") // Mix and match
    ),
    
    // What's included (stored as JSON string for flexibility)
    includedDays: v.string(), // JSON array of day/ticket combinations
    
    // Pricing
    bundlePrice: v.number(),
    savingsAmount: v.number(),
    
    // Limits
    maxBundles: v.optional(v.number()),
    soldCount: v.number(),
    isActive: v.boolean(),
    
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"]),
  
  // Bundle purchases tracking
  bundlePurchases: defineTable({
    bundleId: v.id("ticketBundles"),
    eventId: v.id("events"),
    
    // Buyer info
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    
    // Master access code
    masterTicketId: v.string(), // Single ticket ID for all events
    masterQRCode: v.string(), // One QR for everything
    masterAccessCode: v.string(), // 6-char backup code
    
    // Purchase details
    totalAmount: v.number(),
    paymentMethod: v.string(),
    paymentReference: v.string(),
    paymentStatus: v.string(),
    
    // Generated tickets (JSON array of ticket IDs)
    generatedTickets: v.string(),
    
    purchasedAt: v.string(),
  })
    .index("by_master_ticket", ["masterTicketId"])
    .index("by_buyer_email", ["buyerEmail"])
    .index("by_bundle", ["bundleId"]),
  
  // ===== PAYMENT MODEL CONFIGURATION =====
  
  // Single payment config table for all three payment options
  paymentConfigs: defineTable({
    organizerId: v.string(),
    eventId: v.id("events"),
    
    // Payment model selected
    paymentModel: v.union(
      v.literal("connect_collect"),  // Option 1: Organizer's payment + app fee
      v.literal("premium"),          // Option 2: SteppersLife processes everything
      v.literal("split")            // Option 3: Automatic split payments
    ),
    
    // OAuth tokens for Option 1 & 3 (encrypted in production)
    stripeConnectId: v.optional(v.string()),
    stripeAccountEnabled: v.optional(v.boolean()),
    squareAccessToken: v.optional(v.string()),
    squareLocationId: v.optional(v.string()),
    squareRefreshToken: v.optional(v.string()),
    paypalMerchantId: v.optional(v.string()),
    paypalEmail: v.optional(v.string()),
    
    // Fee structure based on model
    platformFee: v.number(), // Fixed fee or percentage
    platformFeeType: v.union(
      v.literal("fixed"),     // $2.00 per ticket
      v.literal("percentage") // 10% of ticket price
    ),
    processingFee: v.number(), // Card processing fee
    
    // Option 2 specific - Premium processing fees
    premiumServiceFeePercent: v.optional(v.number()), // 3.7%
    premiumServiceFeeFixed: v.optional(v.number()),   // $1.79
    premiumProcessingFeePercent: v.optional(v.number()), // 2.9%
    
    // Option 3 specific - Split configuration
    splitType: v.optional(v.union(
      v.literal("fixed"),      // Platform gets fixed amount
      v.literal("percentage")  // Platform gets percentage
    )),
    organizerSplitPercent: v.optional(v.number()), // 90% default
    platformSplitPercent: v.optional(v.number()),  // 10% default
    
    // Risk management
    trustScore: v.number(), // 0-100
    chargebackCount: v.number(),
    successfulEvents: v.number(),
    maxEventValue: v.number(),
    requiresManualReview: v.optional(v.boolean()),
    
    // Configuration metadata
    configuredAt: v.number(),
    lastUpdated: v.number(),
    isActive: v.boolean(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_event", ["eventId"])
    .index("by_model", ["paymentModel"]),
  
  // Organizer trust levels and scoring
  organizerTrust: defineTable({
    organizerId: v.string(),
    
    // Trust level determines available payment options
    trustLevel: v.union(
      v.literal("NEW"),      // First time, Option 1 only
      v.literal("BASIC"),    // 1-3 events, Options 1 & 2
      v.literal("TRUSTED"), // 3+ events, all options
      v.literal("VIP")      // High volume, instant payouts
    ),
    
    // Trust scoring metrics
    trustScore: v.number(), // 0-100
    eventsCompleted: v.number(),
    totalRevenue: v.number(),
    lifetimeTicketsSold: v.number(),
    
    // Risk indicators
    chargebackCount: v.number(),
    chargebackRate: v.number(), // Percentage
    disputeCount: v.number(),
    refundCount: v.number(),
    
    // Account metrics
    accountAge: v.number(), // Days since registration
    lastEventDate: v.optional(v.number()),
    averageEventValue: v.number(),
    
    // Limits based on trust
    maxEventValue: v.number(),
    maxTicketPrice: v.number(),
    holdPeriod: v.number(), // Days to hold funds for Premium model
    
    // Available payment options based on trust
    availableOptions: v.array(v.union(
      v.literal("connect_collect"),
      v.literal("premium"),
      v.literal("split")
    )),
    
    // Special privileges
    instantPayoutEligible: v.optional(v.boolean()),
    reducedFees: v.optional(v.boolean()),
    prioritySupport: v.optional(v.boolean()),
    
    // Tracking
    createdAt: v.number(),
    updatedAt: v.number(),
    lastReviewDate: v.optional(v.number()),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_trust_level", ["trustLevel"])
    .index("by_trust_score", ["trustScore"]),
  
  // Scheduled payouts for Premium model (Option 2)
  scheduledPayouts: defineTable({
    organizerId: v.string(),
    eventId: v.id("events"),
    
    // Payout details
    grossAmount: v.number(), // Total ticket sales
    platformFees: v.number(), // Our fees (6.6% + $1.79)
    processingFees: v.number(), // Card processing
    netAmount: v.number(), // What organizer receives
    
    // Schedule
    eventDate: v.number(),
    payoutDate: v.number(), // 5 days after event
    
    // Status tracking
    status: v.union(
      v.literal("scheduled"),   // Waiting for payout date
      v.literal("pending"),     // Ready to process
      v.literal("processing"),  // Being sent
      v.literal("completed"),   // Paid out
      v.literal("failed"),      // Failed, needs retry
      v.literal("held"),        // Held for review
      v.literal("cancelled")    // Event cancelled
    ),
    
    // Payment method for payout
    payoutMethod: v.optional(v.union(
      v.literal("bank_transfer"),
      v.literal("paypal"),
      v.literal("check")
    )),
    payoutReference: v.optional(v.string()),
    
    // Risk management
    chargebackReserve: v.optional(v.number()), // Amount held for disputes
    releaseReserveDate: v.optional(v.number()), // When to release reserve
    
    // Metadata
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"])
    .index("by_payout_date", ["payoutDate"]),
  
  // Chargeback tracking for all models
  chargebacks: defineTable({
    organizerId: v.string(),
    eventId: v.id("events"),
    ticketId: v.optional(v.id("tickets")),
    
    // Chargeback details
    amount: v.number(),
    reason: v.string(),
    chargebackDate: v.number(),
    
    // Payment info
    paymentModel: v.union(
      v.literal("connect_collect"),
      v.literal("premium"),
      v.literal("split")
    ),
    originalPaymentId: v.string(),
    originalPaymentDate: v.number(),
    
    // Liability
    liableParty: v.union(
      v.literal("organizer"),  // Option 1 & some Option 3
      v.literal("platform")    // Option 2 & some Option 3
    ),
    
    // Resolution
    status: v.union(
      v.literal("open"),
      v.literal("disputed"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("recovered")  // Recovered from future events
    ),
    resolutionDate: v.optional(v.number()),
    recoveredAmount: v.optional(v.number()),
    
    // Impact on trust
    trustImpact: v.number(), // Negative points to trust score
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_event", ["eventId"])
    .index("by_status", ["status"])
    .index("by_payment_model", ["paymentModel"]),
  
  // ===== AFFILIATE TICKET ALLOCATION & PAYMENT TRACKING =====
  
  // Track ticket allocations to affiliates
  affiliateTicketAllocations: defineTable({
    affiliateId: v.id("affiliatePrograms"),
    eventId: v.id("events"),
    organizerId: v.string(),
    
    // Ticket allocation
    ticketsAllocated: v.number(),
    ticketsSold: v.number(),
    ticketsRemaining: v.number(),
    ticketTypeId: v.optional(v.id("dayTicketTypes")), // Which ticket type allocated
    ticketTypeName: v.optional(v.string()),
    
    // Payment methods this affiliate accepts (Option 1 only)
    acceptsCash: v.boolean(),
    cashAppHandle: v.optional(v.string()),
    zelleEmail: v.optional(v.string()),
    zellePhone: v.optional(v.string()),
    venmoHandle: v.optional(v.string()),
    paypalEmail: v.optional(v.string()),
    otherPaymentInfo: v.optional(v.string()),
    
    // Financial tracking
    totalCollected: v.number(), // Total money collected by affiliate
    totalOwedToOrganizer: v.number(), // What they owe organizer (minus commission)
    totalCommissionEarned: v.number(), // Their commission earnings
    totalPaidToAffiliate: v.number(), // What organizer has paid them
    outstandingBalance: v.number(), // Commission owed to affiliate
    
    // Status
    isActive: v.boolean(),
    lastSaleDate: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_affiliate", ["affiliateId"])
    .index("by_event", ["eventId"])
    .index("by_organizer", ["organizerId"])
    .index("by_active", ["isActive"]),
  
  // Track pending ticket verifications for cash/manual sales
  pendingTicketVerifications: defineTable({
    eventId: v.id("events"),
    affiliateId: v.id("affiliatePrograms"),
    ticketId: v.id("tickets"),
    
    // Customer information
    customerId: v.optional(v.string()), // May not have account yet
    customerEmail: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    
    // Payment details
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("zelle"),
      v.literal("cashapp"),
      v.literal("venmo"),
      v.literal("paypal"),
      v.literal("other")
    ),
    paymentAmount: v.number(),
    paymentReference: v.optional(v.string()), // Transaction ID, reference number
    paymentNotes: v.optional(v.string()),
    
    // Ticket status
    ticketStatus: v.union(
      v.literal("inactive"),      // Created but not verified
      v.literal("pending"),       // Awaiting organizer verification
      v.literal("active"),        // Payment verified, ticket active
      v.literal("rejected")       // Payment rejected by organizer
    ),
    
    // Verification tracking
    verificationRequested: v.number(), // Timestamp when created
    verificationDeadline: v.optional(v.number()), // Auto-reject after this time
    verifiedBy: v.optional(v.string()), // Organizer who verified
    verifiedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    
    // Notification tracking
    customerNotified: v.boolean(),
    organizerNotified: v.boolean(),
    remindersSent: v.number(),
    lastReminderAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_affiliate", ["affiliateId"])
    .index("by_ticket", ["ticketId"])
    .index("by_status", ["ticketStatus"])
    .index("by_customer_email", ["customerEmail"])
    .index("by_verification_date", ["verificationRequested"]),
  
  // Affiliate payment method preferences
  affiliatePaymentMethods: defineTable({
    affiliateId: v.id("affiliatePrograms"),
    userId: v.string(), // The affiliate's user ID
    
    // Payment acceptance settings
    acceptsCash: v.boolean(),
    acceptsDigitalPayments: v.boolean(),
    
    // Digital payment methods
    cashApp: v.optional(v.object({
      handle: v.string(),
      displayName: v.optional(v.string()),
      isVerified: v.boolean(),
    })),
    
    zelle: v.optional(v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      bankName: v.optional(v.string()),
      isVerified: v.boolean(),
    })),
    
    venmo: v.optional(v.object({
      handle: v.string(),
      displayName: v.optional(v.string()),
      isVerified: v.boolean(),
    })),
    
    paypal: v.optional(v.object({
      email: v.string(),
      merchantId: v.optional(v.string()),
      isVerified: v.boolean(),
    })),
    
    // For organizer payouts to affiliate
    preferredPayoutMethod: v.optional(v.union(
      v.literal("cash"),
      v.literal("check"),
      v.literal("zelle"),
      v.literal("cashapp"),
      v.literal("venmo"),
      v.literal("paypal"),
      v.literal("bank_transfer")
    )),
    
    // Bank info for direct deposits (encrypted)
    bankInfo: v.optional(v.object({
      accountName: v.string(),
      accountType: v.union(v.literal("checking"), v.literal("savings")),
      lastFour: v.string(), // Last 4 digits only
      routingNumber: v.optional(v.string()), // Encrypted
      accountNumber: v.optional(v.string()), // Encrypted
    })),
    
    // Instructions for customers
    paymentInstructions: v.optional(v.string()), // Custom instructions
    
    // Settings
    requiresPaymentProof: v.boolean(), // Require screenshot/receipt
    autoApproveThreshold: v.optional(v.number()), // Auto-approve under this amount
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_affiliate", ["affiliateId"])
    .index("by_user", ["userId"]),
  
  // Notifications system for event claims and other alerts
  notifications: defineTable({
    userId: v.string(), // Recipient user ID
    type: v.union(
      v.literal("event_claim_requested"),
      v.literal("event_claimed"),
      v.literal("event_claim_approved"),
      v.literal("event_deleted"),
      v.literal("admin_event_posted"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    eventId: v.optional(v.id("events")), // Related event if applicable
    relatedUserId: v.optional(v.string()), // User who triggered the notification
    read: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration for auto-cleanup
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"])
    .index("by_created", ["createdAt"])
    .index("by_event", ["eventId"]),
  
  // ===== CUSTOM PRODUCTS MARKETPLACE =====
  
  // Product catalog - admin managed
  products: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("tshirt"),
      v.literal("business_card"),
      v.literal("palm_card"),
      v.literal("postcard"),
      v.literal("ticket"),
      v.literal("poster")
    ),
    category: v.union(
      v.literal("apparel"),
      v.literal("printed_materials")
    ),
    
    // Pricing
    basePrice: v.number(), // Base price per unit
    minQuantity: v.number(), // Minimum order quantity
    maxQuantity: v.optional(v.number()),
    
    // Quantity-based pricing (JSON string for flexibility)
    quantityPricing: v.optional(v.string()), // [{qty: 100, price: 50}, {qty: 250, price: 100}]
    
    // Product details
    description: v.optional(v.string()),
    specifications: v.optional(v.string()), // JSON with size, material, etc.
    
    // Design options
    designOptions: v.optional(v.object({
      allowCustomDesign: v.boolean(),
      designFeeOneSide: v.optional(v.number()), // $75 for one side
      designFeeTwoSides: v.optional(v.number()), // $125 for two sides
      allowFileUpload: v.boolean(),
      maxFileSize: v.optional(v.number()), // In MB
      acceptedFormats: v.optional(v.string()), // "pdf,jpg,png,ai"
    })),
    
    // Admin management
    isActive: v.boolean(),
    createdBy: v.string(), // Admin who added it
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),
  
  // Product orders from event organizers
  productOrders: defineTable({
    orderId: v.string(), // Unique order ID like "ORD-ABC123"
    eventId: v.optional(v.id("events")), // Optional - can order without event
    userId: v.string(), // Organizer placing order
    
    // Order details
    orderType: v.union(
      v.literal("event_products"), // Products for an event
      v.literal("general") // General order
    ),
    
    // Products in order (JSON for flexibility)
    items: v.string(), // JSON array of order items with quantities
    
    // Design files
    designFiles: v.optional(v.array(v.object({
      productId: v.id("products"),
      frontFileId: v.optional(v.id("_storage")),
      backFileId: v.optional(v.id("_storage")),
      customDesignRequested: v.boolean(),
      designInstructions: v.optional(v.string()),
    }))),
    
    // Pricing
    subtotal: v.number(),
    designFees: v.number(),
    shippingCost: v.number(),
    totalAmount: v.number(),
    
    // Shipping information
    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    
    // Shipping calculation
    totalWeight: v.number(), // In pounds
    shippingMethod: v.union(
      v.literal("standard"),
      v.literal("express"),
      v.literal("overnight")
    ),
    
    // Payment
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentMethod: v.string(), // "square"
    paymentReference: v.optional(v.string()),
    
    // Order status
    orderStatus: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("processing"),
      v.literal("in_production"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    
    // Tracking
    trackingNumber: v.optional(v.string()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    
    // Notes
    customerNotes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_order_id", ["orderId"])
    .index("by_status", ["orderStatus"])
    .index("by_payment_status", ["paymentStatus"]),
  
  // T-shirt designs managed by admin
  tshirtDesigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Design images
    frontImageId: v.optional(v.id("_storage")),
    backImageId: v.optional(v.id("_storage")),
    mockupImageId: v.optional(v.id("_storage")), // Product mockup
    
    // Pricing
    basePrice: v.number(), // $35 default
    customDesignFee: v.optional(v.number()),
    
    // Available sizes and colors (JSON)
    availableSizes: v.string(), // ["S", "M", "L", "XL", "XXL", "3XL"]
    availableColors: v.string(), // ["black", "white", "navy", "gray"]
    
    // Inventory tracking (optional)
    trackInventory: v.boolean(),
    inventory: v.optional(v.string()), // JSON with size/color combinations
    
    // Status
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    
    // Admin management
    addedBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_featured", ["isFeatured"]),
  
  // Shipping rates configuration
  shippingRates: defineTable({
    name: v.string(), // "Standard", "Express", etc.
    method: v.union(
      v.literal("standard"),
      v.literal("express"),
      v.literal("overnight")
    ),
    
    // Weight-based pricing
    baseRate: v.number(), // Base rate for first pound
    perPoundRate: v.number(), // Additional per pound
    
    // Weight brackets (JSON for flexibility)
    weightBrackets: v.optional(v.string()), // [{min: 0, max: 5, price: 10}, ...]
    
    // Delivery time
    estimatedDays: v.string(), // "3-5 business days"
    
    // Restrictions
    maxWeight: v.optional(v.number()),
    availableRegions: v.optional(v.string()), // JSON array of states/regions
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_method", ["method"])
    .index("by_active", ["isActive"]),
  
  // Product order payments (tracks Square checkout for products)
  productPayments: defineTable({
    orderId: v.string(),
    paymentId: v.string(), // Square payment ID
    
    metadata: v.object({
      orderReference: v.string(),
      userId: v.string(),
      eventId: v.optional(v.id("events")),
      productType: v.string(),
    }),
    
    amount: v.number(),
    status: v.string(),
    
    createdAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_payment_id", ["paymentId"]),
});
