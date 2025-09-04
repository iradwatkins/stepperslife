"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, TreePalm, Users, Plane, Ship, Gift, Trophy, GraduationCap, Heart, PartyPopper, MoreHorizontal, LayoutGrid, Grid3x3, List } from "lucide-react";
import ModernEventCard from "./ModernEventCard";
import MasonryEventCard from "./MasonryEventCard";
import ListEventCard from "./ListEventCard";

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
  categories?: string[];
}

interface ModernEventsDisplayProps {
  events: Event[];
}

const categories = [
  { value: "all", label: "All Events", icon: Calendar },
  { value: "workshop", label: "Workshop", icon: GraduationCap },
  { value: "sets", label: "Sets/Performance", icon: Users },
  { value: "in_the_park", label: "In The Park", icon: TreePalm },
  { value: "trip", label: "Trip/Travel", icon: Plane },
  { value: "cruise", label: "Cruise", icon: Ship },
  { value: "holiday", label: "Holiday Event", icon: Gift },
  { value: "competition", label: "Competition", icon: Trophy },
  { value: "class", label: "Class/Lesson", icon: GraduationCap },
  { value: "social", label: "Social Dance", icon: Heart },
  { value: "party", label: "Party", icon: PartyPopper },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function ModernEventsDisplay({ events }: ModernEventsDisplayProps) {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "list">("grid");

  // Filter events based on search and category
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (simplified keyword matching for now)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => {
        const eventText = `${event.name} ${event.description}`.toLowerCase();
        switch(selectedCategory) {
          case "workshop":
            return eventText.includes("workshop") || eventText.includes("training");
          case "sets":
            return eventText.includes("sets") || eventText.includes("performance");
          case "in_the_park":
            return eventText.includes("park") || eventText.includes("outdoor");
          case "trip":
            return eventText.includes("trip") || eventText.includes("travel");
          case "cruise":
            return eventText.includes("cruise") || eventText.includes("boat");
          case "holiday":
            return eventText.includes("holiday") || eventText.includes("christmas") || eventText.includes("thanksgiving");
          case "competition":
            return eventText.includes("competition") || eventText.includes("contest");
          case "class":
            return eventText.includes("class") || eventText.includes("lesson");
          case "social":
            return eventText.includes("social") || eventText.includes("dance");
          case "party":
            return eventText.includes("party") || eventText.includes("club");
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, events]);

  // Distribute events across columns for masonry layout
  const masonryColumns = useMemo(() => {
    const columnCount = 4; // Always use 4 columns for desktop, will be responsive via CSS
    const columns: Event[][] = Array(columnCount).fill(null).map(() => []);
    
    filteredEvents.forEach((event, index) => {
      columns[index % columnCount].push(event);
    });
    
    return columns;
  }, [filteredEvents]);

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Grid
        </Button>
        <Button
          variant={viewMode === "masonry" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("masonry")}
        >
          <Grid3x3 className="w-4 h-4 mr-2" />
          Masonry
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </Button>
      </div>

      {/* Grid/List View with Search and Categories */}
      {(viewMode === "grid" || viewMode === "list") && (
        <>
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                isSearchFocused ? 'text-cyan-600' : 'text-gray-400'
              }`} />
              <Input
                placeholder="Search for events, venues, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-cyan-600 transition-colors"
              />
            </div>
          </div>

          {/* Category Dropdown and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          </div>

          {/* Events Display */}
          <div className="mt-6">
            {filteredEvents.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredEvents.map(event => (
                    <ModernEventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map(event => (
                    <ListEventCard key={event._id} event={event} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
                  No events found
                </p>
                <p className="text-gray-400 dark:text-gray-500 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Masonry View - Just Images */}
      {viewMode === "masonry" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {masonryColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="grid gap-4">
              {column.map(event => (
                <MasonryEventCard key={event._id} event={event} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredEvents.length >= 12 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
}