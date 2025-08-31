// Minimal test to debug Convex event creation
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://youthful-porcupine-760.convex.cloud");

async function testMinimalEvent() {
  console.log("🧪 MINIMAL CONVEX EVENT TEST");
  console.log("============================\n");
  
  // Start with absolutely minimal required fields
  const minimalEvent = {
    name: "Test Event",
    description: "Test Description",
    location: "Test Location",
    eventDate: Date.now() + 86400000, // Tomorrow
    price: 10,
    totalTickets: 50,
    userId: "test-user-123"
  };
  
  try {
    console.log("Creating minimal event with only required fields...");
    console.log("Data:", JSON.stringify(minimalEvent, null, 2));
    
    const eventId = await client.mutation("events:create", minimalEvent);
    console.log("✅ Success! Event ID:", eventId);
    
    // Try to retrieve it
    const savedEvent = await client.query("events:getById", { eventId });
    console.log("✅ Retrieved event:", savedEvent.name);
    
    return true;
  } catch (error) {
    console.error("❌ Failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    return false;
  }
}

async function testWithCategories() {
  console.log("\n🧪 EVENT WITH CATEGORIES TEST");
  console.log("================================\n");
  
  // Add categories one by one
  const eventWithCategories = {
    name: "Category Test Event",
    description: "Testing categories",
    location: "Test Venue",
    eventDate: Date.now() + 86400000,
    price: 20,
    totalTickets: 100,
    userId: "test-user-456",
    eventType: "other", // Start with the safest option
    eventCategories: ["other"] // Single safe category
  };
  
  try {
    console.log("Creating event with categories...");
    console.log("Event type:", eventWithCategories.eventType);
    console.log("Categories:", eventWithCategories.eventCategories);
    
    const eventId = await client.mutation("events:create", eventWithCategories);
    console.log("✅ Success! Event ID:", eventId);
    
    const savedEvent = await client.query("events:getById", { eventId });
    console.log("✅ Saved event type:", savedEvent.eventType);
    console.log("✅ Saved categories:", savedEvent.eventCategories);
    
    return true;
  } catch (error) {
    console.error("❌ Failed:", error.message);
    return false;
  }
}

async function testValidCategories() {
  console.log("\n🧪 VALID CATEGORY VALUES TEST");
  console.log("================================\n");
  
  // Test each valid category from the schema
  const validCategories = [
    "workshop",
    "sets",
    "in_the_park",
    "trip",
    "cruise",
    "holiday",
    "competition",
    "class",
    "social_dance",
    "lounge_bar",
    "other"
  ];
  
  for (const category of validCategories) {
    const testEvent = {
      name: `Test ${category} Event`,
      description: `Testing ${category} category`,
      location: "Test Location",
      eventDate: Date.now() + 86400000,
      price: 15,
      totalTickets: 75,
      userId: `test-user-${Date.now()}`,
      eventType: category,
      eventCategories: [category]
    };
    
    try {
      console.log(`Testing category: ${category}`);
      const eventId = await client.mutation("events:create", testEvent);
      console.log(`✅ ${category} works! Event ID: ${eventId}`);
    } catch (error) {
      console.error(`❌ ${category} failed: ${error.message}`);
    }
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 DEBUGGING CONVEX EVENT CREATION");
  console.log("===================================");
  console.log("Convex URL:", "https://youthful-porcupine-760.convex.cloud");
  console.log("");
  
  // Test 1: Minimal event
  const minimal = await testMinimalEvent();
  
  if (minimal) {
    // Test 2: Event with categories
    const withCategories = await testWithCategories();
    
    if (withCategories) {
      // Test 3: All valid categories
      await testValidCategories();
    }
  }
  
  console.log("\n🏁 TESTS COMPLETE");
}

runTests();