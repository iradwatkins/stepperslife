import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PaymentSettingsClient from "./PaymentSettingsClient";

export default async function PaymentSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const userId = user?.id;
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