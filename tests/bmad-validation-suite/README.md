# BMAD Validation Test Suite

## 🎯 Purpose
Comprehensive, non-destructive validation suite for the SteppersLife platform following the BMAD (Break Make Agile Document) methodology. These tests validate all critical workflows without modifying production data.

## 🏗️ Test Structure

### Test Files (in execution order):
1. **00-smoke-tests.spec.ts** - System health checks (read-only)
2. **01-event-creation-flow.spec.ts** - Single event creation with tickets and tables
3. **02-multi-day-events.spec.ts** - Multi-day events with bundles
4. **03-reseller-program.spec.ts** - Affiliate/reseller functionality
5. **04-purchase-validation.spec.ts** - Customer purchase workflows
6. **05-organizer-dashboard.spec.ts** - Event management dashboard

### Test Data Convention
All test data is prefixed with `TEST-BMAD-` followed by a timestamp to ensure:
- Easy identification of test data
- No interference with production data
- Simple cleanup if needed

## 🚀 Running the Tests

### Prerequisites
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install chromium
```

### Run All Tests
```bash
# Run complete validation suite
npx playwright test tests/bmad-validation-suite

# Run with HTML report
npx playwright test tests/bmad-validation-suite --reporter=html

# Run specific test file
npx playwright test tests/bmad-validation-suite/00-smoke-tests.spec.ts
```

### Run in Different Environments
```bash
# Local development
BASE_URL=http://localhost:3000 npx playwright test

# Production (be careful!)
BASE_URL=https://stepperslife.com npx playwright test
```

## 📊 Test Coverage

### Events
✅ Single-day event creation
✅ Multi-day event creation
✅ Event categories
✅ Door price only events
✅ Events with tickets
✅ Events with VIP tables
✅ Bundle creation for multi-day events

### Tickets & Purchasing
✅ Single ticket purchase
✅ Multiple ticket purchase
✅ Table/group purchases
✅ QR code generation
✅ 6-character ticket codes
✅ Checkout form validation
✅ Sold out handling

### Reseller Program
✅ Creating resellers
✅ Referral code generation
✅ Affiliate link tracking
✅ Commission calculations
✅ Multiple resellers with different rates

### Organizer Dashboard
✅ Event management
✅ Attendee management
✅ Sales analytics
✅ Revenue tracking
✅ QR scanner access
✅ Event editing
✅ Payout information

## 🔍 Test Helpers

The `test-helpers.ts` file provides:
- Test user credentials
- Event templates
- Ticket configurations
- Table configurations
- Helper methods for common actions

## 📝 Important Notes

1. **Non-Destructive**: Tests create clearly marked test data only
2. **Sequential Execution**: Tests run one at a time to avoid conflicts
3. **Screenshots**: Automatic screenshots on failure for debugging
4. **Test Prefix**: All test events start with `TEST-BMAD-`
5. **Timestamps**: Each test event includes a timestamp for uniqueness

## 🐛 Debugging

### View Test Results
```bash
# Open HTML report
npx playwright show-report test-results/html-report

# View screenshots
ls test-results/screenshots/

# Check JSON results
cat test-results/results.json
```

### Run in Debug Mode
```bash
# Run with Playwright Inspector
PWDEBUG=1 npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

## ⚠️ Cleanup

Test events are prefixed with `TEST-BMAD-` for easy identification. 
To clean up test data:

1. Login as admin
2. Go to event management
3. Search for "TEST-BMAD"
4. Delete or cancel test events as needed

## 🔒 Security

- Test credentials are stored in `test-helpers.ts`
- Never commit real user credentials
- Use test payment modes only
- Don't run against production without permission

## 📈 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run BMAD Tests
  run: |
    npm ci
    npx playwright install chromium
    npx playwright test tests/bmad-validation-suite
```

## 🤝 Contributing

When adding new tests:
1. Follow the naming convention (XX-feature-name.spec.ts)
2. Use the TEST-BMAD prefix for all test data
3. Make tests non-destructive
4. Update this README with new coverage

---

Created: 2025-09-01
Last Updated: 2025-09-01
Version: 1.0.0