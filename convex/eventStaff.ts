import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Add staff member to an event
export const addEventStaff = mutation({
  args: {
    eventId: v.id("events"),
    userEmail: v.string(),
    role: v.union(
      v.literal("scanner"),
      v.literal("manager"),
      v.literal("organizer")
    ),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the person adding has permission
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only event creator or managers can add staff
    if (event.userId !== args.addedBy) {
      const addingUserStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", args.eventId).eq("userId", args.addedBy)
        )
        .first();

      if (!addingUserStaff || addingUserStaff.role === "scanner") {
        throw new Error("You don't have permission to add staff");
      }
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return { success: false, message: "User not found with that email" };
    }

    // Check if already staff
    const existingStaff = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first();

    if (existingStaff) {
      return { success: false, message: "User is already staff for this event" };
    }

    // Define permissions based on role
    const permissions = getPermissionsForRole(args.role);

    // Add staff member
    await ctx.db.insert("eventStaff", {
      eventId: args.eventId,
      userId: user.userId,
      role: args.role,
      permissions,
      addedAt: Date.now(),
      addedBy: args.addedBy,
    });

    return { 
      success: true, 
      message: `${user.name} added as ${args.role}`,
      staffId: user.userId
    };
  },
});

// Remove staff member from event
export const removeEventStaff = mutation({
  args: {
    eventId: v.id("events"),
    staffUserId: v.string(),
    removedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== args.removedBy) {
      const removingUserStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", args.eventId).eq("userId", args.removedBy)
        )
        .first();

      if (!removingUserStaff || removingUserStaff.role === "scanner") {
        throw new Error("You don't have permission to remove staff");
      }
    }

    // Find and remove staff member
    const staffRecord = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.staffUserId)
      )
      .first();

    if (!staffRecord) {
      return { success: false, message: "Staff member not found" };
    }

    await ctx.db.delete(staffRecord._id);

    return { success: true, message: "Staff member removed" };
  },
});

// Update staff role
export const updateStaffRole = mutation({
  args: {
    eventId: v.id("events"),
    staffUserId: v.string(),
    newRole: v.union(
      v.literal("scanner"),
      v.literal("manager"),
      v.literal("organizer")
    ),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== args.updatedBy) {
      const updatingUserStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", args.eventId).eq("userId", args.updatedBy)
        )
        .first();

      if (!updatingUserStaff || updatingUserStaff.role !== "manager") {
        throw new Error("Only managers can update staff roles");
      }
    }

    // Find and update staff member
    const staffRecord = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.staffUserId)
      )
      .first();

    if (!staffRecord) {
      return { success: false, message: "Staff member not found" };
    }

    const permissions = getPermissionsForRole(args.newRole);

    await ctx.db.patch(staffRecord._id, {
      role: args.newRole,
      permissions,
    });

    return { success: true, message: `Role updated to ${args.newRole}` };
  },
});

// Get all staff for an event
export const getEventStaff = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const staffMembers = await ctx.db
      .query("eventStaff")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get user details for each staff member
    const staffWithDetails = await Promise.all(
      staffMembers.map(async (staff) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", staff.userId))
          .first();

        return {
          ...staff,
          name: user?.name || "Unknown",
          email: user?.email || "Unknown",
        };
      })
    );

    return staffWithDetails;
  },
});

// Check user's role for an event
export const getUserEventRole = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is event creator
    const event = await ctx.db.get(args.eventId);
    if (event && event.userId === args.userId) {
      return {
        role: "owner",
        permissions: ["all"],
        canScan: true,
        canManageStaff: true,
        canViewStats: true,
        canExportData: true,
      };
    }

    // Check if user is staff
    const staffRecord = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!staffRecord) {
      return {
        role: null,
        permissions: [],
        canScan: false,
        canManageStaff: false,
        canViewStats: false,
        canExportData: false,
      };
    }

    return {
      role: staffRecord.role,
      permissions: staffRecord.permissions,
      canScan: staffRecord.permissions.includes("scan"),
      canManageStaff: staffRecord.permissions.includes("manage_staff"),
      canViewStats: staffRecord.permissions.includes("view_stats"),
      canExportData: staffRecord.permissions.includes("export_data"),
    };
  },
});

// Get events where user is staff
export const getUserStaffEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const staffRecords = await ctx.db
      .query("eventStaff")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get event details for each
    const eventsWithRole = await Promise.all(
      staffRecords.map(async (record) => {
        const event = await ctx.db.get(record.eventId);
        return {
          event,
          role: record.role,
          permissions: record.permissions,
          addedAt: record.addedAt,
        };
      })
    );

    // Filter out null events (in case any were deleted)
    return eventsWithRole.filter((item) => item.event !== null);
  },
});

// Helper function to get permissions based on role
function getPermissionsForRole(role: "scanner" | "manager" | "organizer"): string[] {
  switch (role) {
    case "scanner":
      return ["scan", "view_basic_stats"];
    case "manager":
      return ["scan", "view_stats", "manage_staff", "export_data", "void_tickets"];
    case "organizer":
      return ["all"];
    default:
      return [];
  }
}

// Log staff activity
export const logStaffActivity = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This could be expanded to create an activity log table
    // For now, we'll just return success
    console.log(`Staff activity: ${args.userId} performed ${args.action} on event ${args.eventId}`);
    return { success: true };
  },
});