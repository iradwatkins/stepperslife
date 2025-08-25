"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Building2,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ZelleOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    bankName: "",
    accountHolderName: "",
    agreedToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your Zelle-registered email address.",
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        variant: "destructive",
        title: "Agreement Required",
        description: "Please agree to the terms to continue.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Save Zelle configuration to database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Zelle Configuration Saved",
        description: "Your Zelle payment information has been configured successfully.",
      });
      
      router.push("/seller/payment-settings?success=zelle_configured");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save Zelle configuration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "No Transaction Fees",
      description: "Keep more of your earnings with 0% provider fees",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Direct Bank Transfer",
      description: "Money goes directly to your bank account",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Fast Settlement",
      description: "Receive payments in 1-3 business days",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Bank-Level Security",
      description: "Protected by your bank's security measures",
    },
  ];

  const process = [
    "Buyer selects Zelle as payment method",
    "They receive payment instructions with your Zelle email",
    "Buyer sends payment through their banking app",
    "You verify payment in your bank account",
    "System releases tickets after verification (1-3 days)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configure Zelle Payments</h1>
          <p className="text-gray-600 mt-2">
            Accept direct bank transfers with no transaction fees
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
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

        {/* Important Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Manual Verification Required</AlertTitle>
          <AlertDescription className="text-amber-700 mt-2">
            Zelle payments require manual verification. Tickets are released after you confirm 
            payment receipt in your bank account (typically 1-3 business days). This helps prevent 
            fraud but may delay ticket delivery.
          </AlertDescription>
        </Alert>

        {/* Configuration Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Zelle Account Information</CardTitle>
            <CardDescription>
              Enter the details associated with your Zelle account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="zelle-email">
                  Zelle Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zelle-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be registered with Zelle through your bank
                </p>
              </div>

              <div>
                <Label htmlFor="zelle-phone">
                  Zelle Phone Number (Optional)
                </Label>
                <Input
                  id="zelle-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Alternative if buyers prefer to use phone number
                </p>
              </div>

              <div>
                <Label htmlFor="bank-name">
                  Bank Name (Optional)
                </Label>
                <Input
                  id="bank-name"
                  placeholder="e.g., Chase, Bank of America, Wells Fargo"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Helps buyers identify the correct recipient
                </p>
              </div>

              <div>
                <Label htmlFor="account-name">
                  Account Holder Name (Optional)
                </Label>
                <Input
                  id="account-name"
                  placeholder="As it appears in your bank account"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, agreedToTerms: checked as boolean })
                  }
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I understand that Zelle payments require manual verification and tickets will be 
                  released after I confirm payment receipt (1-3 business days)
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  "Save Zelle Configuration"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How Zelle Payments Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {process.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Best Value for Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Zelle Transaction Fee:</span>
                <span className="font-semibold text-green-600">$0.00 (0%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">SteppersLife Platform Fee:</span>
                <span className="font-semibold">3%</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">You receive on $100 sale:</span>
                  <span className="font-bold text-lg text-green-600">$97.00</span>
                </div>
              </div>
            </div>
            
            <Alert className="mt-4 border-green-200 bg-white">
              <FileText className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Zelle offers the lowest total fees, keeping more money in your pocket!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}