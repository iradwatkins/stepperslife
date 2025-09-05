"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, PackageIcon, Loader2 } from "lucide-react";

function ProductSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const updateOrderPaymentStatus = useMutation(api.products.updateOrderPaymentStatus);

  useEffect(() => {
    if (orderId) {
      // Update order status to completed
      updateOrderPaymentStatus({
        orderId,
        paymentStatus: "completed",
      });
    }
  }, [orderId, updateOrderPaymentStatus]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600">Invalid order reference.</p>
          <Button 
            onClick={() => router.push("/")}
            className="mt-4"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order. We've received your payment and will begin processing your custom products.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order ID:</div>
            <div className="font-mono text-lg font-semibold">{orderId}</div>
          </div>

          <div className="space-y-4 text-left mb-8">
            <h2 className="text-xl font-semibold">What's Next?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">1.</span>
                <div>
                  <strong>Design Review:</strong> Our team will review your design files and specifications within 1-2 business days.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">2.</span>
                <div>
                  <strong>Production:</strong> Once approved, your products will go into production. This typically takes 5-7 business days.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">3.</span>
                <div>
                  <strong>Shipping:</strong> Your order will be shipped via your selected method and tracking information will be emailed to you.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You will receive an email confirmation shortly with your order details and receipt.
              If you have any questions, please contact support@stepperslife.com
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push("/organizer/events")}
              variant="outline"
            >
              View My Events
            </Button>
            <Button 
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ProductSuccessContent />
    </Suspense>
  );
}