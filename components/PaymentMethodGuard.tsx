"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PaymentMethodGuardProps {
  sellerId: string;
  children: React.ReactNode;
  requirePaymentMethod?: boolean;
}

export default function PaymentMethodGuard({
  sellerId,
  children,
  requirePaymentMethod = true,
}: PaymentMethodGuardProps) {
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPaymentMethod();
  }, [sellerId]);

  async function checkPaymentMethod() {
    try {
      // TODO: Check via Convex API if seller has payment method configured
      // For now, simulate the check
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response - in production this would come from database
      const configured = false; // Set to false to show the guard
      
      setHasPaymentMethod(configured);
    } catch (error) {
      console.error("Error checking payment method:", error);
      setHasPaymentMethod(false);
    } finally {
      setIsChecking(false);
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Checking payment configuration...</p>
        </div>
      </div>
    );
  }

  if (!requirePaymentMethod || hasPaymentMethod) {
    return <>{children}</>;
  }

  // Show payment setup required message
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Alert className="border-red-200 bg-red-50 mb-6">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 text-lg">Payment Method Required</AlertTitle>
        <AlertDescription className="text-red-700 mt-2">
          You must set up a payment method before you can sell tickets. This ensures buyers can purchase your tickets and you can receive payments.
        </AlertDescription>
      </Alert>

      <Card className="border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Payment Method
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect a payment provider to start accepting payments for your events. 
              We support multiple payment methods including Square (with CashApp), Stripe, PayPal, and Zelle.
            </p>

            <div className="grid gap-3 max-w-sm mx-auto mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Quick 5-minute setup</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Multiple payment options for buyers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Secure and automated payouts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>3% platform fee only (no hidden costs)</span>
              </div>
            </div>

            <Link href="/seller/payment-settings">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Set Up Payment Method
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              You can change your payment method anytime from your seller dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}