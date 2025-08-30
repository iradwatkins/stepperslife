import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Production Convex URL
const CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Event organizer user ID
const ORGANIZER_ID = "atlanta_events_2025";

async function createEvents() {
  console.log("🎉 Creating production events...");
  
  try {
    // Create 3 single-day events
    console.log("\n📅 Creating single-day events...");
    
    const salsa = await client.mutation(api.events.create, {
      name: "Atlanta Salsa Night Spectacular",
      description: "Join us for an unforgettable night of salsa dancing featuring live music from Orquesta La Moderna, professional performances, and social dancing until 2 AM.",
      location: "The Grand Ballroom",
      eventDate: new Date("2025-02-15T20:00:00").getTime(),
      price: 25,
      totalTickets: 350,
      userId: ORGANIZER_ID,
      eventCategories: ["social_dance", "other"],
      isTicketed: true
    });
    console.log("✓ Created: Atlanta Salsa Night Spectacular");
    
    const bachata = await client.mutation(api.events.create, {
      name: "Bachata Workshop with Carlos Rodriguez",
      description: "Master the art of Bachata with internationally renowned instructor Carlos Rodriguez. This intensive workshop covers advanced footwork, partner connection, and musicality.",
      location: "Dance Studio Elite, Atlanta",
      eventDate: new Date("2025-03-08T14:00:00").getTime(),
      price: 45,
      totalTickets: 170,
      userId: ORGANIZER_ID,
      eventCategories: ["workshop", "class"],
      isTicketed: true
    });
    console.log("✓ Created: Bachata Workshop");
    
    const jazz = await client.mutation(api.events.create, {
      name: "Spring Jazz & Blues Social",
      description: "An elegant evening of jazz and blues dancing with live performances by The Blue Note Quartet. Enjoy craft cocktails and smooth dancing in our intimate lounge.",
      location: "The Blue Note Lounge, Decatur",
      eventDate: new Date("2025-04-12T19:00:00").getTime(),
      price: 35,
      totalTickets: 290,
      userId: ORGANIZER_ID,
      eventCategories: ["sets", "lounge_bar"],
      isTicketed: true
    });
    console.log("✓ Created: Spring Jazz & Blues Social");
    
    // Create 3 multi-day events
    console.log("\n🎪 Creating multi-day events...");
    
    const festival = await client.mutation(api.events.create, {
      name: "Atlanta Dance Festival 2025",
      description: "The Southeast's premier 3-day dance festival featuring workshops, competitions, and social dancing across Salsa, Bachata, Kizomba, and Urban Kiz.",
      location: "Atlanta Convention Center",
      eventDate: new Date("2025-05-23T18:00:00").getTime(),
      endDate: new Date("2025-05-25T23:00:00").getTime(),
      price: 40,
      totalTickets: 1200,
      userId: ORGANIZER_ID,
      eventCategories: ["competition", "workshop", "other"],
      isTicketed: true,
      isMultiDay: true
    });
    console.log("✓ Created: Atlanta Dance Festival 2025");
    
    const cruise = await client.mutation(api.events.create, {
      name: "Summer Steppers Cruise Weekend",
      description: "Set sail for the ultimate steppers experience! Two days of smooth stepping on the water with DJ Smooth, live performances, and gourmet dining.",
      location: "Marina Dock, Savannah to Hilton Head",
      eventDate: new Date("2025-06-14T10:00:00").getTime(),
      endDate: new Date("2025-06-15T20:00:00").getTime(),
      price: 125,
      totalTickets: 500,
      userId: ORGANIZER_ID,
      eventCategories: ["cruise", "other"],
      isTicketed: true,
      isMultiDay: true
    });
    console.log("✓ Created: Summer Steppers Cruise Weekend");
    
    const intensive = await client.mutation(api.events.create, {
      name: "Latin Dance Intensive Workshop Series",
      description: "Five days of intensive Latin dance training with world-class instructors. Each day focuses on different styles: Salsa, Bachata, Cha-Cha, Rumba, and Samba.",
      location: "Various Dance Studios, Atlanta",
      eventDate: new Date("2025-07-07T09:00:00").getTime(),
      endDate: new Date("2025-07-11T18:00:00").getTime(),
      price: 30,
      totalTickets: 300,
      userId: ORGANIZER_ID,
      eventCategories: ["workshop", "class"],
      isTicketed: true,
      isMultiDay: true
    });
    console.log("✓ Created: Latin Dance Intensive");
    
    // Create 3 save-the-date events
    console.log("\n📌 Creating save-the-date events...");
    
    const nye = await client.mutation(api.events.create, {
      name: "New Year's Eve Gala 2026",
      description: "Mark your calendars for Atlanta's most elegant NYE celebration! Black tie event with live orchestra. Limited to 500 guests. Details coming October 2025.",
      location: "TBA - Atlanta",
      eventDate: new Date("2025-12-31T20:00:00").getTime(),
      price: 0,
      totalTickets: 0,
      userId: ORGANIZER_ID,
      eventCategories: ["holiday", "other"],
      isTicketed: false,
      isSaveTheDate: true
    });
    console.log("✓ Created: New Year's Eve Gala 2026");
    
    const championships = await client.mutation(api.events.create, {
      name: "International Dance Championships 2025",
      description: "World-class dancers from 30+ countries compete in Latin, Ballroom, Hip-Hop, and Contemporary. Venue and tickets coming soon!",
      location: "TBA - Atlanta",
      eventDate: new Date("2025-09-15T09:00:00").getTime(),
      price: 0,
      totalTickets: 0,
      userId: ORGANIZER_ID,
      eventCategories: ["competition", "sets"],
      isTicketed: false,
      isSaveTheDate: true
    });
    console.log("✓ Created: International Dance Championships");
    
    const harvest = await client.mutation(api.events.create, {
      name: "Fall Harvest Dance Festival",
      description: "Annual outdoor festival with three stages, live music, food trucks, and dancing under the stars. Family-friendly with kids workshops!",
      location: "TBA - Atlanta Park",
      eventDate: new Date("2025-10-18T14:00:00").getTime(),
      price: 0,
      totalTickets: 0,
      userId: ORGANIZER_ID,
      eventCategories: ["in_the_park", "social_dance"],
      isTicketed: false,
      isSaveTheDate: true
    });
    console.log("✓ Created: Fall Harvest Dance Festival");
    
    // Verify all events
    console.log("\n✅ All events created successfully!");
    
    const events = await client.query(api.events.get, {});
    console.log(`\n📊 Total events in database: ${events.length}`);
    console.log("\n📋 Events list:");
    events.forEach((event: any) => {
      const eventType = event.isMultiDay ? "Multi-Day" : event.isSaveTheDate ? "Save-the-Date" : "Single-Day";
      console.log(`- ${event.name} [${eventType}]`);
    });
    
    console.log("\n🌐 View events at: https://stepperslife.com");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
createEvents();