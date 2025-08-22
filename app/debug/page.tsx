"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DebugPage() {
  const events = useQuery(api.events.get);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Convex Connection</h2>
          <p>URL: {convexUrl || "NOT SET"}</p>
          <p>Status: {convexUrl ? "Configured" : "Missing NEXT_PUBLIC_CONVEX_URL"}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Events Data</h2>
          {events === undefined ? (
            <p>Loading...</p>
          ) : events === null ? (
            <p>Error loading events</p>
          ) : (
            <>
              <p>Total Events: {events.length}</p>
              {events.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-semibold">Event List:</h3>
                  <ul className="list-disc pl-5">
                    {events.map((event: any) => (
                      <li key={event._id}>
                        {event.name} - {event.imageStorageId ? "Has Image" : "No Image"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}