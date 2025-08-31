import TableDistributionDashboard from "@/components/TableDistributionDashboard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function MyTablesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Table Purchases</h1>
          <p className="mt-2 text-gray-600">
            Manage and distribute tickets from your table purchases
          </p>
        </div>
        
        <TableDistributionDashboard />
      </div>
    </div>
  );
}