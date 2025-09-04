"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AffiliateClient from "./AffiliateClient";

export default function OrganizerAffiliates() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/organizer/affiliates");
    }
  }, [isLoaded, isSignedIn, router]);
  
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (!isSignedIn || !user) {
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
  
  // Pass user ID to client component - it will fetch data itself
  return <AffiliateClient 
    organizerId={user.id} 
    initialData={null}
    error={null}
  />;
}