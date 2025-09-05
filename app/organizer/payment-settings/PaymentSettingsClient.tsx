"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Building2, 
  Users, 
  DollarSign, 
  Shield, 
  Trophy,
  AlertCircle,
  Check,
  Package,
  Wallet,
  TrendingUp,
  ArrowRight,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/payment-utils";

interface PaymentSettingsClientProps {
  userId: string;
  trustData: any;
  paymentOptions: any;
}

export default function PaymentSettingsClient({ 
  userId, 
  trustData, 
  paymentOptions 
}: PaymentSettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = useState<"credits" | "premium" | "split" | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Query credit balance
  const creditBalance = useQuery(api.credits.creditManager.getBalance, {
    organizationId: userId
  });

  // Query credit packages
  const creditPackages = useQuery(api.credits.creditPackages.getActivePackages);

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSaveDefaultModel = async () => {
    if (!selectedModel) {
      toast({
        variant: "destructive",
        title: "No model selected",
        description: "Please select a payment model first",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save to user preferences (would call a mutation)
      toast({
        title: "Default payment model saved",
        description: `Your default is now: ${getModelName(selectedModel)}`,
      });
      
      // Navigate based on the selected payment model
      setTimeout(() => {
        switch (selectedModel) {
          case "credits":
            // Redirect to credits purchase
            router.push("/organizer/credits");
            toast({
              title: "Next Step: Purchase Credits",
              description: "Buy credits to start selling tickets at the lowest fees",
            });
            break;
            
          case "split":
            // Redirect to split configuration
            router.push("/organizer/payment-settings?tab=split-setup");
            toast({
              title: "Next Step: Configure Revenue Sharing",
              description: "Set up how you want to split payments with partners",
            });
            break;
            
          case "premium":
            // Show confirmation - no additional setup needed
            toast({
              title: "You're All Set!",
              description: "SteppersLife will handle all payment processing for you.",
            });
            break;
        }
      }, 1500);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getModelName = (model: string) => {
    switch (model) {
      case "credits": return "Prepaid Credits";
      case "premium": return "Full Service Processing";
      case "split": return "Revenue Split";
      default: return model;
    }
  };

  const getTrustLevelColor = () => {
    if (!trustData) return "bg-gray-500";
    switch (trustData.trustLevel) {
      case "VIP": return "bg-cyan-500";
      case "TRUSTED": return "bg-blue-500";
      case "BASIC": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Level & Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Level Card */}
        {trustData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <CardTitle>Trust Level</CardTitle>
                  <Badge className={getTrustLevelColor()}>
                    {trustData.trustLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={trustData.trustScore} className="mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Events Completed:</span>
                  <span className="font-semibold">{trustData.metrics?.eventsCompleted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payout Hold:</span>
                  <span className="font-semibold">{trustData.holdPeriod} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Balance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-purple-500" />
                <CardTitle>Credit Balance</CardTitle>
              </div>
              <Link href="/organizer/credits">
                <Button size="sm">Manage Credits</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold">{creditBalance?.availableCredits || 0}</p>
                <p className="text-sm text-gray-500">Available Credits</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reserved:</span>
                <span>{creditBalance?.reservedCredits || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Value:</span>
                <span className="font-semibold">
                  {formatCurrency((creditBalance?.availableCredits || 0) * 0.79)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payment-models">
            <CreditCard className="w-4 h-4 mr-2" />
            Models
          </TabsTrigger>
          <TabsTrigger value="credits">
            <Package className="w-4 h-4 mr-2" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="processors">
            <Building2 className="w-4 h-4 mr-2" />
            Processors
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <DollarSign className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment System Overview</CardTitle>
              <CardDescription>
                SteppersLife offers three payment models to match your business needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Credits Model */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Prepaid Credits</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Lowest fees at $0.79 per ticket. Buy credits upfront and connect your own payment processor.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-green-600">Best Value</Badge>
                      {creditBalance && creditBalance.availableCredits > 0 && (
                        <Badge className="bg-purple-100 text-purple-700">
                          {creditBalance.availableCredits} credits available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Model */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Full Service Processing</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We handle everything - payments, chargebacks, and support. 3.7% + $1.79 per ticket.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-blue-600">Zero Setup</Badge>
                      <Badge variant="outline">Chargeback Protection</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Model */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Revenue Split</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatic revenue sharing with partners. Platform takes 10%, you get 90%.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Partner Friendly</Badge>
                      {trustData?.trustLevel === "VIP" && (
                        <Badge className="bg-cyan-100 text-cyan-700">Available to VIP</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Models Tab */}
        <TabsContent value="payment-models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Payment Model</CardTitle>
              <CardDescription>
                Select the payment model that best fits your event strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div className="grid gap-4">
                {/* Credits Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === "credits" 
                      ? "border-purple-600 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => setSelectedModel("credits")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Prepaid Credits</h4>
                        <p className="text-sm text-gray-600 mt-1">$0.79 per ticket • Connect your own processor</p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>✓ Lowest fees in the industry</li>
                          <li>✓ Instant access to funds</li>
                          <li>✓ Use Stripe, Square, or PayPal</li>
                        </ul>
                      </div>
                    </div>
                    {selectedModel === "credits" && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </div>

                {/* Premium Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === "premium" 
                      ? "border-teal-600 bg-teal-50" 
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                  onClick={() => setSelectedModel("premium")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Full Service Processing</h4>
                        <p className="text-sm text-gray-600 mt-1">3.7% + $1.79 per ticket • We handle everything</p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>✓ No upfront costs</li>
                          <li>✓ Chargeback protection</li>
                          <li>✓ 24/7 customer support</li>
                        </ul>
                      </div>
                    </div>
                    {selectedModel === "premium" && (
                      <Check className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                </div>

                {/* Split Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === "split" 
                      ? "border-orange-600 bg-orange-50" 
                      : "border-gray-200 hover:border-orange-300"
                  } ${trustData?.trustLevel !== "VIP" ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (trustData?.trustLevel === "VIP") {
                      setSelectedModel("split");
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-orange-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Revenue Split</h4>
                        <p className="text-sm text-gray-600 mt-1">10% platform fee • Automatic partner splits</p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>✓ Perfect for partnerships</li>
                          <li>✓ Automatic revenue sharing</li>
                          <li>✓ Transparent reporting</li>
                        </ul>
                        {trustData?.trustLevel !== "VIP" && (
                          <p className="text-xs text-orange-600 mt-2">
                            Requires VIP trust level
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedModel === "split" && (
                      <Check className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button 
                  onClick={handleSaveDefaultModel}
                  disabled={!selectedModel || isSaving}
                >
                  {isSaving ? "Saving..." : "Set as Default Model"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Management</CardTitle>
              <CardDescription>
                Purchase and manage your ticket credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Balance */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {creditBalance?.availableCredits || 0} credits
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Worth {formatCurrency((creditBalance?.availableCredits || 0) * 0.79)}
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-purple-200" />
                </div>
              </div>

              {/* Credit Packages */}
              <div className="space-y-3">
                <h4 className="font-semibold">Purchase Credits</h4>
                <div className="grid gap-3">
                  {creditPackages?.map((pkg) => (
                    <div key={pkg._id} className="p-3 border rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{pkg.name}</p>
                          <p className="text-sm text-gray-600">
                            {pkg.credits} credits • ${(pkg.price / pkg.credits).toFixed(3)} per credit
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${pkg.price}</p>
                          {pkg.savingsPercent > 0 && (
                            <Badge className="bg-green-100 text-green-700">
                              Save {pkg.savingsPercent}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link href="/organizer/credits">
                  <Button className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Go to Credit Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processors Tab */}
        <TabsContent value="processors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processors</CardTitle>
              <CardDescription>
                Connect your payment accounts for the Credits model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedModel !== "credits" && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">
                        Processors only needed for Credits model
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        You only need to connect a payment processor if you're using the Prepaid Credits model.
                        Premium and Split models use SteppersLife's payment processing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Connect */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Stripe</h4>
                    <p className="text-sm text-gray-600">Accept cards, Apple Pay, Google Pay</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/organizer/connect/stripe">
                    Connect Stripe
                  </Link>
                </Button>
              </div>

              {/* Square Connect */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Square</h4>
                    <p className="text-sm text-gray-600">In-person and online payments</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/organizer/connect/square">
                    Connect Square
                  </Link>
                </Button>
              </div>

              {/* PayPal */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">PayPal</h4>
                    <p className="text-sm text-gray-600">PayPal and Venmo payments</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/organizer/connect/paypal">
                    Connect PayPal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>
                Configure how you receive payments based on your model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model-specific payout info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Payout Schedule by Model:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Credits:</span> Instant - funds go directly to your processor
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Premium:</span> {trustData?.holdPeriod || 7} days after event
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Split:</span> Weekly on Mondays
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Information (for Premium/Split) */}
              {(selectedModel === "premium" || selectedModel === "split") && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Bank Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Account Name</label>
                      <input
                        type="text"
                        className="mt-1 w-full px-3 py-2 border rounded-lg"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Account Type</label>
                      <select className="mt-1 w-full px-3 py-2 border rounded-lg">
                        <option>Checking</option>
                        <option>Savings</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Routing Number</label>
                      <input
                        type="text"
                        className="mt-1 w-full px-3 py-2 border rounded-lg"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Account Number</label>
                      <input
                        type="text"
                        className="mt-1 w-full px-3 py-2 border rounded-lg"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Payout Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}