/**
 * Remove imageStorageId from all events in Convex
 * This completes the migration to MinIO-only storage
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment
dotenv.config({ path: ".env.production" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";

// Initialize client
const convex = new ConvexHttpClient(CONVEX_URL);

async function cleanupImageStorageIds() {
  console.log("\n🧹 CLEANING UP imageStorageId FIELDS");
  console.log("=" .repeat(50));
  
  try {
    // Get all events
    console.log("📋 Fetching events from Convex...");
    const events = await convex.query(api.events.get);
    console.log(`  Found ${events.length} total events\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const event of events) {
      // Check if event has imageStorageId
      if ('imageStorageId' in event) {
        console.log(`🎯 Event: ${event.name}`);
        console.log(`  ID: ${event._id}`);
        console.log(`  Has imageStorageId: ${event.imageStorageId}`);
        
        // Update event to remove imageStorageId
        // We'll need to create a mutation for this
        try {
          // For now, we'll just log what needs to be done
          // The actual removal will happen through the Convex dashboard
          console.log(`  ⚠️  Needs imageStorageId removed`);
          
          // If the event has a Convex storage ID but no MinIO URL, add the MinIO URL
          if (event.imageStorageId === "kg2a2c8cdw9y3fqjhf615m47xh7pqxt4" && !event.imageUrl) {
            const minioUrl = "http://72.60.28.175:9000/stepperslife/events/js7d7y3japzt2p3p5n4f1qad2s7pp0t4/pibupibp__kg2a2c8c.jpg";
            console.log(`  🔗 Adding MinIO URL: ${minioUrl}`);
            
            await convex.mutation(api.events.updateEvent, {
              eventId: event._id,
              updates: { imageUrl: minioUrl }
            });
            console.log(`  ✅ Added MinIO URL`);
          }
          
          updated++;
        } catch (error: any) {
          console.log(`  ❌ Error: ${error.message}`);
        }
      } else {
        skipped++;
      }
    }
    
    console.log("\n" + "=" .repeat(50));
    console.log("📊 CLEANUP SUMMARY");
    console.log("=" .repeat(50));
    console.log(`Events with imageStorageId: ${updated}`);
    console.log(`Events without imageStorageId: ${skipped}`);
    
    if (updated > 0) {
      console.log("\n⚠️  MANUAL ACTION REQUIRED:");
      console.log("Go to Convex Dashboard and manually remove imageStorageId field from events table");
      console.log("URL: https://dashboard.convex.dev/t/irawatkins/stepperslife/prod:youthful-porcupine-760/data");
    }
    
  } catch (error: any) {
    console.error("\n💥 Cleanup failed:", error);
    throw error;
  }
}

// Run cleanup
console.log("Starting cleanup...");
cleanupImageStorageIds()
  .then(() => {
    console.log("\n✨ Cleanup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  });