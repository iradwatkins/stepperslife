"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, DollarSign, Users } from "lucide-react";
import { EventType, getEventTypeIcon, getEventTypeLabel } from "./EventTypeSelector";
import Image from "next/image";

const GOOGLE_MAPS_API_KEY = "AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

interface Event {
  _id: string;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  userId: string;
  imageUrl?: string;
  eventType?: EventType;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  availableTickets?: number;
  soldTickets?: number;
}

interface EventsMapProps {
  events: Event[];
  userLocation?: { lat: number; lng: number };
  height?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060, // New York City default
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: true,
};

// Custom marker icons for different event types
const getMarkerIcon = (eventType?: EventType): google.maps.Icon | google.maps.Symbol | string => {
  const colors: Record<EventType, string> = {
    workshop: "#3B82F6", // blue
    sets: "#8B5CF6", // purple
    in_the_park: "#10B981", // green
    trip: "#F97316", // orange
    cruise: "#06B6D4", // cyan
    holiday: "#EF4444", // red
    competition: "#F59E0B", // yellow
    class: "#6366F1", // indigo
    other: "#6B7280", // gray
  };

  const color = eventType ? colors[eventType] : "#6B7280";

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.8,
    strokeColor: "#FFFFFF",
    strokeWeight: 2,
    scale: 10,
  };
};

export default function EventsMap({ events, userLocation, height = "600px" }: EventsMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Filter events that have coordinates
  const mappableEvents = useMemo(() => 
    events.filter(event => event.latitude && event.longitude),
    [events]
  );

  // Calculate map bounds to fit all events
  const bounds = useMemo(() => {
    const bounds = new google.maps.LatLngBounds();
    mappableEvents.forEach(event => {
      if (event.latitude && event.longitude) {
        bounds.extend({ lat: event.latitude, lng: event.longitude });
      }
    });
    if (userLocation) {
      bounds.extend(userLocation);
    }
    return bounds;
  }, [mappableEvents, userLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Fit map to show all events
    if (mappableEvents.length > 0) {
      map.fitBounds(bounds);
    } else if (userLocation) {
      map.setCenter(userLocation);
      map.setZoom(12);
    }
  }, [bounds, mappableEvents, userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const center = useMemo(() => {
    if (mappableEvents.length > 0) {
      const lat = mappableEvents.reduce((sum, e) => sum + (e.latitude || 0), 0) / mappableEvents.length;
      const lng = mappableEvents.reduce((sum, e) => sum + (e.longitude || 0), 0) / mappableEvents.length;
      return { lat, lng };
    }
    return userLocation || defaultCenter;
  }, [mappableEvents, userLocation]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div style={{ height }}>
        {mappableEvents.length === 0 ? (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Events with Locations</h3>
              <p className="text-gray-600">
                No events have location coordinates set. Events will appear here once locations are added.
              </p>
            </div>
          </Card>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                  scale: 8,
                }}
                title="Your Location"
              />
            )}

            {/* Event markers with clustering */}
            <MarkerClusterer
              options={{
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                gridSize: 50,
                maxZoom: 15,
              }}
            >
              {(clusterer) => (
                <>
                  {mappableEvents.map((event) => (
                    <Marker
                      key={event._id}
                      position={{ 
                        lat: event.latitude!, 
                        lng: event.longitude! 
                      }}
                      icon={getMarkerIcon(event.eventType)}
                      title={event.name}
                      onClick={() => setSelectedEvent(event)}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>

            {/* Info window for selected event */}
            {selectedEvent && selectedEvent.latitude && selectedEvent.longitude && (
              <InfoWindow
                position={{
                  lat: selectedEvent.latitude,
                  lng: selectedEvent.longitude,
                }}
                onCloseClick={() => setSelectedEvent(null)}
              >
                <div className="p-2 max-w-xs">
                  {selectedEvent.imageUrl && (
                    <div className="relative h-32 w-full mb-2">
                      <Image
                        src={selectedEvent.imageUrl}
                        alt={selectedEvent.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-base mb-1">{selectedEvent.name}</h3>
                  {selectedEvent.eventType && (
                    <Badge variant="secondary" className="mb-2">
                      {getEventTypeLabel(selectedEvent.eventType)}
                    </Badge>
                  )}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(selectedEvent.eventDate), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedEvent.city ? `${selectedEvent.city}, ${selectedEvent.state}` : selectedEvent.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {selectedEvent.availableTickets || 0} left
                      </div>
                      <div className="flex items-center font-semibold">
                        <DollarSign className="w-3 h-3" />
                        {selectedEvent.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Link href={`/event/${selectedEvent._id}`}>
                    <Button className="w-full mt-3" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </LoadScript>
  );
}

// Hook to get user's location
export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, error, loading };
}