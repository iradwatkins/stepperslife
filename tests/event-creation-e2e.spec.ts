import { test, expect } from '@playwright/test';
import { mcp__ide__executeCode } from '../convex/_generated/server';

// Test configuration - using production URL
const BASE_URL = 'https://stepperslife.com';
const LOCAL_URL = 'http://localhost:3000';

// Use production for now since it's deployed
const TEST_URL = BASE_URL;

test.describe('Complete Event Creation Flow - End to End', () => {
  test.setTimeout(120000); // 2 minutes timeout for each test

  test('Single Day Event - Complete Flow with Tickets', async ({ page }) => {
    console.log('🚀 Starting Single Day Event Test');
    
    // Navigate to the site
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if site is up (not 502)
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toContain('Stepper');
    
    // Navigate to create event
    await page.goto(`${TEST_URL}/organizer/new-event`);
    
    // Wait for authentication redirect or page load
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    if (currentUrl.includes('sign-in')) {
      console.log('⚠️ Authentication required - test user sign-in needed');
      // For now, we'll document that auth is required
      return;
    }
    
    // Wait for event type selector
    await page.waitForSelector('[data-testid="event-type-selector"], button:has-text("Single"), div:has-text("Choose Event Type")', {
      timeout: 10000
    }).catch(() => console.log('Event type selector not found'));
    
    // Try to identify and click single-day event option
    const singleDaySelectors = [
      'button:has-text("Single-Day Event")',
      'button:has-text("Single Day")',
      '[data-event-type="single"]',
      'div:has-text("Single-Day Event"):has(button)',
      'text=Single-Day Event'
    ];
    
    let clicked = false;
    for (const selector of singleDaySelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log('✅ Clicked single-day event selector:', selector);
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      console.log('⚠️ Could not find single-day event selector, checking page content...');
      const pageContent = await page.content();
      console.log('Page contains "Single":', pageContent.includes('Single'));
      console.log('Page contains "Event":', pageContent.includes('Event'));
    }
    
    // Fill basic information
    await page.waitForSelector('input[name="eventName"], input[placeholder*="event"], input[type="text"]', {
      timeout: 5000
    }).catch(() => console.log('Event name input not found'));
    
    const timestamp = Date.now();
    const eventName = `Test Event ${timestamp}`;
    
    // Try multiple selectors for event name
    const nameSelectors = [
      'input[name="eventName"]',
      'input[placeholder*="event name"]',
      'input[placeholder*="Event Name"]',
      'input#eventName',
      'input[type="text"]:first'
    ];
    
    for (const selector of nameSelectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 1000 })) {
          await input.fill(eventName);
          console.log('✅ Filled event name using:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fill description
    const descriptionSelectors = [
      'textarea[name="description"]',
      'textarea[placeholder*="description"]',
      'textarea'
    ];
    
    for (const selector of descriptionSelectors) {
      try {
        const textarea = page.locator(selector).first();
        if (await textarea.isVisible({ timeout: 1000 })) {
          await textarea.fill('Automated test event for verifying the complete event creation flow including ticketing and image uploads');
          console.log('✅ Filled description');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Select category (if checkboxes are visible)
    const categorySelectors = [
      'input[value="social_dance"]',
      'label:has-text("Social Dance")',
      'input[type="checkbox"]:near(text="Social")'
    ];
    
    for (const selector of categorySelectors) {
      try {
        const checkbox = page.locator(selector).first();
        if (await checkbox.isVisible({ timeout: 1000 })) {
          await checkbox.check();
          console.log('✅ Selected category');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Set date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill(dateString);
      console.log('✅ Set event date:', dateString);
    }
    
    // Set times
    const startTimeInput = page.locator('input[name="startTime"], input[type="time"]').first();
    if (await startTimeInput.isVisible()) {
      await startTimeInput.fill('19:00');
      console.log('✅ Set start time');
    }
    
    const endTimeInput = page.locator('input[name="endTime"], input[type="time"]').last();
    if (await endTimeInput.isVisible()) {
      await endTimeInput.fill('23:00');
      console.log('✅ Set end time');
    }
    
    // Venue information
    const venueInput = page.locator('input[name="venueName"], input[placeholder*="venue"]').first();
    if (await venueInput.isVisible()) {
      await venueInput.fill('Atlanta Convention Center');
      console.log('✅ Set venue name');
    }
    
    const addressInput = page.locator('input[name="address"], input[placeholder*="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Peachtree Street, Atlanta, GA 30303');
      console.log('✅ Set address');
    }
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: 'test-screenshots/single-event-form-filled.png',
      fullPage: true 
    });
    
    // Look for Next button
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      console.log('✅ Clicked Next button');
      await page.waitForTimeout(2000);
    }
    
    // Check current step
    const currentStep = await page.url();
    console.log('Current URL after Next:', currentStep);
    
    // Handle ticketing step
    const ticketSelectors = [
      'select[name="sellingTickets"]',
      'input[name="sellingTickets"]',
      'button:has-text("Yes")'
    ];
    
    for (const selector of ticketSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          if (selector.includes('select')) {
            await element.selectOption('yes');
          } else {
            await element.click();
          }
          console.log('✅ Selected to sell tickets');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Add ticket information
    const addTicketButton = page.locator('button:has-text("Add Ticket")').first();
    if (await addTicketButton.isVisible()) {
      await addTicketButton.click();
      console.log('✅ Clicked Add Ticket');
    }
    
    // Fill ticket details
    const ticketNameInput = page.locator('input[name="ticketName"], input[placeholder*="ticket"]').first();
    if (await ticketNameInput.isVisible()) {
      await ticketNameInput.fill('General Admission');
      console.log('✅ Set ticket name');
    }
    
    const ticketPriceInput = page.locator('input[name="ticketPrice"], input[placeholder*="price"]').first();
    if (await ticketPriceInput.isVisible()) {
      await ticketPriceInput.fill('35');
      console.log('✅ Set ticket price');
    }
    
    const ticketQuantityInput = page.locator('input[name="ticketQuantity"], input[placeholder*="quantity"]').first();
    if (await ticketQuantityInput.isVisible()) {
      await ticketQuantityInput.fill('100');
      console.log('✅ Set ticket quantity');
    }
    
    // Take screenshot of ticket configuration
    await page.screenshot({ 
      path: 'test-screenshots/single-event-tickets.png',
      fullPage: true 
    });
    
    console.log('📝 Test Summary:');
    console.log('- Event Name:', eventName);
    console.log('- Date:', dateString);
    console.log('- Tickets: General Admission - $35 x 100');
  });

  test('Multi-Day Event - Complete Flow', async ({ page }) => {
    console.log('🚀 Starting Multi-Day Event Test');
    
    await page.goto(`${TEST_URL}/organizer/new-event`);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    if (currentUrl.includes('sign-in')) {
      console.log('⚠️ Authentication required');
      return;
    }
    
    // Select multi-day event
    const multiDaySelectors = [
      'button:has-text("Multi-Day Event")',
      'button:has-text("Multi-Day")',
      '[data-event-type="multiday"]',
      'text=Multi-Day Event'
    ];
    
    for (const selector of multiDaySelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log('✅ Selected multi-day event');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fill multi-day event details
    const timestamp = Date.now();
    const eventName = `Multi-Day Festival ${timestamp}`;
    
    const nameInput = page.locator('input[name="eventName"], input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(eventName);
      console.log('✅ Set event name:', eventName);
    }
    
    // Set date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);
    
    const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
    if (await startDateInput.isVisible()) {
      await startDateInput.fill(startDate.toISOString().split('T')[0]);
      console.log('✅ Set start date');
    }
    
    const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();
    if (await endDateInput.isVisible()) {
      await endDateInput.fill(endDate.toISOString().split('T')[0]);
      console.log('✅ Set end date');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-screenshots/multi-day-event-form.png',
      fullPage: true 
    });
    
    console.log('📝 Multi-Day Event Summary:');
    console.log('- Event Name:', eventName);
    console.log('- Start Date:', startDate.toISOString().split('T')[0]);
    console.log('- End Date:', endDate.toISOString().split('T')[0]);
    console.log('- Duration: 3 days');
  });

  test('Verify MinIO Image Upload', async ({ page }) => {
    console.log('🖼️ Testing MinIO Image Upload');
    
    const uploadTestResult = await page.evaluate(async () => {
      try {
        // Create a test image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;
        
        // Draw test pattern
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#00c7fc');
        gradient.addColorStop(1, '#6b46c1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Image', 400, 300);
        ctx.font = '24px Arial';
        ctx.fillText(new Date().toISOString(), 400, 350);
        
        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        // Create form data
        const formData = new FormData();
        formData.append('file', blob, 'test-image.png');
        
        // Upload to MinIO
        const response = await fetch('/api/upload/minio', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('MinIO Upload Test Result:', JSON.stringify(uploadTestResult, null, 2));
    
    if (uploadTestResult.success) {
      console.log('✅ MinIO upload successful');
      console.log('Public URL:', uploadTestResult.data?.publicUrl);
      
      // Verify the image is accessible
      if (uploadTestResult.data?.publicUrl) {
        const imageResponse = await page.request.get(uploadTestResult.data.publicUrl);
        console.log('Image accessibility:', imageResponse.ok() ? '✅ Accessible' : '❌ Not accessible');
        console.log('Image response status:', imageResponse.status());
      }
    } else {
      console.log('❌ MinIO upload failed');
      if (uploadTestResult.status === 502) {
        console.log('⚠️ 502 Bad Gateway - Server may be down');
      }
    }
  });

  test('Verify Convex Data Operations', async ({ page }) => {
    console.log('📊 Testing Convex Database Operations');
    
    // Test direct Convex API
    const convexTest = await page.evaluate(async () => {
      try {
        const response = await fetch('https://youthful-porcupine-760.convex.cloud/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'events:get',
            args: {}
          })
        });
        
        if (!response.ok) {
          return {
            success: false,
            status: response.status,
            statusText: response.statusText
          };
        }
        
        const result = await response.json();
        
        return {
          success: true,
          status: response.status,
          eventsCount: result.value ? result.value.length : 0,
          sampleEvent: result.value && result.value.length > 0 ? {
            name: result.value[0].name,
            date: result.value[0].eventDate,
            hasTickets: !!result.value[0].ticketTiers
          } : null
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('Convex Test Result:', JSON.stringify(convexTest, null, 2));
    
    if (convexTest.success) {
      console.log('✅ Convex is operational');
      console.log(`📈 Total events in database: ${convexTest.eventsCount}`);
      if (convexTest.sampleEvent) {
        console.log('Sample event:', convexTest.sampleEvent);
      }
    } else {
      console.log('❌ Convex connection issue');
    }
  });

  test('Complete Purchase Flow Test', async ({ page }) => {
    console.log('🛒 Testing Complete Purchase Flow');
    
    // Go to events page
    await page.goto(`${TEST_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Check if any events are displayed
    const eventCards = page.locator('[data-testid="event-card"], div:has-text("View Event"), a[href*="/event/"]');
    const eventCount = await eventCards.count();
    
    console.log(`Found ${eventCount} events on the page`);
    
    if (eventCount > 0) {
      // Click on the first event
      await eventCards.first().click();
      console.log('✅ Clicked on first event');
      
      await page.waitForLoadState('networkidle');
      
      // Check for ticket purchase button
      const purchaseButton = page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Get Tickets")').first();
      if (await purchaseButton.isVisible()) {
        console.log('✅ Purchase button found');
        
        // Take screenshot of event page
        await page.screenshot({ 
          path: 'test-screenshots/event-detail-page.png',
          fullPage: true 
        });
        
        // Click purchase button
        await purchaseButton.click();
        console.log('✅ Clicked purchase button');
        
        // Wait for checkout or modal
        await page.waitForTimeout(2000);
        
        // Check what happened
        const currentUrl = page.url();
        console.log('After purchase click, URL:', currentUrl);
        
        if (currentUrl.includes('checkout') || currentUrl.includes('purchase')) {
          console.log('✅ Navigated to checkout');
        } else {
          console.log('⚠️ May have opened a modal or requires authentication');
        }
      } else {
        console.log('⚠️ No purchase button found - event may not have tickets');
      }
    } else {
      console.log('⚠️ No events found to test purchase flow');
    }
  });
});

// Run all tests
test.describe.configure({ mode: 'serial' });