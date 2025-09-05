/**
 * PayPal client initialization with admin support
 */

const paypal = require('@paypal/checkout-server-sdk');

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}

class PayPalClientWrapper {
  private client: any = null;
  private config: PayPalConfig | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const config = this.getConfig();
      if (!config.clientId || !config.clientSecret) {
        console.warn('PayPal credentials not configured - using test mode');
        this.isInitialized = false;
        return;
      }

      // Create PayPal environment
      const environment = config.mode === 'live' 
        ? new paypal.core.LiveEnvironment(config.clientId, config.clientSecret)
        : new paypal.core.SandboxEnvironment(config.clientId, config.clientSecret);

      // Create PayPal HTTP client
      this.client = new paypal.core.PayPalHttpClient(environment);
      this.config = config;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PayPal client:', error);
      this.isInitialized = false;
    }
  }

  private getConfig(): PayPalConfig {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    const mode = (process.env.PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live';

    // Fallback for build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return {
        clientId: 'build-client',
        clientSecret: 'build-secret',
        mode: 'sandbox',
      };
    }

    return { clientId, clientSecret, mode };
  }

  public getClient() {
    if (!this.isInitialized) {
      throw new Error('PayPal client not initialized. Check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }
    return this.client;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getClientId(): string {
    return this.config?.clientId || '';
  }

  public getMode(): 'sandbox' | 'live' {
    return this.config?.mode || 'sandbox';
  }

  public getWebhookId(): string {
    return process.env.PAYPAL_WEBHOOK_ID || '';
  }

  /**
   * Create an order for checkout
   */
  public async createOrder(amount: number, currency: string = 'USD', description?: string) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description: description || 'SteppersLife Event Ticket',
      }],
      application_context: {
        brand_name: 'SteppersLife',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    });

    const response = await this.getClient().execute(request);
    return response.result;
  }

  /**
   * Capture an approved order
   */
  public async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    
    const response = await this.getClient().execute(request);
    return response.result;
  }

  /**
   * Refund a captured payment
   */
  public async refundPayment(captureId: string, amount?: number, currency: string = 'USD') {
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    
    if (amount) {
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency,
        },
      });
    } else {
      request.requestBody({});
    }

    const response = await this.getClient().execute(request);
    return response.result;
  }

  /**
   * Verify webhook signature
   */
  public async verifyWebhookSignature(
    headers: any,
    body: any,
    webhookId: string
  ): Promise<boolean> {
    try {
      const verification = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body,
      };

      const request = new paypal.webhooks.WebhooksVerifySignatureRequest();
      request.requestBody(verification);

      const response = await this.getClient().execute(request);
      return response.result.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }

  /**
   * Update configuration (for admin panel)
   */
  public updateConfig(clientId: string, clientSecret: string, mode: 'sandbox' | 'live') {
    this.config = { clientId, clientSecret, mode };
    this.initialize();
  }
}

// Create singleton instance
let paypalClientInstance: PayPalClientWrapper | null = null;

export function getPayPalClient() {
  if (!paypalClientInstance) {
    paypalClientInstance = new PayPalClientWrapper();
  }
  return paypalClientInstance.isReady() ? paypalClientInstance.getClient() : null;
}

export function getPayPalClientWrapper(): PayPalClientWrapper {
  if (!paypalClientInstance) {
    paypalClientInstance = new PayPalClientWrapper();
  }
  return paypalClientInstance;
}

export function isPayPalConfigured(): boolean {
  if (!paypalClientInstance) {
    paypalClientInstance = new PayPalClientWrapper();
  }
  return paypalClientInstance.isReady();
}

export function getPayPalClientId(): string {
  return getPayPalClientWrapper().getClientId();
}

export function getPayPalMode(): 'sandbox' | 'live' {
  return getPayPalClientWrapper().getMode();
}

// Export convenience functions
export const createPayPalOrder = (amount: number, currency?: string, description?: string) =>
  getPayPalClientWrapper().createOrder(amount, currency, description);

export const capturePayPalOrder = (orderId: string) =>
  getPayPalClientWrapper().captureOrder(orderId);

export const refundPayPalPayment = (captureId: string, amount?: number, currency?: string) =>
  getPayPalClientWrapper().refundPayment(captureId, amount, currency);

export const verifyPayPalWebhook = (headers: any, body: any, webhookId: string) =>
  getPayPalClientWrapper().verifyWebhookSignature(headers, body, webhookId);