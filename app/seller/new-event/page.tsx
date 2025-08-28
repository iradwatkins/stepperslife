"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import MultiDayEventFlow from "@/components/events/MultiDayEventFlow";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/hooks/use-toast";
import { uploadBlobToConvex } from "@/lib/image-upload";

export default function NewEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);
  const createEvent = useMutation(api.events.create);
  const createSingleEventTickets = useMutation(api.ticketTypes.createSingleEventTickets);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent("/seller/new-event");
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [status, router]);

  const handleEventCreation = async (data: {
    event: any;
    ticketTypes: any[];
    tables: any[];
  }) => {
    try {
      const userId = session?.user?.id || session?.user?.email || "";
      
      // Handle image URL - for now we're using external URLs
      let imageStorageId = null;
      let imageUrl = data.event.mainImage || null;
      
      // Create the event
      const eventId = await createEvent({
        name: data.event.name,
        description: data.event.description,
        location: data.event.isSaveTheDate ? "" : data.event.location,
        address: data.event.isSaveTheDate ? "" : data.event.address,
        city: data.event.isSaveTheDate ? "" : data.event.city,
        state: data.event.isSaveTheDate ? "" : data.event.state,
        postalCode: data.event.isSaveTheDate ? "" : data.event.postalCode,
        eventDate: new Date(data.event.eventDate + " " + data.event.eventTime).getTime(),
        price: data.event.doorPrice || 0,
        totalTickets: data.ticketTypes.reduce((sum, t) => sum + t.quantity, 0),
        eventType: data.event.categories[0] || "other",
        eventCategories: data.event.categories,
        userId: userId,
        isTicketed: data.event.isTicketed,
        doorPrice: !data.event.isTicketed ? data.event.doorPrice : undefined,
        isSaveTheDate: data.event.isSaveTheDate || false,
        imageStorageId: imageStorageId,
        imageUrl: imageUrl,
      });

      // If ticketed, create ticket types
      if (data.event.isTicketed && data.ticketTypes.length > 0) {
        await createSingleEventTickets({
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
        });
      }

      toast({
        title: "Event Created Successfully!",
        description: data.event.isTicketed 
          ? "Your event and tickets have been configured." 
          : "Your event has been created.",
      });

      // Navigate to the event page
      router.push(`/event/${eventId}`);
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again.",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
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