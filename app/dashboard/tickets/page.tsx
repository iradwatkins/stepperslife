"use client";

import React, { useState } from "react";
import DataTable from "@/components/dashboard/DataTable";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  TicketIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function TicketsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample tickets data
  const tickets = [
    {
      id: "TKT-001",
      code: "ABC123",
      event: "Latin Dance Festival 2024",
      eventDate: "2024-02-15",
      buyer: "John Doe",
      email: "john.doe@email.com",
      purchaseDate: "2024-01-20",
      price: 50.00,
      status: "valid",
      scanned: false,
      type: "General Admission",
    },
    {
      id: "TKT-002",
      code: "DEF456",
      event: "Salsa Night at The Pearl",
      eventDate: "2024-02-10",
      buyer: "Jane Smith",
      email: "jane.smith@email.com",
      purchaseDate: "2024-01-22",
      price: 75.00,
      status: "used",
      scanned: true,
      type: "VIP",
    },
    {
      id: "TKT-003",
      code: "GHI789",
      event: "Bachata Workshop Series",
      eventDate: "2024-02-08",
      buyer: "Mike Johnson",
      email: "mike.j@email.com",
      purchaseDate: "2024-01-25",
      price: 40.00,
      status: "expired",
      scanned: false,
      type: "General Admission",
    },
    {
      id: "TKT-004",
      code: "JKL012",
      event: "Competition Finals 2024",
      eventDate: "2024-03-01",
      buyer: "Sarah Williams",
      email: "sarah.w@email.com",
      purchaseDate: "2024-01-28",
      price: 100.00,
      status: "valid",
      scanned: false,
      type: "Premium",
    },
    {
      id: "TKT-005",
      code: "MNO345",
      event: "Beginner Salsa Classes",
      eventDate: "2024-02-05",
      buyer: "Tom Brown",
      email: "tom.b@email.com",
      purchaseDate: "2024-01-30",
      price: 30.00,
      status: "refunded",
      scanned: false,
      type: "General Admission",
    },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === "all" || ticket.status === filter;
    const matchesSearch = !searchQuery || 
      ticket.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns = [
    {
      key: "code",
      label: "Ticket Code",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <QrCodeIcon className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "event",
      label: "Event",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.eventDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: "buyer",
      label: "Buyer",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
          {value}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => {
        const statusConfig = {
          valid: {
            color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
            icon: <CheckCircleIcon className="w-4 h-4" />,
          },
          used: {
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
            icon: <CheckCircleIcon className="w-4 h-4" />,
          },
          expired: {
            color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
            icon: <ClockIcon className="w-4 h-4" />,
          },
          refunded: {
            color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
            icon: <XCircleIcon className="w-4 h-4" />,
          },
        };

        const config = statusConfig[value as keyof typeof statusConfig];

        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.icon}
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      key: "scanned",
      label: "Scanned",
      render: (value: boolean) => (
        <div className="flex items-center">
          {value ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          )}
        </div>
      ),
    },
  ];

  // Calculate stats
  const totalTickets = filteredTickets.length;
  const validTickets = filteredTickets.filter(t => t.status === "valid").length;
  const usedTickets = filteredTickets.filter(t => t.status === "used").length;
  const totalRevenue = filteredTickets
    .filter(t => t.status !== "refunded")
    .reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tickets Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage all ticket sales and scanning
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export Tickets
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft-md transition-shadow">
            Scan Tickets
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tickets"
          value={totalTickets}
          icon={<TicketIcon className="w-6 h-6" />}
          gradient="bg-gradient-fuchsia"
        />
        <StatsCard
          title="Valid Tickets"
          value={validTickets}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          gradient="bg-gradient-cyan"
        />
        <StatsCard
          title="Used Tickets"
          value={usedTickets}
          icon={<UserGroupIcon className="w-6 h-6" />}
          gradient="bg-gradient-orange"
        />
        <StatsCard
          title="Total Revenue"
          value={totalRevenue}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          gradient="bg-gradient-lime"
          prefix="$"
        />
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-1 inline-flex">
          {["all", "valid", "used", "expired", "refunded"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === status
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Tickets Table */}
      <DataTable
        columns={columns}
        data={filteredTickets}
        searchable={false}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6 hover:shadow-soft-2xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <QrCodeIcon className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Quick Scan</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Scan QR Code
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quickly validate tickets at the door
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6 hover:shadow-soft-2xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">Bulk Actions</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Batch Operations
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Process multiple tickets at once
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6 hover:shadow-soft-2xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Verify</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Verify Ticket
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check ticket validity by code
          </p>
        </div>
      </div>
    </div>
  );
}