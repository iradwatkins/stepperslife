"use client";

import React, { useState } from "react";
import DataTable from "@/components/dashboard/DataTable";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";
import {
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function EventsPage() {
  const [filter, setFilter] = useState("all");

  // Sample events data
  const events = [
    {
      id: 1,
      name: "Latin Dance Festival 2024",
      date: "2024-02-15",
      time: "8:00 PM",
      location: "Miami Beach Convention Center",
      category: "Festival",
      status: "active",
      ticketsSold: 245,
      capacity: 300,
      revenue: 12250,
      image: "/api/placeholder/100/100",
    },
    {
      id: 2,
      name: "Salsa Night at The Pearl",
      date: "2024-02-10",
      time: "9:00 PM",
      location: "The Pearl Lounge",
      category: "Social",
      status: "active",
      ticketsSold: 189,
      capacity: 200,
      revenue: 9450,
      image: "/api/placeholder/100/100",
    },
    {
      id: 3,
      name: "Bachata Workshop Series",
      date: "2024-02-08",
      time: "7:00 PM",
      location: "Dance Studio Miami",
      category: "Workshop",
      status: "completed",
      ticketsSold: 156,
      capacity: 160,
      revenue: 7800,
      image: "/api/placeholder/100/100",
    },
    {
      id: 4,
      name: "Competition Finals 2024",
      date: "2024-03-01",
      time: "6:00 PM",
      location: "Sports Arena",
      category: "Competition",
      status: "upcoming",
      ticketsSold: 89,
      capacity: 500,
      revenue: 8900,
      image: "/api/placeholder/100/100",
    },
    {
      id: 5,
      name: "Beginner Salsa Classes",
      date: "2024-02-05",
      time: "6:30 PM",
      location: "Community Center",
      category: "Class",
      status: "active",
      ticketsSold: 98,
      capacity: 100,
      revenue: 3920,
      image: "/api/placeholder/100/100",
    },
  ];

  const filteredEvents = filter === "all" ? events : events.filter(e => e.status === filter);

  const columns = [
    {
      key: "name",
      label: "Event",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.image}
            alt={value}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.time}</p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "ticketsSold",
      label: "Tickets",
      sortable: true,
      render: (value: number, row: any) => (
        <div>
          <p className="text-sm font-medium">
            {value} / {row.capacity}
          </p>
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              style={{ width: `${(value / row.capacity) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${value.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : value === "upcoming"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
            <EyeIcon className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate stats
  const totalEvents = filteredEvents.length;
  const totalTickets = filteredEvents.reduce((sum, e) => sum + e.ticketsSold, 0);
  const totalRevenue = filteredEvents.reduce((sum, e) => sum + e.revenue, 0);
  const avgCapacity = Math.round(
    filteredEvents.reduce((sum, e) => sum + (e.ticketsSold / e.capacity) * 100, 0) /
      filteredEvents.length
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Events Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track all your events in one place
          </p>
        </div>
        <Link
          href="/seller/new-event"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft-md transition-shadow mt-4 md:mt-0"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={totalEvents}
          icon={<CalendarIcon className="w-6 h-6" />}
          gradient="bg-gradient-fuchsia"
        />
        <StatsCard
          title="Tickets Sold"
          value={totalTickets}
          icon={<TicketIcon className="w-6 h-6" />}
          gradient="bg-gradient-cyan"
        />
        <StatsCard
          title="Total Revenue"
          value={totalRevenue}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          gradient="bg-gradient-orange"
          prefix="$"
        />
        <StatsCard
          title="Avg Capacity"
          value={avgCapacity}
          icon={<UsersIcon className="w-6 h-6" />}
          gradient="bg-gradient-lime"
          suffix="%"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-1 inline-flex">
        {["all", "active", "upcoming", "completed"].map((status) => (
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

      {/* Events Table */}
      <DataTable
        columns={columns}
        data={filteredEvents}
        searchKeys={["name", "location", "category"]}
        actions={
          <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export
          </button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.status === "upcoming").length}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Upcoming Events
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Events scheduled for the future
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-teal-500/10 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TicketIcon className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {Math.round(totalTickets / totalEvents)}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Avg Tickets/Event
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average tickets sold per event
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              ${Math.round(totalRevenue / totalEvents).toLocaleString()}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Avg Revenue/Event
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average revenue per event
          </p>
        </div>
      </div>
    </div>
  );
}