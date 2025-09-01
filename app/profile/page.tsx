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
  // Simplified server-side rendered dashboard
  // This avoids WebSocket connection issues in production
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your tickets, view upcoming events, and update your preferences
        </p>
      </div>

      {/* Quick Stats - Static placeholder for now */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Events Attended</p>
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Events</CardTitle>
          <CardDescription>Events you're attending soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming events</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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