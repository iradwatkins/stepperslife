"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function EventsManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
  
  // Get all events
  const allEvents = useQuery(api.adminEvents.getAllEventsForAdmin);
  const deleteEvent = useMutation(api.adminEvents.deleteAdminEvent);
  
  // Filter events based on search and status
  const filteredEvents = allEvents?.filter(event => {
    const matchesSearch = searchTerm === "" || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = Date.now();
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "upcoming" && event.eventDate > now && !event.is_cancelled) ||
      (statusFilter === "past" && event.eventDate <= now && !event.is_cancelled) ||
      (statusFilter === "cancelled" && event.is_cancelled);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (!confirm("Are you sure you want to permanently delete this event and all associated data?")) {
      return;
    }
    
    try {
      await deleteEvent({
        eventId,
        adminEmail: user?.emailAddresses[0]?.emailAddress || "",
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
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

  const getEventStatus = (event: any) => {
    const now = Date.now();
    if (event.is_cancelled) return { label: "Cancelled", color: "destructive" };
    if (event.eventDate > now) return { label: "Upcoming", color: "default" };
    return { label: "Past", color: "secondary" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Events Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all events on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{allEvents?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {allEvents?.filter(e => e.eventDate > Date.now() && !e.is_cancelled).length || 0}
            </div>
            <p className="text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {allEvents?.filter(e => e.eventDate <= Date.now() && !e.is_cancelled).length || 0}
            </div>
            <p className="text-sm text-gray-600">Past</p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={statusFilter === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("past")}
              >
                Past
              </Button>
              <Button
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("cancelled")}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
          <CardDescription>
            Click on an event to view details or use the menu for quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              
              return (
                <div 
                  key={event._id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <Badge variant={status.color as any}>{status.label}</Badge>
                        {event.postedByAdmin && (
                          <Badge variant="outline">Admin Posted</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>
                            {event.isTicketed ? `$${event.price}` : `$${event.doorPrice || 0} at door`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Cap: {event.totalCapacity || event.totalTickets}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        <span>Organizer: {event.userId}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {formatDate(event._creationTime)}</span>
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/event/${event._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Event
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}