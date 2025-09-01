"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformFee, setPlatformFee] = useState("1.50");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  const handleSave = () => {
    // TODO: Implement saving settings
    alert("Settings saved (not implemented yet)");
  };

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
                <p className="text-sm text-gray-600 mt-1">Currently: $1.50 per ticket</p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Important</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Changing platform fees will only affect new ticket purchases. 
                      Existing tickets retain their original fee structure.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Providers</CardTitle>
              <CardDescription>Configure available payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Square/CashApp</p>
                    <p className="text-sm text-gray-600">Process payments via Square</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-gray-600">Accept PayPal payments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Zelle</p>
                    <p className="text-sm text-gray-600">Direct bank transfers via Zelle</p>
                  </div>
                  <Switch defaultChecked />
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
                  <Input value="irawatkins@gmail.com" disabled />
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