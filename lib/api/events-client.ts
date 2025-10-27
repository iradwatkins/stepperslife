import { Event, EventFilters, EventCategory } from "../types/aggregated-content";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-dragon-613.convex.cloud";

/**
 * Call a Convex HTTP API endpoint
 */
async function callConvexQuery<T>(
  functionPath: string,
  args: Record<string, string | number | boolean | null | undefined> = {}
): Promise<T> {
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: functionPath,
      args,
      format: "json",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Convex API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Convex wraps the response in a 'value' field for HTTP API
  if (data && typeof data === 'object' && 'value' in data) {
    return data.value as T;
  }

  return data as T;
}

export interface GetEventsParams extends EventFilters {
  limit?: number;
  upcoming?: boolean;
  featured?: boolean;
}

export interface GetEventsResponse {
  events: Event[];
  total: number;
}

export const eventsAPI = {
  /**
   * Get published events with optional filters
   */
  getEvents: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    try {
      let events: Event[];

      if (params?.featured) {
        // Get featured events
        events = await callConvexQuery<Event[]>("public/queries:getFeaturedEvents", {
          limit: params.limit || 50,
        });
      } else if (params?.searchTerm) {
        // Use search endpoint
        events = await callConvexQuery<Event[]>("public/queries:searchEvents", {
          query: params.searchTerm,
          limit: params.limit || 50,
        });
      } else if (params?.category) {
        // Get events by category
        events = await callConvexQuery<Event[]>("public/queries:getEventsByCategory", {
          category: params.category,
          limit: params.limit || 50,
        });
      } else if (params?.city || params?.state) {
        // Get events by location
        events = await callConvexQuery<Event[]>("public/queries:getEventsByLocation", {
          city: params.city,
          state: params.state,
          limit: params.limit || 50,
        });
      } else if (params?.includePast === true) {
        // Get past events
        events = await callConvexQuery<Event[]>("public/queries:getPastEvents", {
          limit: params.limit || 50,
          category: params.category,
          searchTerm: params.searchTerm,
        });
      } else {
        // Default: get published upcoming events
        events = await callConvexQuery<Event[]>("public/queries:getPublishedEvents", {
          limit: params?.limit || 50,
          category: params?.category,
          searchTerm: params?.searchTerm,
          includePast: params?.includePast || false,
        });
      }

      // Additional client-side filtering if needed
      let filtered = events;

      if (params?.upcoming) {
        const now = Date.now();
        filtered = filtered.filter((e) => e.startDate > now);
      }

      if (params?.startDate) {
        filtered = filtered.filter((e) => e.startDate >= params.startDate!);
      }

      if (params?.endDate) {
        filtered = filtered.filter((e) => e.startDate <= params.endDate!);
      }

      if (params?.eventType) {
        filtered = filtered.filter((e) => e.eventType === params.eventType);
      }

      return {
        events: filtered,
        total: filtered.length,
      };
    } catch (error) {
      console.error("Error fetching events:", error);
      return {
        events: [],
        total: 0,
      };
    }
  },

  /**
   * Get upcoming events (chronologically sorted)
   */
  getUpcomingEvents: async (limit: number = 6): Promise<Event[]> => {
    try {
      const events = await callConvexQuery<Event[]>("public/queries:getUpcomingEvents", {
        limit,
      });
      return events;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  },

  /**
   * Get single event by ID
   */
  getEvent: async (eventId: string): Promise<Event | null> => {
    try {
      const event = await callConvexQuery<Event>("public/queries:getPublicEventDetails", {
        eventId,
      });
      return event;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  },

  /**
   * Get all available event categories with counts
   */
  getCategories: async (): Promise<EventCategory[]> => {
    try {
      const categories = await callConvexQuery<EventCategory[]>("public/queries:getCategories");
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  /**
   * Search events by query string
   */
  searchEvents: async (query: string, limit: number = 50): Promise<Event[]> => {
    try {
      const events = await callConvexQuery<Event[]>("public/queries:searchEvents", {
        query,
        limit,
      });
      return events;
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  },

  /**
   * Get events by category
   */
  getEventsByCategory: async (category: string, limit: number = 50): Promise<Event[]> => {
    try {
      const events = await callConvexQuery<Event[]>("public/queries:getEventsByCategory", {
        category,
        limit,
      });
      return events;
    } catch (error) {
      console.error(`Error fetching events for category ${category}:`, error);
      return [];
    }
  },

  /**
   * Get events by location
   */
  getEventsByLocation: async (
    city?: string,
    state?: string,
    limit: number = 50
  ): Promise<Event[]> => {
    try {
      const events = await callConvexQuery<Event[]>("public/queries:getEventsByLocation", {
        city,
        state,
        limit,
      });
      return events;
    } catch (error) {
      console.error("Error fetching events by location:", error);
      return [];
    }
  },

  /**
   * Get featured events
   */
  getFeaturedEvents: async (limit: number = 10): Promise<Event[]> => {
    try {
      const events = await callConvexQuery<Event[]>("public/queries:getFeaturedEvents", {
        limit,
      });
      return events;
    } catch (error) {
      console.error("Error fetching featured events:", error);
      return [];
    }
  },
};
