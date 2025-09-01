"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push("/");
      return;
    }

    // Check if user is admin
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail === "iradwalkins@gmail.com") {
      // Admin user - redirect to admin dashboard
      router.push("/admin");
    } else if (user?.publicMetadata?.isOrganizer || user?.publicMetadata?.isSeller) {
      // Organizer/Seller - redirect to organizer dashboard
      router.push("/organizer");
    } else {
      // Regular user - redirect to profile
      router.push("/profile");
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up your dashboard...</p>
      </div>
    </div>
  );
}