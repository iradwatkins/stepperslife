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
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrganizerDashboard() {
  // Get user from Clerk auth
  const { userId } = await auth();
  
  console.log("🎯 Organizer Dashboard - Starting render");
  console.log("👤 Clerk userId:", userId);
  console.log("🔍 UserId type:", typeof userId);
  console.log("📏 UserId length:", userId?.length);
  
  // Fetch organizer stats
  let stats = {
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    totalEvents: 0,
    upcomingEvents: [],
    recentActivity: []
  };
  
  let debugInfo = {
    userId: userId,
    timestamp: new Date().toISOString(),
    error: null as any,
    rawResponse: null as any
  };
  
  if (userId) {
    try {
      console.log("📡 Fetching stats from Convex for organizerId:", userId);
      const fetchedStats = await fetchQuery(api.events.getOrganizerStats, { 
        organizerId: userId 
      });
      
      debugInfo.rawResponse = fetchedStats;
      
      if (fetchedStats) {
        stats = fetchedStats;
        console.log("✅ Successfully fetched stats:", {
          totalEvents: stats.totalEvents,
          activeEvents: stats.activeEvents,
          ticketsSold: stats.ticketsSold,
          totalRevenue: stats.totalRevenue,
          upcomingEventsCount: stats.upcomingEvents?.length || 0,
          recentActivityCount: stats.recentActivity?.length || 0
        });
      } else {
        console.warn("⚠️ fetchedStats is null or undefined");
      }
    } catch (error) {
      console.error("❌ Error fetching organizer stats:", error);
      debugInfo.error = error instanceof Error ? error.message : String(error);
    }
  } else {
    console.error("❌ No userId found in auth - user might not be logged in");
    debugInfo.error = "No userId from Clerk auth";
  }
  
  // Add debug mode check
  const isDebugMode = process.env.NODE_ENV === 'development';
  
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

      {/* Key Metrics - Real data from backend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{stats.ticketsSold}</p>
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
                <p className="text-2xl font-bold">{stats.activeEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Setup Alert */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event: any) => (
                  <div key={event._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                      <Link href={`/event/${event._id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
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
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.type === 'purchase' ? 'Table/Group Purchase' : 'Ticket Sold'}
                      </p>
                      <p className="text-xs text-gray-500">{activity.eventName}</p>
                      <p className="text-xs text-gray-400">{activity.ticketType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${(activity.price || 0).toFixed(2)}</p>
                      {activity.timestamp && (
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      )}
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