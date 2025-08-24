"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import PurchaseTicketWithQuantity from "@/components/PurchaseTicketWithQuantity";

export default function DemoPage() {
  const createEvent = useMutation(api.events.create);
  const router = useRouter();
  const [eventId, setEventId] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createDemoEvent = async () => {
    setLoading(true);
    try {
      const id = await createEvent({
        name: "Demo Concert - Table Purchase Test",
        description: "This is a demo event to test table/group ticket purchases. You can buy individual tickets or entire tables!",
        location: "Madison Square Garden, New York",
        eventDate: new Date("2025-12-31T20:00:00").getTime(),
        price: 50,
        totalTickets: 100,
        userId: "demo-user",
        imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
      });
      setEventId(id);
    } catch (error) {
      console.error("Error creating demo event:", error);
      alert("Error creating demo event: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Table Purchase Demo</h1>
          
          {!eventId ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Step 1: Create Demo Event</h2>
                <p className="text-gray-600 mb-4">
                  First, we need to create a demo event to test the table purchase feature.
                </p>
                <button
                  onClick={createDemoEvent}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Creating..." : "Create Demo Event"}
                </button>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg opacity-50">
                <h2 className="text-xl font-semibold mb-3">Step 2: Test Table Purchase</h2>
                <p className="text-gray-600">
                  After creating the event, you'll see the table purchase interface here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-semibold">✅ Demo Event Created!</p>
                <p className="text-sm text-green-600 mt-1">Event ID: {eventId}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Test Table Purchase Interface</h2>
                <p className="text-gray-600 mb-6">
                  Below is the actual purchase component that appears on event pages. 
                  Try switching between "Individual Tickets" and "Table/Group" to see the different options.
                </p>

                {/* This is the actual component used on event pages */}
                <PurchaseTicketWithQuantity eventId={eventId} />
              </div>

              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-3">Other Actions:</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/event/${eventId}`)}
                    className="block w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    → View Full Event Page
                  </button>
                  <button
                    onClick={() => router.push("/my-tables")}
                    className="block w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    → View My Tables (after purchase)
                  </button>
                  <button
                    onClick={() => router.push(`/seller/events/${eventId}/tables`)}
                    className="block w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    → Seller Table Management
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}