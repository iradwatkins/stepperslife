#!/usr/bin/env node
/**
 * Script to create a test event with tickets for testing the purchase flow
 */

import { getConvexClient } from "../lib/convex";
import { api } from "../convex/_generated/api";

async function createTestEvent() {
  console.log("🎫 Creating test event for SteppersLife...");
  
  const convex = getConvexClient();
  
  try {
    // Create a test event
    const eventData = {
      name: "Atlanta Salsa Night - Test Event",
      description: "Join us for an amazing night of salsa dancing! Live DJ, dance lessons, and great vibes. Perfect for all skill levels.",
      location: "The Grand Ballroom, 123 Peachtree St, Atlanta, GA 30303",
      eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      price: 25, // $25 per ticket
      totalTickets: 100,
      userId: "test_organizer_001", // This would be the actual Clerk user ID
      isTicketed: true,
      doorPrice: 30,
      eventCategories: ["social_dance", "class"],
      latitude: 33.7490,
      longitude: -84.3880,
      address: "123 Peachtree St",
      city: "Atlanta",
      state: "GA",
      country: "USA",
      postalCode: "30303",
      imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800"
    };
    
    console.log("📝 Event details:");
    console.log(`  Name: ${eventData.name}`);
    console.log(`  Date: ${new Date(eventData.eventDate).toLocaleString()}`);
    console.log(`  Location: ${eventData.location}`);
    console.log(`  Price: $${eventData.price}`);
    console.log(`  Total Tickets: ${eventData.totalTickets}`);
    
    // Create the event
    const eventId = await convex.mutation(api.events.create, eventData);
    
    console.log(`✅ Event created successfully!`);
    console.log(`  Event ID: ${eventId}`);
    console.log(`  View at: https://stepperslife.com/events/${eventId}`);
    
    // Create ticket types for the event
    console.log("\n🎟️ Creating ticket types...");
    
    const ticketTypes = [
      {
        eventId,
        name: "Early Bird",
        price: 20,
        quantity: 30,
        description: "Limited early bird tickets - save $5!",
        hasEarlyBird: true,
        earlyBirdPrice: 15,
        earlyBirdEndDate: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days
      },
      {
        eventId,
        name: "General Admission",
        price: 25,
        quantity: 50,
        description: "Standard admission ticket"
      },
      {
        eventId,
        name: "VIP",
        price: 45,
        quantity: 20,
        description: "VIP access with reserved seating and complimentary drink"
      }
    ];
    
    for (const ticketType of ticketTypes) {
      await convex.mutation(api.ticketTypes.create, ticketType);
      console.log(`  ✅ Created ticket type: ${ticketType.name} - $${ticketType.price}`);
    }
    
    console.log("\n🎉 Test event setup complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Go to https://stepperslife.com");
    console.log("2. Sign in or create an account");
    console.log("3. Find the test event and purchase tickets");
    console.log("4. Verify the complete flow works");
    
  } catch (error) {
    console.error("❌ Error creating test event:", error);
    process.exit(1);
  }
}

// Run the script
createTestEvent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });