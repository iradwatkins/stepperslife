"use client";

import { useState } from "react";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import MultiDayEventFlow from "@/components/events/MultiDayEventFlow";
import { toast } from "@/hooks/use-toast";

export default function TestEventCreationPage() {
  const [eventType, setEventType] = useState<"single" | "multi_day" | null>(null);
  
  const handleSingleEventComplete = (data: any) => {
    console.log("Single Event Data:", data);
    toast({
      title: "Single Event Test Complete",
      description: `Event: ${data.event.name}, Tickets: ${data.ticketTypes.length}`,
    });
  };

  const handleMultiDayEventComplete = (data: any) => {
    console.log("Multi-Day Event Data:", data);
    toast({
      title: "Multi-Day Event Test Complete",
      description: `Event: ${data.event.name}, Days: ${data.days.length}, Bundles: ${data.bundles.length}`,
    });
  };

  if (!eventType) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Event Creation Test Page</h1>
          <p className="text-gray-600 mb-6">Testing all event creation flows without authentication</p>
          <EventTypeSelector onSelect={setEventType} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setEventType(null)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Event Type Selection
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
            <h2 className="text-xl font-bold">
              Testing: {eventType === "single" && "Single Event"}
              {eventType === "multi_day" && "Multi-Day Event"}
            </h2>
          </div>

          <div className="p-6">
            {eventType === "single" && (
              <SingleEventFlow
                onComplete={handleSingleEventComplete}
                onCancel={() => setEventType(null)}
              />
            )}
            
            {eventType === "multi_day" && (
              <MultiDayEventFlow
                onComplete={handleMultiDayEventComplete}
                onCancel={() => setEventType(null)}
              />
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}