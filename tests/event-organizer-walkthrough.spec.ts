import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { EventCreationPage } from './pages/EventCreationPage';
import { testAccounts, testEvents } from './helpers/test-data';

// Test configuration
test.use({
  baseURL: process.env.TEST_BASE_URL || 'https://stepperslife.com',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
});

// Store test results
const testResults: { 
  step: string; 
  status: 'pass' | 'fail'; 
  error?: string;
  screenshot?: string;
}[] = [];

test.describe('SteppersLife Event Organizer Full Walkthrough', () => {
  let loginPage: LoginPage;
  let eventPage: EventCreationPage;
  let createdEventIds: string[] = [];

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    eventPage = new EventCreationPage(page);
    
    // Set larger viewport for better visibility
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(async () => {
    // Generate test report
    console.log('\n========== TEST RESULTS SUMMARY ==========');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(r => r.status === 'pass').length}`);
    console.log(`Failed: ${testResults.filter(r => r.status === 'fail').length}`);
    console.log('\nCreated Event IDs:', createdEventIds);
    console.log('\nDetailed Results:');
    testResults.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${result.step}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('1.1 Sign up new account', async ({ page }) => {
      try {
        await page.goto('/auth/signup');
        
        // Fill signup form
        await page.fill('input#name', 'Test Organizer');
        await page.fill('input#email', `test-${Date.now()}@example.com`);
        await page.fill('input#password', 'TestPass123!');
        await page.fill('input#confirmPassword', 'TestPass123!');
        
        // Submit
        await page.click('button:has-text("Sign Up")');
        
        // Check for success or already exists error
        const url = page.url();
        if (url.includes('dashboard') || url.includes('home')) {
          testResults.push({ step: 'Sign up new account', status: 'pass' });
        } else {
          const error = await page.locator('.bg-red-50').textContent();
          testResults.push({ 
            step: 'Sign up new account', 
            status: 'fail',
            error: error || 'Sign up failed'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Sign up new account', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('1.2 Login with existing account', async ({ page }) => {
      try {
        await loginPage.goto();
        await loginPage.loginWithCredentials(testAccounts.organizer.email, testAccounts.organizer.password);
        
        // Wait for navigation
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('dashboard') || url.includes('seller')) {
          testResults.push({ step: 'Login with existing account', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Login with existing account', 
            status: 'fail',
            error: `Unexpected URL: ${url}`
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Login with existing account', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('1.3 Quick login as admin', async ({ page }) => {
      try {
        await loginPage.quickLogin('admin');
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('dashboard')) {
          testResults.push({ step: 'Quick login as admin', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Quick login as admin', 
            status: 'fail',
            error: `Failed to reach dashboard: ${url}`
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Quick login as admin', 
          status: 'fail',
          error: error.message
        });
      }
    });
  });

  test.describe('Event Creation Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each event creation test
      await loginPage.quickLogin('organizer');
      await page.waitForTimeout(2000);
    });

    test('2.1 Create Dance Workshop (Single-Day with Tickets)', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        // Select event type
        await eventPage.selectEventType('single');
        
        // Fill basic information
        await eventPage.fillBasicInfo({
          name: testEvents.workshop.name,
          description: testEvents.workshop.description,
          location: testEvents.workshop.location,
          address: testEvents.workshop.address,
          city: testEvents.workshop.city,
          state: testEvents.workshop.state,
          postalCode: testEvents.workshop.postalCode
        });
        
        // Select categories
        await eventPage.selectCategories(testEvents.workshop.categories);
        
        // Set date
        await eventPage.selectDate(testEvents.workshop.eventDate, testEvents.workshop.eventTime);
        
        // Configure ticketing
        await eventPage.setTicketingOption('selling_tickets');
        
        // Add tickets
        for (const ticket of testEvents.workshop.tickets) {
          await eventPage.addTicketType(ticket);
        }
        
        // Submit
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        // Check success
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Dance Workshop', status: 'pass' });
          
          // Take screenshot of created event
          await page.screenshot({ 
            path: `tests/screenshots/workshop-event-${eventId}.png`,
            fullPage: true 
          });
        } else {
          testResults.push({ 
            step: 'Create Dance Workshop', 
            status: 'fail',
            error: 'Failed to create event'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Dance Workshop', 
          status: 'fail',
          error: error.message
        });
        await page.screenshot({ 
          path: 'tests/screenshots/workshop-error.png',
          fullPage: true 
        });
      }
    });

    test('2.2 Create Salsa Night Party (With Tables)', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        await eventPage.selectEventType('single');
        
        await eventPage.fillBasicInfo({
          name: testEvents.partyWithTables.name,
          description: testEvents.partyWithTables.description,
          location: testEvents.partyWithTables.location,
          address: testEvents.partyWithTables.address,
          city: testEvents.partyWithTables.city,
          state: testEvents.partyWithTables.state,
          postalCode: testEvents.partyWithTables.postalCode
        });
        
        await eventPage.selectCategories(testEvents.partyWithTables.categories);
        await eventPage.selectDate(testEvents.partyWithTables.eventDate, testEvents.partyWithTables.eventTime);
        await eventPage.setTicketingOption('selling_tickets');
        
        // Add table configurations if available
        if (testEvents.partyWithTables.tables) {
          for (const table of testEvents.partyWithTables.tables) {
            await eventPage.addTableConfiguration(table);
          }
        }
        
        // Add regular tickets
        for (const ticket of testEvents.partyWithTables.tickets) {
          await eventPage.addTicketType(ticket);
        }
        
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Salsa Night Party', status: 'pass' });
          
          await page.screenshot({ 
            path: `tests/screenshots/party-event-${eventId}.png`,
            fullPage: true 
          });
        } else {
          testResults.push({ 
            step: 'Create Salsa Night Party', 
            status: 'fail',
            error: 'Failed to create event'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Salsa Night Party', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('2.3 Create Multi-Day Festival', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        await eventPage.selectEventType('multi_day');
        
        await eventPage.fillBasicInfo({
          name: testEvents.multiDayFestival.name,
          description: testEvents.multiDayFestival.description
        });
        
        await eventPage.selectCategories(testEvents.multiDayFestival.categories);
        await eventPage.selectDateRange(
          testEvents.multiDayFestival.startDate,
          testEvents.multiDayFestival.endDate
        );
        
        // Note: Multi-day event flow might have additional steps
        // This would need to be expanded based on actual UI
        
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Multi-Day Festival', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Create Multi-Day Festival', 
            status: 'fail',
            error: 'Failed to create multi-day event'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Multi-Day Festival', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('2.4 Create Free Community Event', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        await eventPage.selectEventType('single');
        
        await eventPage.fillBasicInfo({
          name: testEvents.freeEvent.name,
          description: testEvents.freeEvent.description,
          location: testEvents.freeEvent.location,
          address: testEvents.freeEvent.address,
          city: testEvents.freeEvent.city,
          state: testEvents.freeEvent.state,
          postalCode: testEvents.freeEvent.postalCode
        });
        
        await eventPage.selectCategories(testEvents.freeEvent.categories);
        await eventPage.selectDate(testEvents.freeEvent.eventDate, testEvents.freeEvent.eventTime);
        
        // Set as no tickets (just posting)
        await eventPage.setTicketingOption('no_tickets');
        await eventPage.setDoorPrice(testEvents.freeEvent.doorPrice);
        
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Free Community Event', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Create Free Community Event', 
            status: 'fail',
            error: 'Failed to create free event'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Free Community Event', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('2.5 Create Competition with Early Bird', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        await eventPage.selectEventType('single');
        
        await eventPage.fillBasicInfo({
          name: testEvents.competition.name,
          description: testEvents.competition.description,
          location: testEvents.competition.location,
          address: testEvents.competition.address,
          city: testEvents.competition.city,
          state: testEvents.competition.state,
          postalCode: testEvents.competition.postalCode
        });
        
        await eventPage.selectCategories(testEvents.competition.categories);
        await eventPage.selectDate(testEvents.competition.eventDate, testEvents.competition.eventTime);
        await eventPage.setTicketingOption('selling_tickets');
        
        // Add tickets with early bird pricing
        for (const ticket of testEvents.competition.tickets) {
          await eventPage.addTicketType(ticket);
        }
        
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Competition Event', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Create Competition Event', 
            status: 'fail',
            error: 'Failed to create competition'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Competition Event', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('2.6 Create Dance Cruise (Travel Event)', async ({ page }) => {
      try {
        await eventPage.goto();
        await page.waitForTimeout(2000);
        
        await eventPage.selectEventType('multi_day');
        
        await eventPage.fillBasicInfo({
          name: testEvents.cruise.name,
          description: testEvents.cruise.description,
          location: testEvents.cruise.location,
          address: testEvents.cruise.address
        });
        
        await eventPage.selectCategories(testEvents.cruise.categories);
        await eventPage.selectDateRange(
          testEvents.cruise.startDate,
          testEvents.cruise.endDate
        );
        
        // Note: Custom seating/cabin configuration might need special handling
        
        await eventPage.submitEvent();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        if (url.includes('/event/')) {
          const eventId = await eventPage.getEventId();
          createdEventIds.push(eventId);
          testResults.push({ step: 'Create Dance Cruise', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Create Dance Cruise', 
            status: 'fail',
            error: 'Failed to create cruise event'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Create Dance Cruise', 
          status: 'fail',
          error: error.message
        });
      }
    });
  });

  test.describe('Ticket Purchase Flow', () => {
    test('3.1 Purchase tickets for an event', async ({ page }) => {
      try {
        // Navigate to first created event if available
        if (createdEventIds.length > 0) {
          await page.goto(`/event/${createdEventIds[0]}`);
        } else {
          // Try to find any event
          await page.goto('/events');
          await page.click('.event-card:first-child');
        }
        
        await page.waitForTimeout(2000);
        
        // Look for buy tickets button
        const buyButton = page.locator('button:has-text("Buy Tickets"), button:has-text("Get Tickets")');
        if (await buyButton.count() > 0) {
          await buyButton.click();
          await page.waitForTimeout(2000);
          
          // Select ticket quantity
          const quantityInput = page.locator('input[type="number"]').first();
          if (await quantityInput.count() > 0) {
            await quantityInput.fill('2');
          }
          
          // Proceed to checkout
          await page.click('button:has-text("Checkout"), button:has-text("Continue")');
          await page.waitForTimeout(2000);
          
          testResults.push({ step: 'Purchase tickets', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Purchase tickets', 
            status: 'fail',
            error: 'No ticketed events available'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Purchase tickets', 
          status: 'fail',
          error: error.message
        });
      }
    });
  });

  test.describe('Event Management', () => {
    test('4.1 View seller dashboard', async ({ page }) => {
      try {
        await loginPage.quickLogin('organizer');
        await page.goto('/seller/dashboard');
        await page.waitForTimeout(2000);
        
        // Check for dashboard elements
        const hasStats = await page.locator('text=/Total Events|Revenue|Tickets Sold/i').count() > 0;
        
        if (hasStats) {
          testResults.push({ step: 'View seller dashboard', status: 'pass' });
          await page.screenshot({ 
            path: 'tests/screenshots/seller-dashboard.png',
            fullPage: true 
          });
        } else {
          testResults.push({ 
            step: 'View seller dashboard', 
            status: 'fail',
            error: 'Dashboard not loading properly'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'View seller dashboard', 
          status: 'fail',
          error: error.message
        });
      }
    });

    test('4.2 Edit an event', async ({ page }) => {
      try {
        await page.goto('/seller/events');
        await page.waitForTimeout(2000);
        
        // Click edit on first event
        const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        if (await editButton.count() > 0) {
          await editButton.click();
          await page.waitForTimeout(2000);
          
          // Make a simple edit
          const descInput = page.locator('textarea').first();
          await descInput.fill('Updated description for testing');
          
          // Save changes
          await page.click('button:has-text("Save"), button:has-text("Update")');
          await page.waitForTimeout(2000);
          
          testResults.push({ step: 'Edit event', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Edit event', 
            status: 'fail',
            error: 'No events to edit'
          });
        }
      } catch (error) {
        testResults.push({ 
          step: 'Edit event', 
          status: 'fail',
          error: error.message
        });
      }
    });
  });

  test.describe('Mobile QR Scanner', () => {
    test('5.1 Test QR scanner page', async ({ page }) => {
      try {
        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });
        
        if (createdEventIds.length > 0) {
          await page.goto(`/events/${createdEventIds[0]}/scan`);
        } else {
          await page.goto('/scan');
        }
        
        await page.waitForTimeout(2000);
        
        // Check for scanner elements
        const hasScanner = await page.locator('text=/Scan QR|Manual Entry|Camera/i').count() > 0;
        
        if (hasScanner) {
          testResults.push({ step: 'Test QR scanner', status: 'pass' });
          await page.screenshot({ 
            path: 'tests/screenshots/qr-scanner-mobile.png'
          });
        } else {
          testResults.push({ 
            step: 'Test QR scanner', 
            status: 'fail',
            error: 'Scanner page not loading'
          });
        }
        
        // Reset viewport
        await page.setViewportSize({ width: 1440, height: 900 });
      } catch (error) {
        testResults.push({ 
          step: 'Test QR scanner', 
          status: 'fail',
          error: error.message
        });
      }
    });
  });
});

// Additional validation tests
test.describe('Validation and Error Handling', () => {
  test('6.1 Form validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eventPage = new EventCreationPage(page);
    
    try {
      await loginPage.quickLogin('organizer');
      await eventPage.goto();
      await eventPage.selectEventType('single');
      
      // Try to submit without filling required fields
      await eventPage.submitEvent();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const hasErrors = await page.locator('text=/required|Please enter|This field/i').count() > 0;
      
      if (hasErrors) {
        testResults.push({ step: 'Form validation', status: 'pass' });
      } else {
        testResults.push({ 
          step: 'Form validation', 
          status: 'fail',
          error: 'No validation errors shown'
        });
      }
    } catch (error) {
      testResults.push({ 
        step: 'Form validation', 
        status: 'fail',
        error: error.message
      });
    }
  });

  test('6.2 Theme toggle', async ({ page }) => {
    try {
      await page.goto('/');
      
      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])');
      
      if (await themeToggle.count() > 0) {
        // Get initial theme
        const htmlClass = await page.locator('html').getAttribute('class');
        const isDark = htmlClass?.includes('dark');
        
        // Toggle theme
        await themeToggle.click();
        await page.waitForTimeout(500);
        
        // Check if theme changed
        const newHtmlClass = await page.locator('html').getAttribute('class');
        const isNowDark = newHtmlClass?.includes('dark');
        
        if (isDark !== isNowDark) {
          testResults.push({ step: 'Theme toggle', status: 'pass' });
        } else {
          testResults.push({ 
            step: 'Theme toggle', 
            status: 'fail',
            error: 'Theme did not change'
          });
        }
      } else {
        testResults.push({ 
          step: 'Theme toggle', 
          status: 'fail',
          error: 'Theme toggle not found'
        });
      }
    } catch (error) {
      testResults.push({ 
        step: 'Theme toggle', 
        status: 'fail',
        error: error.message
      });
    }
  });
});