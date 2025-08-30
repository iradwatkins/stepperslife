"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestCrudPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [eventName, setEventName] = useState("Test Event " + Date.now());
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  
  // Mutations
  const createEvent = useMutation(api.events.create);
  
  // Query to get user's events
  const userEvents = useQuery(api.events.getEventsByUser, 
    user?.emailAddresses[0]?.emailAddress ? { userId: user.emailAddresses[0].emailAddress } : "skip"
  );
  
  const handleCreateEvent = async () => {
    try {
      setError(null);
      setResult(null);
      
      const userId = user?.id || user?.emailAddresses[0]?.emailAddress || "test-user";
      
      const eventData = {
        name: eventName,
        description: "Test event created from CRUD test page",
        location: "Test Location",
        eventDate: Date.now() + 86400000, // Tomorrow
        price: 25,
        totalTickets: 100,
        userId: userId,
        isTicketed: true,
        eventCategories: ["other"],
        eventType: "other"
      };
      
      console.log("Creating event with data:", eventData);
      
      const eventId = await createEvent(eventData);
      
      console.log("Event created with ID:", eventId);
      setResult({ success: true, eventId, data: eventData });
      
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err);
    }
  };
  
  if (!isSignedIn) {
    return <div className="p-8">Loading...</div>;
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CRUD Test Page</h1>
      
      {/* Authentication Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Authentication Status</h2>
        <p>Status: {isSignedIn ? "authenticated" : "unauthenticated"}</p>
        <p>User: {user?.emailAddresses[0]?.emailAddress || "Not signed in"}</p>
        <p>User ID: {user?.id || user?.emailAddresses[0]?.emailAddress || "None"}</p>
        
        {!user && (
          <button
            onClick={() => router.push("/auth/signin")}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Sign In
          </button>
        )}
      </div>
      
      {/* Create Event Test */}
      <div className="bg-white border p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-4">Create Event Test</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!user}
          >
            Create Test Event
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="font-semibold text-green-800">Success!</p>
            <pre className="text-xs mt-1 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800">Error:</p>
            <pre className="text-xs mt-1 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* User Events */}
      <div className="bg-white border p-4 rounded-lg">
        <h2 className="font-semibold mb-4">Your Events</h2>
        
        {userEvents === undefined ? (
          <p>Loading events...</p>
        ) : userEvents === null || userEvents.length === 0 ? (
          <p className="text-gray-500">No events found</p>
        ) : (
          <div className="space-y-2">
            {userEvents.map((event: any) => (
              <div key={event._id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(event._creationTime).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">ID: {event._id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}