"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, DollarSign, Users, Trash2, Search, Image, AlertCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Admin emails that have access to this page
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export default function AdminAllEventsPage() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Id<"events"> | null>(null);
  
  // Check if user is admin
  const isAdmin = user?.emailAddresses[0]?.emailAddress && ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress);

  // Get ALL events (not just claimable ones)
  const allEvents = useQuery(api.adminEvents.getAllEventsForAdmin);
  const deleteAdminEvent = useMutation(api.adminEvents.deleteAdminEvent);

  // Filter events based on search
  const filteredEvents = allEvents?.filter(event => {
    const search = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.userId?.toLowerCase().includes(search)
    );
  }) || [];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    redirect("/");
  }

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (!confirm("⚠️ DELETE EVENT?\n\nThis will permanently delete:\n• The event\n• All tickets\n• All waiting list entries\n• All affiliate programs\n\nThis action cannot be undone!")) return;
    
    try {
      await deleteAdminEvent({
        eventId,
        adminEmail: user?.emailAddresses[0]?.emailAddress || "",
      });
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event: " + (error as Error).message);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin: All Events Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage ALL events in the system. Delete any event and its associated data.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting an event will permanently remove all associated tickets, 
                waiting list entries, and affiliate programs. This action cannot be undone.
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{allEvents?.length || 0}</div>
              <p className="text-sm text-gray-600">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {allEvents?.filter(e => e.eventDate > Date.now()).length || 0}
              </div>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {allEvents?.filter(e => e.eventDate <= Date.now()).length || 0}
              </div>
              <p className="text-sm text-gray-600">Past Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {allEvents?.filter(e => e.is_cancelled).length || 0}
              </div>
              <p className="text-sm text-gray-600">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events by name, description, location, or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events ({filteredEvents.length})</CardTitle>
            <CardDescription>
              Click on an event to view details and management options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const isUpcoming = event.eventDate > Date.now();
                  const isCancelled = event.is_cancelled;
                  
                  return (
                    <div 
                      key={event._id} 
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedEvent === event._id 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-white hover:bg-gray-50'
                      } ${isCancelled ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedEvent(event._id === selectedEvent ? null : event._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{event.name}</h3>
                            {isCancelled && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                CANCELLED
                              </span>
                            )}
                            {!isCancelled && !isUpcoming && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                PAST
                              </span>
                            )}
                            {event.postedByAdmin && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                ADMIN POSTED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(event.eventDate)}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {event.isTicketed ? `$${event.price}` : `$${event.doorPrice || 0} at door`}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Capacity: {event.totalCapacity || event.totalTickets}
                            </div>
                          </div>

                          {/* Image status */}
                          {event.imageUrl && (
                            <div className="mt-2 flex items-center text-sm">
                              <Image className="w-4 h-4 mr-2 text-green-600" />
                              <span className="text-green-600">Has image</span>
                              {event.imageUrl.includes('example.com') && (
                                <span className="ml-2 text-red-600">(⚠️ Invalid URL)</span>
                              )}
                            </div>
                          )}
                          
                          {/* Expanded details when selected */}
                          {selectedEvent === event._id && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="font-semibold mb-2">Event Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Event ID:</span>
                                  <span className="ml-2 font-mono text-xs">{event._id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Organizer:</span>
                                  <span className="ml-2">{event.userId}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Created:</span>
                                  <span className="ml-2">{formatDate(event._creationTime)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Categories:</span>
                                  <span className="ml-2">
                                    {event.eventCategories?.join(", ") || event.eventType || "None"}
                                  </span>
                                </div>
                                {event.imageUrl && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500">Image URL:</span>
                                    <span className="ml-2 font-mono text-xs break-all">{event.imageUrl}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Admin Actions */}
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-semibold mb-2 text-red-600">⚠️ Admin Actions</h4>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event._id);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Event Permanently
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? "No events found matching your search" : "No events in the system"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}