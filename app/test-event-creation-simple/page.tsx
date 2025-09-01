"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function TestEventCreationSimple() {
  const { user, isSignedIn } = useAuth();
  const createEvent = useMutation(api.events.create);
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState("Test Event " + Date.now());
  
  const handleCreateEvent = async () => {
    if (!isSignedIn || !user) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "You must be signed in to create an event"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const eventData = {
        name: eventName,
        description: "This is a test event created to verify the event creation flow",
        location: "Test Location",
        eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        price: 25,
        totalTickets: 100,
        userId: user.id,
        imageUrl: "",
        eventType: "workshop" as const,
        eventCategories: ["workshop"] as const,
        isTicketed: true,
        doorPrice: 25,
        eventMode: "single" as const,
        address: "123 Test St",
        city: "Atlanta",
        state: "GA",
        country: "USA",
        postalCode: "30301",
        totalCapacity: 100,
      };
      
      console.log("Creating event with data:", eventData);
      
      const eventId = await createEvent(eventData);
      
      toast({
        title: "Success!",
        description: `Event created with ID: ${eventId}`
      });
      
      console.log("Event created successfully:", eventId);
      
    } catch (error: any) {
      console.error("Failed to create event:", error);
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message || "Unknown error occurred"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Event Creation (Simple)</h1>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Signed in as:</p>
          <p className="font-medium">
            {isSignedIn ? user?.emailAddresses[0]?.emailAddress : "Not signed in"}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Event Name:</label>
          <Input 
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter event name"
          />
        </div>
        
        <Button 
          onClick={handleCreateEvent}
          disabled={isCreating || !isSignedIn}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Test Event"}
        </Button>
        
        {!isSignedIn && (
          <p className="text-red-600 text-sm">
            You must sign in to create an event
          </p>
        )}
      </div>
    </div>
  );
}