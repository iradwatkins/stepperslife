import { Suspense } from "react";
import PaymentSettingsClient from "../organizer/payment-settings/PaymentSettingsClient";

export default async function TestPaymentSettingsPage() {
  // Mock user ID for testing
  const userId = "test_user_123";

  // Mock trust data for testing
  const trustData = {
    trustLevel: "BASIC",
    trustScore: 45,
    metrics: {
      eventsCompleted: 2,
      totalRevenue: 5000,
    },
    maxEventValue: 10000,
    holdPeriod: 7,
  };

  const paymentOptions = {
    trustLevel: "BASIC",
    trustScore: 45,
    options: [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings (Test Mode)</h1>
          <p className="mt-2 text-gray-600">
            Manage your payment models, connected accounts, and payout preferences
          </p>
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
            ⚠️ Test Mode: This page bypasses authentication for development testing
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        }>
          <PaymentSettingsClient 
            userId={userId}
            trustData={trustData}
            paymentOptions={paymentOptions}
          />
        </Suspense>
      </div>
    </div>
  );
}