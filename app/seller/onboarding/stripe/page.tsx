"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Globe,
  CheckCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
  Zap,
} from "lucide-react";
import { createStripeConnectAccount } from "@/app/actions/createStripeConnectAccount";
import { toast } from "@/hooks/use-toast";

export default function StripeOnboardingPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const result = await createStripeConnectAccount();
      
      if (result.success && result.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingUrl;
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: result.error || "Failed to connect to Stripe. Please try again.",
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
      title: "Global Payment Methods",
      description: "Accept cards, Apple Pay, Google Pay, and 40+ payment methods",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "International Support",
      description: "Accept payments from customers in 195+ countries",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Payouts",
      description: "Get paid within minutes with Instant Payouts (1% fee)",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Advanced Fraud Protection",
      description: "Machine learning powered fraud detection and prevention",
    },
  ];

  const steps = [
    "Click 'Connect Stripe Account' below",
    "Create or log in to your Stripe account",
    "Provide your business information",
    "Verify your identity (required for payouts)",
    "Return here once complete",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Stripe for Payments</h1>
          <p className="text-gray-600 mt-2">
            Professional payment processing with global reach and advanced features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
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
                <span className="text-gray-700">Stripe Transaction Fee:</span>
                <span className="font-semibold">2.9% + 30¢</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">SteppersLife Platform Fee:</span>
                <span className="font-semibold">3%</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total Fees on $100 sale:</span>
                  <span className="font-bold text-lg">$6.20</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>You receive:</span>
                  <span className="font-semibold text-green-600">$93.80</span>
                </div>
              </div>
            </div>
            
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Instant Payouts Available:</strong> Get your money in minutes instead of days 
                for an additional 1% fee (optional).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Connection Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Connect</CardTitle>
            <CardDescription>
              Stripe Connect Express accounts are quick to set up and fully managed by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Note:</strong> Stripe requires identity verification for all sellers. 
                This is a one-time process that typically takes 2-3 minutes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>PCI Compliant & Secure:</strong> Stripe is certified to PCI Service Provider Level 1, 
            the highest level of certification. Your data and your customers' data are protected with 
            bank-level security.
          </AlertDescription>
        </Alert>

        {/* CTA Section */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="secondary">No Setup Fees</Badge>
                <Badge variant="secondary">No Monthly Fees</Badge>
                <Badge variant="secondary">24/7 Support</Badge>
              </div>
              
              <p className="text-gray-700 mb-6">
                Join millions of businesses worldwide who trust Stripe for secure, reliable payment processing
              </p>

              <Button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Stripe Account
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                By connecting, you agree to Stripe's 
                <a 
                  href="https://stripe.com/connect-account/legal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline ml-1"
                >
                  Connected Account Agreement
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}