"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestSessionPage() {
  const { data: session, status, update } = useSession();
  const [refreshCount, setRefreshCount] = useState(0);
  const [cookies, setCookies] = useState("");
  const [localStorage, setLocalStorage] = useState("");

  useEffect(() => {
    // Check cookies
    setCookies(document.cookie);
    
    // Check localStorage
    const storageData = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        storageData.push(`${key}: ${window.localStorage.getItem(key)?.substring(0, 50)}...`);
      }
    }
    setLocalStorage(storageData.join("\n"));
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    update();
  };

  const handlePageReload = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Session Test Page</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${status === "authenticated" ? "bg-green-100 text-green-800" : status === "loading" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{status}</span></p>
            <p><strong>Refresh Count:</strong> {refreshCount}</p>
          </div>
        </div>

        {/* Session Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Session Data</h2>
          {session ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No session data available</p>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {cookies || "No cookies found"}
          </pre>
        </div>

        {/* LocalStorage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">LocalStorage</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {localStorage || "No localStorage data found"}
          </pre>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Test Actions</h2>
          <div className="flex gap-4">
            <Button onClick={handleRefresh} variant="outline">
              Refresh Session (Soft)
            </Button>
            <Button onClick={handlePageReload} variant="default">
              Reload Page (Hard)
            </Button>
            <Button 
              onClick={() => window.location.href = "/auth/signin"} 
              variant="secondary"
              disabled={status === "authenticated"}
            >
              Go to Sign In
            </Button>
            <Button 
              onClick={() => window.location.href = "/dashboard"} 
              variant="secondary"
              disabled={status !== "authenticated"}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Diagnostic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Diagnostic Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>NextAuth URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}