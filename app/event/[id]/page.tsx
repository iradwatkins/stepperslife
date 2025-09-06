"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, User, MessageCircle, AlertCircle, Minus, Plus } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatEventDateTime, getTimezoneFromState } from "@/lib/timezone-utils";
import { ensureLocalDate } from "@/lib/date-utils";
import { format } from "date-fns";

interface TicketQuantity {
  ticketId: string;
  quantity: number;
  price: number;
  name: string;
}

export default function EventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const isTestMode = searchParams.get('testMode') === 'true';
  const referralCode = searchParams.get('ref');
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, TicketQuantity>>({});
  
  // Store referral code in sessionStorage if present
  if (typeof window !== 'undefined' && referralCode) {
    sessionStorage.setItem(`referral_${params.id}`, referralCode);
  }
  
  // Use getEventForPreview to handle both published events and owner previews
  const event = useQuery(api.events.getEventForPreview, {
    eventId: params.id as Id<"events">,
    userId: user?.id,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });
  
  // Get price range for ticketed events
  const priceRange = useQuery(api.events.getEventPriceRange, {
    eventId: params.id as Id<"events">,
  });
  
  const ticketTypes = useQuery(api.ticketTypes.getEventTicketTypes, {
    eventId: params.id as Id<"events">,
  });
  
  const imageUrl = event?.imageUrl || "/placeholder-event.jpg";

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600">This event may not exist or is not available for viewing.</p>
          <Link href="/events">
            <Button className="mt-4">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  // Check if this is a draft event being viewed by the owner
  const isDraft = event.status === 'draft' || event.status === 'payment_pending';
  const isOwner = user?.id === event.userId;

  // Handle quantity changes for tickets
  const updateQuantity = (ticketId: string, delta: number, ticket: any) => {
    setTicketQuantities(prev => {
      const current = prev[ticketId] || { 
        ticketId, 
        quantity: 0, 
        price: ticket.price,
        name: ticket.name 
      };
      const newQuantity = Math.max(0, Math.min(10, current.quantity + delta));
      
      if (newQuantity === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [ticketId]: { ...current, quantity: newQuantity }
      };
    });
  };

  // Calculate total price
  const totalPrice = Object.values(ticketQuantities).reduce(
    (sum, item) => sum + (item.quantity * item.price), 
    0
  );

  const totalTickets = Object.values(ticketQuantities).reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  const handlePurchase = () => {
    if (totalTickets === 0) return;
    
    // TODO: Implement actual purchase flow
    console.log('Purchasing tickets:', ticketQuantities);
    alert(`Purchasing ${totalTickets} ticket(s) for $${totalPrice.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Draft Event Notification Banner */}
      {isDraft && isOwner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-amber-900 font-semibold">
                    This event is in DRAFT mode and not visible to the public
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    {event.isTicketed 
                      ? "Complete payment setup to publish this event and start selling tickets" 
                      : "This is a preview of how your event will appear when published"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid - Image Left, Details Right */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Left Column - Event Image (2/5 width) */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                <img
                  src={imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-event.jpg";
                  }}
                />
              </div>
              
              {/* Event Partners/Sponsors */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>Powered by SteppersLife</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Event Details and Tickets (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {event.name}
              </h1>
              
              {/* Date and Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <CalendarDays className="w-5 h-5 text-gray-400" />
                  <span className="text-lg">
                    {event.eventDateUTC && event.eventTimezone
                      ? formatEventDateTime(event.eventDateUTC, event.eventTimezone, 'EEEE, MMMM d, yyyy h:mm a')
                      : ensureLocalDate(event.eventDate) 
                        ? format(ensureLocalDate(event.eventDate)!, "EEEE, MMMM d, yyyy h:mm a") 
                        : "Date TBD"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-lg">
                    {event.location}
                    {event.address && ` at ${event.address}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Selection Section */}
            {event.isTicketed && ticketTypes && ticketTypes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="space-y-4">
                  {ticketTypes.map((ticket: any) => {
                    const currentQuantity = ticketQuantities[ticket._id]?.quantity || 0;
                    const isAvailable = ticket.availableQuantity > 0;
                    
                    return (
                      <div key={ticket._id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 uppercase text-sm">
                              {ticket.name}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              RD${ticket.price.toFixed(0)}
                            </p>
                            {ticket.hasEarlyBird && ticket.earlyBirdPrice && (
                              <p className="text-green-600 text-xs mt-1">
                                Early Bird: RD${ticket.earlyBirdPrice.toFixed(0)}
                              </p>
                            )}
                            {!isAvailable && (
                              <p className="text-red-600 text-xs mt-1">Sold Out</p>
                            )}
                          </div>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(ticket._id, -1, ticket)}
                              disabled={currentQuantity === 0 || !isAvailable}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="w-8 text-center font-medium text-gray-900">
                              {currentQuantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(ticket._id, 1, ticket)}
                              disabled={currentQuantity >= 10 || !isAvailable || currentQuantity >= ticket.availableQuantity}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={totalTickets === 0}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {totalTickets > 0 ? (
                    <span className="flex items-center justify-between">
                      <span>Buy now</span>
                      <span>RD${totalPrice.toFixed(0)}</span>
                    </span>
                  ) : (
                    'Select tickets to continue'
                  )}
                </button>
              </div>
            )}

            {/* Door Price for Non-Ticketed Events */}
            {!event.isTicketed && (
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-xl font-semibold text-gray-900">
                  Door Price: ${event.doorPrice || event.price || 0}
                </p>
                <p className="text-gray-600 mt-2">
                  Tickets available at the door
                </p>
              </div>
            )}
          </div>
        </div>

        {/* About Section and Organizer Info */}
        <div className="grid lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
          {/* About the Event */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About the event
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            
            {/* Location Details */}
            {(event.city || event.state || event.address) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Location Details
                </h3>
                <p className="text-gray-700">
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

          {/* Organizer Card */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {event.organizerName || "Event Organizer"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Organizer
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                For exchanges, refunds, tax receipts, and any event-related requests, 
                please send a message to the organizer.
              </p>
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Send message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Publish</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/seller/new-event">Publish your event</Link></li>
                <li><Link href="/faq">Frequently Asked Questions</Link></li>
                <li><Link href="/account">My account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about">About us</Link></li>
                <li><Link href="/download">Download our logo</Link></li>
                <li><Link href="/contact">Contact us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Information</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/secure">Secure your purchase</Link></li>
                <li><Link href="/terms">Terms of use</Link></li>
                <li><Link href="/refund">Refund</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@stepperslife.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 SteppersLife | All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}