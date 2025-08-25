// Test script for ticket creation system
// This file contains test data and validation for the ticket system

import type { EventData, TicketType, TableConfig } from "./components/events/SingleEventFlow";

// Test Data for Single Event
export const testSingleEventData: EventData = {
  // Basic Info
  name: "Miami Summer Dance Festival 2025",
  description: "Join us for an unforgettable night of dancing, live music, and entertainment. Featuring top DJs, professional dancers, and amazing vibes. Don't miss the biggest dance event of the summer!",
  location: "The Grand Ballroom Miami",
  address: "1234 Ocean Drive",
  city: "Miami Beach",
  state: "FL",
  postalCode: "33139",
  eventDate: "2025-07-15",
  eventTime: "21:00",
  endTime: "02:00",
  
  // Ticketing
  isTicketed: true,
  totalCapacity: 500,
  
  // Categories
  categories: ["party", "social_dance", "lounge_bar"],
};

// Test Ticket Types with Early Bird
export const testTicketTypes: TicketType[] = [
  {
    id: "1",
    name: "General Admission",
    quantity: 300,
    price: 35,
    hasEarlyBird: true,
    earlyBirdPrice: 25,
    earlyBirdEndDate: "2025-07-01", // 2 weeks before event
  },
  {
    id: "2",
    name: "VIP",
    quantity: 150,
    price: 75,
    hasEarlyBird: true,
    earlyBirdPrice: 60,
    earlyBirdEndDate: "2025-07-01",
  },
  {
    id: "3",
    name: "Super VIP",
    quantity: 50,
    price: 150,
    hasEarlyBird: true,
    earlyBirdPrice: 125,
    earlyBirdEndDate: "2025-06-15", // Earlier cutoff for premium
  },
];

// Test Table Configurations
export const testTableConfigs: TableConfig[] = [
  {
    id: "1",
    name: "VIP Table (10 seats)",
    seatCount: 10,
    price: 650, // Discount from $750 individual
    description: "Premium table with bottle service and best view of the stage",
    sourceTicketTypeId: "2", // VIP tickets
    sourceTicketTypeName: "VIP",
  },
  {
    id: "2",
    name: "Super VIP Booth (8 seats)",
    seatCount: 8,
    price: 1000, // Big discount from $1200 individual
    description: "Private booth with dedicated server, premium bottle service",
    sourceTicketTypeId: "3", // Super VIP tickets
    sourceTicketTypeName: "Super VIP",
  },
  {
    id: "3",
    name: "GA Friends Table (12 seats)",
    seatCount: 12,
    price: 350, // Discount from $420 individual
    description: "Perfect for large groups, great atmosphere",
    sourceTicketTypeId: "1", // GA tickets
    sourceTicketTypeName: "General Admission",
  },
];

// Multi-Day Event Test Data
export const testMultiDayEventData = {
  seriesName: "SteppersLife Weekend Extravaganza",
  events: [
    {
      name: "Friday Night Kickoff Party",
      date: "2025-08-15",
      startTime: "20:00",
      endTime: "02:00",
      location: "The Grand Ballroom",
      address: "1234 Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      capacity: 400,
      ticketTypes: [
        { name: "GA", quantity: 250, price: 30, earlyBird: 25 },
        { name: "VIP", quantity: 150, price: 60, earlyBird: 50 },
      ],
    },
    {
      name: "Saturday Workshop & Social",
      date: "2025-08-16",
      startTime: "14:00",
      endTime: "23:00",
      location: "Dance Studio Miami",
      address: "5678 Collins Ave",
      city: "Miami Beach",
      state: "FL",
      capacity: 200,
      ticketTypes: [
        { name: "Workshop Pass", quantity: 100, price: 45, earlyBird: 35 },
        { name: "VIP All Access", quantity: 100, price: 80, earlyBird: 65 },
      ],
    },
    {
      name: "Sunday Beach Party",
      date: "2025-08-17",
      startTime: "12:00",
      endTime: "20:00",
      location: "South Beach Pavilion",
      address: "900 Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      capacity: 500,
      ticketTypes: [
        { name: "Beach Pass", quantity: 350, price: 25, earlyBird: 20 },
        { name: "VIP Cabana", quantity: 150, price: 75, earlyBird: 60 },
      ],
    },
  ],
  bundles: [
    {
      name: "Full Weekend Pass - GA",
      includes: ["Friday GA", "Saturday Workshop", "Sunday Beach"],
      regularTotal: 100,
      bundlePrice: 80, // Save $20
    },
    {
      name: "VIP All Weekend",
      includes: ["Friday VIP", "Saturday VIP All Access", "Sunday VIP Cabana"],
      regularTotal: 215,
      bundlePrice: 175, // Save $40
    },
    {
      name: "Party Package",
      includes: ["Friday GA", "Sunday Beach"],
      regularTotal: 55,
      bundlePrice: 45, // Save $10
    },
  ],
};

// Validation Functions
export function validateCapacityAllocation(
  totalCapacity: number,
  ticketTypes: TicketType[]
): { valid: boolean; message: string } {
  const totalAllocated = ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
  
  if (totalAllocated === totalCapacity) {
    return { valid: true, message: "Perfect allocation!" };
  } else if (totalAllocated < totalCapacity) {
    return {
      valid: false,
      message: `${totalCapacity - totalAllocated} tickets unallocated`,
    };
  } else {
    return {
      valid: false,
      message: `Over capacity by ${totalAllocated - totalCapacity} tickets`,
    };
  }
}

export function validateTableAllocations(
  ticketTypes: TicketType[],
  tables: TableConfig[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allocations: Record<string, number> = {};
  
  // Count allocations per ticket type
  tables.forEach(table => {
    if (!allocations[table.sourceTicketTypeId]) {
      allocations[table.sourceTicketTypeId] = 0;
    }
    allocations[table.sourceTicketTypeId] += table.seatCount;
  });
  
  // Check if allocations exceed available tickets
  Object.entries(allocations).forEach(([ticketTypeId, allocated]) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    if (ticketType && allocated > ticketType.quantity) {
      errors.push(
        `Table allocation for ${ticketType.name} exceeds available tickets: ${allocated} > ${ticketType.quantity}`
      );
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateRevenue(
  ticketTypes: TicketType[],
  tables: TableConfig[]
): {
  publicTicketRevenue: number;
  tableRevenue: number;
  totalRevenue: number;
  breakdown: Array<{ item: string; revenue: number }>;
} {
  const breakdown: Array<{ item: string; revenue: number }> = [];
  
  // Calculate public ticket revenue (minus table allocations)
  const tableAllocations: Record<string, number> = {};
  tables.forEach(table => {
    if (!tableAllocations[table.sourceTicketTypeId]) {
      tableAllocations[table.sourceTicketTypeId] = 0;
    }
    tableAllocations[table.sourceTicketTypeId] += table.seatCount;
  });
  
  let publicTicketRevenue = 0;
  ticketTypes.forEach(ticket => {
    const allocated = tableAllocations[ticket.id] || 0;
    const publicAvailable = ticket.quantity - allocated;
    const revenue = publicAvailable * ticket.price;
    publicTicketRevenue += revenue;
    
    if (publicAvailable > 0) {
      breakdown.push({
        item: `${ticket.name} (${publicAvailable} tickets)`,
        revenue,
      });
    }
  });
  
  // Calculate table revenue
  let tableRevenue = 0;
  tables.forEach(table => {
    tableRevenue += table.price;
    breakdown.push({
      item: `${table.name}`,
      revenue: table.price,
    });
  });
  
  return {
    publicTicketRevenue,
    tableRevenue,
    totalRevenue: publicTicketRevenue + tableRevenue,
    breakdown,
  };
}

// Test Results
console.log("=== TICKET CREATION SYSTEM TEST ===\n");

console.log("1. CAPACITY VALIDATION");
const capacityCheck = validateCapacityAllocation(
  testSingleEventData.totalCapacity!,
  testTicketTypes
);
console.log(`   Status: ${capacityCheck.valid ? "✅" : "❌"} ${capacityCheck.message}`);

console.log("\n2. TABLE ALLOCATION VALIDATION");
const tableCheck = validateTableAllocations(testTicketTypes, testTableConfigs);
console.log(`   Status: ${tableCheck.valid ? "✅ Valid" : "❌ Invalid"}`);
if (!tableCheck.valid) {
  tableCheck.errors.forEach(error => console.log(`   - ${error}`));
}

console.log("\n3. REVENUE PROJECTION");
const revenue = calculateRevenue(testTicketTypes, testTableConfigs);
console.log(`   Public Tickets: $${revenue.publicTicketRevenue.toFixed(2)}`);
console.log(`   Table Sales: $${revenue.tableRevenue.toFixed(2)}`);
console.log(`   TOTAL POTENTIAL: $${revenue.totalRevenue.toFixed(2)}`);

console.log("\n4. INVENTORY AFTER TABLES");
testTicketTypes.forEach(ticket => {
  const tablesUsing = testTableConfigs.filter(t => t.sourceTicketTypeId === ticket.id);
  const seatsToTables = tablesUsing.reduce((sum, t) => sum + t.seatCount, 0);
  const publicAvailable = ticket.quantity - seatsToTables;
  
  console.log(`   ${ticket.name}:`);
  console.log(`     - Total: ${ticket.quantity}`);
  console.log(`     - To Tables: ${seatsToTables}`);
  console.log(`     - Public Sale: ${publicAvailable}`);
});

console.log("\n5. EARLY BIRD SAVINGS");
testTicketTypes.forEach(ticket => {
  if (ticket.hasEarlyBird && ticket.earlyBirdPrice) {
    const savings = ticket.price - ticket.earlyBirdPrice;
    const percentOff = ((savings / ticket.price) * 100).toFixed(0);
    console.log(`   ${ticket.name}: Save $${savings} (${percentOff}% off)`);
  }
});

console.log("\n=== TEST COMPLETE ===");

export default {
  testSingleEventData,
  testTicketTypes,
  testTableConfigs,
  testMultiDayEventData,
};