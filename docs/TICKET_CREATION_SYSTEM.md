# 🎫 SteppersLife Ticket Creation System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Principles](#core-principles)
3. [Event Types](#event-types)
4. [Ticket Types](#ticket-types)
5. [Implementation Flow](#implementation-flow)
6. [Database Schema](#database-schema)
7. [Business Logic](#business-logic)
8. [User Experience](#user-experience)

---

## System Overview

The SteppersLife ticket system is a capacity-first, dynamic inventory management system that prevents overselling while providing flexibility for various event configurations.

### Key Features
- ✅ **Capacity-based allocation** - Start with total venue capacity
- ✅ **Dynamic bundle availability** - Bundles automatically unavailable when components sell out
- ✅ **Early bird pricing** - Built into each ticket type
- ✅ **Table sales** - Private sales for groups
- ✅ **Multi-day events** - With single QR for bundles
- ✅ **No login required** - Shareable ticket links

---

## Core Principles

### 1. Capacity First
Every event starts with defining total venue capacity. All ticket allocations must sum to this total.

### 2. Single Source of Truth
Individual ticket counts ARE the inventory. No separate allocations for bundles.

### 3. Dynamic Availability
Bundles pull from individual ticket pools in real-time. When any component sells out, the bundle disappears.

### 4. Progressive Disclosure
Show only relevant options at each step of event creation.

---

## Event Types

### Single Event
- One date/time/location
- Simple ticket breakdown
- Optional table configuration

### Multi-Day Event
- Multiple individual events (can be different locations)
- Each day has its own capacity and tickets
- Bundles created after all days defined
- Dynamic bundle availability based on individual day inventory

### Save the Date
- Event announced without tickets
- Location optional
- Can be converted to ticketed event later

---

## Ticket Types

### 1. Individual Tickets (Public)
- **Who buys**: General public
- **Types**: GA, VIP, or custom names
- **Pricing**: Regular + optional early bird
- **Purchase**: Online, direct

### 2. Table Sales (Private)
- **Who buys**: Groups via organizer
- **How**: Organizer creates tables from ticket inventory
- **Result**: Individual tickets for each seat
- **Not shown**: On public event page

### 3. Bundle Tickets (Multi-day)
- **What**: Package of tickets across multiple days
- **Pricing**: Discounted from individual total
- **Availability**: Dynamic based on component availability
- **QR Code**: Single code for all included days

---

## Implementation Flow

### Single Event Creation

```
Step 1: Basic Info
├── Event name, date, time
├── Location details
└── Description

Step 2: Ticketing Decision
├── Yes → Continue to capacity
└── No → Door price only → Publish

Step 3: Capacity & Tickets
├── Total venue capacity: [200]
├── Ticket Type 1: VIP [50] @ $60 (Early: $50)
├── Ticket Type 2: GA [150] @ $30 (Early: $25)
└── Validate: Sum = Total ✅

Step 4: Table Configuration (Optional)
├── Create "VIP Table" (10 seats) from VIP pool
├── Price: $500 (group discount)
└── Remaining: 40 VIP for public

Step 5: Review & Publish
```

### Multi-Day Event Creation

```
Step 1: Series Setup
├── Series name: "Dance Weekend"
└── Number of events: [3]

Step 2-4: For Each Event
├── Event 1: Friday Night
│   ├── Location: Ballroom
│   ├── Capacity: 200
│   └── Tickets: 50 VIP, 150 GA
├── Event 2: Saturday Workshop
│   ├── Location: Studio (different)
│   ├── Capacity: 50
│   └── Tickets: 50 Workshop Pass
└── Event 3: Saturday Night
    ├── Location: Ballroom (same as Event 1)
    ├── Capacity: 250
    └── Tickets: 75 VIP, 175 GA

Step 5: Bundle Creation
├── Auto-generate: Weekend VIP Pass (all VIP tickets)
├── Auto-generate: Weekend GA Pass (all GA + Workshop)
└── Custom: Party Nights (Friday + Saturday nights only)

Step 6: Table Configuration
└── Select event → Create tables from that event's inventory

Step 7: Review All & Publish
```

---

## Database Schema

### Events Table Enhancement
```typescript
events: {
  // Existing fields...
  totalCapacity?: number          // Total venue capacity
  capacityBreakdown?: string      // JSON of allocations
  eventMode?: "single" | "multi_day" | "save_the_date"
}
```

### Day Ticket Types (NEW)
```typescript
dayTicketTypes: {
  eventId: Id<"events">
  eventDayId?: Id<"eventDays">    // For multi-day events
  name: string                     // "VIP", "GA", custom
  category: "general" | "vip" | "early_bird"
  
  // Pricing
  price: number
  hasEarlyBird?: boolean
  earlyBirdPrice?: number
  earlyBirdEndDate?: number
  
  // Capacity Management
  allocatedQuantity: number        // Total for this type
  tableAllocations?: number        // Used for tables
  availableQuantity: number        // For public sale
  soldCount: number
}
```

### Purchases Table (UPDATED)
```typescript
purchases: {
  eventId: Id<"events">
  purchaseType: "table" | "individual" | "bundle"
  
  // Type-specific references
  tableConfigId?: Id<"tableConfigurations">
  ticketTypeId?: Id<"dayTicketTypes">
  bundleId?: Id<"ticketBundles">
  
  // Common fields
  buyerEmail: string
  itemName: string
  quantity: number
  totalAmount: number
}
```

### Simple Tickets (UPDATED)
```typescript
simpleTickets: {
  ticketId: string
  ticketCode: string
  
  // Relationships
  eventId: Id<"events">
  eventDayId?: Id<"eventDays">
  purchaseId: Id<"purchases">
  
  // Type info
  ticketType: string              // Display name
  ticketTypeId?: Id<"dayTicketTypes">
  seatLabel?: string              // For tables
  tableName?: string              // For tables
  
  // Bundle support
  isBundleTicket?: boolean
  bundleId?: Id<"ticketBundles">
  validDays?: string              // JSON array
}
```

---

## Business Logic

### Capacity Allocation
```typescript
function allocateCapacity(totalCapacity: number, ticketTypes: TicketType[]) {
  const sum = ticketTypes.reduce((acc, type) => acc + type.quantity, 0)
  if (sum !== totalCapacity) {
    throw new Error(`Allocation (${sum}) must equal capacity (${totalCapacity})`)
  }
  // Create ticket type records
}
```

### Table Creation
```typescript
function createTableFromTickets(ticketTypeId: string, seats: number) {
  const ticketType = getTicketType(ticketTypeId)
  
  // Validate availability
  if (ticketType.availableQuantity < seats) {
    throw new Error("Not enough tickets available")
  }
  
  // Reduce available tickets
  ticketType.availableQuantity -= seats
  ticketType.tableAllocations += seats
  
  // Create table config
  return createTableConfig({...})
}
```

### Bundle Availability
```typescript
function isBundleAvailable(bundle: Bundle): boolean {
  for (const component of bundle.components) {
    const available = getAvailableTickets(component.dayId, component.ticketType)
    if (available === 0) return false
  }
  return true
}
```

### Dynamic Pricing
```typescript
function getCurrentPrice(ticketType: TicketType): number {
  if (ticketType.hasEarlyBird && Date.now() < ticketType.earlyBirdEndDate) {
    return ticketType.earlyBirdPrice
  }
  return ticketType.price
}
```

### Purchase Individual Ticket
```typescript
function purchaseIndividualTicket(ticketTypeId: string, quantity: number) {
  const ticketType = getTicketType(ticketTypeId)
  
  // Check availability
  if (ticketType.availableQuantity < quantity) {
    throw new Error("Not enough tickets available")
  }
  
  // Create purchase record
  const purchase = createPurchase({
    purchaseType: "individual",
    ticketTypeId,
    quantity,
    itemName: ticketType.name,
    totalAmount: getCurrentPrice(ticketType) * quantity
  })
  
  // Generate tickets
  for (let i = 0; i < quantity; i++) {
    createSimpleTicket({
      purchaseId: purchase.id,
      ticketType: ticketType.name,
      ticketTypeId
    })
  }
  
  // Update availability
  ticketType.availableQuantity -= quantity
  ticketType.soldCount += quantity
}
```

---

## User Experience

### Event Organizer Flow
1. Choose event type (single/multi/save the date)
2. Enter basic info and location
3. Define total capacity
4. Break down into ticket types
5. Set pricing (with optional early bird)
6. Create tables for private sales (optional)
7. For multi-day: Create bundles
8. Review and publish

### Customer Purchase Flow

#### What They See
```
Summer Dance Weekend
July 14-15, 2025

BEST VALUE - BUNDLES
┌─────────────────────────┐
│ Weekend VIP Pass        │
│ All 3 events            │
│ $145 (Save $25!)        │
│ [Purchase]              │
└─────────────────────────┘

INDIVIDUAL EVENTS
Friday Night: VIP $50 (40 left), GA $25 (150 left)
Saturday Workshop: $35 (50 left)
Saturday Night: VIP $60 (60 left), GA $30 (175 left)
```

#### Dynamic Updates
- Bundle disappears when any component sells out
- Real-time inventory updates
- Automatic early bird pricing based on date
- Clear "X tickets left" messaging

### Table Purchase (Private)
- Organizer sends private link or processes manually
- Buyer receives individual tickets for each seat
- Each ticket has unique QR code
- Tickets are shareable

---

## Critical Rules

### Order Matters
1. **Location → Capacity** (venue determines max)
2. **Capacity → Tickets** (must sum correctly)
3. **Events → Bundles** (can't bundle non-existent)
4. **Tickets → Tables** (subtract from inventory)

### Inventory Management
- Individual ticket counts are THE source of truth
- Bundles don't have separate inventory
- Tables reduce available public tickets
- Real-time validation prevents overselling

### Pricing Rules
- Early bird automatically applied based on date
- Bundles show savings amount
- Tables can have group discount
- Platform fees calculated on all sales

---

## Testing Checklist

### Single Event
- [ ] Create event with 200 capacity
- [ ] Allocate 100 VIP, 100 GA
- [ ] Set early bird pricing
- [ ] Create table from VIP pool
- [ ] Verify remaining inventory correct
- [ ] Purchase individual tickets
- [ ] Verify early bird applies before cutoff

### Multi-Day Event
- [ ] Create 3-day event series
- [ ] Different locations for some days
- [ ] Create auto bundles (GA, VIP)
- [ ] Create custom bundle
- [ ] Purchase bundle
- [ ] Sell out one day
- [ ] Verify bundle becomes unavailable
- [ ] Purchase remaining individual tickets

### Edge Cases
- [ ] Total allocation ≠ capacity (should error)
- [ ] Create table > available tickets (should error)
- [ ] Purchase more than available (should error)
- [ ] Bundle with sold out component (should be hidden)
- [ ] Early bird after cutoff date (regular price)

---

## Implementation Status

### ✅ Completed
- Database schema updates
- Table purchase system
- Bundle purchase system
- Multi-day event support

### 🚧 In Progress
- Individual ticket purchases (needs migration from old system)
- Event creation UI flow
- Dynamic bundle availability checker

### 📋 TODO
- EventTypeSelector component
- SingleEventFlow components
- MultiDayEventFlow components
- Capacity validation
- Early bird price switching
- Admin dashboard for table sales

---

*Last Updated: 2025-08-24*
*Version: 1.0.0*