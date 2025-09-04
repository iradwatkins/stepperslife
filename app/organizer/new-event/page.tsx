"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import MultiDayEventFlow from "@/components/events/MultiDayEventFlow";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import { toast } from "@/hooks/use-toast";
import { uploadBlobToConvex } from "@/lib/image-upload";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";
import { publishEvent } from "@/app/actions/publishEvent";

export default function NewEventPage() {
  const { user, isSignedIn } = useUser();
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
      console.log("📝 Starting event creation with data:", {
        eventName: data.event.name,
        isTicketed: data.event.isTicketed,
        ticketCount: data.ticketTypes?.length || 0,
        ticketTypes: data.ticketTypes,
        categories: data.event.categories,
        // Log all address fields to debug
        location: data.event.location,
        address: data.event.address,
        city: data.event.city,
        state: data.event.state,
        postalCode: data.event.postalCode
      });
      
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
      
      console.log("📤 Calling publishEvent server action");
      
      // Use server action to publish event
      const result = await publishEvent({
        ...data,
        event: eventData
      });

      console.log("📥 Server action result:", result);

      if (result.success && result.eventId) {
        toast({
          title: "Event Created Successfully!",
          description: data.event.isTicketed 
            ? `Your event and ${data.ticketTypes?.length || 0} ticket types have been configured.` 
            : "Your event has been created.",
        });

        console.log("✅ Navigating to event page:", `/event/${result.eventId}`);
        
        // If affiliate program is enabled, navigate to event management to allocate tickets
        if (data.event.hasAffiliateProgram) {
          router.push(`/organizer/events/${result.eventId}/affiliates?showAllocation=true`);
        } else {
          // Navigate to the event page
          router.push(`/event/${result.eventId}`);
        }
      } else {
        throw new Error(result.error || "Failed to publish event");
      }
    } catch (error: Error | unknown) {
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
                onComplete={async (data) => {
                  // Transform multi-day event data to single event format
                  const transformedData = {
                    event: {
                      // Basic info from multi-day event
                      name: data.event.name,
                      description: data.event.description,
                      categories: data.event.categories,
                      
                      // Use start date as eventDate, store end date separately
                      eventDate: data.event.startDate,
                      eventTime: data.days[0]?.startTime || "00:00",
                      endTime: data.days[data.days.length - 1]?.endTime,
                      
                      // Multi-day specific flags
                      isMultiDay: true,
                      endDate: data.event.endDate,
                      sameLocation: data.event.sameLocation,
                      
                      // Location (use event location if same for all days, or first day's location)
                      location: data.event.location || data.days[0]?.location || "",
                      address: data.event.address || data.days[0]?.address || "",
                      city: data.event.city || data.days[0]?.city || "",
                      state: data.event.state || data.days[0]?.state || "",
                      postalCode: data.event.postalCode || data.days[0]?.postalCode || "",
                      
                      // Images
                      mainImage: data.event.mainImage,
                      galleryImages: data.event.galleryImages,
                      
                      // Ticketing
                      isTicketed: data.event.isTicketed,
                      doorPrice: data.event.doorPrice,
                      
                      // Event mode
                      eventMode: "multi_day",
                      isSaveTheDate: false
                    },
                    // Flatten all day tickets into single array
                    ticketTypes: data.days.flatMap(day => 
                      day.ticketTypes.map(ticket => ({
                        ...ticket,
                        name: `${ticket.name} - ${day.dayLabel}`,
                        dayId: day.id,
                        dayNumber: day.dayNumber
                      }))
                    ),
                    tables: data.tables || []
                  };
                  
                  console.log("📅 Multi-day event transformed:", {
                    originalDays: data.days.length,
                    totalTickets: transformedData.ticketTypes.length,
                    startDate: data.event.startDate,
                    endDate: data.event.endDate
                  });
                  
                  // Use the same handleEventCreation function that works for single events
                  await handleEventCreation(transformedData);
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
