/**
 * Square client initialization with proper error handling
 * This module handles Square SDK initialization for both development and production
 */

let Square: any;
let Client: any;

// Dynamic import to handle different environments
try {
  Square = require('square');
  Client = Square.Client || Square.default?.Client || Square;
} catch (error) {
  console.error('Failed to import Square SDK:', error);
}

export interface SquareConfig {
  accessToken: string;
  locationId: string;
  environment?: 'sandbox' | 'production';
}

class SquareClientWrapper {
  private client: any;
  private locationId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const config = this.getConfig();
      if (!config.accessToken || !config.locationId) {
        console.warn('Square credentials not configured - using test mode');
        this.locationId = 'TEST_LOCATION';
        this.isInitialized = false;
        return;
      }

      // Create Square client
      if (Client && typeof Client === 'function') {
        this.client = new Client({
          accessToken: config.accessToken,
          environment: config.environment || 'sandbox',
        });
        this.locationId = config.locationId;
        this.isInitialized = true;
      } else {
        console.error('Square Client constructor not found');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Failed to initialize Square client:', error);
      this.isInitialized = false;
    }
  }

  private getConfig(): SquareConfig {
    // Try environment variables first
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const environment = process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox';

    if (accessToken && locationId) {
      return { accessToken, locationId, environment };
    }

    // Fallback for build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return {
        accessToken: 'build-token',
        locationId: 'build-location',
        environment: 'sandbox',
      };
    }

    // Return empty config if nothing available
    return {
      accessToken: '',
      locationId: '',
      environment: 'sandbox',
    };
  }

  public getLocationId(): string {
    return this.locationId;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getClient(): any {
    if (!this.isInitialized) {
      throw new Error('Square client not initialized. Check your SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID environment variables.');
    }
    return this.client;
  }

  // API accessors
  public get paymentsApi() {
    return this.getClient().paymentsApi;
  }

  public get checkoutApi() {
    return this.getClient().checkoutApi;
  }

  public get customersApi() {
    return this.getClient().customersApi;
  }

  public get refundsApi() {
    return this.getClient().refundsApi;
  }

  public get oAuthApi() {
    return this.getClient().oAuthApi;
  }

  public get webhooksHelper() {
    return this.getClient().webhooksHelper;
  }
}

// Create singleton instance
let squareClientInstance: SquareClientWrapper | null = null;

export function getSquareClient(): SquareClientWrapper {
  if (!squareClientInstance) {
    squareClientInstance = new SquareClientWrapper();
  }
  return squareClientInstance;
}

// Export convenience functions
export function getLocationId(): string {
  return getSquareClient().getLocationId();
}

export function isSquareReady(): boolean {
  return getSquareClient().isReady();
}

// Export API getters for backward compatibility
export const getPaymentsApi = () => getSquareClient().paymentsApi;
export const getCheckoutApi = () => getSquareClient().checkoutApi;
export const getCustomersApi = () => getSquareClient().customersApi;
export const getRefundsApi = () => getSquareClient().refundsApi;
export const getOAuthApi = () => getSquareClient().oAuthApi;
export const getWebhooksHelper = () => getSquareClient().webhooksHelper;