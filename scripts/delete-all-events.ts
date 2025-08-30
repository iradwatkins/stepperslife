#!/usr/bin/env npx tsx
/**
 * Direct deletion script for all events in production
 * This bypasses the need for adminReset functions
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = "https://youthful-porcupine-760.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

async function deleteAllEvents() {
  console.log("🗑️  DELETING ALL EVENTS FROM PRODUCTION");
  console.log("=========================================");
  console.log("");
  
  try {
    // First, try to get all events
    console.log("📋 Fetching all events...");
    const events = await client.query(api.events.get);
    
    if (!events || events.length === 0) {
      console.log("✅ No events found in database. Already clean!");
      return;
    }
    
    console.log(`Found ${events.length} events to delete:`);
    console.log("--------------------------------");
    events.forEach((event: any, index: number) => {
      console.log(`${index + 1}. ${event.name} (${new Date(event.eventDate).toLocaleDateString()})`);
    });
    console.log("");
    
    // Try using adminReset if available
    console.log("🔄 Attempting to use adminReset functions...");
    try {
      const result = await client.mutation(api.adminReset.clearAllEvents, {
        confirmReset: "RESET_ALL_DATA"
      });
      console.log("✅ Successfully deleted all events using adminReset!");
      console.log(`   Deleted: ${result.deleted} events`);
      return;
    } catch (error: any) {
      console.log("⚠️  adminReset not available, trying alternative methods...");
    }
    
    // If adminReset doesn't work, we need individual delete functions
    console.log("\n❌ Unable to delete events automatically");
    console.log("   The delete functions are not deployed to production.");
    console.log("\n📝 MANUAL DELETION REQUIRED:");
    console.log("================================");
    console.log("");
    console.log("Option 1: Deploy Convex Functions");
    console.log("---------------------------------");
    console.log("1. Run: npx convex dev");
    console.log("2. Authenticate when prompted");
    console.log("3. Run: npx convex deploy --prod");
    console.log("4. Then run this script again");
    console.log("");
    console.log("Option 2: Use Convex Dashboard");
    console.log("------------------------------");
    console.log("1. Go to: https://dashboard.convex.dev");
    console.log("2. Navigate to your project: stepperslife");
    console.log("3. Click on 'Data' tab");
    console.log("4. Select 'events' table");
    console.log("5. Select all events and delete them");
    console.log("");
    console.log("Option 3: Use the Admin Page");
    console.log("----------------------------");
    console.log("1. Deploy functions first (Option 1)");
    console.log("2. Go to: https://stepperslife.com/admin/reset-data");
    console.log("3. Click 'Check Data Counts'");
    console.log("4. Type confirmation codes");
    console.log("5. Click 'Execute Complete Reset'");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

// Add countdown before deletion
console.log("⚠️  This will attempt to delete ALL events from production!");
console.log("Starting in 3 seconds... Press Ctrl+C to cancel\n");

setTimeout(() => {
  deleteAllEvents().then(() => {
    console.log("\n✨ Script completed!");
    process.exit(0);
  }).catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}, 3000);