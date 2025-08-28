"use client";

import { useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";

export default function TestSaveDatePage() {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (data: any) => {
    setResult(data);
    console.log("Event data:", data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Test Save the Date Feature</h1>
            <p className="text-blue-100">Testing single event with Save the Date option</p>
          </div>
          
          <div className="p-6">
            {!result ? (
              <SingleEventFlow
                onComplete={handleComplete}
                onCancel={() => console.log("Cancelled")}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Event Created Successfully!</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                <button 
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Another Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}