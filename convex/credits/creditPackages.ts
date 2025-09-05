import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Initialize default credit packages
export const initializeDefaultPackages = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if packages already exist
    const existingPackages = await ctx.db
      .query("creditPackages")
      .collect();
    
    if (existingPackages.length > 0) {
      return {
        message: "Credit packages already initialized",
        count: existingPackages.length,
      };
    }
    
    // Default credit packages
    const defaultPackages = [
      {
        name: "Starter Pack",
        credits: 100,
        price: 79.00,
        savingsPercent: 0,
        description: "Perfect for small events and getting started",
        isActive: true,
        minPurchaseQuantity: 1,
        maxPurchaseQuantity: 10,
        displayOrder: 1,
        popularBadge: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Growth Pack",
        credits: 500,
        price: 375.00,
        savingsPercent: 5,
        description: "Save 5% - Great for regular event organizers",
        isActive: true,
        minPurchaseQuantity: 1,
        maxPurchaseQuantity: 5,
        displayOrder: 2,
        popularBadge: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Professional",
        credits: 1000,
        price: 711.00,
        savingsPercent: 10,
        description: "Save 10% - Best value for high-volume events",
        isActive: true,
        minPurchaseQuantity: 1,
        maxPurchaseQuantity: 3,
        displayOrder: 3,
        popularBadge: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Enterprise",
        credits: 5000,
        price: 3160.00,
        savingsPercent: 20,
        description: "Save 20% - Maximum savings for large organizations",
        isActive: true,
        minPurchaseQuantity: 1,
        maxPurchaseQuantity: 2,
        displayOrder: 4,
        popularBadge: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    
    // Insert packages
    const insertedIds = [];
    for (const pkg of defaultPackages) {
      const id = await ctx.db.insert("creditPackages", pkg);
      insertedIds.push(id);
    }
    
    return {
      message: "Credit packages initialized successfully",
      count: insertedIds.length,
      packageIds: insertedIds,
    };
  },
});

// Get active credit packages with pricing
export const getActivePackages = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Sort by display order and add calculated fields
    return packages
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(pkg => ({
        ...pkg,
        pricePerCredit: pkg.price / pkg.credits,
        savingsAmount: pkg.savingsPercent > 0 
          ? (pkg.credits * 0.79) - pkg.price
          : 0,
      }));
  },
});

// Update package pricing (admin only)
export const updatePackagePricing = mutation({
  args: {
    packageId: v.id("creditPackages"),
    price: v.optional(v.number()),
    savingsPercent: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const pkg = await ctx.db.get(args.packageId);
    if (!pkg) {
      throw new Error("Package not found");
    }
    
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    
    if (args.price !== undefined) {
      updates.price = args.price;
    }
    if (args.savingsPercent !== undefined) {
      updates.savingsPercent = args.savingsPercent;
    }
    if (args.isActive !== undefined) {
      updates.isActive = args.isActive;
    }
    
    await ctx.db.patch(args.packageId, updates);
    
    return {
      success: true,
      message: "Package updated successfully",
    };
  },
});

// Calculate best value package for ticket count
export const recommendPackage = query({
  args: {
    ticketCount: v.number(),
  },
  handler: async (ctx, args) => {
    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Find the most cost-effective package
    let bestPackage = null;
    let bestValue = Infinity;
    
    for (const pkg of packages) {
      // Calculate how many packages needed
      const packagesNeeded = Math.ceil(args.ticketCount / pkg.credits);
      
      // Check if within max purchase limit
      if (pkg.maxPurchaseQuantity && packagesNeeded > pkg.maxPurchaseQuantity) {
        continue;
      }
      
      const totalCost = packagesNeeded * pkg.price;
      const costPerTicket = totalCost / args.ticketCount;
      
      if (costPerTicket < bestValue) {
        bestValue = costPerTicket;
        bestPackage = {
          ...pkg,
          packagesNeeded,
          totalCost,
          costPerTicket,
          totalCredits: packagesNeeded * pkg.credits,
          excessCredits: (packagesNeeded * pkg.credits) - args.ticketCount,
        };
      }
    }
    
    // Also calculate cost without bulk discount
    const standardCost = args.ticketCount * 0.79;
    
    return {
      recommendation: bestPackage,
      standardCost,
      savings: bestPackage ? standardCost - bestPackage.totalCost : 0,
      savingsPercent: bestPackage 
        ? ((standardCost - bestPackage.totalCost) / standardCost) * 100
        : 0,
    };
  },
});