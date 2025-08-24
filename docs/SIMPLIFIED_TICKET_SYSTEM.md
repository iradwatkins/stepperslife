# SteppersLife Simplified Ticket System Documentation

## Overview
The SteppersLife platform has been updated with a simplified ticket system that removes the complexity of the waiting list system and introduces table/group purchases with individual ticket generation.

## Date: 2025-08-24
## Version: 2.0.0

---

## 🎫 Core Features

### 1. Simplified Ticket System
- **No Login Required** for ticket recipients
- **Shareable Ticket Links** - Each ticket has a unique URL
- **QR Codes** - Automatically generated for each ticket
- **6-Character Entry Codes** - For manual check-in
- **Table/Group Purchases** - Buy a table, get individual tickets for each seat

### 2. Event Types
Events can be configured as:
- **Just Posting an Event** - No online ticket sales, only door pricing
- **Selling Tickets** - Online ticket sales enabled
- **Custom Seating** (Coming Soon) - Advanced seating charts

### 3. Event Categories (Multi-Select)
Events can belong to multiple categories:
- Workshop
- Sets/Performance
- In The Park
- Trip/Travel
- Cruise
- Holiday Event
- Competition
- Class/Lesson
- Social Dance
- Party
- Other

---

## 📱 Mobile-Optimized Features

### QR Scanner Enhancements
```javascript
// Mobile-friendly scanner configuration
{
  videoConstraints: {
    facingMode: "environment",  // Use back camera
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  },
  rememberLastUsedCamera: true,
  showTorchButtonIfSupported: true  // Flashlight button
}
```

---

## 🗂️ Database Schema Updates

### New Tables Added

#### `tableConfigurations`
```typescript
{
  eventId: Id<"events">,
  name: string,           // "VIP Table", "General Table"
  seatCount: number,      // Number of seats
  price: number,          // Total table price
  description?: string,
  maxTables?: number,
  soldCount: number,
  isActive: boolean
}
```

#### `simpleTickets`
```typescript
{
  ticketId: string,       // Unique ID: "TKT-ABC123"
  ticketCode: string,     // 6-char code for manual entry
  qrCode: string,         // QR code data/URL
  eventId: Id<"events">,
  purchaseId: Id<"purchases">,
  seatLabel?: string,     // "Table 1, Seat 3"
  tableName: string,
  shareUrl: string,       // Public URL
  status: "valid" | "used" | "cancelled",
  scanned: boolean,
  // Event details (denormalized)
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventVenue?: string
}
```

#### `purchases`
```typescript
{
  eventId: Id<"events">,
  tableConfigId: Id<"tableConfigurations">,
  buyerEmail: string,
  buyerName: string,
  buyerPhone?: string,
  tableName: string,
  seatCount: number,
  totalAmount: number,
  paymentMethod: string,
  paymentReference: string,
  paymentStatus: string,
  referralCode?: string
}
```

#### `scanLogs`
```typescript
{
  eventId: Id<"events">,
  ticketId: string,
  scanType: "qr" | "manual",
  scanResult: "valid" | "already_used" | "invalid",
  scannedBy: string,
  scannerName: string,
  deviceInfo?: string,
  scannedAt: string
}
```

---

## 🔧 Key Components

### 1. SimplifiedPurchaseFlow Component
**Location**: `/components/SimplifiedPurchaseFlow.tsx`

Handles the complete purchase flow:
- Table selection
- Buyer information collection
- Ticket generation
- Share links display

### 2. EventCategoriesSelect Component
**Location**: `/components/EventCategoriesSelect.tsx`

Multi-select dropdown for event categories:
- Click outside to close
- Multiple category selection
- Visual checkmarks for selected items

### 3. Updated EventForm Component
**Location**: `/components/EventForm.tsx`

Enhanced with:
- Ticket sales type dropdown (top of form)
- Event categories multi-select
- Conditional field display based on ticket type
- Hydration error fixes

---

## 📍 Key Pages & Routes

### Event Creation
**Route**: `/seller/new-event`
- Ticket sales type selection
- Event categories (multi-select)
- Dynamic form fields

### Ticket Viewing (Public)
**Route**: `/ticket/[ticketId]`
- No authentication required
- Shows QR code
- Displays 6-character entry code
- Event details

### Event Scanner
**Route**: `/events/[eventId]/scan`
- QR code scanner
- Manual code entry
- Real-time attendance tracking
- Table breakdown statistics

### Test System
**Route**: `/test-ticket-system`
- Complete flow testing
- Event creation with tables
- Purchase simulation
- Ticket generation demo

---

## 🛠️ Convex Functions

### Table Management
- `tables.createTableConfig` - Create table configurations
- `tables.getTableConfigurations` - Get tables for an event
- `tables.updateTableConfig` - Update table settings

### Purchase Flow
- `purchases.purchaseTable` - Complete table purchase
- `purchases.getPurchaseWithTickets` - Get purchase details
- `purchases.getPurchasesByEmail` - Get user's purchases

### Scanning & Validation
- `scanning.getPublicTicket` - Get ticket (no auth)
- `scanning.scanTicket` - Validate and check-in
- `scanning.manualCheckIn` - Manual code entry
- `scanning.getEventAttendance` - Real-time stats

---

## 🔐 Service Worker Updates

**File**: `/public/sw.js`

- Fixed caching issues
- Graceful failure handling
- Reduced pre-cached assets
- Blue-green deployment support

---

## 🎯 Testing Checklist

### Event Creation
- [ ] Create event with "Just Posting" option
- [ ] Create event with "Selling Tickets" option
- [ ] Select multiple event categories
- [ ] Verify conditional field display

### Ticket Purchase
- [ ] Purchase table/group tickets
- [ ] Receive individual ticket links
- [ ] Verify no login required for viewing

### Scanning & Check-in
- [ ] QR code scanning on mobile
- [ ] Manual 6-character code entry
- [ ] Real-time attendance updates
- [ ] Flashlight/torch button on mobile

### Public Access
- [ ] View tickets without login
- [ ] Share ticket links
- [ ] Access QR codes

---

## 🚀 Environment Variables

```env
# Required for simplified ticket system
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
```

---

## 📝 Migration Notes

### From Old System to Simplified System
1. Old waiting list system remains but is bypassed
2. `isTicketed` field determines ticket sales behavior
3. `doorPrice` field for non-ticketed events
4. Tables and simplified tickets are separate from old ticket system

### Backward Compatibility
- Old ticket system (`tickets` table) remains intact
- New system uses `simpleTickets` table
- Events can use either system based on `isTicketed` flag

---

## 🎨 UI/UX Improvements

### Form Enhancements
1. **Selling Tickets Dropdown** - Clear labeling at top of form
2. **Dynamic Fields** - Show/hide based on selection
3. **Multi-Select Categories** - Better event classification
4. **Hydration Fix** - No more client/server mismatches

### Mobile Experience
1. **QR Scanner** - Optimized for phone cameras
2. **Torch Support** - Flashlight for dark venues
3. **Touch-Friendly** - Large tap targets
4. **Responsive Design** - Works on all screen sizes

---

## 🐛 Fixed Issues

1. ✅ "No valid ticket offer found" error
2. ✅ Infinite render loops in React
3. ✅ Service worker cache failures
4. ✅ Hydration mismatches
5. ✅ QR scanner initialization errors

---

## 📊 Database Queries

### Get Event with Tables
```typescript
const event = await convex.query(api.events.getById, { eventId });
const tables = await convex.query(api.tables.getTableConfigurations, { 
  eventId, 
  activeOnly: true 
});
```

### Purchase Table
```typescript
const result = await convex.mutation(api.purchases.purchaseTable, {
  tableConfigId,
  buyerEmail,
  buyerName,
  buyerPhone,
  paymentMethod,
  paymentReference
});
```

### Scan Ticket
```typescript
const result = await convex.mutation(api.scanning.scanTicket, {
  ticketIdentifier, // QR code or 6-char code
  eventId,
  scannedBy,
  scannerName,
  scanType: "qr" | "manual"
});
```

---

## 📚 Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Auth.js Documentation](https://authjs.dev)

---

## 🔄 Version History

### v2.0.0 (2025-08-24)
- Implemented simplified ticket system
- Added table/group purchases
- Multi-select event categories
- Mobile-optimized QR scanner
- Fixed hydration errors

### v1.0.0 (2025-08-19)
- Initial migration from Clerk to Auth.js
- Migration from Stripe to Square
- Basic event management

---

## 📞 Support

For issues or questions about the simplified ticket system:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Production URL: https://stepperslife.com
- Coolify Dashboard: http://72.60.28.175:3000

---

*This documentation was generated following the BMAD Method for comprehensive system documentation.*