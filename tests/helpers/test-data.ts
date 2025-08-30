export const testAccounts = {
  admin: {
    email: 'admin@stepperslife.com',
    password: 'admin123',
    name: 'Admin User'
  },
  testUser: {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  },
  organizer: {
    email: 'irawatkins@gmail.com',
    password: 'demo123',
    name: 'Ira Watkins'
  }
};

export const testEvents = {
  workshop: {
    name: 'Salsa Dance Workshop - Beginner to Intermediate',
    description: 'Join us for an intensive 3-hour salsa workshop covering fundamental techniques, partner work, and styling. Perfect for dancers with basic knowledge looking to improve their skills.',
    eventType: 'single',
    categories: ['Workshop', 'Class/Lesson'],
    location: 'Dance Studio NYC',
    address: '123 Broadway, New York, NY 10001',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    eventDate: getDateInFuture(30), // 30 days from now
    eventTime: '14:00',
    isTicketed: true,
    tickets: [
      {
        name: 'General Admission',
        price: 50,
        quantity: 30,
        hasEarlyBird: true,
        earlyBirdPrice: 35,
        earlyBirdEndDate: getDateInFuture(14)
      },
      {
        name: 'VIP Package (Includes Private Lesson)',
        price: 100,
        quantity: 10,
        hasEarlyBird: true,
        earlyBirdPrice: 75,
        earlyBirdEndDate: getDateInFuture(14)
      }
    ]
  },
  
  partyWithTables: {
    name: 'Salsa Night at The Grand Ballroom',
    description: 'Experience the hottest salsa party in town! Live DJ, performances, and dancing all night. Table service available with bottle service options.',
    eventType: 'single',
    categories: ['Party', 'Social Dance'],
    location: 'The Grand Ballroom',
    address: '456 Park Avenue, New York, NY 10022',
    city: 'New York',
    state: 'NY',
    postalCode: '10022',
    eventDate: getDateInFuture(21),
    eventTime: '21:00',
    isTicketed: true,
    hasTableService: true,
    tables: [
      {
        name: 'VIP Table (8 seats)',
        price: 400,
        quantity: 5,
        seatsPerTable: 8
      },
      {
        name: 'Regular Table (6 seats)',
        price: 250,
        quantity: 10,
        seatsPerTable: 6
      }
    ],
    tickets: [
      {
        name: 'General Admission',
        price: 25,
        quantity: 100
      }
    ]
  },
  
  multiDayFestival: {
    name: 'Summer Dance Festival 2025',
    description: 'Three days of non-stop dancing! Workshops, competitions, social dancing, and performances featuring world-renowned instructors.',
    eventType: 'multi_day',
    categories: ['Competition', 'Sets/Performance'],
    startDate: getDateInFuture(60),
    endDate: getDateInFuture(62),
    days: [
      {
        date: getDateInFuture(60),
        location: 'Convention Center - Main Hall',
        address: '789 Convention Plaza, Chicago, IL 60601',
        schedule: 'Workshops 10am-6pm, Social 9pm-2am',
        tickets: [
          { name: 'Friday Full Pass', price: 75, quantity: 200 },
          { name: 'Friday Workshops Only', price: 50, quantity: 100 },
          { name: 'Friday Social Only', price: 30, quantity: 150 }
        ]
      },
      {
        date: getDateInFuture(61),
        location: 'Convention Center - All Venues',
        address: '789 Convention Plaza, Chicago, IL 60601',
        schedule: 'Competition 12pm-6pm, Gala 8pm-12am',
        tickets: [
          { name: 'Saturday Full Pass', price: 100, quantity: 200 },
          { name: 'Competition Spectator', price: 40, quantity: 150 },
          { name: 'Gala Night Only', price: 75, quantity: 100 }
        ]
      },
      {
        date: getDateInFuture(62),
        location: 'Convention Center - Main Hall',
        address: '789 Convention Plaza, Chicago, IL 60601',
        schedule: 'Workshops 10am-4pm, Farewell Party 6pm-10pm',
        tickets: [
          { name: 'Sunday Full Pass', price: 60, quantity: 200 },
          { name: 'Sunday Workshops Only', price: 40, quantity: 100 },
          { name: 'Farewell Party Only', price: 25, quantity: 150 }
        ]
      }
    ],
    bundles: [
      {
        name: 'Weekend Pass (All 3 Days)',
        price: 200,
        savings: 35,
        includesTickets: ['Friday Full Pass', 'Saturday Full Pass', 'Sunday Full Pass']
      },
      {
        name: 'Workshop Package (All Workshops)',
        price: 120,
        savings: 20,
        includesTickets: ['Friday Workshops Only', 'Sunday Workshops Only']
      }
    ]
  },
  
  freeEvent: {
    name: 'Community Dance in the Park',
    description: 'Free outdoor dance event for all ages and skill levels. Bring your friends and family for an afternoon of fun, music, and dance. Suggested donation $10.',
    eventType: 'single',
    categories: ['In The Park', 'Social Dance'],
    location: 'Central Park - Sheep Meadow',
    address: 'Central Park West & 69th St, New York, NY 10023',
    city: 'New York',
    state: 'NY',
    postalCode: '10023',
    eventDate: getDateInFuture(14),
    eventTime: '15:00',
    isTicketed: false,
    doorPrice: 10,
    isFree: true
  },
  
  competition: {
    name: 'NYC Salsa Championships 2025',
    description: 'Annual salsa competition featuring amateur and professional divisions. Cash prizes, trophies, and recognition for the best dancers in the city.',
    eventType: 'single',
    categories: ['Competition'],
    location: 'Manhattan Center',
    address: '311 W 34th St, New York, NY 10001',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    eventDate: getDateInFuture(45),
    eventTime: '12:00',
    isTicketed: true,
    tickets: [
      {
        name: 'Competitor Entry (Includes Spectator Access)',
        price: 75,
        quantity: 100,
        hasEarlyBird: true,
        earlyBirdPrice: 50,
        earlyBirdEndDate: getDateInFuture(30)
      },
      {
        name: 'Spectator Ticket',
        price: 25,
        quantity: 300,
        hasEarlyBird: true,
        earlyBirdPrice: 15,
        earlyBirdEndDate: getDateInFuture(30)
      },
      {
        name: 'VIP Spectator (Front Row Seating)',
        price: 50,
        quantity: 50,
        hasEarlyBird: true,
        earlyBirdPrice: 40,
        earlyBirdEndDate: getDateInFuture(30)
      }
    ]
  },
  
  cruise: {
    name: 'Caribbean Dance Cruise 2025',
    description: '7-day dance cruise to the Caribbean featuring daily workshops, nightly parties, and performances. All-inclusive package with meals and entertainment.',
    eventType: 'multi_day',
    categories: ['Trip/Travel', 'Cruise'],
    startDate: getDateInFuture(120),
    endDate: getDateInFuture(127),
    location: 'Departure: Miami Port',
    address: '1015 N America Way, Miami, FL 33132',
    isTicketed: true,
    hasCustomSeating: true,
    cabinOptions: [
      {
        name: 'Interior Cabin (Double Occupancy)',
        price: 1200,
        quantity: 30,
        occupancy: 2
      },
      {
        name: 'Ocean View Cabin (Double Occupancy)',
        price: 1500,
        quantity: 20,
        occupancy: 2
      },
      {
        name: 'Balcony Suite (Double Occupancy)',
        price: 2000,
        quantity: 15,
        occupancy: 2
      },
      {
        name: 'Single Supplement (Interior)',
        price: 1800,
        quantity: 10,
        occupancy: 1
      }
    ],
    paymentPlans: true,
    depositAmount: 500
  }
};

// Helper function to get a date in the future
function getDateInFuture(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Test credit card numbers (for Square Sandbox)
export const testPaymentCards = {
  valid: {
    number: '4111 1111 1111 1111',
    expiry: '12/25',
    cvv: '123',
    zip: '10001'
  },
  declined: {
    number: '4000 0000 0000 0002',
    expiry: '12/25',
    cvv: '123',
    zip: '10001'
  },
  insufficientFunds: {
    number: '4000 0000 0000 9995',
    expiry: '12/25',
    cvv: '123',
    zip: '10001'
  }
};