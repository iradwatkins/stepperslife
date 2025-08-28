# SteppersLife Event System Testing Guide

## 🧪 Complete Test Page
**URL**: http://localhost:3001/complete-test

This page provides a comprehensive testing interface for all event creation features.

## Test Scenarios

### Test 1: Save the Date Event
1. Click "Start Test" under Save the Date
2. Fill in basic info:
   - Event name: "Summer Dance Festival 2025"
   - Description: "Save the date for our biggest festival!"
   - Select 2-3 categories
   - ✅ CHECK "Save the Date" checkbox
   - Notice location fields disappear
3. Click "Next: Ticketing"
4. Select "Door Price Only"
5. Enter door price: $30
6. Complete and review

**Expected**: Event created with no location, marked as Save the Date

### Test 2: Single Event with Tickets
1. Click "Start Test" under Single Event with Tickets
2. Fill in basic info:
   - Event name: "Miami Salsa Night"
   - Description: "Hot salsa dancing all night"
   - Categories: Social Dance, Party
   - ❌ DO NOT check Save the Date
3. Address fields:
   - Street: "123 Ocean Drive"
   - City: Type "Mia" and select "Miami, FL"
   - ZIP: "33139"
4. Date: Tomorrow, 8:00 PM
5. Click "Next: Ticketing"
6. Select "Sell Tickets Online"
7. Set capacity: 200
8. Add ticket types:
   - General Admission: $25, qty 150, early bird $20
   - VIP: $50, qty 50
9. Optional: Configure tables
10. Review and publish

**Expected**: Full event with tickets and location

### Test 3: Multi-Day Event
1. Click "Start Test" under Multi-Day Event
2. Basic info:
   - Event name: "Dance Festival Weekend"
   - Start date: This Friday
   - End date: This Sunday
   - Same location for all days: Yes
3. Configure each day:
   - Friday: Opening Party, 8 PM
   - Saturday: Workshops, 10 AM
   - Sunday: Competition, 2 PM
4. Create bundles:
   - Weekend Pass: All 3 days
5. Review and publish

**Expected**: Multi-day event with ticket bundles

### Test 4: Mobile Responsiveness
1. Resize browser to mobile width (< 640px)
2. Check:
   - Event categories show 2 columns
   - Address fields stack vertically
   - Buttons are touch-friendly size
   - Forms remain usable

## Features to Verify

### ✅ Save the Date
- Checkbox appears on Basic Info step
- When checked, location fields hide
- Works with door price only events

### ✅ Address Form
- City autocomplete works (type "New", "Los", "Chi")
- State dropdown has all US states
- ZIP code accepts only 5 digits

### ✅ Categories
- Can select up to 5 categories
- Mobile shows 2 columns
- Desktop shows 2 columns (no responsive issues)

### ✅ Ticket Configuration
- Early bird pricing option
- Table configuration
- Quantity management

### ✅ Multi-Day Events
- Date range selection
- Per-day configuration
- Bundle creation

## Quick Links

- **Complete Test Suite**: http://localhost:3001/complete-test
- **Simple Event Form**: http://localhost:3001/event-form
- **Address Form Test**: http://localhost:3001/test-address-form

## Test Data

### Demo Addresses
- 123 Ocean Drive, Miami, FL 33139
- 1600 Pennsylvania Avenue, Washington, DC 20500
- 350 5th Ave, New York, NY 10118

### Demo Event Names
- "Summer Salsa Festival"
- "Weekend Dance Workshop"
- "Annual Dance Competition"

## Success Criteria
- ✅ No hydration errors
- ✅ No console errors
- ✅ All forms submit successfully
- ✅ Data persists through all steps
- ✅ Mobile layout works correctly