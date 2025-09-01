"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect from old /seller routes to new /organizer routes
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace("/seller", "/organizer");
    router.replace(newPath);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to organizer dashboard...</p>
      </div>
    </div>
  );
}