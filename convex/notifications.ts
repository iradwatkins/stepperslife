import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new notification
export const createNotification = internalMutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("event_claim_requested"),
      v.literal("event_claimed"),
      v.literal("event_claim_approved"),
      v.literal("event_deleted"),
      v.literal("admin_event_posted"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    eventId: v.optional(v.id("events")),
    relatedUserId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      eventId: args.eventId,
      relatedUserId: args.relatedUserId,
      read: false,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
    
    return notificationId;
  },
});

// Get all notifications for a user
export const getUserNotifications = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    
    // Enrich with event data if available
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let event = null;
        if (notification.eventId) {
          event = await ctx.db.get(notification.eventId);
        }
        
        return {
          ...notification,
          event: event ? {
            _id: event._id,
            name: event.name,
            eventDate: event.eventDate,
            location: event.location,
          } : null,
        };
      })
    );
    
    return enrichedNotifications;
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { 
    notificationId: v.id("notifications"),
    userId: v.string(), // For security check
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    // Security check - ensure user owns this notification
    if (notification.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
    
    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    // Update each notification
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }
    
    return { 
      success: true,
      count: unreadNotifications.length,
    };
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: { 
    notificationId: v.id("notifications"),
    userId: v.string(), // For security check
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    // Security check
    if (notification.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.notificationId);
    
    return { success: true };
  },
});

// Clear old notifications (can be scheduled)
export const clearExpiredNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all notifications that have expired
    const allNotifications = await ctx.db
      .query("notifications")
      .collect();
    
    const expiredNotifications = allNotifications.filter(
      (n) => n.expiresAt && n.expiresAt < now
    );
    
    // Delete expired notifications
    for (const notification of expiredNotifications) {
      await ctx.db.delete(notification._id);
    }
    
    return { 
      success: true,
      deletedCount: expiredNotifications.length,
    };
  },
});

// Helper function to notify admin users
export const notifyAdmins = internalMutation({
  args: {
    type: v.union(
      v.literal("event_claim_requested"),
      v.literal("event_claimed"),
      v.literal("event_claim_approved"),
      v.literal("event_deleted"),
      v.literal("admin_event_posted"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    eventId: v.optional(v.id("events")),
    relatedUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Admin user IDs - these should match your admin identification system
    const ADMIN_USER_IDS = [
      "user_2mPqnyyK7CDiaLwgHQEj", // Replace with actual admin user IDs
      "admin",
    ];
    
    // Create notification for each admin
    const notificationIds = await Promise.all(
      ADMIN_USER_IDS.map(async (adminId) => {
        return await ctx.db.insert("notifications", {
          userId: adminId,
          type: args.type,
          title: args.title,
          message: args.message,
          eventId: args.eventId,
          relatedUserId: args.relatedUserId,
          read: false,
          createdAt: Date.now(),
        });
      })
    );
    
    return notificationIds;
  },
});