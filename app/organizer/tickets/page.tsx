"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import TicketsClient from "./TicketsClient";

export default function OrganizerTicketsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/organizer/tickets");
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
            <p className="text-center text-gray-600">Please sign in to view your tickets</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Pass user ID to client component
  return <TicketsClient organizerId={user.id} />;
}