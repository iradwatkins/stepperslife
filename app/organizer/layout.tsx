"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OrganizerSidebar from "@/components/navigation/OrganizerSidebar";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect=/organizer");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow all signed-in users to access organizer section
  // They become organizers once they create their first event

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrganizerSidebar />
      
      {/* Main content area with padding for sidebar */}
      <div className="lg:pl-64 pt-16">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}