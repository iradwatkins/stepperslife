import { 
  IPaymentProvider, 
  CheckoutSessionParams, 
  CheckoutSessionResult, 
  PaymentFees,
  PLATFORM_FEE_PERCENTAGE,
  PROVIDER_FEES 
} from "./types";
import { createSquareCheckoutSession } from "@/app/actions/createSquareCheckoutSession";

export class SquareProvider implements IPaymentProvider {
  name = "square" as const;
  
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    try {
      const fees = this.calculateFees(params.amount);
      
      // Add fee information to metadata
      const enrichedMetadata = {
        ...params.metadata,
        platformFee: fees.platformFee.toFixed(2),
        providerFee: fees.providerFee.toFixed(2),
        sellerPayout: fees.sellerPayout.toFixed(2),
      };
      
      // Use existing Square implementation
      const result = await createSquareCheckoutSession({
        eventId: params.eventId,
        eventName: params.eventName,
        ticketQuantity: params.tickets.reduce((sum, t) => sum + t.quantity, 0),
        ticketPrice: params.amount,
        buyerEmail: params.buyerEmail,
        metadata: enrichedMetadata,
      });
      
      return {
        success: result.success,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.checkoutId,
        provider: "square",
        error: result.error,
      };
    } catch (error) {
      console.error("Square checkout error:", error);
      return {
        success: false,
        provider: "square",
        error: error instanceof Error ? error.message : "Failed to create Square checkout",
      };
    }
  }
  
  calculateFees(amount: number): PaymentFees {
    const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
    const providerFee = amount * PROVIDER_FEES.square.percentage + PROVIDER_FEES.square.fixed;
    const totalFees = platformFee + providerFee;
    const sellerPayout = amount - totalFees;
    
    return {
      grossAmount: amount,
      platformFee,
      providerFee,
      sellerPayout,
      totalFees,
    };
  }
  
  async processWebhook(payload: any, signature: string): Promise<void> {
    // Square webhook processing
    // This would verify signature and process the payment confirmation
    console.log("Processing Square webhook");
  }
  
  async refund(paymentId: string, amount?: number): Promise<{ success: boolean; error?: string }> {
    // Use existing Square refund implementation
    const { refundSquarePayment } = await import("@/app/actions/refundSquarePayment");
    return refundSquarePayment(paymentId, amount);
  }
}