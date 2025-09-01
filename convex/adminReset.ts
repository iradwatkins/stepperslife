import { mutation } from "./_generated/server";
import { v } from "convex/values";

// WARNING: These are admin-only functions to reset all data
// Only use in development or when starting fresh production

export const clearAllEvents = mutation({
  args: {
    confirmReset: v.string(), // Must be "RESET_ALL_DATA" to confirm
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    let totalDeleted = 0;

    // Get all events
    const events = await ctx.db.query("events").collect();
    
    // Delete all events
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    totalDeleted += events.length;

    // Clear all event-related tables
    
    // Event days for multi-day events
    const eventDays = await ctx.db.query("eventDays").collect();
    for (const day of eventDays) {
      await ctx.db.delete(day._id);
    }
    totalDeleted += eventDays.length;

    // Event staff assignments
    const eventStaff = await ctx.db.query("eventStaff").collect();
    for (const staff of eventStaff) {
      await ctx.db.delete(staff._id);
    }
    totalDeleted += eventStaff.length;

    // Clear all tickets since they're tied to events
    const tickets = await ctx.db.query("tickets").collect();
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }
    totalDeleted += tickets.length;

    // Clear simple tickets
    const simpleTickets = await ctx.db.query("simpleTickets").collect();
    for (const ticket of simpleTickets) {
      await ctx.db.delete(ticket._id);
    }
    totalDeleted += simpleTickets.length;

    // Clear ticket types
    const dayTicketTypes = await ctx.db.query("dayTicketTypes").collect();
    for (const ticketType of dayTicketTypes) {
      await ctx.db.delete(ticketType._id);
    }
    totalDeleted += dayTicketTypes.length;

    // Clear ticket bundles
    const ticketBundles = await ctx.db.query("ticketBundles").collect();
    for (const bundle of ticketBundles) {
      await ctx.db.delete(bundle._id);
    }
    totalDeleted += ticketBundles.length;

    // Clear bundle purchases
    const bundlePurchases = await ctx.db.query("bundlePurchases").collect();
    for (const purchase of bundlePurchases) {
      await ctx.db.delete(purchase._id);
    }
    totalDeleted += bundlePurchases.length;

    // Clear all purchases
    const purchases = await ctx.db.query("purchases").collect();
    for (const purchase of purchases) {
      await ctx.db.delete(purchase._id);
    }
    totalDeleted += purchases.length;

    // Clear table configurations
    const tables = await ctx.db.query("tableConfigurations").collect();
    for (const table of tables) {
      await ctx.db.delete(table._id);
    }
    totalDeleted += tables.length;

    // Clear waiting lists
    const waitingLists = await ctx.db.query("waitingList").collect();
    for (const item of waitingLists) {
      await ctx.db.delete(item._id);
    }
    totalDeleted += waitingLists.length;

    // Clear affiliate programs tied to events
    const affiliates = await ctx.db.query("affiliatePrograms").collect();
    for (const affiliate of affiliates) {
      await ctx.db.delete(affiliate._id);
    }
    totalDeleted += affiliates.length;

    // Clear scan logs
    const scanLogs = await ctx.db.query("scanLogs").collect();
    for (const log of scanLogs) {
      await ctx.db.delete(log._id);
    }
    totalDeleted += scanLogs.length;

    // Clear ticket claims
    const ticketClaims = await ctx.db.query("ticketClaims").collect();
    for (const claim of ticketClaims) {
      await ctx.db.delete(claim._id);
    }
    totalDeleted += ticketClaims.length;

    // Clear platform transactions (all are event-related)
    const platformTxns = await ctx.db.query("platformTransactions").collect();
    for (const txn of platformTxns) {
      await ctx.db.delete(txn._id);
    }
    totalDeleted += platformTxns.length;

    // Clear payment requests (event-related)
    const paymentRequests = await ctx.db.query("paymentRequests").collect();
    for (const request of paymentRequests) {
      await ctx.db.delete(request._id);
    }
    totalDeleted += paymentRequests.length;

    return { 
      deleted: totalDeleted, 
      message: `✅ Successfully cleared ${events.length} events and ${totalDeleted - events.length} related records. Total deleted: ${totalDeleted}`,
      breakdown: {
        events: events.length,
        eventDays: eventDays.length,
        tickets: tickets.length + simpleTickets.length,
        purchases: purchases.length + bundlePurchases.length,
        tables: tables.length,
        waitingLists: waitingLists.length,
        affiliates: affiliates.length,
        other: eventStaff.length + scanLogs.length + ticketClaims.length + platformTxns.length + paymentRequests.length
      }
    };
  },
});

export const clearAllTickets = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    let totalDeleted = 0;

    // Clear tickets table
    const tickets = await ctx.db.query("tickets").collect();
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }
    totalDeleted += tickets.length;

    // Clear simpleTickets table
    const simpleTickets = await ctx.db.query("simpleTickets").collect();
    for (const ticket of simpleTickets) {
      await ctx.db.delete(ticket._id);
    }
    totalDeleted += simpleTickets.length;

    // Clear dayTicketTypes table
    const dayTicketTypes = await ctx.db.query("dayTicketTypes").collect();
    for (const ticketType of dayTicketTypes) {
      await ctx.db.delete(ticketType._id);
    }
    totalDeleted += dayTicketTypes.length;

    // Clear ticketBundles table
    const ticketBundles = await ctx.db.query("ticketBundles").collect();
    for (const bundle of ticketBundles) {
      await ctx.db.delete(bundle._id);
    }
    totalDeleted += ticketBundles.length;

    // Clear ticketClaims table
    const ticketClaims = await ctx.db.query("ticketClaims").collect();
    for (const claim of ticketClaims) {
      await ctx.db.delete(claim._id);
    }
    totalDeleted += ticketClaims.length;

    return { deleted: totalDeleted, message: "All tickets cleared" };
  },
});

export const clearAllPurchases = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    let totalDeleted = 0;

    // Clear purchases table
    const purchases = await ctx.db.query("purchases").collect();
    for (const purchase of purchases) {
      await ctx.db.delete(purchase._id);
    }
    totalDeleted += purchases.length;

    // Clear bundlePurchases table
    const bundlePurchases = await ctx.db.query("bundlePurchases").collect();
    for (const purchase of bundlePurchases) {
      await ctx.db.delete(purchase._id);
    }
    totalDeleted += bundlePurchases.length;

    // Clear scanLogs table
    const scanLogs = await ctx.db.query("scanLogs").collect();
    for (const log of scanLogs) {
      await ctx.db.delete(log._id);
    }
    totalDeleted += scanLogs.length;

    return { deleted: totalDeleted, message: "All purchases and scans cleared" };
  },
});

export const clearAllTables = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    // Clear tableConfigurations
    const tables = await ctx.db.query("tableConfigurations").collect();
    for (const table of tables) {
      await ctx.db.delete(table._id);
    }

    return { deleted: tables.length, message: "All table configurations cleared" };
  },
});

export const clearAllTransactions = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    let totalDeleted = 0;

    // Clear platformTransactions
    const platformTxns = await ctx.db.query("platformTransactions").collect();
    for (const txn of platformTxns) {
      await ctx.db.delete(txn._id);
    }
    totalDeleted += platformTxns.length;

    // Clear payments
    const payments = await ctx.db.query("payments").collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }
    totalDeleted += payments.length;

    // Clear paymentRequests
    const paymentRequests = await ctx.db.query("paymentRequests").collect();
    for (const request of paymentRequests) {
      await ctx.db.delete(request._id);
    }
    totalDeleted += paymentRequests.length;

    // Clear sellerBalances
    const balances = await ctx.db.query("sellerBalances").collect();
    for (const balance of balances) {
      await ctx.db.delete(balance._id);
    }
    totalDeleted += balances.length;

    // Clear payoutRequests
    const payouts = await ctx.db.query("payoutRequests").collect();
    for (const payout of payouts) {
      await ctx.db.delete(payout._id);
    }
    totalDeleted += payouts.length;

    return { deleted: totalDeleted, message: "All transactions cleared" };
  },
});

export const clearAllWaitingLists = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    const waitingLists = await ctx.db.query("waitingList").collect();
    for (const item of waitingLists) {
      await ctx.db.delete(item._id);
    }

    return { deleted: waitingLists.length, message: "All waiting lists cleared" };
  },
});

export const clearAllAffiliates = mutation({
  args: {
    confirmReset: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    const affiliates = await ctx.db.query("affiliatePrograms").collect();
    for (const affiliate of affiliates) {
      await ctx.db.delete(affiliate._id);
    }

    return { deleted: affiliates.length, message: "All affiliate programs cleared" };
  },
});

export const clearNonAdminUsers = mutation({
  args: {
    confirmReset: v.string(),
    preserveEmails: v.optional(v.array(v.string())), // Admin emails to preserve
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }

    const adminEmails = args.preserveEmails || [
      "admin@stepperslife.com",
      "irawatkins@gmail.com",
    ];

    const users = await ctx.db.query("users").collect();
    let deletedCount = 0;

    for (const user of users) {
      if (!adminEmails.includes(user.email)) {
        await ctx.db.delete(user._id);
        deletedCount++;
      }
    }

    return { 
      deleted: deletedCount, 
      preserved: users.length - deletedCount,
      message: `Cleared ${deletedCount} users, preserved ${users.length - deletedCount} admin accounts`
    };
  },
});

// Master reset function - clears EVERYTHING except admin users
export const resetToProduction = mutation({
  args: {
    confirmReset: v.string(),
    confirmDoubleCheck: v.string(), // Must be "YES_DELETE_EVERYTHING"
  },
  handler: async (ctx, args) => {
    if (args.confirmReset !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation string");
    }
    
    if (args.confirmDoubleCheck !== "YES_DELETE_EVERYTHING") {
      throw new Error("Invalid double-check confirmation");
    }

    const results = {
      events: 0,
      tickets: 0,
      purchases: 0,
      tables: 0,
      transactions: 0,
      waitingLists: 0,
      affiliates: 0,
      users: 0,
    };

    // Clear all events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    results.events = events.length;

    // Clear event days
    const eventDays = await ctx.db.query("eventDays").collect();
    for (const day of eventDays) {
      await ctx.db.delete(day._id);
    }
    results.events += eventDays.length;

    // Clear event staff
    const eventStaff = await ctx.db.query("eventStaff").collect();
    for (const staff of eventStaff) {
      await ctx.db.delete(staff._id);
    }
    results.events += eventStaff.length;

    // Clear all ticket-related data
    const tickets = await ctx.db.query("tickets").collect();
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }
    results.tickets += tickets.length;

    const simpleTickets = await ctx.db.query("simpleTickets").collect();
    for (const ticket of simpleTickets) {
      await ctx.db.delete(ticket._id);
    }
    results.tickets += simpleTickets.length;

    const dayTicketTypes = await ctx.db.query("dayTicketTypes").collect();
    for (const ticketType of dayTicketTypes) {
      await ctx.db.delete(ticketType._id);
    }
    results.tickets += dayTicketTypes.length;

    const ticketBundles = await ctx.db.query("ticketBundles").collect();
    for (const bundle of ticketBundles) {
      await ctx.db.delete(bundle._id);
    }
    results.tickets += ticketBundles.length;

    const ticketClaims = await ctx.db.query("ticketClaims").collect();
    for (const claim of ticketClaims) {
      await ctx.db.delete(claim._id);
    }
    results.tickets += ticketClaims.length;

    // Clear purchases and scans
    const purchases = await ctx.db.query("purchases").collect();
    for (const purchase of purchases) {
      await ctx.db.delete(purchase._id);
    }
    results.purchases += purchases.length;

    const bundlePurchases = await ctx.db.query("bundlePurchases").collect();
    for (const purchase of bundlePurchases) {
      await ctx.db.delete(purchase._id);
    }
    results.purchases += bundlePurchases.length;

    const scanLogs = await ctx.db.query("scanLogs").collect();
    for (const log of scanLogs) {
      await ctx.db.delete(log._id);
    }
    results.purchases += scanLogs.length;

    // Clear tables
    const tables = await ctx.db.query("tableConfigurations").collect();
    for (const table of tables) {
      await ctx.db.delete(table._id);
    }
    results.tables = tables.length;

    // Clear transactions
    const platformTxns = await ctx.db.query("platformTransactions").collect();
    for (const txn of platformTxns) {
      await ctx.db.delete(txn._id);
    }
    results.transactions += platformTxns.length;

    const payments = await ctx.db.query("payments").collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }
    results.transactions += payments.length;

    const paymentRequests = await ctx.db.query("paymentRequests").collect();
    for (const request of paymentRequests) {
      await ctx.db.delete(request._id);
    }
    results.transactions += paymentRequests.length;

    const balances = await ctx.db.query("sellerBalances").collect();
    for (const balance of balances) {
      await ctx.db.delete(balance._id);
    }
    results.transactions += balances.length;

    const payouts = await ctx.db.query("payoutRequests").collect();
    for (const payout of payouts) {
      await ctx.db.delete(payout._id);
    }
    results.transactions += payouts.length;

    // Clear waiting lists
    const waitingLists = await ctx.db.query("waitingList").collect();
    for (const item of waitingLists) {
      await ctx.db.delete(item._id);
    }
    results.waitingLists = waitingLists.length;

    // Clear affiliates
    const affiliates = await ctx.db.query("affiliatePrograms").collect();
    for (const affiliate of affiliates) {
      await ctx.db.delete(affiliate._id);
    }
    results.affiliates = affiliates.length;

    // Clear non-admin users
    const adminEmails = ["admin@stepperslife.com", "irawatkins@gmail.com"];
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (!adminEmails.includes(user.email)) {
        await ctx.db.delete(user._id);
        results.users++;
      }
    }

    return {
      success: true,
      message: "🧹 All data has been reset to production state",
      deletedCounts: results,
      totalDeleted: Object.values(results).reduce((a, b) => a + b, 0),
    };
  },
});

// Verification function to check current data counts
export const getDataCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const counts = {
      events: (await ctx.db.query("events").collect()).length,
      eventDays: (await ctx.db.query("eventDays").collect()).length,
      tickets: (await ctx.db.query("tickets").collect()).length,
      simpleTickets: (await ctx.db.query("simpleTickets").collect()).length,
      dayTicketTypes: (await ctx.db.query("dayTicketTypes").collect()).length,
      purchases: (await ctx.db.query("purchases").collect()).length,
      bundlePurchases: (await ctx.db.query("bundlePurchases").collect()).length,
      tables: (await ctx.db.query("tableConfigurations").collect()).length,
      users: (await ctx.db.query("users").collect()).length,
      platformTransactions: (await ctx.db.query("platformTransactions").collect()).length,
      scanLogs: (await ctx.db.query("scanLogs").collect()).length,
      waitingLists: (await ctx.db.query("waitingList").collect()).length,
      affiliates: (await ctx.db.query("affiliatePrograms").collect()).length,
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      counts,
      total,
      isEmpty: total === 0 || (total === counts.users && counts.users <= 2), // Only admin users
    };
  },
});