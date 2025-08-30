# SteppersLife Event Organizer Test Suite Documentation

## Overview
Comprehensive Playwright test suite for SteppersLife.com that simulates a complete event organizer journey from account creation through event setup with various ticket types.

## Test Suite Created

### 1. Test Infrastructure
- **`.env.test`** - Test environment configuration with credentials
- **`tests/helpers/test-data.ts`** - Comprehensive test data for 6 different event types
- **`tests/pages/LoginPage.ts`** - Page object model for authentication
- **`tests/pages/EventCreationPage.ts`** - Page object model for event creation
- **`tests/event-organizer-walkthrough.spec.ts`** - Main test suite with 20+ test scenarios
- **`tests/basic-site-test.spec.ts`** - Basic connectivity tests
- **`run-walkthrough-tests.sh`** - Test runner script with reporting

### 2. Test Coverage

#### Authentication Tests
- ✅ New account registration
- ✅ Email/password login
- ✅ Quick login with test accounts
- ✅ Google OAuth login flow
- ✅ Magic link authentication
- ✅ Session persistence

#### Event Creation Tests (6 Types)

**Event 1: Dance Workshop**
- Single-day event with individual tickets
- General and VIP pricing tiers
- Early bird discount configuration
- Location: Dance Studio NYC

**Event 2: Salsa Night Party**
- Table reservation system
- VIP and regular table options
- Mixed ticketing (tables + individual)
- Location: The Grand Ballroom

**Event 3: Summer Dance Festival**
- Multi-day event (3 days)
- Bundle ticket options
- Multiple venues per day
- Weekend pass discounts

**Event 4: Community Dance**
- Free event (no online tickets)
- Door price/suggested donation
- Public park location
- Community-focused

**Event 5: Dance Competition**
- Competitor and spectator tickets
- Early bird pricing (30% discount)
- Multiple ticket categories
- Professional venue

**Event 6: Dance Cruise**
- Travel/cruise event
- Cabin selection options
- 7-day duration
- Payment plan support

#### Additional Tests
- ✅ Ticket purchase flow
- ✅ Event management dashboard
- ✅ Event editing capabilities
- ✅ Mobile QR scanner
- ✅ Form validation
- ✅ Theme toggle (light/dark)

### 3. Test Accounts Available

```javascript
// Admin Account
email: admin@stepperslife.com
password: admin123

// Test User Account  
email: test@example.com
password: test123

// Event Organizer Account
email: irawatkins@gmail.com
password: demo123
```

### 4. Running the Tests

#### Quick Start
```bash
# Run all tests
./run-walkthrough-tests.sh

# Run specific test
npx playwright test event-organizer-walkthrough.spec.ts

# Run with visible browser
npx playwright test --headed

# Run single test
npx playwright test --grep "Dance Workshop"
```

#### Test Reports
- HTML Report: `playwright-report/index.html`
- JSON Report: `test-results.json`
- Screenshots: `tests/screenshots/`
- Videos: `test-results/`

### 5. Key Features Tested

✅ **Authentication Flow**
- Account creation with validation
- Multiple login methods
- Session management

✅ **Event Creation**
- All event types (single, multi-day, save-the-date)
- Category selection (simplified checkboxes)
- Date/time picker functionality
- Location with Google Maps integration
- Image upload capabilities

✅ **Ticketing System**
- Individual ticket types
- Table/group reservations
- Early bird pricing
- Bundle creation for multi-day events
- QR code generation

✅ **Payment Integration**
- Square sandbox testing
- Checkout flow
- Payment confirmation

✅ **Mobile Features**
- QR code scanner
- Mobile-responsive design
- Touch-friendly interfaces

### 6. Known Test Considerations

1. **Square API**: Currently using mock/sandbox mode
2. **Convex Integration**: Connected to production database
3. **Google OAuth**: Requires valid credentials in .env
4. **Multi-day Events**: Full flow implementation per CLAUDE.md v3.1.0

### 7. Test Data Structure

Each test event includes:
- Event name and description
- Event type and categories
- Location details (address, city, state, zip)
- Date/time configuration
- Ticket types with pricing
- Early bird options
- Table configurations (where applicable)
- Bundle options (for multi-day events)

### 8. Page Object Models

**LoginPage**
- `goto()` - Navigate to login
- `loginWithCredentials()` - Email/password login
- `loginWithGoogle()` - OAuth login
- `quickLogin()` - Quick test account login
- `expectDashboard()` - Verify successful login

**EventCreationPage**
- `selectEventType()` - Choose event type
- `fillBasicInfo()` - Enter event details
- `selectCategories()` - Pick event categories
- `selectDate()` - Set event date/time
- `addTicketType()` - Configure tickets
- `submitEvent()` - Create the event

### 9. Test Execution Flow

1. **Setup**: Configure viewport, load test data
2. **Authentication**: Login as event organizer
3. **Event Creation**: Create 6 different event types
4. **Validation**: Verify each event created successfully
5. **Management**: Test editing and dashboard features
6. **Purchase**: Test ticket buying flow
7. **Mobile**: Test QR scanner functionality
8. **Reporting**: Generate comprehensive test report

### 10. Success Criteria

- All 6 event types create successfully
- Authentication works with all methods
- Ticket purchase flow completes
- Mobile QR scanner loads
- No critical errors in console
- Forms validate properly
- Theme toggle functions

## Next Steps

To run the complete test suite:

1. **Against Production**: 
   ```bash
   TEST_BASE_URL=https://stepperslife.com ./run-walkthrough-tests.sh
   ```

2. **Against Local Dev**:
   ```bash
   npm run dev  # In one terminal
   ./run-walkthrough-tests.sh  # In another terminal
   ```

3. **Generate Report**:
   ```bash
   npx playwright show-report
   ```

The test suite is comprehensive and ready to validate the entire SteppersLife platform from an event organizer's perspective.