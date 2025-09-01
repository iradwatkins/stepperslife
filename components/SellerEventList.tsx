"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Edit,
  Ticket,
  Ban,
  Banknote,
  InfoIcon,
  Users,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import CancelEventButton from "./CancelEventButton";
import DeleteEventButton from "./DeleteEventButton";
import { Doc } from "@/convex/_generated/dataModel";
import { Metrics } from "@/convex/events";

export default function SellerEventList() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  
  // Enhanced debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const debugMode = localStorage.getItem('debug_events') === 'true';
      setShowDebug(debugMode);
    }
    
    console.log("🔍 SellerEventList Render:", {
      timestamp: new Date().toISOString(),
      isLoaded,
      isSignedIn,
      userId: user?.id,
      userIdType: typeof user?.id,
      userIdLength: user?.id?.length,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      retryCount
    });
  }, [user, isLoaded, isSignedIn, retryCount]);
  
  // Query with retry logic
  const queryArgs = isLoaded && isSignedIn && user?.id 
    ? { userId: user.id } 
    : "skip";
    
  const events = useQuery(api.events.getSellerEvents, queryArgs);
  
  // Log query results
  useEffect(() => {
    if (events !== undefined) {
      console.log("📊 Query Results:", {
        eventsCount: events?.length || 0,
        events: events?.map(e => ({ id: e._id, name: e.name, userId: e.userId })),
        queryUserId: user?.id
      });
    }
  }, [events, user?.id]);
  
  // Manual refresh function
  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    console.log("🔄 Manual refresh triggered");
  };

  // Show loading state while user is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show message if not signed in
  if (!isSignedIn || !user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your events</p>
      </div>
    );
  }

  // Show loading state while events are loading
  if (events === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const upcomingEvents = events.filter((e) => e.eventDate > Date.now());
  const pastEvents = events.filter((e) => e.eventDate <= Date.now());

  return (
    <div className="mx-auto space-y-8">
      {/* Debug Info Bar */}
      {showDebug && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <div className="font-semibold text-yellow-800 mb-2">Debug Info:</div>
          <div className="text-yellow-700 space-y-1">
            <div>User ID: {user?.id || 'Not loaded'}</div>
            <div>Email: {user?.emailAddresses?.[0]?.emailAddress || 'Not loaded'}</div>
            <div>Total Events: {events?.length || 0}</div>
            <div>Query Status: {events === undefined ? 'Loading...' : 'Loaded'}</div>
          </div>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          My Events
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Upcoming Events */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Upcoming Events
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {upcomingEvents.map((event) => (
            <SellerEventCard key={event._id} event={event} />
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-gray-500">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 gap-6">
            {pastEvents.map((event) => (
              <SellerEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SellerEventCard({
  event,
}: {
  event: Doc<"events"> & {
    metrics: Metrics;
  };
}) {
  // Use MinIO imageUrl directly
  const imageUrl = event.imageUrl || "/placeholder-event.jpg";
  const isPastEvent = event.eventDate < Date.now();

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${event.is_cancelled ? "border-red-200" : "border-gray-200"} overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Event Image */}
          {imageUrl && (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden shrink-0">
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {event.name}
                </h3>
                <p className="mt-1 text-gray-500">{event.description}</p>
                {event.is_cancelled && (
                  <div className="mt-2 flex items-center gap-2 text-red-600">
                    <Ban className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Event Cancelled & Refunded
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!event.is_cancelled && (
                  <>
                    {!isPastEvent && (
                      <>
                        <Link
                          href={`/seller/events/${event._id}/edit`}
                          className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        <Link
                          href={`/seller/events/${event._id}/affiliates`}
                          className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Affiliates
                        </Link>
                        <CancelEventButton eventId={event._id} />
                      </>
                    )}
                    <DeleteEventButton 
                      eventId={event._id} 
                      eventName={event.name}
                      hasTickets={(event.metrics?.soldTickets || event.purchasedCount || 0) > 0}
                      isPastEvent={isPastEvent}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Ticket className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {event.is_cancelled ? "Tickets Refunded" : "Tickets Sold"}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {event.is_cancelled ? (
                    <>
                      {event.metrics?.refundedTickets || 0}
                      <span className="text-sm text-gray-500 font-normal">
                        {" "}
                        refunded
                      </span>
                    </>
                  ) : (
                    <>
                      {event.metrics?.soldTickets || event.purchasedCount || 0}
                      <span className="text-sm text-gray-500 font-normal">
                        /{event.totalTickets || "∞"}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Banknote className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {event.is_cancelled ? "Amount Refunded" : "Revenue"}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  $
                  {event.is_cancelled
                    ? (event.metrics?.refundedTickets || 0) * (event.price || 0)
                    : (event.metrics?.revenue || (event.purchasedCount || 0) * (event.price || 0))}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <InfoIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {event.is_cancelled
                    ? "Cancelled"
                    : isPastEvent
                      ? "Ended"
                      : "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
