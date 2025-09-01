"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the main event creation page to avoid duplication
export default function SellerNewEventPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/organizer/new-event");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to event creation...</p>
      </div>
    </div>
  );
}