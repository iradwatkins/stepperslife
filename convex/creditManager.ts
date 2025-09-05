import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Constants
const RESERVATION_TTL_MS = 120000; // 2 minutes

// Credit packages configuration
export const DEFAULT_CREDIT_PACKAGES = [
  {
    name: "Starter Pack",
    credits: 100,
    price: 79.00,
    savingsPercent: 0,
    description: "Perfect for small events",
    displayOrder: 1,
  },
  {
    name: "Growth Pack",
    credits: 500,
    price: 375.00,
    savingsPercent: 5,
    description: "Save 5% - Great for regular organizers",
    displayOrder: 2,
    popularBadge: true,
  },
  {
    name: "Professional",
    credits: 1000,
    price: 711.00,
    savingsPercent: 10,
    description: "Save 10% - Best for high-volume events",
    displayOrder: 3,
  },
  {
    name: "Enterprise",
    credits: 5000,
    price: 3160.00,
    savingsPercent: 20,
    description: "Save 20% - Maximum savings for large organizations",
    displayOrder: 4,
  },
];

// Get available credit packages
export const getCreditPackages = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Sort by display order
    return packages.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Get organization's credit balance
export const getBalance = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
      .first();
    
    if (!balance) {
      // Return default empty balance
      return {
        organizationId: args.organizerId,
        totalCredits: 0,
        reservedCredits: 0,
        availableCredits: 0,
        lifetimePurchased: 0,
        lifetimeUsed: 0,
        autoReloadEnabled: false,
        isActive: true,
      };
    }
    
    return balance;
  },
});

// Get credit transaction history
export const getTransactionHistory = query({
  args: { 
    organizerId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let transactionsQuery = ctx.db
      .query("creditTransactions")
      .withIndex("by_organization_created", (q) => 
        q.eq("organizationId", args.organizerId)
      )
      .order("desc");
    
    // Apply cursor if provided
    if (args.cursor) {
      // Cursor would be the last transaction ID from previous page
      // This is a simplified implementation
      const cursorValue = parseInt(args.cursor);
      transactionsQuery = transactionsQuery.filter((q) => 
        q.lt(q.field("createdAt"), cursorValue)
      );
    }
    
    const transactions = await transactionsQuery.take(limit);
    
    // Get the next cursor (timestamp of last transaction)
    const nextCursor = transactions.length === limit 
      ? transactions[transactions.length - 1].createdAt.toString()
      : null;
    
    return {
      transactions,
      nextCursor,
      hasMore: transactions.length === limit,
    };
  },
});

// Purchase credits
export const purchaseCredits = mutation({
  args: {
    organizerId: v.string(),
    packageId: v.id("creditPackages"),
    quantity: v.number(),
    paymentReference: v.string(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the package details
    const creditPackage = await ctx.db.get(args.packageId);
    if (!creditPackage || !creditPackage.isActive) {
      throw new Error("Invalid or inactive credit package");
    }
    
    // Validate quantity
    if (args.quantity < creditPackage.minPurchaseQuantity) {
      throw new Error(`Minimum purchase quantity is ${creditPackage.minPurchaseQuantity}`);
    }
    if (creditPackage.maxPurchaseQuantity && args.quantity > creditPackage.maxPurchaseQuantity) {
      throw new Error(`Maximum purchase quantity is ${creditPackage.maxPurchaseQuantity}`);
    }
    
    // Calculate total credits and amount
    const totalCredits = creditPackage.credits * args.quantity;
    const totalAmount = creditPackage.price * args.quantity;
    
    // Get current balance or create new one
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
      .first();
    
    const balanceBefore = balance?.totalCredits || 0;
    const balanceAfter = balanceBefore + totalCredits;
    
    if (balance) {
      // Update existing balance
      await ctx.db.patch(balance._id, {
        totalCredits: balance.totalCredits + totalCredits,
        availableCredits: balance.availableCredits + totalCredits,
        lifetimePurchased: balance.lifetimePurchased + totalCredits,
        lastPurchaseAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // Create new balance
      await ctx.db.insert("creditBalances", {
        organizationId: args.organizerId,
        totalCredits: totalCredits,
        reservedCredits: 0,
        availableCredits: totalCredits,
        lifetimePurchased: totalCredits,
        lifetimeUsed: 0,
        lastPurchaseAt: Date.now(),
        autoReloadEnabled: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Record transaction
    const transactionId = await ctx.db.insert("creditTransactions", {
      organizationId: args.organizerId,
      transactionType: "purchase",
      creditsAmount: totalCredits,
      balanceBefore,
      balanceAfter,
      packageId: args.packageId,
      referenceType: "credit_purchase",
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      purchaseAmount: totalAmount,
      description: `Purchased ${totalCredits} credits (${creditPackage.name} x${args.quantity})`,
      createdAt: Date.now(),
      createdBy: args.organizerId,
    });
    
    // Log audit entry
    await ctx.db.insert("paymentAuditLog", {
      entityType: "credit_transaction",
      entityId: transactionId,
      action: "purchase",
      actionBy: args.organizerId,
      actionType: "user",
      newState: JSON.stringify({
        credits: totalCredits,
        amount: totalAmount,
        package: creditPackage.name,
      }),
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      transactionId,
      creditsAdded: totalCredits,
      newBalance: balanceAfter,
      message: `Successfully purchased ${totalCredits} credits`,
    };
  },
});

// Reserve credits for checkout
export const reserveCredits = mutation({
  args: {
    organizerId: v.string(),
    eventId: v.id("events"),
    ticketCount: v.number(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check existing reservation for this session
    const existingReservation = await ctx.db
      .query("creditReservations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (existingReservation) {
      // Return existing reservation if still valid
      if (existingReservation.expiresAt > Date.now()) {
        return {
          success: true,
          reservationId: existingReservation._id,
          creditsReserved: existingReservation.creditsReserved,
          expiresAt: existingReservation.expiresAt,
        };
      }
      // Mark expired reservation
      await ctx.db.patch(existingReservation._id, { status: "expired" });
    }
    
    // Get current balance
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizerId))
      .first();
    
    if (!balance) {
      throw new Error("No credit balance found. Please purchase credits first.");
    }
    
    // Check available credits
    const creditsNeeded = args.ticketCount;
    if (balance.availableCredits < creditsNeeded) {
      throw new Error(
        `Insufficient credits. Need ${creditsNeeded}, have ${balance.availableCredits} available.`
      );
    }
    
    // Create reservation
    const expiresAt = Date.now() + RESERVATION_TTL_MS;
    const reservationId = await ctx.db.insert("creditReservations", {
      organizationId: args.organizerId,
      sessionId: args.sessionId,
      creditsReserved: creditsNeeded,
      eventId: args.eventId,
      ticketCount: args.ticketCount,
      expiresAt,
      status: "active",
      createdAt: Date.now(),
    });
    
    // Update balance with reserved credits
    await ctx.db.patch(balance._id, {
      reservedCredits: balance.reservedCredits + creditsNeeded,
      availableCredits: balance.availableCredits - creditsNeeded,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      reservationId,
      creditsReserved: creditsNeeded,
      expiresAt,
      message: `Reserved ${creditsNeeded} credits for ${args.ticketCount} tickets`,
    };
  },
});

// Confirm credit usage after successful payment
export const confirmCreditsUsage = mutation({
  args: {
    reservationId: v.id("creditReservations"),
    ticketIds: v.array(v.id("tickets")),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    // Get reservation
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation || reservation.status !== "active") {
      throw new Error("Invalid or expired reservation");
    }
    
    // Verify ticket count matches
    if (args.ticketIds.length !== reservation.ticketCount) {
      throw new Error("Ticket count mismatch");
    }
    
    // Get balance
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", reservation.organizationId)
      )
      .first();
    
    if (!balance) {
      throw new Error("Balance not found");
    }
    
    const balanceBefore = balance.totalCredits;
    const balanceAfter = balanceBefore - reservation.creditsReserved;
    
    // Deduct credits from balance
    await ctx.db.patch(balance._id, {
      totalCredits: balance.totalCredits - reservation.creditsReserved,
      reservedCredits: balance.reservedCredits - reservation.creditsReserved,
      lifetimeUsed: balance.lifetimeUsed + reservation.creditsReserved,
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Mark reservation as confirmed
    await ctx.db.patch(reservation._id, {
      status: "confirmed",
    });
    
    // Record transaction
    const transactionId = await ctx.db.insert("creditTransactions", {
      organizationId: reservation.organizationId,
      transactionType: "deduction",
      creditsAmount: -reservation.creditsReserved,
      balanceBefore,
      balanceAfter,
      eventId: reservation.eventId,
      ticketId: args.ticketIds[0], // Reference first ticket
      referenceType: "ticket_sale",
      paymentReference: args.paymentReference,
      description: `Used ${reservation.creditsReserved} credits for ${reservation.ticketCount} tickets`,
      metadata: JSON.stringify({
        ticketIds: args.ticketIds,
        sessionId: reservation.sessionId,
      }),
      createdAt: Date.now(),
      createdBy: reservation.organizationId,
    });
    
    // Check for low balance and trigger auto-reload if enabled
    if (balance.autoReloadEnabled && 
        balance.autoReloadThreshold && 
        balanceAfter < balance.autoReloadThreshold) {
      // Trigger auto-reload (would be implemented with payment processing)
      console.log("Auto-reload triggered for organization:", reservation.organizationId);
    }
    
    return {
      success: true,
      transactionId,
      creditsUsed: reservation.creditsReserved,
      newBalance: balanceAfter,
      message: `Successfully used ${reservation.creditsReserved} credits`,
    };
  },
});

// Release reservation (on cancellation or timeout)
export const releaseReservation = mutation({
  args: {
    reservationId: v.id("creditReservations"),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation || reservation.status !== "active") {
      return { success: false, message: "Reservation already released or expired" };
    }
    
    // Get balance
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", reservation.organizationId)
      )
      .first();
    
    if (balance) {
      // Release reserved credits
      await ctx.db.patch(balance._id, {
        reservedCredits: balance.reservedCredits - reservation.creditsReserved,
        availableCredits: balance.availableCredits + reservation.creditsReserved,
        updatedAt: Date.now(),
      });
    }
    
    // Mark reservation as cancelled
    await ctx.db.patch(reservation._id, {
      status: "cancelled",
    });
    
    return {
      success: true,
      creditsReleased: reservation.creditsReserved,
      message: `Released ${reservation.creditsReserved} credits`,
    };
  },
});

// Check and expire old reservations (run as cron job)
export const expireReservations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired active reservations
    const expiredReservations = await ctx.db
      .query("creditReservations")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.lte(q.field("expiresAt"), now))
      .collect();
    
    let expiredCount = 0;
    
    for (const reservation of expiredReservations) {
      // Get balance
      const balance = await ctx.db
        .query("creditBalances")
        .withIndex("by_organization", (q) => 
          q.eq("organizationId", reservation.organizationId)
        )
        .first();
      
      if (balance) {
        // Release reserved credits
        await ctx.db.patch(balance._id, {
          reservedCredits: Math.max(0, balance.reservedCredits - reservation.creditsReserved),
          availableCredits: balance.availableCredits + reservation.creditsReserved,
          updatedAt: Date.now(),
        });
      }
      
      // Mark reservation as expired
      await ctx.db.patch(reservation._id, {
        status: "expired",
      });
      
      expiredCount++;
    }
    
    return {
      expiredCount,
      message: `Expired ${expiredCount} reservations`,
    };
  },
});

// Admin: Adjust credits manually
export const adjustCredits = mutation({
  args: {
    organizerId: v.string(),
    adjustmentAmount: v.number(), // Can be positive or negative
    reason: v.string(),
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current balance
    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", args.organizerId)
      )
      .first();
    
    const balanceBefore = balance?.totalCredits || 0;
    const balanceAfter = balanceBefore + args.adjustmentAmount;
    
    if (balanceAfter < 0) {
      throw new Error("Cannot adjust credits below zero");
    }
    
    if (balance) {
      // Update balance
      await ctx.db.patch(balance._id, {
        totalCredits: balanceAfter,
        availableCredits: balance.availableCredits + args.adjustmentAmount,
        updatedAt: Date.now(),
      });
    } else if (args.adjustmentAmount > 0) {
      // Create new balance if adding credits
      await ctx.db.insert("creditBalances", {
        organizationId: args.organizerId,
        totalCredits: args.adjustmentAmount,
        reservedCredits: 0,
        availableCredits: args.adjustmentAmount,
        lifetimePurchased: args.adjustmentAmount,
        lifetimeUsed: 0,
        autoReloadEnabled: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Record transaction
    const transactionId = await ctx.db.insert("creditTransactions", {
      organizationId: args.organizerId,
      transactionType: "adjustment",
      creditsAmount: args.adjustmentAmount,
      balanceBefore,
      balanceAfter,
      referenceType: "manual_adjustment",
      description: args.reason,
      createdAt: Date.now(),
      createdBy: args.adminUserId,
    });
    
    // Log audit entry
    await ctx.db.insert("paymentAuditLog", {
      entityType: "credit_transaction",
      entityId: transactionId,
      action: "manual_adjustment",
      actionBy: args.adminUserId,
      actionType: "admin",
      previousState: JSON.stringify({ balance: balanceBefore }),
      newState: JSON.stringify({ balance: balanceAfter }),
      reason: args.reason,
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      transactionId,
      adjustment: args.adjustmentAmount,
      newBalance: balanceAfter,
      message: `Adjusted credits by ${args.adjustmentAmount}`,
    };
  },
});