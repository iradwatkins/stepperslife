"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickSignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("Invalid credentials");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Quick Sign In</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={() => handleSignIn("admin@stepperslife.com", "admin123")}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Sign in as Admin
          </button>
          
          <button
            onClick={() => handleSignIn("test@example.com", "test123")}
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Sign in as Test User
          </button>
          
          <button
            onClick={() => handleSignIn("irawatkins@gmail.com", "demo123")}
            disabled={loading}
            className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Sign in as Ira
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Click any button above to sign in instantly</p>
        </div>
      </div>
    </div>
  );
}