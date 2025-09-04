"use client";

import { useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import { toast } from "@/hooks/use-toast";
import { publishEvent } from "@/app/actions/publishEvent";
import { useRouter } from "next/navigation";

export default function TestDirectEventPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleEventCreation = async (data: {
    event: any;
    ticketTypes: any[];
    tables: any[];
  }) => {
    try {
      setIsCreating(true);
      
      console.log("🔍 TEST PAGE - Event data received:", {
        eventName: data.event.name,
        isTicketed: data.event.isTicketed,
        ticketCount: data.ticketTypes?.length || 0,
        categories: data.event.categories,
        fullData: data
      });

      // Mock user for testing
      const testEventData = {
        ...data.event,
        userId: "test_user_direct", // Override with test user
      };

      console.log("📤 TEST PAGE - Calling publishEvent");
      
      // Call the server action directly
      const publishResult = await publishEvent({
        ...data,
        event: testEventData
      });

      console.log("📥 TEST PAGE - Result:", publishResult);
      setResult(publishResult);

      if (publishResult.success && publishResult.eventId) {
        toast({
          title: "✅ Event Created Successfully!",
          description: `Event ID: ${publishResult.eventId}. ${data.ticketTypes?.length || 0} ticket types created.`,
        });
        
        // Navigate to event page after 2 seconds
        setTimeout(() => {
          router.push(`/event/${publishResult.eventId}`);
        }, 2000);
      } else {
        throw new Error(publishResult.error || "Failed to publish");
      }
    } catch (error: Error | unknown) {
      console.error("❌ TEST PAGE - Error:", error);
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message,
      });
      setResult({ error: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800">⚠️ Test Mode</h2>
          <p className="text-yellow-700">
            This is a test page that bypasses authentication. Events will be created with test_user_direct as the owner.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">Test Direct Event Creation</h1>
            <p className="text-purple-100 mt-2">
              Testing event creation flow without authentication
            </p>
          </div>

          <div className="p-6">
            {!result ? (
              <SingleEventFlow
                onComplete={handleEventCreation}
                onCancel={() => {
                  console.log("Flow cancelled");
                  router.push("/");
                }}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Result:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                <button
                  onClick={() => {
                    setResult(null);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Another Event
                </button>
              </div>
            )}
          </div>
        </div>

        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Creating event...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}