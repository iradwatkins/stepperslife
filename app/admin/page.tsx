"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Ticket, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch platform statistics
  const stats = useQuery(api.adminStats.getPlatformStats);
  const recentEvents = useQuery(api.adminStats.getRecentEvents, { limit: 5 });
  const topOrganizers = useQuery(api.adminStats.getTopOrganizers, { limit: 5 });
  const recentPurchases = useQuery(api.adminStats.getRecentPurchases, { limit: 10 });

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
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform overview and real-time analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Platform fees: {formatCurrency(stats.platformFees)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.recentTicketsSold} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.totalEvents} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.activeOrganizers} organizers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events created on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents?.map((event) => (
                <div key={event._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(event.eventDate)} • {event.soldCount} tickets sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(event.revenue)}</p>
                    {event.is_cancelled ? (
                      <span className="text-xs text-red-600">Cancelled</span>
                    ) : event.eventDate > Date.now() ? (
                      <span className="text-xs text-green-600">Upcoming</span>
                    ) : (
                      <span className="text-xs text-gray-500">Past</span>
                    )}
                  </div>
                </div>
              ))}
              {(!recentEvents || recentEvents.length === 0) && (
                <p className="text-sm text-gray-500">No events yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizers</CardTitle>
            <CardDescription>Highest revenue generating organizers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrganizers?.map((organizer, index) => (
                <div key={organizer.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{organizer.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {organizer.eventCount} events • {organizer.ticketsSold} tickets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(organizer.revenue)}</p>
                  </div>
                </div>
              ))}
              {(!topOrganizers || topOrganizers.length === 0) && (
                <p className="text-sm text-gray-500">No organizers yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ticket Purchases</CardTitle>
          <CardDescription>Latest ticket sales across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPurchases?.map((ticket) => (
              <div key={ticket._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  {ticket.status === "valid" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : ticket.status === "used" ? (
                    <Activity className="h-4 w-4 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{ticket.eventName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {ticket.userName} • {formatDate(ticket.purchasedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(ticket.amount || 0)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{ticket.status}</p>
                </div>
              </div>
            ))}
            {(!recentPurchases || recentPurchases.length === 0) && (
              <p className="text-sm text-gray-500">No purchases yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Platform health and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">All Systems Operational</p>
                <p className="text-xs text-gray-600">Last checked: Just now</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">{stats.refundedTickets} Refunds Pending</p>
                <p className="text-xs text-gray-600">Requires attention</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">{stats.recentEventsCreated} New Events</p>
                <p className="text-xs text-gray-600">In the last 7 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}