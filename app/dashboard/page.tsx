"use client";

import React from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartCard from "@/components/dashboard/ChartCard";

import {
  CurrencyDollarIcon,
  UsersIcon,
  TicketIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function DashboardContent() {
  // Demo data for charts
  const salesChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Sales",
        data: [4500, 5200, 4800, 5900, 6700, 7200, 6800, 7500, 8200, 7900, 8500, 9200],
        fill: true,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderColor: "rgb(139, 92, 246)",
        tension: 0.4,
      },
      {
        label: "Revenue",
        data: [3200, 3800, 3500, 4200, 4900, 5300, 5000, 5600, 6100, 5800, 6300, 6800],
        fill: true,
        backgroundColor: "rgba(94, 234, 212, 0.1)",
        borderColor: "rgb(94, 234, 212)",
        tension: 0.4,
      },
    ],
  };

  const eventTypesData = {
    labels: ["Workshop", "Social Dance", "Competition", "Class", "Party"],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(94, 234, 212, 0.8)",
          "rgba(252, 211, 77, 0.8)",
          "rgba(248, 113, 113, 0.8)",
          "rgba(52, 211, 153, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const weeklyRevenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "This Week",
        data: [1200, 1900, 1500, 2200, 2800, 3500, 2900],
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderRadius: 8,
      },
      {
        label: "Last Week",
        data: [900, 1400, 1200, 1800, 2100, 2800, 2300],
        backgroundColor: "rgba(94, 234, 212, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  // Recent transactions data
  const recentTransactions = [
    {
      id: 1,
      event: "Salsa Night at The Pearl",
      buyer: "John Doe",
      amount: 100.0,
      status: "completed",
      time: "5 min ago",
    },
    {
      id: 2,
      event: "Bachata Workshop",
      buyer: "Jane Smith",
      amount: 75.0,
      status: "pending",
      time: "1 hour ago",
    },
    {
      id: 3,
      event: "Weekend Dance Social",
      buyer: "Mike Johnson",
      amount: 50.0,
      status: "completed",
      time: "2 hours ago",
    },
    {
      id: 4,
      event: "Latin Dance Festival",
      buyer: "Sarah Williams",
      amount: 150.0,
      status: "completed",
      time: "3 hours ago",
    },
    {
      id: 5,
      event: "Beginner Salsa Class",
      buyer: "Tom Brown",
      amount: 40.0,
      status: "processing",
      time: "5 hours ago",
    },
  ];

  // Top events data
  const topEvents = [
    { name: "Latin Dance Festival", tickets: 245, revenue: 12250 },
    { name: "Salsa Night at The Pearl", tickets: 189, revenue: 9450 },
    { name: "Bachata Workshop", tickets: 156, revenue: 7800 },
    { name: "Weekend Dance Social", tickets: 134, revenue: 6700 },
    { name: "Beginner Salsa Class", tickets: 98, revenue: 3920 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Download Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft-md transition-shadow">
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={84250}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          change={{ value: 23.5, type: "increase" }}
          gradient="bg-gradient-fuchsia"
          prefix="$"
          decimals={2}
        />
        <StatsCard
          title="Total Users"
          value={2543}
          icon={<UsersIcon className="w-6 h-6" />}
          change={{ value: 12.3, type: "increase" }}
          gradient="bg-gradient-cyan"
        />
        <StatsCard
          title="Tickets Sold"
          value={8924}
          icon={<TicketIcon className="w-6 h-6" />}
          change={{ value: 5.2, type: "decrease" }}
          gradient="bg-gradient-orange"
        />
        <StatsCard
          title="Active Events"
          value={47}
          icon={<CalendarIcon className="w-6 h-6" />}
          change={{ value: 8.7, type: "increase" }}
          gradient="bg-gradient-lime"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Sales & Revenue Overview"
            subtitle="Monthly performance for the current year"
            type="line"
            data={salesChartData}
            height="h-80"
          />
        </div>
        <div>
          <ChartCard
            title="Event Types"
            subtitle="Distribution by category"
            type="doughnut"
            data={eventTypesData}
            height="h-80"
          />
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekly Revenue Comparison"
          subtitle="This week vs last week performance"
          type="bar"
          data={weeklyRevenueData}
        />

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/seller/new-event"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl hover:shadow-soft-md transition-all"
            >
              <CalendarIcon className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Event
              </span>
            </Link>
            <Link
              href="/dashboard/tickets"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl hover:shadow-soft-md transition-all"
            >
              <TicketIcon className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Manage Tickets
              </span>
            </Link>
            <Link
              href="/dashboard/payments/payouts"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl hover:shadow-soft-md transition-all"
            >
              <BanknotesIcon className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Request Payout
              </span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-soft-md transition-all"
            >
              <ArrowTrendingUpIcon className="w-8 h-8 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                View Reports
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <Link
              href="/dashboard/payments/transactions"
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <ShoppingCartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.event}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.buyer} • {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${transaction.amount.toFixed(2)}
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Events
            </h3>
            <Link
              href="/dashboard/events"
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.tickets} tickets sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ${event.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}