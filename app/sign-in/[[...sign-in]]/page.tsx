"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Dynamically import SignIn to avoid SSR issues
const ClerkSignIn = typeof window !== 'undefined' && process.env.NODE_ENV === 'production' 
  ? require("@clerk/nextjs").SignIn 
  : null;

export default function SignInPage() {
  const router = useRouter();
  
  // In development, just redirect to home or show a simple login
  if (process.env.NODE_ENV === 'development' || !ClerkSignIn) {
    useEffect(() => {
      // Auto-login in development
      router.push('/');
    }, [router]);
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Development Mode</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Authentication is bypassed in development.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Continue as Test User
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <ClerkSignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-purple-600 hover:bg-purple-700 text-white",
            card: "shadow-xl",
          },
        }}
        afterSignInUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}