"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const { signOut, loaded } = useClerk();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Wait for Clerk to load
        if (!loaded) return;
        
        // Sign out and redirect
        await signOut(() => {
          // Use window.location for more reliable redirect
          window.location.href = "/";
        });
      } catch (err) {
        console.error("Sign out error:", err);
        setError("An error occurred while signing out");
        // Fallback: clear cookies and redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    };

    performSignOut();
  }, [signOut, loaded, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2 text-red-600">Sign Out Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Signing out...</h1>
        <p className="text-gray-600">Please wait while we sign you out</p>
      </div>
    </div>
  );
}