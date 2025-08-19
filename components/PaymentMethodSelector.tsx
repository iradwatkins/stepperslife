"use client";

import { useState } from "react";
import { CreditCard, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export type PaymentMethod = "square" | "stripe" | "paypal" | "cashapp";

interface PaymentMethodSelectorProps {
  availableMethods?: PaymentMethod[];
  onMethodSelect: (method: PaymentMethod) => void;
  eventPrice: number;
}

const paymentMethods = [
  {
    id: "square" as PaymentMethod,
    name: "Square (Credit/Debit)",
    description: "Pay securely with Square checkout",
    icon: CreditCard,
    processingTime: "Instant",
    available: true,
  },
  {
    id: "stripe" as PaymentMethod,
    name: "Stripe (Credit/Debit)",
    description: "Pay securely with Stripe checkout",
    icon: CreditCard,
    processingTime: "Instant",
    available: true,
  },
  {
    id: "paypal" as PaymentMethod,
    name: "PayPal",
    description: "Pay with PayPal account or linked card",
    icon: Wallet,
    processingTime: "Instant",
    available: true,
  },
  {
    id: "cashapp" as PaymentMethod,
    name: "Cash App",
    description: "Pay instantly with Cash App",
    icon: DollarSign,
    processingTime: "Instant",
    available: true,
  },
];

export default function PaymentMethodSelector({
  availableMethods = ["square", "stripe", "paypal", "cashapp"],
  onMethodSelect,
  eventPrice,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = () => {
    if (selectedMethod) {
      setIsProcessing(true);
      onMethodSelect(selectedMethod);
    }
  };

  const filteredMethods = paymentMethods.filter(
    (method) => availableMethods.includes(method.id) && method.available
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>
          Choose how you'd like to pay for your ticket (${eventPrice.toFixed(2)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedMethod || ""}
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
        >
          {filteredMethods.map((method) => (
            <div key={method.id} className="relative">
              <div
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <method.icon className={`w-5 h-5 ${
                        selectedMethod === method.id ? "text-blue-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                  <Badge variant={method.processingTime === "Instant" ? "default" : "secondary"}>
                    {method.processingTime}
                  </Badge>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        {selectedMethod === "cashapp" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> You'll be redirected to Cash App to complete your payment securely.
            </p>
          </div>
        )}
        
        {selectedMethod === "stripe" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You'll be redirected to Stripe's secure checkout to complete your payment.
            </p>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!selectedMethod || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : selectedMethod ? (
            `Continue with ${paymentMethods.find((m) => m.id === selectedMethod)?.name}`
          ) : (
            "Select a payment method"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}