"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, QrCode, Download, Search, Filter, Calendar, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

interface TicketsClientProps {
  organizerId: string;
}

export default function TicketsClient({ organizerId }: TicketsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Tickets");
  
  // Fetch tickets data using Convex
  const ticketData = useQuery(api.tickets.getOrganizerTickets, { 
    organizerId 
  });
  
  const stats = ticketData?.stats || {
    totalTickets: 0,
    totalRevenue: 0,
    checkedIn: 0,
    available: 0
  };
  
  const tickets = ticketData?.tickets || [];
  
  // Filter tickets based on search and status
  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = searchTerm === "" || 
      ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.purchaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.purchaseEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Tickets" ||
      (statusFilter === "Valid" && ticket.status === "valid") ||
      (statusFilter === "Used" && ticket.status === "used") ||
      (statusFilter === "Cancelled" && ticket.status === "cancelled");
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all ticket sales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan Tickets
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sold</p>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Checked In</p>
                <p className="text-2xl font-bold">{stats.checkedIn}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ticket ID, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-lg">
              <option>All Events</option>
              <option>Upcoming Events</option>
              <option>Past Events</option>
            </select>
            <select 
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Tickets</option>
              <option>Valid</option>
              <option>Used</option>
              <option>Cancelled</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ticket Sales</CardTitle>
          <CardDescription>All tickets sold across your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ticket ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {tickets.length === 0 
                        ? "No tickets sold yet. Create an event to start selling tickets."
                        : "No tickets match your search criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.slice(0, 10).map((ticket: any) => (
                    <tr key={ticket._id || ticket.ticketId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{ticket.ticketId?.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{ticket.eventName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">{ticket.purchaseName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{ticket.purchaseEmail || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{ticket.ticketType || 'General'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">${(ticket.price || 0).toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            ticket.status === 'used' ? 'secondary' : 
                            ticket.status === 'valid' ? 'default' : 
                            'destructive'
                          }
                        >
                          {ticket.status || 'valid'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}