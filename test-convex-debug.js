// Debug test to find which field is causing the issue
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://youthful-porcupine-760.convex.cloud");

async function testFieldByField() {
  console.log("🔍 FIELD-BY-FIELD DEBUG TEST");
  console.log("============================\n");
  
  // Start with known working minimal fields
  let testData = {
    name: "Debug Test Event",
    description: "Testing field by field",
    location: "Test Venue",
    eventDate: Date.now() + 86400000,
    price: 25,
    totalTickets: 100,
    userId: "test-user-debug"
  };
  
  console.log("✅ Testing with minimal fields...");
  try {
    const eventId = await client.mutation("events:create", testData);
    console.log("✅ Minimal fields work! Event ID:", eventId);
  } catch (error) {
    console.error("❌ Even minimal fields failed:", error.message);
    return;
  }
  
  // Now add fields one by one
  const additionalFields = [
    { field: "eventType", value: "social_dance" },
    { field: "eventCategories", value: ["social_dance", "class"] },
    { field: "isTicketed", value: true },
    { field: "doorPrice", value: 30 },
    { field: "address", value: "123 Test Street" },
    { field: "city", value: "Austin" },
    { field: "state", value: "TX" },
    { field: "postalCode", value: "78701" },
    { field: "latitude", value: 30.2672 },
    { field: "longitude", value: -97.7431 },
    { field: "country", value: "USA" },
    { field: "isMultiDay", value: false },
    { field: "isSaveTheDate", value: false },
    { field: "sameLocation", value: true },
    { field: "eventMode", value: "single" },
    { field: "imageUrl", value: "https://example.com/image.jpg" }
  ];
  
  console.log("\nTesting additional fields one by one:");
  console.log("--------------------------------------");
  
  for (const addition of additionalFields) {
    testData[addition.field] = addition.value;
    testData.name = `Test ${addition.field} Event`;
    testData.userId = `test-user-${Date.now()}`;
    
    try {
      console.log(`Testing with ${addition.field}: ${JSON.stringify(addition.value)}`);
      const eventId = await client.mutation("events:create", testData);
      console.log(`✅ ${addition.field} works!`);
    } catch (error) {
      console.error(`❌ ${addition.field} causes error: ${error.message}`);
      // Remove the problematic field and continue
      delete testData[addition.field];
    }
  }
  
  console.log("\n📋 Final working configuration:");
  console.log(JSON.stringify(testData, null, 2));
}

// Run the debug test
async function runDebug() {
  console.log("🚀 DEBUGGING CONVEX FIELD COMPATIBILITY");
  console.log("========================================");
  console.log("Convex URL:", "https://youthful-porcupine-760.convex.cloud");
  console.log("");
  
  await testFieldByField();
  
  console.log("\n🏁 DEBUG COMPLETE");
}

runDebug();