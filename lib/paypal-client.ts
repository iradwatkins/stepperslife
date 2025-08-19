/**
 * PayPal client initialization
 */

const paypal = require('@paypal/checkout-server-sdk');

let paypalClient: any = null;

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Use sandbox for development, live for production
  if (process.env.NODE_ENV === 'production' && process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

export function getPayPalClient() {
  if (!paypalClient) {
    const env = environment();
    if (!env) {
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null;
      }
      throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }
    paypalClient = new paypal.core.PayPalHttpClient(env);
  }
  return paypalClient;
}

export function isPayPalConfigured(): boolean {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;
}