/**
 * Square client initialization with proper error handling
 * This module handles Square SDK initialization for both development and production
 */

let SquareClient: any;
let SquareEnvironment: any;

// Dynamic import to handle different environments
try {
  const square = require('square');
  SquareClient = square.SquareClient;
  SquareEnvironment = square.SquareEnvironment;
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
      if (SquareClient && typeof SquareClient === 'function') {
        const environment = config.environment === 'production' 
          ? SquareEnvironment.Production 
          : SquareEnvironment.Sandbox;
        
        this.client = new SquareClient({
          token: config.accessToken,
          environment: environment,
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
    // Determine environment
    const environment = (process.env.SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
    
    // Get credentials based on environment
    let accessToken: string | undefined;
    let locationId: string | undefined;
    
    if (environment === 'production') {
      accessToken = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN;
      locationId = process.env.SQUARE_PRODUCTION_LOCATION_ID || process.env.SQUARE_LOCATION_ID;
    } else {
      accessToken = process.env.SQUARE_SANDBOX_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN;
      locationId = process.env.SQUARE_SANDBOX_LOCATION_ID || process.env.SQUARE_LOCATION_ID;
    }

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

  public get terminalApi() {
    return this.getClient().terminalApi;
  }

  // Cash App Pay specific methods
  public getApplicationId(): string {
    const env = (process.env.SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
    if (env === 'production') {
      return process.env.SQUARE_PRODUCTION_APPLICATION_ID || process.env.SQUARE_APPLICATION_ID || '';
    }
    return process.env.SQUARE_SANDBOX_APPLICATION_ID || process.env.SQUARE_APPLICATION_ID || '';
  }

  public isCashAppPayEnabled(): boolean {
    return process.env.CASHAPP_PAY_ENABLED === 'true' && this.isInitialized;
  }

  public getEnvironment(): 'sandbox' | 'production' {
    return (process.env.SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
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