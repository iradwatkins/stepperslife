"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RefreshCw, Search, AlertCircle } from "lucide-react";

export default function EventsDebugPage() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get all events with user info
  const allEvents = useQuery(api.events.debugGetAllEventsWithUsers);
  
  // Get user's events
  const userEvents = useQuery(
    api.events.getSellerEvents,
    isLoaded && isSignedIn && user?.id ? { userId: user.id } : "skip"
  );
  
  // Search events by name
  const searchResults = useQuery(
    api.events.debugFindEventByName,
    searchTerm.length > 2 ? { searchTerm } : "skip"
  );
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };
  
  const enableDebugMode = () => {
    localStorage.setItem('debug_events', 'true');
    alert('Debug mode enabled! Check console for detailed logs.');
  };
  
  const disableDebugMode = () => {
    localStorage.removeItem('debug_events');
    alert('Debug mode disabled.');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Events Debug Dashboard</h1>
          
          {/* User Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3">Current User Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Auth Status:</span>{" "}
                {isLoaded ? (isSignedIn ? "✅ Signed In" : "❌ Not Signed In") : "⏳ Loading..."}
              </div>
              <div>
                <span className="font-medium">User ID:</span>{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">{user?.id || "N/A"}</code>
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {user?.emailAddresses?.[0]?.emailAddress || "N/A"}
              </div>
              <div>
                <span className="font-medium">ID Type:</span>{" "}
                {typeof user?.id}
              </div>
              <div>
                <span className="font-medium">ID Length:</span>{" "}
                {user?.id?.length || 0}
              </div>
              <div>
                <span className="font-medium">Name:</span>{" "}
                {user?.firstName} {user?.lastName}
              </div>
            </div>
          </div>
          
          {/* Debug Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Force Refresh
            </button>
            <button
              onClick={enableDebugMode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Enable Debug Mode
            </button>
            <button
              onClick={disableDebugMode}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Disable Debug Mode
            </button>
          </div>
          
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {searchResults && searchResults.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Search Results:</h3>
                {searchResults.map((event) => (
                  <div key={event.id} className="border-b border-gray-200 py-2">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-gray-600">
                      User ID: <code className="bg-gray-100 px-1">{event.userId}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* User's Events Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Events (via getSellerEvents)
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {userEvents === undefined ? (
                <p>Loading...</p>
              ) : userEvents?.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <p>No events found for your user ID</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userEvents?.map((event) => (
                    <div key={event._id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-600">
                        ID: {event._id} | User ID: {event.userId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* All Events Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              All Events in Database (Last 50)
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {allEvents === undefined ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Total: {allEvents?.length || 0} events
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            User ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Match
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allEvents?.map((event) => (
                          <tr key={event.id}>
                            <td className="px-4 py-2 text-sm">{event.name}</td>
                            <td className="px-4 py-2 text-sm">
                              <code className="bg-gray-100 px-1 text-xs">
                                {event.userId}
                              </code>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {event.userId === user?.id ? (
                                <span className="text-green-600">✅ Match</span>
                              ) : (
                                <span className="text-red-600">❌ No Match</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}