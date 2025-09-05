import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhook, capturePayPalOrder } from '@/lib/paypal-client';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

// PayPal webhook event types we care about
const RELEVANT_EVENTS = [
  'PAYMENT.CAPTURE.COMPLETED',
  'PAYMENT.CAPTURE.DENIED',
  'PAYMENT.CAPTURE.REFUNDED',
  'CHECKOUT.ORDER.APPROVED',
  'CHECKOUT.ORDER.COMPLETED',
];

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  create_time: string;
  resource_type: string;
  resource: any;
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const headers = {
      'paypal-auth-algo': request.headers.get('paypal-auth-algo'),
      'paypal-cert-url': request.headers.get('paypal-cert-url'),
      'paypal-transmission-id': request.headers.get('paypal-transmission-id'),
      'paypal-transmission-sig': request.headers.get('paypal-transmission-sig'),
      'paypal-transmission-time': request.headers.get('paypal-transmission-time'),
    };

    // Get webhook body
    const body = await request.json();
    const event = body as PayPalWebhookEvent;

    // Verify webhook signature
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyPayPalWebhook(headers, body, webhookId);
      if (!isValid) {
        console.error('Invalid PayPal webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('PayPal webhook signature verification skipped - no webhook ID configured');
    }

    // Check if this is an event we care about
    if (!RELEVANT_EVENTS.includes(event.event_type)) {
      console.log(`Ignoring PayPal webhook event: ${event.event_type}`);
      return NextResponse.json({ received: true });
    }

    console.log(`Processing PayPal webhook event: ${event.event_type}`, {
      eventId: event.id,
      resourceType: event.resource_type,
    });

    const convex = getConvexClient();

    // Process the event based on type
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Order has been approved by the buyer, capture the payment
        const orderId = event.resource.id;
        
        try {
          const captureResult = await capturePayPalOrder(orderId);
          console.log('PayPal order captured:', captureResult.id);
        } catch (error) {
          console.error('Failed to capture PayPal order:', error);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const capture = event.resource;
        const orderId = capture.supplementary_data?.related_ids?.order_id;
        const amount = capture.amount;
        const customId = capture.custom_id;
        
        console.log('Processing PayPal payment capture:', {
          captureId: capture.id,
          orderId,
          amount: `${amount.value} ${amount.currency_code}`,
          customId,
        });

        // Parse custom metadata
        let metadata: any = {};
        if (customId) {
          try {
            metadata = JSON.parse(customId);
          } catch {
            metadata = { referenceId: customId };
          }
        }

        // Determine payment type from metadata
        const paymentType = metadata.paymentType || 'ticket_purchase';
        
        // Handle different payment types
        if (paymentType === 'split_payment') {
          // This is a split payment for an event organizer
          await handleSplitPayment(convex, capture, metadata);
        } else if (paymentType === 'platform_service') {
          // This is a direct payment to the platform (tickets, flyers, etc.)
          await handlePlatformPayment(convex, capture, metadata);
        } else {
          // Default to ticket purchase
          await handleTicketPurchase(convex, capture, metadata);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const capture = event.resource;
        const customId = capture.custom_id;
        
        console.log('PayPal payment denied:', {
          captureId: capture.id,
          reason: capture.status_details?.reason,
        });

        // Update payment status
        let metadata: any = {};
        if (customId) {
          try {
            metadata = JSON.parse(customId);
          } catch {
            metadata = { referenceId: customId };
          }
        }

        if (metadata.paymentId) {
          await convex.mutation(api.payments.updatePaymentStatus, {
            paymentId: metadata.paymentId,
            status: 'failed',
            failureReason: capture.status_details?.reason || 'Payment denied',
          });
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const refund = event.resource;
        const captureId = refund.id;
        const amount = refund.amount;
        
        console.log('Processing PayPal refund:', {
          refundId: refund.id,
          captureId,
          amount: `${amount.value} ${amount.currency_code}`,
        });

        await convex.mutation(api.payments.recordRefund, {
          paymentId: captureId,
          refundId: refund.id,
          amount: parseFloat(amount.value),
          status: 'completed',
          reason: 'Customer requested refund',
        });
        break;
      }
    }

    // Return success response
    return NextResponse.json({ 
      received: true,
      eventId: event.id,
      processed: true,
    });

  } catch (error) {
    console.error('PayPal webhook processing error:', error);
    
    // Return error but with 200 status to prevent PayPal from retrying
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        received: true,
      },
      { status: 200 }
    );
  }
}

/**
 * Handle split payments for event organizers
 */
async function handleSplitPayment(
  convex: any,
  capture: any,
  metadata: any
) {
  const { eventId, organizerId, platformFee, organizerAmount } = metadata;
  
  console.log('Processing split payment:', {
    eventId,
    organizerId,
    platformFee,
    organizerAmount,
  });

  // Record the payment split
  await convex.mutation(api.payments.recordSplitPayment, {
    eventId,
    organizerId,
    totalAmount: parseFloat(capture.amount.value),
    platformFee,
    organizerAmount,
    paymentId: capture.id,
    paymentMethod: 'paypal',
    status: 'completed',
  });

  // Schedule payout to organizer if using hold model
  if (metadata.holdForPayout) {
    await convex.mutation(api.payouts.schedulePayout, {
      organizerId,
      eventId,
      amount: organizerAmount,
      payoutDate: metadata.payoutDate,
      paymentReference: capture.id,
    });
  }
}

/**
 * Handle direct platform payments (re-ups, flyers, ads, etc.)
 */
async function handlePlatformPayment(
  convex: any,
  capture: any,
  metadata: any
) {
  const { serviceType, userId, productId, quantity } = metadata;
  
  console.log('Processing platform service payment:', {
    serviceType,
    userId,
    productId,
    quantity,
  });

  // Record the platform payment
  await convex.mutation(api.payments.recordPlatformPayment, {
    userId,
    serviceType, // 'ticket_reup', 'flyer', 'ad', 'premium_subscription', etc.
    productId,
    quantity,
    amount: parseFloat(capture.amount.value),
    paymentId: capture.id,
    paymentMethod: 'paypal',
    status: 'completed',
  });

  // Process the service delivery
  switch (serviceType) {
    case 'ticket_reup':
      await convex.mutation(api.tickets.processReUp, {
        userId,
        eventId: productId,
        quantity,
      });
      break;
    
    case 'flyer':
      await convex.mutation(api.marketing.activateFlyerCampaign, {
        userId,
        flyerId: productId,
        paymentId: capture.id,
      });
      break;
    
    case 'ad':
      await convex.mutation(api.marketing.activateAdCampaign, {
        userId,
        campaignId: productId,
        paymentId: capture.id,
      });
      break;
    
    case 'premium_subscription':
      await convex.mutation(api.subscriptions.activatePremium, {
        userId,
        planId: productId,
        paymentId: capture.id,
      });
      break;
  }
}

/**
 * Handle standard ticket purchases
 */
async function handleTicketPurchase(
  convex: any,
  capture: any,
  metadata: any
) {
  const { eventId, userId, ticketId, waitingListId } = metadata;
  
  // Update ticket payment status
  if (ticketId) {
    await convex.mutation(api.tickets.updateTicketPaymentStatus, {
      ticketId,
      paymentId: capture.id,
      status: 'completed',
      paymentMethod: 'paypal',
    });
  }

  // Process the ticket allocation
  if (eventId && userId) {
    await convex.mutation(api.tickets.confirmPurchase, {
      eventId,
      userId,
      paymentId: capture.id,
      amount: parseFloat(capture.amount.value),
      paymentMethod: 'paypal',
      waitingListId,
    });
  }
}

// PayPal sends GET requests to verify the endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    provider: 'paypal',
    endpoint: '/api/webhooks/paypal',
    supportedEvents: RELEVANT_EVENTS,
  });
}