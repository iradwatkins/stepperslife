"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventsDisplay from "@/components/EventsDisplay";
import { useEffect, useState } from "react";

export default function Home() {
  const events = useQuery(api.events.get) || [];
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Version indicator - Remove after verification */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm">
        🚀 Version 2.0 - Event Discovery System Active - {new Date().toLocaleString()}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to SteppersLife
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Discover Amazing Events Near You
        </p>
        
        <EventsDisplay 
          events={events}
          initialMode="grid"
          showFilters={true}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
}
