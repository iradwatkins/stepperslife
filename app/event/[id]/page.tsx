"use client";

import EventCard from "@/components/EventCard";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { useParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import JoinQueue from "@/components/JoinQueue";
import PurchaseTicketWithQuantity from "@/components/PurchaseTicketWithQuantity";
import { useUser } from "@clerk/nextjs";
import { useStorageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventPage() {
  const { user } = useUser();
  const params = useParams();
  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });
  
  // Get price range for ticketed events
  const priceRange = useQuery(api.events.getEventPriceRange, {
    eventId: params.id as Id<"events">,
  });
  
  // Check for multi-day event
  const eventDays = useQuery(api.multiDayEvents.getEventDays, {
    eventId: params.id as Id<"events">,
  });
  const bundles = useQuery(api.multiDayEvents.getBundles, {
    eventId: params.id as Id<"events">,
  });
  const ticketTypes = useQuery(api.ticketTypes.getEventTicketTypes, {
    eventId: params.id as Id<"events">,
  });
  
  const isMultiDay = eventDays && eventDays.length > 0;
  
  // Use local imageUrl if available, fallback to Convex storage for legacy events
  const convexImageUrl = useStorageUrl(event?.imageStorageId);
  const imageUrl = event?.imageUrl || convexImageUrl;

  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {imageUrl && (
            <div className="aspect-[21/9] relative w-full">
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Event Details */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {event.name}
                  </h1>
                  <p className="text-lg text-gray-600">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        {isMultiDay ? "Date Range" : "Date"}
                      </span>
                    </div>
                    <p className="text-gray-900">
                      {isMultiDay && event.endDate ? (
                        <>
                          {new Date(event.eventDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          <span className="block text-sm text-gray-600 mt-1">
                            {eventDays?.length} days
                          </span>
                        </>
                      ) : (
                        new Date(event.eventDate).toLocaleDateString()
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-gray-900">{event.location}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Price</span>
                    </div>
                    {event.isTicketed && priceRange ? (
                      <div className="text-gray-900">
                        {priceRange.minPrice === priceRange.maxPrice ? (
                          <p>${priceRange.minPrice.toFixed(2)}</p>
                        ) : (
                          <>
                            <p>${priceRange.minPrice.toFixed(2)} - ${priceRange.maxPrice.toFixed(2)}</p>
                            {priceRange.ticketCount && (
                              <span className="text-xs text-gray-600">{priceRange.ticketCount} ticket types</span>
                            )}
                          </>
                        )}
                        {priceRange.hasEarlyBird && priceRange.earlyBirdPrice && (
                          <p className="text-sm text-green-600 mt-1">
                            Early Bird: ${priceRange.earlyBirdPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {event.doorPrice ? (
                          <>Door: ${event.doorPrice.toFixed(2)}</>
                        ) : (
                          event.price ? `$${event.price.toFixed(2)}` : "Free"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Availability</span>
                    </div>
                    {event.isTicketed && ticketTypes && ticketTypes.length > 0 ? (
                      <div className="space-y-1">
                        {ticketTypes.map((ticket: any, index: number) => (
                          <div key={ticket._id || index} className="text-sm">
                            <span className="font-medium text-gray-700">{ticket.name}:</span>
                            <span className="text-gray-900 ml-1">
                              {ticket.availableQuantity}/{ticket.allocatedQuantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {availability.totalTickets - availability.purchasedCount}{" "}
                        / {availability.totalTickets} left
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticket Types Section for Ticketed Events */}
                {event.isTicketed && ticketTypes && ticketTypes.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ticket Types
                    </h3>
                    <div className="space-y-3">
                      {ticketTypes.map((ticket: any) => (
                        <div key={ticket._id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.name}</p>
                            <p className="text-sm text-gray-600">
                              {ticket.availableQuantity} of {ticket.allocatedQuantity} available
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${ticket.price.toFixed(2)}</p>
                            {ticket.hasEarlyBird && ticket.earlyBirdPrice && (
                              <p className="text-xs text-green-600">Early: ${ticket.earlyBirdPrice.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Event Information */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Event Information
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Please arrive 30 minutes before the event starts</li>
                    <li>• Tickets are non-refundable</li>
                    <li>• Age restriction: 18+</li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Ticket Purchase Card */}
              <div>
                <div className="sticky top-8 space-y-4">
                  <h2 className="text-2xl font-bold">
                    {isMultiDay ? "Select Tickets" : "Purchase Tickets"}
                  </h2>
                  
                  {/* Show multi-day info if applicable */}
                  {isMultiDay && bundles && bundles.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium">
                        Multi-Day Event Packages Available!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Save by purchasing bundle packages for multiple days
                      </p>
                    </div>
                  )}
                  
                  {/* New Purchase Component with Quantity and Table Options */}
                  <PurchaseTicketWithQuantity 
                    eventId={params.id as Id<"events">}
                    isMultiDay={isMultiDay || false}
                    eventDays={eventDays || undefined}
                    bundles={bundles || undefined}
                    ticketTypes={ticketTypes || undefined}
                  />
                  
                  {/* Keep the original EventCard for additional info */}
                  <div className="mt-6">
                    <EventCard eventId={params.id as Id<"events">} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
