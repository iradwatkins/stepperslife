import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PaymentSettingsClient from "./PaymentSettingsClient";

export default async function PaymentSettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const userIdString = userId;

  // Fetch actual payment settings from database
  const currentSettings = {
    preferredMethod: undefined,
    squareConnected: false,
    stripeConnected: false, 
    paypalConnected: false,
    zelleConfigured: false,
  };

  return <PaymentSettingsClient userId={userIdString} currentSettings={currentSettings} />;
}