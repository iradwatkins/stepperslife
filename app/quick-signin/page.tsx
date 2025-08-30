"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function QuickSignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // If already logged in, show success and redirect
    if (status === "authenticated" && session) {
      setSuccess(`Already logged in as ${session.user?.email}`);
      setTimeout(() => {
        router.push("/seller/dashboard");
      }, 1500);
    }
  }, [session, status, router]);

  const handleSignIn = async (email: string, password: string, role: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log(`Attempting login for ${role}:`, email);
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/seller/dashboard",
      });
      
      console.log("Sign in result:", result);
      
      if (result?.error) {
        setError(`Login failed: ${result.error}`);
        console.error("Login error:", result.error);
      } else if (result?.ok) {
        setSuccess(`Successfully logged in as ${role}!`);
        console.log("Login successful, redirecting...");
        
        // Force a hard refresh to ensure session is picked up
        setTimeout(() => {
          window.location.href = "/seller/dashboard";
        }, 500);
      } else {
        setError("Unknown error occurred");
      }
    } catch (err) {
      console.error("Sign in exception:", err);
      setError(`Sign in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create test account if needed
  const createAndSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const timestamp = Date.now();
      const email = `test-${timestamp}@stepperslife.com`;
      const password = "Test123!";
      
      // Try to register first
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name: "Test User" 
        }),
      });

      if (registerRes.ok) {
        setSuccess("Test account created!");
        // Now sign in
        await handleSignIn(email, password, "New Test User");
      } else {
        setError("Could not create test account");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quick Sign In</h1>
          <p className="text-gray-600 mt-2">Development & Testing Access</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {status === "authenticated" && session && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Currently logged in as: {session.user?.email}
            <button
              onClick={() => router.push("/seller/dashboard")}
              className="block w-full mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={() => handleSignIn("admin@stepperslife.com", "admin123", "Admin")}
            disabled={loading || status === "authenticated"}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
            <span className="block text-sm opacity-75">admin@stepperslife.com</span>
          </button>
          
          <button
            onClick={() => handleSignIn("test@example.com", "test123", "Test User")}
            disabled={loading || status === "authenticated"}
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in as Test User"}
            <span className="block text-sm opacity-75">test@example.com</span>
          </button>
          
          <button
            onClick={() => handleSignIn("irawatkins@gmail.com", "demo123", "Ira")}
            disabled={loading || status === "authenticated"}
            className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in as Ira"}
            <span className="block text-sm opacity-75">irawatkins@gmail.com</span>
          </button>

          <hr className="my-4" />
          
          <button
            onClick={createAndSignIn}
            disabled={loading || status === "authenticated"}
            className="w-full p-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create New Test Account"}
            <span className="block text-sm opacity-75">Auto-generate credentials</span>
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Session Status: <span className="font-semibold">{status}</span></p>
          <p>Click any button above to sign in instantly</p>
          <a href="/auth/signin" className="text-blue-600 hover:underline block mt-2">
            Use standard sign in →
          </a>
        </div>
      </div>
    </div>
  );
}