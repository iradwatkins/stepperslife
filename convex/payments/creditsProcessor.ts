import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Process payment using credits model
export const processCreditsPayment = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    organizerId: v.string(),
    buyerId: v.string(),
    buyerEmail: v.string(),
    buyerName: v.string(),
    amount: v.number(), // Ticket price
    sessionId: v.string(), // Checkout session ID
    paymentProvider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
    paymentToken: v.string(), // Payment token from frontend
  },
  handler: async (ctx, args) => {
    // Step 1: Verify payment configuration
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!paymentConfig || paymentConfig.paymentModel !== "credits") {
      throw new Error("Event is not configured for credits payment model");
    }
    
    if (!paymentConfig.hasCreditsConnectedProcessor) {
      throw new Error("Organizer has not connected a payment processor");
    }
    
    if (paymentConfig.creditsProcessorType !== args.paymentProvider) {
      throw new Error("Payment provider mismatch");
    }
    
    // Step 2: Get the credit reservation
    const reservation = await ctx.db
      .query("creditReservations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (!reservation) {
      throw new Error("No active credit reservation found. Please restart checkout.");
    }
    
    if (reservation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(reservation._id, { status: "expired" });
      throw new Error("Credit reservation expired. Please restart checkout.");
    }
    
    // Step 3: Process payment through organizer's connected processor
    let paymentId = "";
    
    try {
      // Process based on payment provider
      switch (args.paymentProvider) {
        case "stripe":
          paymentId = await processStripePayment(
            paymentConfig.stripeConnectId!,
            args.amount,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
              sessionId: args.sessionId,
            }
          );
          break;
          
        case "square":
          paymentId = await processSquarePayment(
            paymentConfig.squareAccessToken!,
            paymentConfig.squareLocationId!,
            args.amount,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
              sessionId: args.sessionId,
            }
          );
          break;
          
        case "paypal":
          paymentId = await processPayPalPayment(
            paymentConfig.paypalMerchantId!,
            args.amount,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
              sessionId: args.sessionId,
            }
          );
          break;
      }
      
      // Step 4: Confirm credit usage
      const creditBalance = await ctx.db
        .query("creditBalances")
        .withIndex("by_organization", (q) => 
          q.eq("organizationId", args.organizerId)
        )
        .first();
      
      if (!creditBalance) {
        throw new Error("Credit balance not found");
      }
      
      const balanceBefore = creditBalance.totalCredits;
      const creditsUsed = 1; // 1 credit per ticket
      const balanceAfter = balanceBefore - creditsUsed;
      
      // Deduct credits
      await ctx.db.patch(creditBalance._id, {
        totalCredits: creditBalance.totalCredits - creditsUsed,
        reservedCredits: Math.max(0, creditBalance.reservedCredits - creditsUsed),
        availableCredits: creditBalance.availableCredits,
        lifetimeUsed: creditBalance.lifetimeUsed + creditsUsed,
        lastUsedAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Mark reservation as confirmed
      await ctx.db.patch(reservation._id, {
        status: "confirmed",
      });
      
      // Step 5: Record credit transaction
      const creditTransactionId = await ctx.db.insert("creditTransactions", {
        organizationId: args.organizerId,
        transactionType: "deduction",
        creditsAmount: -creditsUsed,
        balanceBefore,
        balanceAfter,
        eventId: args.eventId,
        ticketId: args.ticketId,
        referenceType: "ticket_sale",
        paymentMethod: args.paymentProvider,
        paymentReference: paymentId,
        description: `Used ${creditsUsed} credit for ticket purchase`,
        metadata: JSON.stringify({
          buyerEmail: args.buyerEmail,
          sessionId: args.sessionId,
          ticketPrice: args.amount,
        }),
        createdAt: Date.now(),
        createdBy: args.organizerId,
      });
      
      // Step 6: Record platform transaction (for tracking)
      const platformTransactionId = await ctx.db.insert("platformTransactions", {
        eventId: args.eventId,
        eventName: (await ctx.db.get(args.eventId))?.name || "",
        ticketId: args.ticketId,
        sellerId: args.organizerId,
        buyerId: args.buyerId,
        buyerEmail: args.buyerEmail,
        amount: args.amount,
        ticketCount: 1,
        platformFee: paymentConfig.creditCostPerTicket || 0.79,
        sellerPayout: args.amount, // Full amount goes to seller
        status: "completed",
        paymentId,
        paymentProvider: args.paymentProvider,
        paymentDetails: JSON.stringify({
          model: "credits",
          creditTransactionId,
          sessionId: args.sessionId,
        }),
        createdAt: Date.now(),
      });
      
      // Step 7: Update ticket with payment info
      await ctx.db.patch(args.ticketId, {
        paymentMethod: args.paymentProvider,
        paymentStatus: "completed",
        paymentReference: paymentId,
        amount: args.amount,
        purchasedAt: Date.now(),
      });
      
      // Step 8: Update organizer metrics
      const trustRecord = await ctx.db
        .query("organizerTrust")
        .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
        .first();
      
      if (trustRecord) {
        await ctx.db.patch(trustRecord._id, {
          lifetimeTicketsSold: trustRecord.lifetimeTicketsSold + 1,
          totalRevenue: trustRecord.totalRevenue + args.amount,
          updatedAt: Date.now(),
        });
      }
      
      // Step 9: Log audit entry
      await ctx.db.insert("paymentAuditLog", {
        entityType: "credit_transaction",
        entityId: creditTransactionId,
        action: "ticket_purchase",
        actionBy: args.buyerId,
        actionType: "user",
        newState: JSON.stringify({
          amount: args.amount,
          creditsUsed,
          paymentId,
          ticketId: args.ticketId,
        }),
        metadata: JSON.stringify({
          sessionId: args.sessionId,
          paymentProvider: args.paymentProvider,
        }),
        createdAt: Date.now(),
      });
      
      // Check for low balance alert
      if (balanceAfter < 10) {
        // Would trigger notification to organizer
        console.log(`Low credit balance alert for organizer ${args.organizerId}: ${balanceAfter} credits remaining`);
      }
      
      return {
        success: true,
        paymentId,
        creditTransactionId,
        platformTransactionId,
        creditsUsed,
        remainingCredits: balanceAfter,
        message: "Payment processed successfully using credits",
      };
      
    } catch (error) {
      // Release credit reservation on failure
      await ctx.db.patch(reservation._id, {
        status: "cancelled",
      });
      
      // Release reserved credits
      const creditBalance = await ctx.db
        .query("creditBalances")
        .withIndex("by_organization", (q) => 
          q.eq("organizationId", args.organizerId)
        )
        .first();
      
      if (creditBalance) {
        await ctx.db.patch(creditBalance._id, {
          reservedCredits: Math.max(0, creditBalance.reservedCredits - 1),
          availableCredits: creditBalance.availableCredits + 1,
          updatedAt: Date.now(),
        });
      }
      
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Configure credits payment processor
export const configureCreditsProcessor = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
    provider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
    // OAuth tokens from frontend after connection
    stripeConnectId: v.optional(v.string()),
    squareAccessToken: v.optional(v.string()),
    squareLocationId: v.optional(v.string()),
    squareRefreshToken: v.optional(v.string()),
    paypalMerchantId: v.optional(v.string()),
    paypalEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get payment config
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!paymentConfig || paymentConfig.paymentModel !== "credits") {
      throw new Error("Event is not configured for credits payment model");
    }
    
    // Update configuration with processor details
    const updates: Record<string, unknown> = {
      hasCreditsConnectedProcessor: true,
      creditsProcessorType: args.provider,
      lastUpdated: Date.now(),
    };
    
    // Add provider-specific fields
    switch (args.provider) {
      case "stripe":
        if (!args.stripeConnectId) {
          throw new Error("Stripe Connect ID required");
        }
        updates.stripeConnectId = args.stripeConnectId;
        updates.stripeAccountEnabled = true;
        break;
        
      case "square":
        if (!args.squareAccessToken || !args.squareLocationId) {
          throw new Error("Square credentials required");
        }
        updates.squareAccessToken = args.squareAccessToken;
        updates.squareLocationId = args.squareLocationId;
        updates.squareRefreshToken = args.squareRefreshToken;
        break;
        
      case "paypal":
        if (!args.paypalMerchantId) {
          throw new Error("PayPal Merchant ID required");
        }
        updates.paypalMerchantId = args.paypalMerchantId;
        updates.paypalEmail = args.paypalEmail;
        break;
    }
    
    await ctx.db.patch(paymentConfig._id, updates);
    
    // Log audit entry
    await ctx.db.insert("paymentAuditLog", {
      entityType: "payment_config",
      entityId: paymentConfig._id,
      action: "processor_connected",
      actionBy: args.organizerId,
      actionType: "user",
      newState: JSON.stringify({
        provider: args.provider,
        eventId: args.eventId,
      }),
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      provider: args.provider,
      message: `${args.provider} payment processor connected successfully`,
    };
  },
});

// Check if credits model is fully configured
export const checkCreditsConfiguration = query({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get payment config
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!paymentConfig || paymentConfig.paymentModel !== "credits") {
      return {
        configured: false,
        model: paymentConfig?.paymentModel || null,
        message: "Event not using credits payment model",
      };
    }
    
    // Get credit balance
    const creditBalance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", args.organizerId)
      )
      .first();
    
    const hasCredits = (creditBalance?.availableCredits || 0) > 0;
    const hasProcessor = paymentConfig.hasCreditsConnectedProcessor;
    
    const issues = [];
    if (!hasCredits) {
      issues.push("No credits available. Purchase credits to proceed.");
    }
    if (!hasProcessor) {
      issues.push("Payment processor not connected. Connect Stripe, Square, or PayPal.");
    }
    
    return {
      configured: hasCredits && hasProcessor,
      hasCredits,
      availableCredits: creditBalance?.availableCredits || 0,
      hasProcessor,
      processorType: paymentConfig.creditsProcessorType,
      issues,
      message: issues.length === 0 
        ? "Credits payment model fully configured"
        : `Configuration incomplete: ${issues.join(" ")}`,
    };
  },
});

// Stub payment processing functions (would be implemented with actual SDKs)
async function processStripePayment(
  connectId: string,
  amount: number,
  token: string,
  metadata: Record<string, unknown>
): Promise<string> {
  // In production, use Stripe SDK
  console.log("Processing Stripe payment", {
    connectId,
    amount,
    token,
    metadata,
  });
  return `stripe_credits_${Date.now()}`;
}

async function processSquarePayment(
  accessToken: string,
  locationId: string,
  amount: number,
  token: string,
  metadata: Record<string, unknown>
): Promise<string> {
  // In production, use Square SDK
  console.log("Processing Square payment", {
    accessToken: accessToken.substring(0, 10) + "...",
    locationId,
    amount,
    token,
    metadata,
  });
  return `square_credits_${Date.now()}`;
}

async function processPayPalPayment(
  merchantId: string,
  amount: number,
  token: string,
  metadata: Record<string, unknown>
): Promise<string> {
  // In production, use PayPal SDK
  console.log("Processing PayPal payment", {
    merchantId,
    amount,
    token,
    metadata,
  });
  return `paypal_credits_${Date.now()}`;
}