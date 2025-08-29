let Client: any;
try {
  const square = require('square');
  Client = square.Client;
} catch (error) {
  console.warn("Square SDK not available, using mock client");
  // Mock client for when Square is not available
  Client = class MockClient {
    constructor(config: any) {
      this.config = config;
    }
    paymentsApi = {};
    customersApi = {};
    refundsApi = {};
    checkoutApi = {};
    webhooksHelper = {};
    oAuthApi = {};
  };
}

import { getSquareCredentials } from "./vault";

let squareClientInstance: any = null;
let locationIdCache: string | null = null;

/**
 * Get or create Square client instance with Vault credentials
 */
async function getSquareClient(): Promise<any> {
  if (!squareClientInstance) {
    // During build time, return a dummy client
    if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      squareClientInstance = new Client({
        accessToken: 'dummy-token-for-build',
        environment: 'sandbox',
      });
      locationIdCache = 'dummy-location-id';
      return squareClientInstance;
    }
    
    try {
      const credentials = await getSquareCredentials();
      
      if (!credentials.accessToken || !credentials.locationId) {
        // Fallback to environment variables if Vault is not available
        const accessToken = process.env.SQUARE_ACCESS_TOKEN;
        const locationId = process.env.SQUARE_LOCATION_ID;
        
        if (!accessToken || !locationId) {
          console.log("Square credentials not found, using mock");
        }
        
        squareClientInstance = new Client({
          accessToken: accessToken || 'dummy-token',
          environment: 'sandbox',
        });
        locationIdCache = locationId || 'dummy-location-id';
      } else {
        squareClientInstance = new Client({
          accessToken: credentials.accessToken,
          environment: 'sandbox',
        });
        locationIdCache = credentials.locationId;
      }
    } catch (error) {
      console.error("Failed to initialize Square client:", error);
      // Return dummy client for build
      squareClientInstance = new Client({
        accessToken: 'dummy-token-for-build',
        environment: 'sandbox',
      });
      locationIdCache = 'dummy-location-id';
    }
  }
  return squareClientInstance;
}

/**
 * Get location ID from Vault or cache
 */
export async function getLocationId(): Promise<string> {
  if (!locationIdCache) {
    await getSquareClient(); // This will populate the cache
  }
  return locationIdCache!;
}

// Export async getters for Square APIs
export const getPaymentsApi = async () => (await getSquareClient()).paymentsApi;
export const getCustomersApi = async () => (await getSquareClient()).customersApi;
export const getRefundsApi = async () => (await getSquareClient()).refundsApi;
export const getCheckoutApi = async () => (await getSquareClient()).checkoutApi;
export const getWebhooksHelper = async () => (await getSquareClient()).webhooksHelper;
export const getOAuthApi = async () => (await getSquareClient()).oAuthApi;

// For backward compatibility - these will be deprecated
export const squareClient = getSquareClient();
export const locationId = process.env.SQUARE_LOCATION_ID || "";