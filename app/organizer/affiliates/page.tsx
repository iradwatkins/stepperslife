import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Link2, Plus, DollarSign } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import AffiliateClient from "./AffiliateClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrganizerAffiliates() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">Please sign in to view your affiliates</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Fetch affiliate data server-side
    let affiliateData = null;
    let error = null;
    
    try {
      affiliateData = await fetchQuery(api.affiliates.getOrganizerAffiliates, {
        organizerId: userId
      });
    } catch (err) {
      console.error("Error fetching affiliate data:", err);
      error = err instanceof Error ? err.message : "Failed to load affiliate data";
    }
    
    // Pass data to client component
    return <AffiliateClient 
      organizerId={userId} 
      initialData={affiliateData}
      error={error}
    />;
  } catch (error) {
    console.error("Auth error in affiliates page:", error);
    // Return a client component fallback for auth errors
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Authentication error. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}