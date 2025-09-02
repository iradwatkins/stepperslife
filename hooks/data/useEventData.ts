import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserData } from "./useUserData";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(eventId: string | Id<"events"> | undefined) {
  const event = useQuery(
    api.events.getById,
    eventId ? { eventId: eventId as Id<"events"> } : "skip"
  );
  
  return {
    event,
    isLoading: event === undefined && !!eventId,
    notFound: event === null,
  };
}

/**
 * Hook for fetching user's events
 */
export function useUserEvents() {
  const { userId, isAuthenticated } = useUserData();
  
  const events = useQuery(
    api.events.getEventsByUser,
    isAuthenticated ? { userId } : "skip"
  );
  
  return {
    events: events || [],
    isLoading: events === undefined && isAuthenticated,
    isEmpty: events?.length === 0,
    count: events?.length || 0,
  };
}

/**
 * Hook for fetching seller's events with additional stats
 */
export function useSellerEvents() {
  const { userId, isAuthenticated } = useUserData();
  
  const events = useQuery(
    api.events.getSellerEvents,
    isAuthenticated ? { userId } : "skip"
  );
  
  // Categorize events
  const activeEvents = events?.filter(e => 
    e.eventDate > Date.now() && !e.is_cancelled
  ) || [];
  
  const pastEvents = events?.filter(e => 
    e.eventDate <= Date.now() && !e.is_cancelled
  ) || [];
  
  const cancelledEvents = events?.filter(e => e.is_cancelled) || [];
  
  return {
    events: events || [],
    activeEvents,
    pastEvents,
    cancelledEvents,
    isLoading: events === undefined && isAuthenticated,
    stats: {
      total: events?.length || 0,
      active: activeEvents.length,
      past: pastEvents.length,
      cancelled: cancelledEvents.length,
    },
  };
}

/**
 * Hook for fetching all public events
 */
export function usePublicEvents(filters?: {
  category?: string;
  location?: string;
  dateFrom?: number;
  dateTo?: number;
}) {
  const events = useQuery(api.events.get);
  
  // Apply client-side filtering if needed
  let filteredEvents = events || [];
  
  if (filters?.category) {
    filteredEvents = filteredEvents.filter(e => 
      e.eventCategories?.includes(filters.category)
    );
  }
  
  if (filters?.location) {
    filteredEvents = filteredEvents.filter(e => 
      e.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
      e.state?.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  if (filters?.dateFrom) {
    filteredEvents = filteredEvents.filter(e => 
      e.eventDate >= filters.dateFrom
    );
  }
  
  if (filters?.dateTo) {
    filteredEvents = filteredEvents.filter(e => 
      e.eventDate <= filters.dateTo
    );
  }
  
  return {
    events: filteredEvents,
    isLoading: events === undefined,
    count: filteredEvents.length,
  };
}

/**
 * Hook for event ticket types
 */
export function useEventTickets(eventId: string | Id<"events"> | undefined) {
  const tickets = useQuery(
    api.ticketTypes.getEventTicketTypes,
    eventId ? { eventId: eventId as Id<"events"> } : "skip"
  );
  
  const availableTickets = tickets?.filter(t => t.availableQuantity > 0) || [];
  const soldOutTickets = tickets?.filter(t => t.availableQuantity === 0) || [];
  
  return {
    tickets: tickets || [],
    availableTickets,
    soldOutTickets,
    isLoading: tickets === undefined && !!eventId,
    hasTickets: (tickets?.length || 0) > 0,
    allSoldOut: availableTickets.length === 0 && (tickets?.length || 0) > 0,
  };
}

/**
 * Hook for event mutations (create, update, delete)
 */
export function useEventMutations() {
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const deleteEvent = useMutation(api.events.adminDeleteEvent);
  const cancelEvent = useMutation(api.events.cancel);
  
  return {
    createEvent,
    updateEvent,
    deleteEvent,
    cancelEvent,
  };
}

/**
 * Hook for event statistics
 */
export function useEventStats(eventId: string | Id<"events"> | undefined) {
  const stats = useQuery(
    api.events.getEventStats,
    eventId ? { eventId: eventId as Id<"events"> } : "skip"
  );
  
  const defaultStats = {
    totalTickets: 0,
    soldTickets: 0,
    availableTickets: 0,
    revenue: 0,
    attendees: 0,
    conversionRate: 0,
  };
  
  return {
    stats: stats || defaultStats,
    isLoading: stats === undefined && !!eventId,
    soldOutPercentage: stats ? (stats.soldTickets / stats.totalTickets) * 100 : 0,
  };
}