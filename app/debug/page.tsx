"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getConvexStatus, isConvexConfigured } from "@/lib/convex-utils";

export default function DebugPage() {
  const convexStatus = getConvexStatus();
  const events = isConvexConfigured() ? useQuery(api.events.get) : null;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className={`p-4 rounded ${convexStatus.configured ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <h2 className="font-semibold mb-2">Convex Connection</h2>
          <p><strong>Status:</strong> {convexStatus.configured ? "✅ Connected" : "⚠️ Not Connected"}</p>
          <p><strong>URL:</strong> {convexStatus.url || "NOT SET"}</p>
          <p className="text-sm mt-2">{convexStatus.message}</p>
          
          {!convexStatus.configured && (
            <div className="mt-4 p-3 bg-white rounded">
              <p className="font-semibold">To fix this:</p>
              <ol className="list-decimal pl-5 text-sm mt-2">
                <li>Get your Convex deployment URL from https://dashboard.convex.dev</li>
                <li>Add it to your Coolify environment variables:</li>
                <li className="font-mono bg-gray-100 p-1 mt-1">
                  NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
                </li>
              </ol>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Events Data</h2>
          {!isConvexConfigured() ? (
            <p className="text-amber-600">⚠️ Cannot load events - Convex is not configured</p>
          ) : events === undefined ? (
            <p>Loading...</p>
          ) : events === null ? (
            <p className="text-red-600">Error loading events</p>
          ) : (
            <>
              <p><strong>Total Events:</strong> {events.length}</p>
              {events.length > 0 ? (
                <div className="mt-3">
                  <h3 className="font-semibold mb-2">Event List:</h3>
                  <div className="space-y-2">
                    {events.map((event: any) => (
                      <div key={event._id} className="p-2 bg-white rounded">
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-gray-600">
                          ID: {event._id} | 
                          Image: {event.imageStorageId ? "✅ Has Image" : "❌ No Image"} |
                          Date: {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-2">No events found in the database</p>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Environment Info</h2>
          <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>App URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || "Not set"}</p>
        </div>
      </div>
    </div>
  );
}