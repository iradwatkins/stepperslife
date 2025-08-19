import SellerDashboard from "@/components/SellerDashboard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SellerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerDashboard />
    </div>
  );
}
