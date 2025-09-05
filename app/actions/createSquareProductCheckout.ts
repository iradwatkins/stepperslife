"use server";

import { getCheckoutApi, getLocationId, isSquareReady } from "@/lib/square-client";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import baseUrl from "@/lib/baseUrl";
import { randomUUID } from "crypto";

export type ProductCheckoutMetaData = {
  orderId: string;
  userId: string;
  productType: "custom_products";
};

export async function createSquareProductCheckout({
  orderId,
  amount,
  userId,
}: {
  orderId: string;
  amount: number;
  userId: string;
}) {
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  const metadata: ProductCheckoutMetaData = {
    orderId,
    userId,
    productType: "custom_products",
  };

  try {
    // Check if Square is ready
    if (!isSquareReady()) {
      throw new Error("Square payment system is not configured. Please contact support.");
    }
    
    // Get Square API instances
    const checkoutApi = getCheckoutApi();
    const locationId = getLocationId();
    
    // Create Square Checkout Link
    const { result } = await checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: `Custom Products Order #${orderId}`,
        priceMoney: {
          amount: BigInt(Math.round(amount * 100)),
          currency: "USD",
        },
        locationId: locationId,
      },
      checkoutOptions: {
        allowTipping: false,
        redirectUrl: `${baseUrl}/products/success?orderId=${orderId}`,
        merchantSupportEmail: "support@stepperslife.com",
        askForShippingAddress: false, // We already collected this
      },
      paymentNote: `Product Order #${orderId}`,
    });

    if (result.paymentLink) {
      // Store the payment link ID with metadata
      await convex.mutation(api.products.storeProductPaymentLink, {
        orderId,
        paymentId: result.paymentLink.id!,
        metadata: {
          orderReference: orderId,
          userId,
          eventId: undefined,
          productType: "custom_products",
        },
        amount,
      });

      return { 
        sessionId: result.paymentLink.id, 
        sessionUrl: result.paymentLink.url 
      };
    }

    throw new Error("Failed to create payment link");
  } catch (error) {
    console.error("Square product checkout creation error:", error);
    throw new Error("Failed to create checkout session");
  }
}