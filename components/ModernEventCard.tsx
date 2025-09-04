"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ensureLocalDate } from "@/lib/date-utils";

interface Event {
  _id: string;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  imageUrl?: string;
  city?: string;
  state?: string;
  availableTickets?: number;
  totalTickets?: number;
  isSaveTheDate?: boolean;
}

interface ModernEventCardProps {
  event: Event;
}

export default function ModernEventCard({ event }: ModernEventCardProps) {
  const imageUrl = event.imageUrl || "/placeholder-event.jpg";
  
  // Determine button text based on event type
  const getButtonText = () => {
    if (event.isSaveTheDate) {
      return "View Details";
    }
    if (event.totalTickets && event.totalTickets > 0) {
      return "Buy Tickets";
    }
    return "View Details";
  };

  const buttonText = getButtonText();
  
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <Link href={`/event/${event._id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        {/* Event Name */}
        <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
          {event.name}
        </h3>
        
        {/* Date */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{ensureLocalDate(event.eventDate) ? format(ensureLocalDate(event.eventDate)!, "MMM d, yyyy • h:mm a") : ""}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">
            {event.city && event.state ? `${event.city}, ${event.state}` : event.location}
          </span>
        </div>
        
        {/* Price or Save the Date */}
        <div className="pt-2 border-t">
          {event.isSaveTheDate ? (
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              Save the Date
            </p>
          ) : event.totalTickets && event.totalTickets > 0 && event.price > 0 ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ${event.price.toFixed(2)}
              </p>
            </>
          ) : event.price === 0 ? (
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              Free Event
            </p>
          ) : (
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
              No Tickets Available
            </p>
          )}
        </div>
        
        {/* Action Button */}
        <Link href={`/event/${event._id}`} className="block">
          <Button className="w-full" size="lg">
            {buttonText}
          </Button>
        </Link>
      </div>
    </Card>
  );
}