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
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  }),
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
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

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
    // Square OAuth credentials
    squareAccessToken: v.optional(v.string()),
    squareRefreshToken: v.optional(v.string()),
    squareLocationId: v.optional(v.string()),
    squareMerchantId: v.optional(v.string()),
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
    amount: v.number(),
    platformFee: v.number(),
    sellerPayout: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    ),
    squarePaymentId: v.string(),
    squareOrderId: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sellerId", ["sellerId"])
    .index("by_buyerId", ["buyerId"])
    .index("by_eventId", ["eventId"])
    .index("by_status", ["status"]),

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
