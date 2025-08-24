"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function TestConvexPage() {
  const [testResult, setTestResult] = useState<string>("");
  const events = useQuery(api.events.get);
  const createEvent = useMutation(api.events.create);
  
  const testConnection = async () => {
    try {
      setTestResult("Testing Convex connection...");
      
      // Try to create a test event
      const eventId = await createEvent({
        name: "Test Event - " + new Date().toISOString(),
        description: "This is a test event to verify Convex is working",
        location: "Test Location",
        eventDate: Date.now() + 86400000, // Tomorrow
        price: 100,
        totalTickets: 50,
        userId: "test-user",
        imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
        eventType: "workshop",
      });
      
      setTestResult(`✅ Success! Created event with ID: ${eventId}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
      console.error("Convex test error:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Convex Connection Test</h1>
          
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold mb-2">Connection Status:</h2>
              <div className="text-sm space-y-1">
                <div>URL: {process.env.NEXT_PUBLIC_CONVEX_URL || "Not set"}</div>
                <div>Events Query: {events === undefined ? "⏳ Loading..." : events === null ? "❌ Failed" : `✅ Success (${events.length} events)`}</div>
              </div>
            </div>
            
            {/* Test Button */}
            <div>
              <button
                onClick={testConnection}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Test Create Event
              </button>
              
              {testResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <pre className="text-sm">{testResult}</pre>
                </div>
              )}
            </div>
            
            {/* Events List */}
            {events && events.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Existing Events:</h2>
                <div className="space-y-2">
                  {events.slice(0, 5).map((event: any) => (
                    <div key={event._id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString()} - ${event.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Console Instructions */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">📝 Check Browser Console</h3>
              <p className="text-sm text-gray-700">
                Open DevTools (F12) and check the Console tab. You should see:
              </p>
              <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
                <li>🔗 Convex URL being used: https://mild-newt-621.convex.cloud</li>
                <li>📍 Environment: development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}