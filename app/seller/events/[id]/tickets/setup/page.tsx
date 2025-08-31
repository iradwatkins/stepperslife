"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import UnifiedTicketSetup from "@/components/events/UnifiedTicketSetup";
import Spinner from "@/components/Spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TicketSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  
  const eventId = params.id as Id<"events">;
  
  // Fetch event details
  const event = useQuery(api.events.getById, { eventId });
  
  // Check if it's a multi-day event
  const eventDays = useQuery(api.multiDayEvents.getEventDays, { eventId });
  
  // Check for existing ticket types
  const existingTicketTypes = useQuery(api.ticketTypes.getEventTicketTypes, { eventId });
  
  // Loading state
  if (!event || eventDays === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  // Authorization check
  if (event.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
          <p className="text-gray-600 mb-4">You don't have permission to configure tickets for this event.</p>
          <Link href="/dashboard/events" className="text-blue-600 hover:underline">
            Return to your events
          </Link>
        </div>
      </div>
    );
  }
  
  const isMultiDay = eventDays && eventDays.length > 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configure Tickets
            </h1>
            <div className="text-gray-600">
              <p className="text-lg font-semibold">{event.name}</p>
              <p className="text-sm">
                {isMultiDay ? (
                  <>
                    Multi-day event • {eventDays.length} days • 
                    {new Date(event.eventDate).toLocaleDateString()} - 
                    {event.endDate && new Date(event.endDate).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    Single event • {new Date(event.eventDate).toLocaleDateString()}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Ticket Setup Component */}
        <UnifiedTicketSetup
          event={event}
          eventDays={eventDays}
          isMultiDay={isMultiDay}
          existingTicketTypes={existingTicketTypes}
        />
      </div>
    </div>
  );
}