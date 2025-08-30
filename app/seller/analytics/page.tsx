"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, TrendingUp, Eye, ShoppingCart } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const { user } = useUser();
  
  // Get seller's events
  const sellerEvents = useQuery(api.events.getEventsByUser, 
    user?.emailAddresses[0]?.emailAddress ? { userId: user.emailAddresses[0].emailAddress } : "skip"
  );

  // Get all purchases for analytics
  const customerPurchases = useQuery(api.purchases.getSellerCustomers,
    user?.emailAddresses[0]?.emailAddress ? { sellerId: user.emailAddresses[0].emailAddress } : "skip"
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <button 
            onClick={() => window.location.href = "/auth/signin"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!sellerEvents || !customerPurchases) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Calculate analytics
  const totalRevenue = customerPurchases.reduce((sum: number, p: any) => sum + (p.totalAmount || p.amount || 0), 0);
  const totalTicketsSold = customerPurchases.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0);
  const uniqueCustomers = new Set(customerPurchases.map((p: any) => p.buyerEmail)).size;
  const avgTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
  
  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  const ticketsByMonth: Record<string, number> = {};
  
  customerPurchases.forEach((purchase: any) => {
    const date = new Date(purchase.purchasedAt || purchase._creationTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (purchase.totalAmount || purchase.amount || 0);
    ticketsByMonth[monthKey] = (ticketsByMonth[monthKey] || 0) + (purchase.quantity || 1);
  });

  // Sort months
  const sortedMonths = Object.keys(revenueByMonth).sort();
  const last6Months = sortedMonths.slice(-6);
  
  // Revenue by event
  const revenueByEvent: Record<string, { revenue: number; tickets: number; name: string }> = {};
  
  customerPurchases.forEach((purchase: any) => {
    const eventId = purchase.eventId;
    if (!revenueByEvent[eventId]) {
      revenueByEvent[eventId] = {
        revenue: 0,
        tickets: 0,
        name: purchase.eventName || "Unknown Event"
      };
    }
    revenueByEvent[eventId].revenue += purchase.totalAmount || purchase.amount || 0;
    revenueByEvent[eventId].tickets += purchase.quantity || 1;
  });

  // Chart data
  const revenueChartData = {
    labels: last6Months.map(month => {
      const [year, m] = month.split('-');
      return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: last6Months.map(month => revenueByMonth[month] || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const ticketsChartData = {
    labels: last6Months.map(month => {
      const [year, m] = month.split('-');
      return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Tickets Sold',
        data: last6Months.map(month => ticketsByMonth[month] || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const topEvents = Object.entries(revenueByEvent)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  const eventDistributionData = {
    labels: topEvents.map(([, event]) => event.name),
    datasets: [
      {
        data: topEvents.map(([, event]) => event.revenue),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(163, 163, 163, 0.8)',
          'rgba(217, 70, 239, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your event performance and revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +{((totalRevenue / (totalRevenue - 100)) * 100 - 100).toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTicketsSold}</div>
              <p className="text-xs text-muted-foreground">
                Across {sellerEvents.length} events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Avg ${(totalRevenue / uniqueCustomers).toFixed(2)}/customer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Ticket Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgTicketPrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per ticket
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={ticketsChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {topEvents.length > 0 ? (
                  <Doughnut data={eventDistributionData} options={doughnutOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No event data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEvents.map(([eventId, event]) => (
                  <div key={eventId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-500">{event.tickets} tickets sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${event.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {topEvents.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No events with sales yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}