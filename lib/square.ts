import { Client } from "square";
import { getSquareCredentials } from "./vault";

let squareClientInstance: Client | null = null;
let locationIdCache: string | null = null;

/**
 * Get or create Square client instance with Vault credentials
 */
async function getSquareClient(): Promise<Client> {
  if (!squareClientInstance) {
    // During build time, return a dummy client
    if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      squareClientInstance = new Client({
        accessToken: 'dummy-token-for-build',
        environment: 'sandbox' as any,
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
          throw new Error("Square credentials not found in Vault or environment");
        }
        
        squareClientInstance = new Client({
          accessToken,
          environment: process.env.NODE_ENV === "production" 
            ? 'production' as any
            : 'sandbox' as any,
        });
        locationIdCache = locationId;
      } else {
        squareClientInstance = new Client({
          accessToken: credentials.accessToken,
          environment: process.env.NODE_ENV === "production" 
            ? Environment.Production 
            : Environment.Sandbox,
        });
        locationIdCache = credentials.locationId;
      }
    } catch (error) {
      console.error("Failed to initialize Square client:", error);
      // Final fallback to env vars
      if (process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID) {
        squareClientInstance = new Client({
          accessToken: process.env.SQUARE_ACCESS_TOKEN,
          environment: process.env.NODE_ENV === "production" 
            ? Environment.Production 
            : Environment.Sandbox,
        });
        locationIdCache = process.env.SQUARE_LOCATION_ID;
      } else {
        // Return dummy client for build
        squareClientInstance = new Client({
          accessToken: 'dummy-token-for-build',
          environment: 'sandbox' as any,
        });
        locationIdCache = 'dummy-location-id';
      }
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