import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PaymentSettingsClient from "./PaymentSettingsClient";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function PaymentSettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch trust level and available payment options
  let trustData = null;
  let paymentOptions = null;
  
  try {
    trustData = await fetchQuery(api.trust.trustScoring.getOrganizerTrustLevel, {
      organizerId: userId,
    });
    
    paymentOptions = await fetchQuery(api.trust.trustScoring.getAvailablePaymentOptions, {
      organizerId: userId,
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your payment models, connected accounts, and payout preferences
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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