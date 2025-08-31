"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import CompletePurchaseFlow from "@/components/CompletePurchaseFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import Link from "next/link";

export default function TestPurchasePage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Test Ticket Purchase Flow</h1>
          <p className="mt-2 text-gray-600">
            Select an event below to test the complete ticket purchase process with test/cash payment
          </p>
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
              <Card key={event._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold">
                        ${event.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    
                    <TestPurchaseButton eventId={event._id as Id<"events">} />
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

function TestPurchaseButton({ eventId }: { eventId: Id<"events"> }) {
  const [showFlow, setShowFlow] = useState(false);

  if (showFlow) {
    return (
      <div className="space-y-4">
        <CompletePurchaseFlow
          eventId={eventId}
          enableTestMode={true}
          onComplete={() => {
            alert("Test purchase completed successfully!");
            setShowFlow(false);
          }}
          onCancel={() => setShowFlow(false)}
        />
      </div>
    );
  }

  return (
    <Button 
      onClick={() => setShowFlow(true)}
      className="w-full"
    >
      <Ticket className="w-4 h-4 mr-2" />
      Test Purchase Flow
    </Button>
  );
}

import { useState } from "react";