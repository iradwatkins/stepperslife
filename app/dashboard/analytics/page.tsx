"use client";

import React, { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartCard from "@/components/dashboard/ChartCard";
import DataTable from "@/components/dashboard/DataTable";
import {
  CurrencyDollarIcon,
  UsersIcon,
  TicketIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  // Sample data for different time ranges
  const getDataForTimeRange = (range: string) => {
    const labels = {
      "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "30d": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "90d": ["Month 1", "Month 2", "Month 3"],
      "1y": ["Q1", "Q2", "Q3", "Q4"],
    }[range] || [];

    const multiplier = { "7d": 1, "30d": 4, "90d": 12, "1y": 48 }[range] || 1;

    return {
      revenue: labels.map(() => Math.floor(Math.random() * 5000 * multiplier) + 2000),
      users: labels.map(() => Math.floor(Math.random() * 500 * multiplier) + 100),
      tickets: labels.map(() => Math.floor(Math.random() * 1000 * multiplier) + 200),
      events: labels.map(() => Math.floor(Math.random() * 50 * multiplier) + 10),
    };
  };

  const data = getDataForTimeRange(timeRange);
  const labels = {
    "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "30d": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "90d": ["Month 1", "Month 2", "Month 3"],
    "1y": ["Q1", "Q2", "Q3", "Q4"],
  }[timeRange] || [];

  // Revenue chart data
  const revenueChartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: data.revenue,
        fill: true,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderColor: "rgb(139, 92, 246)",
        tension: 0.4,
      },
    ],
  };

  // User growth chart data
  const userGrowthData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: data.users,
        backgroundColor: "rgba(94, 234, 212, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  // Event performance data
  const eventPerformanceData = {
    labels: ["Workshop", "Social", "Competition", "Class", "Party"],
    datasets: [
      {
        label: "Attendance Rate",
        data: [85, 72, 90, 68, 95],
        backgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(94, 234, 212, 0.8)",
          "rgba(252, 211, 77, 0.8)",
          "rgba(248, 113, 113, 0.8)",
          "rgba(52, 211, 153, 0.8)",
        ],
        borderRadius: 8,
      },
    ],
  };

  // Geographic distribution data
  const geographicData = {
    labels: ["North America", "Europe", "Asia", "South America", "Other"],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
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

  // Top performers table data
  const topPerformers = [
    {
      name: "Latin Dance Festival",
      category: "Festival",
      revenue: 45250,
      tickets: 892,
      growth: 23.5,
    },
    {
      name: "Salsa Night Weekly",
      category: "Social",
      revenue: 32100,
      tickets: 642,
      growth: 15.3,
    },
    {
      name: "Bachata Workshop Series",
      category: "Workshop",
      revenue: 28750,
      tickets: 575,
      growth: -5.2,
    },
    {
      name: "Competition Finals",
      category: "Competition",
      revenue: 25600,
      tickets: 256,
      growth: 42.1,
    },
    {
      name: "Beginner Classes",
      category: "Class",
      revenue: 18900,
      tickets: 378,
      growth: 8.7,
    },
  ];

  const columns = [
    { key: "name", label: "Event Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    { key: "tickets", label: "Tickets", sortable: true },
    {
      key: "growth",
      label: "Growth",
      sortable: true,
      render: (value: number) => (
        <span
          className={`inline-flex items-center ${
            value > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {value > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1 rotate-180" />
          )}
          {Math.abs(value)}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your platform performance and gain insights
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft-md transition-shadow">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={data.revenue.reduce((a, b) => a + b, 0)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          change={{ value: 18.2, type: "increase" }}
          gradient="bg-gradient-fuchsia"
          prefix="$"
        />
        <StatsCard
          title="Active Users"
          value={data.users.reduce((a, b) => a + b, 0)}
          icon={<UsersIcon className="w-6 h-6" />}
          change={{ value: 12.5, type: "increase" }}
          gradient="bg-gradient-cyan"
        />
        <StatsCard
          title="Tickets Sold"
          value={data.tickets.reduce((a, b) => a + b, 0)}
          icon={<TicketIcon className="w-6 h-6" />}
          change={{ value: 8.3, type: "increase" }}
          gradient="bg-gradient-orange"
        />
        <StatsCard
          title="Conversion Rate"
          value="4.2"
          icon={<ChartBarIcon className="w-6 h-6" />}
          change={{ value: 2.1, type: "decrease" }}
          gradient="bg-gradient-lime"
          suffix="%"
        />
      </div>

      {/* Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            subtitle={`Revenue performance over the selected period`}
            type="line"
            data={revenueChartData}
            height="h-80"
          />
        </div>
        <div>
          <ChartCard
            title="Geographic Distribution"
            subtitle="Users by region"
            type="doughnut"
            data={geographicData}
            height="h-80"
          />
        </div>
      </div>

      {/* User Growth and Event Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Growth"
          subtitle="New user registrations"
          type="bar"
          data={userGrowthData}
        />
        <ChartCard
          title="Event Performance"
          subtitle="Average attendance rate by category"
          type="bar"
          data={eventPerformanceData}
        />
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-soft-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">3.2h</span>
          </div>
          <h4 className="font-semibold mb-1">Average Session Duration</h4>
          <p className="text-sm opacity-90">
            Users spend more time on event pages
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl shadow-soft-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <GlobeAltIcon className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">68%</span>
          </div>
          <h4 className="font-semibold mb-1">Mobile Traffic</h4>
          <p className="text-sm opacity-90">
            Majority of users access via mobile
          </p>
        </div>

        <div div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-soft-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <CalendarIcon className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">92%</span>
          </div>
          <h4 className="font-semibold mb-1">Event Capacity</h4>
          <p className="text-sm opacity-90">
            Average ticket sales per event
          </p>
        </div>
      </div>

      {/* Top Performers Table */}
      <DataTable
        title="Top Performing Events"
        columns={columns}
        data={topPerformers}
        searchKeys={["name", "category"]}
      />
    </div>
  );
}