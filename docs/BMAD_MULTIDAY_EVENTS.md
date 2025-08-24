# 🎫 BMAD Documentation: Multi-Day Events & Ticket Bundling System
**BMAD Version**: 3.0  
**Component**: Multi-Day Event Support with Bundle Management  
**Date**: 2025-08-24  
**Status**: 🚧 In Development  

---

## 📋 BMAD Method Overview

### 1. Business Requirements (B)

**Problem Statement**: Event organizers need to create multi-day events (festivals, conferences, workshops) and offer bundled ticket packages with discounts, while maintaining a single QR code for customer convenience.

**User Stories**:
1. > "As an event organizer, I want to create a 3-day festival where customers can buy individual day passes or a discounted weekend bundle."
2. > "As a customer, I want ONE QR code that works for all the days I've purchased, not multiple tickets to manage."
3. > "As an organizer, I want to offer Save the Date events without requiring a location yet."

**Success Criteria**:
- ✅ Support events up to 30 days long
- ✅ Different venues per day option
- ✅ Automatic bundle generation (GA, VIP)
- ✅ Custom bundle creation
- ✅ Single QR for all bundle days
- ✅ Private table links for special sales
- ✅ Save the Date events (no location)

---

### 2. Method Selection (M)

**Chosen Approach**: Progressive enhancement of existing system
- Maintains backward compatibility
- Reuses existing ticket infrastructure
- Extends rather than replaces

**UI Framework**: React + Alpine.js-inspired components
- Alpine.js date picker converted to React
- Conditional form rendering
- Dynamic field validation

**Data Strategy**: JSON fields for flexibility
- Included days as JSON arrays
- Validation rules in JSON
- Extensible without schema changes

---

### 3. Architecture Design (A)

```
┌─────────────────────────────────────────┐
│            Event Creation                │
│                                          │
│  Selling Tickets? ──┬── No (+ Save Date)│
│                     │                    │
│                     ├── Yes ─┬── Single  │
│                     │        │           │
│                     │        └── Multi   │
│                     │            Day     │
│                     │                    │
│                     └── Custom Seating   │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│           Multi-Day Config               │
│                                          │
│  Same Location? ──┬── Yes (one venue)   │
│                   │                      │
│                   └── No (per-day venue) │
│                                          │
│  For Each Day:                           │
│   - Date/Time                            │
│   - Ticket Types (GA, VIP, Early)        │
│   - Pricing                              │
│   - Quantity                             │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│           Bundle Creation                │
│                                          │
│  Auto-Generated:                         │
│   - All Days GA (15% off)                │
│   - All Days VIP (15% off)               │
│                                          │
│  Custom Bundles:                         │
│   - Mix & Match Days                     │
│   - Custom Pricing                       │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Customer Purchase               │
│                                          │
│  Options:                                │
│   1. Individual Day Tickets              │
│   2. Bundle Packages (with savings)      │
│                                          │
│  Result: ONE Master QR Code              │
└─────────────────────────────────────────┘
```

---

### 4. Development Process (D)

#### Phase 1: Database Schema ✅
```typescript
// New tables added to convex/schema.ts
- eventDays: Individual day configurations
- dayTicketTypes: Ticket types per day
- ticketBundles: Bundle definitions
- bundlePurchases: Bundle purchase tracking
```

#### Phase 2: UI Components ✅
```typescript
// Components created
- EndDatePicker: Alpine.js-inspired date picker
- EventForm: Enhanced with multi-day support
- Conditional dropdowns for event modes
```

#### Phase 3: Backend Functions ✅
```typescript
// Convex functions
- multiDayEvents.ts: Day & ticket management
- bundlePurchases.ts: Bundle purchase flow
- Validation & scanning updates
```

#### Phase 4: Purchase Flow 🚧
```typescript
// To be implemented
- Bundle selection UI
- Cart with bundle savings
- Checkout integration
```

#### Phase 5: QR Scanning 🚧
```typescript
// To be implemented
- Multi-day validation
- Per-day check-in tracking
- Bundle recognition
```

---

## 🔧 Technical Implementation

### Form Hierarchy
```javascript
1. ticketSalesType dropdown
   ├── "no_tickets" 
   │   ├── [ ] Save the Date checkbox
   │   └── Door Price field
   │
   ├── "selling_tickets"
   │   ├── Event Mode dropdown
   │   │   ├── "single" (default)
   │   │   └── "multi_day"
   │   │       ├── [ ] Same Location?
   │   │       └── End Date picker
   │   └── Ticket configuration
   │
   └── "custom_seating" (private links)
```

### Bundle QR Structure
```json
{
  "type": "bundle",
  "bundleId": "bundle_ABC123",
  "masterTicketId": "BUNDLE-XYZ789",
  "validDays": ["day1_id", "day2_id", "day3_id"],
  "accessCode": "ABC123"
}
```

### Scanning Logic
```typescript
// Per-day validation
1. Scan QR/Code
2. Identify as bundle ticket
3. Check if valid for current day
4. Check if already used today
5. Mark as used for this day only
6. Allow re-use on other valid days
```

---

## 📝 Configuration Examples

### Multi-Day Festival
```javascript
{
  eventMode: "multi_day",
  startDate: "2025-11-07",
  endDate: "2025-11-09",
  sameLocation: false,
  days: [
    {
      date: "2025-11-07",
      venue: "Main Stage",
      tickets: [
        { type: "GA", price: 50, earlyBird: 40 },
        { type: "VIP", price: 100 }
      ]
    },
    {
      date: "2025-11-08",
      venue: "Conference Center",
      tickets: [
        { type: "GA", price: 50 },
        { type: "VIP", price: 100 }
      ]
    },
    {
      date: "2025-11-09",
      venue: "Park Pavilion",
      tickets: [
        { type: "GA", price: 75 },
        { type: "VIP", price: 150 }
      ]
    }
  ],
  bundles: [
    {
      name: "Weekend Pass - GA",
      includes: ["Day1-GA", "Day2-GA", "Day3-GA"],
      originalPrice: 175,
      bundlePrice: 150,
      savings: 25
    }
  ]
}
```

### Save the Date Event
```javascript
{
  ticketSalesType: "no_tickets",
  isSaveTheDate: true,
  name: "Summer Festival 2026",
  description: "Mark your calendars!",
  location: null, // Not required
  eventDate: "2026-07-01"
}
```

---

## 🎯 User Flows

### Organizer Creates Multi-Day Event
1. Select "Yes - Selling Tickets"
2. Choose "Multi-Day Event"
3. Set start and end dates
4. Answer "Same location?" 
5. Configure each day's tickets
6. Review auto-generated bundles
7. Create custom bundles (optional)
8. Publish event

### Customer Purchases Bundle
1. View multi-day event page
2. See individual days with dates/venues
3. Compare individual vs bundle pricing
4. Select bundle (save $25!)
5. Complete purchase
6. Receive ONE QR code email
7. Use same QR at each day's entrance

### Staff Scans Bundle Ticket
1. Open scanner on Day 1
2. Scan customer's QR
3. System validates for Day 1
4. Marks as "used for Day 1"
5. Customer re-uses same QR on Day 2
6. System validates for Day 2
7. Marks as "used for Day 2"

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Schema migrations tested
- [ ] Backward compatibility verified
- [ ] Bundle pricing calculations validated
- [ ] QR scanning logic tested
- [ ] Multi-venue support confirmed

### Testing Scenarios
- [ ] Single event (no changes)
- [ ] Multi-day same venue
- [ ] Multi-day different venues
- [ ] Bundle purchase flow
- [ ] QR scanning per day
- [ ] Save the Date creation
- [ ] Private table links

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check bundle generation
- [ ] Verify payment processing
- [ ] Test customer emails
- [ ] Validate scanning at events

---

## 🔐 Security Considerations

1. **Bundle Validation**
   - Cryptographically secure ticket IDs
   - Rate limiting on scanning
   - Duplicate scan prevention

2. **Private Links**
   - Unguessable tokens
   - Time-limited validity
   - Access logging

3. **Payment Security**
   - Atomic transactions
   - Rollback on failure
   - Audit trails

---

## 📊 Success Metrics

- Bundle adoption rate (target: 30%)
- Average savings per bundle ($25+)
- Scan success rate (>95%)
- Support ticket reduction (20%)
- Customer satisfaction (4.5+ stars)

---

## 🔄 Future Enhancements

1. **Phase 2**: Recurring events
2. **Phase 3**: Season passes
3. **Phase 4**: Group discounts
4. **Phase 5**: Loyalty programs

---

*Last updated by Winston (Architect) using the BMAD Method - 2025-08-24*