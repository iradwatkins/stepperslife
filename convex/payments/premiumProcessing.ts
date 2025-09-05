import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { calculatePremiumFees as calculateFees, PAYMENT_MODEL_FEES } from "../../lib/payment-utils";

// Re-export the calculation function for backward compatibility
export const calculatePremiumFees = (ticketPrice: number) => {
  const fees = calculateFees(1, ticketPrice);
  return {
    ticketPrice,
    serviceFee: fees.serviceFee,
    processingFee: fees.processingFee,
    totalFees: fees.totalFees,
    customerPays: ticketPrice + fees.totalFees,
    organizerReceives: fees.netRevenue,
    feePercentage: fees.feePercentage,
  };
};

// Process payment through SteppersLife's account (Premium model)
export const processPremiumPayment = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    organizerId: v.string(),
    buyerId: v.string(),
    ticketPrice: v.number(), // Base ticket price
    paymentMethod: v.union(
      v.literal("card"),
      v.literal("paypal"),
      v.literal("apple_pay"),
      v.literal("google_pay")
    ),
    paymentToken: v.string(),
    buyerEmail: v.string(),
    buyerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get payment config
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!paymentConfig || paymentConfig.paymentModel !== "premium") {
      throw new Error("Event is not configured for premium processing");
    }

    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Calculate fees
    const fees = calculatePremiumFees(args.ticketPrice);

    // Get organizer trust info for payout delay
    const trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    const holdPeriod = trustRecord?.holdPeriod || 7; // Default 7 days
    const chargebackReserve = fees.organizerReceives * 0.1; // 10% reserve for chargebacks

    // Create platform transaction record
    const transactionId = await ctx.db.insert("platformTransactions", {
      eventId: args.eventId,
      eventName: event.name,
      ticketId: args.ticketId,
      sellerId: args.organizerId,
      buyerId: args.buyerId,
      buyerEmail: args.buyerEmail,
      amount: fees.customerPays,
      ticketCount: 1,
      platformFee: fees.totalFees,
      sellerPayout: fees.organizerReceives,
      status: "pending",
      paymentId: "", // Will be updated
      paymentProvider: "stripe", // SteppersLife uses Stripe
      createdAt: Date.now(),
    });

    try {
      // Process payment to SteppersLife's Stripe account
      const paymentId = await processStripePlatformPayment(
        fees.customerPays,
        args.paymentToken,
        {
          eventId: args.eventId,
          ticketId: args.ticketId,
          organizerId: args.organizerId,
          buyerEmail: args.buyerEmail,
          model: "premium",
        }
      );

      // Update transaction with payment ID
      await ctx.db.patch(transactionId, {
        paymentId,
        status: "completed",
      });

      // Update ticket
      await ctx.db.patch(args.ticketId, {
        paymentMethod: "stripe",
        paymentStatus: "completed",
        paymentReference: paymentId,
        amount: fees.customerPays,
        purchasedAt: Date.now(),
      });

      // Calculate payout date (event date + hold period)
      const payoutDate = event.eventDate + (holdPeriod * 24 * 60 * 60 * 1000);

      // Create scheduled payout
      const payoutId = await ctx.db.insert("scheduledPayouts", {
        organizerId: args.organizerId,
        eventId: args.eventId,
        grossAmount: args.ticketPrice,
        platformFees: fees.serviceFee,
        processingFees: fees.processingFee,
        netAmount: fees.organizerReceives - chargebackReserve,
        eventDate: event.eventDate,
        payoutDate,
        status: "scheduled",
        chargebackReserve,
        releaseReserveDate: payoutDate + (30 * 24 * 60 * 60 * 1000), // 30 days after payout
        createdAt: Date.now(),
      });

      // Update organizer metrics
      if (trustRecord) {
        await ctx.db.patch(trustRecord._id, {
          lifetimeTicketsSold: trustRecord.lifetimeTicketsSold + 1,
          totalRevenue: trustRecord.totalRevenue + args.ticketPrice,
          updatedAt: Date.now(),
        });
      }

      return {
        success: true,
        paymentId,
        fees,
        payoutDate,
        payoutId,
        message: `Payment processed. Payout scheduled for ${new Date(payoutDate).toLocaleDateString()}`,
      };

    } catch (error) {
      // Mark transaction as failed
      await ctx.db.patch(transactionId, {
        status: "refunded",
        paymentId: error.message,
      });
      
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Stub function for Stripe platform payment
async function processStripePlatformPayment(
  amount: number,
  token: string,
  metadata: Record<string, unknown>
): Promise<string> {
  console.log("Processing Stripe platform payment", {
    amount,
    token,
    metadata,
  });
  
  // In production:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const charge = await stripe.charges.create({
  //   amount: amount * 100,
  //   currency: 'usd',
  //   source: token,
  //   description: `Ticket for ${metadata.eventId}`,
  //   metadata,
  // });
  // return charge.id;
  
  return `stripe_platform_${Date.now()}_mock`;
}

// Configure premium processing for an event
export const configurePremiumProcessing = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check trust level
    const trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    // Require at least BASIC trust level
    if (!trustRecord || trustRecord.trustLevel === "NEW") {
      throw new Error("Complete at least 1 event to use premium processing");
    }

    // Check for existing config
    const existing = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    const configData = {
      paymentModel: "premium" as const,
      platformFee: PAYMENT_MODEL_FEES.PREMIUM.serviceFeePercent,
      platformFeeType: "percentage" as const,
      processingFee: PAYMENT_MODEL_FEES.PREMIUM.processingFeePercent,
      premiumServiceFeePercent: PAYMENT_MODEL_FEES.PREMIUM.serviceFeePercent,
      premiumServiceFeeFixed: PAYMENT_MODEL_FEES.PREMIUM.fixedFeePerTicket,
      premiumProcessingFeePercent: PAYMENT_MODEL_FEES.PREMIUM.processingFeePercent,
      trustScore: trustRecord.trustScore,
      maxEventValue: trustRecord.maxEventValue,
      chargebackCount: trustRecord.chargebackCount,
      successfulEvents: trustRecord.eventsCompleted,
      requiresManualReview: trustRecord.trustScore < 50,
      isActive: true,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, configData);
      return { action: "updated", configId: existing._id };
    } else {
      const configId = await ctx.db.insert("paymentConfigs", {
        organizerId: args.organizerId,
        eventId: args.eventId,
        ...configData,
        configuredAt: Date.now(),
      });
      return { action: "created", configId };
    }
  },
});

// Get pending payouts for an organizer
export const getOrganizerPayouts = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    const payouts = await ctx.db
      .query("scheduledPayouts")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    // Group by status
    const scheduled = payouts.filter(p => p.status === "scheduled");
    const pending = payouts.filter(p => p.status === "pending");
    const processing = payouts.filter(p => p.status === "processing");
    const completed = payouts.filter(p => p.status === "completed");

    // Calculate totals
    const totalScheduled = scheduled.reduce((sum, p) => sum + p.netAmount, 0);
    const totalPending = pending.reduce((sum, p) => sum + p.netAmount, 0);
    const totalPaid = completed.reduce((sum, p) => sum + p.netAmount, 0);

    // Get next payout
    const nextPayout = scheduled
      .sort((a, b) => a.payoutDate - b.payoutDate)
      .find(p => p.payoutDate > Date.now());

    return {
      payouts,
      summary: {
        scheduled: scheduled.length,
        pending: pending.length,
        processing: processing.length,
        completed: completed.length,
        totalScheduled,
        totalPending,
        totalPaid,
        nextPayout: nextPayout ? {
          amount: nextPayout.netAmount,
          date: nextPayout.payoutDate,
          eventId: nextPayout.eventId,
        } : null,
      },
    };
  },
});

// Process scheduled payouts (would be run by a cron job)
export const processScheduledPayouts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find payouts that are due
    const duePayouts = await ctx.db
      .query("scheduledPayouts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .filter((q) => q.lte(q.field("payoutDate"), now))
      .collect();

    const processed = [];
    
    for (const payout of duePayouts) {
      try {
        // Update status to processing
        await ctx.db.patch(payout._id, {
          status: "processing",
        });

        // Get organizer payment details
        const organizer = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", payout.organizerId))
          .first();

        if (!organizer) {
          throw new Error("Organizer not found");
        }

        // Process payout based on preferred method
        let payoutReference = "";
        if (organizer.preferredPaymentMethod === "bank") {
          // Process bank transfer
          payoutReference = `bank_${Date.now()}`;
        } else if (organizer.preferredPaymentMethod === "paypal") {
          // Process PayPal payout
          payoutReference = `paypal_${Date.now()}`;
        } else {
          // Default to check
          payoutReference = `check_${Date.now()}`;
        }

        // Mark as completed
        await ctx.db.patch(payout._id, {
          status: "completed",
          processedAt: now,
          payoutReference,
        });

        processed.push({
          payoutId: payout._id,
          organizerId: payout.organizerId,
          amount: payout.netAmount,
          reference: payoutReference,
        });

      } catch (error) {
        // Mark as failed
        await ctx.db.patch(payout._id, {
          status: "failed",
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      processedCount: processed.length,
      processed,
    };
  },
});

// Handle chargeback for premium model
export const handlePremiumChargeback = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    amount: v.number(),
    reason: v.string(),
    originalPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get event and organizer
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Create chargeback record
    const chargebackId = await ctx.db.insert("chargebacks", {
      organizerId: event.userId,
      eventId: args.eventId,
      ticketId: args.ticketId,
      amount: args.amount,
      reason: args.reason,
      chargebackDate: Date.now(),
      paymentModel: "premium",
      originalPaymentId: args.originalPaymentId,
      originalPaymentDate: Date.now(), // Would get from original transaction
      liableParty: "platform", // Platform is liable in premium model
      status: "open",
      trustImpact: -5, // Negative impact on trust score
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update trust score
    const trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", event.userId))
      .first();

    if (trustRecord) {
      const newChargebackCount = trustRecord.chargebackCount + 1;
      const newChargebackRate = (newChargebackCount / trustRecord.lifetimeTicketsSold) * 100;
      
      await ctx.db.patch(trustRecord._id, {
        chargebackCount: newChargebackCount,
        chargebackRate: newChargebackRate,
        trustScore: Math.max(0, trustRecord.trustScore - 5),
        updatedAt: Date.now(),
      });
    }

    // Try to recover from future payouts
    const scheduledPayouts = await ctx.db
      .query("scheduledPayouts")
      .withIndex("by_organizer", (q) => q.eq("organizerId", event.userId))
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    if (scheduledPayouts.length > 0) {
      // Deduct from next payout
      const nextPayout = scheduledPayouts[0];
      const newAmount = Math.max(0, nextPayout.netAmount - args.amount);
      
      await ctx.db.patch(nextPayout._id, {
        netAmount: newAmount,
        notes: `Chargeback deduction: -$${args.amount}`,
      });

      // Mark chargeback as recovered
      await ctx.db.patch(chargebackId, {
        status: "recovered",
        resolutionDate: Date.now(),
        recoveredAmount: args.amount,
      });
    }

    return {
      chargebackId,
      recovered: scheduledPayouts.length > 0,
      message: scheduledPayouts.length > 0 
        ? "Chargeback amount will be deducted from future payouts"
        : "Chargeback recorded, manual recovery required",
    };
  },
});