"use client";

import { useState } from "react";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import SingleEventFlow from "@/components/events/SingleEventFlow";

export default function TestTicketUIPage() {
  const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSingleEventComplete = (data: any) => {
    console.log("Event creation complete:", data);
    setResult(data);
  };

  const handleCancel = () => {
    setEventType(null);
    setResult(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Test Complete!</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Event Details:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result.event, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Ticket Types:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result.ticketTypes, null, 2)}
                </pre>
              </div>
              
              {result.tables.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Table Configurations:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(result.tables, null, 2)}
                  </pre>
                </div>
              )}
              
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Test Another Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {!eventType ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">🧪 Ticket System UI Test</h1>
            <p className="text-gray-600">Test the complete ticket creation flow</p>
          </div>
          <EventTypeSelector onSelect={setEventType} />
        </div>
      ) : eventType === "single" ? (
        <SingleEventFlow 
          onComplete={handleSingleEventComplete}
          onCancel={handleCancel}
        />
      ) : (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {eventType === "multi_day" ? "Multi-Day Events" : "Save the Date"}
            </h2>
            <p className="text-gray-600 mb-6">
              This feature is coming soon!
            </p>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}