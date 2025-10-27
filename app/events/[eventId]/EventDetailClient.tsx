"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  ArrowLeft,
  Ticket,
  ExternalLink,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatEventDate, formatEventTime } from "@/lib/date-format";
import { SocialShareButtons } from "@/components/events/SocialShareButtons";
import { Event } from "@/lib/types/aggregated-content";

interface EventDetailClientProps {
  event: Event;
}

const EVENTS_SUBDOMAIN_URL = process.env.NEXT_PUBLIC_EVENTS_SUBDOMAIN || "https://events.stepperslife.com";

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  // Close flyer modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFlyerModal) {
        setShowFlyerModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showFlyerModal]);

  const handleShare = async () => {
    const shareData = {
      title: event.name,
      text: `Check out this event: ${event.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const isUpcoming = event.startDate ? event.startDate > Date.now() : false;
  const isPast = event.endDate ? event.endDate < Date.now() : false;
  const showTickets = event.eventType === "TICKETED_EVENT" &&
                       event.ticketsVisible &&
                       isUpcoming;

  // Use imageUrl or placeholder, prepend subdomain URL if path is relative
  let imageUrl = event.imageUrl || "/images/event-placeholder.jpg";
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    imageUrl = `${EVENTS_SUBDOMAIN_URL}${imageUrl}`;
  }

  // Format full address
  const fullAddress = [
    event.location.address,
    event.location.city,
    event.location.state,
    event.location.zipCode,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Events</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: Flyer (Left) + Event Info (Right) */}
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Flyer Image - Left (2/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2"
            >
              <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg sticky top-24">
                {event.imageUrl ? (
                  <div
                    onClick={() => setShowFlyerModal(true)}
                    className="cursor-pointer"
                  >
                    <img
                      src={imageUrl}
                      alt={event.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <Calendar className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}

                {/* Event Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    event.eventType === "SAVE_THE_DATE"
                      ? "bg-yellow-500 text-white"
                      : event.eventType === "FREE_EVENT"
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}>
                    {event.eventType === "SAVE_THE_DATE"
                      ? "Save the Date"
                      : event.eventType === "FREE_EVENT"
                      ? "Free Event"
                      : "Ticketed Event"}
                  </span>
                </div>

                {/* Past Event Badge */}
                {isPast && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs font-semibold shadow-lg">
                      Past Event
                    </span>
                  </div>
                )}

                {/* Featured Badge */}
                {event.isFeatured && (
                  <div className="absolute top-14 right-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-lg">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Event Info - Right (3/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-3"
            >
              {/* Event Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>

              {/* Categories */}
              {event.categories && event.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Event Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                {/* Date & Time */}
                {event.startDate && (
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatEventDate(event.startDate, event.eventTimezone)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatEventTime(event.startDate, event.eventTimezone)}
                        {event.endDate && ` - ${formatEventTime(event.endDate, event.eventTimezone)}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      {event.location.venueName && (
                        <p className="font-semibold text-gray-900">{event.location.venueName}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {event.location.address && (
                          <>
                            {event.location.address}
                            <br />
                          </>
                        )}
                        {event.location.city}, {event.location.state} {event.location.zipCode}
                      </p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 inline-flex items-center gap-1"
                      >
                        View Map
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              {showTickets ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-6"
                >
                  <a
                    href={`${EVENTS_SUBDOMAIN_URL}/events/${event._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
                  >
                    <Ticket className="w-5 h-5" />
                    Buy Tickets
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              ) : event.eventType === "FREE_EVENT" && isUpcoming ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-6"
                >
                  <a
                    href={`${EVENTS_SUBDOMAIN_URL}/events/${event._id}/register`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    <Ticket className="w-5 h-5" />
                    Register Free
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              ) : event.eventType === "SAVE_THE_DATE" ? (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Tickets coming soon!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Save this date on your calendar
                  </p>
                </div>
              ) : isPast ? (
                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">This event has ended</p>
                </div>
              ) : null}

              {/* Ticket Info */}
              {!event.ticketsVisible && event.eventType === "TICKETED_EVENT" && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                  <p className="text-xs text-gray-600">
                    Ticket sales have not started yet. Check back soon!
                  </p>
                </div>
              )}

              {/* Organizer */}
              {event.organizerName && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Organized By</h3>
                  <p className="text-gray-700 font-medium text-xl">
                    {event.organizerName}
                  </p>
                </div>
              )}

              {/* Social Share Buttons */}
              <div className="mt-6">
                <SocialShareButtons
                  eventName={event.name}
                  eventUrl={typeof window !== 'undefined' ? window.location.href : ''}
                  eventDate={event.startDate ? formatEventDate(event.startDate, event.eventTimezone) : ''}
                  hasTickets={showTickets}
                />
              </div>
            </motion.div>
          </div>

          {/* Description Section - Full Width Below */}
          {event.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Flyer Modal */}
      <AnimatePresence>
        {showFlyerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFlyerModal(false)}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <button
                onClick={() => setShowFlyerModal(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-white text-center text-sm mt-4 opacity-75">
                Click anywhere to close or press ESC
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
