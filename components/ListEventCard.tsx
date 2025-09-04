"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
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

interface ListEventCardProps {
  event: Event;
}

export default function ListEventCard({ event }: ListEventCardProps) {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <Link href={`/event/${event._id}`} className="md:w-48 h-48 md:h-auto flex-shrink-0">
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </Link>
        
        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              {/* Title and Description */}
              <Link href={`/event/${event._id}`}>
                <h3 className="text-xl font-bold hover:text-cyan-600 transition-colors mb-2">
                  {event.name}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {event.description}
              </p>
              
              {/* Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2 text-cyan-600" />
                  <span>{ensureLocalDate(event.eventDate) ? format(ensureLocalDate(event.eventDate)!, "MMM d, yyyy • h:mm a") : ""}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2 text-cyan-600" />
                  <span className="truncate">
                    {event.city && event.state ? `${event.city}, ${event.state}` : event.location}
                  </span>
                </div>
                
                {event.availableTickets !== undefined && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-cyan-600" />
                    <span>{event.availableTickets} tickets available</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Price and Action Section */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3">
              {/* Price Display */}
              <div className="text-right">
                {event.isSaveTheDate ? (
                  <Badge className="bg-cyan-100 text-cyan-700">Save the Date</Badge>
                ) : event.price === 0 ? (
                  <Badge className="bg-green-100 text-green-700">Free</Badge>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      ${event.price.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
              
              {/* Action Button */}
              <Link href={`/event/${event._id}`}>
                <Button>
                  {buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}