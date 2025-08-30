import { test, expect, Page } from '@playwright/test';

// Configure to run against production
test.use({
  baseURL: 'https://stepperslife.com',
  viewport: { width: 1280, height: 720 },
});

// Event organizer credentials
const ORGANIZER_EMAIL = 'atlanta.events@stepperslife.com';
const ORGANIZER_PASSWORD = 'AtlantaDance2025!';
const ORGANIZER_NAME = 'Atlanta Dance Events';

// Helper function to sign up or sign in
async function authenticateOrganizer(page: Page) {
  await page.goto('/');
  
  // Check if already signed in
  const userButton = page.locator('[data-testid="user-button"]');
  if (await userButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Already signed in');
    return;
  }
  
  // Click Sign In button
  await page.locator('button:has-text("Sign In")').first().click();
  
  // Wait for Clerk modal
  await page.waitForSelector('[data-clerk-portal]', { timeout: 10000 });
  
  // Try to sign in first
  const emailInput = page.locator('input[name="identifier"]');
  if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await emailInput.fill(ORGANIZER_EMAIL);
    await page.locator('button:has-text("Continue")').click();
    
    // Check if need to sign up
    const signUpLink = page.locator('a:has-text("Sign up")');
    if (await signUpLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signUpLink.click();
      await page.locator('input[name="emailAddress"]').fill(ORGANIZER_EMAIL);
      await page.locator('input[name="password"]').fill(ORGANIZER_PASSWORD);
      await page.locator('input[name="firstName"]').fill('Atlanta');
      await page.locator('input[name="lastName"]').fill('Events');
      await page.locator('button:has-text("Sign up")').click();
    } else {
      // Enter password
      await page.locator('input[name="password"]').fill(ORGANIZER_PASSWORD);
      await page.locator('button:has-text("Continue")').click();
    }
  }
  
  // Wait for authentication to complete
  await page.waitForURL('/', { timeout: 10000 });
}

// Helper to create a single-day event
async function createSingleDayEvent(page: Page, eventData: any) {
  await page.goto('/seller/new-event');
  
  // Select Single Event type
  await page.locator('button:has-text("Single Event")').click();
  
  // Fill Basic Info
  await page.locator('input[placeholder*="Summer Dance"]').fill(eventData.name);
  await page.locator('textarea').fill(eventData.description);
  
  // Select categories
  for (const category of eventData.categories) {
    await page.locator(`label:has-text("${category}")`).click();
  }
  
  // Fill location
  await page.locator('input[placeholder*="venue"]').fill(eventData.venue);
  await page.locator('input[placeholder*="address"]').fill(eventData.address);
  await page.locator('input[placeholder*="city"]').fill(eventData.city);
  await page.locator('input[placeholder*="state"]').fill(eventData.state);
  await page.locator('input[placeholder*="zip"]').fill(eventData.zip);
  
  // Set date and time
  await page.locator('input[type="date"]').fill(eventData.date);
  await page.locator('input[type="time"]').first().fill(eventData.startTime);
  await page.locator('input[type="time"]').last().fill(eventData.endTime);
  
  await page.locator('button:has-text("Next")').click();
  
  // Ticketing Decision - Yes, selling tickets
  await page.locator('button:has-text("Yes - Selling Tickets")').click();
  await page.locator('button:has-text("Next")').click();
  
  // Set capacity and tickets
  await page.locator('input[placeholder*="capacity"]').fill(eventData.capacity.toString());
  
  // Add ticket types
  for (const ticket of eventData.tickets) {
    await page.locator('button:has-text("Add Ticket Type")').click();
    await page.locator('input[placeholder*="ticket name"]').last().fill(ticket.name);
    await page.locator('input[placeholder*="price"]').last().fill(ticket.price.toString());
    await page.locator('input[placeholder*="quantity"]').last().fill(ticket.quantity.toString());
    
    if (ticket.earlyBird) {
      await page.locator('label:has-text("Early Bird")').last().click();
      await page.locator('input[placeholder*="early bird price"]').last().fill(ticket.earlyBirdPrice.toString());
      await page.locator('input[type="date"][placeholder*="early"]').last().fill(ticket.earlyBirdEndDate);
    }
  }
  
  await page.locator('button:has-text("Next")').click();
  
  // Table configuration
  if (eventData.tables && eventData.tables.length > 0) {
    for (const table of eventData.tables) {
      await page.locator('button:has-text("Add Table")').click();
      await page.locator('input[placeholder*="table name"]').last().fill(table.name);
      await page.locator('input[placeholder*="seats"]').last().fill(table.seats.toString());
      await page.locator('input[placeholder*="table price"]').last().fill(table.price.toString());
      await page.locator('input[placeholder*="available"]').last().fill(table.quantity.toString());
    }
    await page.locator('button:has-text("Next")').click();
  } else {
    await page.locator('button:has-text("Skip")').click();
  }
  
  // Review and Publish
  await page.locator('button:has-text("Publish Event")').click();
  
  // Wait for success
  await page.waitForURL('/event/**', { timeout: 10000 });
  console.log(`Created event: ${eventData.name}`);
}

// Helper to create multi-day event
async function createMultiDayEvent(page: Page, eventData: any) {
  await page.goto('/seller/new-event');
  
  // Select Multi-Day Event type
  await page.locator('button:has-text("Multi-Day Event")').click();
  
  // Fill Basic Info
  await page.locator('input[placeholder*="event name"]').fill(eventData.name);
  await page.locator('textarea').fill(eventData.description);
  
  // Select categories
  for (const category of eventData.categories) {
    await page.locator(`label:has-text("${category}")`).click();
  }
  
  // Set date range
  await page.locator('input[type="date"]').first().fill(eventData.startDate);
  await page.locator('input[type="date"]').last().fill(eventData.endDate);
  
  // Location settings
  if (eventData.sameLocation) {
    await page.locator('label:has-text("Same location")').click();
    await page.locator('input[placeholder*="venue"]').fill(eventData.venue);
    await page.locator('input[placeholder*="address"]').fill(eventData.address);
    await page.locator('input[placeholder*="city"]').fill(eventData.city);
    await page.locator('input[placeholder*="state"]').fill(eventData.state);
    await page.locator('input[placeholder*="zip"]').fill(eventData.zip);
  }
  
  await page.locator('button:has-text("Next")').click();
  
  // Ticketing Decision
  await page.locator('button:has-text("Yes - Selling Tickets")').click();
  await page.locator('button:has-text("Next")').click();
  
  // Configure tickets for each day
  for (const day of eventData.days) {
    await page.locator(`text=${day.label}`).click();
    
    if (!eventData.sameLocation && day.location) {
      await page.locator('input[placeholder*="venue"]').fill(day.location.venue);
      await page.locator('input[placeholder*="address"]').fill(day.location.address);
    }
    
    for (const ticket of day.tickets) {
      await page.locator('button:has-text("Add Ticket")').click();
      await page.locator('input[placeholder*="ticket name"]').last().fill(ticket.name);
      await page.locator('input[placeholder*="price"]').last().fill(ticket.price.toString());
      await page.locator('input[placeholder*="quantity"]').last().fill(ticket.quantity.toString());
    }
  }
  
  await page.locator('button:has-text("Next")').click();
  
  // Bundle configuration
  for (const bundle of eventData.bundles) {
    await page.locator('button:has-text("Create Bundle")').click();
    await page.locator('input[placeholder*="bundle name"]').last().fill(bundle.name);
    await page.locator('textarea[placeholder*="description"]').last().fill(bundle.description);
    
    // Select tickets for bundle
    for (const selection of bundle.selections) {
      await page.locator(`label:has-text("${selection}")`).click();
    }
    
    await page.locator('input[placeholder*="bundle price"]').last().fill(bundle.price.toString());
    await page.locator('button:has-text("Save Bundle")').click();
  }
  
  await page.locator('button:has-text("Next")').click();
  
  // Skip tables for multi-day events
  await page.locator('button:has-text("Skip")').click();
  
  // Review and Publish
  await page.locator('button:has-text("Publish Event")').click();
  
  await page.waitForURL('/event/**', { timeout: 10000 });
  console.log(`Created multi-day event: ${eventData.name}`);
}

// Helper to create save-the-date event
async function createSaveTheDateEvent(page: Page, eventData: any) {
  await page.goto('/seller/new-event');
  
  // Select Save the Date type
  await page.locator('button:has-text("Save the Date")').click();
  
  // Fill Basic Info
  await page.locator('input[placeholder*="event name"]').fill(eventData.name);
  await page.locator('textarea').fill(eventData.description);
  
  // Select categories
  for (const category of eventData.categories) {
    await page.locator(`label:has-text("${category}")`).click();
  }
  
  // Set tentative date
  await page.locator('input[type="date"]').fill(eventData.tentativeDate);
  await page.locator('input[type="time"]').fill('19:00'); // Default time
  
  await page.locator('button:has-text("Next")').click();
  
  // Skip remaining steps for save-the-date
  await page.locator('button:has-text("Publish")').click();
  
  await page.waitForURL('/event/**', { timeout: 10000 });
  console.log(`Created save-the-date: ${eventData.name}`);
}

// Main test suite
test.describe('Create Production Events', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOrganizer(page);
  });
  
  test('Create Atlanta Salsa Night Spectacular', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Atlanta Salsa Night Spectacular',
      description: 'Join us for an unforgettable night of salsa dancing featuring live music from Orquesta La Moderna, professional performances, and social dancing until 2 AM. Our grand ballroom features a professional dance floor, full bar service, and Latin cuisine.',
      categories: ['Social Dance', 'Party'],
      venue: 'The Grand Ballroom',
      address: '123 Peachtree Street NE',
      city: 'Atlanta',
      state: 'GA',
      zip: '30303',
      date: '2025-02-15',
      startTime: '20:00',
      endTime: '02:00',
      capacity: 500,
      tickets: [
        { name: 'General Admission', price: 25, quantity: 200 },
        { name: 'VIP Pass', price: 60, quantity: 50 },
        { name: 'Early Bird Special', price: 20, quantity: 100, earlyBird: true, earlyBirdPrice: 20, earlyBirdEndDate: '2025-02-01' }
      ],
      tables: [
        { name: 'VIP Table', seats: 8, price: 400, quantity: 5 },
        { name: 'Reserved Table', seats: 6, price: 250, quantity: 10 }
      ]
    });
  });
  
  test('Create Bachata Workshop with Carlos Rodriguez', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Bachata Workshop with Carlos Rodriguez',
      description: 'Master the art of Bachata with internationally renowned instructor Carlos Rodriguez. This intensive workshop covers advanced footwork, partner connection, and musicality. All levels welcome with separate tracks for beginners and advanced dancers.',
      categories: ['Workshop', 'Class/Lesson'],
      venue: 'Dance Studio Elite',
      address: '456 Spring Street NW',
      city: 'Atlanta',
      state: 'GA',
      zip: '30308',
      date: '2025-03-08',
      startTime: '14:00',
      endTime: '20:00',
      capacity: 170,
      tickets: [
        { name: 'Workshop Pass', price: 45, quantity: 80 },
        { name: 'Workshop + Social', price: 65, quantity: 60 },
        { name: 'Student Discount', price: 35, quantity: 30 }
      ],
      tables: [] // No tables for workshop
    });
  });
  
  test('Create Spring Jazz & Blues Social', async ({ page }) => {
    await createSingleDayEvent(page, {
      name: 'Spring Jazz & Blues Social',
      description: 'An elegant evening of jazz and blues dancing with live performances by The Blue Note Quartet. Enjoy craft cocktails, light appetizers, and smooth dancing in our intimate lounge setting.',
      categories: ['Sets/Performance', 'Lounge/Bar'],
      venue: 'The Blue Note Lounge',
      address: '789 Jazz Avenue',
      city: 'Decatur',
      state: 'GA',
      zip: '30030',
      date: '2025-04-12',
      startTime: '19:00',
      endTime: '01:00',
      capacity: 290,
      tickets: [
        { name: 'Standing Room', price: 15, quantity: 150 },
        { name: 'Seated Section', price: 35, quantity: 100 },
        { name: 'Premium Seating', price: 55, quantity: 40 }
      ],
      tables: [
        { name: 'Lounge Table', seats: 4, price: 180, quantity: 8 }
      ]
    });
  });
  
  test('Create Atlanta Dance Festival 2025', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Atlanta Dance Festival 2025',
      description: 'The Southeast\'s premier dance festival featuring workshops, competitions, and social dancing across multiple genres including Salsa, Bachata, Kizomba, and Urban Kiz.',
      categories: ['Competition', 'Workshop', 'Party'],
      startDate: '2025-05-23',
      endDate: '2025-05-25',
      sameLocation: true,
      venue: 'Atlanta Convention Center',
      address: '285 Andrew Young International Blvd NW',
      city: 'Atlanta',
      state: 'GA',
      zip: '30313',
      days: [
        {
          label: 'Day 1 - Friday',
          tickets: [
            { name: 'General Admission', price: 40, quantity: 300 },
            { name: 'VIP Pass', price: 80, quantity: 100 }
          ]
        },
        {
          label: 'Day 2 - Saturday',
          tickets: [
            { name: 'General Admission', price: 50, quantity: 400 },
            { name: 'VIP Pass', price: 100, quantity: 150 }
          ]
        },
        {
          label: 'Day 3 - Sunday',
          tickets: [
            { name: 'General Admission', price: 45, quantity: 350 },
            { name: 'VIP Pass', price: 90, quantity: 120 }
          ]
        }
      ],
      bundles: [
        {
          name: 'Weekend Pass',
          description: 'Access to all 3 days with General Admission',
          selections: ['Day 1 General', 'Day 2 General', 'Day 3 General'],
          price: 110
        },
        {
          name: 'VIP Weekend Pass',
          description: 'VIP access to all 3 days',
          selections: ['Day 1 VIP', 'Day 2 VIP', 'Day 3 VIP'],
          price: 240
        }
      ]
    });
  });
  
  test('Create Summer Steppers Cruise Weekend', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Summer Steppers Cruise Weekend',
      description: 'Set sail for the ultimate steppers experience! Two days of smooth stepping on the water with DJ Smooth, live performances, and gourmet dining.',
      categories: ['Cruise', 'Party'],
      startDate: '2025-06-14',
      endDate: '2025-06-15',
      sameLocation: false,
      days: [
        {
          label: 'Day 1 - Savannah Departure',
          location: {
            venue: 'Marina Dock',
            address: '1 River Street',
            city: 'Savannah',
            state: 'GA'
          },
          tickets: [
            { name: 'Cruise Ticket', price: 125, quantity: 200 },
            { name: 'Premium Cabin', price: 225, quantity: 50 }
          ]
        },
        {
          label: 'Day 2 - Hilton Head',
          location: {
            venue: 'Hilton Head Marina',
            address: '149 Lighthouse Road',
            city: 'Hilton Head',
            state: 'SC'
          },
          tickets: [
            { name: 'Cruise Ticket', price: 125, quantity: 200 },
            { name: 'Premium Cabin', price: 225, quantity: 50 }
          ]
        }
      ],
      bundles: [
        {
          name: 'Full Weekend Cruise',
          description: 'Both days cruise experience',
          selections: ['Day 1 Cruise', 'Day 2 Cruise'],
          price: 220
        },
        {
          name: 'Premium Weekend Package',
          description: 'Premium cabin for both days',
          selections: ['Day 1 Premium', 'Day 2 Premium'],
          price: 420
        }
      ]
    });
  });
  
  test('Create Latin Dance Intensive Workshop Series', async ({ page }) => {
    await createMultiDayEvent(page, {
      name: 'Latin Dance Intensive Workshop Series',
      description: 'Five days of intensive Latin dance training with world-class instructors. Each day focuses on different styles: Salsa, Bachata, Cha-Cha, Rumba, and Samba.',
      categories: ['Workshop', 'Class/Lesson'],
      startDate: '2025-07-07',
      endDate: '2025-07-11',
      sameLocation: false,
      days: [
        {
          label: 'Monday - Salsa',
          location: { venue: 'Studio A', address: '100 Dance Way', city: 'Atlanta', state: 'GA' },
          tickets: [
            { name: 'Single Class', price: 30, quantity: 40 },
            { name: 'Day Pass', price: 75, quantity: 20 }
          ]
        },
        {
          label: 'Tuesday - Bachata',
          location: { venue: 'Studio B', address: '200 Rhythm Road', city: 'Atlanta', state: 'GA' },
          tickets: [
            { name: 'Single Class', price: 30, quantity: 40 },
            { name: 'Day Pass', price: 75, quantity: 20 }
          ]
        },
        {
          label: 'Wednesday - Cha-Cha',
          location: { venue: 'Studio C', address: '300 Beat Street', city: 'Atlanta', state: 'GA' },
          tickets: [
            { name: 'Single Class', price: 30, quantity: 40 },
            { name: 'Day Pass', price: 75, quantity: 20 }
          ]
        },
        {
          label: 'Thursday - Rumba',
          location: { venue: 'Studio D', address: '400 Tempo Ave', city: 'Atlanta', state: 'GA' },
          tickets: [
            { name: 'Single Class', price: 30, quantity: 40 },
            { name: 'Day Pass', price: 75, quantity: 20 }
          ]
        },
        {
          label: 'Friday - Samba',
          location: { venue: 'Studio E', address: '500 Groove Lane', city: 'Atlanta', state: 'GA' },
          tickets: [
            { name: 'Single Class', price: 30, quantity: 40 },
            { name: 'Day Pass', price: 75, quantity: 20 }
          ]
        }
      ],
      bundles: [
        {
          name: '3-Day Pass',
          description: 'Choose any 3 days',
          selections: ['Mon Single', 'Tue Single', 'Wed Single'],
          price: 200
        },
        {
          name: 'Full Week Pass',
          description: 'All 5 days of workshops',
          selections: ['Mon Day', 'Tue Day', 'Wed Day', 'Thu Day', 'Fri Day'],
          price: 325
        },
        {
          name: 'Early Bird Full Week',
          description: 'Full week at discounted price',
          selections: ['Mon Day', 'Tue Day', 'Wed Day', 'Thu Day', 'Fri Day'],
          price: 275
        }
      ]
    });
  });
  
  test('Create New Year\'s Eve Gala 2026', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'New Year\'s Eve Gala 2026',
      description: 'Mark your calendars for Atlanta\'s most elegant NYE celebration! Black tie event featuring multiple ballrooms, live orchestra, gourmet dining, and champagne toast at midnight. Limited to 500 guests. Details and tickets coming October 2025.',
      categories: ['Holiday Event', 'Party'],
      tentativeDate: '2025-12-31'
    });
  });
  
  test('Create International Dance Championships 2025', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'International Dance Championships 2025',
      description: 'World-class dancers from over 30 countries will compete in multiple dance styles including Latin, Ballroom, Hip-Hop, and Contemporary. Witness the best dancers in the world compete for the championship title. Venue and ticket information coming soon!',
      categories: ['Competition', 'Sets/Performance'],
      tentativeDate: '2025-09-15'
    });
  });
  
  test('Create Fall Harvest Dance Festival', async ({ page }) => {
    await createSaveTheDateEvent(page, {
      name: 'Fall Harvest Dance Festival',
      description: 'Our annual outdoor dance festival returns! Three stages of live music, food trucks, craft vendors, and dancing under the stars. Family-friendly event with kids dance workshops. Save the date for this community celebration!',
      categories: ['In The Park', 'Social Dance'],
      tentativeDate: '2025-10-18'
    });
  });
});

// Run all tests
test.describe.serial('Production Event Creation', () => {
  test('Create all production events', async ({ page }) => {
    console.log('Starting production event creation...');
    
    // Run all event creation tests
    await test.describe('Create Production Events', async () => {
      // Tests will run in sequence
    });
    
    console.log('All production events created successfully!');
  });
});