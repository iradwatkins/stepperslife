import { Page, expect } from '@playwright/test';

export class EventCreationPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/seller/new-event');
    await this.page.waitForLoadState('networkidle');
  }

  async selectEventType(type: 'single' | 'multi_day' | 'save_the_date') {
    const titles = {
      single: 'Single Event',
      multi_day: 'Multi-Day Event',
      save_the_date: 'Save the Date'
    };
    
    await this.page.click(`button:has-text("${titles[type]}")`);
    await this.page.waitForTimeout(500);
  }

  async fillBasicInfo(eventData: {
    name: string;
    description: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) {
    await this.page.fill('input[placeholder*="event name"]', eventData.name);
    await this.page.fill('textarea[placeholder*="Describe"]', eventData.description);
    
    if (eventData.location) {
      await this.page.fill('input[placeholder*="venue"]', eventData.location);
    }
    if (eventData.address) {
      const addressInput = this.page.locator('input[placeholder*="address"]').first();
      await addressInput.fill(eventData.address);
    }
    if (eventData.city) {
      await this.page.fill('input[placeholder*="City"]', eventData.city);
    }
    if (eventData.state) {
      await this.page.fill('input[placeholder*="State"]', eventData.state);
    }
    if (eventData.postalCode) {
      await this.page.fill('input[placeholder*="ZIP"]', eventData.postalCode);
    }
  }

  async selectCategories(categories: string[]) {
    // Check if using simple checkbox selector or dropdown
    const checkboxes = await this.page.$$('input[type="checkbox"]');
    
    if (checkboxes.length > 0) {
      // Simple checkbox implementation
      for (const category of categories) {
        const checkbox = this.page.locator(`label:has-text("${category}") input[type="checkbox"]`);
        if (await checkbox.count() > 0) {
          await checkbox.check();
        }
      }
    } else {
      // Dropdown implementation (if still exists)
      await this.page.click('button:has-text("Select event categories")');
      await this.page.waitForTimeout(300);
      
      for (const category of categories) {
        await this.page.click(`[role="option"]:has-text("${category}")`);
      }
      
      // Click outside to close
      await this.page.click('body', { position: { x: 10, y: 10 } });
    }
  }

  async selectDate(date: string, time?: string) {
    // Try HTML date input first (simplified UI)
    const dateInput = this.page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill(date);
      
      if (time) {
        const timeInput = this.page.locator('input[type="time"]').first();
        if (await timeInput.count() > 0) {
          await timeInput.fill(time);
        }
      }
    } else {
      // Fallback to date picker button
      await this.page.click('button:has-text("Pick a date")');
      await this.page.waitForTimeout(300);
      
      const [year, month, day] = date.split('-');
      const dayNumber = parseInt(day, 10);
      
      await this.page.click(`.rdp-day:has-text("${dayNumber}"):not(.rdp-day_outside)`);
      
      if (time) {
        const [hour, minute] = time.split(':');
        const hour12 = parseInt(hour, 10);
        const ampm = hour12 >= 12 ? 'PM' : 'AM';
        const displayHour = hour12 > 12 ? hour12 - 12 : hour12;
        await this.page.click(`button:has-text("${displayHour}:00 ${ampm}")`);
      }
    }
  }

  async selectDateRange(startDate: string, endDate: string) {
    const startInput = this.page.locator('input[type="date"]').first();
    const endInput = this.page.locator('input[type="date"]').nth(1);
    
    if (await startInput.count() > 0 && await endInput.count() > 0) {
      await startInput.fill(startDate);
      await endInput.fill(endDate);
    } else {
      await this.page.click('button:has-text("Pick a date range")');
      await this.page.waitForTimeout(300);
      
      const [, , startDay] = startDate.split('-');
      const [, , endDay] = endDate.split('-');
      
      await this.page.click(`.rdp-day:has-text("${parseInt(startDay, 10)}"):not(.rdp-day_outside)`);
      await this.page.click(`.rdp-day:has-text("${parseInt(endDay, 10)}"):not(.rdp-day_outside)`);
    }
  }

  async setTicketingOption(option: 'no_tickets' | 'selling_tickets') {
    const selectElement = this.page.locator('select').first();
    if (await selectElement.count() > 0) {
      const value = option === 'no_tickets' ? 'no_tickets' : 'selling_tickets';
      await selectElement.selectOption(value);
    } else {
      // Fallback to radio buttons or checkboxes
      const labelText = option === 'no_tickets' 
        ? 'No - Just Posting an Event'
        : 'Yes - Selling Tickets';
      await this.page.click(`label:has-text("${labelText}")`);
    }
  }

  async setDoorPrice(price: number) {
    await this.page.fill('input[placeholder*="door price"]', price.toString());
  }

  async addTicketType(ticket: {
    name: string;
    price: number;
    quantity: number;
    hasEarlyBird?: boolean;
    earlyBirdPrice?: number;
    earlyBirdEndDate?: string;
  }) {
    // Click add ticket button if exists
    const addButton = this.page.locator('button:has-text("Add Ticket Type")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await this.page.waitForTimeout(300);
    }

    // Fill ticket details
    const ticketNameInput = this.page.locator('input[placeholder*="ticket name"], input[placeholder*="Ticket Type"]').last();
    await ticketNameInput.fill(ticket.name);
    
    const priceInput = this.page.locator('input[placeholder*="price"], input[type="number"][placeholder*="0.00"]').last();
    await priceInput.fill(ticket.price.toString());
    
    const quantityInput = this.page.locator('input[placeholder*="quantity"], input[placeholder*="Available"]').last();
    await quantityInput.fill(ticket.quantity.toString());
    
    if (ticket.hasEarlyBird) {
      const earlyBirdCheckbox = this.page.locator('input[type="checkbox"]').last();
      await earlyBirdCheckbox.check();
      
      if (ticket.earlyBirdPrice) {
        const earlyPriceInput = this.page.locator('input[placeholder*="Early bird price"]').last();
        await earlyPriceInput.fill(ticket.earlyBirdPrice.toString());
      }
      
      if (ticket.earlyBirdEndDate) {
        const earlyDateInput = this.page.locator('input[type="date"]').last();
        await earlyDateInput.fill(ticket.earlyBirdEndDate);
      }
    }
  }

  async addTableConfiguration(table: {
    name: string;
    price: number;
    quantity: number;
    seatsPerTable: number;
  }) {
    await this.page.click('button:has-text("Add Table Type")');
    await this.page.waitForTimeout(300);
    
    await this.page.fill('input[placeholder*="Table name"]', table.name);
    await this.page.fill('input[placeholder*="seats per table"]', table.seatsPerTable.toString());
    await this.page.fill('input[placeholder*="Price per table"]', table.price.toString());
    await this.page.fill('input[placeholder*="Number of tables"]', table.quantity.toString());
  }

  async uploadImage(imagePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000); // Wait for upload
  }

  async clickNext() {
    await this.page.click('button:has-text("Next"), button:has-text("Continue")');
    await this.page.waitForTimeout(500);
  }

  async clickBack() {
    await this.page.click('button:has-text("Back"), button:has-text("Previous")');
    await this.page.waitForTimeout(500);
  }

  async submitEvent() {
    await this.page.click('button:has-text("Create Event"), button:has-text("Publish Event")');
    await this.page.waitForTimeout(2000);
  }

  async expectSuccessMessage() {
    const toast = this.page.locator('[role="alert"]:has-text("Success"), .toast:has-text("Created")');
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectEventPage() {
    await this.page.waitForURL('**/event/**', { timeout: 10000 });
  }

  async getEventId(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/event\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
}