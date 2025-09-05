import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Check if a user has permission to scan tickets for an event
export const canUserScanEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    // First check if user is the event owner
    const event = await ctx.db.get(eventId);
    if (!event) {
      return { authorized: false, reason: "Event not found" };
    }
    
    if (event.userId === userId) {
      return { 
        authorized: true, 
        role: "organizer" as const,
        canManageStaff: true,
        canScan: true,
      };
    }
    
    // Check if user is authorized staff
    const staffMember = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!staffMember) {
      return { authorized: false, reason: "Not authorized to scan this event" };
    }
    
    if (staffMember.invitationStatus !== "accepted") {
      return { authorized: false, reason: "Invitation not accepted" };
    }
    
    return {
      authorized: true,
      role: staffMember.role,
      canManageStaff: staffMember.canManageStaff,
      canScan: staffMember.canScan,
    };
  },
});

// Get all staff members for an event
export const getEventStaff = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    const staffMembers = await ctx.db
      .query("eventStaff")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    
    return staffMembers.map(member => ({
      ...member,
      _id: member._id,
    }));
  },
});

// Get events where user is staff member
export const getUserStaffEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    // Get all staff positions for this user
    const staffPositions = await ctx.db
      .query("eventStaff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Get event details for each staff position
    const eventsWithDetails = await Promise.all(
      staffPositions.map(async (position) => {
        const event = await ctx.db.get(position.eventId);
        if (!event) return null;
        
        return {
          eventId: event._id,
          eventName: event.name,
          eventDate: event.eventDate,
          location: event.location,
          role: position.role,
          permissions: position.permissions,
          canScan: position.permissions.includes("scan") || position.role !== "scanner",
          canManageStaff: position.permissions.includes("manage_staff") || position.role === "manager",
          addedAt: position.addedAt,
          scannerUrl: `/events/${event._id}/scan`,
        };
      })
    );
    
    // Filter out null values and return
    return eventsWithDetails.filter(event => event !== null);
  },
});

// Invite a new scanner/staff member
export const inviteStaffMember = mutation({
  args: {
    eventId: v.id("events"),
    email: v.string(),
    role: v.union(v.literal("scanner"), v.literal("manager")),
    invitedBy: v.string(),
  },
  handler: async (ctx, { eventId, email, role, invitedBy }) => {
    // Verify the inviter has permission
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Check if inviter is owner or has staff management permission
    const isOwner = event.userId === invitedBy;
    if (!isOwner) {
      const inviterStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", eventId).eq("userId", invitedBy)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("isActive"), true),
            q.eq(q.field("canManageStaff"), true)
          )
        )
        .first();
      
      if (!inviterStaff) {
        throw new Error("You don't have permission to invite staff");
      }
    }
    
    // Check if this email is already invited
    const existingInvite = await ctx.db
      .query("eventStaff")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    
    if (existingInvite) {
      if (existingInvite.isActive) {
        throw new Error("This person is already a staff member");
      }
      if (existingInvite.invitationStatus === "pending") {
        throw new Error("An invitation is already pending for this email");
      }
    }
    
    // Generate invitation token
    const invitationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Create the staff member record
    const staffId = await ctx.db.insert("eventStaff", {
      eventId,
      userId: "", // Will be filled when they accept
      email,
      role,
      invitedBy,
      invitedAt: Date.now(),
      invitationToken,
      invitationStatus: "pending",
      canScan: true,
      canManageStaff: role === "manager",
      canViewReports: role === "manager" || role === "organizer",
      totalScans: 0,
      isActive: false, // Will become active when accepted
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // TODO: Send invitation email
    // This would trigger an email with the invitation link
    
    return {
      success: true,
      staffId,
      invitationToken,
      message: `Invitation sent to ${email}`,
    };
  },
});

// Accept a staff invitation
export const acceptInvitation = mutation({
  args: {
    invitationToken: v.string(),
    userId: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, { invitationToken, userId, userEmail }) => {
    // Find the invitation
    const invitation = await ctx.db
      .query("eventStaff")
      .withIndex("by_invitation_token", (q) => q.eq("invitationToken", invitationToken))
      .first();
    
    if (!invitation) {
      throw new Error("Invalid invitation token");
    }
    
    if (invitation.invitationStatus !== "pending") {
      throw new Error(`Invitation already ${invitation.invitationStatus}`);
    }
    
    // Verify email matches (or update if user has different email)
    if (invitation.email !== userEmail) {
      console.warn(`Email mismatch: invited ${invitation.email}, accepting as ${userEmail}`);
    }
    
    // Update the invitation
    await ctx.db.patch(invitation._id, {
      userId,
      email: userEmail, // Update to actual email
      invitationStatus: "accepted",
      acceptedAt: Date.now(),
      isActive: true,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      eventId: invitation.eventId,
      role: invitation.role,
    };
  },
});

// Remove a staff member
export const removeStaffMember = mutation({
  args: {
    staffId: v.id("eventStaff"),
    removedBy: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { staffId, removedBy, reason }) => {
    const staffMember = await ctx.db.get(staffId);
    if (!staffMember) {
      throw new Error("Staff member not found");
    }
    
    // Check permissions
    const event = await ctx.db.get(staffMember.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const isOwner = event.userId === removedBy;
    if (!isOwner) {
      const removerStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", staffMember.eventId).eq("userId", removedBy)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("isActive"), true),
            q.eq(q.field("canManageStaff"), true)
          )
        )
        .first();
      
      if (!removerStaff) {
        throw new Error("You don't have permission to remove staff");
      }
      
      // Managers can't remove other managers or organizers
      if (staffMember.role === "manager" || staffMember.role === "organizer") {
        throw new Error("You can't remove managers or organizers");
      }
    }
    
    // Deactivate the staff member
    await ctx.db.patch(staffId, {
      isActive: false,
      deactivatedAt: Date.now(),
      deactivatedBy: removedBy,
      deactivationReason: reason,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      message: `Staff member ${staffMember.email} has been removed`,
    };
  },
});

// Log a ticket scan
export const logTicketScan = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("simpleTickets"),
    scannedBy: v.string(),
    scannerEmail: v.string(),
    scannerRole: v.union(v.literal("scanner"), v.literal("manager"), v.literal("organizer")),
    scanResult: v.union(
      v.literal("success"),
      v.literal("already_scanned"),
      v.literal("invalid_ticket"),
      v.literal("unauthorized_scanner")
    ),
    ticketHolderName: v.optional(v.string()),
    ticketHolderEmail: v.optional(v.string()),
    ticketType: v.optional(v.string()),
    scanLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      accuracy: v.optional(v.number()),
    })),
    scanDevice: v.optional(v.object({
      userAgent: v.optional(v.string()),
      platform: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Create scan log
    const logId = await ctx.db.insert("scanLogs", {
      ...args,
      scanTimestamp: Date.now(),
      createdAt: Date.now(),
    });
    
    // Update staff member's scan count if successful
    if (args.scanResult === "success" && args.scannedBy) {
      const staffMember = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", args.eventId).eq("userId", args.scannedBy)
        )
        .first();
      
      if (staffMember) {
        await ctx.db.patch(staffMember._id, {
          lastScanAt: Date.now(),
          totalScans: staffMember.totalScans + 1,
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true, logId };
  },
});

// Get scan logs for an event
export const getEventScanLogs = query({
  args: {
    eventId: v.id("events"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { eventId, limit = 100 }) => {
    const logs = await ctx.db
      .query("scanLogs")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .order("desc")
      .take(limit);
    
    return logs;
  },
});

// Get staff member stats
export const getStaffStats = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const staffMember = await ctx.db
      .query("eventStaff")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .first();
    
    if (!staffMember) {
      return null;
    }
    
    // Get recent scans
    const recentScans = await ctx.db
      .query("scanLogs")
      .withIndex("by_event_scanner", (q) => 
        q.eq("eventId", eventId).eq("scannedBy", userId)
      )
      .order("desc")
      .take(10);
    
    return {
      ...staffMember,
      recentScans,
    };
  },
});

// Toggle staff member active status (enable/disable scanner access)
export const toggleStaffMember = mutation({
  args: {
    staffId: v.id("eventStaff"),
    isActive: v.boolean(),
    toggledBy: v.string(),
  },
  handler: async (ctx, { staffId, isActive, toggledBy }) => {
    const staffMember = await ctx.db.get(staffId);
    if (!staffMember) {
      throw new Error("Staff member not found");
    }
    
    // Check permissions - only event owner or managers can toggle
    const event = await ctx.db.get(staffMember.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const isOwner = event.userId === toggledBy;
    if (!isOwner) {
      // Check if toggler is a manager
      const togglerStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", staffMember.eventId).eq("userId", toggledBy)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("isActive"), true),
            q.eq(q.field("canManageStaff"), true)
          )
        )
        .first();
      
      if (!togglerStaff) {
        throw new Error("You don't have permission to toggle staff access");
      }
    }
    
    // Can only toggle accepted invitations
    if (staffMember.invitationStatus !== "accepted") {
      throw new Error("Can only toggle access for accepted staff members");
    }
    
    // Update the active status
    await ctx.db.patch(staffId, {
      isActive,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      message: `Scanner access ${isActive ? 'enabled' : 'disabled'} for ${staffMember.email}`,
    };
  },
});