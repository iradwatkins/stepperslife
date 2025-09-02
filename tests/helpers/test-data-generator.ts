import * as path from "path";

// Test configuration
export const TEST_CONFIG = {
  email: "appvillagellc@gmail.com",
  address: {
    street: "2740 W 83rd Pl",
    city: "Chicago",
    state: "IL",
    postalCode: "60652",
    fullAddress: "2740 W 83rd Pl, Chicago, IL 60652"
  },
  imagePath: path.resolve("/Users/irawatkins/Documents/stepperslife/images/243284255_377446473924733_3064788508478518395_n.jpeg"),
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000"
};

// Generate unique event names with timestamp
export function generateEventName(prefix: string): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix} - Test ${timestamp}-${random}`;
}

// Generate event data for different scenarios
export function generateEventData(type: "single" | "multi_day" | "save_the_date" | "door_only") {
  const baseData = {
    name: generateEventName(getEventPrefix(type)),
    description: `This is a test event created by Playwright automated testing. Type: ${type}`,
    location: "Chicago Test Venue",
    address: TEST_CONFIG.address.street,
    city: TEST_CONFIG.address.city,
    state: TEST_CONFIG.address.state,
    postalCode: TEST_CONFIG.address.postalCode,
    eventDate: getFutureDate(30), // 30 days from now
    eventTime: "19:00",
    endTime: "23:00",
    categories: ["Social Dance", "Party", "Workshop"],
    mainImage: TEST_CONFIG.imagePath
  };

  switch (type) {
    case "single":
      return {
        ...baseData,
        isTicketed: true,
        totalCapacity: 200,
        ticketTypes: [
          {
            name: "General Admission",
            quantity: 100,
            price: 25.00,
            hasEarlyBird: true,
            earlyBirdPrice: 20.00,
            earlyBirdEndDate: getFutureDate(14) // 14 days from now
          },
          {
            name: "VIP",
            quantity: 50,
            price: 50.00,
            hasEarlyBird: true,
            earlyBirdPrice: 40.00,
            earlyBirdEndDate: getFutureDate(14)
          },
          {
            name: "Student",
            quantity: 50,
            price: 15.00,
            hasEarlyBird: false
          }
        ]
      };

    case "door_only":
      return {
        ...baseData,
        name: generateEventName("Door Price Event"),
        isTicketed: false,
        doorPrice: 30.00
      };

    case "save_the_date":
      return {
        ...baseData,
        name: generateEventName("Save The Date"),
        isSaveTheDate: true,
        isTicketed: false,
        description: "Mark your calendars! Full details coming soon for this amazing event."
      };

    case "multi_day":
      return {
        ...baseData,
        name: generateEventName("Multi-Day Festival"),
        isMultiDay: true,
        days: [
          {
            date: getFutureDate(30),
            startTime: "18:00",
            endTime: "23:00",
            description: "Day 1 - Opening Night",
            ticketTypes: [
              { name: "General", quantity: 100, price: 30 },
              { name: "VIP", quantity: 50, price: 60 }
            ]
          },
          {
            date: getFutureDate(31),
            startTime: "12:00",
            endTime: "23:00",
            description: "Day 2 - Main Event",
            ticketTypes: [
              { name: "General", quantity: 150, price: 40 },
              { name: "VIP", quantity: 50, price: 80 }
            ]
          },
          {
            date: getFutureDate(32),
            startTime: "10:00",
            endTime: "18:00",
            description: "Day 3 - Closing Ceremony",
            ticketTypes: [
              { name: "General", quantity: 100, price: 25 },
              { name: "VIP", quantity: 50, price: 50 }
            ]
          }
        ],
        bundles: [
          {
            name: "3-Day Pass",
            price: 80,
            savings: 15,
            includesDays: [0, 1, 2],
            ticketType: "General"
          },
          {
            name: "VIP Weekend",
            price: 150,
            savings: 40,
            includesDays: [0, 1, 2],
            ticketType: "VIP"
          }
        ]
      };

    default:
      return baseData;
  }
}

// Helper to get event type prefix
function getEventPrefix(type: string): string {
  switch (type) {
    case "single":
      return "Single Day Dance";
    case "multi_day":
      return "Multi-Day Festival";
    case "save_the_date":
      return "Upcoming Event";
    case "door_only":
      return "Cash at Door";
    default:
      return "Test Event";
  }
}

// Helper to get future date string
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Test user credentials
export const TEST_USER = {
  email: TEST_CONFIG.email,
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  firstName: "Test",
  lastName: "User"
};

// Validation helpers
export function validateEventCreated(eventData: any): boolean {
  return !!(
    eventData &&
    eventData.id &&
    eventData.name &&
    eventData.userId
  );
}

export function validateTicketsCreated(tickets: any[]): boolean {
  return tickets && tickets.length > 0 && tickets.every(t => 
    t.id && t.name && t.price >= 0 && t.quantity >= 0
  );
}

// Logging helper for test debugging
export function logTestStep(step: string, details?: any) {
  console.log(`\n[TEST STEP] ${step}`);
  if (details) {
    console.log("[DETAILS]", JSON.stringify(details, null, 2));
  }
}

// Wait helper with custom timeout
export async function waitForElement(page: any, selector: string, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.error(`Element not found: ${selector}`);
    return false;
  }
}

// Screenshot helper for debugging
export async function takeDebugScreenshot(page: any, name: string) {
  const screenshotPath = path.join(__dirname, "..", "screenshots", `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}