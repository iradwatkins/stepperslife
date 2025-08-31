"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, CreditCard, Users, Ticket, Check, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "react-qr-code";

interface TestPaymentFlowProps {
  eventId: Id<"events">;
  ticketTypeId?: Id<"dayTicketTypes">;
  quantity: number;
  totalPrice: number;
  onSuccess?: (tickets: any[]) => void;
  onCancel?: () => void;
}

export default function TestPaymentFlow({
  eventId,
  ticketTypeId,
  quantity,
  totalPrice,
  onSuccess,
  onCancel
}: TestPaymentFlowProps) {
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [customerInfo, setCustomerInfo] = useState({
    name: "Test Customer",
    email: "test@example.com",
    phone: "555-0123"
  });
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const event = useQuery(api.events.getById, { eventId });
  const createTestPurchase = useMutation(api.purchases.createTestPurchase);

  const handleTestPurchase = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert("Please fill in name and email");
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await createTestPurchase({
        eventId,
        ticketTypeId,
        quantity,
        buyerName: customerInfo.name,
        buyerEmail: customerInfo.email,
        buyerPhone: customerInfo.phone,
        totalAmount: totalPrice,
        paymentMethod: "test_cash",
        testMode: true
      });

      setPurchaseResult(result);
      setStep("success");
      
      if (onSuccess) {
        onSuccess(result.tickets);
      }
    } catch (error) {
      console.error("Test purchase failed:", error);
      alert(`Test purchase failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setStep("details");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "success" && purchaseResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Test Purchase Successful!</CardTitle>
              <CardDescription>Your test tickets have been generated</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Purchase Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Purchase Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{event?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{quantity} ticket(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Payment Method:</span>
                  <span className="font-medium">TEST MODE (Cash)</span>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div>
              <h3 className="font-semibold mb-3">Your Tickets</h3>
              <div className="grid gap-4">
                {purchaseResult.tickets?.map((ticket: any, index: number) => (
                  <div key={ticket.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold">Ticket #{index + 1}</p>
                          <p className="text-sm text-gray-600">Code: {ticket.ticketCode}</p>
                        </div>
                        {ticket.qrData && (
                          <div className="bg-white p-2 rounded border">
                            <QRCode 
                              value={ticket.qrData} 
                              size={100}
                              level="H"
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Ticket className="w-8 h-8 text-blue-600 mb-2" />
                        {ticket.shareUrl && (
                          <a
                            href={ticket.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Ticket →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Mode Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Test Mode:</strong> This is a test purchase. No actual payment was processed.
                These tickets are for testing purposes only.
              </p>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              Test Another Purchase
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "processing") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium">Processing test payment...</p>
            <p className="text-sm text-gray-600 mt-2">Generating your tickets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Payment (Cash)</CardTitle>
        <CardDescription>
          Complete a test purchase without actual payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Mode Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800">Test Mode Active</p>
              <p className="text-sm text-orange-700 mt-1">
                This will simulate a cash payment. No actual money will be charged.
                Perfect for testing the complete purchase flow.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Customer Information</h3>
          
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tickets ({quantity}x)</span>
              <span>${(totalPrice / quantity).toFixed(2)} each</span>
            </div>
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTestPurchase}
            disabled={isProcessing || !customerInfo.name || !customerInfo.email}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Test Purchase
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}