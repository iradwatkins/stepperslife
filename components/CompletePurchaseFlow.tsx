"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TicketTypeSelector from "./TicketTypeSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import TestPaymentFlow from "./TestPaymentFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket } from "lucide-react";

interface CompletePurchaseFlowProps {
  eventId: Id<"events">;
  onComplete?: () => void;
  onCancel?: () => void;
  enableTestMode?: boolean;
}

type FlowStep = "tickets" | "payment" | "checkout" | "success";

export default function CompletePurchaseFlow({
  eventId,
  onComplete,
  onCancel,
  enableTestMode = true
}: CompletePurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("tickets");
  const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  const event = useQuery(api.events.getById, { eventId });
  const ticketTypes = useQuery(api.ticketTypes.getEventTicketTypes, { eventId });

  const totalPrice = selectedTickets.reduce((sum, selection) => {
    const price = selection.ticketType.hasEarlyBird && 
                  selection.ticketType.earlyBirdEndDate &&
                  Date.now() < selection.ticketType.earlyBirdEndDate &&
                  selection.ticketType.earlyBirdPrice
                  ? selection.ticketType.earlyBirdPrice
                  : selection.ticketType.price;
    return sum + (price * selection.quantity);
  }, 0);

  const totalQuantity = selectedTickets.reduce((sum, selection) => 
    sum + selection.quantity, 0
  );

  const handleTicketSelection = (selections: any[]) => {
    setSelectedTickets(selections);
    setCurrentStep("payment");
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setCurrentStep("checkout");
  };

  const handlePurchaseSuccess = (tickets: any[]) => {
    setPurchaseResult({ tickets });
    setCurrentStep("success");
    if (onComplete) {
      onComplete();
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "payment":
        setCurrentStep("tickets");
        break;
      case "checkout":
        setCurrentStep("payment");
        break;
      default:
        break;
    }
  };

  if (!event || !ticketTypes) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (currentStep === "success") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Purchase Complete!</CardTitle>
          <CardDescription>Your tickets have been generated and sent to your email</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center py-8">
              <Ticket className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Thank you for your purchase!</h3>
              <p className="text-gray-600">
                {purchaseResult?.tickets?.length || 0} ticket(s) have been generated
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = `/events`}
              className="w-full"
            >
              Browse More Events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center ${currentStep === "tickets" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            currentStep === "tickets" ? "border-blue-600 bg-blue-50" : "border-gray-300"
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Select Tickets</span>
        </div>
        
        <div className="w-12 border-t-2 border-gray-300"></div>
        
        <div className={`flex items-center ${currentStep === "payment" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            currentStep === "payment" ? "border-blue-600 bg-blue-50" : "border-gray-300"
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Payment Method</span>
        </div>
        
        <div className="w-12 border-t-2 border-gray-300"></div>
        
        <div className={`flex items-center ${currentStep === "checkout" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            currentStep === "checkout" ? "border-blue-600 bg-blue-50" : "border-gray-300"
          }`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Checkout</span>
        </div>
      </div>

      {/* Back Button */}
      {currentStep !== "tickets" && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      {/* Step Content */}
      {currentStep === "tickets" && ticketTypes && (
        <TicketTypeSelector
          ticketTypes={ticketTypes}
          onProceedToCheckout={handleTicketSelection}
          eventName={event.name}
          eventDate={event.eventDate}
        />
      )}

      {currentStep === "payment" && (
        <PaymentMethodSelector
          onMethodSelect={handlePaymentMethodSelect}
          eventPrice={totalPrice}
          enableTestMode={enableTestMode}
        />
      )}

      {currentStep === "checkout" && paymentMethod === "test_cash" && selectedTickets[0] && (
        <TestPaymentFlow
          eventId={eventId}
          ticketTypeId={selectedTickets[0].ticketType._id}
          quantity={totalQuantity}
          totalPrice={totalPrice}
          onSuccess={handlePurchaseSuccess}
          onCancel={() => setCurrentStep("payment")}
        />
      )}

      {currentStep === "checkout" && paymentMethod && paymentMethod !== "test_cash" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600">
                {paymentMethod} checkout coming soon...
              </p>
              <Button 
                onClick={() => setCurrentStep("payment")}
                className="mt-4"
                variant="outline"
              >
                Choose Different Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}