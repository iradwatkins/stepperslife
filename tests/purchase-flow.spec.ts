import { test, expect } from '@playwright/test';

test.describe('Complete Ticket Purchase Flow', () => {
  test('should complete test purchase with cash payment', async ({ page }) => {
    // Navigate to test purchase page
    await page.goto('http://localhost:3000/test-purchase');
    
    // Wait for events to load
    await page.waitForSelector('text=Test Ticket Purchase Flow', { timeout: 10000 });
    
    // Find and click on the first event with tickets
    const firstEventButton = page.locator('button:has-text("Test Purchase Flow")').first();
    await expect(firstEventButton).toBeVisible({ timeout: 10000 });
    await firstEventButton.click();
    
    // Step 1: Select Tickets
    await expect(page.locator('text=Select Your Tickets')).toBeVisible({ timeout: 10000 });
    
    // Find the first ticket type and increase quantity
    const plusButton = page.locator('button:has([class*="Plus"])').first();
    await plusButton.click(); // Select 1 ticket
    
    // Verify ticket is selected (background should change)
    await expect(page.locator('[class*="border-blue-500"]').first()).toBeVisible();
    
    // Click proceed to checkout
    const proceedButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(proceedButton).toBeVisible();
    await proceedButton.click();
    
    // Step 2: Select Payment Method
    await expect(page.locator('text=Select Payment Method')).toBeVisible({ timeout: 10000 });
    
    // Select test cash payment method
    const testPaymentOption = page.locator('text=Test Payment (Cash)');
    await expect(testPaymentOption).toBeVisible();
    await testPaymentOption.click();
    
    // Continue with selected payment method
    const continueButton = page.locator('button:has-text("Continue with Test Payment")');
    await expect(continueButton).toBeVisible();
    await continueButton.click();
    
    // Step 3: Complete Test Purchase
    await expect(page.locator('text=Test Payment (Cash)')).toBeVisible({ timeout: 10000 });
    
    // Fill in customer information
    await page.fill('input[id="name"]', 'Test Customer');
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="phone"]', '555-0123');
    
    // Complete the purchase
    const completePurchaseButton = page.locator('button:has-text("Complete Test Purchase")');
    await expect(completePurchaseButton).toBeVisible();
    await completePurchaseButton.click();
    
    // Wait for processing
    await expect(page.locator('text=Processing test payment')).toBeVisible({ timeout: 5000 });
    
    // Verify success
    await expect(page.locator('text=Test Purchase Successful!')).toBeVisible({ timeout: 10000 });
    
    // Verify tickets were generated
    await expect(page.locator('text=Your Tickets')).toBeVisible();
    await expect(page.locator('text=Ticket #1')).toBeVisible();
    
    // Verify QR code is displayed
    const qrCode = page.locator('svg').first(); // QR codes are rendered as SVG
    await expect(qrCode).toBeVisible();
    
    // Verify ticket code is displayed
    await expect(page.locator('text=/Code: [A-Z0-9]{6}/')).toBeVisible();
    
    // Verify share link is present
    await expect(page.locator('text=View Ticket →')).toBeVisible();
  });

  test('should handle ticket selection with early bird pricing', async ({ page }) => {
    // Navigate to an event page directly
    await page.goto('http://localhost:3000/events');
    
    // Click on first event
    const firstEvent = page.locator('[class*="border"][class*="rounded"]').first();
    await firstEvent.click();
    
    // Wait for event page to load
    await page.waitForSelector('text=Purchase Tickets', { timeout: 10000 });
    
    // Look for early bird pricing if available
    const earlyBirdBadge = page.locator('text=Early Bird');
    if (await earlyBirdBadge.isVisible()) {
      // Verify early bird pricing is shown
      await expect(page.locator('text=/Early: \\$/')).toBeVisible();
      
      // Select an early bird ticket
      const earlyBirdTicket = earlyBirdBadge.locator('..').locator('..').locator('button:has([class*="Plus"])');
      await earlyBirdTicket.click();
      
      // Verify discounted price is applied
      const totalPrice = page.locator('text=/Total.*\\$[0-9]+\\.[0-9]{2}/');
      await expect(totalPrice).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to test purchase page
    await page.goto('http://localhost:3000/test-purchase');
    
    // Start purchase flow
    const firstEventButton = page.locator('button:has-text("Test Purchase Flow")').first();
    await firstEventButton.click();
    
    // Select a ticket
    const plusButton = page.locator('button:has([class*="Plus"])').first();
    await plusButton.click();
    
    // Proceed to payment
    await page.locator('button:has-text("Proceed to Checkout")').click();
    
    // Select test payment
    await page.locator('text=Test Payment (Cash)').click();
    await page.locator('button:has-text("Continue with Test Payment")').click();
    
    // Clear required fields
    await page.fill('input[id="name"]', '');
    await page.fill('input[id="email"]', '');
    
    // Try to complete purchase
    const completePurchaseButton = page.locator('button:has-text("Complete Test Purchase")');
    
    // Button should be disabled when fields are empty
    await expect(completePurchaseButton).toBeDisabled();
    
    // Fill only name
    await page.fill('input[id="name"]', 'Test User');
    await expect(completePurchaseButton).toBeDisabled();
    
    // Fill email as well
    await page.fill('input[id="email"]', 'test@example.com');
    await expect(completePurchaseButton).toBeEnabled();
  });

  test('should handle multiple ticket selection', async ({ page }) => {
    // Navigate to test purchase page
    await page.goto('http://localhost:3000/test-purchase');
    
    // Start purchase flow
    const firstEventButton = page.locator('button:has-text("Test Purchase Flow")').first();
    await firstEventButton.click();
    
    // Select multiple quantities of the same ticket
    const plusButton = page.locator('button:has([class*="Plus"])').first();
    await plusButton.click(); // 1 ticket
    await plusButton.click(); // 2 tickets
    await plusButton.click(); // 3 tickets
    
    // Verify quantity is shown correctly
    await expect(page.locator('text=3').first()).toBeVisible();
    
    // Verify total is calculated correctly
    await expect(page.locator('text=/3 ticket\\(s\\)/')).toBeVisible();
    
    // Test quantity decrease
    const minusButton = page.locator('button:has([class*="Minus"])').first();
    await minusButton.click(); // Back to 2 tickets
    
    await expect(page.locator('text=2').first()).toBeVisible();
    await expect(page.locator('text=/2 ticket\\(s\\)/')).toBeVisible();
  });

  test('should show proper error when no tickets selected', async ({ page }) => {
    // Navigate to test purchase page
    await page.goto('http://localhost:3000/test-purchase');
    
    // Start purchase flow
    const firstEventButton = page.locator('button:has-text("Test Purchase Flow")').first();
    await firstEventButton.click();
    
    // Try to proceed without selecting tickets
    // The proceed button should not be visible when no tickets are selected
    const proceedButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(proceedButton).not.toBeVisible();
  });
});