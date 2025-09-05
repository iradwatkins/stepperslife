"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, MapPin, Users, DollarSign, AlertCircle } from "lucide-react";
import { formatEventDate } from "@/lib/date-utils";
import ClaimEventButton from "@/components/ClaimEventButton";
import PurchaseTicketWithQuantity from "@/components/PurchaseTicketWithQuantity";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const eventId = params.eventId as Id<"events">;

  const event = useQuery(api.events.getById, { eventId });
  const claimStatus = useQuery(api.adminEvents.getClaimStatus, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading event details...</div>
      </div>
    );
  }

  const isPastEvent = event.eventDate < Date.now();
  const isOrganizer = isLoaded && user && event.userId === user.id;
  const canClaim = claimStatus?.claimable && !claimStatus?.claimedBy && !isOrganizer;
  const isAdminPosted = claimStatus?.postedByAdmin;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Posted Banner */}
        {isAdminPosted && !claimStatus?.claimedBy && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Admin Posted Event
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  This event was posted by an administrator. If you are the organizer, you can claim ownership.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Event Header Image */}
          {event.imageUrl && (
            <div className="h-64 md:h-96 relative">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {formatEventDate(event.eventDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Event Details Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">About This Event</h2>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>

                {/* Event Info Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Users className="w-4 h-4" />
                      Capacity
                    </div>
                    <div className="text-lg font-semibold">
                      {event.totalTickets} spots
                    </div>
                    {availability && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {availability.remainingTickets} remaining
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Price
                    </div>
                    <div className="text-lg font-semibold">
                      {event.isTicketed ? (
                        <>From ${event.price}</>
                      ) : (
                        <>${event.doorPrice || event.price} at door</>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                {(event.address || event.city || event.state) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <div className="text-gray-600 dark:text-gray-300">
                      <p>{event.location}</p>
                      {event.address && <p>{event.address}</p>}
                      {(event.city || event.state) && (
                        <p>
                          {event.city}{event.city && event.state && ", "}{event.state}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-4">
                {/* Claim Button for Organizers */}
                {canClaim && isLoaded && user && (
                  <ClaimEventButton
                    eventId={eventId}
                    eventName={event.name}
                    claimToken={event.claimToken || ""}
                    userId={user.id}
                    userEmail={user.primaryEmailAddress?.emailAddress || ""}
                  />
                )}

                {/* Purchase Section */}
                {!isPastEvent && event.isTicketed && !isOrganizer && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Get Tickets</h3>
                    {availability?.isSoldOut ? (
                      <div className="text-center py-4 text-gray-500">
                        This event is sold out
                      </div>
                    ) : (
                      <PurchaseTicketWithQuantity eventId={eventId} />
                    )}
                  </div>
                )}

                {/* Organizer Actions */}
                {isOrganizer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                      Organizer Controls
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Event
                      </button>
                      <button
                        onClick={() => router.push(`/events/${eventId}/scan`)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Scan Tickets
                      </button>
                      <button
                        onClick={() => router.push(`/organizer/events/${eventId}`)}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View Dashboard
                      </button>
                    </div>
                  </div>
                )}

                {/* Event Status */}
                {isPastEvent && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      This event has already taken place
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}