/**
 * Test Constants - Single source of truth for test credentials
 * These match what's configured in lib/test-users.ts
 */

export const TEST_CREDENTIALS = {
  // Regular test user
  testUser: {
    email: "test@stepperslife.com",
    password: "Test123!",
    name: "Test User"
  },
  
  // Admin user
  adminUser: {
    email: "admin@stepperslife.com", 
    password: "Admin123!",
    name: "Admin User"
  },
  
  // Demo user
  demoUser: {
    email: "demo@stepperslife.com",
    password: "Demo123!",
    name: "Demo User"
  },
  
  // Default user for most tests
  default: {
    email: "test@stepperslife.com",
    password: "Test123!",
    name: "Test User"
  }
};

export const TEST_URLS = {
  local: "http://localhost:3001",
  production: "https://stepperslife.com"
};

export const TEST_TIMEOUTS = {
  navigation: 30000,
  action: 15000,
  short: 5000
};