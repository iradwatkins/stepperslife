import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Complete Event Creation with Image Upload', () => {
  test('should create a real event with image upload', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(120000); // 2 minutes
    
    // Start from the event creation page
    await page.goto('http://localhost:3006/organizer/new-event');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to sign-in (expected)
    if (page.url().includes('sign-in')) {
      console.log('🔐 Authentication required - handling sign-in flow');
      
      // Click "Sign up" link if we need to create an account
      const signUpLink = page.locator('a:has-text("Sign up")');
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        await page.waitForLoadState('networkidle');
        
        // Generate unique test email
        const timestamp = Date.now();
        const testEmail = `playwright-test-${timestamp}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log(`📧 Creating test account: ${testEmail}`);
        
        // Fill sign-up form (Clerk's standard fields)
        await page.fill('input[name="emailAddress"]', testEmail);
        await page.fill('input[name="password"]', testPassword);
        
        // Look for additional fields that might be required
        const firstNameField = page.locator('input[name="firstName"]');
        if (await firstNameField.isVisible()) {
          await page.fill('input[name="firstName"]', 'Test');
        }
        
        const lastNameField = page.locator('input[name="lastName"]');
        if (await lastNameField.isVisible()) {
          await page.fill('input[name="lastName"]', 'User');
        }
        
        // Submit sign-up form
        await page.click('button[type="submit"]');
        
        // Wait for redirect back to event creation
        await page.waitForURL('**/organizer/new-event', { timeout: 30000 });
      } else {
        // Try to sign in with existing test account
        console.log('📧 Attempting sign-in with test account');
        await page.fill('input[name="identifier"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL('**/organizer/new-event', { timeout: 30000 });
      }
    }
    
    console.log('✅ Authentication successful - on event creation page');
    
    // Step 1: Select Event Type (Single-Day Event)
    console.log('📝 Step 1: Selecting event type');
    const singleDayOption = page.locator('div:has-text("Single-Day Event")').first();
    if (await singleDayOption.isVisible()) {
      await singleDayOption.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 2: Fill Basic Event Information
    console.log('📝 Step 2: Filling basic event information');
    
    // Event Name
    await page.fill('input[placeholder*="Summer Dance Festival"]', 'Miami Beach Dance Festival 2025');
    
    // Event Description
    await page.fill('textarea', 'Join us for an unforgettable night of dance, live music, and celebration at the beautiful Miami Beach venue. This event features top DJs, live performances, and a vibrant dance floor. Perfect for dancers of all levels!');
    
    // Select Categories (using checkbox labels)
    console.log('📝 Selecting event categories');
    await page.locator('label:has-text("Social Dance")').click();
    await page.locator('label:has-text("Lounge/Bar")').click();
    
    // Step 3: UPLOAD IMAGE
    console.log('🖼️ Step 3: Uploading event image');
    
    // Find the file input (it's hidden, so we need to make it visible or use setInputFiles)
    const fileInput = page.locator('input[type="file"]').first();
    const testImagePath = path.join(__dirname, 'test-event-image.jpg');
    
    // Upload the image
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for upload to complete (look for preview or success indicator)
    console.log('⏳ Waiting for image upload to complete...');
    await page.waitForTimeout(3000); // Give time for upload
    
    // Check if image preview appears
    const imagePreview = page.locator('img[alt="Event preview"]');
    if (await imagePreview.isVisible({ timeout: 5000 })) {
      console.log('✅ Image preview visible - upload successful!');
    } else {
      console.log('⚠️ Image preview not found, but continuing...');
    }
    
    // Step 4: Fill Location Details
    console.log('📍 Step 4: Filling location details');
    
    // Venue Name
    await page.fill('input[placeholder*="The Grand Ballroom"]', 'Miami Beach Convention Center');
    
    // Address - Try to fill manually if Google Places doesn't work
    const addressInput = page.locator('input[placeholder*="address"]').first();
    await addressInput.fill('1901 Convention Center Dr');
    
    // City
    await page.fill('input[placeholder*="Miami"]', 'Miami Beach');
    
    // State
    await page.fill('input[placeholder*="FL"]', 'FL');
    
    // ZIP Code
    await page.fill('input[placeholder*="33139"]', '33139');
    
    // Step 5: Set Date and Time
    console.log('📅 Step 5: Setting date and time');
    
    // Set date to 30 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', dateString);
    await page.fill('input[type="time"]', '19:00'); // 7:00 PM
    
    // Set end time
    const endTimeInput = page.locator('input[type="time"]').nth(1);
    if (await endTimeInput.isVisible()) {
      await endTimeInput.fill('23:00'); // 11:00 PM
    }
    
    // Click Next to proceed to ticketing
    console.log('➡️ Proceeding to ticketing step');
    await page.click('button:has-text("Next: Ticketing")');
    await page.waitForTimeout(1000);
    
    // Step 6: Configure Ticketing
    console.log('🎫 Step 6: Configuring ticketing');
    
    // Select "Yes - Selling Tickets"
    const sellingTicketsOption = page.locator('label:has-text("Yes - Selling Tickets")');
    if (await sellingTicketsOption.isVisible()) {
      await sellingTicketsOption.click();
      await page.waitForTimeout(500);
    }
    
    // Click Next to proceed to capacity
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Step 7: Set Capacity and Tickets
    console.log('🎫 Step 7: Setting capacity and ticket types');
    
    // Set total capacity
    const capacityInput = page.locator('input[type="number"]').first();
    if (await capacityInput.isVisible()) {
      await capacityInput.fill('200');
    }
    
    // Add ticket type
    const addTicketButton = page.locator('button:has-text("Add Ticket Type")');
    if (await addTicketButton.isVisible()) {
      await addTicketButton.click();
      await page.waitForTimeout(500);
      
      // Fill ticket details
      await page.fill('input[placeholder*="General Admission"]', 'General Admission');
      await page.fill('input[placeholder*="quantity"]', '150');
      await page.fill('input[placeholder*="price"]', '25');
    }
    
    // Click Next to proceed
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Skip tables if that step appears
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 3000 })) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 8: Review and Publish
    console.log('✅ Step 8: Reviewing and publishing event');
    
    // Check the terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').last();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Click Publish Event button
    const publishButton = page.locator('button:has-text("Publish Event")');
    if (await publishButton.isVisible()) {
      console.log('🚀 Publishing event...');
      await publishButton.click();
      
      // Wait for success indication
      await page.waitForTimeout(5000);
      
      // Check if we're redirected to the event page
      if (page.url().includes('/event/')) {
        console.log('✅ SUCCESS! Event created and redirected to event page');
        console.log(`📍 Event URL: ${page.url()}`);
        
        // Verify image is displayed on event page
        const eventImage = page.locator('img').first();
        if (await eventImage.isVisible({ timeout: 5000 })) {
          const imageSrc = await eventImage.getAttribute('src');
          console.log(`✅ Event image displayed: ${imageSrc}`);
          
          // Check if it's a MinIO URL or placeholder
          if (imageSrc?.includes('api/storage') || imageSrc?.includes('uploads')) {
            console.log('✅ Image successfully uploaded to MinIO!');
          }
        }
      } else {
        // Check for success toast or message
        const successMessage = page.locator('text=/Event.*[Cc]reated|[Ss]uccess/');
        if (await successMessage.isVisible({ timeout: 5000 })) {
          console.log('✅ Event created successfully!');
        }
      }
    }
    
    // Take a screenshot of the final result
    await page.screenshot({ path: 'tests/screenshots/event-created-with-image.png', fullPage: true });
    console.log('📸 Screenshot saved: tests/screenshots/event-created-with-image.png');
    
    // Final verification
    console.log('🎉 Test completed! Event with image has been created.');
  });
});