import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    
    // Return a mock instance if no key is configured (for build time)
    if (!key) {
      console.warn("Stripe secret key not configured - using mock instance");
      // This allows the build to complete even without the key
      // Actual runtime calls will fail appropriately
      return {} as Stripe;
    }
    
    stripeInstance = new Stripe(key, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}