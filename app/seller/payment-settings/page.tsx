import { auth } from "@clerk/nextjs/server";
import PaymentSettingsClient from "./PaymentSettingsClient";

export default async function PaymentSettingsPage() {
  const { userId } = await auth();
  const userIdString = userId || "";

  // TODO: Fetch actual payment settings from database when Convex is connected
  // For now, pass mock data
  const currentSettings = {
    preferredMethod: undefined,
    squareConnected: false,
    stripeConnected: false, 
    paypalConnected: false,
    zelleConfigured: false,
  };

  return <PaymentSettingsClient userId={userIdString} currentSettings={currentSettings} />;
}