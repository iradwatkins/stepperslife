"use client";

import { useState } from "react";
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
  X,
  ArrowRight,
  Wallet,
  Share2,
  Settings
} from "lucide-react";
import PaymentModelSelector from "@/components/payment/PaymentModelSelector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

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
        description: `Your default is now: ${selectedModel}`,
      });
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

  const getTrustLevelColor = () => {
    if (!trustData) return "bg-gray-500";
    switch (trustData.trustLevel) {
      case "VIP": return "bg-purple-500";
      case "TRUSTED": return "bg-blue-500";
      case "BASIC": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Level Overview */}
      {trustData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle>Your Trust Level</CardTitle>
                <Badge className={getTrustLevelColor()}>
                  {trustData.trustLevel}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Score: {trustData.trustScore}/100
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={trustData.trustScore} className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Events Completed:</span>
                <p className="font-semibold">{trustData.metrics?.eventsCompleted || 0}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Revenue:</span>
                <p className="font-semibold">${(trustData.metrics?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Max Event Value:</span>
                <p className="font-semibold">${trustData.maxEventValue?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Payout Hold:</span>
                <p className="font-semibold">{trustData.holdPeriod} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Settings Tabs */}
      <Tabs defaultValue="payment-models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-models">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Models
          </TabsTrigger>
          <TabsTrigger value="connected-accounts">
            <Building2 className="w-4 h-4 mr-2" />
            Connected Accounts
          </TabsTrigger>
          <TabsTrigger value="affiliate-settings">
            <Users className="w-4 h-4 mr-2" />
            Affiliate Settings
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <DollarSign className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* Payment Models Tab */}
        <TabsContent value="payment-models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Payment Model</CardTitle>
              <CardDescription>
                Choose your default payment model for new events. You can change this per event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentModelSelector
                organizerId={userId}
                onSelect={setSelectedModel}
                selectedModel={selectedModel}
                ticketPrice={50}
              />
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSaveDefaultModel}
                  disabled={!selectedModel || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Default Model"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Accounts Tab */}
        <TabsContent value="connected-accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Provider Connections</CardTitle>
              <CardDescription>
                Connect your payment accounts to accept payments with Connect & Collect or Split Payments models.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

        {/* Affiliate Settings Tab */}
        <TabsContent value="affiliate-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program Settings</CardTitle>
              <CardDescription>
                Configure how affiliates work with your chosen payment model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2">How affiliates work with your payment model:</h4>
                
                {selectedModel === "connect_collect" && (
                  <div className="space-y-2 text-sm">
                    <p>✓ Affiliates can connect their own payment methods</p>
                    <p>✓ They collect payments directly from customers</p>
                    <p>✓ You verify payments to activate tickets</p>
                    <p>✓ You pay affiliates their commission manually</p>
                  </div>
                )}
                
                {selectedModel === "premium" && (
                  <div className="space-y-2 text-sm">
                    <p>✓ All payments go through SteppersLife</p>
                    <p>✓ Affiliates cannot accept direct payments</p>
                    <p>✓ Tickets are automatically active</p>
                    <p>✓ You pay affiliates from your payout</p>
                  </div>
                )}
                
                {selectedModel === "split" && (
                  <div className="space-y-2 text-sm">
                    <p>✓ Platform handles payment splits</p>
                    <p>✓ Affiliates track sales only</p>
                    <p>✓ You pay affiliates their commission</p>
                    <p>✓ Automatic platform fee deduction</p>
                  </div>
                )}
                
                {!selectedModel && (
                  <p className="text-sm text-gray-600">
                    Select a payment model to see affiliate options
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Default Commission Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Commission per ticket</label>
                    <input
                      type="number"
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                      placeholder="$5.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Commission percentage</label>
                    <input
                      type="number"
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                      placeholder="10%"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link href="/organizer/affiliates">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Affiliates
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
              <CardTitle>Payout Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive payouts from SteppersLife
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payout Method */}
              <div>
                <label className="text-sm font-semibold">Preferred Payout Method</label>
                <select className="mt-2 w-full px-3 py-2 border rounded-lg">
                  <option>Bank Transfer (ACH)</option>
                  <option>PayPal</option>
                  <option>Check</option>
                  <option>Wire Transfer</option>
                </select>
              </div>

              {/* Bank Information */}
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

              {/* Upcoming Payouts */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Upcoming Payouts</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Summer Dance Festival</p>
                        <p className="text-sm text-gray-600">Payout date: Feb 15, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$1,250.00</p>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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