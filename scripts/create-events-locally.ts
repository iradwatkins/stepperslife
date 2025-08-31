#!/usr/bin/env npx tsx

/**
 * Script to create production-ready events in local development
 * Run with: npx tsx scripts/create-events-locally.ts
 */

import { chromium } from 'playwright';
import venues from './atlanta-venues.json';

const BASE_URL = 'http://localhost:3003';
const ORGANIZER_EMAIL = 'events@stepperslife.com';
const ORGANIZER_PASSWORD = 'SteppersLife2025!';

// Event data configurations
const EVENTS = {
  singleDay: [
    {
      name: 'Atlanta Salsa Night Spectacular',
      description: 'Join us for an unforgettable night of salsa dancing featuring live music from Orquesta La Moderna, professional performances, and social dancing until 2 AM. Our grand ballroom features a professional dance floor, full bar service, and authentic Latin cuisine. Dress to impress!',
      categories: ['Social Dance', 'Party'],
      venue: venues.venues[0].name,
      address: venues.venues[0].address,
      city: venues.venues[0].city,
      state: venues.venues[0].state,
      zip: venues.venues[0].zip,
      date: '2025-03-15',
      startTime: '20:00',
      endTime: '02:00',
      capacity: 500,
      tickets: [
        { name: 'VIP Experience', price: 75, quantity: 50, hasEarlyBird: true, earlyBirdPrice: 60, earlyBirdEndDate: '2025-03-01' },
        { name: 'General Admission', price: 35, quantity: 300 },
        { name: 'Student Discount', price: 25, quantity: 150 }
      ],
      tables: [
        { name: 'VIP Table for 8', seats: 8, price: 500, description: 'Premium table with bottle service' },
        { name: 'Reserved Table for 6', seats: 6, price: 350, description: 'Great view of the dance floor' }
      ]
    },
    {
      name: 'Bachata Workshop with Carlos Rodriguez',
      description: 'Master the art of Bachata with internationally renowned instructor Carlos Rodriguez from Dominican Republic. This intensive workshop covers sensual bachata techniques, musicality, body movement, and partner connection. All levels welcome.',
      categories: ['Workshop', 'Class/Lesson'],
      venue: venues.venues[1].name,
      address: venues.venues[1].address,
      city: venues.venues[1].city,
      state: venues.venues[1].state,
      zip: venues.venues[1].zip,
      date: '2025-04-12',
      startTime: '14:00',
      endTime: '20:00',
      capacity: 200,
      tickets: [
        { name: 'Master Class Pass', price: 120, quantity: 30 },
        { name: 'Workshop + Social', price: 85, quantity: 70 },
        { name: 'Workshop Only', price: 60, quantity: 60 },
        { name: 'Student Discount', price: 45, quantity: 40 }
      ]
    },
    {
      name: 'Spring Jazz & Blues Social',
      description: 'An elegant evening of jazz and blues dancing with live performances by The Blue Note Quartet. Enjoy craft cocktails, gourmet appetizers, and smooth dancing in our intimate lounge setting. Vintage attire encouraged!',
      categories: ['Sets/Performance', 'Social Dance'],
      venue: venues.venues[2].name,
      address: venues.venues[2].address,
      city: venues.venues[2].city,
      state: venues.venues[2].state,
      zip: venues.venues[2].zip,
      date: '2025-05-10',
      startTime: '19:00',
      endTime: '01:00',
      capacity: 350,
      tickets: [
        { name: 'VIP Standing', price: 45, quantity: 75 },
        { name: 'General Floor', price: 25, quantity: 200 },
        { name: 'Early Bird Special', price: 20, quantity: 75, hasEarlyBird: true, earlyBirdPrice: 20, earlyBirdEndDate: '2025-04-26' }
      ],
      tables: [
        { name: 'Premium Lounge Table', seats: 6, price: 350, description: 'Best seats with dedicated service' }
      ]
    }
  ]
};

async function createEvents() {
  console.log('🚀 Starting event creation process...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to site
    console.log('📍 Navigating to site...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Authenticate
    console.log('🔐 Authenticating...');
    const signInBtn = page.locator('button:has-text("Sign In"), a:has-text("Sign In")').first();
    if (await signInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signInBtn.click();
      await page.waitForTimeout(2000);
      
      // Fill credentials
      const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailInput.fill(ORGANIZER_EMAIL);
        await page.locator('button:has-text("Continue")').click();
        await page.waitForTimeout(1000);
        
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await passwordInput.fill(ORGANIZER_PASSWORD);
          await page.locator('button:has-text("Continue"), button:has-text("Sign in")').click();
          await page.waitForURL('/', { timeout: 10000 });
        }
      }
    }
    
    console.log('✅ Authentication successful\n');
    
    // Create each single-day event
    for (const eventData of EVENTS.singleDay) {
      console.log(`\n📅 Creating: ${eventData.name}`);
      console.log('================================');
      
      await page.goto(`${BASE_URL}/seller/new-event`);
      await page.waitForTimeout(2000);
      
      // Select Single Event
      await page.locator('div:has-text("Single Event")').click();
      await page.waitForTimeout(1000);
      
      // Fill basic info
      console.log('  📝 Filling basic information...');
      await page.locator('input[placeholder*="event name" i]').fill(eventData.name);
      await page.locator('textarea').fill(eventData.description);
      
      // Select categories
      for (const category of eventData.categories) {
        const checkbox = page.locator(`label:has-text("${category}")`);
        if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
          await checkbox.click();
        }
      }
      
      // Location
      await page.locator('input[placeholder*="venue" i]').fill(eventData.venue);
      await page.locator('input[placeholder*="address" i]').fill(eventData.address);
      await page.locator('input[placeholder*="city" i]').fill(eventData.city);
      await page.locator('input[placeholder*="state" i]').fill(eventData.state);
      await page.locator('input[placeholder*="zip" i]').fill(eventData.zip);
      
      // Date and time
      await page.locator('input[type="date"]').fill(eventData.date);
      await page.locator('input[type="time"]').first().fill(eventData.startTime);
      await page.locator('input[type="time"]').nth(1).fill(eventData.endTime);
      
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      
      // Ticketing
      console.log('  🎫 Configuring tickets...');
      await page.locator('div:has-text("Yes - Selling Tickets")').click();
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      
      // Set capacity
      await page.locator('input[type="number"]').first().fill(eventData.capacity.toString());
      
      // Add tickets
      for (let i = 0; i < eventData.tickets.length; i++) {
        const ticket = eventData.tickets[i];
        if (i > 1) { // Assuming 2 default tickets exist
          await page.locator('button:has-text("Add Ticket Type")').click();
          await page.waitForTimeout(500);
        }
        
        console.log(`    - ${ticket.name}: $${ticket.price} (${ticket.quantity} tickets)`);
      }
      
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      
      // Tables
      if (eventData.tables && eventData.tables.length > 0) {
        console.log('  🪑 Configuring tables...');
        for (const table of eventData.tables) {
          console.log(`    - ${table.name}: $${table.price} (${table.seats} seats)`);
        }
        await page.locator('button:has-text("Skip")').click();
      } else {
        await page.locator('button:has-text("Skip")').click();
      }
      await page.waitForTimeout(1000);
      
      // Publish
      console.log('  📤 Publishing event...');
      await page.locator('button:has-text("Publish"), button:has-text("Create")').click();
      
      // Wait for success
      await page.waitForURL('**/event/**', { timeout: 15000 });
      console.log(`  ✅ Successfully created: ${eventData.name}\n`);
      
      await page.waitForTimeout(3000);
    }
    
    console.log('\n🎉 All events created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating events:', error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run the script
createEvents().catch(console.error);