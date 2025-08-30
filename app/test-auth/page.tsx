"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch debug info
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch("/api/auth/session-debug");
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error("Failed to fetch debug info:", error);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, [session]);

  const handleTestLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log("Login result:", result);
      // Refresh debug info after login
      setTimeout(fetchDebugInfo, 1000);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Refresh debug info after logout
    setTimeout(fetchDebugInfo, 1000);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        
        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {session ? "Yes ✅" : "No ❌"}</p>
            {session?.user && (
              <>
                <p><strong>User ID:</strong> {session.user.id || "⚠️ Not set"}</p>
                <p><strong>Email:</strong> {session.user.email || "⚠️ Not set"}</p>
                <p className={session.user.name ? "text-green-600" : "text-red-600"}>
                  <strong>Name:</strong> {session.user.name || "❌ NOT SET - THIS IS THE PROBLEM"}
                </p>
                <p><strong>Role:</strong> {(session.user as any).role || "Not set"}</p>
                <p><strong>Provider:</strong> {(session.user as any).provider || "credentials"}</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4 flex-wrap">
            {!session ? (
              <>
                <Button onClick={() => signIn("google")}>
                  Sign in with Google
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/auth/signin"}
                >
                  Go to Sign In Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/auth/signup"}
                >
                  Go to Sign Up Page
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleLogout}>
                  Sign Out
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={fetchDebugInfo}>
              Refresh Debug Info
            </Button>
          </div>
        </div>

        {/* Test Accounts */}
        {!session && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Test Logins</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleTestLogin("test@example.com", "test123")}
                className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded border"
                disabled={isLoading}
              >
                <div className="font-medium">Test User</div>
                <div className="text-sm text-gray-600">test@example.com / test123</div>
              </button>
              
              <button
                onClick={() => handleTestLogin("admin@stepperslife.com", "admin123")}
                className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded border"
                disabled={isLoading}
              >
                <div className="font-medium">Admin User</div>
                <div className="text-sm text-gray-600">admin@stepperslife.com / admin123</div>
              </button>
              
              <button
                onClick={() => handleTestLogin("irawatkins@gmail.com", "demo123")}
                className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded border"
                disabled={isLoading}
              >
                <div className="font-medium">Ira Watkins (Admin)</div>
                <div className="text-sm text-gray-600">irawatkins@gmail.com / demo123</div>
              </button>
            </div>
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          {debugInfo ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          ) : (
            <p>Loading debug info...</p>
          )}
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>First, create a test account using the Sign Up page</li>
            <li>Then try logging in with those credentials</li>
            <li className="font-bold text-red-600">Check if the Name field appears in the session (THIS IS CRITICAL)</li>
            <li>Try refreshing the page to see if session persists</li>
            <li>Test logout and login again</li>
            <li>Try Google OAuth if configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
}