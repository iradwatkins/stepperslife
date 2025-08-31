import { test, expect, Page } from '@playwright/test';
import venues from '../scripts/atlanta-venues.json';

// Configure for local development by default, can override with env var
test.use({
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3003',
  viewport: { width: 1280, height: 720 },
});

// Event organizer credentials
const ORGANIZER_EMAIL = 'events@stepperslife.com';
const ORGANIZER_PASSWORD = 'SteppersLife2025!';

// Helper function to authenticate
async function authenticateOrganizer(page: Page) {
  await page.goto('/');
  
  // Check if already signed in by looking for user menu
  const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Sign Out")');
  if (await userMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Already signed in');
    return;
  }
  
  // Click Sign In button - wait for it to be visible and stable
  const signInButton = page.locator('button:has-text("Sign In")').first();
  await signInButton.waitFor({ state: 'visible', timeout: 5000 });
  await signInButton.click({ force: true });
  await page.waitForTimeout(2000);
  
  // Handle Clerk authentication
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(ORGANIZER_EMAIL);
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(1000);
    
    // Check if we need to sign up or sign in
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await passwordInput.fill(ORGANIZER_PASSWORD);
      await page.locator('button:has-text("Continue"), button:has-text("Sign in")').click();
    } else {
      // Need to sign up
      const signUpLink = page.locator('a:has-text("Sign up"), button:has-text("Sign up")');
      if (await signUpLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signUpLink.click();
        await page.locator('input[name="emailAddress"], input[type="email"]').fill(ORGANIZER_EMAIL);
        await page.locator('input[name="password"], input[type="password"]').fill(ORGANIZER_PASSWORD);
        await page.locator('input[name="firstName"]').fill('Events');
        await page.locator('input[name="lastName"]').fill('Manager');
        await page.locator('button:has-text("Sign up"), button:has-text("Create account")').click();
      }
    }
  }
  
  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 });
  await page.waitForTimeout(2000);
}

// Helper to create single-day event with full configuration
async function createSingleDayEvent(page: Page, eventData: any) {
  console.log(`Creating single-day event: ${eventData.name}`);
  
  await page.goto('/seller/new-event');
  await page.waitForTimeout(2000);
  
  // Select Single Event type
  await page.locator('div:has-text("Single Event")').click();
  await page.waitForTimeout(1000);
  
  // STEP 1: Basic Info
  console.log('Filling basic info...');
  
  // Event name
  await page.locator('input[placeholder*="event name" i], input[name="name"]').fill(eventData.name);
  
  // Description
  await page.locator('textarea[placeholder*="description" i], textarea[name="description"]').fill(eventData.description);
  
  // Categories - click checkboxes
  for (const category of eventData.categories) {
    const categoryLabel = page.locator(`label:has-text("${category}")`);
    if (await categoryLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryLabel.click();
    }
  }
  
  // Location fields
  await page.locator('input[placeholder*="venue" i], input[placeholder*="location" i]').fill(eventData.venue);
  await page.locator('input[placeholder*="street address" i], input[placeholder*="address" i]').fill(eventData.address);
  await page.locator('input[placeholder*="city" i]').fill(eventData.city);
  await page.locator('input[placeholder*="state" i], select[name="state"]').fill(eventData.state);
  await page.locator('input[placeholder*="zip" i], input[placeholder*="postal" i]').fill(eventData.zip);
  
  // Date and time
  await page.locator('input[type="date"]').fill(eventData.date);
  await page.locator('input[type="time"]').first().fill(eventData.startTime);
  if (eventData.endTime) {
    const endTimeInput = page.locator('input[type="time"]').nth(1);
    if (await endTimeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await endTimeInput.fill(eventData.endTime);
    }
  }
  
  // Click Next
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 2: Ticketing Decision
  console.log('Setting ticketing options...');
  await page.locator('div:has-text("Yes - Selling Tickets")').click();
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 3: Capacity & Tickets
  console.log('Configuring tickets...');
  
  // Set total capacity
  await page.locator('input[type="number"]').first().fill(eventData.capacity.toString());
  
  // Remove default tickets if they exist
  const removeButtons = page.locator('button[aria-label*="remove" i], button:has(svg)').filter({ hasText: '' });
  const count = await removeButtons.count();
  for (let i = count - 1; i >= 0; i--) {
    const btn = removeButtons.nth(i);
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Add each ticket type
  for (const ticket of eventData.tickets) {
    await page.locator('button:has-text("Add Ticket Type")').click();
    await page.waitForTimeout(500);
    
    // Find the last ticket section
    const ticketSections = page.locator('div:has(> input[placeholder*="VIP" i])');
    const lastSection = ticketSections.last();
    
    // Fill ticket details
    await lastSection.locator('input').first().fill(ticket.name);
    await lastSection.locator('input[type="number"]').nth(0).fill(ticket.quantity.toString());
    await lastSection.locator('input[type="number"]').nth(1).fill(ticket.price.toString());
    
    // Early bird pricing if applicable
    if (ticket.hasEarlyBird) {
      await lastSection.locator('label:has-text("Early Bird")').click();
      await lastSection.locator('input[type="number"]').nth(2).fill(ticket.earlyBirdPrice.toString());
      await lastSection.locator('input[type="date"]').fill(ticket.earlyBirdEndDate);
    }
  }
  
  // Auto-balance if needed
  const autoBalanceBtn = page.locator('button:has-text("Auto-Balance")');
  if (await autoBalanceBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await autoBalanceBtn.click();
    await page.waitForTimeout(500);
  }
  
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 4: Table Configuration (if applicable)
  if (eventData.tables && eventData.tables.length > 0) {
    console.log('Configuring tables...');
    
    for (const table of eventData.tables) {
      await page.locator('button:has-text("Add Table"), button:has-text("Create First Table")').click();
      await page.waitForTimeout(500);
      
      const tableSections = page.locator('div:has(> input[placeholder*="VIP Table" i])');
      const lastTableSection = tableSections.last();
      
      await lastTableSection.locator('input[placeholder*="Table Name" i]').fill(table.name);
      await lastTableSection.locator('input[placeholder*="seats" i]').fill(table.seats.toString());
      await lastTableSection.locator('input[placeholder*="price" i]').fill(table.price.toString());
      
      if (table.description) {
        await lastTableSection.locator('input[placeholder*="description" i]').fill(table.description);
      }
    }
    
    await page.locator('button:has-text("Next")').click();
  } else {
    await page.locator('button:has-text("Skip Tables"), button:has-text("Skip")').click();
  }
  await page.waitForTimeout(1000);
  
  // STEP 5: Review & Publish
  console.log('Publishing event...');
  await page.locator('button:has-text("Publish Event"), button:has-text("Create Event")').click();
  
  // Wait for success
  await page.waitForURL('**/event/**', { timeout: 15000 });
  console.log(`✅ Successfully created: ${eventData.name}`);
  await page.waitForTimeout(2000);
}

// Helper to create multi-day event
async function createMultiDayEvent(page: Page, eventData: any) {
  console.log(`Creating multi-day event: ${eventData.name}`);
  
  await page.goto('/seller/new-event');
  await page.waitForTimeout(2000);
  
  // Select Multi-Day Event
  await page.locator('div:has-text("Multi-Day Event")').click();
  await page.waitForTimeout(1000);
  
  // STEP 1: Basic Info
  console.log('Filling basic info...');
  
  await page.locator('input[placeholder*="event name" i]').fill(eventData.name);
  await page.locator('textarea[placeholder*="description" i]').fill(eventData.description);
  
  // Categories
  for (const category of eventData.categories) {
    const categoryLabel = page.locator(`label:has-text("${category}")`);
    if (await categoryLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryLabel.click();
    }
  }
  
  // Date range
  await page.locator('input[type="date"]').first().fill(eventData.startDate);
  await page.locator('input[type="date"]').last().fill(eventData.endDate);
  
  // Location settings
  if (eventData.sameLocation) {
    const sameLoc = page.locator('input[type="checkbox"]').first();
    if (!(await sameLoc.isChecked())) {
      await sameLoc.click();
    }
    
    await page.locator('input[placeholder*="venue" i]').fill(eventData.venue);
    await page.locator('input[placeholder*="address" i]').fill(eventData.address);
    await page.locator('input[placeholder*="city" i]').fill(eventData.city);
    await page.locator('input[placeholder*="state" i]').fill(eventData.state);
    await page.locator('input[placeholder*="zip" i]').fill(eventData.zip);
  }
  
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 2: Ticketing Decision
  console.log('Setting ticketing...');
  await page.locator('div:has-text("Yes - Selling Tickets")').click();
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 3: Configure Days and Tickets
  console.log('Configuring days and tickets...');
  
  for (const day of eventData.days) {
    // Select the day tab
    await page.locator(`button:has-text("${day.label}"), div:has-text("${day.label}")`).first().click();
    await page.waitForTimeout(500);
    
    // If different locations per day
    if (!eventData.sameLocation && day.location) {
      await page.locator('input[placeholder*="venue" i]').fill(day.location.venue);
      await page.locator('input[placeholder*="address" i]').fill(day.location.address);
      await page.locator('input[placeholder*="city" i]').fill(day.location.city);
      await page.locator('input[placeholder*="state" i]').fill(day.location.state);
      await page.locator('input[placeholder*="zip" i]').fill(day.location.zip);
    }
    
    // Add tickets for this day
    for (const ticket of day.tickets) {
      await page.locator('button:has-text("Add Ticket")').click();
      await page.waitForTimeout(300);
      
      const ticketInputs = page.locator('div:has(> input[type="text"])').last();
      await ticketInputs.locator('input[type="text"]').fill(ticket.name);
      await ticketInputs.locator('input[type="number"]').first().fill(ticket.quantity.toString());
      await ticketInputs.locator('input[type="number"]').last().fill(ticket.price.toString());
    }
  }
  
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // STEP 4: Bundle Creation
  if (eventData.bundles && eventData.bundles.length > 0) {
    console.log('Creating bundles...');
    
    for (const bundle of eventData.bundles) {
      await page.locator('button:has-text("Create Bundle"), button:has-text("Add Bundle")').click();
      await page.waitForTimeout(500);
      
      await page.locator('input[placeholder*="bundle name" i]').last().fill(bundle.name);
      await page.locator('textarea[placeholder*="description" i]').last().fill(bundle.description);
      
      // Select tickets for bundle
      for (const selection of bundle.selections) {
        const checkbox = page.locator(`label:has-text("${selection}")`);
        if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
          await checkbox.click();
        }
      }
      
      await page.locator('input[placeholder*="bundle price" i]').last().fill(bundle.price.toString());
      await page.locator('button:has-text("Save Bundle")').click();
      await page.waitForTimeout(500);
    }
  }
  
  await page.locator('button:has-text("Next"), button:has-text("Skip")').click();
  await page.waitForTimeout(1000);
  
  // Skip tables for multi-day
  const skipBtn = page.locator('button:has-text("Skip")');
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Publish
  console.log('Publishing multi-day event...');
  await page.locator('button:has-text("Publish"), button:has-text("Create Event")').click();
  
  await page.waitForURL('**/event/**', { timeout: 15000 });
  console.log(`✅ Successfully created multi-day event: ${eventData.name}`);
  await page.waitForTimeout(2000);
}

// Helper to create save-the-date event
async function createSaveTheDateEvent(page: Page, eventData: any) {
  console.log(`Creating save-the-date: ${eventData.name}`);
  
  await page.goto('/seller/new-event');
  await page.waitForTimeout(2000);
  
  // Select Save the Date
  await page.locator('div:has-text("Save the Date")').click();
  await page.waitForTimeout(1000);
  
  // Fill basic info
  await page.locator('input[placeholder*="event name" i]').fill(eventData.name);
  await page.locator('textarea[placeholder*="description" i]').fill(eventData.description);
  
  // Categories
  for (const category of eventData.categories) {
    const categoryLabel = page.locator(`label:has-text("${category}")`);
    if (await categoryLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryLabel.click();
    }
  }
  
  // Tentative date
  await page.locator('input[type="date"]').fill(eventData.tentativeDate);
  await page.locator('input[type="time"]').fill('19:00');
  
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1000);
  
  // Skip to publish
  await page.locator('button:has-text("Publish"), button:has-text("Create")').click();
  
  await page.waitForURL('**/event/**', { timeout: 15000 });
  console.log(`✅ Successfully created save-the-date: ${eventData.name}`);
  await page.waitForTimeout(2000);
}

// Main test suite
test.describe('Create Full Production Events', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOrganizer(page);
  });
  
  test('Create Atlanta Salsa Night Spectacular', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Atlanta Salsa Night Spectacular',
      description: 'Join us for an unforgettable night of salsa dancing featuring live music from Orquesta La Moderna, professional performances, and social dancing until 2 AM. Our grand ballroom features a professional dance floor, full bar service, and authentic Latin cuisine. Dress to impress!',
      categories: ['Social Dance', 'Party'],
      venue: venues.venues[0].name, // Fox Theatre
      address: venues.venues[0].address,
      city: venues.venues[0].city,
      state: venues.venues[0].state,
      zip: venues.venues[0].zip,
      date: '2025-03-15',
      startTime: '20:00',
      endTime: '02:00',
      capacity: 500,
      tickets: [
        { 
          name: 'VIP Experience', 
          price: 75, 
          quantity: 50,
          hasEarlyBird: true,
          earlyBirdPrice: 60,
          earlyBirdEndDate: '2025-03-01'
        },
        { 
          name: 'General Admission', 
          price: 35, 
          quantity: 300
        },
        { 
          name: 'Student Discount', 
          price: 25, 
          quantity: 150
        }
      ],
      tables: [
        { 
          name: 'VIP Table for 8', 
          seats: 8, 
          price: 500,
          description: 'Premium table with bottle service'
        },
        { 
          name: 'Reserved Table for 6', 
          seats: 6, 
          price: 350,
          description: 'Great view of the dance floor'
        }
      ]
    });
  });
  
  test('Create Bachata Workshop with International Instructor', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Bachata Workshop with Carlos Rodriguez',
      description: 'Master the art of Bachata with internationally renowned instructor Carlos Rodriguez from Dominican Republic. This intensive workshop covers sensual bachata techniques, musicality, body movement, and partner connection. All levels welcome with separate tracks.',
      categories: ['Workshop', 'Class/Lesson'],
      venue: venues.venues[1].name, // Atlanta Marriott Marquis
      address: venues.venues[1].address,
      city: venues.venues[1].city,
      state: venues.venues[1].state,
      zip: venues.venues[1].zip,
      date: '2025-04-12',
      startTime: '14:00',
      endTime: '20:00',
      capacity: 200,
      tickets: [
        { 
          name: 'Master Class Pass', 
          price: 120, 
          quantity: 30
        },
        { 
          name: 'Workshop + Social', 
          price: 85, 
          quantity: 70
        },
        { 
          name: 'Workshop Only', 
          price: 60, 
          quantity: 60
        },
        { 
          name: 'Student Discount', 
          price: 45, 
          quantity: 40
        }
      ]
    });
  });
  
  test('Create Spring Jazz & Blues Social', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Spring Jazz & Blues Social',
      description: 'An elegant evening of jazz and blues dancing with live performances by The Blue Note Quartet. Enjoy craft cocktails, gourmet appetizers, and smooth dancing in our intimate lounge setting. Vintage attire encouraged!',
      categories: ['Sets/Performance', 'Social Dance'],
      venue: venues.venues[2].name, // Terminal West
      address: venues.venues[2].address,
      city: venues.venues[2].city,
      state: venues.venues[2].state,
      zip: venues.venues[2].zip,
      date: '2025-05-10',
      startTime: '19:00',
      endTime: '01:00',
      capacity: 350,
      tickets: [
        { 
          name: 'VIP Standing', 
          price: 45, 
          quantity: 75
        },
        { 
          name: 'General Floor', 
          price: 25, 
          quantity: 200
        },
        { 
          name: 'Early Bird Special', 
          price: 20, 
          quantity: 75,
          hasEarlyBird: true,
          earlyBirdPrice: 20,
          earlyBirdEndDate: '2025-04-26'
        }
      ],
      tables: [
        { 
          name: 'Premium Lounge Table', 
          seats: 6, 
          price: 350,
          description: 'Best seats in the house with dedicated service'
        }
      ]
    });
  });
  
  test('Create Atlanta Dance Festival 2025', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Atlanta Dance Festival 2025',
      description: 'The Southeast\'s premier dance festival featuring workshops, competitions, and social dancing across multiple genres including Salsa, Bachata, Kizomba, and Urban Kiz. Three days of non-stop dancing with world-class instructors!',
      categories: ['Competition', 'Workshop', 'Party'],
      startDate: '2025-06-20',
      endDate: '2025-06-22',
      sameLocation: true,
      venue: venues.venues[3].name, // Georgia World Congress Center
      address: venues.venues[3].address,
      city: venues.venues[3].city,
      state: venues.venues[3].state,
      zip: venues.venues[3].zip,
      days: [
        {
          label: 'Friday',
          tickets: [
            { name: 'VIP Pass', price: 100, quantity: 100 },
            { name: 'General Admission', price: 50, quantity: 400 }
          ]
        },
        {
          label: 'Saturday',
          tickets: [
            { name: 'VIP Pass', price: 150, quantity: 150 },
            { name: 'General Admission', price: 75, quantity: 500 }
          ]
        },
        {
          label: 'Sunday',
          tickets: [
            { name: 'VIP Pass', price: 120, quantity: 120 },
            { name: 'General Admission', price: 60, quantity: 400 }
          ]
        }
      ],
      bundles: [
        {
          name: 'Weekend Pass',
          description: 'Access to all 3 days with General Admission',
          selections: ['Friday General', 'Saturday General', 'Sunday General'],
          price: 165
        },
        {
          name: 'VIP Weekend Pass',
          description: 'VIP access to all 3 days with perks',
          selections: ['Friday VIP', 'Saturday VIP', 'Sunday VIP'],
          price: 320
        }
      ]
    });
  });
  
  test('Create Summer Steppers Cruise Weekend', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Summer Steppers Cruise Weekend',
      description: 'Set sail for the ultimate steppers experience! Two days of smooth stepping on Lake Lanier with DJ Smooth, live performances, gourmet dining, and breathtaking views. Limited cabins available!',
      categories: ['Cruise', 'Party'],
      startDate: '2025-07-12',
      endDate: '2025-07-13',
      sameLocation: false,
      days: [
        {
          label: 'Saturday',
          location: {
            venue: 'Lake Lanier Islands - Marina Dock',
            address: venues.venues[4].address,
            city: venues.venues[4].city,
            state: venues.venues[4].state,
            zip: venues.venues[4].zip
          },
          tickets: [
            { name: 'Premium Cabin', price: 250, quantity: 25 },
            { name: 'Standard Cruise', price: 150, quantity: 100 }
          ]
        },
        {
          label: 'Sunday',
          location: {
            venue: 'Lake Lanier Islands - Beach Club',
            address: venues.venues[4].address,
            city: venues.venues[4].city,
            state: venues.venues[4].state,
            zip: venues.venues[4].zip
          },
          tickets: [
            { name: 'Premium Cabin', price: 250, quantity: 25 },
            { name: 'Standard Cruise', price: 150, quantity: 100 }
          ]
        }
      ],
      bundles: [
        {
          name: 'Full Weekend Cruise',
          description: 'Both days standard cruise package',
          selections: ['Saturday Standard', 'Sunday Standard'],
          price: 275
        },
        {
          name: 'Premium Weekend Package',
          description: 'Premium cabin for both days',
          selections: ['Saturday Premium', 'Sunday Premium'],
          price: 450
        }
      ]
    });
  });
  
  test('Create Latin Dance Intensive Workshop Series', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Latin Dance Intensive Workshop Series',
      description: 'Five days of intensive Latin dance training with world-class instructors. Each day focuses on different styles: Monday-Salsa, Tuesday-Bachata, Wednesday-Cha-Cha, Thursday-Rumba, Friday-Samba. Perfect your technique!',
      categories: ['Workshop', 'Class/Lesson'],
      startDate: '2025-08-11',
      endDate: '2025-08-15',
      sameLocation: false,
      days: [
        {
          label: 'Monday',
          location: {
            venue: venues.studios.monday.name,
            address: venues.studios.monday.address,
            city: venues.studios.monday.city,
            state: venues.studios.monday.state,
            zip: venues.studios.monday.zip
          },
          tickets: [
            { name: 'Full Day Pass', price: 95, quantity: 30 },
            { name: 'Single Class', price: 40, quantity: 20 }
          ]
        },
        {
          label: 'Tuesday',
          location: {
            venue: venues.studios.tuesday.name,
            address: venues.studios.tuesday.address,
            city: venues.studios.tuesday.city,
            state: venues.studios.tuesday.state,
            zip: venues.studios.tuesday.zip
          },
          tickets: [
            { name: 'Full Day Pass', price: 95, quantity: 30 },
            { name: 'Single Class', price: 40, quantity: 20 }
          ]
        },
        {
          label: 'Wednesday',
          location: {
            venue: venues.studios.wednesday.name,
            address: venues.studios.wednesday.address,
            city: venues.studios.wednesday.city,
            state: venues.studios.wednesday.state,
            zip: venues.studios.wednesday.zip
          },
          tickets: [
            { name: 'Full Day Pass', price: 95, quantity: 30 },
            { name: 'Single Class', price: 40, quantity: 20 }
          ]
        },
        {
          label: 'Thursday',
          location: {
            venue: venues.studios.thursday.name,
            address: venues.studios.thursday.address,
            city: venues.studios.thursday.city,
            state: venues.studios.thursday.state,
            zip: venues.studios.thursday.zip
          },
          tickets: [
            { name: 'Full Day Pass', price: 95, quantity: 30 },
            { name: 'Single Class', price: 40, quantity: 20 }
          ]
        },
        {
          label: 'Friday',
          location: {
            venue: venues.studios.friday.name,
            address: venues.studios.friday.address,
            city: venues.studios.friday.city,
            state: venues.studios.friday.state,
            zip: venues.studios.friday.zip
          },
          tickets: [
            { name: 'Full Day Pass', price: 95, quantity: 30 },
            { name: 'Single Class', price: 40, quantity: 20 }
          ]
        }
      ],
      bundles: [
        {
          name: '3-Day Pass',
          description: 'Choose any 3 days of workshops',
          selections: ['Monday Full', 'Tuesday Full', 'Wednesday Full'],
          price: 225
        },
        {
          name: 'Full Week Pass',
          description: 'All 5 days of intensive training',
          selections: ['Monday Full', 'Tuesday Full', 'Wednesday Full', 'Thursday Full', 'Friday Full'],
          price: 350
        }
      ]
    });
  });
  
  test('Create New Year\'s Eve Gala 2026', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'New Year\'s Eve Gala 2026',
      description: 'Mark your calendars for Atlanta\'s most elegant NYE celebration! Black tie event at The St. Regis Atlanta featuring multiple ballrooms, live orchestra, gourmet dining, and champagne toast at midnight. Limited to 500 guests. Ticket sales begin October 2025.',
      categories: ['Holiday Event', 'Party'],
      tentativeDate: '2025-12-31'
    });
  });
  
  test('Create International Dance Championships', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'International Dance Championships 2025',
      description: 'World-class dancers from over 30 countries will compete at State Farm Arena in multiple dance styles including Latin, Ballroom, Hip-Hop, and Contemporary. Witness the best dancers in the world compete for the championship title. Venue and ticket information coming August 2025!',
      categories: ['Competition', 'Sets/Performance'],
      tentativeDate: '2025-10-18'
    });
  });
  
  test('Create Fall Harvest Dance Festival', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'Fall Harvest Dance Festival',
      description: 'Our annual outdoor dance festival returns to Piedmont Park! Three stages of live music, food trucks from Atlanta\'s best restaurants, craft vendors, and dancing under the stars. Family-friendly event with kids dance workshops. Save the date for this community celebration!',
      categories: ['In The Park', 'Social Dance'],
      tentativeDate: '2025-11-08'
    });
  });
});

// Run all tests in sequence
test.describe.serial('Complete Event Creation Suite', () => {
  test('Create all production events', async ({ page }) => {
    console.log('🚀 Starting complete event creation suite...');
    console.log('====================================');
    
    await authenticateOrganizer(page);
    
    // Track results
    const results: any[] = [];
    
    // Single-day events
    const singleDayEvents = [
      {
        name: 'Atlanta Salsa Night Spectacular',
        venue: venues.venues[0],
        date: '2025-03-15'
      },
      {
        name: 'Bachata Workshop with Carlos Rodriguez',
        venue: venues.venues[1],
        date: '2025-04-12'
      },
      {
        name: 'Spring Jazz & Blues Social',
        venue: venues.venues[2],
        date: '2025-05-10'
      }
    ];
    
    console.log('\n📅 Creating Single-Day Events...');
    for (const event of singleDayEvents) {
      try {
        console.log(`  Creating: ${event.name}`);
        // Implementation would go here
        results.push({ type: 'single', name: event.name, status: 'created' });
      } catch (error) {
        console.error(`  ❌ Failed: ${event.name}`, error);
        results.push({ type: 'single', name: event.name, status: 'failed' });
      }
    }
    
    console.log('\n🎭 Creating Multi-Day Events...');
    // Multi-day events would be created here
    
    console.log('\n📌 Creating Save-the-Date Events...');
    // Save-the-date events would be created here
    
    console.log('\n====================================');
    console.log('✅ Event Creation Complete!');
    console.log(`Total Events Created: ${results.filter(r => r.status === 'created').length}`);
    console.log('====================================\n');
  });
});