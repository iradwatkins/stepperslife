import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Production Convex URL
const CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Event organizer user ID (we'll use a consistent ID for all events)
const ORGANIZER_ID = "atlanta_events_2025";

async function createSingleDayEvents() {
  console.log("Creating single-day events...");
  
  // Event 1: Atlanta Salsa Night Spectacular
  const salsa = await client.mutation(api.events.create, {
    name: "Atlanta Salsa Night Spectacular",
    description: "Join us for an unforgettable night of salsa dancing featuring live music from Orquesta La Moderna, professional performances, and social dancing until 2 AM. Our grand ballroom features a professional dance floor, full bar service, and Latin cuisine.",
    location: "The Grand Ballroom",
    address: "123 Peachtree Street NE",
    city: "Atlanta",
    state: "GA",
    postalCode: "30303",
    latitude: 33.7490,
    longitude: -84.3880,
    eventDate: new Date("2025-02-15T20:00:00").getTime(),
    price: 25,
    totalTickets: 350,
    userId: ORGANIZER_ID,
    eventCategories: ["social_dance", "party"],
    isTicketed: true,
    eventMode: "in-person"
  });
  console.log("Created: Atlanta Salsa Night Spectacular", salsa);
  
  // Create ticket types for salsa event
  if (salsa) {
    await client.mutation(api.ticketTypes.createSingleEventTickets, {
      eventId: salsa as Id<"events">,
      ticketTypes: [
        { name: "General Admission", category: "general" as const, allocatedQuantity: 200, price: 25, hasEarlyBird: false },
        { name: "VIP Pass", category: "vip" as const, allocatedQuantity: 50, price: 60, hasEarlyBird: false },
        { name: "Early Bird Special", category: "early_bird" as const, allocatedQuantity: 100, price: 20, hasEarlyBird: true, earlyBirdPrice: 20, earlyBirdEndDate: new Date("2025-02-01").getTime() }
      ]
    });
  }
  
  // Event 2: Bachata Workshop with Carlos Rodriguez
  const bachata = await client.mutation(api.events.create, {
    name: "Bachata Workshop with Carlos Rodriguez",
    description: "Master the art of Bachata with internationally renowned instructor Carlos Rodriguez. This intensive workshop covers advanced footwork, partner connection, and musicality. All levels welcome with separate tracks for beginners and advanced dancers.",
    location: "Dance Studio Elite",
    address: "456 Spring Street NW",
    city: "Atlanta", 
    state: "GA",
    postalCode: "30308",
    latitude: 33.7726,
    longitude: -84.3857,
    eventDate: new Date("2025-03-08T14:00:00").getTime(),
    price: 45,
    totalTickets: 170,
    userId: ORGANIZER_ID,
    eventCategories: ["workshop", "class"],
    isTicketed: true,
    eventMode: "in-person"
  });
  console.log("Created: Bachata Workshop", bachata);
  
  await client.mutation(api.ticketTypes.createSingleEventTickets, {
    eventId: bachata as Id<"events">,
    ticketTypes: [
      { name: "Workshop Pass", category: "general", allocatedQuantity: 80, price: 45, hasEarlyBird: false },
      { name: "Workshop + Social", category: "general", allocatedQuantity: 60, price: 65, hasEarlyBird: false },
      { name: "Student Discount", category: "general", allocatedQuantity: 30, price: 35, hasEarlyBird: false }
    ]
  });
  
  // Event 3: Spring Jazz & Blues Social  
  const jazz = await client.mutation(api.events.create, {
    name: "Spring Jazz & Blues Social",
    description: "An elegant evening of jazz and blues dancing with live performances by The Blue Note Quartet. Enjoy craft cocktails, light appetizers, and smooth dancing in our intimate lounge setting.",
    location: "The Blue Note Lounge",
    address: "789 Jazz Avenue",
    city: "Decatur",
    state: "GA",
    postalCode: "30030",
    latitude: 33.7748,
    longitude: -84.2963,
    eventDate: new Date("2025-04-12T19:00:00").getTime(),
    price: 15,
    totalTickets: 290,
    userId: ORGANIZER_ID,
    eventCategories: ["sets", "lounge_bar"],
    isTicketed: true,
    eventMode: "in-person"
  });
  console.log("Created: Spring Jazz & Blues Social", jazz);
  
  await client.mutation(api.ticketTypes.createSingleEventTickets, {
    eventId: jazz as Id<"events">,
    ticketTypes: [
      { name: "Standing Room", category: "general", allocatedQuantity: 150, price: 15, hasEarlyBird: false },
      { name: "Seated Section", category: "general", allocatedQuantity: 100, price: 35, hasEarlyBird: false },
      { name: "Premium Seating", category: "vip", allocatedQuantity: 40, price: 55, hasEarlyBird: false }
    ]
  });
}

async function createMultiDayEvents() {
  console.log("Creating multi-day events...");
  
  // Event 1: Atlanta Dance Festival 2025
  const festival = await client.mutation(api.events.create, {
    name: "Atlanta Dance Festival 2025",
    description: "The Southeast's premier dance festival featuring workshops, competitions, and social dancing across multiple genres including Salsa, Bachata, Kizomba, and Urban Kiz.",
    location: "Atlanta Convention Center",
    address: "285 Andrew Young International Blvd NW",
    city: "Atlanta",
    state: "GA",
    postalCode: "30313",
    latitude: 33.7614,
    longitude: -84.3933,
    eventDate: new Date("2025-05-23T18:00:00").getTime(),
    endDate: new Date("2025-05-25T23:00:00").getTime(),
    price: 40,
    totalTickets: 1200,
    userId: ORGANIZER_ID,
    eventCategories: ["competition", "workshop", "party"],
    isTicketed: true,
    isMultiDay: true,
    sameLocation: true,
    eventMode: "in-person"
  });
  console.log("Created: Atlanta Dance Festival 2025", festival);
  
  // Create event days
  const festivalDays = await client.mutation(api.multiDayEvents.createEventDays, {
    eventId: festival as Id<"events">,
    startDate: new Date("2025-05-23").getTime(),
    endDate: new Date("2025-05-25").getTime(),
    sameLocation: true,
    location: "Atlanta Convention Center",
    address: "285 Andrew Young International Blvd NW",
    city: "Atlanta",
    state: "GA",
    postalCode: "30313",
    latitude: 33.7614,
    longitude: -84.3933
  });
  
  // Create tickets for each day
  for (let i = 0; i < festivalDays.length; i++) {
    const dayId = festivalDays[i];
    const prices = [40, 50, 45]; // Different prices per day
    const vipPrices = [80, 100, 90];
    
    await client.mutation(api.multiDayEvents.createTicketType, {
      eventId: festival as Id<"events">,
      eventDayId: dayId as Id<"eventDays">,
      name: "General Admission",
      category: "general",
      price: prices[i],
      maxQuantity: i === 1 ? 400 : 350
    });
    
    await client.mutation(api.multiDayEvents.createTicketType, {
      eventId: festival as Id<"events">,
      eventDayId: dayId as Id<"eventDays">,
      name: "VIP Pass",
      category: "vip",
      price: vipPrices[i],
      maxQuantity: i === 1 ? 150 : 120
    });
  }
  
  // Create bundles
  await client.mutation(api.multiDayEvents.generateStandardBundles, {
    eventId: festival as Id<"events">
  });
  
  // Event 2: Summer Steppers Cruise Weekend
  const cruise = await client.mutation(api.events.create, {
    name: "Summer Steppers Cruise Weekend",
    description: "Set sail for the ultimate steppers experience! Two days of smooth stepping on the water with DJ Smooth, live performances, and gourmet dining.",
    location: "Marina Dock - Savannah to Hilton Head",
    address: "1 River Street",
    city: "Savannah",
    state: "GA",
    postalCode: "31401",
    latitude: 32.0809,
    longitude: -81.0912,
    eventDate: new Date("2025-06-14T10:00:00").getTime(),
    endDate: new Date("2025-06-15T20:00:00").getTime(),
    price: 125,
    totalTickets: 500,
    userId: ORGANIZER_ID,
    eventCategories: ["cruise", "party"],
    isTicketed: true,
    isMultiDay: true,
    sameLocation: false,
    eventMode: "in-person"
  });
  console.log("Created: Summer Steppers Cruise Weekend", cruise);
  
  // Event 3: Latin Dance Intensive Workshop Series
  const intensive = await client.mutation(api.events.create, {
    name: "Latin Dance Intensive Workshop Series",
    description: "Five days of intensive Latin dance training with world-class instructors. Each day focuses on different styles: Salsa, Bachata, Cha-Cha, Rumba, and Samba.",
    location: "Various Dance Studios - Atlanta",
    address: "100 Dance Way",
    city: "Atlanta",
    state: "GA",
    postalCode: "30309",
    latitude: 33.7831,
    longitude: -84.3853,
    eventDate: new Date("2025-07-07T09:00:00").getTime(),
    endDate: new Date("2025-07-11T18:00:00").getTime(),
    price: 30,
    totalTickets: 300,
    userId: ORGANIZER_ID,
    eventCategories: ["workshop", "class"],
    isTicketed: true,
    isMultiDay: true,
    sameLocation: false,
    eventMode: "in-person"
  });
  console.log("Created: Latin Dance Intensive", intensive);
}

async function createSaveTheDateEvents() {
  console.log("Creating save-the-date events...");
  
  // Event 1: New Year's Eve Gala 2026
  const nye = await client.mutation(api.events.create, {
    name: "New Year's Eve Gala 2026",
    description: "Mark your calendars for Atlanta's most elegant NYE celebration! Black tie event featuring multiple ballrooms, live orchestra, gourmet dining, and champagne toast at midnight. Limited to 500 guests. Details and tickets coming October 2025.",
    location: "",
    eventDate: new Date("2025-12-31T20:00:00").getTime(),
    price: 0,
    totalTickets: 0,
    userId: ORGANIZER_ID,
    eventCategories: ["holiday", "party"],
    isTicketed: false,
    isSaveTheDate: true,
    eventMode: "in-person"
  });
  console.log("Created: New Year's Eve Gala 2026", nye);
  
  // Event 2: International Dance Championships 2025
  const championships = await client.mutation(api.events.create, {
    name: "International Dance Championships 2025",
    description: "World-class dancers from over 30 countries will compete in multiple dance styles including Latin, Ballroom, Hip-Hop, and Contemporary. Witness the best dancers in the world compete for the championship title. Venue and ticket information coming soon!",
    location: "",
    eventDate: new Date("2025-09-15T09:00:00").getTime(),
    price: 0,
    totalTickets: 0,
    userId: ORGANIZER_ID,
    eventCategories: ["competition", "sets"],
    isTicketed: false,
    isSaveTheDate: true,
    eventMode: "in-person"
  });
  console.log("Created: International Dance Championships", championships);
  
  // Event 3: Fall Harvest Dance Festival
  const harvest = await client.mutation(api.events.create, {
    name: "Fall Harvest Dance Festival",
    description: "Our annual outdoor dance festival returns! Three stages of live music, food trucks, craft vendors, and dancing under the stars. Family-friendly event with kids dance workshops. Save the date for this community celebration!",
    location: "",
    eventDate: new Date("2025-10-18T14:00:00").getTime(),
    price: 0,
    totalTickets: 0,
    userId: ORGANIZER_ID,
    eventCategories: ["in_the_park", "social_dance"],
    isTicketed: false,
    isSaveTheDate: true,
    eventMode: "in-person"
  });
  console.log("Created: Fall Harvest Dance Festival", harvest);
}

async function main() {
  console.log("🎉 Starting production event creation...");
  console.log("Using Convex URL:", CONVEX_URL);
  
  try {
    // Create all event types
    await createSingleDayEvents();
    await createMultiDayEvents();
    await createSaveTheDateEvents();
    
    console.log("✅ All production events created successfully!");
    
    // Verify events were created
    const events = await client.query(api.events.get, {});
    console.log(`\n📊 Total events created: ${events.length}`);
    console.log("\nEvents list:");
    events.forEach((event: any) => {
      console.log(`- ${event.name} (${event.eventCategories?.join(", ")})`);
    });
    
  } catch (error) {
    console.error("❌ Error creating events:", error);
    process.exit(1);
  }
}

// Run the script
main();