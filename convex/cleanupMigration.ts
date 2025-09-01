import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Special mutation to complete MinIO migration
 * Removes imageStorageId and adds imageUrl for the migrated event
 */
export const fixMigratedEvent = mutation({
  args: {},
  handler: async (ctx) => {
    // Find the event with the problematic imageStorageId
    const events = await ctx.db.query("events").collect();
    const problemEvent = events.find(e => 
      (e as any).imageStorageId === "kg2a2c8cdw9y3fqjhf615m47xh7pqxt4"
    );
    
    if (problemEvent) {
      // Create a new object without imageStorageId
      const { imageStorageId, ...cleanEvent } = problemEvent as any;
      
      // Add the MinIO URL
      cleanEvent.imageUrl = "http://72.60.28.175:9000/stepperslife/events/js7d7y3japzt2p3p5n4f1qad2s7pp0t4/pibupibp__kg2a2c8c.jpg";
      
      // Replace the document
      await ctx.db.replace(problemEvent._id, cleanEvent);
      
      return { 
        success: true, 
        eventName: cleanEvent.name,
        message: "Event updated with MinIO URL and imageStorageId removed"
      };
    }
    
    return { 
      success: false, 
      message: "No event found with the problematic imageStorageId" 
    };
  },
});