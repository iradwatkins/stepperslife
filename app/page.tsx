import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import EventsDisplay from "@/components/EventsDisplay";
import Link from "next/link";
import { Plus, Calendar, Users, TrendingUp } from "lucide-react";

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
        
        {/* Event Organizer CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 mb-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Are You an Event Organizer?
            </h2>
            <p className="text-lg mb-6 text-purple-100">
              Start selling tickets and managing your events with SteppersLife today
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Reach More Attendees</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Track Sales & Analytics</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Easy Event Management</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/organizer/new-event"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your Event
              </Link>
              <Link 
                href="/organizer/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
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