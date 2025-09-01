"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function TicketsManagementPage() {
  const recentPurchases = useQuery(api.adminStats.getRecentPurchases, { limit: 50 });
  const stats = useQuery(api.adminStats.getPlatformStats);

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "valid":
        return <Badge variant="default">Valid</Badge>;
      case "used":
        return <Badge variant="secondary">Used</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ticket Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all tickets across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="text-2xl font-bold">{stats?.totalTicketsSold || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold">{stats?.refundedTickets || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.averageTicketPrice || 0)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ticket Purchases</CardTitle>
          <CardDescription>Latest 50 ticket transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPurchases?.map((ticket) => (
              <div key={ticket._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm">{ticket.eventName}</p>
                  <p className="text-xs text-gray-600">
                    {ticket.userName} • {ticket.userEmail}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Purchased {formatDate(ticket.purchasedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(ticket.amount || 0)}</p>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))}
            {(!recentPurchases || recentPurchases.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No tickets sold yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}