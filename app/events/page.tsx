"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const events = useQuery(api.events.list);
  
  // Filter active events (not cancelled and in the future)
  const activeEvents = events?.filter(event => 
    !event.is_cancelled && 
    event.eventDate > Date.now()
  ) || [];
  
  // Apply search and category filters
  const filteredEvents = activeEvents.filter(event => {
    const matchesSearch = searchTerm === "" || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      event.eventCategories?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories from all events
  const allCategories = [...new Set(
    activeEvents.flatMap(event => event.eventCategories || [])
  )].filter(Boolean);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find and join amazing events happening in your area
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All Categories
              </Button>
              {allCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Doc<"events"> }) {
  const imageUrl = event.imageUrl || "/placeholder-event.jpg";
  
  return (
    <Link href={`/event/${event._id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        {imageUrl && (
          <div className="h-48 bg-gray-100">
            <img
              src={imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {event.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            
            {event.location && (
              <div className="flex items-center text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                {event.price > 0 ? `$${event.price}` : "Free"}
              </div>
              
              {event.totalTickets && (
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {event.totalTickets} spots
                </div>
              )}
            </div>
          </div>
          
          {event.eventCategories && event.eventCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.eventCategories.slice(0, 2).map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}