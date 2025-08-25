"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, DollarSign, Users, Plus, Trash2, Copy } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Admin emails that have access to this page
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Check if user is admin
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  // Convex queries and mutations
  const claimableEvents = useQuery(api.adminEvents.getClaimableEvents);
  const createAsAdmin = useMutation(api.adminEvents.createAsAdmin);
  const deleteAdminEvent = useMutation(api.adminEvents.deleteAdminEvent);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    eventDate: "",
    eventTime: "",
    doorPrice: 0,
    totalCapacity: 100,
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    redirect("/");
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      
      const result = await createAsAdmin({
        name: formData.name,
        description: formData.description,
        location: formData.location,
        eventDate: eventDateTime.getTime(),
        price: 0,
        totalTickets: formData.totalCapacity,
        adminEmail: session.user?.email || "",
        isTicketed: false,
        doorPrice: formData.doorPrice,
        totalCapacity: formData.totalCapacity,
        eventMode: "single",
      });

      // Reset form and show claim token
      setFormData({
        name: "",
        description: "",
        location: "",
        eventDate: "",
        eventTime: "",
        doorPrice: 0,
        totalCapacity: 100,
      });
      setShowCreateForm(false);
      
      // Copy claim token to clipboard
      navigator.clipboard.writeText(result.claimToken);
      setCopiedToken(result.claimToken);
      
      setTimeout(() => setCopiedToken(null), 5000);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await deleteAdminEvent({
        eventId,
        adminEmail: session.user?.email || "",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const copyClaimLink = (eventId: Id<"events">, claimToken: string) => {
    const link = `${window.location.origin}/events/${eventId}/claim?token=${claimToken}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(claimToken);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Event Management</h1>
          <p className="text-gray-600 mt-2">
            Post events on behalf of organizers and manage claim tokens
          </p>
        </div>

        {/* Success notification */}
        {copiedToken && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              ✅ Claim token copied to clipboard: <code className="bg-green-100 px-2 py-1 rounded">{copiedToken}</code>
            </p>
          </div>
        )}

        {/* Create Event Button/Form */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Post Event as Admin</CardTitle>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
              >
                {showCreateForm ? "Cancel" : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Event
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="eventTime">Event Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({...formData, eventTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doorPrice">Door Price ($)</Label>
                    <Input
                      id="doorPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.doorPrice}
                      onChange={(e) => setFormData({...formData, doorPrice: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="totalCapacity">Total Capacity</Label>
                    <Input
                      id="totalCapacity"
                      type="number"
                      min="1"
                      value={formData.totalCapacity}
                      onChange={(e) => setFormData({...formData, totalCapacity: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Create Event (Posted by Admin)
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Claimable Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Admin-Posted Events</CardTitle>
            <CardDescription>
              Events posted by admins that can be claimed by organizers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claimableEvents && claimableEvents.length > 0 ? (
              <div className="space-y-4">
                {claimableEvents.map((event) => (
                  <div key={event._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                        
                        <div className="mt-3 space-y-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          {event.doorPrice && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              ${event.doorPrice} at door
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Capacity: {event.totalCapacity || event.totalTickets}
                          </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium">
                            📝 Posted by Admin • {event.claimedBy ? "Claimed" : "Available to claim"}
                          </p>
                          {event.claimToken && !event.claimedBy && (
                            <p className="text-xs text-blue-600 mt-1">
                              Token: <code className="bg-blue-100 px-1 rounded">{event.claimToken}</code>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {!event.claimedBy && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyClaimLink(event._id, event.claimToken!)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEvent(event._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No admin-posted events available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}