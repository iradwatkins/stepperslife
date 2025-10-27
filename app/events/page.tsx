"use client";

import { useState, useMemo } from "react";
import { MasonryGrid } from "./components/MasonryGrid";
import { GridView } from "./components/GridView";
import { ListView } from "./components/ListView";
import { SearchFilters } from "./components/SearchFilters";
import { ViewToggle } from "./components/ViewToggle";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";
import { Event } from "./types";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">("masonry");
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Fetch events from Convex API (client-side)
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events on mount and when showPastEvents changes
  useMemo(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-dragon-613.convex.cloud";
        const path = showPastEvents ? "public/queries:getPastEvents" : "public/queries:getPublishedEvents";

        const response = await fetch(`${convexUrl}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            args: { limit: 100 },
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
  }, [showPastEvents]);

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let filtered = events;

    // Remove duplicates based on _id
    const seen = new Set();
    filtered = filtered.filter((event) => {
      if (seen.has(event._id)) {
        return false;
      }
      seen.add(event._id);
      return true;
    });

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          (event.location && typeof event.location === "object" && event.location.city && event.location.city.toLowerCase().includes(searchLower)) ||
          (event.location && typeof event.location === "object" && event.location.state && event.location.state.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((event) => event.categories?.includes(selectedCategory));
    }

    return filtered;
  }, [events, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Chicago Steppin Events
          </h1>
          <p className="text-xl text-muted-foreground">
            Find the best steppin parties, workshops, and socials in Chicago
          </p>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="container px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            selectedCategory={selectedCategory}
            showPastEvents={showPastEvents}
            onTogglePastEvents={setShowPastEvents}
          />
        </div>

        {/* Results Count and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!loading && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
            </p>
          )}

          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        )}

        {/* Event Views */}
        {!loading && (
          <>
            {viewMode === "masonry" && <MasonryGrid events={filteredEvents || []} />}
            {viewMode === "grid" && <GridView events={filteredEvents || []} />}
            {viewMode === "list" && <ListView events={filteredEvents || []} />}
          </>
        )}

        {/* No Events */}
        {!loading && filteredEvents.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">No events found</p>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find events
            </p>
          </div>
        )}
      </section>

      {/* Ad: Footer Banner */}
      <FooterBannerAd />
    </div>
  );
}
