"use client";

import Link from "next/link";
import { Calendar, Ticket } from "lucide-react";
import { formatEventDate } from "@/lib/date-format";
import { motion } from "framer-motion";

interface MasonryEventCardProps {
  event: {
    _id: string;
    name: string;
    startDate?: number;
    timezone?: string;
    imageUrl?: string;
    images?: string[];
    eventType: string;
    ticketsVisible?: boolean;
    organizerName?: string;
    isClaimable?: boolean;
  };
}

const EVENTS_SUBDOMAIN_URL = process.env.NEXT_PUBLIC_EVENTS_SUBDOMAIN || "https://events.stepperslife.com";

export function MasonryEventCard({ event }: MasonryEventCardProps) {
  // Use imageUrl from event, fallback to images array, then fallback to placeholder
  let imageUrl = event.imageUrl || (event.images && event.images[0]) || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80`;

  // Prepend subdomain URL if path is relative
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    imageUrl = `${EVENTS_SUBDOMAIN_URL}${imageUrl}`;
  }

  return (
    <Link href={`/events/${event._id}`} className="group block cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        {/* Full-height Event Image with natural aspect ratio */}
        <motion.img
          src={imageUrl}
          alt={event.name}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="h-auto max-w-full rounded-lg w-full"
        />

        {/* Gradient overlay for better badge visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none rounded-lg" />

        {/* Event Type Badge - Top Left */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute top-3 left-3"
        >
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
            {event.eventType.replace("_", " ")}
          </span>
        </motion.div>

        {/* Tickets Available Badge - Top Right */}
        {event.ticketsVisible && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-3 right-3"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm">
              <Ticket className="w-3 h-3" />
              <span>Available</span>
            </div>
          </motion.div>
        )}

        {/* Date Badge - Bottom Left */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute bottom-3 left-3"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">
              {formatEventDate(event.startDate, event.timezone)}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
