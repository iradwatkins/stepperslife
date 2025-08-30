"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventTypeSelector from "@/components/events/EventTypeSelector";
import SingleEventFlow from "@/components/events/SingleEventFlow";
import { ArrowLeft } from "lucide-react";

export default function CreateNewEventPage() {
  const router = useRouter();
  const { user } = useUser();
  const [eventType, setEventType] = useState<"single" | "multi_day" | "save_the_date" | null>(null);
  
  // Convex mutations
  const createEvent = useMutation(api.events.create);
  const createTicketTypes = useMutation(api.ticketTypes.createTicketTypes);
  const createTableConfig = useMutation(api.tables.createTableConfig);
  
  const handleSingleEventComplete = async (data: any) => {
    if (!user?.id) {
      alert("Please sign in to create an event");
      return;
    }
    
    try {
      // Combine date and time
      const eventDateTime = new Date(`${data.event.eventDate}T${data.event.eventTime}`);
      
      // Create the event
      const eventId = await createEvent({
        name: data.event.name,
        description: data.event.description,
        location: data.event.location,
        eventDate: eventDateTime.getTime(),
        price: 0, // Will be replaced by ticket types
        totalTickets: data.event.totalCapacity || 0,
        userId: user.id,
        isTicketed: data.event.isTicketed,
        doorPrice: data.event.doorPrice,
        eventType: data.event.categories[0] || "other",
        // New fields
        totalCapacity: data.event.totalCapacity,
        eventMode: "single",
        // Location details
        address: data.event.address,
        city: data.event.city,
        state: data.event.state,
        postalCode: data.event.postalCode,
      });
      
      // Create ticket types if ticketed event
      if (data.event.isTicketed && data.ticketTypes.length > 0) {
        const ticketTypesData = data.ticketTypes.map((ticket: any) => ({
          name: ticket.name,
          category: ticket.name.toLowerCase().includes("vip") ? "vip" : "general",
          allocatedQuantity: ticket.quantity,
          price: ticket.price,
          hasEarlyBird: ticket.hasEarlyBird,
          earlyBirdPrice: ticket.earlyBirdPrice,
          earlyBirdEndDate: ticket.earlyBirdEndDate 
            ? new Date(ticket.earlyBirdEndDate).getTime() 
            : undefined,
        }));
        
        const ticketTypeIds = await createTicketTypes({
          eventId,
          ticketTypes: ticketTypesData,
        });
        
        // Create table configurations if any
        if (data.tables.length > 0) {
          for (const table of data.tables) {
            const ticketTypeIndex = data.ticketTypes.findIndex(
              (t: any) => t.id === table.sourceTicketTypeId
            );
            const ticketTypeId = ticketTypeIds[ticketTypeIndex];
            
            await createTableConfig({
              eventId,
              name: table.name,
              seatCount: table.seatCount,
              price: table.price,
              description: table.description,
              sourceTicketTypeId: ticketTypeId,
              sourceTicketType: table.sourceTicketTypeName,
              maxTables: 10, // Default max tables
            });
          }
        }
      }
      
      // Redirect to event management page
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };
  
  const handleMultiDayComplete = async (data: any) => {
    // TODO: Implement multi-day event creation
    alert("Multi-day event creation coming soon!");
  };
  
  const handleSaveTheDateComplete = async (data: any) => {
    // TODO: Implement save the date creation
    alert("Save the Date event creation coming soon!");
  };
  
  const handleBack = () => {
    setEventType(null);
  };
  
  const handleCancel = () => {
    router.push("/events");
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to create events</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {eventType && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to event type selection
          </button>
        </div>
      )}
      
      {!eventType ? (
        <EventTypeSelector onSelect={setEventType} />
      ) : eventType === "single" ? (
        <SingleEventFlow 
          onComplete={handleSingleEventComplete}
          onCancel={handleCancel}
        />
      ) : eventType === "multi_day" ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Multi-Day Events</h2>
            <p className="text-gray-600 mb-6">
              Multi-day event creation with bundle support is coming soon!
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Save the Date</h2>
            <p className="text-gray-600 mb-6">
              Save the Date event creation is coming soon!
            </p>
            <button
              onClick={handleBack}
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