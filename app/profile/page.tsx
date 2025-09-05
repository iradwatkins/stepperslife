"use client";

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
  MapPin,
  QrCode,
  Link2,
  Users,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

export default function ProfileDashboard() {
  const { user } = useUser();
  const { 
    isStaff, 
    isAffiliate, 
    isOrganizer, 
    staffEvents, 
    affiliatePrograms,
    roles 
  } = useUserRole();
  
  return (
    <div className="space-y-6">
      {/* Welcome Header with Role Badges */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <div className="flex gap-2">
            {isOrganizer && <Badge variant="default">Organizer</Badge>}
            {isStaff && <Badge variant="secondary">Staff</Badge>}
            {isAffiliate && <Badge variant="outline">Affiliate</Badge>}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
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
              <Calendar className="h-8 w-8 text-cyan-600" />
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

      {/* Staff Scanner Access Section */}
      {isStaff && staffEvents && staffEvents.length > 0 && (
        <Card className="border-cyan-200 bg-cyan-50/50 dark:bg-cyan-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-cyan-600" />
              Events You Can Scan
            </CardTitle>
            <CardDescription>Quick access to ticket scanners for events where you're staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffEvents.slice(0, 3).map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <p className="font-medium">{event.eventName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString()} • {event.location}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {event.role === 'manager' ? 'Manager' : 'Scanner'}
                    </Badge>
                  </div>
                  <Link href={event.scannerUrl}>
                    <Button size="sm" variant="default">
                      <QrCode className="h-4 w-4 mr-1" />
                      Open Scanner
                    </Button>
                  </Link>
                </div>
              ))}
              {staffEvents.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{staffEvents.length - 3} more events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affiliate Links Section */}
      {isAffiliate && affiliatePrograms && affiliatePrograms.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-600" />
              Your Affiliate Events
            </CardTitle>
            <CardDescription>Events you can promote and earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {affiliatePrograms.slice(0, 3).map((program) => (
                <div key={program._id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{program.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(program.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        ${program.commissionPerTicket}/ticket
                      </p>
                      <p className="text-xs text-gray-500">
                        {program.totalSold} sold
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(program.referralLink);
                        // You might want to add a toast here
                      }}
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                    <Badge variant="secondary">
                      Code: {program.referralCode}
                    </Badge>
                  </div>
                  {program.totalEarned > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Total earned: ${program.totalEarned.toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
              {affiliatePrograms.length > 3 && (
                <Link href="/profile/affiliates">
                  <Button variant="ghost" className="w-full">
                    View all {affiliatePrograms.length} affiliate programs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
            <Link href="/profile/tickets" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Ticket className="h-4 w-4 mr-2" />
                My Tickets
              </Button>
            </Link>
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
            {isOrganizer && (
              <Link href="/organizer" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Organizer Dashboard
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {!isOrganizer ? (
          <Card>
            <CardHeader>
              <CardTitle>Become an Event Organizer</CardTitle>
              <CardDescription>Start selling tickets for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Join thousands of organizers using our platform to manage and sell tickets for their events.
              </p>
              <Link href="/organizer/new-event">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Role Summary</CardTitle>
              <CardDescription>Platform roles and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isOrganizer && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Event Organizer</span>
                    <Link href="/organizer">
                      <Button size="sm" variant="ghost">
                        View Dashboard
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
                {isStaff && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Staff Member</span>
                    <Badge variant="secondary">{staffEvents?.length || 0} events</Badge>
                  </div>
                )}
                {isAffiliate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Affiliate Partner</span>
                    <Badge variant="outline">{affiliatePrograms?.length || 0} programs</Badge>
                  </div>
                )}
              </div>
              {(isStaff || isAffiliate) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {isStaff && isAffiliate ? 'You have multiple roles on the platform' : 
                     isStaff ? 'You can scan tickets for assigned events' :
                     'You earn commissions on ticket sales'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}