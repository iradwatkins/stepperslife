#!/usr/bin/env npx tsx

/**
 * Script to add ticket types to existing events in Convex
 * This will create comprehensive ticket configurations for all events
 */

import { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Use the development Convex instance
const client = new ConvexClient('https://quiet-robin-620.convex.cloud');

async function addTicketsToEvents() {
  console.log('🎫 Adding ticket types to existing events...\n');

  try {
    // Get all events
    const events = await client.query(api.events.get);
    console.log(`Found ${events.length} events in database\n`);

    // Define ticket configurations for each event
    const ticketConfigs = {
      'Atlanta Salsa Night Spectacular': {
        ticketTypes: [
          { name: 'VIP Experience', category: 'vip' as const, price: 75, allocatedQuantity: 50, hasEarlyBird: true, earlyBirdPrice: 60, earlyBirdEndDate: new Date('2025-03-01').getTime() },
          { name: 'General Admission', category: 'general' as const, price: 35, allocatedQuantity: 300, hasEarlyBird: false },
          { name: 'Student Discount', category: 'general' as const, price: 25, allocatedQuantity: 150, hasEarlyBird: false }
        ]
      },
      'Bachata Workshop with Carlos Rodriguez': {
        ticketTypes: [
          { name: 'Master Class Pass', category: 'vip' as const, price: 120, allocatedQuantity: 30, hasEarlyBird: false },
          { name: 'Workshop + Social', category: 'general' as const, price: 85, allocatedQuantity: 70, hasEarlyBird: false },
          { name: 'Workshop Only', category: 'general' as const, price: 60, allocatedQuantity: 60, hasEarlyBird: false },
          { name: 'Student Discount', category: 'general' as const, price: 45, allocatedQuantity: 40, hasEarlyBird: false }
        ]
      },
      'Spring Jazz & Blues Social': {
        ticketTypes: [
          { name: 'VIP Standing', category: 'vip' as const, price: 45, allocatedQuantity: 75, hasEarlyBird: false },
          { name: 'General Floor', category: 'general' as const, price: 25, allocatedQuantity: 200, hasEarlyBird: false },
          { name: 'Early Bird Special', category: 'early_bird' as const, price: 20, allocatedQuantity: 75, hasEarlyBird: true, earlyBirdPrice: 20, earlyBirdEndDate: new Date('2025-04-26').getTime() }
        ]
      },
      'Atlanta Dance Festival 2025': {
        ticketTypes: [
          { name: 'VIP Weekend Pass', category: 'vip' as const, price: 350, allocatedQuantity: 100, hasEarlyBird: true, earlyBirdPrice: 300, earlyBirdEndDate: new Date('2025-05-01').getTime() },
          { name: 'General Weekend Pass', category: 'general' as const, price: 180, allocatedQuantity: 400, hasEarlyBird: true, earlyBirdPrice: 150, earlyBirdEndDate: new Date('2025-05-01').getTime() },
          { name: 'Friday Only', category: 'general' as const, price: 50, allocatedQuantity: 200, hasEarlyBird: false },
          { name: 'Saturday Only', category: 'general' as const, price: 75, allocatedQuantity: 200, hasEarlyBird: false },
          { name: 'Sunday Only', category: 'general' as const, price: 60, allocatedQuantity: 200, hasEarlyBird: false }
        ]
      },
      'Summer Steppers Cruise Weekend': {
        ticketTypes: [
          { name: 'Premium Cabin Weekend', category: 'vip' as const, price: 450, allocatedQuantity: 25, hasEarlyBird: true, earlyBirdPrice: 400, earlyBirdEndDate: new Date('2025-06-01').getTime() },
          { name: 'Standard Cruise Weekend', category: 'general' as const, price: 275, allocatedQuantity: 100, hasEarlyBird: true, earlyBirdPrice: 250, earlyBirdEndDate: new Date('2025-06-01').getTime() },
          { name: 'Saturday Only', category: 'general' as const, price: 150, allocatedQuantity: 50, hasEarlyBird: false },
          { name: 'Sunday Only', category: 'general' as const, price: 150, allocatedQuantity: 50, hasEarlyBird: false }
        ]
      },
      'Latin Dance Intensive Workshop Series': {
        ticketTypes: [
          { name: 'Full Week Pass', category: 'vip' as const, price: 350, allocatedQuantity: 30, hasEarlyBird: true, earlyBirdPrice: 300, earlyBirdEndDate: new Date('2025-06-20').getTime() },
          { name: '3-Day Pass', category: 'general' as const, price: 225, allocatedQuantity: 40, hasEarlyBird: true, earlyBirdPrice: 200, earlyBirdEndDate: new Date('2025-06-20').getTime() },
          { name: 'Daily Workshop Pass', category: 'general' as const, price: 95, allocatedQuantity: 50, hasEarlyBird: false },
          { name: 'Single Class', category: 'general' as const, price: 40, allocatedQuantity: 100, hasEarlyBird: false }
        ]
      }
    };

    // Add tickets to each event
    for (const event of events) {
      const config = ticketConfigs[event.name];
      
      if (config && !event.isSaveTheDate) {
        console.log(`\n📌 ${event.name}`);
        console.log(`   Event ID: ${event._id}`);
        
        try {
          // Create ticket types for the event
          const ticketTypeIds = await client.mutation(api.ticketTypes.createSingleEventTickets, {
            eventId: event._id,
            ticketTypes: config.ticketTypes
          });
          
          console.log(`   ✅ Created ${ticketTypeIds.length} ticket types`);
          
          // Log ticket details
          for (const ticketType of config.ticketTypes) {
            console.log(`      - ${ticketType.name}: $${ticketType.price} (${ticketType.allocatedQuantity} tickets)`);
            if (ticketType.hasEarlyBird) {
              console.log(`        Early Bird: $${ticketType.earlyBirdPrice}`);
            }
          }
          
          // Update event to be ticketed
          const totalCapacity = config.ticketTypes.reduce((sum, t) => sum + t.allocatedQuantity, 0);
          await client.mutation(api.events.updateEvent, {
            eventId: event._id,
            name: event.name,
            description: event.description,
            location: event.location,
            eventDate: event.eventDate,
            price: event.price,
            totalTickets: totalCapacity,
            isTicketed: true,
            eventCategories: event.eventCategories
          });
          
        } catch (error) {
          console.log(`   ⚠️  Error: ${error.message}`);
          console.log(`      (Tickets may already exist for this event)`);
        }
      } else if (event.isSaveTheDate) {
        console.log(`\n📅 ${event.name}`);
        console.log(`   Save-the-date event - no tickets needed`);
      }
    }
    
    console.log('\n\n✅ Ticket configuration complete!');
    console.log('====================================');
    console.log('Summary:');
    console.log('- VIP and General admission tiers');
    console.log('- Early bird pricing');
    console.log('- Student discounts');
    console.log('- Weekend passes for multi-day events');
    console.log('- All events ready for ticket sales!');
    
  } catch (error) {
    console.error('Error adding tickets:', error);
  } finally {
    await client.close();
  }
}

// Run the script
addTicketsToEvents().catch(console.error);