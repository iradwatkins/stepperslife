"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Send,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Settings
} from "lucide-react";
import { toast } from "sonner";

export type PayoutMethod = "square" | "paypal" | "stripe" | "cashapp" | "zelle";

interface SplitPayment {
  id: string;
  recipientName: string;
  recipientEmail: string;
  percentage: number;
  payoutMethod: PayoutMethod;
  accountDetails?: string;
}

interface OrganizerPayoutSettingsProps {
  userId: string;
  currentSettings?: {
    primaryPayoutMethod?: PayoutMethod;
    splitPayments?: SplitPayment[];
    zelleEmail?: string;
    zellePhone?: string;
    cashAppHandle?: string;
    paypalEmail?: string;
    stripeAccountId?: string;
    squareLocationId?: string;
  };
}

export default function OrganizerPayoutSettings({ 
  userId, 
  currentSettings 
}: OrganizerPayoutSettingsProps) {
  const [primaryMethod, setPrimaryMethod] = useState<PayoutMethod>(
    currentSettings?.primaryPayoutMethod || "square"
  );
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>(
    currentSettings?.splitPayments || []
  );
  const [zelleEmail, setZelleEmail] = useState(currentSettings?.zelleEmail || "");
  const [zellePhone, setZellePhone] = useState(currentSettings?.zellePhone || "");
  const [cashAppHandle, setCashAppHandle] = useState(currentSettings?.cashAppHandle || "");
  const [paypalEmail, setPaypalEmail] = useState(currentSettings?.paypalEmail || "");
  const [enableSplitPayments, setEnableSplitPayments] = useState(
    (currentSettings?.splitPayments?.length || 0) > 0
  );
  const [isSaving, setIsSaving] = useState(false);

  const payoutMethods = [
    { id: "square" as PayoutMethod, name: "Square", icon: CreditCard, connected: !!currentSettings?.squareLocationId },
    { id: "paypal" as PayoutMethod, name: "PayPal", icon: Wallet, connected: !!currentSettings?.paypalEmail },
    { id: "stripe" as PayoutMethod, name: "Stripe", icon: CreditCard, connected: !!currentSettings?.stripeAccountId },
    { id: "cashapp" as PayoutMethod, name: "Cash App", icon: DollarSign, connected: !!currentSettings?.cashAppHandle },
    { id: "zelle" as PayoutMethod, name: "Zelle", icon: Send, connected: !!currentSettings?.zelleEmail },
  ];

  const addSplitPayment = () => {
    const newSplit: SplitPayment = {
      id: Date.now().toString(),
      recipientName: "",
      recipientEmail: "",
      percentage: 0,
      payoutMethod: "paypal",
    };
    setSplitPayments([...splitPayments, newSplit]);
  };

  const removeSplitPayment = (id: string) => {
    setSplitPayments(splitPayments.filter(sp => sp.id !== id));
  };

  const updateSplitPayment = (id: string, field: keyof SplitPayment, value: any) => {
    setSplitPayments(splitPayments.map(sp => 
      sp.id === id ? { ...sp, [field]: value } : sp
    ));
  };

  const totalPercentage = splitPayments.reduce((sum, sp) => sum + (sp.percentage || 0), 0);
  const isValidSplit = totalPercentage === 100 && splitPayments.every(sp => 
    sp.recipientName && sp.recipientEmail && sp.percentage > 0
  );

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Validate split payments if enabled
      if (enableSplitPayments && !isValidSplit) {
        toast.error("Split payments must total 100% and all fields must be filled");
        setIsSaving(false);
        return;
      }

      // Here you would save to your database via API
      const settings = {
        primaryPayoutMethod: primaryMethod,
        splitPayments: enableSplitPayments ? splitPayments : [],
        zelleEmail,
        zellePhone,
        cashAppHandle,
        paypalEmail,
      };

      // API call would go here
      console.log("Saving settings:", settings);
      
      toast.success("Payout settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
          <CardDescription>
            Configure how you receive payments from ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="methods" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="split">Split Payments</TabsTrigger>
              <TabsTrigger value="accounts">Account Details</TabsTrigger>
            </TabsList>

            <TabsContent value="methods" className="space-y-4">
              <div>
                <Label>Primary Payout Method</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select your preferred method for receiving payments
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {payoutMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPrimaryMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        primaryMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <method.icon className={`w-6 h-6 mb-2 ${
                        primaryMethod === method.id ? "text-blue-600" : "text-gray-600"
                      }`} />
                      <div className="font-medium">{method.name}</div>
                      {method.connected ? (
                        <Badge variant="success" className="mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1">
                          Not Connected
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {primaryMethod === "zelle" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Zelle payouts are processed as bank transfers and may take 1-3 business days.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="split" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Split Payments</Label>
                  <p className="text-sm text-gray-600">
                    Automatically split ticket revenue between multiple recipients
                  </p>
                </div>
                <Switch
                  checked={enableSplitPayments}
                  onCheckedChange={setEnableSplitPayments}
                />
              </div>

              {enableSplitPayments && (
                <>
                  <div className="space-y-3">
                    {splitPayments.map((split) => (
                      <Card key={split.id}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label>Name</Label>
                              <Input
                                placeholder="Recipient name"
                                value={split.recipientName}
                                onChange={(e) => updateSplitPayment(split.id, "recipientName", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                type="email"
                                placeholder="recipient@email.com"
                                value={split.recipientEmail}
                                onChange={(e) => updateSplitPayment(split.id, "recipientEmail", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Percentage</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={split.percentage}
                                  onChange={(e) => updateSplitPayment(split.id, "percentage", parseInt(e.target.value) || 0)}
                                />
                                <span>%</span>
                              </div>
                            </div>
                            <div>
                              <Label>Method</Label>
                              <div className="flex items-center gap-2">
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  value={split.payoutMethod}
                                  onChange={(e) => updateSplitPayment(split.id, "payoutMethod", e.target.value as PayoutMethod)}
                                >
                                  {payoutMethods.map(method => (
                                    <option key={method.id} value={method.id}>
                                      {method.name}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSplitPayment(split.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={addSplitPayment}
                      disabled={splitPayments.length >= 5}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recipient
                    </Button>
                    
                    <div className="text-right">
                      <div className={`font-medium ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}>
                        Total: {totalPercentage}%
                      </div>
                      {totalPercentage !== 100 && (
                        <p className="text-sm text-red-600">Must equal 100%</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Zelle Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-sm">Email</Label>
                      <Input
                        type="email"
                        placeholder="zelle@email.com"
                        value={zelleEmail}
                        onChange={(e) => setZelleEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Phone (optional)</Label>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={zellePhone}
                        onChange={(e) => setZellePhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Cash App</Label>
                  <Input
                    placeholder="$cashtag"
                    value={cashAppHandle}
                    onChange={(e) => setCashAppHandle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>PayPal</Label>
                  <Input
                    type="email"
                    placeholder="paypal@email.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect Square Account
                  </Button>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect Stripe Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving || (enableSplitPayments && !isValidSplit)}
            >
              {isSaving ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}