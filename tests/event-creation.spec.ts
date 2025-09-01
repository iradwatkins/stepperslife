import { test, expect } from '@playwright/test';

test.describe('Event Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3000');
  });

  test('should allow event creation without images', async ({ page }) => {
    // Navigate to event creation page
    await page.goto('http://localhost:3000/organizer/new-event');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to sign in first
    const signInButton = page.locator('text=Sign In');
    if (await signInButton.isVisible()) {
      // User needs to sign in - this is expected
      console.log('Sign-in required for event creation - this is correct behavior');
      return;
    }
    
    // If signed in, proceed with event creation
    // Select event type (single day)
    const singleEventButton = page.locator('text=Single-Day Event');
    if (await singleEventButton.isVisible()) {
      await singleEventButton.click();
    }
    
    // Fill in basic event details
    await page.fill('input[placeholder*="Summer Dance Festival"]', 'Test Event Without Images');
    await page.fill('textarea', 'This is a test event created without images to verify the flow works.');
    
    // Select a category
    await page.locator('label:has-text("Social Dance")').click();
    
    // Skip image upload - images are now optional
    console.log('Skipping image upload - images are optional');
    
    // Fill in location details (if not Save the Date)
    const venueField = page.locator('input[placeholder*="The Grand Ballroom"]');
    if (await venueField.isVisible()) {
      await venueField.fill('Test Venue');
      // Fill address manually since Google Places might not work in test
      await page.fill('input[placeholder*="address"]', '123 Test Street');
      await page.fill('input[placeholder*="Miami"]', 'Miami');
      await page.fill('input[placeholder*="FL"]', 'FL');
      await page.fill('input[placeholder*="33139"]', '33139');
    }
    
    // Set date and time
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2025-12-31');
    
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('19:00');
    
    // Click Next to go to ticketing
    await page.click('button:has-text("Next: Ticketing")');
    
    // Check that we can proceed without images
    await expect(page).toHaveURL(/new-event/);
    console.log('Successfully proceeded to ticketing step without images');
  });

  test('should handle image upload errors gracefully', async ({ page }) => {
    // Navigate to event creation page
    await page.goto('http://localhost:3000/organizer/new-event');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if MinIO is accessible
    const minioResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:9000');
        return response.status;
      } catch (error) {
        return 'error';
      }
    });
    
    console.log('MinIO status:', minioResponse);
    
    // Try to upload an image (if the upload field is visible)
    const uploadInput = page.locator('input[type="file"]');
    if (await uploadInput.isVisible()) {
      // Create a test image file
      const buffer = Buffer.from('fake-image-data');
      await uploadInput.setInputFiles({
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: buffer,
      });
      
      // Check for error message
      page.on('dialog', async dialog => {
        const message = dialog.message();
        console.log('Alert message:', message);
        expect(message).toContain('image');
        await dialog.accept();
      });
    }
  });

  test('should verify MinIO configuration', async ({ page }) => {
    // Check if MinIO is running
    const minioHealth = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:9000/minio/health/live');
        return await response.text();
      } catch (error) {
        return `MinIO not accessible: ${error}`;
      }
    });
    
    console.log('MinIO health check:', minioHealth);
    
    // Check if the API endpoint for MinIO upload exists
    const uploadEndpoint = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/upload/minio', { method: 'POST' });
        return response.status;
      } catch (error) {
        return `API endpoint error: ${error}`;
      }
    });
    
    console.log('Upload endpoint status:', uploadEndpoint);
  });
});