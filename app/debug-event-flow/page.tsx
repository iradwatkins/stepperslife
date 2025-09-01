"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugEventFlow() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const addDebug = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  const testNavigation = (path: string) => {
    addDebug(`Attempting navigation to: ${path}`);
    router.push(path);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Event Flow Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Loaded:</span>{" "}
              <span className={isLoaded ? "text-green-600" : "text-yellow-600"}>
                {isLoaded ? "Yes" : "Loading..."}
              </span>
            </div>
            <div>
              <span className="font-semibold">Signed In:</span>{" "}
              <span className={isSignedIn ? "text-green-600" : "text-red-600"}>
                {isSignedIn ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="font-semibold">User ID:</span>{" "}
              {user?.id || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {user?.emailAddresses[0]?.emailAddress || "N/A"}
            </div>
          </CardContent>
        </Card>
        
        {/* Navigation Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => testNavigation("/organizer/onboarding")}
              className="w-full"
              variant="outline"
            >
              Go to Organizer Onboarding
            </Button>
            <Button 
              onClick={() => testNavigation("/organizer/new-event")}
              className="w-full"
              variant="outline"
            >
              Go to New Event (Protected)
            </Button>
            <Button 
              onClick={() => testNavigation("/seller/new-event")}
              className="w-full"
              variant="outline"
            >
              Go to Seller New Event
            </Button>
            <Button 
              onClick={() => window.location.href = "/organizer/new-event"}
              className="w-full"
              variant="outline"
            >
              Hard Navigate to New Event
            </Button>
          </CardContent>
        </Card>
        
        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Current Path:</span>{" "}
              {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Convex URL:</span>{" "}
              {process.env.NEXT_PUBLIC_CONVEX_URL || 'Not set'}
            </div>
            <div>
              <span className="font-semibold">Clerk Key:</span>{" "}
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isSignedIn ? (
              <Button 
                onClick={() => {
                  addDebug("Redirecting to sign-in with callback");
                  router.push("/sign-in?redirect_url=%2Forganizer%2Fnew-event");
                }}
                className="w-full"
              >
                Sign In (with redirect)
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => {
                    addDebug("Creating test event directly");
                    router.push("/test-event-creation-simple");
                  }}
                  className="w-full"
                >
                  Test Simple Event Creation
                </Button>
                <Button 
                  onClick={() => {
                    addDebug("Signing out");
                    router.push("/sign-out");
                  }}
                  className="w-full"
                  variant="destructive"
                >
                  Sign Out
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Debug Log */}
      {debugInfo.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 max-h-64 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs font-mono">
                  {info}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}