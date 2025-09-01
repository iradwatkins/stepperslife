"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import MultiDayEventFlow from "@/components/events/MultiDayEventFlow";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import { toast } from "@/hooks/use-toast";
import { uploadBlobToConvex } from "@/lib/image-upload";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";
import { publishEvent } from "@/app/actions/publishEvent";

export default function NewEventPage() {
  const { user, isSignedIn } = useAuth();
  const router = useRouter();
  const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);
  
  useEffect(() => {
    if (!isSignedIn) {
      const callbackUrl = encodeURIComponent("/organizer/new-event");
      router.push(`/sign-in?redirect_url=${callbackUrl}`);
    }
  }, [isSignedIn, router]);

  const handleEventCreation = async (data: {
    event: any;
    ticketTypes: any[];
    tables: any[];
  }) => {
    try {
      // Show initial toast
      toast({
        title: "Publishing Event...",
        description: "Please wait while we set up your event.",
      });
      
      // Ensure images are handled properly (they're optional)
      const eventData = {
        ...data.event,
        // Ensure mainImage is passed correctly
        mainImage: data.event.mainImage || undefined,
        // Ensure gallery images are passed correctly
        galleryImages: data.event.galleryImages || [],
      };
      
      // Use server action to publish event
      const result = await publishEvent({
        ...data,
        event: eventData
      });

      if (result.success && result.eventId) {
        toast({
          title: "Event Created Successfully!",
          description: data.event.isTicketed 
            ? "Your event and tickets have been configured." 
            : "Your event has been created.",
        });

        // Navigate to the event page
        router.push(`/event/${result.eventId}`);
      } else {
        throw new Error(result.error || "Failed to publish event");
      }
    } catch (error: any) {
      console.error("Failed to create event:", error);
      
      // Determine the error message
      let errorMessage = error.message || "Failed to create event. Please try again.";
      
      // Check for specific error types
      if (error.message?.includes('auth') || error.message?.includes('signed in')) {
        errorMessage = "You must be signed in to create an event.";
      } else if (error.message?.includes('image')) {
        errorMessage = "Image upload failed, but you can still create the event without images.";
      }
      
      toast({
        variant: "destructive",
        title: "Failed to Publish Event",
        description: errorMessage,
        action: (
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white text-red-600 rounded hover:bg-gray-100"
          >
            Refresh Page
          </button>
        ),
      });
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show event type selector first
  if (!eventType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EventTypeSelector onSelect={setEventType} />
      </div>
    );
  }

  // Render appropriate flow based on event type
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <h2 className="text-2xl font-bold">Create New Event</h2>
            <p className="text-blue-100 mt-2">
              {eventType === "single" && "Create a single-day event"}
              {eventType === "multi_day" && "Create a multi-day event"}
              {eventType === "save_the_date" && "Announce an upcoming event"}
            </p>
          </div>

          <div className="p-6">
            {eventType === "single" && (
              <SingleEventFlow
                onComplete={handleEventCreation}
                onCancel={() => setEventType(null)}
              />
            )}
            {eventType === "save_the_date" && (
              <SingleEventFlow
                onComplete={handleEventCreation}
                onCancel={() => setEventType(null)}
                isSaveTheDate={true}
              />
            )}
            {eventType === "multi_day" && (
              <MultiDayEventFlow
                onComplete={(data) => {
                  // TODO: Implement multi-day event creation
                  console.log("Multi-day event data:", data);
                  toast({
                    title: "Multi-day Event Created!",
                    description: `${data.event.name} has been created with ${data.days.length} days.`,
                  });
                  // For now, redirect to events list
                  router.push("/seller/events");
                }}
                onCancel={() => setEventType(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
