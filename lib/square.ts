import { Client, Environment } from "square";

if (!process.env.SQUARE_ACCESS_TOKEN) {
  throw new Error("SQUARE_ACCESS_TOKEN is missing in environment variables");
}

if (!process.env.SQUARE_LOCATION_ID) {
  throw new Error("SQUARE_LOCATION_ID is missing in environment variables");
}

// Initialize Square client
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === "production" 
    ? Environment.Production 
    : Environment.Sandbox,
});

// Export commonly used APIs
export const paymentsApi = squareClient.paymentsApi;
export const customersApi = squareClient.customersApi;
export const refundsApi = squareClient.refundsApi;
export const checkoutApi = squareClient.checkoutApi;
export const webhooksHelper = squareClient.webhooksHelper;
export const oAuthApi = squareClient.oAuthApi;

// Export location ID for use in components
export const locationId = process.env.SQUARE_LOCATION_ID;