"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ImageUploadField from "@/components/ImageUploadField";
import { useRouter } from "next/navigation";

export default function TestEventWithImage() {
  const { user, isSignedIn } = useAuth();
  const router = useRouter();
  const createEvent = useMutation(api.events.create);
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState("Test Event with Image " + new Date().toLocaleDateString());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleCreateEvent = async () => {
    if (!isSignedIn || !user) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "You must be signed in to create an event"
      });
      return;
    }
    
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "No image",
        description: "Please upload an image for the event"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const eventData = {
        name: eventName,
        description: "This is a test event with an image to verify image upload and display",
        location: "Atlanta Convention Center",
        eventDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        price: 35,
        totalTickets: 150,
        userId: user.id,
        imageUrl: imageUrl, // Include the uploaded image URL
        eventType: "workshop" as const,
        eventCategories: ["workshop"] as const,
        isTicketed: true,
        doorPrice: 35,
        eventMode: "single" as const,
        address: "285 Andrew Young International Blvd NW",
        city: "Atlanta",
        state: "GA",
        country: "USA",
        postalCode: "30313",
        totalCapacity: 150,
      };
      
      console.log("Creating event with image:", eventData);
      
      const eventId = await createEvent(eventData);
      
      toast({
        title: "Success!",
        description: `Event created with image! Redirecting to event page...`
      });
      
      console.log("Event created successfully:", eventId);
      
      // Redirect to the event page after 2 seconds
      setTimeout(() => {
        router.push(`/event/${eventId}`);
      }, 2000);
      
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
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Test Event Creation with Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Testing:</strong> Image upload to MinIO and display in event cards
            </p>
          </div>
          
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
          
          <div>
            <ImageUploadField
              value={imageUrl || undefined}
              onChange={(url) => setImageUrl(url)}
              label="Event Image (Required)"
            />
            {imageUrl && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-xs text-green-800 dark:text-green-200">
                  ✅ Image uploaded successfully!
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">
                  URL: {imageUrl}
                </p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleCreateEvent}
            disabled={isCreating || !isSignedIn || !imageUrl}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating Event..." : "Create Event with Image"}
          </Button>
          
          {!isSignedIn && (
            <p className="text-red-600 text-sm text-center">
              You must sign in to create an event
            </p>
          )}
          
          {isSignedIn && !imageUrl && (
            <p className="text-amber-600 text-sm text-center">
              Please upload an image before creating the event
            </p>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Test Flow:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>Upload an image using the image upload field</li>
          <li>Image will be uploaded to MinIO storage</li>
          <li>Create the event with the uploaded image</li>
          <li>You'll be redirected to the event page</li>
          <li>The image should display on the event page</li>
          <li>Navigate to the events list to see the image in the card</li>
        </ol>
      </div>
    </div>
  );
}