#!/usr/bin/env node

/**
 * Test script to validate door price requirements
 * Tests both single and multi-day event door price validation
 */

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

const CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";

async function testDoorPriceValidation() {
  const client = new ConvexHttpClient(CONVEX_URL);
  
  console.log("🧪 Testing Door Price Validation\n");
  console.log("=" .repeat(50));
  
  // Test 1: Single Event without door price (should fail or default)
  console.log("\n📝 Test 1: Single Event without door price");
  try {
    const singleEventNoPrice = {
      name: "Test Single Event - No Price",
      description: "Testing single event without door price",
      location: "Test Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      price: undefined, // No price specified
      doorPrice: undefined, // No door price specified
      totalTickets: 100,
      userId: "test_user_123",
      isTicketed: false,
      eventCategories: ["social_dance"]
    };
    
    console.log("Attempting to create event without door price...");
    console.log("Event data:", {
      ...singleEventNoPrice,
      doorPrice: singleEventNoPrice.doorPrice ?? "NOT SET"
    });
    
    // This should now require door price to be set
    const result = await client.mutation(api.events.create, singleEventNoPrice);
    console.log("⚠️  Event created with ID:", result);
    console.log("Note: Check if doorPrice was properly required in UI");
  } catch (error) {
    console.log("✅ Expected behavior - Event creation without door price failed");
    console.log("Error:", error.message);
  }
  
  // Test 2: Single Event with door price = 0 (free event)
  console.log("\n📝 Test 2: Single Event with door price = 0 (free)");
  try {
    const freeEvent = {
      name: "Test Free Event",
      description: "Testing free event with door price = 0",
      location: "Test Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      price: 0,
      doorPrice: 0, // Explicitly set to 0 for free
      totalTickets: 100,
      userId: "test_user_123",
      isTicketed: false,
      eventCategories: ["social_dance"]
    };
    
    const result = await client.mutation(api.events.create, freeEvent);
    console.log("✅ Free event created successfully with ID:", result);
  } catch (error) {
    console.log("❌ Failed to create free event:", error.message);
  }
  
  // Test 3: Single Event with door price > 0
  console.log("\n📝 Test 3: Single Event with door price = $25");
  try {
    const paidEvent = {
      name: "Test Paid Event",
      description: "Testing paid event with door price = $25",
      location: "Test Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      price: 25,
      doorPrice: 25,
      totalTickets: 100,
      userId: "test_user_123",
      isTicketed: false,
      eventCategories: ["social_dance"]
    };
    
    const result = await client.mutation(api.events.create, paidEvent);
    console.log("✅ Paid event created successfully with ID:", result);
  } catch (error) {
    console.log("❌ Failed to create paid event:", error.message);
  }
  
  // Test 4: Multi-day Event with price range
  console.log("\n📝 Test 4: Multi-day Event with price range $30-$75");
  try {
    const multiDayEvent = {
      name: "Test Multi-Day Festival",
      description: "Testing multi-day event with price range",
      location: "Test Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 10 * 24 * 60 * 60 * 1000, // 3 days long
      price: 30, // Will use doorPriceMin
      doorPriceMin: 30,
      doorPriceMax: 75,
      totalTickets: 500,
      userId: "test_user_123",
      isTicketed: false,
      isMultiDay: true,
      eventMode: "multi_day",
      eventCategories: ["holiday"]
    };
    
    const result = await client.mutation(api.events.create, multiDayEvent);
    console.log("✅ Multi-day event created successfully with ID:", result);
    
    // Verify the event has the correct price range
    const createdEvent = await client.query(api.events.getById, { eventId: result });
    console.log("Price range stored:", {
      doorPriceMin: createdEvent.doorPriceMin,
      doorPriceMax: createdEvent.doorPriceMax,
      price: createdEvent.price
    });
  } catch (error) {
    console.log("❌ Failed to create multi-day event:", error.message);
  }
  
  // Test 5: Multi-day Event without price range (should fail)
  console.log("\n📝 Test 5: Multi-day Event without price range");
  try {
    const multiDayNoPrice = {
      name: "Test Multi-Day No Price",
      description: "Testing multi-day event without price range",
      location: "Test Location",
      eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
      price: undefined,
      doorPriceMin: undefined, // Not set
      doorPriceMax: undefined, // Not set
      totalTickets: 500,
      userId: "test_user_123",
      isTicketed: false,
      isMultiDay: true,
      eventMode: "multi_day",
      eventCategories: ["holiday"]
    };
    
    console.log("Attempting to create multi-day event without price range...");
    const result = await client.mutation(api.events.create, multiDayNoPrice);
    console.log("⚠️  Multi-day event created with ID:", result);
    console.log("Note: Check if doorPriceMin/Max were properly required in UI");
  } catch (error) {
    console.log("✅ Expected behavior - Multi-day event without price range failed");
    console.log("Error:", error.message);
  }
  
  console.log("\n" + "=" .repeat(50));
  console.log("✅ Door Price Validation Tests Complete");
  console.log("\n📋 Summary:");
  console.log("1. Single events should REQUIRE door price entry (no default 0)");
  console.log("2. Free events can be created with explicit doorPrice = 0");
  console.log("3. Multi-day events should REQUIRE both min and max prices");
  console.log("4. The price field uses doorPriceMin for multi-day events");
}

// Run the tests
testDoorPriceValidation().catch(console.error);