import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Building, DollarSign, Settings } from "lucide-react";

export default function OrganizerPaymentSettings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Configure how you receive payments</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Bank Account
            </CardTitle>
            <CardDescription>Connect your bank account for payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Link your bank account to receive earnings from ticket sales
            </p>
            <Button>Connect Bank Account</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Accepted payment types for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose which payment methods customers can use
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Credit/Debit Cards</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>PayPal</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Apple Pay</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Google Pay</span>
              </label>
            </div>
            <Button className="mt-4">Save Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Schedule
            </CardTitle>
            <CardDescription>When you receive your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose how often you want to receive payouts
            </p>
            <select className="w-full p-2 border rounded-lg mb-4">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <Button>Update Schedule</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}