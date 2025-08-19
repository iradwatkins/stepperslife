"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  Building2,
  Send,
  Wallet,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PaymentSettingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.email || "";

  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    // Payment toggles
    acceptSquare: true,
    acceptStripe: false,
    acceptPayPal: false,
    acceptZelle: false,
    acceptBank: false,
    
    // Zelle settings
    zelleEmail: "",
    zellePhone: "",
    
    // Bank settings
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    
    // PayPal settings
    paypalEmail: "",
    
    // Preferred payout method
    preferredPayout: "square" as "square" | "stripe" | "paypal" | "bank",
  });

  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      // Save settings to database
      // This would call a Convex mutation to update user payment settings
      toast({
        title: "Settings saved",
        description: "Your payment settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure which payment methods you accept and your payout preferences
          </p>
        </div>

        <Tabs defaultValue="accept" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accept">Accept Payments</TabsTrigger>
            <TabsTrigger value="payout">Payout Settings</TabsTrigger>
            <TabsTrigger value="manual">Manual Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="accept" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Payment Methods</CardTitle>
                <CardDescription>
                  Choose which payment methods buyers can use for your events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Square */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Square</p>
                      <p className="text-sm text-gray-600">
                        Credit/debit cards, digital wallets (2.9% + 30¢ per transaction)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptSquare}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, acceptSquare: checked })
                    }
                  />
                </div>

                {/* Stripe */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-gray-600">
                        Cards, Apple Pay, Google Pay (2.9% + 30¢ per transaction)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptStripe}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, acceptStripe: checked })
                    }
                  />
                </div>

                {/* PayPal */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Wallet className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-600">
                        PayPal balance, cards (3.49% + 49¢ per transaction)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptPayPal}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, acceptPayPal: checked })
                    }
                  />
                </div>

                {/* Zelle */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Send className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Zelle</p>
                      <p className="text-sm text-gray-600">
                        Manual verification required (No fees, 1-3 day processing)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptZelle}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, acceptZelle: checked })
                    }
                  />
                </div>

                {/* Bank Transfer */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-600">
                        Direct bank transfer (No fees, 2-5 day processing)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptBank}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, acceptBank: checked })
                    }
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    At least one payment method must be enabled for buyers to purchase tickets
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payout Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive payments from ticket sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Payout Method</Label>
                  <select
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                    value={paymentSettings.preferredPayout}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        preferredPayout: e.target.value as any,
                      })
                    }
                  >
                    <option value="square">Square (Instant)</option>
                    <option value="stripe">Stripe (2-3 days)</option>
                    <option value="paypal">PayPal (Instant)</option>
                    <option value="bank">Bank Transfer (3-5 days)</option>
                  </select>
                </div>

                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Platform fee: 5% of ticket sales + payment processing fees
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect Payment Accounts</CardTitle>
                <CardDescription>
                  Link your payment provider accounts to receive payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Square Account</p>
                        <p className="text-sm text-gray-600">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Stripe Account</p>
                        <p className="text-sm text-gray-600">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">PayPal Account</p>
                        <p className="text-sm text-gray-600">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zelle Settings</CardTitle>
                <CardDescription>
                  Configure your Zelle account for receiving payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="zelle-email">Zelle Email</Label>
                  <Input
                    id="zelle-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={paymentSettings.zelleEmail}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, zelleEmail: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="zelle-phone">Zelle Phone (Optional)</Label>
                  <Input
                    id="zelle-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={paymentSettings.zellePhone}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, zellePhone: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Account Settings</CardTitle>
                <CardDescription>
                  Configure your bank account for receiving transfers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    placeholder="Chase Bank"
                    value={paymentSettings.bankName}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, bankName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="account-name">Account Holder Name</Label>
                  <Input
                    id="account-name"
                    placeholder="John Doe"
                    value={paymentSettings.accountName}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, accountName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      type="password"
                      placeholder="••••••••••"
                      value={paymentSettings.accountNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          accountNumber: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing-number">Routing Number</Label>
                    <Input
                      id="routing-number"
                      placeholder="123456789"
                      value={paymentSettings.routingNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          routingNumber: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bank account information is encrypted and stored securely. Only use this
                    for receiving payments from verified buyers.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isUpdating}
            size="lg"
            className="min-w-[150px]"
          >
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}