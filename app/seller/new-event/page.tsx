"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/hooks/use-toast";

export default function NewEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const createEvent = useMutation(api.events.create);
  const createSingleEventTickets = useMutation(api.ticketTypes.createSingleEventTickets);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleEventCreation = async (data: {
    event: any;
    ticketTypes: any[];
    tables: any[];
  }) => {
    try {
      const userId = session?.user?.id || session?.user?.email || "";
      
      // Create the event
      const eventId = await createEvent({
        name: data.event.name,
        description: data.event.description,
        location: data.event.location,
        address: data.event.address,
        city: data.event.city,
        state: data.event.state,
        postalCode: data.event.postalCode,
        eventDate: new Date(data.event.eventDate + " " + data.event.eventTime).getTime(),
        price: data.event.doorPrice || 0,
        totalTickets: data.ticketTypes.reduce((sum, t) => sum + t.quantity, 0),
        eventType: data.event.categories[0] || "other",
        eventCategories: data.event.categories,
        userId: userId,
        isTicketed: data.event.isTicketed,
        doorPrice: !data.event.isTicketed ? data.event.doorPrice : undefined,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <h2 className="text-2xl font-bold">Create New Event</h2>
            <p className="text-blue-100 mt-2">
              List your event and start selling tickets
            </p>
          </div>

          <div className="p-6">
            <SingleEventFlow
              onComplete={handleEventCreation}
              onCancel={() => router.push("/seller/events")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}