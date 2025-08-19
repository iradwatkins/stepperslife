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
});
