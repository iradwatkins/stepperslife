"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Calendar } from "lucide-react";

export default function FinanceOverviewPage() {
  const stats = useQuery(api.adminStats.getPlatformStats);
  const topOrganizers = useQuery(api.adminStats.getTopOrganizers, { limit: 10 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform revenue, fees, and financial metrics
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <p className="text-xs text-gray-500">All-time gross revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.platformFees || 0)}</p>
                <p className="text-xs text-gray-500">$1.50 per ticket</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Organizer Payouts</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((stats?.totalRevenue || 0) - (stats?.platformFees || 0))}
                </p>
                <p className="text-xs text-gray-500">Net to organizers</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Ticket Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.averageTicketPrice || 0)}
                </p>
                <p className="text-xs text-gray-500">Platform average</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
          <CardDescription>Platform fees collected per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {stats?.dailySalesChart && stats.dailySalesChart.length > 0 ? (
              <div className="w-full">
                <div className="flex justify-between items-end h-48">
                  {stats.dailySalesChart.map((day, index) => (
                    <div key={day.date} className="flex-1 mx-1">
                      <div 
                        className="bg-purple-600 rounded-t"
                        style={{ 
                          height: `${(day.revenue / Math.max(...stats.dailySalesChart.map(d => d.revenue))) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`${day.date}: ${formatCurrency(day.revenue)}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last 30 days • Hover for details
                </div>
              </div>
            ) : (
              "No revenue data available yet"
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Generators */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Generating Organizers</CardTitle>
          <CardDescription>Organizers bringing the most revenue to the platform</CardDescription>
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
                    <p className="font-medium">{organizer.name}</p>
                    <p className="text-xs text-gray-600">
                      {organizer.eventCount} events • {organizer.ticketsSold} tickets sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(organizer.revenue)}</p>
                  <p className="text-xs text-gray-600">
                    Platform fees: {formatCurrency(organizer.ticketsSold * 1.50)}
                  </p>
                </div>
              </div>
            ))}
            {(!topOrganizers || topOrganizers.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No revenue data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}