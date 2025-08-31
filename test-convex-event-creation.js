// Test script to verify event creation works
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://youthful-porcupine-760.convex.cloud");

async function testEventCreation() {
  console.log("🧪 Testing event creation with proper data flow...\n");
  
  const testEvent = {
    name: "Test Event - Data Flow Fixed",
    description: "Testing the fixed data flow for event creation",
    location: "Test Venue",
    address: "123 Test Street",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
    price: 25,
    totalTickets: 100,
    userId: "test-user-" + Date.now(),
    eventType: "social_dance", // Schema-compliant value
    eventCategories: ["social_dance", "party"], // Note: "party" maps to "other"
    isTicketed: true,
    doorPrice: 30,
    isSaveTheDate: false,
    imageStorageId: null,
    imageUrl: null
  };
  
  try {
    console.log("📤 Sending event data to Convex...");
    console.log("Event Type:", testEvent.eventType);
    console.log("Categories:", testEvent.eventCategories);
    
    const eventId = await client.mutation("events:create", testEvent);
    
    console.log("✅ Event created successfully!");
    console.log("Event ID:", eventId);
    
    // Verify the event was saved
    console.log("\n🔍 Verifying event data...");
    const savedEvent = await client.query("events:getById", { eventId });
    
    if (savedEvent) {
      console.log("✅ Event verified in database!");
      console.log("Name:", savedEvent.name);
      console.log("Type:", savedEvent.eventType);
      console.log("Categories:", savedEvent.eventCategories);
      console.log("Is Ticketed:", savedEvent.isTicketed);
    } else {
      console.error("❌ Event not found in database");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.data) {
      console.error("Error details:", error.data);
    }
  }
}

// Run the test
testEventCreation();
