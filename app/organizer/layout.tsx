"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { redirect } from "next/navigation";
import OrganizerSidebar from "@/components/navigation/OrganizerSidebar";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isOrganizer } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect("/sign-in?redirect=/organizer");
  }

  // Redirect non-organizers to become an organizer page
  if (!isOrganizer) {
    redirect("/organizer/onboarding");
  }

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