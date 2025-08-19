import { AdminRevenue } from "@/components/AdminRevenue";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminRevenuePage() {
  const session = await auth();
  
  // For now, any logged-in user can see this
  // In production, you'd check for admin role
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Revenue Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track all platform transactions, fees, and seller payouts
        </p>
      </div>
      
      <AdminRevenue />
    </div>
  );
}