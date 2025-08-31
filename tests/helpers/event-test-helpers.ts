import { Page, expect } from '@playwright/test';
import * as path from 'path';

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail';
  duration: number;
  error?: string;
  eventId?: string;
  screenshot?: string;
}

export class EventTestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for Convex to sync data
   */
  async waitForConvexSync(timeout = 5000) {
    await this.page.waitForTimeout(timeout);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login as event organizer
   */
  async loginAsOrganizer(email = 'test@example.com', password = 'TestPassword123!') {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('networkidle');
    
    // Check if already logged in
    const dashboardVisible = await this.page.locator('text="Dashboard"').isVisible().catch(() => false);
    if (dashboardVisible) {
      console.log('Already logged in');
      return;
    }
    
    // Fill login form
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Sign In")');
    
    // Wait for redirect
    await this.page.waitForURL(/\/(dashboard|seller|$)/, { timeout: 10000 });
    await this.waitForConvexSync();
  }

  /**
   * Navigate to new event page
   */
  async navigateToNewEvent() {
    await this.page.goto('/seller/new-event');
    await this.page.waitForLoadState('networkidle');
    await this.waitForConvexSync();
  }

  /**
   * Select event type
   */
  async selectEventType(type: 'single' | 'multi_day' | 'save_the_date') {
    const typeMap = {
      single: 'Single Day Event',
      multi_day: 'Multi-Day Event',
      save_the_date: 'Save the Date'
    };
    
    const selector = `text="${typeMap[type]}"`;
    await this.page.click(selector);
    await this.waitForConvexSync(2000);
  }

  /**
   * Fill basic event information
   */
  async fillBasicEventInfo(data: {
    name: string;
    description: string;
    categories?: string[];
    isSaveTheDate?: boolean;
  }) {
    // Event name
    await this.page.fill('input[placeholder*="Summer Dance Festival"]', data.name);
    
    // Description
    await this.page.fill('textarea[placeholder*="Join us for an amazing evening"]', data.description);
    
    // Categories
    if (data.categories && data.categories.length > 0) {
      for (const category of data.categories) {
        const checkbox = this.page.locator(`label:has-text("${category}")`);
        await checkbox.click();
      }
    }
    
    // If save the date, check the checkbox
    if (data.isSaveTheDate) {
      const saveTheDateCheckbox = this.page.locator('label:has-text("Save the Date")').first();
      await saveTheDateCheckbox.click();
    }
  }

  /**
   * Fill location information (if not save the date)
   */
  async fillLocationInfo(data: {
    venue: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }) {
    await this.page.fill('input[placeholder*="Grand Ballroom"]', data.venue);
    await this.page.fill('input[placeholder*="Start typing to search"]', data.address);
    await this.page.fill('input[placeholder="Miami"]', data.city);
    await this.page.fill('input[placeholder="FL"]', data.state);
    await this.page.fill('input[placeholder="33139"]', data.zip);
  }

  /**
   * Set event date and time
   */
  async setEventDateTime(date: string, time: string) {
    // Set date
    await this.page.fill('input[type="date"]', date);
    
    // Set time
    await this.page.fill('input[type="time"]', time);
  }

  /**
   * Upload event image
   */
  async uploadEventImage(imagePath?: string) {
    // If no path provided, use a default test image
    const imageToUpload = imagePath || path.join(__dirname, '..', 'fixtures', 'test-event-image.jpg');
    
    // Find the file input
    const fileInput = this.page.locator('input[type="file"]').first();
    
    // Set the file
    await fileInput.setInputFiles(imageToUpload);
    
    // Wait for upload to complete
    await this.waitForConvexSync(3000);
  }

  /**
   * Configure ticketing
   */
  async configureTicketing(isTicketed: boolean, doorPrice?: number) {
    if (isTicketed) {
      await this.page.click('text="Yes - Selling Tickets Online"');
    } else {
      await this.page.click('text="No - Just Posting an Event"');
      if (doorPrice) {
        await this.page.fill('input[placeholder*="Door price"]', doorPrice.toString());
      }
    }
  }

  /**
   * Add ticket type
   */
  async addTicketType(data: {
    name: string;
    price: number;
    quantity: number;
    hasEarlyBird?: boolean;
    earlyBirdPrice?: number;
  }) {
    // Click add ticket button
    await this.page.click('button:has-text("Add Ticket Type")');
    
    // Fill ticket details
    await this.page.fill('input[placeholder*="General Admission"]', data.name);
    await this.page.fill('input[placeholder*="price"]', data.price.toString());
    await this.page.fill('input[placeholder*="quantity"]', data.quantity.toString());
    
    // Early bird if specified
    if (data.hasEarlyBird && data.earlyBirdPrice) {
      await this.page.click('label:has-text("Enable Early Bird")');
      await this.page.fill('input[placeholder*="Early bird price"]', data.earlyBirdPrice.toString());
    }
  }

  /**
   * Click through to next step
   */
  async clickNext(buttonText = 'Next') {
    const button = this.page.locator(`button:has-text("${buttonText}")`).first();
    await button.click();
    await this.waitForConvexSync(2000);
  }

  /**
   * Publish the event
   */
  async publishEvent(timeout = 30000): Promise<string | null> {
    // Click publish button
    const publishButton = this.page.locator('button:has-text("Publish Event")').first();
    await publishButton.click();
    
    // Wait for redirect to event page or success message
    try {
      await this.page.waitForURL(/\/event\/[a-zA-Z0-9]+/, { timeout });
      
      // Extract event ID from URL
      const url = this.page.url();
      const match = url.match(/\/event\/([a-zA-Z0-9]+)/);
      const eventId = match ? match[1] : null;
      
      console.log(`Event published successfully! ID: ${eventId}`);
      return eventId;
    } catch (error) {
      console.error('Failed to publish event within timeout');
      
      // Check for error messages
      const errorMessage = await this.page.locator('.text-red-500, .error, [role="alert"]').first().textContent().catch(() => null);
      if (errorMessage) {
        console.error(`Error message: ${errorMessage}`);
      }
      
      return null;
    }
  }

  /**
   * Verify event is publicly visible
   */
  async verifyEventIsPublic(eventId: string): Promise<boolean> {
    // Navigate to event page
    await this.page.goto(`/event/${eventId}`);
    await this.page.waitForLoadState('networkidle');
    
    // Check if event title is visible
    const titleVisible = await this.page.locator('h1').isVisible().catch(() => false);
    
    // Check for 404 or error pages
    const notFoundVisible = await this.page.locator('text="404"').isVisible().catch(() => false);
    const errorVisible = await this.page.locator('text="Error"').isVisible().catch(() => false);
    
    return titleVisible && !notFoundVisible && !errorVisible;
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshots/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  /**
   * Get event details from event page
   */
  async getEventDetails(eventId: string) {
    await this.page.goto(`/event/${eventId}`);
    await this.page.waitForLoadState('networkidle');
    
    const details = {
      title: await this.page.locator('h1').first().textContent(),
      description: await this.page.locator('p').first().textContent(),
      location: await this.page.locator('text=/.*Location.*/ >> ../following-sibling::*').textContent().catch(() => null),
      date: await this.page.locator('text=/.*Date.*/ >> ../following-sibling::*').textContent().catch(() => null),
      price: await this.page.locator('text=/.*Price.*/ >> ../following-sibling::*').textContent().catch(() => null),
      imageVisible: await this.page.locator('img[alt*="Event"]').isVisible().catch(() => false)
    };
    
    return details;
  }

  /**
   * Log test result
   */
  logTestResult(result: TestResult) {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.testName}`);
    console.log(`   Duration: ${result.duration}ms`);
    if (result.eventId) {
      console.log(`   Event ID: ${result.eventId}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.screenshot) {
      console.log(`   Screenshot: ${result.screenshot}`);
    }
  }
}

/**
 * Generate a unique event name for testing
 */
export function generateEventName(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix} - Test ${timestamp}-${random}`;
}

/**
 * Get a future date string in YYYY-MM-DD format
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Format time string for input
 */
export function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}