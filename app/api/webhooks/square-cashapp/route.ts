import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square-client';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import crypto from 'crypto';

// Square webhook event types we care about
const RELEVANT_EVENTS = [
  'payment.created',
  'payment.updated',
  'refund.created',
  'refund.updated',
  'checkout.created',
  'checkout.updated',
];

/**
 * Verify Square webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null,
  webhookSignatureKey: string
): boolean {
  if (!signature) return false;

  try {
    const hmac = crypto.createHmac('sha256', webhookSignatureKey);
    hmac.update(body);
    const expectedSignature = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature');
    
    // Get webhook signature key from environment or database
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    
    // Verify signature if key is configured
    if (webhookSignatureKey) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSignatureKey);
      if (!isValid) {
        console.error('Invalid Square webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('Square webhook signature verification skipped - no signature key configured');
    }

    // Parse the webhook payload
    const event = JSON.parse(rawBody);
    
    // Check if this is an event we care about
    if (!RELEVANT_EVENTS.includes(event.type)) {
      console.log(`Ignoring Square webhook event: ${event.type}`);
      return NextResponse.json({ received: true });
    }

    console.log(`Processing Square webhook event: ${event.type}`, {
      eventId: event.event_id,
      merchantId: event.merchant_id,
      locationId: event.location_id,
    });

    const convex = getConvexClient();

    // Process the event based on type
    switch (event.type) {
      case 'payment.created':
      case 'payment.updated': {
        const payment = event.data.object.payment;
        
        // Extract metadata from the payment
        const orderId = payment.order_id;
        const referenceId = payment.reference_id;
        const status = payment.status;
        const amount = payment.amount_money;
        
        console.log('Processing payment event:', {
          paymentId: payment.id,
          orderId,
          referenceId,
          status,
          amount: amount ? `${amount.amount / 100} ${amount.currency}` : 'N/A',
        });

        // If payment is completed, process the ticket purchase
        if (status === 'COMPLETED') {
          // Parse metadata from reference_id if available
          let metadata: any = {};
          if (referenceId) {
            try {
              metadata = JSON.parse(referenceId);
            } catch {
              // Reference ID might not be JSON
              metadata = { referenceId };
            }
          }

          // Update payment status in database
          if (metadata.ticketId) {
            await convex.mutation(api.tickets.updateTicketPaymentStatus, {
              ticketId: metadata.ticketId,
              paymentId: payment.id,
              status: 'completed',
              paymentMethod: payment.source_type === 'CASH_APP' ? 'cashapp' : 'square',
            });
          }

          // Process the ticket allocation
          if (metadata.eventId && metadata.userId) {
            await convex.mutation(api.tickets.confirmPurchase, {
              eventId: metadata.eventId,
              userId: metadata.userId,
              paymentId: payment.id,
              amount: amount.amount / 100,
              paymentMethod: payment.source_type === 'CASH_APP' ? 'cashapp' : 'square',
            });
          }
        }
        break;
      }

      case 'refund.created':
      case 'refund.updated': {
        const refund = event.data.object.refund;
        const paymentId = refund.payment_id;
        const status = refund.status;
        const amount = refund.amount_money;

        console.log('Processing refund event:', {
          refundId: refund.id,
          paymentId,
          status,
          amount: amount ? `${amount.amount / 100} ${amount.currency}` : 'N/A',
        });

        // Update refund status in database
        if (status === 'COMPLETED' || status === 'PENDING') {
          await convex.mutation(api.payments.recordRefund, {
            paymentId,
            refundId: refund.id,
            amount: amount.amount / 100,
            status: status.toLowerCase(),
            reason: refund.reason,
          });
        }
        break;
      }

      case 'checkout.created':
      case 'checkout.updated': {
        const checkout = event.data.object.checkout;
        const checkoutId = checkout.id;
        const status = checkout.status;
        
        console.log('Processing checkout event:', {
          checkoutId,
          status,
          paymentLink: checkout.checkout_page_url,
        });

        // You can track checkout abandonment or completion here
        if (status === 'COMPLETED') {
          // Checkout completed successfully
          console.log('Checkout completed:', checkoutId);
        }
        break;
      }
    }

    // Return success response
    return NextResponse.json({ 
      received: true,
      eventId: event.event_id,
      processed: true,
    });

  } catch (error) {
    console.error('Square webhook processing error:', error);
    
    // Return error but with 200 status to prevent Square from retrying
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        received: true, // Acknowledge receipt to prevent retries
      },
      { status: 200 } // Return 200 to prevent Square from retrying
    );
  }
}

// Square also sends GET requests to verify the endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    provider: 'square',
    endpoint: '/api/webhooks/square-cashapp',
    supportedEvents: RELEVANT_EVENTS,
  });
}