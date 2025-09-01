// Complete end-to-end test of Convex data flow
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://youthful-porcupine-760.convex.cloud");

async function testCompleteDataFlow() {
  console.log("🧪 COMPLETE DATA FLOW TEST");
  console.log("==========================\n");
  
  // Test data with ALL fields populated
  const testEventData = {
    // Required fields
    name: "Complete Data Flow Test Event",
    description: "Testing all data fields are properly mapped, saved, and retrieved",
    location: "Grand Ballroom, Convention Center",
    eventDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    price: 75,
    totalTickets: 500,
    userId: "test-user-complete-" + Date.now(),
    
    // Optional image fields
    imageStorageId: undefined,
    imageUrl: "https://stepperslife.com/api/storage/uploads/test-event-banner.jpg",
    
    // Event categorization
    eventType: "social_dance",
    eventCategories: ["social_dance", "workshop", "class"],
    
    // Ticketing fields
    isTicketed: true,
    doorPrice: 85,
    
    // Location fields
    address: "500 E Cesar Chavez St",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "USA",
    latitude: 30.2612,
    longitude: -97.7385,
    
    // Multi-day event support
    endDate: Date.now() + 32 * 24 * 60 * 60 * 1000, // 2 days after start
    isMultiDay: true,
    isSaveTheDate: false,
    sameLocation: true,
    eventMode: "multi_day",
    
    // Capacity management
    totalCapacity: 600,
    capacityBreakdown: JSON.stringify({
      vip: 100,
      general: 400,
      student: 100
    }),
    
    // Admin posting fields
    postedByAdmin: false,
    adminUserId: undefined,
    claimable: false,
    claimToken: undefined,
  };
  
  try {
    // Step 1: Create the event
    console.log("📤 Step 1: Creating event with all fields...");
    console.log("Total fields being sent:", Object.keys(testEventData).length);
    
    const eventId = await client.mutation("events:create", testEventData);
    
    if (!eventId) {
      throw new Error("No event ID returned from create mutation");
    }
    
    console.log("✅ Event created successfully!");
    console.log("Event ID:", eventId);
    console.log("");
    
    // Step 2: Retrieve the event
    console.log("🔍 Step 2: Retrieving saved event...");
    const savedEvent = await client.query("events:getById", { eventId });
    
    if (!savedEvent) {
      throw new Error("Event not found after creation");
    }
    
    console.log("✅ Event retrieved successfully!");
    console.log("");
    
    // Step 3: Verify all fields were saved correctly
    console.log("📋 Step 3: Verifying data integrity...");
    console.log("----------------------------------------");
    
    const fieldsToCheck = [
      // Required fields
      { field: "name", expected: testEventData.name },
      { field: "description", expected: testEventData.description },
      { field: "location", expected: testEventData.location },
      { field: "userId", expected: testEventData.userId },
      { field: "price", expected: testEventData.price },
      { field: "totalTickets", expected: testEventData.totalTickets },
      
      // Categories
      { field: "eventType", expected: testEventData.eventType },
      { field: "eventCategories", expected: testEventData.eventCategories, isArray: true },
      
      // Ticketing
      { field: "isTicketed", expected: testEventData.isTicketed },
      { field: "doorPrice", expected: testEventData.doorPrice },
      
      // Location
      { field: "address", expected: testEventData.address },
      { field: "city", expected: testEventData.city },
      { field: "state", expected: testEventData.state },
      { field: "postalCode", expected: testEventData.postalCode },
      { field: "country", expected: testEventData.country },
      { field: "latitude", expected: testEventData.latitude },
      { field: "longitude", expected: testEventData.longitude },
      
      // Multi-day
      { field: "isMultiDay", expected: testEventData.isMultiDay },
      { field: "sameLocation", expected: testEventData.sameLocation },
      { field: "eventMode", expected: testEventData.eventMode },
      
      // Capacity
      { field: "totalCapacity", expected: testEventData.totalCapacity },
      { field: "capacityBreakdown", expected: testEventData.capacityBreakdown },
    ];
    
    let allFieldsMatch = true;
    let matchCount = 0;
    let mismatchCount = 0;
    
    fieldsToCheck.forEach(check => {
      const actual = savedEvent[check.field];
      const expected = check.expected;
      
      let matches;
      if (check.isArray) {
        matches = JSON.stringify(actual) === JSON.stringify(expected);
      } else {
        matches = actual === expected;
      }
      
      if (matches) {
        console.log(`✅ ${check.field}: SAVED CORRECTLY`);
        matchCount++;
      } else {
        console.log(`❌ ${check.field}: MISMATCH`);
        console.log(`   Expected: ${JSON.stringify(expected)}`);
        console.log(`   Actual: ${JSON.stringify(actual)}`);
        allFieldsMatch = false;
        mismatchCount++;
      }
    });
    
    console.log("");
    console.log("----------------------------------------");
    console.log(`Summary: ${matchCount} fields correct, ${mismatchCount} fields incorrect`);
    console.log("");
    
    // Step 4: Test query functions
    console.log("🔍 Step 4: Testing query functions...");
    
    // Test availability query
    const availability = await client.query("events:getEventAvailability", { eventId });
    console.log("✅ Availability query works:");
    console.log("  - Total tickets:", availability.totalTickets);
    console.log("  - Is ticketed:", availability.isTicketed);
    console.log("  - Remaining:", availability.remainingTickets);
    
    // Test price range query
    const priceRange = await client.query("events:getEventPriceRange", { eventId });
    console.log("✅ Price range query works:");
    console.log("  - Min price:", priceRange.minPrice);
    console.log("  - Max price:", priceRange.maxPrice);
    
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (allFieldsMatch) {
      console.log("✅ SUCCESS: ALL DATA PROPERLY MAPPED AND SAVED!");
      console.log("✅ Data flow is working correctly end-to-end!");
    } else {
      console.log("⚠️  WARNING: Some fields were not saved correctly");
      console.log("Please review the mismatches above");
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return { success: allFieldsMatch, eventId };
    
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data, null, 2));
    }
    return { success: false, error };
  }
}

// Run the test
testCompleteDataFlow().then(result => {
  process.exit(result.success ? 0 : 1);
});