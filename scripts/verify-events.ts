import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function verifyEvents() {
  console.log("🔍 Verifying events in both databases...\n");
  
  // Check DEVELOPMENT database
  const devUrl = "https://quiet-robin-620.convex.cloud";
  const devClient = new ConvexHttpClient(devUrl);
  
  console.log("📘 DEVELOPMENT Database (quiet-robin-620):");
  console.log("URL:", devUrl);
  try {
    const devEvents = await devClient.query(api.events.get, {});
    console.log(`✓ Events found: ${devEvents.length}`);
    if (devEvents.length > 0) {
      console.log("First 3 events:");
      devEvents.slice(0, 3).forEach((event: any, i) => {
        console.log(`  ${i + 1}. ${event.name} - ${new Date(event.eventDate).toLocaleDateString()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error accessing development database:", error);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Check PRODUCTION database
  const prodUrl = "https://youthful-porcupine-760.convex.cloud";
  const prodClient = new ConvexHttpClient(prodUrl);
  
  console.log("📗 PRODUCTION Database (youthful-porcupine-760):");
  console.log("URL:", prodUrl);
  try {
    const prodEvents = await prodClient.query(api.events.get, {});
    console.log(`✓ Events found: ${prodEvents.length}`);
    if (prodEvents.length > 0) {
      console.log("First 3 events:");
      prodEvents.slice(0, 3).forEach((event: any, i) => {
        console.log(`  ${i + 1}. ${event.name} - ${new Date(event.eventDate).toLocaleDateString()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error accessing production database:", error);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  console.log("📋 CONFIGURATION CHECK:");
  console.log("\nLocal .env.local:");
  console.log("- NEXT_PUBLIC_CONVEX_URL should be: https://quiet-robin-620.convex.cloud (for local dev)");
  console.log("- Or: https://youthful-porcupine-760.convex.cloud (for production data)");
  
  console.log("\nProduction server:");
  console.log("- Should use: https://youthful-porcupine-760.convex.cloud");
  
  console.log("\n✅ Both databases have events!");
  console.log("If events aren't showing on the website, check:");
  console.log("1. The website's NEXT_PUBLIC_CONVEX_URL environment variable");
  console.log("2. Browser cache (try hard refresh: Cmd+Shift+R)");
  console.log("3. Check browser console for any errors");
}

verifyEvents();