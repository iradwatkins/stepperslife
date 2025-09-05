"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ScanLine, 
  Calendar, 
  MapPin,
  Users,
  Shield,
  Clock,
  ChevronRight
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

export default function StaffPortal() {
  const { user } = useUser();
  
  // Get staff events for the current user
  const staffEvents = useQuery(
    api.eventStaff.getUserStaffEvents,
    user?.id ? { userId: user.id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'manager':
        return 'default';
      case 'scanner':
        return 'secondary';
      case 'organizer':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'manager':
        return Shield;
      case 'scanner':
        return ScanLine;
      default:
        return Users;
    }
  };

  if (!staffEvents || staffEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-16 pb-16">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Staff Assignments</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't been assigned as staff for any events yet.
                </p>
                <p className="text-sm text-gray-500">
                  Event organizers can add you as staff to help manage their events.
                </p>
                <Link href="/events" className="mt-6 inline-block">
                  <Button>Browse Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Separate upcoming and past events
  const now = Date.now();
  const upcomingEvents = staffEvents.filter(event => event.eventDate > now);
  const pastEvents = staffEvents.filter(event => event.eventDate <= now);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Staff Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access scanner tools and manage events where you're assigned as staff
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {upcomingEvents.length}
                </span>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upcoming events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Your Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(staffEvents.map(e => e.role))).map(role => (
                  <Badge key={role} variant={getRoleBadgeColor(role)}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Across all events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Events Worked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {pastEvents.length}
                </span>
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Completed events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events where you're assigned as staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const RoleIcon = getRoleIcon(event.role);
                  return (
                    <div
                      key={event.eventId}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.eventName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDate(event.eventDate)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {event.location}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant={getRoleBadgeColor(event.role)}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {event.role.charAt(0).toUpperCase() + event.role.slice(1)}
                            </Badge>
                            {event.permissions && event.permissions.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {event.permissions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {(event.role === 'scanner' || event.role === 'manager' || event.role === 'organizer') && (
                            <Link href={event.scannerUrl}>
                              <Button className="w-full">
                                <ScanLine className="h-4 w-4 mr-2" />
                                Open Scanner
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                          <p className="text-xs text-gray-500 text-center">
                            Added by {event.addedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>
                Your event history as staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastEvents.map((event) => (
                  <div
                    key={event.eventId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()} • {event.role}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Staff Guidelines</CardTitle>
            <CardDescription>Important information for event staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <ScanLine className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Scanner Role</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check in attendees by scanning QR codes or entering backup codes
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Manager Role</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access to scanner, view reports, and manage event operations
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Communication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contact the event organizer for any questions or issues during the event
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}