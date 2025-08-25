import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Payment provider webhook handlers
async function handleStripeWebhook(request: NextRequest) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const sig = headers().get("stripe-signature");
  
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }
  
  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case "payment_intent.succeeded":
        await processPaymentSuccess("stripe", event.data.object);
        break;
      case "charge.refunded":
        await processRefund("stripe", event.data.object);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

async function handleSquareWebhook(request: NextRequest) {
  const { WebhooksHelper } = await import("square");
  const signature = headers().get("x-square-hmacsha256-signature");
  
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }
  
  try {
    const body = await request.text();
    const webhooksHelper = new WebhooksHelper({
      signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    });
    
    const isValid = webhooksHelper.isValidWebhookEventSignature(
      body,
      signature,
      process.env.NEXT_PUBLIC_APP_URL + "/api/webhooks/payment",
      "x-square-hmacsha256-signature"
    );
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    const event = JSON.parse(body);
    
    switch (event.type) {
      case "payment.updated":
        if (event.data.object.payment.status === "COMPLETED") {
          await processPaymentSuccess("square", event.data.object.payment);
        }
        break;
      case "refund.created":
        await processRefund("square", event.data.object.refund);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Square webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

async function handlePayPalWebhook(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const body = await request.json();
  
  try {
    // Verify PayPal webhook signature
    const verifyResponse = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getPayPalAccessToken()}`,
        },
        body: JSON.stringify({
          auth_algo: headers().get("paypal-auth-algo"),
          cert_url: headers().get("paypal-cert-url"),
          transmission_id: headers().get("paypal-transmission-id"),
          transmission_sig: headers().get("paypal-transmission-sig"),
          transmission_time: headers().get("paypal-transmission-time"),
          webhook_id: webhookId,
          webhook_event: body,
        }),
      }
    );
    
    const verification = await verifyResponse.json();
    if (verification.verification_status !== "SUCCESS") {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    switch (body.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await processPaymentSuccess("paypal", body.resource);
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
        await processRefund("paypal", body.resource);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

// Process successful payment
async function processPaymentSuccess(provider: string, paymentData: any) {
  try {
    // Extract metadata based on provider
    let metadata: any = {};
    let paymentId: string;
    let amount: number;
    let ticketCount: number;
    
    switch (provider) {
      case "stripe":
        metadata = paymentData.metadata || {};
        paymentId = paymentData.id;
        amount = paymentData.amount / 100; // Convert from cents
        ticketCount = parseInt(metadata.ticketCount || "1");
        break;
      
      case "square":
        metadata = paymentData.note ? JSON.parse(paymentData.note) : {};
        paymentId = paymentData.id;
        amount = paymentData.total_money.amount / 100; // Convert from cents
        ticketCount = parseInt(metadata.ticketCount || "1");
        break;
      
      case "paypal":
        metadata = paymentData.custom_metadata || {};
        paymentId = paymentData.id;
        amount = parseFloat(paymentData.amount.value);
        ticketCount = parseInt(metadata.ticketCount || "1");
        break;
      
      default:
        console.error("Unknown provider:", provider);
        return;
    }
    
    // Update transaction status in Convex
    await convex.mutation(api.transactions.updateTransactionStatus, {
      paymentId,
      status: "completed",
    });
    
    console.log(`Payment processed: ${provider} - ${paymentId} - ${ticketCount} tickets - $${amount}`);
  } catch (error) {
    console.error("Error processing payment success:", error);
  }
}

// Process refund
async function processRefund(provider: string, refundData: any) {
  try {
    let paymentId: string;
    
    switch (provider) {
      case "stripe":
        paymentId = refundData.payment_intent;
        break;
      
      case "square":
        paymentId = refundData.payment_id;
        break;
      
      case "paypal":
        paymentId = refundData.id;
        break;
      
      default:
        console.error("Unknown provider:", provider);
        return;
    }
    
    // Update transaction status in Convex
    await convex.mutation(api.transactions.updateTransactionStatus, {
      paymentId,
      status: "refunded",
    });
    
    console.log(`Refund processed: ${provider} - ${paymentId}`);
  } catch (error) {
    console.error("Error processing refund:", error);
  }
}

// Helper function to get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  
  const response = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  
  const data = await response.json();
  return data.access_token;
}

// Main webhook handler
export async function POST(request: NextRequest) {
  const provider = headers().get("x-payment-provider");
  
  // Try to detect provider from headers if not explicitly set
  const stripeSignature = headers().get("stripe-signature");
  const squareSignature = headers().get("x-square-hmacsha256-signature");
  const paypalTransmissionId = headers().get("paypal-transmission-id");
  
  try {
    if (provider === "stripe" || stripeSignature) {
      return await handleStripeWebhook(request);
    } else if (provider === "square" || squareSignature) {
      return await handleSquareWebhook(request);
    } else if (provider === "paypal" || paypalTransmissionId) {
      return await handlePayPalWebhook(request);
    } else {
      return NextResponse.json(
        { error: "Unknown payment provider" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}