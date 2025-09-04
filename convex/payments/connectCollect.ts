import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Fixed platform fee for Connect & Collect model
const PLATFORM_FEE = 2.00; // $2.00 per ticket

// Process payment through organizer's connected account with app fee
export const processConnectCollect = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    organizerId: v.string(),
    buyerId: v.string(),
    amount: v.number(),
    paymentProvider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
    paymentToken: v.string(), // Token from frontend
    buyerEmail: v.string(),
    buyerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get payment config for this event
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!paymentConfig) {
      throw new Error("Payment configuration not found for this event");
    }

    if (paymentConfig.paymentModel !== "connect_collect") {
      throw new Error("Invalid payment model for this transaction");
    }

    // Verify the organizer has connected the selected payment provider
    const hasProvider = 
      (args.paymentProvider === "stripe" && paymentConfig.stripeConnectId) ||
      (args.paymentProvider === "square" && paymentConfig.squareAccessToken) ||
      (args.paymentProvider === "paypal" && paymentConfig.paypalMerchantId);

    if (!hasProvider) {
      throw new Error(`Organizer has not connected ${args.paymentProvider}`);
    }

    // Calculate fees
    const platformFee = PLATFORM_FEE;
    const processingFee = args.amount * 0.029; // 2.9% standard processing
    const organizerReceives = args.amount - platformFee;

    // Create payment record in our database
    const paymentId = await ctx.db.insert("platformTransactions", {
      eventId: args.eventId,
      eventName: (await ctx.db.get(args.eventId))?.name || "",
      ticketId: args.ticketId,
      sellerId: args.organizerId,
      buyerId: args.buyerId,
      buyerEmail: args.buyerEmail,
      amount: args.amount,
      ticketCount: 1,
      platformFee: platformFee,
      sellerPayout: organizerReceives,
      status: "pending",
      paymentId: "", // Will be updated after processing
      paymentProvider: args.paymentProvider,
      createdAt: Date.now(),
    });

    // Process payment based on provider
    let externalPaymentId = "";
    let paymentStatus = "pending";

    try {
      switch (args.paymentProvider) {
        case "stripe":
          // Process Stripe Connect payment with application fee
          externalPaymentId = await processStripeConnect(
            paymentConfig.stripeConnectId!,
            args.amount,
            platformFee,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
            }
          );
          paymentStatus = "completed";
          break;

        case "square":
          // Process Square payment with app fee
          externalPaymentId = await processSquareAppFee(
            paymentConfig.squareAccessToken!,
            paymentConfig.squareLocationId!,
            args.amount,
            platformFee,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
            }
          );
          paymentStatus = "completed";
          break;

        case "paypal":
          // Process PayPal payment (note: PayPal split is more complex)
          externalPaymentId = await processPayPalPayment(
            paymentConfig.paypalMerchantId!,
            args.amount,
            platformFee,
            args.paymentToken,
            {
              eventId: args.eventId,
              ticketId: args.ticketId,
              buyerEmail: args.buyerEmail,
            }
          );
          paymentStatus = "completed";
          break;
      }

      // Update payment record with external ID
      await ctx.db.patch(paymentId, {
        paymentId: externalPaymentId,
        status: paymentStatus as "pending" | "completed" | "refunded",
      });

      // Update ticket with payment info
      await ctx.db.patch(args.ticketId, {
        paymentMethod: args.paymentProvider,
        paymentStatus: "completed",
        paymentReference: externalPaymentId,
        amount: args.amount,
        purchasedAt: Date.now(),
      });

      // Track successful event for trust scoring
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

      return {
        success: true,
        paymentId: externalPaymentId,
        platformFee,
        organizerReceives,
        message: "Payment processed successfully",
      };

    } catch (error: any) {
      // Update payment as failed
      await ctx.db.patch(paymentId, {
        status: "refunded",
        paymentId: error.message,
      });
      
      throw new Error(`Payment failed: ${error.message}`);
    }
  },
});

// Stub functions for payment processing (will be implemented with actual SDKs)
async function processStripeConnect(
  stripeConnectId: string,
  amount: number,
  applicationFee: number,
  token: string,
  metadata: any
): Promise<string> {
  // This would use Stripe SDK to process payment
  // For now, return mock payment ID
  console.log("Processing Stripe Connect payment", {
    stripeConnectId,
    amount,
    applicationFee,
    token,
    metadata,
  });
  
  // In production, this would be:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const charge = await stripe.charges.create({
  //   amount: amount * 100,
  //   currency: 'usd',
  //   source: token,
  //   application_fee_amount: applicationFee * 100,
  //   transfer_data: {
  //     destination: stripeConnectId,
  //   },
  //   metadata,
  // });
  // return charge.id;
  
  return `stripe_${Date.now()}_mock`;
}

async function processSquareAppFee(
  accessToken: string,
  locationId: string,
  amount: number,
  appFee: number,
  token: string,
  metadata: any
): Promise<string> {
  // This would use Square SDK to process payment
  console.log("Processing Square app fee payment", {
    accessToken: accessToken.substring(0, 10) + "...",
    locationId,
    amount,
    appFee,
    token,
    metadata,
  });
  
  // In production, this would be:
  // const { paymentsApi } = new Client({
  //   accessToken,
  //   environment: Environment.Production,
  // });
  // const response = await paymentsApi.createPayment({
  //   sourceId: token,
  //   idempotencyKey: uuidv4(),
  //   amountMoney: {
  //     amount: BigInt(amount * 100),
  //     currency: 'USD',
  //   },
  //   appFeeMoney: {
  //     amount: BigInt(appFee * 100),
  //     currency: 'USD',
  //   },
  //   locationId,
  //   note: JSON.stringify(metadata),
  // });
  // return response.result.payment?.id || "";
  
  return `square_${Date.now()}_mock`;
}

async function processPayPalPayment(
  merchantId: string,
  amount: number,
  platformFee: number,
  token: string,
  metadata: any
): Promise<string> {
  // PayPal doesn't have direct app fee like Stripe/Square
  // Would need to handle split differently
  console.log("Processing PayPal payment", {
    merchantId,
    amount,
    platformFee,
    token,
    metadata,
  });
  
  return `paypal_${Date.now()}_mock`;
}

// Get payment configuration for an event
export const getEventPaymentConfig = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!config) {
      return null;
    }

    // Don't expose sensitive tokens to frontend
    return {
      paymentModel: config.paymentModel,
      platformFee: config.platformFee,
      platformFeeType: config.platformFeeType,
      hasStripe: !!config.stripeConnectId,
      hasSquare: !!config.squareAccessToken,
      hasPayPal: !!config.paypalMerchantId,
      trustScore: config.trustScore,
      maxEventValue: config.maxEventValue,
    };
  },
});

// Configure payment method for Connect & Collect
export const configureConnectCollect = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
    provider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
    // OAuth tokens/IDs from frontend after OAuth flow
    stripeConnectId: v.optional(v.string()),
    squareAccessToken: v.optional(v.string()),
    squareLocationId: v.optional(v.string()),
    squareRefreshToken: v.optional(v.string()),
    paypalMerchantId: v.optional(v.string()),
    paypalEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if config exists
    const existing = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    // Get trust info
    const trustRecord = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    const configData = {
      paymentModel: "connect_collect" as const,
      platformFee: PLATFORM_FEE,
      platformFeeType: "fixed" as const,
      processingFee: 2.9, // Standard 2.9%
      trustScore: trustRecord?.trustScore || 0,
      maxEventValue: trustRecord?.maxEventValue || 1000,
      chargebackCount: 0,
      successfulEvents: trustRecord?.eventsCompleted || 0,
      isActive: true,
      lastUpdated: Date.now(),
    };

    // Add provider-specific fields
    if (args.provider === "stripe" && args.stripeConnectId) {
      Object.assign(configData, {
        stripeConnectId: args.stripeConnectId,
        stripeAccountEnabled: true,
      });
    } else if (args.provider === "square" && args.squareAccessToken) {
      Object.assign(configData, {
        squareAccessToken: args.squareAccessToken,
        squareLocationId: args.squareLocationId,
        squareRefreshToken: args.squareRefreshToken,
      });
    } else if (args.provider === "paypal" && args.paypalMerchantId) {
      Object.assign(configData, {
        paypalMerchantId: args.paypalMerchantId,
        paypalEmail: args.paypalEmail,
      });
    }

    if (existing) {
      // Update existing config
      await ctx.db.patch(existing._id, configData);
      return { action: "updated", configId: existing._id };
    } else {
      // Create new config
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

// Validate OAuth tokens are still valid
export const validateOAuthTokens = query({
  args: {
    eventId: v.id("events"),
    provider: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!config) {
      return { valid: false, reason: "No payment configuration found" };
    }

    // Check if provider is configured
    switch (args.provider) {
      case "stripe":
        if (!config.stripeConnectId) {
          return { valid: false, reason: "Stripe not connected" };
        }
        // In production, validate with Stripe API
        return { valid: true };

      case "square":
        if (!config.squareAccessToken) {
          return { valid: false, reason: "Square not connected" };
        }
        // In production, validate with Square API
        return { valid: true };

      case "paypal":
        if (!config.paypalMerchantId) {
          return { valid: false, reason: "PayPal not connected" };
        }
        // In production, validate with PayPal API
        return { valid: true };

      default:
        return { valid: false, reason: "Unknown provider" };
    }
  },
});