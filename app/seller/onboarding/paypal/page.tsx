"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Globe,
  CheckCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PayPalOnboardingPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [step, setStep] = useState<"email" | "connect">("email");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paypalEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your PayPal email address.",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setStep("connect");
  };

  const handleConnectPayPal = async () => {
    setIsConnecting(true);
    
    try {
      // TODO: Implement PayPal Partner Referral API
      // For now, simulate the connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would:
      // 1. Call PayPal Partner Referral API
      // 2. Generate partner referral URL
      // 3. Redirect to PayPal for authorization
      
      toast({
        title: "PayPal Integration Coming Soon",
        description: "PayPal partner integration will be available in the next update.",
      });
      
      router.push("/seller/payment-settings");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect PayPal. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: <Wallet className="w-5 h-5" />,
      title: "PayPal & Venmo",
      description: "Accept PayPal balance, Venmo, and saved payment methods",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Guest Checkout",
      description: "Customers can pay with cards without a PayPal account",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Global Reach",
      description: "Accept payments from 200+ markets worldwide",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Buyer Protection",
      description: "PayPal's trusted buyer and seller protection programs",
    },
  ];

  const benefits = [
    "Pay Later options increase average order value by 39%",
    "Trusted by 400+ million active accounts worldwide",
    "Instant transfer to your bank (1.75% fee) or free standard transfer",
    "Advanced fraud protection and dispute resolution",
  ];

  if (step === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/seller/payment-settings")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payment Settings
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Wallet className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Connect PayPal for Payments</h1>
            <p className="text-gray-600 mt-2">
              Accept payments through PayPal, Venmo, and credit cards
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Enter Your PayPal Email</CardTitle>
              <CardDescription>
                We'll use this to set up your PayPal business account integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="paypal-email">PayPal Email Address</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This should be the email associated with your PayPal business account
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800">
                    Don't have a PayPal business account? You can upgrade your personal account 
                    or create a new one during the connection process.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Continue to PayPal Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setStep("email")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete PayPal Setup</h1>
          <p className="text-gray-600 mt-2">
            Connecting: <strong>{paypalEmail}</strong>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
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
                <span className="text-gray-700">PayPal Transaction Fee:</span>
                <span className="font-semibold">2.89% + 49¢</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">SteppersLife Platform Fee:</span>
                <span className="font-semibold">3%</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total Fees on $100 sale:</span>
                  <span className="font-bold text-lg">$6.38</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>You receive:</span>
                  <span className="font-semibold text-green-600">$93.62</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Choose PayPal?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Secure Integration:</strong> We use PayPal's Partner API for secure integration. 
            Your PayPal credentials are never stored on our servers, and all transactions are processed 
            directly through PayPal's secure infrastructure.
          </AlertDescription>
        </Alert>

        {/* CTA Section */}
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="secondary">Instant Payments</Badge>
                <Badge variant="secondary">Buyer Protection</Badge>
                <Badge variant="secondary">24/7 Support</Badge>
              </div>
              
              <p className="text-gray-700 mb-6">
                You'll be redirected to PayPal to authorize the connection
              </p>

              <Button
                onClick={handleConnectPayPal}
                disabled={isConnecting}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Authorize with PayPal
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                By connecting, you agree to PayPal's 
                <a 
                  href="https://www.paypal.com/us/webapps/mpp/ua/useragreement-full" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  User Agreement
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}