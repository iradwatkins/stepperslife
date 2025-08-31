import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Production Convex URL
const CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function createSimpleTestEvent() {
  console.log("Creating simple test event...");
  
  try {
    // Create a basic event with only required fields
    const eventId = await client.mutation(api.events.create, {
      name: "Test Salsa Night - December 2025",
      description: "A test event for checking the ticket purchase flow. Join us for salsa dancing!",
      location: "Atlanta Dance Studio, 123 Main St, Atlanta, GA",
      eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      price: 20,
      totalTickets: 50,
      userId: "test_user_" + Date.now(), // Unique test user ID
      isTicketed: true,
      eventCategories: ["social_dance"],
      city: "Atlanta",
      state: "GA"
    });
    
    console.log("✅ Event created successfully!");
    console.log("Event ID:", eventId);
    console.log("View at: https://stepperslife.com/events/" + eventId);
    
  } catch (error) {
    console.error("❌ Error creating event:", error);
  }
}

createSimpleTestEvent();