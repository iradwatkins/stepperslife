"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBagIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { createSquareProductCheckout } from "@/app/actions/createSquareProductCheckout";

function ProductCheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const updateOrderPaymentStatus = useMutation(api.products.updateOrderPaymentStatus);

  useEffect(() => {
    // In a real app, you would fetch the order details here
    // For now, we'll use mock data
    if (orderId) {
      // Mock order data
      setOrder({
        orderId,
        totalAmount: 250.00, // Example amount
        items: "Custom Products",
        shippingMethod: "standard",
      });
    }
  }, [orderId]);

  const handleCheckout = async () => {
    if (!orderId || !user?.id || !order) {
      alert("Missing order information");
      return;
    }

    setIsProcessing(true);

    try {
      // Create Square checkout session
      const { sessionUrl } = await createSquareProductCheckout({
        orderId,
        amount: order.totalAmount,
        userId: user.id,
      });

      // Redirect to Square checkout
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Order Found</h1>
          <p className="text-gray-600">Please go back and create an order first.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Order</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
              <span className="font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600 dark:text-gray-400">Items:</span>
              <span>{order.items}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
              <span className="capitalize">{order.shippingMethod}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-cyan-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You will be redirected to Square's secure checkout page to complete your payment.
              Your order will be processed once payment is confirmed.
            </p>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with Square"
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure payment powered by Square
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ProductCheckoutContent />
    </Suspense>
  );
}