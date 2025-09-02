import { test, expect } from '@playwright/test';

test.describe('Event Submission Flow', () => {
  test('Navigate to event creation and inspect flow', async ({ page }) => {
    // Go directly to the organizer new event page
    await page.goto('http://localhost:3001/organizer/new-event');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/initial-page.png' });
    
    // Check if we're redirected to sign-in
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('sign-in')) {
      console.log('Redirected to sign-in page');
      
      // Try to find sign-in form
      const emailInput = await page.locator('input[type="email"]').isVisible();
      console.log('Email input visible:', emailInput);
      
      // Fill in credentials
      if (emailInput) {
        await page.fill('input[type="email"]', 'appvillagellc@gmail.com');
        
        // Look for password field
        const passwordInput = await page.locator('input[type="password"]');
        if (await passwordInput.isVisible()) {
          await page.fill('input[type="password"]', 'TestPassword123!');
          
          // Look for submit button
          const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Continue")').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Wait for navigation
            await page.waitForTimeout(3000);
            console.log('After sign-in, URL:', page.url());
          }
        }
      }
    }
    
    // Check if we see event type selector
    const singleDayButton = await page.locator('button:has-text("Single-Day Event"), button:has-text("Single Day")').first();
    const eventTypeSelectorVisible = await singleDayButton.isVisible().catch(() => false);
    console.log('Event type selector visible:', eventTypeSelectorVisible);
    
    if (eventTypeSelectorVisible) {
      await page.screenshot({ path: 'tests/screenshots/event-type-selector.png' });
      await singleDayButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for event form fields
    const nameField = await page.locator('input[name="name"], input[placeholder*="Event"], input[id="name"]').first();
    const formVisible = await nameField.isVisible().catch(() => false);
    console.log('Event form visible:', formVisible);
    
    if (formVisible) {
      await page.screenshot({ path: 'tests/screenshots/event-form.png' });
      
      // Fill basic info
      await nameField.fill('Test Event from Playwright');
      
      // Look for description
      const descField = await page.locator('textarea').first();
      if (await descField.isVisible()) {
        await descField.fill('This is a test event');
      }
      
      // Fill location
      const locationField = await page.locator('input[name="location"], input[placeholder*="Venue"]').first();
      if (await locationField.isVisible()) {
        await locationField.fill('Test Venue');
      }
      
      // Fill address
      const addressField = await page.locator('input[name="address"], input[placeholder*="Address"]').first();
      if (await addressField.isVisible()) {
        await addressField.fill('2740 W 83rd Pl');
      }
      
      // Fill city
      const cityField = await page.locator('input[name="city"], input[placeholder*="City"]').first();
      if (await cityField.isVisible()) {
        await cityField.fill('Chicago');
      }
      
      // Fill state
      const stateField = await page.locator('input[name="state"], select[name="state"]').first();
      if (await stateField.isVisible()) {
        await stateField.fill('IL');
      }
      
      // Fill postal code
      const zipField = await page.locator('input[name="postalCode"], input[placeholder*="Zip"]').first();
      if (await zipField.isVisible()) {
        await zipField.fill('60652');
      }
      
      // Set date
      const dateField = await page.locator('input[type="date"]').first();
      if (await dateField.isVisible()) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateString = futureDate.toISOString().split('T')[0];
        await dateField.fill(dateString);
      }
      
      // Set time
      const timeField = await page.locator('input[type="time"]').first();
      if (await timeField.isVisible()) {
        await timeField.fill('19:00');
      }
      
      // Take screenshot before clicking next
      await page.screenshot({ path: 'tests/screenshots/filled-form.png' });
      
      // Look for Next button
      const nextButton = await page.locator('button:has-text("Next")').first();
      const nextVisible = await nextButton.isVisible().catch(() => false);
      console.log('Next button visible:', nextVisible);
      
      if (nextVisible) {
        const isDisabled = await nextButton.isDisabled();
        console.log('Next button disabled:', isDisabled);
        
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          // Check where we are now
          console.log('After Next click, current step:', page.url());
          await page.screenshot({ path: 'tests/screenshots/after-next.png' });
          
          // Look for ticketing options
          const ticketingSection = await page.locator('text=/selling ticket|door price/i').first();
          if (await ticketingSection.isVisible()) {
            console.log('Ticketing section visible');
            
            // Select selling tickets
            const sellingTickets = await page.locator('label:has-text("Yes"), input[value="true"]').first();
            if (await sellingTickets.isVisible()) {
              await sellingTickets.click();
            }
            
            // Click next again
            const nextButton2 = await page.locator('button:has-text("Next")').first();
            if (await nextButton2.isVisible() && !await nextButton2.isDisabled()) {
              await nextButton2.click();
              await page.waitForTimeout(2000);
              
              // Now we should be at capacity/tickets step
              console.log('After ticketing next, URL:', page.url());
              await page.screenshot({ path: 'tests/screenshots/capacity-step.png' });
              
              // Look for capacity field
              const capacityField = await page.locator('input[type="number"]').first();
              if (await capacityField.isVisible()) {
                console.log('Capacity field visible');
                await capacityField.fill('200');
                
                // Check for ticket configuration
                const ticketNameField = await page.locator('input[placeholder*="VIP"], input[placeholder*="General"]').first();
                if (await ticketNameField.isVisible()) {
                  console.log('Ticket configuration visible');
                  
                  // Check the Next button state
                  const nextButton3 = await page.locator('button:has-text("Next")').first();
                  const isDisabled3 = await nextButton3.isDisabled();
                  console.log('Capacity Next button disabled:', isDisabled3);
                  
                  // Try auto-balance if available
                  const autoBalance = await page.locator('button:has-text("Auto-Balance")').first();
                  if (await autoBalance.isVisible()) {
                    console.log('Auto-balance button found');
                    await autoBalance.click();
                    await page.waitForTimeout(1000);
                  }
                  
                  // Check Next button again
                  const isStillDisabled = await nextButton3.isDisabled();
                  console.log('After auto-balance, Next disabled:', isStillDisabled);
                  
                  await page.screenshot({ path: 'tests/screenshots/ticket-config-state.png' });
                }
              }
            }
          }
        }
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/final-state.png' });
  });
});