"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Calendar, DollarSign, Mail, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/Spinner";

export default function CustomersPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get seller's events
  const sellerEvents = useQuery(api.events.getEventsByUser, 
    session?.user?.email ? { userId: session.user.email } : "skip"
  );

  // Get all purchases for seller's events
  const customerPurchases = useQuery(api.purchases.getSellerCustomers,
    session?.user?.email ? { sellerId: session.user.email } : "skip"
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Button onClick={() => window.location.href = "/auth/signin"}>
            Sign In
          </Button>
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

  // Process customer data
  const customersMap = new Map();
  
  customerPurchases?.forEach((purchase: any) => {
    const key = purchase.buyerEmail;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        email: purchase.buyerEmail,
        name: purchase.buyerName || "Unknown",
        totalSpent: 0,
        ticketCount: 0,
        eventCount: new Set(),
        lastPurchase: purchase.purchasedAt,
        purchases: []
      });
    }
    
    const customer = customersMap.get(key);
    customer.totalSpent += purchase.amount;
    customer.ticketCount += purchase.quantity || 1;
    customer.eventCount.add(purchase.eventId);
    customer.lastPurchase = Math.max(customer.lastPurchase, purchase.purchasedAt);
    customer.purchases.push(purchase);
  });

  const customers = Array.from(customersMap.values())
    .filter(customer => 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.lastPurchase - a.lastPurchase);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalTickets = customers.reduce((sum, c) => sum + c.ticketCount, 0);

  const exportToCSV = () => {
    const headers = ["Email", "Name", "Total Spent", "Tickets", "Events", "Last Purchase"];
    const rows = customers.map(c => [
      c.email,
      c.name,
      `$${c.totalSpent.toFixed(2)}`,
      c.ticketCount,
      c.eventCount.size,
      new Date(c.lastPurchase).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage and view your customer information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${customers.length > 0 ? (totalRevenue / customers.length).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Export */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No customers found matching your search" : "No customers yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          ${customer.totalSpent.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.ticketCount}</TableCell>
                      <TableCell>{customer.eventCount.size}</TableCell>
                      <TableCell>
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `mailto:${customer.email}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}