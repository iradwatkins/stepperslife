"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Ticket,
  MoreVertical,
  Eye,
  Ban,
  Mail,
  CreditCard,
  Users,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function OrganizersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"revenue" | "events" | "tickets">("revenue");
  
  // Get all organizers with stats
  const organizers = useQuery(api.adminUsers.getAllOrganizers);
  
  // Filter and sort organizers
  const filteredOrganizers = organizers
    ?.filter(org => {
      const search = searchTerm.toLowerCase();
      return (
        org.name.toLowerCase().includes(search) ||
        org.email.toLowerCase().includes(search) ||
        org.userId.toLowerCase().includes(search)
      );
    })
    ?.sort((a, b) => {
      switch(sortBy) {
        case "revenue": return b.totalRevenue - a.totalRevenue;
        case "events": return b.totalEvents - a.totalEvents;
        case "tickets": return b.totalTicketsSold - a.totalTicketsSold;
        default: return 0;
      }
    }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate totals
  const totals = organizers?.reduce((acc, org) => ({
    revenue: acc.revenue + org.totalRevenue,
    tickets: acc.tickets + org.totalTicketsSold,
    events: acc.events + org.totalEvents,
    fees: acc.fees + org.platformFees,
  }), { revenue: 0, tickets: 0, events: 0, fees: 0 }) || { revenue: 0, tickets: 0, events: 0, fees: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Event Organizers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage event organizers and view their performance
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(totals.fees)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{totals.events}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold">{totals.tickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "revenue" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("revenue")}
              >
                Top Revenue
              </Button>
              <Button
                variant={sortBy === "events" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("events")}
              >
                Most Events
              </Button>
              <Button
                variant={sortBy === "tickets" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("tickets")}
              >
                Most Tickets
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Organizers List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizers ({filteredOrganizers.length})</CardTitle>
          <CardDescription>
            Event organizers with their performance metrics and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizers.map((organizer, index) => (
              <div 
                key={organizer.userId}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{organizer.name}</h3>
                        <p className="text-sm text-gray-600">{organizer.email}</p>
                      </div>
                      {organizer.hasPaymentSetup ? (
                        <Badge variant="default" className="ml-2">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Payment Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No Payment
                        </Badge>
                      )}
                      {organizer.affiliateProgramsCount > 0 && (
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {organizer.affiliateProgramsCount} Affiliates
                        </Badge>
                      )}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Revenue</p>
                        <p className="font-semibold">{formatCurrency(organizer.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Net Revenue</p>
                        <p className="font-semibold">{formatCurrency(organizer.netRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Events</p>
                        <p className="font-semibold">
                          {organizer.totalEvents} total
                          <span className="text-xs text-gray-500 ml-1">
                            ({organizer.upcomingEvents} upcoming)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tickets Sold</p>
                        <p className="font-semibold">
                          {organizer.totalTicketsSold}
                          <span className="text-xs text-gray-500 ml-1">
                            ({organizer.fillRate.toFixed(1)}% fill)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Ticket</p>
                        <p className="font-semibold">
                          {formatCurrency(organizer.averageTicketPrice)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Payment Methods */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Payment Methods:</span>
                      {organizer.paymentMethods.square && <Badge variant="outline" className="text-xs">Square</Badge>}
                      {organizer.paymentMethods.stripe && <Badge variant="outline" className="text-xs">Stripe</Badge>}
                      {organizer.paymentMethods.paypal && <Badge variant="outline" className="text-xs">PayPal</Badge>}
                      {organizer.paymentMethods.zelle && <Badge variant="outline" className="text-xs">Zelle</Badge>}
                      {organizer.paymentMethods.bank && <Badge variant="outline" className="text-xs">Bank</Badge>}
                      {!organizer.hasPaymentSetup && <span className="text-red-600">None configured</span>}
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-3 text-xs text-gray-500">
                      Member since {formatDate(organizer.accountCreated)} • 
                      Last event {formatDate(organizer.lastEventCreated)}
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/seller/${organizer.userId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Transactions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled className="text-red-600">
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Organizer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredOrganizers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No organizers found matching your search" : "No organizers yet"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}