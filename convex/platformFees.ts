import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Check if organizer can create/manage events based on platform fee balance
export const checkOrganizerStatus = query({
  args: { organizerId: v.string() },
  handler: async (ctx, { organizerId }) => {
    const balance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizerId))
      .first();
    
    if (!balance) {
      return {
        canCreateEvents: true,
        canSellTickets: true,
        accountStatus: "active" as const,
        outstandingBalance: 0,
        message: "Account in good standing"
      };
    }
    
    // Define thresholds
    const WARNING_THRESHOLD = 100; // $100
    const SUSPENSION_THRESHOLD = 500; // $500
    
    const canCreateEvents = balance.accountStatus !== "suspended";
    const canSellTickets = balance.outstandingBalance < SUSPENSION_THRESHOLD;
    
    let message = "Account in good standing";
    if (balance.outstandingBalance > 0) {
      message = `You have an outstanding balance of $${balance.outstandingBalance.toFixed(2)}`;
    }
    if (balance.outstandingBalance > WARNING_THRESHOLD) {
      message += ". Please pay soon to avoid account restrictions.";
    }
    if (balance.accountStatus === "suspended") {
      message = `Account suspended. Please pay $${balance.outstandingBalance.toFixed(2)} to reactivate.`;
    }
    
    return {
      canCreateEvents,
      canSellTickets,
      accountStatus: balance.accountStatus,
      outstandingBalance: balance.outstandingBalance,
      message
    };
  },
});

// Pay platform fees using credit card/online payment
export const payPlatformFees = mutation({
  args: {
    organizerId: v.string(),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("stripe"),
      v.literal("square"),
      v.literal("paypal")
    ),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Record the payment
    const paymentId = await ctx.db.insert("platformFeePayments", {
      organizerId: args.organizerId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentIntentId,
      description: `Platform fee payment via ${args.paymentMethod}`,
      status: "completed",
      processedAt: Date.now(),
      createdAt: Date.now(),
    });
    
    // Update balance
    const balance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    if (balance) {
      const newTotalPaid = balance.totalPaid + args.amount;
      const newOutstanding = Math.max(0, balance.totalOwed - newTotalPaid);
      
      await ctx.db.patch(balance._id, {
        totalPaid: newTotalPaid,
        outstandingBalance: newOutstanding,
        accountStatus: newOutstanding === 0 ? "active" : 
                      newOutstanding > 100 ? "warning" : "active",
        lastPaymentDate: Date.now(),
        lastPaymentAmount: args.amount,
        warningsSent: 0, // Reset warnings after payment
        updatedAt: Date.now(),
      });
      
      // Schedule email notification of payment received
      await ctx.scheduler.runAfter(0, internal.platformFees.sendPaymentConfirmation, {
        organizerId: args.organizerId,
        amount: args.amount,
        newBalance: newOutstanding,
      });
    }
    
    return {
      success: true,
      paymentId,
      message: `Payment of $${args.amount.toFixed(2)} received. Thank you!`
    };
  },
});

// Internal mutation to send payment confirmation
export const sendPaymentConfirmation = internalMutation({
  args: {
    organizerId: v.string(),
    amount: v.number(),
    newBalance: v.number(),
  },
  handler: async (ctx, args) => {
    // This will be called by the email service
    console.log(`Sending payment confirmation to organizer ${args.organizerId}`);
    console.log(`Amount paid: $${args.amount.toFixed(2)}`);
    console.log(`New balance: $${args.newBalance.toFixed(2)}`);
  },
});

// Get detailed platform fee statement for an organizer
export const getPlatformFeeStatement = query({
  args: { 
    organizerId: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const start = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000; // Default 30 days
    const end = args.endDate || Date.now();
    
    // Get all cash sales in period
    const cashSales = await ctx.db
      .query("cashSales")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), start),
          q.lte(q.field("createdAt"), end)
        )
      )
      .collect();
    
    // Get all payments in period
    const payments = await ctx.db
      .query("platformFeePayments")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), start),
          q.lte(q.field("createdAt"), end)
        )
      )
      .collect();
    
    // Get current balance
    const balance = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();
    
    // Calculate totals
    const totalFeesGenerated = cashSales.reduce((sum, sale) => sum + sale.totalPlatformFee, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      period: {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      },
      cashSales: cashSales.map(sale => ({
        date: sale.createdAt,
        eventId: sale.eventId,
        ticketsSold: sale.ticketsSold,
        platformFee: sale.totalPlatformFee,
        location: sale.location,
        soldBy: sale.soldBy,
      })),
      payments: payments.map(payment => ({
        date: payment.createdAt,
        amount: payment.amount,
        method: payment.paymentMethod,
        reference: payment.paymentReference,
        status: payment.status,
      })),
      summary: {
        totalFeesGenerated,
        totalPayments,
        periodBalance: totalFeesGenerated - totalPayments,
        currentOutstandingBalance: balance?.outstandingBalance || 0,
        accountStatus: balance?.accountStatus || "active",
      }
    };
  },
});

// Check and update account statuses (run periodically)
export const updateAccountStatuses = internalMutation({
  handler: async (ctx) => {
    const balances = await ctx.db
      .query("platformFeeBalances")
      .withIndex("by_balance", (q) => q.gt("outstandingBalance", 0))
      .collect();
    
    const WARNING_THRESHOLD = 100;
    const SUSPENSION_THRESHOLD = 500;
    const GRACE_PERIOD_DAYS = 7;
    
    for (const balance of balances) {
      let newStatus = balance.accountStatus;
      let shouldSendWarning = false;
      
      // Check thresholds
      if (balance.outstandingBalance >= SUSPENSION_THRESHOLD) {
        if (balance.accountStatus !== "suspended") {
          // Check if grace period has passed
          const daysSinceLastPayment = balance.lastPaymentDate 
            ? (Date.now() - balance.lastPaymentDate) / (1000 * 60 * 60 * 24)
            : GRACE_PERIOD_DAYS + 1;
          
          if (daysSinceLastPayment > GRACE_PERIOD_DAYS) {
            newStatus = "suspended";
            shouldSendWarning = true;
          }
        }
      } else if (balance.outstandingBalance >= WARNING_THRESHOLD) {
        if (balance.accountStatus === "active") {
          newStatus = "warning";
          shouldSendWarning = true;
        }
      } else if (balance.outstandingBalance === 0) {
        newStatus = "active";
      }
      
      // Update status if changed
      if (newStatus !== balance.accountStatus || shouldSendWarning) {
        await ctx.db.patch(balance._id, {
          accountStatus: newStatus,
          warningsSent: shouldSendWarning ? balance.warningsSent + 1 : balance.warningsSent,
          lastWarningDate: shouldSendWarning ? Date.now() : balance.lastWarningDate,
          suspendedAt: newStatus === "suspended" ? Date.now() : undefined,
          updatedAt: Date.now(),
        });
        
        // Schedule warning email
        if (shouldSendWarning) {
          await ctx.scheduler.runAfter(0, internal.platformFees.sendAccountStatusNotification, {
            organizerId: balance.organizerId,
            status: newStatus,
            balance: balance.outstandingBalance,
          });
        }
      }
    }
  },
});

// Internal mutation to send account status notifications
export const sendAccountStatusNotification = internalMutation({
  args: {
    organizerId: v.string(),
    status: v.string(),
    balance: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`Sending ${args.status} notification to organizer ${args.organizerId}`);
    console.log(`Outstanding balance: $${args.balance.toFixed(2)}`);
    // Email will be sent via SendGrid integration
  },
});