/**
 * Script to populate sample events in the database
 * Run with: npx tsx scripts/populate-sample-events.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://mild-newt-621.convex.cloud";
const client = new ConvexHttpClient(convexUrl);

const sampleEvents = [
  {
    name: "Chicago Steppers Weekend",
    description: "Join us for an amazing weekend of Chicago Stepping! Live music, dance workshops, and performances by world-renowned steppers.",
    location: "McCormick Place",
    address: "2301 S Lake Shore Dr",
    city: "Chicago",
    state: "IL",
    postalCode: "60616",
    eventDate: new Date("2025-09-15 20:00").getTime(),
    price: 75,
    totalTickets: 500,
    eventType: "party",
    eventCategories: ["Party", "Workshop", "Competition"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  },
  {
    name: "Saturday Night Steppers Set",
    description: "Every Saturday night, join us for the hottest steppers set in town! DJ Smooth on the 1s and 2s.",
    location: "The Promontory",
    address: "5311 S Lake Park Ave W",
    city: "Chicago",
    state: "IL",
    postalCode: "60615",
    eventDate: new Date("2025-09-07 22:00").getTime(),
    price: 25,
    totalTickets: 200,
    eventType: "social",
    eventCategories: ["Social Dance", "Sets/Performance"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
  },
  {
    name: "Beginners Stepping Class",
    description: "Learn the basics of Chicago Stepping in this 6-week beginner course. No partner required!",
    location: "Chicago Dance Center",
    address: "1220 W Fullerton Ave",
    city: "Chicago",
    state: "IL",
    postalCode: "60614",
    eventDate: new Date("2025-09-10 19:00").getTime(),
    price: 150,
    totalTickets: 30,
    eventType: "class",
    eventCategories: ["Class/Lesson"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1535525153412-5a42439a210d",
  },
  {
    name: "Steppers in the Park",
    description: "Free outdoor stepping event! Bring your own refreshments and enjoy dancing under the stars.",
    location: "Grant Park",
    address: "337 E Randolph St",
    city: "Chicago",
    state: "IL",
    postalCode: "60601",
    eventDate: new Date("2025-09-08 15:00").getTime(),
    price: 0,
    totalTickets: 1000,
    eventType: "social",
    eventCategories: ["In The Park", "Social Dance"],
    userId: "admin@stepperslife.com",
    isTicketed: false,
    doorPrice: 0,
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
  },
  {
    name: "Detroit vs Chicago Steppers Battle",
    description: "The ultimate steppers competition! Teams from Detroit and Chicago compete for the championship title.",
    location: "United Center",
    address: "1901 W Madison St",
    city: "Chicago",
    state: "IL",
    postalCode: "60612",
    eventDate: new Date("2025-10-20 18:00").getTime(),
    price: 45,
    totalTickets: 800,
    eventType: "competition",
    eventCategories: ["Competition", "Sets/Performance"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e",
  },
  {
    name: "Steppers Cruise to Jamaica",
    description: "7-day Caribbean cruise with daily stepping events, workshops, and tropical paradise!",
    location: "Port of Miami",
    address: "1015 N America Way",
    city: "Miami",
    state: "FL",
    postalCode: "33132",
    eventDate: new Date("2025-11-15 12:00").getTime(),
    price: 1200,
    totalTickets: 150,
    eventType: "trip",
    eventCategories: ["Cruise", "Trip/Travel"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1559599746-8823b38544c6",
  },
  {
    name: "Holiday Steppers Ball",
    description: "Elegant holiday celebration with live band, formal attire required. Ring in the season with style!",
    location: "The Palmer House Hilton",
    address: "17 E Monroe St",
    city: "Chicago",
    state: "IL",
    postalCode: "60603",
    eventDate: new Date("2025-12-21 20:00").getTime(),
    price: 125,
    totalTickets: 400,
    eventType: "party",
    eventCategories: ["Holiday Event", "Party"],
    userId: "admin@stepperslife.com",
    isTicketed: true,
    imageUrl: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be",
  },
  {
    name: "Wednesday Night Practice Session",
    description: "Open practice session for all levels. Work on your moves and meet other steppers!",
    location: "South Shore Cultural Center",
    address: "7059 S Shore Dr",
    city: "Chicago",
    state: "IL",
    postalCode: "60649",
    eventDate: new Date("2025-09-04 19:30").getTime(),
    price: 10,
    totalTickets: 100,
    eventType: "social",
    eventCategories: ["Social Dance", "Class/Lesson"],
    userId: "admin@stepperslife.com",
    isTicketed: false,
    doorPrice: 10,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
  },
];

async function populateEvents() {
  console.log("🎫 Starting to populate sample events...");
  
  try {
    for (const event of sampleEvents) {
      console.log(`Creating event: ${event.name}`);
      
      const eventId = await client.mutation(api.events.create, event);
      
      // If the event is ticketed, create some ticket types
      if (event.isTicketed) {
        const ticketTypes = [
          {
            name: "General Admission",
            category: "general",
            allocatedQuantity: Math.floor(event.totalTickets * 0.6),
            price: event.price,
            hasEarlyBird: true,
            earlyBirdPrice: event.price * 0.8,
            earlyBirdEndDate: event.eventDate - (7 * 24 * 60 * 60 * 1000), // 7 days before
          },
          {
            name: "VIP",
            category: "vip",
            allocatedQuantity: Math.floor(event.totalTickets * 0.2),
            price: event.price * 1.5,
            hasEarlyBird: false,
          },
          {
            name: "Group (Table of 10)",
            category: "general",
            allocatedQuantity: Math.floor(event.totalTickets * 0.2),
            price: event.price * 9, // 10% discount for groups
            hasEarlyBird: false,
          },
        ];
        
        await client.mutation(api.ticketTypes.createSingleEventTickets, {
          eventId,
          ticketTypes,
        });
        
        console.log(`  ✅ Created ${ticketTypes.length} ticket types`);
      }
      
      console.log(`  ✅ Event created successfully`);
    }
    
    console.log("\n🎉 All sample events created successfully!");
    console.log(`Total events created: ${sampleEvents.length}`);
    
  } catch (error) {
    console.error("❌ Error creating events:", error);
    process.exit(1);
  }
}

// Run the script
populateEvents().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
});