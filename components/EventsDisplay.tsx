"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutGrid, 
  LayoutList, 
  Map as MapIcon, 
  Grid3x3,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Navigation
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EventType, getEventTypeIcon, getEventTypeLabel } from "./EventTypeSelector";
import { format } from "date-fns";

export type DisplayMode = "grid" | "masonry" | "list" | "map";

interface Event {
  _id: string;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  userId: string;
  imageStorageId?: string;
  imageUrl?: string;
  eventType?: EventType;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  availableTickets?: number;
  soldTickets?: number;
}

interface EventsDisplayProps {
  events: Event[];
  initialMode?: DisplayMode;
  showFilters?: boolean;
  userLocation?: { lat: number; lng: number };
}

export default function EventsDisplay({ 
  events, 
  initialMode = "grid",
  showFilters = true,
  userLocation
}: EventsDisplayProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialMode);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "distance" | "popularity">("date");
  const [showNearby, setShowNearby] = useState(false);

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.eventType === selectedType);
    }

    // Nearby filter (if user location available)
    if (showNearby && userLocation) {
      filtered = filtered.filter(event => {
        if (event.latitude && event.longitude) {
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            event.latitude, 
            event.longitude
          );
          return distance <= 50; // Within 50km
        }
        return false;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return a.eventDate - b.eventDate;
        case "price":
          return a.price - b.price;
        case "distance":
          if (userLocation && a.latitude && a.longitude && b.latitude && b.longitude) {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
            return distA - distB;
          }
          return 0;
        case "popularity":
          return (b.soldTickets || 0) - (a.soldTickets || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedType, sortBy, showNearby, userLocation]);

  // Calculate distance between two points
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const EventCard = ({ event }: { event: Event }) => {
    const Icon = getEventTypeIcon(event.eventType);
    const typeLabel = getEventTypeLabel(event.eventType);
    const distance = userLocation && event.latitude && event.longitude
      ? calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
      : null;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {event.imageUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              className="object-cover"
            />
            {event.eventType && (
              <Badge className="absolute top-2 left-2 bg-white/90">
                <Icon className="w-3 h-3 mr-1" />
                {typeLabel}
              </Badge>
            )}
          </div>
        )}
        <CardHeader>
          <h3 className="font-semibold text-lg line-clamp-1">{event.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(event.eventDate), "MMM d, yyyy")}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">
              {event.city ? `${event.city}, ${event.state}` : event.location}
            </span>
          </div>
          {distance && (
            <div className="flex items-center text-sm text-gray-600">
              <Navigation className="w-4 h-4 mr-2" />
              {distance.toFixed(1)} km away
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-1" />
              {event.availableTickets || 0} left
            </div>
            <div className="flex items-center font-semibold">
              <DollarSign className="w-4 h-4" />
              {event.price.toFixed(2)}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/event/${event._id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Display Mode Selector */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs value={displayMode} onValueChange={(v) => setDisplayMode(v as DisplayMode)}>
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="grid">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="masonry">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Masonry
            </TabsTrigger>
            <TabsTrigger value="list">
              <LayoutList className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className="w-4 h-4 mr-2" />
              Map
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-sm text-gray-600">
          {filteredEvents.length} events found
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EventType | "all")}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="sets">Sets</SelectItem>
              <SelectItem value="in_the_park">In the Park</SelectItem>
              <SelectItem value="trip">Trip</SelectItem>
              <SelectItem value="cruise">Cruise</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              {userLocation && <SelectItem value="distance">Distance</SelectItem>}
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>

          {userLocation && (
            <Button
              variant={showNearby ? "default" : "outline"}
              onClick={() => setShowNearby(!showNearby)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Near Me
            </Button>
          )}
        </div>
      )}

      {/* Events Display */}
      {displayMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {displayMode === "masonry" && (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredEvents.map(event => (
            <div key={event._id} className="break-inside-avoid">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {displayMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map(event => {
            const Icon = getEventTypeIcon(event.eventType);
            const distance = userLocation && event.latitude && event.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
              : null;

            return (
              <Card key={event._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {event.imageUrl && (
                    <div className="relative h-48 md:h-auto md:w-48 flex-shrink-0">
                      <Image
                        src={event.imageUrl}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{event.name}</h3>
                        <p className="text-gray-600 mt-1">{event.description}</p>
                      </div>
                      {event.eventType && (
                        <Badge variant="secondary">
                          <Icon className="w-3 h-3 mr-1" />
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(event.eventDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.city ? `${event.city}, ${event.state}` : event.location}
                      </div>
                      {distance && (
                        <div className="flex items-center">
                          <Navigation className="w-4 h-4 mr-1" />
                          {distance.toFixed(1)} km
                        </div>
                      )}
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.availableTickets || 0} tickets left
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-2xl font-bold">
                        ${event.price.toFixed(2)}
                      </div>
                      <Link href={`/event/${event._id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {displayMode === "map" && (
        <Card className="p-4">
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Map view coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with Google Maps or Mapbox required
              </p>
            </div>
          </div>
        </Card>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}