import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Generate a unique reference code for Zelle payments
function generateReferenceCode(): string {
  const prefix = "ZL";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create a Zelle payment request
export const createZellePaymentRequest = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Get seller's Zelle information
    const seller = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", event.userId))
      .first();

    if (!seller) throw new Error("Seller not found");

    // Create payment instructions
    const paymentInstructions = {
      zelleEmail: seller.zelleEmail || "payments@stepperslife.com", // Fallback to platform
      zellePhone: seller.zellePhone,
      amount: args.amount,
      eventName: event.name,
    };

    // Create payment request with 3-day expiration
    const referenceCode = generateReferenceCode();
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    const paymentRequestId = await ctx.db.insert("paymentRequests", {
      userId: args.userId,
      eventId: args.eventId,
      waitingListId: args.waitingListId,
      method: "zelle",
      amount: args.amount,
      referenceNumber: referenceCode,
      status: "pending",
      paymentInstructions: JSON.stringify(paymentInstructions),
      createdAt: now,
      expiresAt: now + threeDaysInMs,
    });

    // Schedule expiration check
    await ctx.scheduler.runAfter(
      threeDaysInMs,
      internal.zellePayments.expirePaymentRequest,
      { paymentRequestId }
    );

    return {
      paymentRequestId,
      referenceCode,
      paymentInstructions,
      expiresAt: now + threeDaysInMs,
    };
  },
});

// Submit proof of Zelle payment
export const submitZelleProof = mutation({
  args: {
    paymentRequestId: v.id("paymentRequests"),
    proofText: v.string(), // Transaction ID or confirmation number
  },
  handler: async (ctx, args) => {
    const paymentRequest = await ctx.db.get(args.paymentRequestId);
    if (!paymentRequest) throw new Error("Payment request not found");

    if (paymentRequest.status !== "pending" && paymentRequest.status !== "awaiting_proof") {
      throw new Error("Payment request is no longer accepting proof");
    }

    // Update payment request with proof
    await ctx.db.patch(args.paymentRequestId, {
      status: "reviewing",
      proofUploadedAt: Date.now(),
      // Store proof text in paymentInstructions (we'll parse it as JSON)
      paymentInstructions: JSON.stringify({
        ...JSON.parse(paymentRequest.paymentInstructions),
        proofText: args.proofText,
      }),
    });

    return { success: true };
  },
});

// Admin: Get pending Zelle payments for review
export const getPendingZellePayments = query({
  args: {},
  handler: async (ctx) => {
    const pendingPayments = await ctx.db
      .query("paymentRequests")
      .withIndex("by_status", (q) => q.eq("status", "reviewing"))
      .filter((q) => q.eq(q.field("method"), "zelle"))
      .collect();

    // Get associated data for each payment
    const paymentsWithDetails = await Promise.all(
      pendingPayments.map(async (payment) => {
        const event = await ctx.db.get(payment.eventId);
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", payment.userId))
          .first();

        return {
          ...payment,
          event,
          user,
          instructions: JSON.parse(payment.paymentInstructions),
        };
      })
    );

    return paymentsWithDetails;
  },
});

// Admin: Verify Zelle payment with confirmation code
export const verifyZellePayment = mutation({
  args: {
    paymentRequestId: v.id("paymentRequests"),
    adminUserId: v.string(),
    confirmationCode: v.string(),
    action: v.union(v.literal("approve"), v.literal("reject")),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentRequest = await ctx.db.get(args.paymentRequestId);
    if (!paymentRequest) throw new Error("Payment request not found");

    if (paymentRequest.status !== "reviewing") {
      throw new Error("Payment request is not in review status");
    }

    // Verify confirmation code (in production, this would check against a secure code)
    const expectedCode = `VERIFY-${paymentRequest.referenceNumber}`;
    if (args.confirmationCode !== expectedCode) {
      throw new Error("Invalid confirmation code");
    }

    if (args.action === "approve") {
      // Approve the payment
      await ctx.db.patch(args.paymentRequestId, {
        status: "approved",
        approvedBy: args.adminUserId,
        approvedAt: Date.now(),
      });

      // Create ticket for the user
      await ctx.db.insert("tickets", {
        eventId: paymentRequest.eventId,
        userId: paymentRequest.userId,
        purchasedAt: Date.now(),
        status: "valid",
        paymentMethod: "zelle",
        paymentStatus: "completed",
        paymentReference: paymentRequest.referenceNumber,
        amount: paymentRequest.amount,
      });

      // Update waiting list entry
      await ctx.db.patch(paymentRequest.waitingListId, {
        status: "purchased",
      });

      // Process queue for next person
      await ctx.runMutation(internal.waitingList.processQueueInternal, {
        eventId: paymentRequest.eventId,
      });
    } else {
      // Reject the payment
      await ctx.db.patch(args.paymentRequestId, {
        status: "rejected",
        rejectionReason: args.rejectionReason,
        approvedBy: args.adminUserId,
        approvedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get user's Zelle payment requests
export const getUserZellePayments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("paymentRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("method"), "zelle"))
      .order("desc")
      .collect();

    const paymentsWithEvents = await Promise.all(
      payments.map(async (payment) => {
        const event = await ctx.db.get(payment.eventId);
        return {
          ...payment,
          event,
          instructions: JSON.parse(payment.paymentInstructions),
        };
      })
    );

    return paymentsWithEvents;
  },
});

// Internal: Expire payment request after 3 days
export const expirePaymentRequest = internalMutation({
  args: { paymentRequestId: v.id("paymentRequests") },
  handler: async (ctx, args) => {
    const paymentRequest = await ctx.db.get(args.paymentRequestId);
    if (!paymentRequest) return;

    // Only expire if still pending or awaiting proof
    if (paymentRequest.status === "pending" || paymentRequest.status === "awaiting_proof") {
      await ctx.db.patch(args.paymentRequestId, {
        status: "expired",
      });

      // Release the ticket offer
      const waitingListEntry = await ctx.db.get(paymentRequest.waitingListId);
      if (waitingListEntry && waitingListEntry.status === "offered") {
        await ctx.db.patch(paymentRequest.waitingListId, {
          status: "expired",
        });

        // Process queue for next person
        await ctx.runMutation(internal.waitingList.processQueueInternal, {
          eventId: paymentRequest.eventId,
        });
      }
    }
  },
});

// Get payment request by reference code
export const getPaymentByReference = query({
  args: { referenceCode: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("paymentRequests")
      .withIndex("by_reference", (q) => q.eq("referenceNumber", args.referenceCode))
      .first();

    if (!payment) return null;

    const event = await ctx.db.get(payment.eventId);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", payment.userId))
      .first();

    return {
      ...payment,
      event,
      user,
      instructions: JSON.parse(payment.paymentInstructions),
    };
  },
});