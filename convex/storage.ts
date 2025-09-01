import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * DEPRECATED: We now use MinIO for all image storage
 * Convex is used only as a database, not for file storage
 * Images are stored at http://72.60.28.175:9000/stepperslife/
 */

export const generateUploadUrl = mutation(async (ctx) => {
  throw new Error("DEPRECATED: Use MinIO for image uploads via /api/upload/minio");
});

export const updateEventImage = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, { eventId, storageId }) => {
    throw new Error("DEPRECATED: Update imageUrl field directly with MinIO URL");
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    // Return null for backward compatibility
    // All images should now use imageUrl field with MinIO URLs
    return null;
  },
});

export const deleteImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    throw new Error("DEPRECATED: Delete images directly from MinIO");
  },
});
