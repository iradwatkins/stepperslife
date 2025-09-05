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
    // Try to fetch trust data if the API exists
    try {
      trustData = await fetchQuery(api.trust.trustScoring.getOrganizerTrustLevel, {
        organizerId: userId,
      });
    } catch (e) {
      // Default trust data if API doesn't exist yet
      trustData = {
        trustLevel: "BASIC",
        trustScore: 50,
        holdPeriod: 7,
        metrics: { eventsCompleted: 0 }
      };
    }
    
    // Try to fetch payment options if API exists  
    try {
      paymentOptions = await fetchQuery(api.decisionEngine.getAvailablePaymentOptions, {
        organizerId: userId,
      });
    } catch (e) {
      // Default payment options
      paymentOptions = {
        options: ["credits", "premium", "split"]
      };
    }
  } catch (error) {
    console.error("Error fetching payment data:", error);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your payment models, connected accounts, and payout preferences
        </p>
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
  );
}