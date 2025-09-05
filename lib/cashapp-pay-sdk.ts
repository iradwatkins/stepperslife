/**
 * Cash App Pay SDK Integration
 * Handles Cash App Pay payments through Square's SDK
 */

import { getSquareClient, isSquareReady } from './square-client';

export interface CashAppPayConfig {
  appId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
}

export interface CashAppPayRequest {
  amount: number;
  currency?: string;
  referenceId: string;
  note?: string;
  redirectUrl?: string;
  customerId?: string;
}

export interface CashAppPayResponse {
  paymentId: string;
  status: string;
  qrCodeUrl?: string;
  webPaymentUrl?: string;
  mobileUrl?: string;
  expiresAt?: string;
}

class CashAppPayClient {
  private config: CashAppPayConfig | null = null;
  private squareClient: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Get configuration from environment
      const appId = process.env.SQUARE_APPLICATION_ID || process.env.SQUARE_SANDBOX_APPLICATION_ID;
      const locationId = process.env.SQUARE_LOCATION_ID || process.env.SQUARE_SANDBOX_LOCATION_ID;
      const environment = (process.env.SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';

      if (!appId || !locationId) {
        console.warn('Cash App Pay not configured - missing app ID or location ID');
        return;
      }

      this.config = {
        appId,
        locationId,
        environment,
      };

      // Initialize Square client for Cash App Pay
      if (isSquareReady()) {
        this.squareClient = getSquareClient();
      }
    } catch (error) {
      console.error('Failed to initialize Cash App Pay client:', error);
    }
  }

  /**
   * Create a Cash App Pay payment request
   */
  public async createPaymentRequest(request: CashAppPayRequest): Promise<CashAppPayResponse> {
    if (!this.config || !this.squareClient) {
      throw new Error('Cash App Pay is not configured');
    }

    try {
      // Create a Square checkout for Cash App Pay
      const checkoutRequest = {
        idempotencyKey: `cashapp_${request.referenceId}_${Date.now()}`,
        order: {
          locationId: this.config.locationId,
          lineItems: [
            {
              name: request.note || 'Event Ticket',
              quantity: '1',
              basePriceMoney: {
                amount: BigInt(Math.round(request.amount * 100)), // Convert to cents
                currency: request.currency || 'USD',
              },
            },
          ],
        },
        checkoutOptions: {
          acceptedPaymentMethods: {
            cashAppPay: true,
            applePay: false,
            googlePay: false,
            afterpayClearpay: false,
          },
          redirectUrl: request.redirectUrl,
          merchantSupportEmail: 'support@stepperslife.com',
        },
        prePopulateBuyerEmail: request.customerId,
      };

      const response = await this.squareClient.checkoutApi.createPaymentLink(checkoutRequest);

      if (response.result.errors) {
        throw new Error(response.result.errors[0].detail);
      }

      const paymentLink = response.result.paymentLink;

      return {
        paymentId: paymentLink.id,
        status: 'created',
        webPaymentUrl: paymentLink.url,
        mobileUrl: this.generateCashAppDeepLink(paymentLink.url),
        expiresAt: paymentLink.createdAt,
      };
    } catch (error: any) {
      console.error('Cash App Pay payment request failed:', error);
      throw new Error(`Failed to create Cash App Pay request: ${error.message}`);
    }
  }

  /**
   * Generate Cash App mobile deep link
   */
  private generateCashAppDeepLink(webUrl: string): string {
    // Extract payment ID from Square URL and create Cash App deep link
    const urlParts = webUrl.split('/');
    const paymentId = urlParts[urlParts.length - 1];
    return `cashapp://pay/${paymentId}`;
  }

  /**
   * Create a Cash App Pay QR code for in-person payments
   */
  public async createQRCodePayment(request: CashAppPayRequest): Promise<CashAppPayResponse> {
    if (!this.config || !this.squareClient) {
      throw new Error('Cash App Pay is not configured');
    }

    try {
      // Create a terminal checkout for QR code display
      const terminalCheckoutRequest = {
        idempotencyKey: `cashapp_qr_${request.referenceId}_${Date.now()}`,
        checkout: {
          amountMoney: {
            amount: BigInt(Math.round(request.amount * 100)),
            currency: request.currency || 'USD',
          },
          deviceOptions: {
            deviceId: 'CASHAPP_QR', // Virtual device for QR codes
          },
          paymentType: 'CASHAPP',
          note: request.note,
          referenceId: request.referenceId,
        },
      };

      const response = await this.squareClient.terminalApi.createTerminalCheckout(terminalCheckoutRequest);

      if (response.result.errors) {
        throw new Error(response.result.errors[0].detail);
      }

      const checkout = response.result.checkout;

      return {
        paymentId: checkout.id,
        status: checkout.status,
        qrCodeUrl: this.generateQRCodeUrl(checkout.id),
        expiresAt: checkout.createdAt,
      };
    } catch (error: any) {
      // Fallback to simple QR code generation
      return this.generateSimpleQRPayment(request);
    }
  }

  /**
   * Generate QR code URL for display
   */
  private generateQRCodeUrl(checkoutId: string): string {
    const qrData = encodeURIComponent(`https://cash.app/pay/${checkoutId}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
  }

  /**
   * Generate simple Cash App Pay link for manual payments
   */
  private generateSimpleQRPayment(request: CashAppPayRequest): CashAppPayResponse {
    const cashTag = process.env.CASH_APP_HANDLE || '$SteppersLife';
    const amount = request.amount.toFixed(2);
    const note = encodeURIComponent(request.note || `Payment ${request.referenceId}`);
    
    const cashAppUrl = `https://cash.app/${cashTag}/${amount}?note=${note}`;
    const qrData = encodeURIComponent(cashAppUrl);
    
    return {
      paymentId: request.referenceId,
      status: 'pending_customer_action',
      webPaymentUrl: cashAppUrl,
      mobileUrl: cashAppUrl.replace('https://', 'cashapp://'),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`,
    };
  }

  /**
   * Verify a Cash App Pay payment
   */
  public async verifyPayment(paymentId: string): Promise<{
    verified: boolean;
    status: string;
    amount?: number;
    completedAt?: string;
  }> {
    if (!this.squareClient) {
      throw new Error('Cash App Pay is not configured');
    }

    try {
      const response = await this.squareClient.paymentsApi.getPayment(paymentId);

      if (response.result.errors) {
        throw new Error(response.result.errors[0].detail);
      }

      const payment = response.result.payment;

      return {
        verified: payment.status === 'COMPLETED',
        status: payment.status,
        amount: payment.amountMoney ? Number(payment.amountMoney.amount) / 100 : undefined,
        completedAt: payment.completedAt,
      };
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        verified: false,
        status: 'unknown',
      };
    }
  }

  /**
   * Refund a Cash App Pay payment
   */
  public async refundPayment(paymentId: string, amount: number, reason?: string): Promise<{
    success: boolean;
    refundId?: string;
    status?: string;
  }> {
    if (!this.squareClient) {
      throw new Error('Cash App Pay is not configured');
    }

    try {
      const refundRequest = {
        idempotencyKey: `refund_${paymentId}_${Date.now()}`,
        refund: {
          paymentId: paymentId,
          amountMoney: {
            amount: BigInt(Math.round(amount * 100)),
            currency: 'USD',
          },
          reason: reason || 'Customer requested refund',
        },
      };

      const response = await this.squareClient.refundsApi.refundPayment(refundRequest);

      if (response.result.errors) {
        throw new Error(response.result.errors[0].detail);
      }

      const refund = response.result.refund;

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
      };
    } catch (error: any) {
      console.error('Refund failed:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Check if Cash App Pay is available and configured
   */
  public isAvailable(): boolean {
    return !!(this.config && this.squareClient && isSquareReady());
  }

  /**
   * Get configuration status
   */
  public getStatus(): {
    configured: boolean;
    environment?: string;
    appId?: string;
  } {
    if (!this.config) {
      return { configured: false };
    }

    return {
      configured: true,
      environment: this.config.environment,
      appId: this.config.appId.substring(0, 10) + '...',
    };
  }
}

// Export singleton instance
export const cashAppPayClient = new CashAppPayClient();

// Export convenience functions
export const createCashAppPayment = (request: CashAppPayRequest) => 
  cashAppPayClient.createPaymentRequest(request);

export const createCashAppQRCode = (request: CashAppPayRequest) =>
  cashAppPayClient.createQRCodePayment(request);

export const verifyCashAppPayment = (paymentId: string) =>
  cashAppPayClient.verifyPayment(paymentId);

export const refundCashAppPayment = (paymentId: string, amount: number, reason?: string) =>
  cashAppPayClient.refundPayment(paymentId, amount, reason);

export const isCashAppPayAvailable = () =>
  cashAppPayClient.isAvailable();

export const getCashAppPayStatus = () =>
  cashAppPayClient.getStatus();