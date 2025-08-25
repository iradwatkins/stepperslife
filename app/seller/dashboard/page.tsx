"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  Calendar,
  Users,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Wallet,
  Send,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockData = {
  overview: {
    availableBalance: 1842.50,
    pendingBalance: 456.30,
    processingBalance: 234.20,
    totalEarnings: 12450.00,
    totalPayouts: 10151.00,
    monthlyEarnings: 2842.50,
    monthlyChange: 23.5,
    weeklyEarnings: 684.30,
    weeklyChange: -5.2,
  },
  paymentMethods: {
    preferred: "square",
    connected: [
      { provider: "square", status: "active", lastPayout: "2024-01-20", acceptsCashApp: true },
      { provider: "stripe", status: "pending_verification", lastPayout: null },
      { provider: "zelle", status: "active", lastPayout: "2024-01-18" },
    ],
  },
  recentTransactions: [
    {
      id: "1",
      date: "2024-01-22",
      eventName: "Salsa Night at The Pearl",
      buyerEmail: "john.doe@email.com",
      amount: 100.00,
      ticketCount: 2,
      provider: "square",
      platformFee: 3.00,
      providerFee: 2.70,
      sellerPayout: 94.30,
      status: "completed",
      paymentMethod: "CashApp",
    },
    {
      id: "2",
      date: "2024-01-21",
      eventName: "Bachata Workshop",
      buyerEmail: "jane.smith@email.com",
      amount: 75.00,
      ticketCount: 1,
      provider: "stripe",
      platformFee: 1.50,
      providerFee: 2.48,
      sellerPayout: 71.02,
      status: "pending",
      paymentMethod: "Card",
    },
    {
      id: "3",
      date: "2024-01-20",
      eventName: "Weekend Dance Social",
      buyerEmail: "mike.jones@email.com",
      amount: 50.00,
      ticketCount: 1,
      provider: "zelle",
      platformFee: 1.50,
      providerFee: 0,
      sellerPayout: 48.50,
      status: "processing",
      paymentMethod: "Bank Transfer",
    },
  ],
  payoutHistory: [
    {
      id: "p1",
      date: "2024-01-15",
      amount: 1250.00,
      method: "square",
      bankAccount: "****1234",
      status: "completed",
    },
    {
      id: "p2",
      date: "2024-01-08",
      amount: 890.50,
      method: "stripe",
      bankAccount: "****5678",
      status: "completed",
    },
  ],
  upcomingEvents: [
    {
      id: "e1",
      name: "Latin Dance Festival",
      date: "2024-02-01",
      ticketsSold: 45,
      totalCapacity: 100,
      revenue: 2250.00,
    },
    {
      id: "e2",
      name: "Beginner Salsa Class",
      date: "2024-01-28",
      ticketsSold: 12,
      totalCapacity: 20,
      revenue: 180.00,
    },
  ],
};

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "square":
        return <CreditCard className="w-4 h-4" />;
      case "stripe":
        return <CreditCard className="w-4 h-4" />;
      case "paypal":
        return <Wallet className="w-4 h-4" />;
      case "zelle":
        return <Send className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "square":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "stripe":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "paypal":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "zelle":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleRequestPayout = () => {
    setIsRequestingPayout(true);
    // Simulate payout request
    setTimeout(() => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and will be processed within 1-2 business days.",
      });
      setIsRequestingPayout(false);
    }, 2000);
  };

  const handleExportTransactions = () => {
    toast({
      title: "Exporting Transactions",
      description: "Your transaction history is being prepared for download.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your earnings, manage payouts, and monitor your events
          </p>
        </div>

        {/* Payment Method Status Bar */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>
                Your preferred payment method is <strong>Square (accepts CashApp)</strong>
              </span>
              <Link href="/seller/payment-settings">
                <Button variant="link" size="sm" className="text-blue-600">
                  Manage Payment Methods
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.overview.availableBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Ready for payout</p>
              <Button 
                size="sm" 
                className="mt-3 w-full bg-green-600 hover:bg-green-700"
                onClick={handleRequestPayout}
                disabled={isRequestingPayout || mockData.overview.availableBalance < 10}
              >
                Request Payout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockData.overview.pendingBalance + mockData.overview.processingBalance).toFixed(2)}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pending</span>
                  <span>${mockData.overview.pendingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Processing</span>
                  <span>${mockData.overview.processingBalance.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.overview.monthlyEarnings.toFixed(2)}</div>
              <div className="flex items-center text-xs">
                {mockData.overview.monthlyChange > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{mockData.overview.monthlyChange}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">{mockData.overview.monthlyChange}%</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.overview.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ${mockData.overview.totalPayouts.toFixed(2)} withdrawn
              </p>
              <Progress 
                value={(mockData.overview.totalPayouts / mockData.overview.totalEarnings) * 100} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Connected Payment Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connected Payment Methods</CardTitle>
            <CardDescription>
              Manage how you accept payments from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockData.paymentMethods.connected.map((method) => (
                <div
                  key={method.provider}
                  className={`p-4 rounded-lg border-2 ${
                    mockData.paymentMethods.preferred === method.provider
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getProviderColor(method.provider)}`}>
                        {getProviderIcon(method.provider)}
                      </div>
                      <div>
                        <div className="font-medium capitalize flex items-center gap-2">
                          {method.provider}
                          {method.provider === "square" && method.acceptsCashApp && (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                              <Smartphone className="w-3 h-3 mr-1" />
                              CashApp
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.status === "active" ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {mockData.paymentMethods.preferred === method.provider && (
                      <Badge className="bg-purple-600">Preferred</Badge>
                    )}
                  </div>
                  {method.lastPayout && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last payout: {new Date(method.lastPayout).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payout History</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      All your ticket sales and payment details
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Event</th>
                        <th className="text-center py-3 px-2">Tickets</th>
                        <th className="text-left py-3 px-2">Payment Method</th>
                        <th className="text-right py-3 px-2">Amount</th>
                        <th className="text-right py-3 px-2">Fees</th>
                        <th className="text-right py-3 px-2">Your Earnings</th>
                        <th className="text-center py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockData.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-sm">{tx.eventName}</p>
                              <p className="text-xs text-gray-500">{tx.buyerEmail}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant="secondary">{tx.ticketCount}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getProviderColor(tx.provider)}>
                                {tx.paymentMethod}
                              </Badge>
                            </div>
                          </td>
                          <td className="text-right py-3 px-2 font-medium">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-2">
                            <div className="text-sm">
                              <div className="text-red-600">
                                -${(tx.platformFee + tx.providerFee).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                $1.50/ticket + provider
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-2">
                            <span className="font-medium text-green-600">
                              ${tx.sellerPayout.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge
                              variant={
                                tx.status === "completed"
                                  ? "default"
                                  : tx.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                tx.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : tx.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Track all your withdrawn funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">${payout.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(payout.date).toLocaleDateString()} • {payout.method} • {payout.bankAccount}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Monitor ticket sales for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-500">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${event.revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tickets Sold</span>
                          <span className="font-medium">
                            {event.ticketsSold} / {event.totalCapacity}
                          </span>
                        </div>
                        <Progress value={(event.ticketsSold / event.totalCapacity) * 100} className="h-2" />
                      </div>
                      <Link href={`/seller/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          View Event Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm">Square/CashApp</span>
                      </div>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-sm">Stripe</span>
                      </div>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">Zelle</span>
                      </div>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Analysis</CardTitle>
                  <CardDescription>Platform ($1.50/ticket) and provider fees this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Fees ($1.50/ticket)</span>
                      <span className="font-medium text-red-600">-$127.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Provider Fees</span>
                      <span className="font-medium text-red-600">-$72.44</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Fees</span>
                        <span className="font-bold text-red-600">-$157.72</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        5.5% average fee rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}