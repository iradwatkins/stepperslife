# SteppersLife Platform Changelog

All notable changes to the SteppersLife platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-08-24

### Added
- 🗓️ **Modern Date/Time Picker Component**
  - Visual calendar interface using react-day-picker
  - Integrated time selection for precise event timing
  - Calendar icon button to open date selector
  - Clear button (X) to reset selection
  - Mobile-responsive design with touch support
  - BMAD Method documentation in `/docs/BMAD_DATETIME_PICKER.md`

### Changed
- **Event Creation Form**
  - Date/time field now defaults to current date and time
  - Replaced basic HTML date input with modern picker
  - Past dates are now disabled (can't select before today)
  - Improved UX with visual feedback

### Technical
- Added dependencies:
  - `react-day-picker@^9.3.0`
  - `@radix-ui/react-popover@^1.1.2`
- Created shadcn/ui components:
  - `/components/ui/date-time-picker.tsx`
  - `/components/ui/calendar.tsx`
  - `/components/ui/popover.tsx`

---

## [2.0.2] - 2025-08-24

### Added
- ✅ **Multi-Select Event Categories**
  - Converted from dropdown to checkbox grid
  - "Check all that apply" instruction
  - Shows selected count
  - Categories: Workshop, Performance, Park events, Travel, etc.

### Fixed
- Google OAuth authentication "invalid_client" error
- Prisma database "Account table does not exist" error
- Missing theme files in Docker container

---

## [2.0.1] - 2025-08-24

### Added
- 🎨 **Theme System Implementation**
  - Purple (#8B5CF6), Teal (#5EEAD4), Gold (#FCD34D) color scheme
  - Dark/Light mode toggle in header
  - Theme persistence across sessions
  - CSS variables for consistent theming

### Infrastructure
- Google OAuth credentials configured in Vault
- Google Maps API key integrated
- HashiCorp Vault for secure credential storage

---

## [2.0.0] - 2025-08-24

### Added
- 🎫 **Simplified Ticket System**
  - No login required for ticket viewing
  - Table/Group purchase functionality
  - QR codes and 6-character codes for each ticket
  - Shareable ticket links
  - Real-time scanning with attendance tracking
  - Mobile-optimized scanner with flashlight support

### Changed
- **Event Management**
  - Selling Tickets dropdown (Yes/No/Custom Seating)
  - Dynamic form fields based on ticket type
  - Door price option for non-ticketed events

### Added
- New database tables:
  - `tableConfigurations` - Table/group setups
  - `simpleTickets` - Individual tickets
  - `purchases` - Purchase records
  - `scanLogs` - Check-in tracking

---

## [1.0.0] - 2025-08-19

### Changed
- **Authentication Migration (Clerk → Auth.js)**
  - Replaced Clerk with NextAuth/Auth.js
  - Updated all authentication components
  - Migrated user sessions and sync logic

### Changed
- **Payment Migration (Stripe → Square)**
  - Replaced Stripe with Square payment processing
  - Updated webhook handlers
  - Migrated seller account management

### Removed
- All Stripe-related files and dependencies
- Clerk authentication system

---

## Documentation Standards

### BMAD Method Compliance
All major features are documented using the BMAD Method v3.0:
- **B**usiness Requirements
- **M**ethod Selection
- **A**rchitecture Design
- **D**evelopment Implementation

### Version Numbering
- **Major (X.0.0)**: Breaking changes or major feature overhauls
- **Minor (0.X.0)**: New features or significant enhancements
- **Patch (0.0.X)**: Bug fixes and minor improvements

---

*Last Updated: 2025-08-24*  
*Maintained using BMAD Method v3.0*