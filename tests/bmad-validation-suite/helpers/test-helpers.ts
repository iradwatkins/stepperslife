import { Page, expect } from '@playwright/test';

/**
 * BMAD Validation Test Helpers
 * Non-destructive testing utilities that preserve existing data
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'organizer' | 'reseller' | 'customer';
}

export interface EventData {
  name: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  time: string;
  capacity: number;
  categories?: string[];
}

export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  earlyBird?: {
    price: number;
    endDate: string;
  };
}

export interface TableConfig {
  name: string;
  seats: number;
  price: number;
  quantity: number;
}

export interface ResellerConfig {
  email: string;
  name: string;
  commissionPerTicket: number;
}

export class BMADValidationHelpers {
  private page: Page;
  private testPrefix = 'TEST-BMAD';
  private baseUrl: string;
  
  constructor(page: Page, baseUrl = 'http://localhost:3000') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a unique test event name with timestamp
   */
  generateTestEventName(base: string): string {
    const timestamp = Date.now();
    return `${this.testPrefix}-${base}-${timestamp}`;
  }

  /**
   * Login as a specific user type
   */
  async login(user: TestUser): Promise<void> {
    await this.page.goto(`${this.baseUrl}/sign-in`);
    
    // Wait for Clerk to load
    await this.page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 10000 });
    
    // Fill in credentials
    const emailInput = this.page.locator('input[name="identifier"], input[type="email"]').first();
    await emailInput.fill(user.email);
    
    // Click continue if using Clerk's two-step process
    const continueButton = this.page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
      await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
    }
    
    const passwordInput = this.page.locator('input[type="password"]').first();
    await passwordInput.fill(user.password);
    
    // Submit
    await this.page.locator('button[type="submit"], button:has-text("Sign in")').first().click();
    
    // Wait for navigation
    await this.page.waitForURL(url => !url.includes('/sign-in'), { timeout: 10000 });
  }

  /**
   * Navigate to create new event
   */
  async navigateToNewEvent(): Promise<void> {
    // Try multiple paths
    const paths = ['/organizer/new-event', '/seller/new-event', '/events/create'];
    
    for (const path of paths) {
      await this.page.goto(`${this.baseUrl}${path}`);
      
      // Check if we're on the right page
      const hasEventForm = await this.page.locator('text=/create.*event/i').isVisible({ timeout: 3000 }).catch(() => false);
      if (hasEventForm) {
        return;
      }
    }
    
    throw new Error('Could not navigate to new event page');
  }

  /**
   * Select event type (single, multi-day, save-the-date)
   */
  async selectEventType(type: 'single' | 'multi' | 'save'): Promise<void> {
    const selectors = {
      single: '[data-event-type="single"], button:has-text("Single Day")',
      multi: '[data-event-type="multi"], button:has-text("Multi-Day")',
      save: '[data-event-type="save"], button:has-text("Save the Date")'
    };
    
    await this.page.locator(selectors[type]).first().click();
    await this.page.waitForTimeout(500); // Allow UI to update
  }

  /**
   * Fill basic event information
   */
  async fillEventInfo(data: Partial<EventData>): Promise<void> {
    if (data.name) {
      await this.page.fill('input[name="name"], input[placeholder*="Event name"]', data.name);
    }
    
    if (data.description) {
      await this.page.fill('textarea[name="description"], textarea[placeholder*="description"]', data.description);
    }
    
    if (data.venue) {
      await this.page.fill('input[name="venue"], input[placeholder*="venue"]', data.venue);
    }
    
    if (data.address) {
      await this.page.fill('input[name="address"], input[placeholder*="address"]', data.address);
    }
    
    if (data.city) {
      await this.page.fill('input[name="city"], input[placeholder*="city"]', data.city);
    }
    
    if (data.state) {
      await this.page.fill('input[name="state"], input[placeholder*="state"]', data.state);
    }
    
    if (data.zip) {
      await this.page.fill('input[name="zip"], input[placeholder*="zip"]', data.zip);
    }
    
    if (data.categories) {
      for (const category of data.categories) {
        const checkbox = this.page.locator(`input[type="checkbox"][value="${category}"], label:has-text("${category}") input`);
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }
      }
    }
  }

  /**
   * Add ticket types to event
   */
  async addTicketType(ticket: TicketType): Promise<void> {
    // Click add ticket button
    await this.page.locator('button:has-text("Add Ticket"), button:has-text("Add ticket type")').first().click();
    
    // Fill ticket details
    await this.page.fill('input[placeholder*="Ticket name"]', ticket.name);
    await this.page.fill('input[placeholder*="Price"], input[type="number"][name*="price"]', ticket.price.toString());
    await this.page.fill('input[placeholder*="Quantity"], input[type="number"][name*="quantity"]', ticket.quantity.toString());
    
    if (ticket.earlyBird) {
      const earlyBirdCheckbox = this.page.locator('input[type="checkbox"][name*="earlyBird"]');
      if (await earlyBirdCheckbox.isVisible()) {
        await earlyBirdCheckbox.check();
        await this.page.fill('input[placeholder*="Early bird price"]', ticket.earlyBird.price.toString());
      }
    }
  }

  /**
   * Add table configuration
   */
  async addTable(table: TableConfig): Promise<void> {
    await this.page.locator('button:has-text("Add Table"), button:has-text("Configure Tables")').first().click();
    
    await this.page.fill('input[placeholder*="Table name"]', table.name);
    await this.page.fill('input[placeholder*="Seats"], input[type="number"][name*="seats"]', table.seats.toString());
    await this.page.fill('input[placeholder*="Price per table"]', table.price.toString());
    await this.page.fill('input[placeholder*="Number of tables"]', table.quantity.toString());
  }

  /**
   * Create bundle for multi-day event
   */
  async createBundle(name: string, ticketIds: string[], discount: number): Promise<void> {
    await this.page.locator('button:has-text("Create Bundle")').click();
    
    await this.page.fill('input[placeholder*="Bundle name"]', name);
    
    // Select tickets for bundle
    for (const ticketId of ticketIds) {
      await this.page.locator(`input[type="checkbox"][value="${ticketId}"]`).check();
    }
    
    await this.page.fill('input[placeholder*="Discount"], input[placeholder*="Savings"]', discount.toString());
    
    await this.page.locator('button:has-text("Save Bundle")').click();
  }

  /**
   * Add reseller to event
   */
  async addReseller(eventId: string, reseller: ResellerConfig): Promise<string> {
    // Navigate to event's affiliate page
    await this.page.goto(`${this.baseUrl}/seller/events/${eventId}/affiliates`);
    
    // Click add reseller
    await this.page.locator('button:has-text("Add Reseller"), button:has-text("Add Affiliate")').first().click();
    
    // Fill reseller details
    await this.page.fill('input[placeholder*="Email"]', reseller.email);
    await this.page.fill('input[placeholder*="Name"]', reseller.name);
    await this.page.fill('input[placeholder*="Commission"], input[type="number"][name*="commission"]', reseller.commissionPerTicket.toString());
    
    // Submit
    await this.page.locator('button:has-text("Create"), button:has-text("Add")').first().click();
    
    // Wait for referral code to be generated
    await this.page.waitForSelector('text=/referral.*code|ref=/i', { timeout: 5000 });
    
    // Extract referral code
    const referralCode = await this.page.locator('code, .referral-code').first().textContent() || '';
    
    return referralCode;
  }

  /**
   * Simulate purchase with referral
   */
  async purchaseWithReferral(eventId: string, referralCode: string, quantity: number = 1): Promise<void> {
    // Visit event with referral code
    await this.page.goto(`${this.baseUrl}/event/${eventId}?ref=${referralCode}`);
    
    // Select tickets
    await this.page.locator('button:has-text("Buy Tickets"), button:has-text("Get Tickets")').first().click();
    
    // Set quantity
    const quantityInput = this.page.locator('input[type="number"][name*="quantity"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill(quantity.toString());
    }
    
    // Proceed to checkout
    await this.page.locator('button:has-text("Checkout"), button:has-text("Continue")').first().click();
    
    // Fill customer info if needed
    await this.page.fill('input[name="name"], input[placeholder*="Name"]', 'Test Customer');
    await this.page.fill('input[name="email"], input[placeholder*="Email"]', 'testcustomer@test.com');
    
    // Complete purchase (test mode)
    await this.page.locator('button:has-text("Complete"), button:has-text("Pay")').first().click();
  }

  /**
   * Verify event appears on homepage
   */
  async verifyEventOnHomepage(eventName: string): Promise<boolean> {
    await this.page.goto(this.baseUrl);
    
    // Wait for events to load
    await this.page.waitForSelector('.event-card, [data-testid="event-card"]', { timeout: 5000 }).catch(() => {});
    
    // Check if event is visible
    return await this.page.locator(`text="${eventName}"`).isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Verify reseller commission
   */
  async verifyResellerCommission(eventId: string, expectedSales: number, expectedEarnings: number): Promise<boolean> {
    await this.page.goto(`${this.baseUrl}/seller/events/${eventId}/affiliates`);
    
    // Find the stats
    const salesText = await this.page.locator('text=/tickets sold|total sold/i').first().textContent() || '';
    const earningsText = await this.page.locator('text=/earned|commission/i').first().textContent() || '';
    
    const actualSales = parseInt(salesText.match(/\d+/)?.[0] || '0');
    const actualEarnings = parseFloat(earningsText.match(/[\d.]+/)?.[0] || '0');
    
    return actualSales === expectedSales && Math.abs(actualEarnings - expectedEarnings) < 0.01;
  }

  /**
   * Clean up test event (mark as cancelled, don't delete)
   */
  async cleanupTestEvent(eventId: string): Promise<void> {
    try {
      await this.page.goto(`${this.baseUrl}/seller/events/${eventId}/edit`);
      
      // Look for cancel button
      const cancelButton = this.page.locator('button:has-text("Cancel Event")');
      if (await cancelButton.isVisible({ timeout: 3000 })) {
        await cancelButton.click();
        
        // Confirm cancellation
        const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
      }
    } catch (error) {
      console.log(`Could not cancel test event ${eventId}:`, error);
    }
  }

  /**
   * Take screenshot for debugging
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }
}

// Test data constants
export const TEST_USERS = {
  admin: { 
    email: 'admin@stepperslife.com', 
    password: 'Admin123!',
    role: 'admin' as const
  },
  organizer: { 
    email: 'Appvillagellc@gmail.com', 
    password: 'Test123!',
    role: 'organizer' as const
  },
  reseller1: { 
    email: 'reseller1@test.com', 
    password: 'Reseller123!',
    role: 'reseller' as const
  },
  customer: { 
    email: 'customer@test.com', 
    password: 'Customer123!',
    role: 'customer' as const
  }
};

// Event templates for testing
export const EVENT_TEMPLATES = {
  salsaNight: {
    name: 'Salsa Night Miami',
    description: 'Hot salsa dancing all night long! Live DJ, dance performances, and beginner lessons.',
    venue: 'The Grand Ballroom',
    address: '123 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    zip: '33139',
    capacity: 200,
    categories: ['Social Dance', 'Workshop']
  },
  charityGala: {
    name: 'Annual Charity Gala',
    description: 'Elegant evening supporting local charities. Black tie event with dinner and entertainment.',
    venue: 'Ritz Carlton',
    address: '456 Luxury Lane',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33140',
    capacity: 300,
    categories: ['Other']
  },
  danceFestival: {
    name: '3-Day Dance Festival',
    description: 'Weekend of workshops, competitions, and social dancing.',
    venue: 'Convention Center',
    address: '789 Festival Way',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33301',
    capacity: 500,
    categories: ['Workshop', 'Competition', 'Social Dance']
  }
};

// Ticket configurations
export const TICKET_CONFIGS = {
  standard: [
    { name: 'Early Bird', price: 25, quantity: 50, earlyBird: { price: 20, endDate: '2025-02-01' } },
    { name: 'General Admission', price: 35, quantity: 100 },
    { name: 'VIP', price: 50, quantity: 50 }
  ],
  gala: [
    { name: 'Individual Ticket', price: 75, quantity: 100 },
    { name: 'Couple Ticket', price: 140, quantity: 50 }
  ]
};

// Table configurations
export const TABLE_CONFIGS = {
  gala: [
    { name: 'Gold Table', seats: 8, price: 500, quantity: 5 },
    { name: 'Platinum Table', seats: 8, price: 750, quantity: 5 },
    { name: 'Diamond Table', seats: 10, price: 1000, quantity: 3 }
  ]
};