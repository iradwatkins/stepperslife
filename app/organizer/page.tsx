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
  // Simplified server-side rendered dashboard
  // This avoids WebSocket connection issues in production
  
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

      {/* Key Metrics - Static placeholder for now */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">$0.00</p>
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
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0</p>
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
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming events</p>
              <Link href="/organizer/new-event">
                <Button>Create Your First Event</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest ticket sales and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
            </div>
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