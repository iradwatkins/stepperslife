"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  Send,
  Wallet,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
  Settings,
  XCircle,
  Smartphone,
} from "lucide-react";

type PaymentProvider = "stripe" | "square" | "paypal" | "zelle";

interface PaymentSettingsProps {
  userId: string;
  currentSettings?: {
    preferredMethod?: PaymentProvider;
    squareConnected?: boolean;
    stripeConnected?: boolean;
    paypalConnected?: boolean;
    zelleConfigured?: boolean;
  };
}

export default function PaymentSettingsClient({ userId, currentSettings }: PaymentSettingsProps) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(
    currentSettings?.preferredMethod || null
  );

  const handleConnectProvider = (provider: PaymentProvider) => {
    router.push(`/seller/onboarding/${provider}`);
  };

  const providers = [
    {
      id: "square" as PaymentProvider,
      name: "Square",
      description: "Accept credit/debit cards and CashApp",
      fee: "2.6% + 10¢",
      settlementTime: "1-2 business days",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
      connected: currentSettings?.squareConnected || false,
      features: ["Credit/Debit Cards", "CashApp", "Digital Wallets", "Instant Deposits Available"],
    },
    {
      id: "stripe" as PaymentProvider,
      name: "Stripe",
      description: "Professional payment processing with global reach",
      fee: "2.9% + 30¢",
      settlementTime: "2-7 business days",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
      connected: currentSettings?.stripeConnected || false,
      features: ["Credit/Debit Cards", "Apple Pay", "Google Pay", "International Payments"],
    },
    {
      id: "paypal" as PaymentProvider,
      name: "PayPal",
      description: "Trusted by millions worldwide",
      fee: "2.89% + 49¢",
      settlementTime: "Instant to 3 days",
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600",
      connected: currentSettings?.paypalConnected || false,
      features: ["PayPal Balance", "Credit/Debit Cards", "Buy Now Pay Later", "Buyer Protection"],
    },
    {
      id: "zelle" as PaymentProvider,
      name: "Zelle",
      description: "Direct bank transfers with no fees",
      fee: "0%",
      settlementTime: "1-3 business days",
      icon: <Send className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
      connected: currentSettings?.zelleConfigured || false,
      features: ["No Transaction Fees", "Direct Bank Transfer", "Major US Banks", "Manual Verification"],
    },
  ];

  const hasAnyPaymentMethod = providers.some(p => p.connected);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Choose how you want to accept payments from ticket buyers
          </p>
        </div>

        {/* Platform Fee Notice */}
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-900">Platform Fee Information</AlertTitle>
          <AlertDescription className="text-purple-700">
            SteppersLife charges a $1.50 per ticket platform fee to cover hosting, support, and payment processing infrastructure. 
            This fee is automatically deducted from your payouts.
          </AlertDescription>
        </Alert>

        {/* Warning if no payment method configured */}
        {!hasAnyPaymentMethod && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">No Payment Method Configured</AlertTitle>
            <AlertDescription className="text-red-700">
              You must configure at least one payment method before you can sell tickets. 
              Connect a payment provider below to start accepting payments.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Provider Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Providers</CardTitle>
            <CardDescription>
              Select and configure your preferred payment method. You can connect multiple providers and switch between them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedProvider || ""}>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={`relative border rounded-lg p-4 transition-all ${
                      selectedProvider === provider.id ? "border-purple-500 bg-purple-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={provider.id}
                          id={provider.id}
                          disabled={!provider.connected}
                          className="mt-1"
                        />
                        <div className={`p-2 rounded-lg ${provider.color}`}>
                          {provider.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <label htmlFor={provider.id} className="font-medium text-lg cursor-pointer">
                              {provider.name}
                            </label>
                            {provider.connected && (
                              <Badge variant="default" className="bg-green-600">
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                            {selectedProvider === provider.id && (
                              <Badge variant="default" className="bg-purple-600">
                                Preferred
                              </Badge>
                            )}
                            {provider.id === "square" && (
                              <Badge variant="outline" className="border-blue-500 text-blue-600">
                                <Smartphone className="w-3 h-3 mr-1" />
                                + CashApp
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                          
                          {/* Provider Details */}
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Transaction Fee:</span>
                              <span className="ml-2 font-medium">{provider.fee}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Settlement:</span>
                              <span className="ml-2 font-medium">{provider.settlementTime}</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {provider.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {provider.connected ? (
                          <>
                            {provider.id !== "zelle" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConnectProvider(provider.id)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Manage
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConnectProvider(provider.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Breakdown Example</CardTitle>
            <CardDescription>
              Understanding how fees work on a $50 ticket sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${provider.color}`}>
                      {provider.icon}
                    </div>
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${provider.id === "zelle" ? "48.50" : 
                        provider.id === "square" ? "47.20" :
                        provider.id === "stripe" ? "46.76" : "46.15"}
                    </div>
                    <div className="text-sm text-gray-500">
                      You receive (after $1.50 platform + {provider.fee} provider fee)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help choosing a payment provider?</p>
          <Button variant="link" className="text-purple-600">
            View comparison guide
          </Button>
        </div>
      </div>
    </div>
  );
}