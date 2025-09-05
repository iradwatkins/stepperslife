import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { 
  calculateCreditsFees, 
  calculatePremiumFees,
  comparePaymentModels,
  PAYMENT_MODEL_FEES 
} from "../../lib/payment-utils";

// Fee structures for comparison
const PAYMENT_MODELS = {
  CREDITS: {
    id: "credits",
    name: "Prepaid Credits",
    description: "Buy credits upfront, connect your own payment processor",
    fixedFeePerTicket: PAYMENT_MODEL_FEES.CREDITS.fixedFeePerTicket,
    percentageFee: PAYMENT_MODEL_FEES.CREDITS.percentageFee,
    processingFee: PAYMENT_MODEL_FEES.CREDITS.processingFee,
    requiresProcessor: true,
    instantAccess: true,
    platformLiability: false,
  },
  PREMIUM: {
    id: "premium",
    name: "Full Service Processing", 
    description: "We handle everything - payments, chargebacks, support",
    fixedFeePerTicket: PAYMENT_MODEL_FEES.PREMIUM.fixedFeePerTicket,
    percentageFee: PAYMENT_MODEL_FEES.PREMIUM.serviceFeePercent,
    processingFee: PAYMENT_MODEL_FEES.PREMIUM.processingFeePercent,
    requiresProcessor: false,
    instantAccess: false,
    platformLiability: true,
  },
};

// Calculate optimal payment model based on event details
export const calculateOptimalModel = query({
  args: {
    eventId: v.optional(v.id("events")),
    organizerId: v.string(),
    expectedTickets: v.number(),
    averageTicketPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Get organizer history
    const organizerTrust = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Get organizer's credit balance
    const creditBalance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
      .first();
    
    // Calculate costs for each model
    const creditsCost = calculateCreditsModelCost(
      args.expectedTickets,
      args.averageTicketPrice
    );
    
    const premiumCost = calculatePremiumModelCost(
      args.expectedTickets,
      args.averageTicketPrice
    );
    
    // Determine recommendation
    let recommendation: "credits" | "premium";
    const reasons: string[] = [];
    
    // Factor 1: Cost comparison
    const costSavings = premiumCost.totalFees - creditsCost.totalFees;
    const savingsPercentage = (costSavings / premiumCost.totalFees) * 100;
    
    if (costSavings > 0) {
      recommendation = "credits";
      reasons.push(`Save $${costSavings.toFixed(2)} (${savingsPercentage.toFixed(1)}%) with credits`);
    } else {
      recommendation = "premium";
      reasons.push("Lower total cost with full processing");
    }
    
    // Factor 2: Trust level
    if (!organizerTrust || organizerTrust.eventsCompleted === 0) {
      // New organizers might prefer full service
      if (recommendation === "credits") {
        reasons.push("Note: As a new organizer, full service provides extra support");
      }
    } else if (organizerTrust.eventsCompleted > 5) {
      // Experienced organizers benefit more from credits
      if (recommendation === "premium") {
        reasons.push("With your experience, credits might offer better value");
      }
    }
    
    // Factor 3: Event size
    if (args.expectedTickets > 500) {
      if (recommendation !== "credits") {
        reasons.push("High volume events benefit most from credit savings");
      }
    }
    
    // Factor 4: Existing credits
    if (creditBalance && creditBalance.availableCredits > 0) {
      reasons.push(`You have ${creditBalance.availableCredits} credits available`);
      if (creditBalance.availableCredits >= args.expectedTickets) {
        recommendation = "credits";
        reasons.unshift("You have enough credits for this event!");
      }
    }
    
    return {
      recommendation,
      reasons,
      comparison: {
        credits: creditsCost,
        premium: premiumCost,
      },
      organizerProfile: {
        trustLevel: organizerTrust?.trustLevel || "NEW",
        eventsCompleted: organizerTrust?.eventsCompleted || 0,
        hasCredits: !!creditBalance?.availableCredits,
        currentCredits: creditBalance?.availableCredits || 0,
      },
      breakEvenAnalysis: calculateBreakEvenPoint(args.averageTicketPrice),
    };
  },
});

// Calculate cost for credits model
function calculateCreditsModelCost(tickets: number, avgPrice: number) {
  const fees = calculateCreditsFees(tickets, avgPrice);
  return {
    model: "credits",
    ticketCount: tickets,
    averagePrice: avgPrice,
    totalRevenue: fees.totalRevenue,
    creditsFee: fees.platformFee,
    processingFee: fees.processingFee,
    totalFees: fees.totalFees,
    netRevenue: fees.netRevenue,
    feePercentage: fees.feePercentage,
    perTicketCost: fees.perTicketCost,
  };
}

// Calculate cost for premium processing model
function calculatePremiumModelCost(tickets: number, avgPrice: number) {
  const fees = calculatePremiumFees(tickets, avgPrice);
  return {
    model: "premium",
    ticketCount: tickets,
    averagePrice: avgPrice,
    totalRevenue: fees.totalRevenue,
    percentageFee: fees.serviceFee,
    fixedFee: fees.fixedFee,
    processingFee: fees.processingFee,
    totalFees: fees.totalFees,
    netRevenue: fees.netRevenue,
    feePercentage: fees.feePercentage,
    perTicketCost: fees.perTicketCost,
  };
}

// Calculate break-even point between models
function calculateBreakEvenPoint(ticketPrice: number) {
  const comparison = comparePaymentModels(100, ticketPrice); // Use 100 tickets as baseline
  const savingsPerTicket = comparison.savingsVsPremium / 100;
  
  return {
    savingsPerTicket: Math.max(0, savingsPerTicket),
    breakEvenVolume: savingsPerTicket > 0 ? Math.ceil(100 / savingsPerTicket) : 0,
    recommendation: savingsPerTicket > 0 ? 
      `Credits save $${savingsPerTicket.toFixed(2)} per ticket` :
      "Premium processing is more cost-effective for this price point",
  };
}

// Check if organizer has payment configured
export const checkPaymentConfiguration = query({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if payment config exists for this event
    const paymentConfig = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!paymentConfig) {
      return {
        configured: false,
        requiresSetup: true,
        message: "Payment method must be configured before publishing event",
      };
    }
    
    // Check if credits model has processor connected
    if (paymentConfig.paymentModel === "credits") {
      const hasProcessor = paymentConfig.hasCreditsConnectedProcessor;
      const creditBalance = await ctx.db
        .query("creditBalances")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
        .first();
      
      return {
        configured: hasProcessor && (creditBalance?.availableCredits || 0) > 0,
        requiresSetup: !hasProcessor || (creditBalance?.availableCredits || 0) === 0,
        paymentModel: "credits",
        hasProcessor,
        availableCredits: creditBalance?.availableCredits || 0,
        message: !hasProcessor 
          ? "Connect your payment processor to use credits model"
          : (creditBalance?.availableCredits || 0) === 0
          ? "Purchase credits before publishing event"
          : "Ready to publish with credits model",
      };
    }
    
    return {
      configured: true,
      requiresSetup: false,
      paymentModel: paymentConfig.paymentModel,
      message: "Payment configuration complete",
    };
  },
});

// Initialize payment configuration for an event
export const initializePaymentConfig = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.string(),
    paymentModel: v.union(
      v.literal("credits"),
      v.literal("premium")
    ),
  },
  handler: async (ctx, args) => {
    // Check if config already exists
    const existing = await ctx.db
      .query("paymentConfigs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (existing) {
      throw new Error("Payment configuration already exists for this event");
    }
    
    // Get organizer trust level
    const organizerTrust = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Validate model eligibility
    if (args.paymentModel === "premium") {
      // Check if organizer is eligible for premium processing
      if (!organizerTrust || organizerTrust.trustLevel === "NEW") {
        // Allow new organizers to use premium with restrictions
        console.log("New organizer using premium processing with hold period");
      }
    }
    
    // Create configuration
    const configData: Record<string, unknown> = {
      organizerId: args.organizerId,
      eventId: args.eventId,
      paymentModel: args.paymentModel,
      isActive: true,
      configuredAt: Date.now(),
      lastUpdated: Date.now(),
    };
    
    if (args.paymentModel === "credits") {
      configData.platformFee = PAYMENT_MODELS.CREDITS.fixedFeePerTicket;
      configData.platformFeeType = "fixed";
      configData.processingFee = 0;
      configData.creditCostPerTicket = PAYMENT_MODELS.CREDITS.fixedFeePerTicket;
      configData.hasCreditsConnectedProcessor = false; // Will be updated when processor connected
    } else {
      configData.platformFee = PAYMENT_MODELS.PREMIUM.percentageFee;
      configData.platformFeeType = "percentage";
      configData.processingFee = PAYMENT_MODELS.PREMIUM.processingFee;
      configData.premiumServiceFeePercent = PAYMENT_MODELS.PREMIUM.percentageFee;
      configData.premiumServiceFeeFixed = PAYMENT_MODELS.PREMIUM.fixedFeePerTicket;
      configData.premiumProcessingFeePercent = PAYMENT_MODELS.PREMIUM.processingFee;
    }
    
    // Add trust-related fields
    configData.trustScore = organizerTrust?.trustScore || 0;
    configData.chargebackCount = organizerTrust?.chargebackCount || 0;
    configData.successfulEvents = organizerTrust?.eventsCompleted || 0;
    configData.requiresManualReview = !organizerTrust || organizerTrust.trustScore < 50;
    configData.maxEventValue = organizerTrust?.maxEventValue || 10000;
    
    const configId = await ctx.db.insert("paymentConfigs", configData);
    
    // Initialize organizer trust if doesn't exist
    if (!organizerTrust) {
      await ctx.db.insert("organizerTrust", {
        organizerId: args.organizerId,
        trustLevel: "NEW",
        trustScore: 0,
        eventsCompleted: 0,
        totalRevenue: 0,
        lifetimeTicketsSold: 0,
        chargebackCount: 0,
        chargebackRate: 0,
        disputeCount: 0,
        refundCount: 0,
        accountAge: 0,
        averageEventValue: 0,
        maxEventValue: 10000,
        maxTicketPrice: 500,
        holdPeriod: 7,
        availableOptions: ["credits", "premium"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Log audit entry
    await ctx.db.insert("paymentAuditLog", {
      entityType: "payment_config",
      entityId: configId,
      action: "created",
      actionBy: args.organizerId,
      actionType: "user",
      newState: JSON.stringify({
        paymentModel: args.paymentModel,
        eventId: args.eventId,
      }),
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      configId,
      paymentModel: args.paymentModel,
      nextSteps: args.paymentModel === "credits" 
        ? ["purchase_credits", "connect_processor"]
        : ["enter_bank_details", "verify_identity"],
      message: `Payment configuration initialized with ${args.paymentModel} model`,
    };
  },
});

// Get available payment options for an organizer
export const getAvailablePaymentOptions = query({
  args: {
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get organizer trust level
    const organizerTrust = await ctx.db
      .query("organizerTrust")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Get credit balance
    const creditBalance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
      .first();
    
    // Get credit packages
    const creditPackages = await ctx.db
      .query("creditPackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Determine available options based on trust
    const availableModels = organizerTrust?.availableOptions || ["credits", "premium"];
    
    const options = [];
    
    // Credits option
    if (availableModels.includes("credits")) {
      options.push({
        model: "credits",
        name: PAYMENT_MODELS.CREDITS.name,
        description: PAYMENT_MODELS.CREDITS.description,
        fee: `$${PAYMENT_MODELS.CREDITS.fixedFeePerTicket} per ticket`,
        benefits: [
          "Lowest fees - just $0.79 per ticket",
          "Instant access to funds",
          "Use your existing payment processor",
          "No percentage fees",
        ],
        requirements: [
          "Purchase credits upfront",
          "Connect Stripe, Square, or PayPal",
          "Handle your own customer support",
        ],
        currentStatus: {
          hasCredits: creditBalance?.availableCredits > 0,
          creditsAvailable: creditBalance?.availableCredits || 0,
          needsProcessor: true,
        },
        creditPackages: creditPackages.map(pkg => ({
          id: pkg._id,
          name: pkg.name,
          credits: pkg.credits,
          price: pkg.price,
          savingsPercent: pkg.savingsPercent,
          description: pkg.description,
          popularBadge: pkg.popularBadge,
        })),
      });
    }
    
    // Premium processing option
    if (availableModels.includes("premium")) {
      options.push({
        model: "premium",
        name: PAYMENT_MODELS.PREMIUM.name,
        description: PAYMENT_MODELS.PREMIUM.description,
        fee: `${PAYMENT_MODELS.PREMIUM.percentageFee}% + $${PAYMENT_MODELS.PREMIUM.fixedFeePerTicket} per ticket`,
        benefits: [
          "We handle all payment processing",
          "Chargeback protection",
          "24/7 customer support",
          "No upfront costs",
        ],
        requirements: [
          "Provide bank account for payouts",
          "Payouts 5 days after event",
          "Platform handles disputes",
        ],
        currentStatus: {
          eligible: true,
          holdPeriod: organizerTrust?.holdPeriod || 7,
          trustLevel: organizerTrust?.trustLevel || "NEW",
        },
      });
    }
    
    return {
      options,
      organizerProfile: {
        trustLevel: organizerTrust?.trustLevel || "NEW",
        eventsCompleted: organizerTrust?.eventsCompleted || 0,
        trustScore: organizerTrust?.trustScore || 0,
        hasCredits: creditBalance?.availableCredits > 0,
        creditsAvailable: creditBalance?.availableCredits || 0,
      },
      recommendation: options.length > 0 ? options[0].model : null,
    };
  },
});