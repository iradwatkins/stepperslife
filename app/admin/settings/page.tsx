"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface PaymentProvider {
  configured: boolean;
  enabled: boolean;
  environment?: string;
  lastTestStatus?: string;
  credentials?: any;
  cashAppEnabled?: boolean; // For Square provider
}

interface PaymentSettings {
  providers: {
    square: PaymentProvider;
    paypal: PaymentProvider;
    stripe?: PaymentProvider;
  };
  platformSettings: {
    platformFeePerTicket: string;
    paymentProcessingMode: string;
  };
}

export default function AdminSettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  
  // General settings
  const [platformFee, setPlatformFee] = useState("1.50");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [squareCredentials, setSquareCredentials] = useState({
    accessToken: '',
    applicationId: '',
    locationId: '',
  });
  const [paypalCredentials, setPaypalCredentials] = useState({
    clientId: '',
    clientSecret: '',
  });
  const [stripeCredentials, setStripeCredentials] = useState({
    publishableKey: '',
    secretKey: '',
  });

  // Load payment settings
  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings');
      if (response.ok) {
        const data = await response.json();
        setPaymentSettings(data);
        setPlatformFee(data.platformSettings.platformFeePerTicket);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const savePaymentProvider = async (provider: string, credentials: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          settings: {
            enabled: true,
            environment: 'sandbox', // Change to 'production' when ready
            credentials,
            platformFeePerTicket: parseFloat(platformFee),
          },
        }),
      });

      if (response.ok) {
        toast.success(`${provider} settings saved successfully`);
        await loadPaymentSettings();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error(`Failed to save ${provider} settings`);
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (provider: string) => {
    setTesting(provider);
    try {
      const response = await fetch('/api/admin/payment-settings/test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      toast.error(`Failed to test ${provider}`);
    } finally {
      setTesting(null);
    }
  };

  const toggleProvider = async (provider: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: enabled ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        toast.success(`${provider} ${enabled ? 'enabled' : 'disabled'}`);
        await loadPaymentSettings();
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${provider}`);
    }
  };

  const handleSave = () => {
    toast.success('General settings saved');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Disable the platform for maintenance</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">Allow Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to sign up</p>
                </div>
                <Switch
                  id="registration"
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-verification">Require Email Verification</Label>
                  <p className="text-sm text-gray-600">Users must verify email before access</p>
                </div>
                <Switch
                  id="email-verification"
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Fees</CardTitle>
              <CardDescription>Configure platform fee structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform-fee">Platform Fee per Ticket</Label>
                <div className="flex gap-2 mt-2">
                  <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-l-lg">$</span>
                  <Input
                    id="platform-fee"
                    type="number"
                    step="0.01"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Currently: ${platformFee} per ticket</p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Important</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Platform supports two payment models:<br/>
                      • <strong>Split Payments</strong>: For event organizers (payment split between organizer and platform)<br/>
                      • <strong>Direct Payments</strong>: For platform services (ticket re-ups, flyers, ads, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Providers</CardTitle>
              <CardDescription>Configure payment methods for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Square (includes Cash App Pay) */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        Square (includes Cash App Pay)
                        {paymentSettings?.providers.square.configured ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {paymentSettings?.providers.square.environment === 'production' ? 'Production' : 'Sandbox'} Mode
                        {paymentSettings?.providers.square.configured && ' • Cash App Pay Enabled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testProvider('square')}
                      disabled={testing === 'square'}
                    >
                      {testing === 'square' ? 'Testing...' : 'Test'}
                    </Button>
                    <Switch 
                      checked={paymentSettings?.providers.square.enabled || false}
                      onCheckedChange={(checked) => toggleProvider('square', checked)}
                    />
                  </div>
                </div>
                {!paymentSettings?.providers.square.configured && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Square SDK handles both credit/debit card payments and Cash App Pay
                    </p>
                    <Input
                      placeholder="Access Token"
                      value={squareCredentials.accessToken}
                      onChange={(e) => setSquareCredentials({...squareCredentials, accessToken: e.target.value})}
                    />
                    <Input
                      placeholder="Application ID"
                      value={squareCredentials.applicationId}
                      onChange={(e) => setSquareCredentials({...squareCredentials, applicationId: e.target.value})}
                    />
                    <Input
                      placeholder="Location ID"
                      value={squareCredentials.locationId}
                      onChange={(e) => setSquareCredentials({...squareCredentials, locationId: e.target.value})}
                    />
                    <Button
                      size="sm"
                      onClick={() => savePaymentProvider('square', squareCredentials)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Square Configuration'}
                    </Button>
                  </div>
                )}
              </div>

              {/* PayPal */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        PayPal
                        {paymentSettings?.providers.paypal.configured ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {paymentSettings?.providers.paypal.mode === 'live' ? 'Production' : 'Sandbox'} Mode
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testProvider('paypal')}
                      disabled={testing === 'paypal'}
                    >
                      {testing === 'paypal' ? 'Testing...' : 'Test'}
                    </Button>
                    <Switch 
                      checked={paymentSettings?.providers.paypal.enabled || false}
                      onCheckedChange={(checked) => toggleProvider('paypal', checked)}
                    />
                  </div>
                </div>
                {!paymentSettings?.providers.paypal.configured && (
                  <div className="space-y-2 pt-2 border-t">
                    <Input
                      placeholder="Client ID"
                      value={paypalCredentials.clientId}
                      onChange={(e) => setPaypalCredentials({...paypalCredentials, clientId: e.target.value})}
                    />
                    <Input
                      placeholder="Client Secret"
                      type="password"
                      value={paypalCredentials.clientSecret}
                      onChange={(e) => setPaypalCredentials({...paypalCredentials, clientSecret: e.target.value})}
                    />
                    <Button
                      size="sm"
                      onClick={() => savePaymentProvider('paypal', paypalCredentials)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save PayPal Configuration'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Stripe (Coming Soon) */}
              <div className="border rounded-lg p-4 space-y-3 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Stripe
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Coming Soon</span>
                    </p>
                    <p className="text-sm text-gray-600">Awaiting API credentials</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>

              {/* Zelle */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zelle</p>
                    <p className="text-sm text-gray-600">Direct bank transfers via Zelle</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize automated email communications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Email template configuration coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Admin Email Addresses</Label>
                <p className="text-sm text-gray-600 mb-2">Users with admin access</p>
                <div className="space-y-2">
                  <Input value="admin@stepperslife.com" disabled />
                  <Input value="iradwatkins@gmail.com" disabled />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Contact development team to modify admin access
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}