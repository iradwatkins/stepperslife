import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import EventsDisplay from "@/components/EventsDisplay";

// Force deployment: 2025-08-31T21:00:00Z
// Build version: 3.2.0 - Server-side rendering fix
// Platform fee: $1.50 per ticket
// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Refresh every 30 seconds

export default async function Home() {
  // Fetch events server-side - no WebSocket needed!
  let events = [];
  
  try {
    // Use the same API query but server-side
    events = await fetchQuery(api.events.get) || [];
    console.log(`Server-side: Fetched ${events.length} events`);
  } catch (error) {
    console.error("Error fetching events server-side:", error);
    // Fallback to empty array if fetch fails
    events = [];
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to SteppersLife
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Discover Amazing Events Near You
        </p>
        
        {/* Display event count for debugging */}
        {events.length > 0 && (
          <p className="text-center text-green-600 mb-4">
            ✅ {events.length} events loaded from database
          </p>
        )}
        
        <EventsDisplay 
          events={events}
          initialMode="grid"
          showFilters={true}
          userLocation={null}
        />
      </div>
    </div>
  );
}