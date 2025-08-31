"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import MultiDayEventFlow from "@/components/events/MultiDayEventFlow";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/hooks/use-toast";
import { uploadBlobToConvex } from "@/lib/image-upload";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";

export default function NewEventPage() {
  const { user, isSignedIn } = useAuth();
  const router = useRouter();
  const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);
  const createEvent = useMutation(api.events.create);
  const createSingleEventTickets = useMutation(api.ticketTypes.createSingleEventTickets);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  useEffect(() => {
    if (!isSignedIn) {
      const callbackUrl = encodeURIComponent("/seller/new-event");
      router.push(`/sign-in?redirect_url=${callbackUrl}`);
    }
  }, [isSignedIn, router]);

  const handleEventCreation = async (data: {
    event: any;
    ticketTypes: any[];
    tables: any[];
  }) => {
    try {
      const userId = user?.id || user?.emailAddresses[0]?.emailAddress || "";
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to create an event.",
        });
        return;
      }
      
      // Prepare event data
      const eventData = {
        ...data.event,
        userId,
        eventDate: new Date(data.event.eventDate + " " + data.event.eventTime).getTime(),
        totalTickets: data.ticketTypes.reduce((sum, t) => sum + t.quantity, 0)
      };
      
      // Validate event data
      const validation = validateEventData(eventData);
      if (!validation.isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validation.errors.join(", "),
        });
        return;
      }
      
      // Prepare data for Convex
      const convexData = prepareEventDataForConvex(eventData);
      
      console.log("Sending to Convex:", convexData);
      
      // Show initial toast
      toast({
        title: "Publishing Event...",
        description: "Please wait while we set up your event.",
      });
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Publishing timeout")), 30000);
      });
      
      // Create the event with timeout
      const eventId = await Promise.race([
        createEvent(convexData),
        timeoutPromise
      ]) as string;

      // If ticketed, create ticket types
      if (data.event.isTicketed && data.ticketTypes.length > 0) {
        await Promise.race([
          createSingleEventTickets({
            eventId,
            ticketTypes: data.ticketTypes.map(ticket => ({
              name: ticket.name,
              category: "general",
              allocatedQuantity: ticket.quantity,
              price: ticket.price,
              hasEarlyBird: ticket.hasEarlyBird,
              earlyBirdPrice: ticket.earlyBirdPrice,
              earlyBirdEndDate: ticket.earlyBirdEndDate,
            })),
          }),
          timeoutPromise
        ]);
      }

      toast({
        title: "Event Created Successfully!",
        description: data.event.isTicketed 
          ? "Your event and tickets have been configured." 
          : "Your event has been created.",
      });

      // Navigate to the event page
      router.push(`/event/${eventId}`);
    } catch (error: any) {
      console.error("Failed to create event:", error);
      
      // Determine the error message
      let errorMessage = "Failed to create event. Please try again.";
      
      if (error.message === "Publishing timeout") {
        errorMessage = "Publishing is taking too long. Please check your connection and try again.";
      } else if (error.message?.includes("Network request failed")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message?.includes("Convex")) {
        errorMessage = "Database connection failed. Please refresh and try again.";
      } else if (error.message?.includes("validation")) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
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
