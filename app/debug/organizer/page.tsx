import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrganizerDebugPage() {
  const { userId } = await auth();
  
  // Get all events to debug
  const allEvents = await fetchQuery(api.events.getAllEventsDebug, {});
  
  // Get organizer stats if userId exists
  let stats = null;
  if (userId) {
    try {
      stats = await fetchQuery(api.events.getOrganizerStats, { 
        organizerId: userId 
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Organizer Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Current User Info:</h2>
        <p>User ID from Clerk: <code className="bg-gray-200 px-2 py-1 rounded">{userId || 'NOT LOGGED IN'}</code></p>
      </div>
      
      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Organizer Stats:</h2>
        {stats ? (
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        ) : (
          <p>No stats available</p>
        )}
      </div>
      
      <div className="bg-green-100 p-4 rounded">
        <h2 className="font-bold mb-2">All Events in Database (last 10):</h2>
        <div className="space-y-2">
          {allEvents.map((event: any) => (
            <div key={event._id} className="bg-white p-3 rounded">
              <p><strong>Name:</strong> {event.name}</p>
              <p><strong>Event ID:</strong> <code className="text-xs">{event._id}</code></p>
              <p><strong>Owner userId:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{event.userId}</code></p>
              <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
              <p><strong>Cancelled:</strong> {event.is_cancelled ? 'Yes' : 'No'}</p>
              <p className={userId === event.userId ? 'text-green-600 font-bold' : 'text-red-600'}>
                {userId === event.userId ? '✓ OWNED BY YOU' : '✗ Not owned by you'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h2 className="font-bold mb-2">Diagnosis:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Total events in sample: {allEvents.length}</li>
          <li>Events owned by current user: {allEvents.filter((e: any) => e.userId === userId).length}</li>
          <li>Stats active events: {stats?.activeEvents || 0}</li>
          <li>Stats total events: {stats?.totalEvents || 0}</li>
        </ul>
      </div>
    </div>
  );
}