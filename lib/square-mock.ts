/**
 * Mock Square Service
 * This replaces the Square SDK to prevent initialization errors
 * All methods return mock data for development/testing
 */

export class MockSquareClient {
  paymentsApi = {
    createPayment: async (request: any) => ({
      result: {
        payment: {
          id: `mock-payment-${Date.now()}`,
          status: 'COMPLETED',
          amountMoney: request.amountMoney,
          createdAt: new Date().toISOString(),
        }
      }
    }),
    getPayment: async (paymentId: string) => ({
      result: {
        payment: {
          id: paymentId,
          status: 'COMPLETED',
          amountMoney: { amount: 1000, currency: 'USD' },
        }
      }
    }),
  };

  customersApi = {
    createCustomer: async (request: any) => ({
      result: {
        customer: {
          id: `mock-customer-${Date.now()}`,
          email: request.email,
          givenName: request.givenName,
          familyName: request.familyName,
          createdAt: new Date().toISOString(),
        }
      }
    }),
    retrieveCustomer: async (customerId: string) => ({
      result: {
        customer: {
          id: customerId,
          email: 'mock@example.com',
        }
      }
    }),
  };

  refundsApi = {
    refundPayment: async (request: any) => ({
      result: {
        refund: {
          id: `mock-refund-${Date.now()}`,
          paymentId: request.paymentId,
          amountMoney: request.amountMoney,
          status: 'COMPLETED',
        }
      }
    }),
  };

  checkoutApi = {
    createPaymentLink: async (request: any) => ({
      result: {
        paymentLink: {
          id: `mock-link-${Date.now()}`,
          url: `https://stepperslife.com/mock-payment?id=${Date.now()}`,
          orderId: request.order?.id,
        }
      }
    }),
  };

  oAuthApi = {
    obtainToken: async (request: any) => ({
      result: {
        accessToken: 'mock-access-token',
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        merchantId: 'mock-merchant-id',
        refreshToken: 'mock-refresh-token',
      }
    }),
    revokeToken: async () => ({
      result: {
        success: true,
      }
    }),
  };

  locationsApi = {
    listLocations: async () => ({
      result: {
        locations: [{
          id: 'mock-location-id',
          name: 'Mock Location',
          address: {
            addressLine1: '123 Mock St',
            locality: 'Mock City',
            administrativeDistrictLevel1: 'MC',
            postalCode: '12345',
            country: 'US',
          },
          status: 'ACTIVE',
        }]
      }
    }),
  };
}

// Mock webhooks helper
export const mockWebhooksHelper = {
  isValidWebhookEventSignature: (body: string, signature: string, secret: string, url: string) => {
    // In production, this would validate the webhook signature
    // For mock, always return true in development
    return process.env.NODE_ENV === 'development' || process.env.DISABLE_SQUARE === 'true';
  },
};

// Main exports to match Square SDK interface
export function getSquareClient(): MockSquareClient {
  return new MockSquareClient();
}

export function getSquareLocationId(): string {
  return 'mock-location-id';
}

export function getWebhooksHelper() {
  return mockWebhooksHelper;
}

// Default exports
export const squareClient = new MockSquareClient();
export const squareLocationId = 'mock-location-id';