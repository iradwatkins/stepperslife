"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";
import { createSquareSellerAccount } from "@/app/actions/createSquareSellerAccount";
import { toast } from "@/hooks/use-toast";

export default function SquareOnboardingPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectSquare = async () => {
    setIsConnecting(true);
    try {
      const result = await createSquareSellerAccount();
      
      if (result.success && result.authorizeUrl) {
        // Redirect to Square OAuth
        window.location.href = result.authorizeUrl;
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: result.error || "Failed to connect to Square. Please try again.",
        });
        setIsConnecting(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Accept All Major Cards",
      description: "Visa, Mastercard, American Express, Discover",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "CashApp Integration",
      description: "Accept payments directly from CashApp users",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Fast Deposits",
      description: "Get paid in 1-2 business days (instant available)",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Fraud Protection",
      description: "Built-in fraud detection and chargeback protection",
    },
  ];

  const steps = [
    "Click 'Connect Square Account' below",
    "Log in to your Square account (or create one)",
    "Authorize SteppersLife to process payments",
    "Return here to complete setup",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/seller/payment-settings")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payment Settings
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Square for Payments</h1>
          <p className="text-gray-600 mt-2">
            Accept credit cards and CashApp payments with Square's trusted platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Information */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Transparent Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Square Transaction Fee:</span>
                <span className="font-semibold">2.6% + 10¢</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">SteppersLife Platform Fee:</span>
                <span className="font-semibold">3%</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total Fees on $100 sale:</span>
                  <span className="font-bold text-lg">$5.70</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>You receive:</span>
                  <span className="font-semibold text-green-600">$94.30</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Connect</CardTitle>
            <CardDescription>
              Follow these simple steps to connect your Square account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Bank-Level Security:</strong> Your Square credentials are never stored on our servers. 
            We use OAuth 2.0 for secure authentication, and all payment processing is handled directly by Square.
          </AlertDescription>
        </Alert>

        {/* CTA Section */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="secondary">No Setup Fees</Badge>
                <Badge variant="secondary">No Monthly Fees</Badge>
                <Badge variant="secondary">24/7 Support</Badge>
              </div>
              
              <p className="text-gray-700 mb-6">
                Join thousands of event organizers who trust Square for secure payment processing
              </p>

              <Button
                onClick={handleConnectSquare}
                disabled={isConnecting}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Square Account
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                Don't have a Square account? 
                <a 
                  href="https://squareup.com/signup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Sign up for free
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}