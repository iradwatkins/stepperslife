"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to NextAuth sign-in page (can handle both sign in and sign up)
    router.push('/auth/signin');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to sign up...
        </p>
      </div>
    </div>
  );
}