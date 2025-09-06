"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, MapPin, User, MessageCircle, AlertCircle } from "lucide-react";
import { formatEventDate } from "@/lib/date-utils";
import ClaimEventButton from "@/components/ClaimEventButton";
import TicketSelector from "@/components/TicketSelector";
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

  const handlePurchase = (quantity: number) => {
    // This will be replaced with actual purchase logic
    console.log(`Purchasing ${quantity} tickets`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Event Image */}
          <div className="space-y-6">
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-event.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>No image available</span>
                </div>
              )}
            </div>

            {/* Event Partners/Sponsors (if any) */}
            <div className="hidden lg:block border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-center gap-4 opacity-60">
                {/* Placeholder for partner logos */}
                <span className="text-xs text-gray-500 dark:text-gray-400">Powered by SteppersLife</span>
              </div>
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            {/* Event Title & Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {event.name}
              </h1>
              
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-gray-400" />
                  <span>{formatEventDate(event.eventDate)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{event.location}</span>
                  {event.address && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {" "}at {event.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Purchase Section */}
            {!isPastEvent && event.isTicketed && !isOrganizer && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                {availability?.isSoldOut ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium">This event is sold out</p>
                  </div>
                ) : (
                  <>
                    <TicketSelector
                      eventName={`${formatEventDate(event.eventDate).split(' at ')[0]}`}
                      date={`${formatEventDate(event.eventDate).split(' at ')[1] || ''}`}
                      price={event.price || 0}
                      maxQuantity={10}
                      onPurchase={handlePurchase}
                      disabled={false}
                    />
                    {/* Fallback to original purchase component */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <PurchaseTicketWithQuantity eventId={eventId} />
                    </div>
                  </>
                )}
              </div>
            )}

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

            {/* Organizer Actions */}
            {isOrganizer && (
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-cyan-900 dark:text-cyan-100">
                  Organizer Controls
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={() => router.push(`/events/${eventId}/scan`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Scan Tickets
                  </button>
                  <button
                    onClick={() => router.push(`/organizer/events/${eventId}`)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm col-span-2"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Door Price for Non-Ticketed Events */}
            {!event.isTicketed && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Door Price: ${event.doorPrice || event.price || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tickets available at the door
                </p>
              </div>
            )}

            {/* Event Status for Past Events */}
            {isPastEvent && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  This event has ended
                </p>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About the event
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Additional Event Details */}
            {(event.city || event.state) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Location Details
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {event.location}
                  {event.address && <><br />{event.address}</>}
                  {(event.city || event.state) && (
                    <>
                      <br />
                      {event.city}{event.city && event.state && ", "}{event.state}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Organizer Info */}
          <div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.organizerName || "Event Organizer"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Organizer
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                For exchanges, refunds, tax receipts, and any event-related requests, 
                please send a message to the organizer.
              </p>
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Send message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}