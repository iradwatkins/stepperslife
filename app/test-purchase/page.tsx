"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TestPurchasePage() {
  const router = useRouter();
  // Get all events with ticket types
  const events = useQuery(api.events.getEvents, {});
  
  // Filter for events with ticket types available
  const eventsWithTickets = events?.filter(event => event.isTicketed) || [];

  if (!events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events Available for Testing</h1>
              <p className="mt-2 text-gray-600">
                Click on any event to view details and test the ticket purchase process
              </p>
            </div>
            <Link href="/test-all-purchases">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Test All Purchase Types
              </Button>
            </Link>
          </div>
        </div>

        {eventsWithTickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No events with tickets available</p>
                <Link href="/seller/new-event">
                  <Button className="mt-4">Create an Event</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventsWithTickets.map((event) => (
              <Card 
                key={event._id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => router.push(`/event/${event._id}?testMode=true`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {event.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex flex-col gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.totalTickets && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.totalTickets} total tickets
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm text-gray-600">Starting from:</span>
                      <span className="font-bold text-lg">
                        ${event.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/event/${event._id}?testMode=true`);
                      }}
                    >
                      View Event Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}