import { Page, expect } from '@playwright/test';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
  eventId?: string;
  screenshots?: string[];
}

export interface EventDateTimeData {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format (24-hour)
  displayDate?: string; // Expected display format
  displayTime?: string; // Expected 12-hour format with AM/PM
}

export class QATestHelpers {
  constructor(private page: Page) {}

  /**
   * Convert 24-hour time to 12-hour format with AM/PM
   */
  static convert24to12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Format ISO date to display format
   */
  static formatDateForDisplay(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  /**
   * Get a future date in YYYY-MM-DD format
   */
  static getFutureDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate unique event name with timestamp
   */
  static generateEventName(prefix: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix} - ${timestamp}-${randomStr}`;
  }

  /**
   * Login as event organizer
   */
  async loginAsOrganizer(email?: string, password?: string): Promise<void> {
    await this.page.goto('/sign-in');
    
    // Check if we're already logged in
    if (await this.page.url().includes('dashboard') || await this.page.url().includes('organizer')) {
      console.log('Already logged in');
      return;
    }

    // Use provided credentials or defaults
    const loginEmail = email || 'test@example.com';
    const loginPassword = password || 'testpass123';
    
    // Fill login form
    await this.page.fill('input[type="email"]', loginEmail);
    await this.page.fill('input[type="password"]', loginPassword);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect
    await this.page.waitForURL(/(dashboard|organizer|home)/, { timeout: 10000 });
  }

  /**
   * Navigate to create new event
   */
  async navigateToNewEvent(): Promise<void> {
    // Multiple paths to new event creation
    const newEventButton = this.page.locator('a:has-text("New Event"), button:has-text("Create Event")').first();
    
    if (await newEventButton.isVisible()) {
      await newEventButton.click();
    } else {
      // Direct navigation
      await this.page.goto('/organizer/new-event');
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select event type
   */
  async selectEventType(type: 'single' | 'multi_day' | 'save_the_date'): Promise<void> {
    const typeMap = {
      'single': 'Single Event',
      'multi_day': 'Multi-Day Event',
      'save_the_date': 'Save the Date'
    };
    
    await this.page.click(`button:has-text("${typeMap[type]}")`);
    await this.page.waitForTimeout(500); // Allow UI to update
  }

  /**
   * Fill basic event information with date/time validation
   */
  async fillBasicEventInfo(data: {
    name: string;
    description: string;
    date: string;
    time: string;
    endTime?: string;
    categories: string[];
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }): Promise<void> {
    // Event name
    await this.page.fill('input[placeholder*="event name" i], input[placeholder*="Summer Dance" i]', data.name);
    
    // Description
    await this.page.fill('textarea[placeholder*="description" i], textarea[placeholder*="Join us" i]', data.description);
    
    // Categories
    for (const category of data.categories) {
      const categoryLabel = this.page.locator(`label:has-text("${category}")`);
      if (await categoryLabel.isVisible()) {
        await categoryLabel.click();
      }
    }
    
    // Date and Time
    await this.page.fill('input[type="date"]', data.date);
    await this.page.fill('input[type="time"]', data.time);
    
    if (data.endTime) {
      const endTimeInput = this.page.locator('input[type="time"]').nth(1);
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill(data.endTime);
      }
    }
    
    // Location (if not save-the-date)
    if (data.location) {
      await this.page.fill('input[placeholder*="venue" i], input[placeholder*="Grand Ballroom" i]', data.location);
      await this.page.fill('input[placeholder*="address" i], input[placeholder*="123 Main" i]', data.address || '');
      await this.page.fill('input[placeholder*="city" i]', data.city || '');
      await this.page.fill('input[placeholder*="state" i]', data.state || '');
      await this.page.fill('input[placeholder*="zip" i], input[placeholder*="postal" i]', data.postalCode || '');
    }
  }

  /**
   * Verify date and time display on event page
   */
  async verifyDateTimeDisplay(expectedDate: string, expectedTime: string): Promise<boolean> {
    // Check multiple possible date display locations
    const dateSelectors = [
      `text="${expectedDate}"`,
      `p:has-text("${expectedDate}")`,
      `div:has-text("${expectedDate}")`,
      `span:has-text("${expectedDate}")`
    ];
    
    const timeSelectors = [
      `text="${expectedTime}"`,
      `p:has-text("${expectedTime}")`,
      `div:has-text("${expectedTime}")`,
      `span:has-text("${expectedTime}")`
    ];
    
    let dateFound = false;
    let timeFound = false;
    
    for (const selector of dateSelectors) {
      if (await this.page.locator(selector).first().isVisible()) {
        dateFound = true;
        break;
      }
    }
    
    for (const selector of timeSelectors) {
      if (await this.page.locator(selector).first().isVisible()) {
        timeFound = true;
        break;
      }
    }
    
    if (!dateFound) {
      console.error(`Date "${expectedDate}" not found on page`);
    }
    if (!timeFound) {
      console.error(`Time "${expectedTime}" not found on page`);
    }
    
    return dateFound && timeFound;
  }

  /**
   * Configure ticketing options
   */
  async configureTicketing(isTicketed: boolean, doorPrice?: number): Promise<void> {
    if (isTicketed) {
      await this.page.click('text="Yes - Selling Tickets"');
    } else {
      await this.page.click('text="No - Just Posting an Event"');
      if (doorPrice) {
        await this.page.fill('input[placeholder*="door price" i]', doorPrice.toString());
      }
    }
  }

  /**
   * Add ticket type with validation
   */
  async addTicketType(data: {
    name: string;
    price: number;
    quantity: number;
    earlyBird?: {
      price: number;
      endDate: string;
    };
  }): Promise<void> {
    await this.page.click('button:has-text("Add Ticket")');
    
    await this.page.fill('input[placeholder*="ticket name" i]', data.name);
    await this.page.fill('input[placeholder*="price" i]', data.price.toString());
    await this.page.fill('input[placeholder*="quantity" i]', data.quantity.toString());
    
    if (data.earlyBird) {
      const earlyBirdCheckbox = this.page.locator('input[type="checkbox"]:near(text="Early Bird")');
      if (await earlyBirdCheckbox.isVisible()) {
        await earlyBirdCheckbox.check();
        await this.page.fill('input[placeholder*="early bird price" i]', data.earlyBird.price.toString());
        await this.page.fill('input[type="date"]:near(text="Early Bird")', data.earlyBird.endDate);
      }
    }
  }

  /**
   * Create bundle for multi-day events
   */
  async createBundle(data: {
    name: string;
    price: number;
    ticketSelections: string[];
  }): Promise<void> {
    await this.page.click('button:has-text("Create Bundle")');
    
    await this.page.fill('input[placeholder*="bundle name" i]', data.name);
    await this.page.fill('input[placeholder*="bundle price" i]', data.price.toString());
    
    for (const ticket of data.ticketSelections) {
      await this.page.click(`label:has-text("${ticket}")`);
    }
    
    await this.page.click('button:has-text("Save Bundle")');
  }

  /**
   * Navigate through form steps
   */
  async clickNext(buttonText?: string): Promise<void> {
    const nextButton = buttonText 
      ? this.page.locator(`button:has-text("${buttonText}")`)
      : this.page.locator('button:has-text("Next")');
    
    await nextButton.click();
    await this.page.waitForTimeout(500); // Allow transitions
  }

  /**
   * Publish event and get ID
   */
  async publishEvent(): Promise<string | null> {
    // Click publish button
    await this.page.click('button:has-text("Publish Event")');
    
    // Wait for success and URL change
    await this.page.waitForURL(/\/event\/[a-zA-Z0-9]+/, { timeout: 30000 });
    
    // Extract event ID from URL
    const url = this.page.url();
    const match = url.match(/\/event\/([a-zA-Z0-9]+)/);
    
    return match ? match[1] : null;
  }

  /**
   * Verify event is publicly accessible
   */
  async verifyEventIsPublic(eventId: string): Promise<boolean> {
    // Open in new context (not logged in)
    const context = await this.page.context().browser()?.newContext();
    if (!context) return false;
    
    const publicPage = await context.newPage();
    await publicPage.goto(`/event/${eventId}`);
    
    const isVisible = await publicPage.locator('h1').first().isVisible();
    await publicPage.close();
    await context.close();
    
    return isVisible;
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = Date.now();
    const filename = `screenshots/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  /**
   * Log test result
   */
  logTestResult(result: TestResult): void {
    const status = result.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    console.log(`   Duration: ${result.duration}ms`);
    if (result.eventId) {
      console.log(`   Event ID: ${result.eventId}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Validate date format in database or API response
   */
  async validateStoredDateTime(eventId: string): Promise<{
    storedDate: string;
    storedTime: string;
    isValid: boolean;
  }> {
    // Make API call to get event details
    const response = await this.page.request.get(`/api/events/${eventId}`);
    const eventData = await response.json();
    
    return {
      storedDate: eventData.eventDate,
      storedTime: eventData.eventTime,
      isValid: /^\d{4}-\d{2}-\d{2}$/.test(eventData.eventDate) && 
               /^\d{2}:\d{2}$/.test(eventData.eventTime)
    };
  }
}

// Export helper functions
export const convert24to12Hour = QATestHelpers.convert24to12Hour;
export const formatDateForDisplay = QATestHelpers.formatDateForDisplay;
export const getFutureDate = QATestHelpers.getFutureDate;
export const generateEventName = QATestHelpers.generateEventName;