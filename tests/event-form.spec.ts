import { test, expect } from '@playwright/test';

test.describe('Event Form UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth/signin');
    
    // Click the admin quick login button
    await page.click('button:has-text("Admin: admin@stepperslife.com")');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Navigate to event creation
    await page.goto('http://localhost:3000/seller/new-event');
    await page.waitForLoadState('networkidle');
  });

  test('Calendar displays with properly aligned day headers', async ({ page }) => {
    // Click the date picker to open calendar
    await page.click('button:has-text("Pick a date and time")');
    
    // Wait for calendar to be visible
    await page.waitForSelector('.rdp-caption');
    
    // Check that day headers are visible and properly spaced
    const dayHeaders = await page.$$eval('.rdp-head_cell', cells => 
      cells.map(cell => ({
        text: cell.textContent?.trim(),
        position: cell.getBoundingClientRect().left
      }))
    );
    
    // Verify we have 7 day headers
    expect(dayHeaders.length).toBe(7);
    
    // Verify headers are Su, Mo, Tu, We, Th, Fr, Sa
    const expectedDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayHeaders.forEach((header, index) => {
      expect(header.text).toBe(expectedDays[index]);
    });
    
    // Verify headers are evenly spaced (not bunched together)
    for (let i = 1; i < dayHeaders.length; i++) {
      const spacing = dayHeaders[i].position - dayHeaders[i-1].position;
      expect(spacing).toBeGreaterThan(30); // Should have at least 30px between headers
      expect(spacing).toBeLessThan(60); // But not too far apart
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/calendar-alignment.png' });
  });

  test('Event Categories dropdown is functional', async ({ page }) => {
    // Click the categories dropdown
    await page.click('button:has-text("Select event categories")');
    
    // Wait for dropdown to open
    await page.waitForSelector('[role="option"]');
    
    // Click on Workshop category
    await page.click('[role="option"]:has-text("Workshop")');
    
    // Verify Workshop is selected (badge appears)
    await expect(page.locator('.badge:has-text("Workshop")')).toBeVisible();
    
    // Click on Social Dance category
    await page.click('[role="option"]:has-text("Social Dance")');
    
    // Verify both are selected
    await expect(page.locator('.badge:has-text("Workshop")')).toBeVisible();
    await expect(page.locator('.badge:has-text("Social Dance")')).toBeVisible();
    
    // Click outside to close dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    
    // Verify categories remain selected
    await expect(page.locator('.badge:has-text("Workshop")')).toBeVisible();
    await expect(page.locator('.badge:has-text("Social Dance")')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/categories-selected.png' });
  });

  test('Date selection works correctly', async ({ page }) => {
    // Click date picker
    await page.click('button:has-text("Pick a date and time")');
    
    // Wait for calendar
    await page.waitForSelector('.rdp-day');
    
    // Click on a future date (15th of current month)
    await page.click('.rdp-day:has-text("15"):not(.rdp-day_outside)');
    
    // Select a time (2:00 PM)
    await page.click('button:has-text("2:00 PM")');
    
    // Verify the date was selected
    const dateButton = await page.textContent('button:has([data-lucide="calendar"])');
    expect(dateButton).toContain('15');
    expect(dateButton).toContain('2:00 PM');
  });

  test('Multi-day event date range picker works', async ({ page }) => {
    // Select "Selling Tickets"
    await page.selectOption('select', 'selling_tickets');
    
    // Select "Multi-Day Event"
    await page.selectOption('select:nth-of-type(2)', 'multi_day');
    
    // Click date range picker
    await page.click('button:has-text("Pick a date range")');
    
    // Select start date (10th)
    await page.click('.rdp-day:has-text("10"):not(.rdp-day_outside)');
    
    // Select end date (14th)
    await page.click('.rdp-day:has-text("14"):not(.rdp-day_outside)');
    
    // Verify range is selected
    const rangeButton = await page.textContent('button:has([data-lucide="calendar"])');
    expect(rangeButton).toContain('10');
    expect(rangeButton).toContain('14');
  });

  test('Form fields are properly aligned and functional', async ({ page }) => {
    // Fill in event name
    await page.fill('input[placeholder="Enter your event name"]', 'Test Event');
    
    // Fill in description
    await page.fill('textarea[placeholder="Describe your event..."]', 'This is a test event description');
    
    // Fill in location
    await page.fill('input[placeholder="Enter event venue or address"]', '123 Main St, New York, NY');
    
    // Verify all fields have values
    await expect(page.locator('input[placeholder="Enter your event name"]')).toHaveValue('Test Event');
    await expect(page.locator('textarea[placeholder="Describe your event..."]')).toHaveValue('This is a test event description');
    await expect(page.locator('input[placeholder="Enter event venue or address"]')).toHaveValue('123 Main St, New York, NY');
    
    // Take full form screenshot
    await page.screenshot({ path: 'tests/screenshots/form-filled.png', fullPage: true });
  });

  test('Ticket configuration appears when selling tickets', async ({ page }) => {
    // Select "Selling Tickets"
    await page.selectOption('select', 'selling_tickets');
    
    // Verify ticket price and quantity fields appear
    await expect(page.locator('text=Price per Ticket')).toBeVisible();
    await expect(page.locator('text=Total Tickets Available')).toBeVisible();
    
    // Fill in price
    await page.fill('input[type="number"]:first', '50');
    
    // Fill in quantity
    await page.fill('input[type="number"]:last', '100');
    
    // Verify values
    await expect(page.locator('input[type="number"]:first')).toHaveValue('50');
    await expect(page.locator('input[type="number"]:last')).toHaveValue('100');
  });

  test('Visual regression test for entire form', async ({ page }) => {
    // Take screenshots of each state
    
    // 1. Initial state
    await page.screenshot({ 
      path: 'tests/screenshots/form-initial.png', 
      fullPage: true 
    });
    
    // 2. With dropdown open
    await page.click('button:has-text("Select event categories")');
    await page.waitForSelector('[role="option"]');
    await page.screenshot({ 
      path: 'tests/screenshots/form-categories-open.png', 
      fullPage: true 
    });
    
    // 3. With calendar open
    await page.click('body', { position: { x: 10, y: 10 } }); // Close categories
    await page.click('button:has-text("Pick a date and time")');
    await page.waitForSelector('.rdp-caption');
    await page.screenshot({ 
      path: 'tests/screenshots/form-calendar-open.png', 
      fullPage: true 
    });
  });
});

test.describe('Accessibility Tests', () => {
  test('Form has proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/seller/new-event');
    
    // Check for proper labels
    const labels = await page.$$eval('label', elements => 
      elements.map(el => el.textContent?.trim())
    );
    
    expect(labels).toContain('Event Name');
    expect(labels).toContain('Description');
    expect(labels).toContain('Location');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus first element
    await page.keyboard.press('Tab'); // Move to next
    
    // Check focused element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});