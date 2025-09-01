#!/usr/bin/env node

import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.production' });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";

async function clearAllEvents() {
  console.log("🧹 Starting to clear all events from Convex...");
  console.log(`📍 Using Convex URL: ${CONVEX_URL}`);
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // First, get the current data counts
    console.log("\n📊 Getting current data counts...");
    const counts = await client.mutation("adminReset:getDataCounts", {});
    console.log("Current data:", counts);
    
    if (counts.counts.events === 0) {
      console.log("✅ No events found. Database is already clean!");
      return;
    }
    
    console.log(`\n⚠️  Found ${counts.counts.events} events to delete`);
    console.log("🗑️  Proceeding to delete all events and related data...\n");
    
    // Clear all events
    const result = await client.mutation("adminReset:clearAllEvents", {
      confirmReset: "RESET_ALL_DATA"
    });
    
    console.log("✅ Success!", result.message);
    console.log("\n📈 Deletion breakdown:");
    if (result.breakdown) {
      Object.entries(result.breakdown).forEach(([key, value]) => {
        if (value > 0) {
          console.log(`   - ${key}: ${value}`);
        }
      });
    }
    
    // Verify deletion
    console.log("\n🔍 Verifying deletion...");
    const newCounts = await client.mutation("adminReset:getDataCounts", {});
    console.log(`📊 Events remaining: ${newCounts.counts.events}`);
    
    if (newCounts.counts.events === 0) {
      console.log("\n🎉 All events successfully cleared!");
      console.log("✨ The database is now clean and ready for fresh data.");
    } else {
      console.log("\n⚠️  Warning: Some events may still remain. Please check manually.");
    }
    
  } catch (error) {
    console.error("\n❌ Error clearing events:", error);
    console.error("Details:", error.message);
    process.exit(1);
  }
}

// Run the script
clearAllEvents().catch(console.error);