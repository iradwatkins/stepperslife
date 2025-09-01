"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users, DollarSign, TestTube, ArrowRight } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import CompletePurchaseFlow from "@/components/CompletePurchaseFlow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function EventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('testMode') === 'true';
  const referralCode = searchParams.get('ref');
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  
  // Store referral code in sessionStorage if present
  if (typeof window !== 'undefined' && referralCode) {
    sessionStorage.setItem(`referral_${params.id}`, referralCode);
    console.log('Affiliate referral code stored:', referralCode);
  }
  
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
  
  // Use MinIO imageUrl directly (no more Convex storage!)
  const imageUrl = event?.imageUrl || "/placeholder-event.jpg";

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
                  
                  {/* Test Mode Indicator */}
                  {isTestMode && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-orange-800">Test Mode Active</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-1">
                        You can test the purchase flow with cash/test payment
                      </p>
                    </div>
                  )}
                  
                  {/* Purchase Button or Flow */}
                  {!showPurchaseFlow ? (
                    <div className="space-y-4">
                      {/* Ticket availability summary */}
                      {ticketTypes && ticketTypes.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-sm text-gray-700 mb-2">Available Tickets:</h3>
                          <div className="space-y-1">
                            {ticketTypes.slice(0, 3).map((ticket: any) => (
                              <div key={ticket._id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{ticket.name}</span>
                                <span className="font-medium">${ticket.price.toFixed(2)}</span>
                              </div>
                            ))}
                            {ticketTypes.length > 3 && (
                              <p className="text-xs text-gray-500 mt-1">+{ticketTypes.length - 3} more options</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => setShowPurchaseFlow(true)}
                        className="w-full"
                        size="lg"
                      >
                        {isTestMode ? (
                          <>
                            <TestTube className="w-5 h-5 mr-2" />
                            Test Purchase Flow
                          </>
                        ) : (
                          <>
                            <Ticket className="w-5 h-5 mr-2" />
                            Purchase Tickets
                          </>
                        )}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          onClick={() => setShowPurchaseFlow(false)}
                          size="sm"
                        >
                          ← Back to Event Details
                        </Button>
                      </div>
                      <CompletePurchaseFlow
                        eventId={params.id as Id<"events">}
                        enableTestMode={isTestMode}
                        onComplete={() => {
                          alert(isTestMode ? "Test purchase completed!" : "Purchase completed!");
                          setShowPurchaseFlow(false);
                        }}
                        onCancel={() => setShowPurchaseFlow(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
