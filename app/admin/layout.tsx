"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { cn } from "@/lib/utils";

// Admin emails that have access
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isSignedIn, isLoaded } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.emailAddresses[0]?.emailAddress && 
    ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Main content area with padding for sidebar */}
      <div className="lg:pl-64 transition-all duration-300">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}