"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Ticket, 
  Calendar, 
  Heart, 
  Clock, 
  CreditCard,
  Settings,
  TrendingUp,
  MapPin
} from "lucide-react";

export default function ProfileDashboard() {
  const { user } = useAuth();
  
  // Get user's tickets
  const tickets = useQuery(api.events.getUserTickets, 
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get user's waiting list entries
  const waitingList = useQuery(api.events.getUserWaitingList,
    user?.id ? { userId: user.id } : "skip"
  );

  const upcomingTickets = tickets?.filter(t => 
    t.event && t.event.eventDate > Date.now() && t.status === "valid"
  ) || [];
  
  const pastEvents = tickets?.filter(t => 
    t.event && t.event.eventDate <= Date.now()
  ) || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your tickets, view upcoming events, and update your preferences
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
                <p className="text-2xl font-bold">{upcomingTickets.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Events Attended</p>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Waiting Lists</p>
                <p className="text-2xl font-bold">{waitingList?.length || 0}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Events</CardTitle>
            <CardDescription>Events you're attending soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTickets.slice(0, 3).map((ticket) => (
                <div key={ticket._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <h3 className="font-semibold">{ticket.event?.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(ticket.event?.eventDate || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {ticket.event?.location}
                      </span>
                    </div>
                  </div>
                  <Link href={`/tickets/${ticket._id}`}>
                    <Button size="sm">View Ticket</Button>
                  </Link>
                </div>
              ))}
            </div>
            {upcomingTickets.length > 3 && (
              <div className="mt-4 text-center">
                <Link href="/profile/tickets">
                  <Button variant="outline">View All Tickets</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/events" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Button>
            </Link>
            <Link href="/profile/payment-methods" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Payment Methods
              </Button>
            </Link>
            <Link href="/profile/settings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Become an Event Organizer</CardTitle>
            <CardDescription>Start selling tickets for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Join thousands of organizers using our platform to manage and sell tickets for their events.
            </p>
            <Link href="/organizer/onboarding">
              <Button className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Organizing Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}