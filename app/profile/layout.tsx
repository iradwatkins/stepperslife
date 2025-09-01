"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import CustomerSidebar from "@/components/navigation/CustomerSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect("/sign-in?redirect=/profile");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CustomerSidebar />
      
      {/* Main content area with padding for sidebar */}
      <div className="lg:pl-64 pt-16">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}