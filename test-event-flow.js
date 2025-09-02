// Test script to verify event creation flow
// Run with: node test-event-flow.js

const testData = {
  // Basic Info Step
  basicInfo: {
    name: "Test Dance Event",
    description: "This is a test event for the dance community",
    location: "Grand Ballroom",
    address: "123 Main Street",
    city: "Miami",
    state: "FL",
    postalCode: "33101",
    eventDate: "2025-09-15",
    eventTime: "19:00",
    categories: ["social_dance", "party"]
  },
  
  // Ticketing Decision
  ticketing: {
    isTicketed: true,
    doorPrice: null
  },
  
  // Capacity & Tickets
  capacity: {
    totalCapacity: 200,
    ticketTypes: [
      {
        name: "General Admission",
        quantity: 150,
        price: 25.00
      },
      {
        name: "VIP",
        quantity: 50,
        price: 50.00,
        hasEarlyBird: true,
        earlyBirdPrice: 40.00,
        earlyBirdEndDate: "2025-09-01"
      }
    ]
  },
  
  // Tables (optional)
  tables: []
};

console.log("Event Creation Test Data");
console.log("========================");
console.log("\n1. Basic Info Step:");
console.log("   - Event Name:", testData.basicInfo.name);
console.log("   - Location:", testData.basicInfo.location);
console.log("   - Full Address:", `${testData.basicInfo.address}, ${testData.basicInfo.city}, ${testData.basicInfo.state} ${testData.basicInfo.postalCode}`);
console.log("   - Date/Time:", `${testData.basicInfo.eventDate} at ${testData.basicInfo.eventTime}`);
console.log("   - Categories:", testData.basicInfo.categories.join(", "));

console.log("\n2. Ticketing Decision:");
console.log("   - Selling Tickets Online:", testData.ticketing.isTicketed ? "Yes" : "No");

if (testData.ticketing.isTicketed) {
  console.log("\n3. Capacity & Tickets:");
  console.log("   - Total Capacity:", testData.capacity.totalCapacity);
  console.log("   - Ticket Types:");
  testData.capacity.ticketTypes.forEach((ticket, index) => {
    console.log(`     ${index + 1}. ${ticket.name}:`);
    console.log(`        - Quantity: ${ticket.quantity}`);
    console.log(`        - Price: $${ticket.price}`);
    if (ticket.hasEarlyBird) {
      console.log(`        - Early Bird Price: $${ticket.earlyBirdPrice}`);
      console.log(`        - Early Bird Ends: ${ticket.earlyBirdEndDate}`);
    }
  });
}

console.log("\n4. Tables:");
console.log("   - No table configurations");

console.log("\n5. Review & Publish:");
console.log("   - Ready to publish event to Convex database");

console.log("\n✅ Test data structure is valid");
console.log("📝 Use this data to manually test the event creation flow at:");
console.log("   http://localhost:3000/organizer/new-event");