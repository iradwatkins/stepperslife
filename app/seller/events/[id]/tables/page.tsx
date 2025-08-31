import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SellerTableManager from "@/components/SellerTableManager";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EventTablesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href={`/seller/events/${params.id}/edit`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Table Sales Management</h1>
          <p className="mt-2 text-gray-600">
            Sell and manage table purchases for this event
          </p>
        </div>
        
        <SellerTableManager eventId={params.id as Id<"events">} />
      </div>
    </div>
  );
}