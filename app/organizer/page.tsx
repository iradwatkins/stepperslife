"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Calendar, 
  DollarSign, 
  Ticket, 
  Users,
  TrendingUp,
  Plus,
  Clock,
  AlertCircle
} from "lucide-react";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  
  // Get organizer's events
  const events = useQuery(api.events.getSellerEvents,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get analytics
  const analytics = useQuery(api.sellers.getAnalytics,
    user?.id ? { userId: user.id } : "skip"
  );

  const upcomingEvents = events?.filter(e => 
    e.eventDate > Date.now() && !e.is_cancelled
  ) || [];
  
  const totalRevenue = events?.reduce((sum, e) => sum + (e.metrics?.revenue || 0), 0) || 0;
  const totalTicketsSold = events?.reduce((sum, e) => sum + (e.metrics?.soldTickets || 0), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your events and track performance
          </p>
        </div>
        <Link href="/organizer/new-event">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Sold</p>
                <p className="text-2xl font-bold">{totalTicketsSold}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold">{events?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Setup Alert */}
      {analytics && !analytics.hasPaymentSetup && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                  Complete Your Payment Setup
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                  Configure your payment methods to start receiving payouts from ticket sales.
                </p>
                <Link href="/organizer/payment-settings">
                  <Button size="sm" className="mt-3">
                    Setup Payments
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{event.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          {event.metrics?.soldTickets || 0} sold
                        </span>
                      </div>
                    </div>
                    <Link href={`/organizer/events/${event._id}`}>
                      <Button size="sm" variant="outline">Manage</Button>
                    </Link>
                  </div>
                ))}
                {upcomingEvents.length > 5 && (
                  <Link href="/organizer/events" className="block text-center">
                    <Button variant="outline" className="w-full">View All Events</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming events</p>
                <Link href="/organizer/new-event">
                  <Button>Create Your First Event</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest ticket sales and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentSales && analytics.recentSales.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentSales.slice(0, 5).map((sale: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ticket Sale</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {sale.eventName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(sale.amount)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(sale.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/organizer/new-event">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </Link>
            <Link href="/organizer/analytics">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/organizer/earnings">
              <Button variant="outline" className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings
              </Button>
            </Link>
            <Link href="/organizer/customers">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}