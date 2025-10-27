"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Event } from "@/lib/types/aggregated-content";

const EVENTS_SUBDOMAIN_URL = process.env.NEXT_PUBLIC_EVENTS_SUBDOMAIN || "https://events.stepperslife.com";

export function EventsGrid() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-dragon-613.convex.cloud";
        const response = await fetch(`${convexUrl}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "public/queries:getUpcomingEvents",
            args: { limit: 12 },
            format: "json",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data.value || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (!scrollContainerRef.current || events.length === 0 || isPaused) return;

    const container = scrollContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    const interval = setInterval(() => {
      if (container.scrollLeft >= scrollWidth - clientWidth - 10) {
        // Reset to start
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll by one card width (approximately 350px)
        container.scrollBy({ left: 350, behavior: "smooth" });
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, [events.length, isPaused]);

  // Manual scroll functions
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="bg-muted/30 py-16">
        <div className="container px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-muted-foreground">
              Don&apos;t miss out on the hottest steppin events
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ scrollbarWidth: "thin" }}
        >
          {events.map((event) => {
            // Skip events without proper structure
            if (!event || !event.location) {
              return null;
            }

            // Format location display
            const locationDisplay = event.location.venueName
              || `${event.location.city}, ${event.location.state}`;

            // Get event type badge
            const eventTypeBadge = event.eventType === "FREE_EVENT"
              ? "Free"
              : event.eventType === "TICKETED_EVENT"
              ? "Tickets Available"
              : "Save the Date";

            // Truncate description
            const description = event.description.length > 120
              ? event.description.substring(0, 120) + "..."
              : event.description;

            // Use imageUrl or placeholder, prepend subdomain URL if path is relative
            let imageUrl = event.imageUrl || "/images/event-placeholder.jpg";
            if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
              imageUrl = `${EVENTS_SUBDOMAIN_URL}${imageUrl}`;
            }

            return (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="group flex-none w-[300px] md:w-[350px] snap-start"
              >
                <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={true}
                    />
                    {event.isFeatured && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.eventType === "FREE_EVENT"
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white"
                      }`}>
                        {eventTypeBadge}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {description}
                    </p>

                    <div className="space-y-2 text-sm mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{event.eventDateLiteral}</span>
                      </div>
                      {event.eventTimeLiteral && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs pl-6">
                          <span>{event.eventTimeLiteral}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{locationDisplay}</span>
                      </div>
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Tag className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.categories[0]}</span>
                        </div>
                      )}
                    </div>

                    <Button className="mt-4 w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
