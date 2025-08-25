import { auth } from "@/auth";
import PaymentSettingsClient from "./PaymentSettingsClient";

export default async function PaymentSettingsPage() {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email || "";

  // TODO: Fetch actual payment settings from database when Convex is connected
  // For now, pass mock data
  const currentSettings = {
    preferredMethod: undefined,
    squareConnected: false,
    stripeConnected: false, 
    paypalConnected: false,
    zelleConfigured: false,
  };

  return <PaymentSettingsClient userId={userId} currentSettings={currentSettings} />;
}