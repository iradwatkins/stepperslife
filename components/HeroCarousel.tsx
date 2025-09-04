"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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
}

interface HeroCarouselProps {
  events: Event[];
}

export default function HeroCarousel({ events }: HeroCarouselProps) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Select 5 random events for the carousel
    const shuffled = [...events].sort(() => Math.random() - 0.5);
    setFeaturedEvents(shuffled.slice(0, 5));
  }, [events]);

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredEvents.map((event, index) => (
              <CarouselItem key={event._id}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="flex flex-col">
                    {/* Image Section - Full Width at Top */}
                    <div className="relative h-96 md:h-[500px] w-full">
                      <img
                        src={event.imageUrl || "/placeholder-event.jpg"}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Overlay Content on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <h3 className="text-3xl md:text-5xl font-bold mb-2">{event.name}</h3>
                        <p className="text-lg md:text-xl opacity-90 line-clamp-2 max-w-3xl">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Content Section Below Image */}
                    <div className="p-6 md:p-8 bg-white dark:bg-gray-800">
                      <div className="grid md:grid-cols-3 gap-6">
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Calendar className="w-5 h-5 mr-3 text-cyan-600" />
                            <span className="font-medium">
                              {format(new Date(event.eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <MapPin className="w-5 h-5 mr-3 text-cyan-600" />
                            <span className="font-medium">
                              {event.city && event.state ? `${event.city}, ${event.state}` : event.location}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <DollarSign className="w-5 h-5 mr-3 text-cyan-600" />
                            <span className="font-medium text-lg">
                              From ${event.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      
                      <div className="mt-6 flex gap-4 md:col-span-3">
                        <Link href={`/event/${event._id}`} className="flex-1">
                          <Button size="lg" className="w-full">
                            Get Tickets
                          </Button>
                        </Link>
                        <Link href={`/event/${event._id}`}>
                          <Button size="lg" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>
    </div>
  );
}