"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Ticket,
  DollarSign,
  TrendingUp,
  Users,
  UserPlus,
  Settings,
  CreditCard,
  FileText,
  Package,
  ChevronLeft,
  Menu,
  Store
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/organizer",
    icon: LayoutDashboard,
    description: "Overview and metrics",
  },
  {
    name: "Create Event",
    href: "/organizer/new-event",
    icon: Plus,
    description: "Create a new event",
    highlight: true,
  },
  {
    name: "My Events",
    href: "/organizer/events",
    icon: Calendar,
    description: "Manage your events",
    badge: null,
  },
  {
    name: "Ticket Sales",
    href: "/organizer/tickets",
    icon: Ticket,
    description: "View and manage tickets",
  },
  {
    name: "Analytics",
    href: "/organizer/analytics",
    icon: TrendingUp,
    description: "Performance insights",
  },
  {
    name: "Earnings",
    href: "/organizer/earnings",
    icon: DollarSign,
    description: "Revenue and payouts",
    badge: "Important",
  },
  {
    name: "Customers",
    href: "/organizer/customers",
    icon: Users,
    description: "Customer database",
  },
  {
    name: "Affiliates",
    href: "/organizer/affiliates",
    icon: UserPlus,
    description: "Affiliate programs",
  },
  {
    name: "Payment Settings",
    href: "/organizer/payment-settings",
    icon: CreditCard,
    description: "Configure payments",
  },
  {
    name: "Reports",
    href: "/organizer/reports",
    icon: FileText,
    description: "Download reports",
  },
  {
    name: "Settings",
    href: "/organizer/settings",
    icon: Settings,
    description: "Organizer preferences",
  },
];

export default function OrganizerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-30 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 pt-16",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}>
            <Store className="h-5 w-5 text-blue-600" />
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Organizer Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your events</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== "/organizer" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : item.highlight
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400"
                    : item.highlight
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                )} />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          item.badge === "Important" 
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">This Month</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">$0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Tickets Sold</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <Link
                href="/organizer/analytics"
                className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          ) : (
            <Link
              href="/organizer/analytics"
              className="flex justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="View Analytics"
            >
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
        />
      )}
    </>
  );
}

// Top navigation bar version for organizer pages
export function OrganizerTopNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigation.slice(0, 6).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}