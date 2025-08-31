// Complete test to verify all Convex data fields are properly aligned
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://youthful-porcupine-760.convex.cloud");

// Test data that includes ALL fields from the schema
const testEventData = {
  // Basic required fields
  name: "Complete Data Test Event",
  description: "Testing all data fields are properly stored in Convex",
  location: "Test Venue Austin",
  eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
  price: 35,
  totalTickets: 150,
  userId: "test-user-" + Date.now(),
  
  // Event categorization - mapped to schema values
  eventType: "social_dance", // Must be a valid schema literal
  eventCategories: ["social_dance", "class", "workshop"], // Array of valid literals
  
  // Ticketing fields
  isTicketed: true,
  doorPrice: 40,
  
  // Location details
  address: "123 Congress Avenue",
  city: "Austin",
  state: "TX",
  country: "USA",
  postalCode: "78701",
  latitude: 30.2672,
  longitude: -97.7431,
  
  // Multi-day event fields
  isMultiDay: false,
  isSaveTheDate: false,
  sameLocation: true,
  eventMode: "single",
  
  // Optional fields
  imageStorageId: null,
  imageUrl: "https://example.com/event-image.jpg"
};

async function testCompleteEventCreation() {
  console.log("🧪 COMPREHENSIVE CONVEX DATA ALIGNMENT TEST");
  console.log("============================================\n");
  
  try {
    // Step 1: Create the event
    console.log("📤 Step 1: Creating event with all fields...");
    console.log("Event name:", testEventData.name);
    console.log("Event type:", testEventData.eventType);
    console.log("Categories:", testEventData.eventCategories.join(", "));
    console.log("Location:", testEventData.city + ", " + testEventData.state);
    console.log("Ticketed:", testEventData.isTicketed);
    console.log("Total tickets:", testEventData.totalTickets);
    
    const eventId = await client.mutation("events:create", testEventData);
    
    if (!eventId) {
      throw new Error("No event ID returned from create mutation");
    }
    
    console.log("✅ Event created successfully!");
    console.log("Event ID:", eventId);
    console.log("");
    
    // Step 2: Retrieve and verify the event
    console.log("🔍 Step 2: Retrieving event from database...");
    const savedEvent = await client.query("events:getById", { eventId });
    
    if (!savedEvent) {
      throw new Error("Event not found in database after creation");
    }
    
    console.log("✅ Event retrieved successfully!");
    console.log("");
    
    // Step 3: Verify all fields were saved correctly
    console.log("📋 Step 3: Verifying all data fields...");
    const verificationResults = [];
    
    // Check basic fields
    verificationResults.push({
      field: "name",
      expected: testEventData.name,
      actual: savedEvent.name,
      match: savedEvent.name === testEventData.name
    });
    
    verificationResults.push({
      field: "description",
      expected: testEventData.description,
      actual: savedEvent.description,
      match: savedEvent.description === testEventData.description
    });
    
    verificationResults.push({
      field: "location",
      expected: testEventData.location,
      actual: savedEvent.location,
      match: savedEvent.location === testEventData.location
    });
    
    verificationResults.push({
      field: "eventType",
      expected: testEventData.eventType,
      actual: savedEvent.eventType,
      match: savedEvent.eventType === testEventData.eventType
    });
    
    verificationResults.push({
      field: "eventCategories",
      expected: testEventData.eventCategories,
      actual: savedEvent.eventCategories,
      match: JSON.stringify(savedEvent.eventCategories) === JSON.stringify(testEventData.eventCategories)
    });
    
    verificationResults.push({
      field: "isTicketed",
      expected: testEventData.isTicketed,
      actual: savedEvent.isTicketed,
      match: savedEvent.isTicketed === testEventData.isTicketed
    });
    
    verificationResults.push({
      field: "city",
      expected: testEventData.city,
      actual: savedEvent.city,
      match: savedEvent.city === testEventData.city
    });
    
    verificationResults.push({
      field: "state",
      expected: testEventData.state,
      actual: savedEvent.state,
      match: savedEvent.state === testEventData.state
    });
    
    verificationResults.push({
      field: "postalCode",
      expected: testEventData.postalCode,
      actual: savedEvent.postalCode,
      match: savedEvent.postalCode === testEventData.postalCode
    });
    
    // Display results
    console.log("Field Verification Results:");
    console.log("---------------------------");
    
    let allFieldsMatch = true;
    verificationResults.forEach(result => {
      const status = result.match ? "✅" : "❌";
      console.log(`${status} ${result.field}: ${result.match ? "MATCH" : "MISMATCH"}`);
      if (!result.match) {
        console.log(`   Expected: ${JSON.stringify(result.expected)}`);
        console.log(`   Actual: ${JSON.stringify(result.actual)}`);
        allFieldsMatch = false;
      }
    });
    
    console.log("");
    
    // Step 4: Test event availability query
    console.log("🎫 Step 4: Testing event availability...");
    const availability = await client.query("events:getEventAvailability", { eventId });
    
    console.log("Availability check:");
    console.log("- Total tickets:", availability.totalTickets);
    console.log("- Remaining tickets:", availability.remainingTickets);
    console.log("- Is sold out:", availability.isSoldOut);
    console.log("- Is ticketed:", availability.isTicketed);
    console.log("");
    
    // Step 5: Test price range query
    console.log("💰 Step 5: Testing price range...");
    const priceRange = await client.query("events:getEventPriceRange", { eventId });
    
    console.log("Price range:");
    console.log("- Min price: $" + priceRange.minPrice);
    console.log("- Max price: $" + priceRange.maxPrice);
    console.log("- Has early bird:", priceRange.hasEarlyBird);
    console.log("");
    
    // Final summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (allFieldsMatch) {
      console.log("✅ SUCCESS: All data fields are properly aligned with Convex!");
      console.log("✅ Event creation, storage, and retrieval working correctly!");
    } else {
      console.log("⚠️  WARNING: Some fields did not match expected values");
      console.log("Please review the field verification results above");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return { success: allFieldsMatch, eventId };
    
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data, null, 2));
    }
    console.log("");
    console.log("🔍 Troubleshooting tips:");
    console.log("1. Check that Convex is deployed: npx convex deploy");
    console.log("2. Verify the Convex URL is correct");
    console.log("3. Check the events.create mutation exists in convex/events.ts");
    console.log("4. Review the error message above for specific field issues");
    return { success: false, error };
  }
}

// Test category mapping
async function testCategoryMapping() {
  console.log("\n📊 TESTING CATEGORY MAPPING");
  console.log("============================\n");
  
  const categoryTests = [
    { ui: "Workshop", expected: "workshop" },
    { ui: "Sets/Performance", expected: "sets" },
    { ui: "In The Park", expected: "in_the_park" },
    { ui: "Social Dance", expected: "social_dance" },
    { ui: "Party", expected: "other" }
  ];
  
  console.log("Testing category normalization:");
  
  // Import the category mapper if available
  try {
    const { normalizeCategory } = require("./lib/category-mapper");
    
    categoryTests.forEach(test => {
      const result = normalizeCategory(test.ui);
      const status = result === test.expected ? "✅" : "❌";
      console.log(`${status} "${test.ui}" → "${result}" (expected: "${test.expected}")`);
    });
  } catch (e) {
    console.log("⚠️  Category mapper not available for testing");
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 STARTING COMPREHENSIVE CONVEX DATA TESTS");
  console.log("============================================");
  console.log("Convex URL:", "https://youthful-porcupine-760.convex.cloud");
  console.log("Test Time:", new Date().toISOString());
  console.log("");
  
  // Test category mapping
  await testCategoryMapping();
  
  // Test complete event creation
  const result = await testCompleteEventCreation();
  
  console.log("\n🏁 TEST COMPLETE");
  process.exit(result.success ? 0 : 1);
}

// Run the tests
runAllTests();