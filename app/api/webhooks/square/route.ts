import { headers } from "next/headers";
import { getWebhooksHelper } from "@/lib/square";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { SquareCheckoutMetaData } from "@/app/actions/createSquareCheckoutSession";

export async function POST(req: Request) {
  console.log("Square Webhook received");

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("x-square-hmacsha256-signature") as string;

  console.log("Webhook signature:", signature ? "Present" : "Missing");

  // Verify the webhook signature
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
  const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/square`;

  try {
    const webhooksHelper = await getWebhooksHelper();
    const isValid = webhooksHelper.isValidWebhookEventSignature(
      body,
      signature,
      webhookSignatureKey,
      notificationUrl
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const event = JSON.parse(body);
  console.log("Webhook event type:", event.type);

  const convex = getConvexClient();

  // Handle payment completed event
  if (event.type === "payment.created" || event.type === "payment.updated") {
    console.log("Processing payment event");
    const payment = event.data.object.payment;
    
    if (payment.status === "COMPLETED") {
      try {
        // Retrieve the payment link metadata from your database
        const paymentLinkData = await convex.query(api.payments.getSquarePaymentLink, {
          paymentId: payment.id,
        });

        if (paymentLinkData) {
          const metadata = paymentLinkData.metadata as SquareCheckoutMetaData;
          
          const result = await convex.mutation(api.events.purchaseTicket, {
            eventId: metadata.eventId,
            userId: metadata.userId,
            waitingListId: metadata.waitingListId,
            paymentInfo: {
              paymentIntentId: payment.id,
              amount: Number(payment.amount_money.amount),
            },
          });
          console.log("Purchase ticket mutation completed:", result);

          // Record platform transaction for revenue tracking
          await convex.mutation(api.platformTransactions.recordTransaction, {
            eventId: metadata.eventId,
            ticketId: result.ticketId,
            buyerId: metadata.userId,
            buyerEmail: payment.buyer_email_address || metadata.userId,
            amount: Number(payment.amount_money.amount) / 100, // Convert from cents
            squarePaymentId: payment.id,
            squareOrderId: payment.order_id,
          });
          console.log("Platform transaction recorded");
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error processing webhook", { status: 500 });
      }
    }
  }

  // Handle refund events
  if (event.type === "refund.created" || event.type === "refund.updated") {
    console.log("Processing refund event");
    const refund = event.data.object.refund;
    
    if (refund.status === "COMPLETED") {
      try {
        // Handle refund completion logic here
        await convex.mutation(api.tickets.markAsRefunded, {
          paymentIntentId: refund.payment_id,
          refundId: refund.id,
        });
      } catch (error) {
        console.error("Error processing refund webhook:", error);
      }
    }
  }

  return new Response(null, { status: 200 });
}