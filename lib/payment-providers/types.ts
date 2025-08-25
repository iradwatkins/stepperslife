export type PaymentProvider = "stripe" | "square" | "paypal" | "zelle";

export interface PaymentProviderConfig {
  provider: PaymentProvider;
  enabled: boolean;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    merchantId?: string;
    locationId?: string;
    accountId?: string;
    email?: string;
    phone?: string;
  };
}

export interface CheckoutSessionParams {
  eventId: string;
  eventName: string;
  sellerId: string;
  buyerEmail: string;
  amount: number;
  tickets: Array<{
    type: string;
    price: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  provider?: PaymentProvider;
  error?: string;
  manualPaymentInstructions?: {
    method: string;
    recipientEmail?: string;
    recipientPhone?: string;
    amount: number;
    reference: string;
  };
}

export interface PaymentFees {
  grossAmount: number;
  platformFee: number;
  providerFee: number;
  sellerPayout: number;
  totalFees: number;
}

export interface IPaymentProvider {
  name: PaymentProvider;
  
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  
  calculateFees(amount: number): PaymentFees;
  
  processWebhook?(payload: any, signature: string): Promise<void>;
  
  refund?(paymentId: string, amount?: number): Promise<{ success: boolean; error?: string }>;
}

export const PLATFORM_FEE_PERCENTAGE = 0.03; // 3% platform fee

export const PROVIDER_FEES = {
  stripe: { percentage: 0.029, fixed: 0.30 }, // 2.9% + 30¢
  square: { percentage: 0.026, fixed: 0.10 }, // 2.6% + 10¢
  paypal: { percentage: 0.0289, fixed: 0.49 }, // 2.89% + 49¢
  zelle: { percentage: 0, fixed: 0 }, // No fees
} as const;