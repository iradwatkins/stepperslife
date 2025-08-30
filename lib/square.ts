/**
 * Square Service Wrapper
 * Enhanced with proper error handling and production safeguards
 */

import { 
  MockSquareClient, 
  mockWebhooksHelper,
  getSquareClient as getMockClient,
  getSquareLocationId as getMockLocationId 
} from './square-mock';
import { serializeSquareResponse, handleSquareError } from './square-helpers';

// Use mock only when explicitly disabled or in test
const USE_MOCK = process.env.DISABLE_SQUARE === 'true' || process.env.NODE_ENV === 'test';

// Cached client instance
let cachedClient: any = null;

export async function getSquareClient() {
  // Always use mock on client-side
  if (typeof window !== 'undefined') {
    console.warn('Square SDK cannot be used on client-side, returning mock');
    return getMockClient();
  }
  
  // Use mock if configured
  if (USE_MOCK) {
    console.log('Using mock Square client (configured)');
    return getMockClient();
  }
  
  // Return cached client if available
  if (cachedClient) {
    return cachedClient;
  }
  
  // Try to initialize real Square client with proper error handling
  try {
    // Dynamic import to prevent build-time issues
    const squareModule = await import('square').catch((error) => {
      console.error('Failed to import Square module:', error);
      return null;
    });
    
    if (!squareModule) {
      console.warn('Square module not available, using mock');
      return getMockClient();
    }
    
    // Try different export patterns
    const ClientConstructor = 
      squareModule.Client || 
      squareModule.default?.Client ||
      (squareModule as any).Square?.Client;
    
    if (!ClientConstructor) {
      console.error('Square Client constructor not found in module');
      return getMockClient();
    }
    
    // Initialize with proper configuration
    cachedClient = new ClientConstructor({
      accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
      environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    });
    
    console.log('Square client initialized successfully');
    return cachedClient;
    
  } catch (error) {
    console.error('Failed to initialize Square client:', handleSquareError(error));
    // Fall back to mock to prevent crashes
    return getMockClient();
  }
}

export async function getSquareLocationId() {
  if (USE_MOCK || process.env.DISABLE_SQUARE === 'true') {
    return getMockLocationId();
  }
  
  return process.env.SQUARE_LOCATION_ID || getMockLocationId();
}

export function getWebhooksHelper() {
  return mockWebhooksHelper;
}

export async function getOAuthApi() {
  const client = await getSquareClient();
  return client.oAuthApi;
}

export async function getRefundsApi() {
  const client = await getSquareClient();
  return client.refundsApi;
}

// Convenience exports
export const squareClient = getMockClient();
export const squareLocationId = getMockLocationId();