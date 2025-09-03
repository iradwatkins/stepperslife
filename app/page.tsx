import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import ModernEventsDisplay from "@/components/ModernEventsDisplay";
import HeroCarousel from "@/components/HeroCarousel";
import SplashScreen from "@/components/SplashScreen";

// Force deployment: 2025-08-31T21:00:00Z
// Build version: 3.2.0 - Server-side rendering fix
// Platform fee: $1.50 per ticket

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
    <>
      <SplashScreen />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Carousel - Full Width */}
        {events.length > 0 && <HeroCarousel events={events} />}
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <ModernEventsDisplay events={events} />
        </div>
      </div>
    </>
  );
}