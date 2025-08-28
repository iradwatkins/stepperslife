# 🎫 BMAD Documentation: Multi-Day Events Implementation
**BMAD Version**: 3.1  
**Component**: Multi-Day Event Support with Manual Bundle Management  
**Date**: 2025-08-28  
**Status**: ✅ Implemented  

---

## 📋 BMAD Method Overview

### 1. Business Requirements (B)

**Problem Statement**: Event organizers need to create multi-day events (festivals, conferences, workshops) and offer bundled ticket packages with discounts, while maintaining full control over ticket and bundle creation.

**User Stories**:
1. > "As an event organizer, I want to create a 3-day festival where I manually configure tickets for each day and create my own bundles."
2. > "As an organizer, I want early bird pricing to be an option on any ticket type, not a separate ticket."
3. > "As an organizer, I want simple date inputs and full control - no auto-generation of tickets or bundles."

**Success Criteria**:
- ✅ Support events up to 30 days long
- ✅ Different venues per day option
- ✅ Manual ticket creation for each day
- ✅ Manual bundle creation with custom pricing
- ✅ Early bird pricing as ticket option
- ✅ Simple date/time inputs throughout
- ✅ No auto-generation of content

---

### 2. Method Selection (M)

**Chosen Approach**: Manual control with simple interfaces
- Organizers create everything manually
- Simple HTML inputs over complex components
- No automatic generation of tickets/bundles
- Clear step-by-step workflow

**UI Framework**: React with simple components
- Native HTML date/time inputs
- Checkbox grids for multi-select
- Step-based form flow
- No complex date pickers or popovers

**Implementation Strategy**: 
- Keep it simple and manual
- Give organizers full control
- No "magic" or auto-generation

---

### 3. Architecture Design (A)

```
┌─────────────────────────────────────────┐
│         Event Type Selection             │
│                                          │
│  ⚪ Single Event                         │
│  ⚪ Multi-Day Event                      │  
│  ⚪ Save the Date                        │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      Multi-Day Event Flow (6 Steps)     │
│                                          │
│  1. Basic Info                           │
│     - Name, Description, Categories      │
│     - Start Date (simple input)          │
│     - End Date (simple input)            │
│     - Same Location? checkbox            │
│                                          │
│  2. Ticketing Decision                   │
│     - Selling tickets online?            │
│     - Or just posting with door price?   │
│                                          │
│  3. Day Configuration                    │
│     - Configure each day individually    │
│     - Location (if different per day)    │
│     - Times                              │
│     - Manual ticket creation             │
│     - Early bird option per ticket       │
│                                          │
│  4. Bundle Creation (Optional)           │
│     - Manually create bundles            │
│     - Select which tickets to include    │
│     - Set custom pricing                 │
│     - Skip if not needed                 │
│                                          │
│  5. Table Configuration (Optional)       │
│     - Private table sales                │
│     - Custom configurations              │
│                                          │
│  6. Review & Publish                     │
│     - Review all settings                │
│     - Revenue estimates                  │
│     - Publish event                      │
└─────────────────────────────────────────┘
```

---

### 4. Development Process (D)

#### Phase 1: Component Architecture ✅
```typescript
// Core Components Created
- EventTypeSelector: Choose event type
- MultiDayEventFlow: Main orchestrator
- MultiDayBasicInfoStep: Basic event details
- TicketDecisionStep: Online vs door sales
- MultiDayTicketsStep: Day-by-day configuration
- BundleCreationStep: Manual bundle creation
- TableConfigStep: Table configuration
- MultiDayReviewStep: Final review
```

#### Phase 2: Event Type Selection ✅
```typescript
// /app/seller/new-event/page.tsx
const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);

// First show EventTypeSelector
if (!eventType) {
  return <EventTypeSelector onSelect={setEventType} />;
}

// Then render appropriate flow
{eventType === "multi_day" && (
  <MultiDayEventFlow onComplete={handleComplete} onCancel={handleCancel} />
)}
```

#### Phase 3: Multi-Day Configuration ✅
```typescript
// Key features implemented:
- Simple date inputs (type="date")
- Manual ticket creation per day
- Copy tickets from previous day
- Copy tickets to all days
- Early bird as checkbox option
- Different venues per day support
```

#### Phase 4: Bundle Management ✅
```typescript
// Manual bundle creation:
- Add/remove bundles manually
- Select tickets from any days
- Set custom bundle pricing
- Automatic savings calculation
- Optional quantity limits
- Skip entirely if not needed
```

---

## 🔧 Technical Implementation

### Component Hierarchy
```
/seller/new-event
  └── EventTypeSelector
       └── single → SingleEventFlow
       └── multi_day → MultiDayEventFlow
            ├── MultiDayBasicInfoStep
            ├── TicketDecisionStep
            ├── MultiDayTicketsStep
            ├── BundleCreationStep
            ├── TableConfigStep
            └── MultiDayReviewStep
```

### Data Structure
```typescript
// MultiDayEventData
{
  name: string;
  description: string;
  startDate: string;  // Simple date string
  endDate: string;    // Simple date string
  sameLocation: boolean;
  categories: string[];
  isTicketed: boolean;
  doorPrice?: number;
  // Location fields if same for all days
}

// DayConfiguration
{
  id: string;
  dayNumber: number;
  date: string;
  dayLabel: string;  // "Day 1 - Friday, Nov 7"
  startTime: string;
  endTime?: string;
  ticketTypes: TicketType[];
  // Location fields if different per day
}

// TicketType with Early Bird
{
  id: string;
  name: string;
  quantity: number;
  price: number;
  hasEarlyBird: boolean;  // Just a checkbox
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
}

// Bundle (Manual Creation)
{
  id: string;
  name: string;
  description?: string;
  selectedTickets: Array<{
    dayId: string;
    ticketTypeId: string;
    ticketName: string;
    dayLabel: string;
  }>;
  bundlePrice: number;  // Set manually
  maxQuantity?: number;
}
```

### Key Implementation Details

#### 1. Simple Date/Time Inputs
```tsx
// No complex date pickers - just HTML inputs
<input type="date" value={data.startDate} onChange={handleChange} />
<input type="time" value={day.startTime} onChange={handleChange} />
```

#### 2. Early Bird as Option
```tsx
// Not a separate ticket - just an option
<label>
  <input type="checkbox" checked={ticket.hasEarlyBird} />
  Enable Early Bird Pricing
</label>
{ticket.hasEarlyBird && (
  <>
    <input type="number" placeholder="Early Bird Price" />
    <input type="date" placeholder="Early Bird End Date" />
  </>
)}
```

#### 3. Manual Bundle Creation
```tsx
// Organizer manually selects tickets and sets price
bundles.map(bundle => (
  <div>
    <input value={bundle.name} placeholder="Bundle Name" />
    <input type="number" value={bundle.bundlePrice} />
    {days.map(day => 
      day.ticketTypes.map(ticket => (
        <checkbox 
          checked={isSelected(bundle, day, ticket)}
          onChange={() => toggleSelection(bundle, day, ticket)}
        />
      ))
    )}
  </div>
))
```

---

## 📝 User Experience Flow

### Creating a Multi-Day Event

1. **Select Event Type**
   - Choose "Multi-Day Event" from clear options
   - Visual icons and descriptions

2. **Basic Information**
   - Enter event name and description
   - Select categories (checkbox grid, max 5)
   - Input start date and end date
   - Choose if same location for all days

3. **Ticketing Decision**
   - "Are you selling tickets online?"
   - If no: just enter door price
   - If yes: continue to ticket configuration

4. **Configure Each Day**
   - Tab navigation between days
   - Set times for each day
   - Add location if different per day
   - Manually create ticket types
   - Enable early bird pricing per ticket
   - Copy options for efficiency

5. **Create Bundles (Optional)**
   - Start with no bundles
   - Add bundles one by one
   - Select tickets to include
   - Set custom pricing
   - See automatic savings calculation
   - Skip entirely if not needed

6. **Review & Publish**
   - See complete event summary
   - Revenue estimates
   - Warning about unchangeable items
   - Publish button

---

## 🚀 Deployment Status

### Completed Components ✅
- [x] EventTypeSelector
- [x] MultiDayEventFlow orchestrator
- [x] MultiDayBasicInfoStep
- [x] TicketDecisionStep
- [x] MultiDayTicketsStep
- [x] BundleCreationStep
- [x] TableConfigStep
- [x] MultiDayReviewStep
- [x] Integration with new event page

### File Locations
```
/components/events/
  ├── EventTypeSelector.tsx
  ├── MultiDayEventFlow.tsx
  └── steps/
      ├── MultiDayBasicInfoStep.tsx
      ├── TicketDecisionStep.tsx
      ├── MultiDayTicketsStep.tsx
      ├── BundleCreationStep.tsx
      ├── TableConfigStep.tsx
      └── MultiDayReviewStep.tsx

/app/seller/new-event/page.tsx (updated)
```

### Pending Integration
- [ ] Connect to Convex backend for persistence
- [ ] Implement createMultiDayEvent mutation
- [ ] Handle bundle purchase flow
- [ ] Update QR scanning for multi-day validation

---

## 🔑 Key Differences from Original Design

1. **No Auto-Generation**
   - Original: Auto-generate GA/VIP bundles
   - Implemented: Manual bundle creation only

2. **Early Bird Pricing**
   - Original: Separate ticket type
   - Implemented: Option on any ticket

3. **UI Components**
   - Original: Complex date pickers
   - Implemented: Simple HTML inputs

4. **Control Philosophy**
   - Original: Smart defaults and automation
   - Implemented: Full manual control

---

## 📊 Testing Checklist

### Unit Testing
- [ ] Date validation (start < end, max 30 days)
- [ ] Ticket price validation
- [ ] Bundle pricing calculations
- [ ] Early bird date validation
- [ ] Category selection limits

### Integration Testing
- [ ] Complete flow navigation
- [ ] Data persistence between steps
- [ ] Back button functionality
- [ ] Skip button on optional steps
- [ ] Form validation errors

### User Acceptance
- [ ] Create 3-day workshop series
- [ ] Create week-long festival
- [ ] Create event with door price only
- [ ] Create bundles with savings
- [ ] Use copy functionality

---

## 🔄 Next Steps

1. **Backend Integration**
   - Create Convex mutations
   - Handle multi-day event storage
   - Implement bundle logic

2. **Purchase Flow**
   - Update ticket purchase UI
   - Show bundles with savings
   - Handle bundle checkout

3. **QR/Scanning**
   - Multi-day ticket validation
   - Per-day check-in tracking
   - Bundle recognition

4. **Admin Features**
   - Multi-day event management
   - Bundle sales reporting
   - Day-by-day analytics

---

*Implementation completed by Claude Code using the BMAD Method - 2025-08-28*
*Following user requirements for manual control and simple interfaces*